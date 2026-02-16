import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
    Play,
    MessageSquare,
    MousePointer,
    FormInput,
    GitBranch,
    Clock,
    Globe,
    Bot,
    Repeat,
    Square,
    ArrowRightCircle,
} from 'lucide-react';

const nodeIcons: Record<string, React.ElementType> = {
    START: Play,
    MESSAGE: MessageSquare,
    BUTTON: MousePointer,
    INPUT: FormInput,
    CONDITION: GitBranch,
    DELAY: Clock,
    API: Globe,
    AI: Bot,
    LOOP: Repeat,
    END: Square,
    GOTO_SUBFLOW: ArrowRightCircle,
};

const nodeColors: Record<string, { bg: string; border: string; iconBg: string }> = {
    START: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700', iconBg: 'bg-emerald-500' },
    MESSAGE: { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700', iconBg: 'bg-blue-500' },
    BUTTON: { bg: 'bg-violet-50 dark:bg-violet-900/30', border: 'border-violet-300 dark:border-violet-700', iconBg: 'bg-violet-500' },
    INPUT: { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700', iconBg: 'bg-amber-500' },
    CONDITION: { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700', iconBg: 'bg-orange-500' },
    DELAY: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', border: 'border-cyan-300 dark:border-cyan-700', iconBg: 'bg-cyan-500' },
    API: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-300 dark:border-indigo-700', iconBg: 'bg-indigo-500' },
    AI: { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700', iconBg: 'bg-purple-500' },
    LOOP: { bg: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-300 dark:border-teal-700', iconBg: 'bg-teal-500' },
    END: { bg: 'bg-red-50 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700', iconBg: 'bg-red-500' },
    GOTO_SUBFLOW: { bg: 'bg-pink-50 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700', iconBg: 'bg-pink-500' },
};

interface ButtonItem {
    buttonId: string;
    label: string;
}

export default function FlowNode({ data, selected }: NodeProps) {
    const nodeData = data as { nodeType: string; label: string; config: Record<string, unknown>; description?: string };
    const nodeType = nodeData.nodeType;
    const Icon = nodeIcons[nodeType] || MessageSquare;
    const colors = nodeColors[nodeType] || nodeColors.MESSAGE;

    const isStartNode = nodeType === 'START';
    const isButtonNode = nodeType === 'BUTTON';
    const isConditionNode = nodeType === 'CONDITION';
    const isEndNode = nodeType === 'END';

    // Get buttons for BUTTON node
    const buttons: ButtonItem[] = isButtonNode
        ? ((nodeData.config?.buttons as ButtonItem[]) || [])
        : [];

    // Get message text preview for button node
    const buttonMessageText = isButtonNode ? (nodeData.config?.messageText as string) || '' : '';

    return (
        <div className={`flow-node ${colors.bg} ${colors.border} ${selected ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface-900' : ''} p-0 rounded-xl shadow-lg min-w-[180px]`}>
            {/* Target handle (top) */}
            {!isStartNode && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="!w-3 !h-3 !bg-brand-500 !border-2 !border-white dark:!border-surface-900 !-top-1.5"
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-lg ${colors.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{nodeData.label || nodeType}</p>
                    <p className="text-[10px] text-surface-500 uppercase tracking-wider">{nodeType === 'GOTO_SUBFLOW' ? 'GO TO SUBFLOW' : nodeType}</p>
                </div>
            </div>

            {/* Button Node — show message preview + per-button handles */}
            {isButtonNode && (
                <div className="border-t border-violet-200 dark:border-violet-700/50">
                    {buttonMessageText && (
                        <div className="px-4 py-2 text-xs text-surface-600 dark:text-surface-400 truncate">
                            {buttonMessageText}
                        </div>
                    )}
                    {buttons.length > 0 && (
                        <div className="relative">
                            {buttons.map((btn, idx) => (
                                <div
                                    key={btn.buttonId}
                                    className="flex items-center justify-between px-4 py-2 border-t border-violet-200/50 dark:border-violet-700/30 relative"
                                >
                                    <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{btn.label || `Button ${idx + 1}`}</span>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={btn.buttonId}
                                        className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white dark:!border-surface-900 !-right-1.5"
                                        style={{ top: 'auto', position: 'absolute', right: -6 }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Condition has dual outputs */}
            {isConditionNode ? (
                <>
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="true"
                        style={{ left: '30%' }}
                        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white dark:!border-surface-900 !-bottom-1.5"
                    />
                    <Handle
                        type="source"
                        position={Position.Bottom}
                        id="false"
                        style={{ left: '70%' }}
                        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white dark:!border-surface-900 !-bottom-1.5"
                    />
                    <div className="flex justify-between px-4 pb-1 text-[9px] text-surface-400">
                        <span>True</span>
                        <span>False</span>
                    </div>
                </>
            ) : !isEndNode && !isButtonNode ? (
                /* Normal bottom handle for all non-END, non-BUTTON nodes */
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="!w-3 !h-3 !bg-brand-500 !border-2 !border-white dark:!border-surface-900 !-bottom-1.5"
                />
            ) : null}
        </div>
    );
}
