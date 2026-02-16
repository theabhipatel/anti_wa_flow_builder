import { type EdgeProps, getSmoothStepPath, BaseEdge, EdgeLabelRenderer } from '@xyflow/react';
import { X } from 'lucide-react';

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
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                data?.onDelete?.(id);
                            }}
                            className="
                                w-7 h-7 rounded-full
                                bg-red-500 hover:bg-red-600
                                text-white shadow-lg shadow-red-500/30
                                flex items-center justify-center
                                transition-all duration-150
                                hover:scale-110 active:scale-95
                                border-2 border-white dark:border-surface-800
                            "
                            title="Delete edge"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
