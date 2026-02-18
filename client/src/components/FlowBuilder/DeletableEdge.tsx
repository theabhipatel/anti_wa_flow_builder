import { type EdgeProps, getSmoothStepPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

interface DeletableEdgeProps extends EdgeProps {
    data?: {
        onDelete?: (id: string) => void;
    };
}

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    animated,
    data,
    style = {},
}: DeletableEdgeProps) {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 16,
    });

    const isSelected = selected;

    return (
        <>
            {/* Invisible wider path for easier selection */}
            <path
                d={edgePath}
                fill="none"
                stroke="transparent"
                strokeWidth={20}
                className="react-flow__edge-interaction"
            />

            {/* Glow effect when selected */}
            {isSelected && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={8}
                    strokeOpacity={0.25}
                    className="edge-glow-path"
                    style={{ filter: 'blur(4px)' }}
                />
            )}

            {/* Main edge path */}
            <BaseEdge
                id={id}
                path={edgePath}
                style={{
                    ...style,
                    stroke: isSelected ? '#6366f1' : (style.stroke || '#818cf8'),
                    strokeWidth: isSelected ? 3 : (Number(style.strokeWidth) || 2.5),
                    transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
                }}
                className={animated ? 'animated' : ''}
            />

            {/* Delete button — shown when edge is selected */}
            {isSelected && (
                <EdgeLabelRenderer>
                    <div
                        className="edge-delete-button"
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                    >
                        <div
                            className="
                                w-6 h-6 rounded-lg
                                bg-surface-50 dark:bg-surface-800
                                border border-surface-200 dark:border-surface-700
                                shadow-md hover:shadow-lg
                                flex items-center justify-center
                                transition-all duration-200
                                cursor-pointer group
                                hover:bg-red-50 dark:hover:bg-red-900/20
                                hover:border-red-200 dark:hover:border-red-800
                                text-surface-500 hover:text-red-500
                            "
                            onClick={(e) => {
                                e.stopPropagation();
                                data?.onDelete?.(id);
                            }}
                            title="Delete Edge"
                        >
                            <Trash2 className="w-3 h-3 transition-transform group-hover:scale-110" />
                        </div>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
