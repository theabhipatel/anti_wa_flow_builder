import type { Node, Edge } from '@xyflow/react';

/**
 * Auto-layout algorithm for horizontal flow graphs.
 *
 * Strategy:
 * 1. Build an adjacency map from edges (source → targets).
 * 2. Find root nodes (START nodes, or nodes with no incoming edges).
 * 3. BFS layer assignment — each node gets a "column" (layer).
 * 4. For nodes on the same layer, space them vertically and center.
 * 5. Handle disconnected components by appending them after the main tree.
 *
 * Configuration constants control spacing.
 */

const HORIZONTAL_GAP = 320;  // px between columns (layers)
const VERTICAL_GAP = 120;    // px between nodes within the same layer
const START_X = 60;          // left margin
const START_Y = 60;          // top margin

interface LayoutResult {
    nodes: Node[];
}

export function autoLayoutNodes(nodes: Node[], edges: Edge[]): LayoutResult {
    if (nodes.length === 0) return { nodes: [] };

    // --- Build adjacency ---
    const outgoing = new Map<string, string[]>();   // source → [targets]
    const incoming = new Map<string, string[]>();    // target → [sources]

    for (const node of nodes) {
        outgoing.set(node.id, []);
        incoming.set(node.id, []);
    }

    for (const edge of edges) {
        outgoing.get(edge.source)?.push(edge.target);
        incoming.get(edge.target)?.push(edge.source);
    }

    // --- Identify root nodes ---
    // Prefer START nodes; fallback to nodes with no incoming edges.
    const startNodes = nodes.filter(
        (n) => (n.data as Record<string, unknown>).nodeType === 'START'
    );
    const noIncoming = nodes.filter(
        (n) => (incoming.get(n.id)?.length ?? 0) === 0 && !startNodes.find((s) => s.id === n.id)
    );
    const roots = startNodes.length > 0 ? [...startNodes, ...noIncoming] : noIncoming.length > 0 ? noIncoming : [nodes[0]];

    // --- BFS: assign layers (columns) ---
    const layerMap = new Map<string, number>();  // nodeId → layer index
    const visited = new Set<string>();
    const queue: { id: string; layer: number }[] = [];

    for (const root of roots) {
        if (!visited.has(root.id)) {
            queue.push({ id: root.id, layer: 0 });
            visited.add(root.id);
        }
    }

    while (queue.length > 0) {
        const { id, layer } = queue.shift()!;
        // If already assigned to a deeper layer, keep the deeper one
        const existingLayer = layerMap.get(id);
        if (existingLayer !== undefined && existingLayer >= layer) {
            // already at this or deeper layer — skip
        } else {
            layerMap.set(id, layer);
        }

        const targets = outgoing.get(id) || [];
        for (const target of targets) {
            const targetLayer = layer + 1;
            const existingTargetLayer = layerMap.get(target);
            // Only visit if not visited or if we found a deeper path
            if (!visited.has(target)) {
                visited.add(target);
                layerMap.set(target, targetLayer);
                queue.push({ id: target, layer: targetLayer });
            } else if (existingTargetLayer !== undefined && existingTargetLayer < targetLayer) {
                // Push to deeper layer (re-enqueue)
                layerMap.set(target, targetLayer);
                queue.push({ id: target, layer: targetLayer });
            }
        }
    }

    // --- Handle disconnected nodes ---
    // Find max existing layer and place disconnected nodes after it
    let maxLayer = 0;
    for (const layer of layerMap.values()) {
        maxLayer = Math.max(maxLayer, layer);
    }

    const disconnectedNodes = nodes.filter((n) => !visited.has(n.id));
    if (disconnectedNodes.length > 0) {
        const disconnectLayer = maxLayer + 2; // gap of 1 layer between connected and disconnected
        disconnectedNodes.forEach((n) => {
            layerMap.set(n.id, disconnectLayer);
            visited.add(n.id);
        });
    }

    // --- Group nodes by layer ---
    const layers = new Map<number, string[]>();
    for (const [nodeId, layer] of layerMap.entries()) {
        if (!layers.has(layer)) layers.set(layer, []);
        layers.get(layer)!.push(nodeId);
    }

    // --- Sort layers numerically ---
    const sortedLayerKeys = [...layers.keys()].sort((a, b) => a - b);

    // --- Calculate positions ---
    // For each layer, determine the total height needed and center vertically
    const nodePositions = new Map<string, { x: number; y: number }>();

    // Find the maximum number of nodes in any layer (for centering)
    let maxNodesInLayer = 0;
    for (const layerNodes of layers.values()) {
        maxNodesInLayer = Math.max(maxNodesInLayer, layerNodes.length);
    }
    const totalMaxHeight = (maxNodesInLayer - 1) * VERTICAL_GAP;

    for (const layerIndex of sortedLayerKeys) {
        const layerNodes = layers.get(layerIndex)!;
        const x = START_X + layerIndex * HORIZONTAL_GAP;

        // Center this layer's nodes relative to the tallest layer
        const layerHeight = (layerNodes.length - 1) * VERTICAL_GAP;
        const offsetY = START_Y + (totalMaxHeight - layerHeight) / 2;

        // Sort nodes within layer: try to maintain relative order from edges
        // (nodes whose sources are higher should be higher)
        layerNodes.sort((a, b) => {
            const aIncoming = incoming.get(a) || [];
            const bIncoming = incoming.get(b) || [];
            // Compare by the average Y position of incoming source nodes (if already positioned)
            const aSourceY = avgY(aIncoming, nodePositions);
            const bSourceY = avgY(bIncoming, nodePositions);
            if (aSourceY !== null && bSourceY !== null) return aSourceY - bSourceY;
            if (aSourceY !== null) return -1;
            if (bSourceY !== null) return 1;
            return 0;
        });

        layerNodes.forEach((nodeId, idx) => {
            nodePositions.set(nodeId, {
                x,
                y: offsetY + idx * VERTICAL_GAP,
            });
        });
    }

    // --- Apply positions to nodes ---
    const layoutNodes = nodes.map((node) => {
        const pos = nodePositions.get(node.id);
        if (pos) {
            return {
                ...node,
                position: { x: pos.x, y: pos.y },
            };
        }
        return node;
    });

    return { nodes: layoutNodes };
}

/** Average Y position of already-positioned source nodes */
function avgY(
    sourceIds: string[],
    positions: Map<string, { x: number; y: number }>
): number | null {
    const ys: number[] = [];
    for (const id of sourceIds) {
        const pos = positions.get(id);
        if (pos) ys.push(pos.y);
    }
    if (ys.length === 0) return null;
    return ys.reduce((sum, y) => sum + y, 0) / ys.length;
}
