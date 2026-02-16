import { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
    type Connection,
    type NodeTypes,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import api from '../lib/api';
import { RootState } from '../store';
import { setFlowData, markSaved, selectNode, updateNodeConfig, updateNodeLabel, deleteNode } from '../store/builderSlice';
import { IFlowData, IFlowNode, IValidationResult, TNodeType } from '../types';
import FlowNode from '../components/FlowBuilder/FlowNode';
import NodeLibrary from '../components/FlowBuilder/NodeLibrary';
import NodeSettingsPanel from '../components/FlowBuilder/NodeSettingsPanel';
import SimulatorPanel from '../components/FlowBuilder/SimulatorPanel';
import {
    Save,
    ArrowLeft,
    Loader2,
    Rocket,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
} from 'lucide-react';

export default function FlowBuilderPage() {
    const { botId, flowId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { flowData, isDirty, selectedNodeId, lastSaved } = useSelector((state: RootState) => state.builder);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deploying, setDeploying] = useState(false);
    const [validation, setValidation] = useState<IValidationResult | null>(null);
    const [showSimulator, setShowSimulator] = useState(false);
    const [flowName, setFlowName] = useState('');

    // React Flow state — typed explicitly
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const nodeTypes: NodeTypes = useMemo(() => ({
        flowNode: FlowNode,
    }), []);

    // Load flow data
    useEffect(() => {
        const fetchFlow = async () => {
            try {
                const res = await api.get(`/bots/${botId}/flows/${flowId}`);
                if (res.data.success) {
                    const flow = res.data.data;
                    setFlowName(flow.name);

                    const draft = flow.draftVersion;
                    if (draft?.flowData) {
                        dispatch(setFlowData(draft.flowData));
                        syncToReactFlow(draft.flowData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFlow();
    }, [botId, flowId]);

    const syncToReactFlow = (data: IFlowData) => {
        const rfNodes: Node[] = data.nodes.map((n) => ({
            id: n.nodeId,
            type: 'flowNode',
            position: n.position,
            data: {
                label: n.label || n.nodeType,
                nodeType: n.nodeType,
                config: n.config,
                description: n.description,
            },
        }));
        const rfEdges: Edge[] = data.edges.map((e) => ({
            id: e.edgeId,
            source: e.sourceNodeId,
            target: e.targetNodeId,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle,
            animated: true,
            style: { stroke: '#6366f1', strokeWidth: 2 },
        }));
        setNodes(rfNodes);
        setEdges(rfEdges);
    };

    // Sync React Flow changes back to Redux
    const buildFlowDataFromReactFlow = useCallback((): IFlowData => {
        const flowNodes: IFlowNode[] = nodes.map((n: Node) => ({
            nodeId: n.id,
            nodeType: (n.data as Record<string, unknown>).nodeType as TNodeType,
            position: n.position,
            label: (n.data as Record<string, unknown>).label as string,
            description: (n.data as Record<string, unknown>).description as string,
            config: ((n.data as Record<string, unknown>).config || {}) as Record<string, unknown>,
        }));
        const flowEdges = edges.map((e: Edge) => ({
            edgeId: e.id,
            sourceNodeId: e.source,
            targetNodeId: e.target,
            sourceHandle: e.sourceHandle ?? undefined,
            targetHandle: e.targetHandle ?? undefined,
        }));
        return { nodes: flowNodes, edges: flowEdges, variables: flowData.variables };
    }, [nodes, edges, flowData.variables]);

    // Handle node/edge changes
    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    // Handle connections
    const onConnect: OnConnect = useCallback((connection: Connection) => {
        setEdges((eds) =>
            addEdge(
                {
                    ...connection,
                    id: `edge_${Date.now()}`,
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                },
                eds
            )
        );
    }, [setEdges]);

    // Handle node selection
    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        dispatch(selectNode(node.id));
    }, [dispatch]);

    const onPaneClick = useCallback(() => {
        dispatch(selectNode(null));
    }, [dispatch]);

    // Add new node from library
    const onAddNode = useCallback((nodeType: TNodeType) => {
        const newNodeId = `${nodeType.toLowerCase()}_${Date.now()}`;
        const newNode: Node = {
            id: newNodeId,
            type: 'flowNode',
            position: { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 },
            data: {
                label: nodeType.charAt(0) + nodeType.slice(1).toLowerCase(),
                nodeType,
                config: {},
            },
        };
        setNodes((nds) => [...nds, newNode]);
    }, [setNodes]);

    // Save draft
    const handleSave = async () => {
        setSaving(true);
        try {
            const data = buildFlowDataFromReactFlow();
            await api.put(`/bots/${botId}/flows/${flowId}/draft`, { flowData: data });
            dispatch(setFlowData(data));
            dispatch(markSaved());
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // Validate
    const handleValidate = async () => {
        await handleSave();
        try {
            const res = await api.post(`/bots/${botId}/flows/${flowId}/validate`);
            if (res.data.success) {
                setValidation(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Deploy
    const handleDeploy = async () => {
        if (!confirm('Deploy this flow to production?')) return;
        setDeploying(true);
        await handleSave();
        try {
            const res = await api.post(`/bots/${botId}/flows/${flowId}/deploy`);
            if (res.data.success) {
                setValidation({ isValid: true, errors: [], warnings: [] });
                alert('Flow deployed to production! 🚀');
            } else {
                setValidation(res.data.data);
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { data?: IValidationResult; error?: string } } };
            if (axiosErr.response?.data?.data) {
                setValidation(axiosErr.response.data.data);
            }
        } finally {
            setDeploying(false);
        }
    };

    // Handle node updates from settings panel
    const handleNodeConfigChange = (nodeId: string, config: Record<string, unknown>) => {
        dispatch(updateNodeConfig({ nodeId, config }));
        setNodes((nds) =>
            nds.map((n: Node) =>
                n.id === nodeId
                    ? { ...n, data: { ...(n.data as Record<string, unknown>), config: { ...((n.data as Record<string, unknown>).config as Record<string, unknown>), ...config } } }
                    : n
            )
        );
    };

    const handleNodeLabelChange = (nodeId: string, label: string) => {
        dispatch(updateNodeLabel({ nodeId, label }));
        setNodes((nds) =>
            nds.map((n: Node) =>
                n.id === nodeId ? { ...n, data: { ...(n.data as Record<string, unknown>), label } } : n
            )
        );
    };

    const handleDeleteNode = (nodeId: string) => {
        dispatch(deleteNode(nodeId));
        setNodes((nds) => nds.filter((n: Node) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e: Edge) => e.source !== nodeId && e.target !== nodeId));
    };

    const selectedNode = nodes.find((n: Node) => n.id === selectedNodeId);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-950">
            {/* Toolbar */}
            <div className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(`/bots/${botId}/flows`)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-semibold text-sm">{flowName}</h1>
                        <p className="text-xs text-surface-500">
                            {isDirty ? 'Unsaved changes' : lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'Draft'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                    <button onClick={handleValidate} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Validate
                    </button>
                    <button onClick={() => setShowSimulator(!showSimulator)} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${showSimulator ? 'bg-brand-500 text-white' : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                        <MessageSquare className="w-4 h-4" /> Test
                    </button>
                    <button onClick={handleDeploy} disabled={deploying} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                        {deploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                        Deploy
                    </button>
                </div>
            </div>

            {/* Validation banner */}
            {validation && !validation.isValid && (
                <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                        {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}: {validation.errors[0]?.message}
                    </span>
                    <button onClick={() => setValidation(null)} className="ml-auto text-xs text-red-500 hover:text-red-700">Dismiss</button>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Node Library sidebar */}
                <NodeLibrary onAddNode={onAddNode} />

                {/* Canvas */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                        deleteKeyCode="Delete"
                    >
                        <Background variant={BackgroundVariant.Dots} gap={15} size={1} />
                        <Controls className="!rounded-xl !border-surface-200 dark:!border-surface-700 !bg-white dark:!bg-surface-800 !shadow-lg" />
                        <MiniMap
                            className="!rounded-xl !border-surface-200 dark:!border-surface-700 !bg-white dark:!bg-surface-800 !shadow-lg"
                            nodeStrokeWidth={3}
                            pannable
                            zoomable
                        />
                    </ReactFlow>
                </div>

                {/* Settings panel */}
                {selectedNode && (
                    <NodeSettingsPanel
                        node={selectedNode}
                        onConfigChange={handleNodeConfigChange}
                        onLabelChange={handleNodeLabelChange}
                        onDelete={handleDeleteNode}
                        onClose={() => dispatch(selectNode(null))}
                    />
                )}

                {/* Simulator */}
                {showSimulator && (
                    <SimulatorPanel
                        botId={botId!}
                        flowId={flowId!}
                        onClose={() => setShowSimulator(false)}
                    />
                )}
            </div>
        </div>
    );
}
