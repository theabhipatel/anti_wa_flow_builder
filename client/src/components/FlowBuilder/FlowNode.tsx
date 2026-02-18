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
    Copy,
    Trash2,
    Hash,
    RefreshCw,
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

const nodeThemes: Record<string, { gradient: string; handleColor: string; borderColor: string; selectedBorder: string; iconGlow: string; tagBg: string; tagText: string; glowColor: string }> = {
    START: {
        gradient: 'from-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/20 dark:to-emerald-500/5',
        handleColor: '#10b981',
        borderColor: 'border-emerald-200/80 dark:border-emerald-500/30',
        selectedBorder: 'border-emerald-400 dark:border-emerald-500',
        iconGlow: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30',
        tagBg: 'bg-emerald-100 dark:bg-emerald-900/40',
        tagText: 'text-emerald-700 dark:text-emerald-400',
        glowColor: 'rgba(16, 185, 129, 0.35)',
    },
    MESSAGE: {
        gradient: 'from-blue-500/10 to-blue-500/5 dark:from-blue-500/20 dark:to-blue-500/5',
        handleColor: '#3b82f6',
        borderColor: 'border-blue-200/80 dark:border-blue-500/30',
        selectedBorder: 'border-blue-400 dark:border-blue-500',
        iconGlow: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30',
        tagBg: 'bg-blue-100 dark:bg-blue-900/40',
        tagText: 'text-blue-700 dark:text-blue-400',
        glowColor: 'rgba(59, 130, 246, 0.35)',
    },
    BUTTON: {
        gradient: 'from-violet-500/10 to-violet-500/5 dark:from-violet-500/20 dark:to-violet-500/5',
        handleColor: '#8b5cf6',
        borderColor: 'border-violet-200/80 dark:border-violet-500/30',
        selectedBorder: 'border-violet-400 dark:border-violet-500',
        iconGlow: 'bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30',
        tagBg: 'bg-violet-100 dark:bg-violet-900/40',
        tagText: 'text-violet-700 dark:text-violet-400',
        glowColor: 'rgba(139, 92, 246, 0.35)',
    },
    INPUT: {
        gradient: 'from-amber-500/10 to-amber-500/5 dark:from-amber-500/20 dark:to-amber-500/5',
        handleColor: '#f59e0b',
        borderColor: 'border-amber-200/80 dark:border-amber-500/30',
        selectedBorder: 'border-amber-400 dark:border-amber-500',
        iconGlow: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30',
        tagBg: 'bg-amber-100 dark:bg-amber-900/40',
        tagText: 'text-amber-700 dark:text-amber-400',
        glowColor: 'rgba(245, 158, 11, 0.35)',
    },
    CONDITION: {
        gradient: 'from-orange-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-orange-500/5',
        handleColor: '#f97316',
        borderColor: 'border-orange-200/80 dark:border-orange-500/30',
        selectedBorder: 'border-orange-400 dark:border-orange-500',
        iconGlow: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/30',
        tagBg: 'bg-orange-100 dark:bg-orange-900/40',
        tagText: 'text-orange-700 dark:text-orange-400',
        glowColor: 'rgba(249, 115, 22, 0.35)',
    },
    DELAY: {
        gradient: 'from-cyan-500/10 to-cyan-500/5 dark:from-cyan-500/20 dark:to-cyan-500/5',
        handleColor: '#06b6d4',
        borderColor: 'border-cyan-200/80 dark:border-cyan-500/30',
        selectedBorder: 'border-cyan-400 dark:border-cyan-500',
        iconGlow: 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/30',
        tagBg: 'bg-cyan-100 dark:bg-cyan-900/40',
        tagText: 'text-cyan-700 dark:text-cyan-400',
        glowColor: 'rgba(6, 182, 212, 0.35)',
    },
    API: {
        gradient: 'from-indigo-500/10 to-indigo-500/5 dark:from-indigo-500/20 dark:to-indigo-500/5',
        handleColor: '#6366f1',
        borderColor: 'border-indigo-200/80 dark:border-indigo-500/30',
        selectedBorder: 'border-indigo-400 dark:border-indigo-500',
        iconGlow: 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/30',
        tagBg: 'bg-indigo-100 dark:bg-indigo-900/40',
        tagText: 'text-indigo-700 dark:text-indigo-400',
        glowColor: 'rgba(99, 102, 241, 0.35)',
    },
    AI: {
        gradient: 'from-purple-500/10 to-purple-500/5 dark:from-purple-500/20 dark:to-purple-500/5',
        handleColor: '#a855f7',
        borderColor: 'border-purple-200/80 dark:border-purple-500/30',
        selectedBorder: 'border-purple-400 dark:border-purple-500',
        iconGlow: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-purple-500/30',
        tagBg: 'bg-purple-100 dark:bg-purple-900/40',
        tagText: 'text-purple-700 dark:text-purple-400',
        glowColor: 'rgba(168, 85, 247, 0.35)',
    },
    LOOP: {
        gradient: 'from-teal-500/10 to-teal-500/5 dark:from-teal-500/20 dark:to-teal-500/5',
        handleColor: '#14b8a6',
        borderColor: 'border-teal-200/80 dark:border-teal-500/30',
        selectedBorder: 'border-teal-400 dark:border-teal-500',
        iconGlow: 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-teal-500/30',
        tagBg: 'bg-teal-100 dark:bg-teal-900/40',
        tagText: 'text-teal-700 dark:text-teal-400',
        glowColor: 'rgba(20, 184, 166, 0.35)',
    },
    END: {
        gradient: 'from-red-500/10 to-red-500/5 dark:from-red-500/20 dark:to-red-500/5',
        handleColor: '#ef4444',
        borderColor: 'border-red-200/80 dark:border-red-500/30',
        selectedBorder: 'border-red-400 dark:border-red-500',
        iconGlow: 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30',
        tagBg: 'bg-red-100 dark:bg-red-900/40',
        tagText: 'text-red-700 dark:text-red-400',
        glowColor: 'rgba(239, 68, 68, 0.35)',
    },
    GOTO_SUBFLOW: {
        gradient: 'from-pink-500/10 to-pink-500/5 dark:from-pink-500/20 dark:to-pink-500/5',
        handleColor: '#ec4899',
        borderColor: 'border-pink-200/80 dark:border-pink-500/30',
        selectedBorder: 'border-pink-400 dark:border-pink-500',
        iconGlow: 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-pink-500/30',
        tagBg: 'bg-pink-100 dark:bg-pink-900/40',
        tagText: 'text-pink-700 dark:text-pink-400',
        glowColor: 'rgba(236, 72, 153, 0.35)',
    },
};

interface ButtonItem {
    buttonId: string;
    label: string;
}

export default function FlowNode({ data, selected }: NodeProps) {
    const nodeData = data as {
        nodeType: string;
        label: string;
        config: Record<string, unknown>;
        description?: string;
        onDuplicate?: (nodeId: string) => void;
        onDelete?: (nodeId: string) => void;
        nodeId?: string;
    };
    const nodeType = nodeData.nodeType;
    const Icon = nodeIcons[nodeType] || MessageSquare;
    const theme = nodeThemes[nodeType] || nodeThemes.MESSAGE;

    const isStartNode = nodeType === 'START';
    const isButtonNode = nodeType === 'BUTTON';
    const isConditionNode = nodeType === 'CONDITION';
    const isEndNode = nodeType === 'END';
    const isApiNode = nodeType === 'API';
    const isAiNode = nodeType === 'AI';
    const isLoopNode = nodeType === 'LOOP';
    const hasDualHandles = isConditionNode || isApiNode || isAiNode;
    const hasTripleHandles = isLoopNode;

    // Get loop mode for badge
    const loopMode = isLoopNode ? (nodeData.config?.loopType as string) || 'FOR_EACH' : '';

    // Get buttons for BUTTON node
    const buttons: ButtonItem[] = isButtonNode
        ? ((nodeData.config?.buttons as ButtonItem[]) || [])
        : [];

    // Get message text preview
    const buttonMessageText = isButtonNode ? (nodeData.config?.messageText as string) || '' : '';
    const messagePreview = nodeType === 'MESSAGE' ? (nodeData.config?.messageText as string) || '' : '';

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (nodeData.onDuplicate && nodeData.nodeId) {
            nodeData.onDuplicate(nodeData.nodeId);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (nodeData.onDelete && nodeData.nodeId) {
            nodeData.onDelete(nodeData.nodeId);
        }
    };

    return (
        <div
            className={`
                flow-node bg-gradient-to-br ${theme.gradient}
                ${selected ? theme.selectedBorder : theme.borderColor}
                backdrop-blur-sm
                ${selected ? 'node-selected' : ''}
            `}
            style={selected ? { boxShadow: `0 0 0 3px ${theme.glowColor}, 0 4px 20px ${theme.glowColor}` } : undefined}
        >
            {/* Action icons — visible on hover and selection */}
            {!isStartNode && (
                <div className={`node-action-buttons absolute -top-3 right-2 flex gap-1 z-20 transition-all duration-200 ${selected ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                    <button
                        onClick={handleDuplicate}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 shadow-md flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-150 hover:scale-110"
                        title="Duplicate node"
                    >
                        <Copy className="w-3 h-3 text-surface-500 hover:text-blue-500" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-surface-700 border border-surface-200 dark:border-surface-600 shadow-md flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 transition-all duration-150 hover:scale-110"
                        title="Delete node"
                    >
                        <Trash2 className="w-3 h-3 text-surface-500 hover:text-red-500" />
                    </button>
                </div>
            )}

            {/* Target handle (left — horizontal layout) */}
            {!isStartNode && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-left-[7px] !rounded-full"
                    style={{ background: theme.handleColor }}
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3">
                <div className={`w-9 h-9 rounded-xl ${theme.iconGlow} shadow-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-[18px] h-[18px] text-white" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-surface-800 dark:text-surface-100 truncate leading-tight">
                        {nodeData.label || nodeType}
                    </p>
                    <span className={`inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${theme.tagBg} ${theme.tagText}`}>
                        {nodeType === 'GOTO_SUBFLOW' ? 'SUBFLOW' : nodeType}
                    </span>
                </div>
            </div>

            {/* Message preview */}
            {messagePreview && (
                <div className="border-t border-surface-200/60 dark:border-surface-700/40 px-4 py-2">
                    <p className="text-[11px] text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
                        {messagePreview}
                    </p>
                </div>
            )}

            {/* Button Node — show message preview + per-button handles */}
            {isButtonNode && (
                <div className="border-t border-violet-200/60 dark:border-violet-700/40">
                    {buttonMessageText && (
                        <div className="px-4 py-2">
                            <p className="text-[11px] text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
                                {buttonMessageText}
                            </p>
                        </div>
                    )}
                    {buttons.length > 0 && (
                        <div className="relative">
                            {buttons.map((btn, idx) => (
                                <div
                                    key={btn.buttonId}
                                    className="flex items-center justify-between px-4 py-2 border-t border-violet-200/40 dark:border-violet-700/25 relative group"
                                >
                                    <span className="text-[11px] font-medium text-surface-600 dark:text-surface-300">
                                        {btn.label || `Button ${idx + 1}`}
                                    </span>
                                    <Handle
                                        type="source"
                                        position={Position.Right}
                                        id={btn.buttonId}
                                        className="!w-3 !h-3 !border-2 !border-white dark:!border-surface-800 !-right-[6px] !rounded-full group-hover:!scale-125 !transition-transform"
                                        style={{ top: 'auto', position: 'absolute', right: -6, background: theme.handleColor }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Loop node — show mode badge */}
            {isLoopNode && (
                <div className="border-t border-teal-200/60 dark:border-teal-700/40 px-4 py-1.5 flex items-center gap-1.5">
                    {loopMode === 'FOR_EACH' && <Repeat className="w-3 h-3 text-teal-500" />}
                    {loopMode === 'COUNT_BASED' && <Hash className="w-3 h-3 text-indigo-500" />}
                    {loopMode === 'CONDITION_BASED' && <RefreshCw className="w-3 h-3 text-amber-500" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                        {loopMode === 'FOR_EACH' ? 'For Each' : loopMode === 'COUNT_BASED' ? 'Count' : 'While'}
                    </span>
                </div>
            )}

            {/* Triple outputs: LOOP = Loop Body / Done / Error */}
            {hasTripleHandles ? (
                <>
                    <div className="border-t border-surface-200/40 dark:border-surface-700/25 px-4 py-1 flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Body</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">Done</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">Error</span>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="loop-body"
                        style={{ top: '30%', background: '#10b981' }}
                        className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="done"
                        style={{ top: '55%', background: '#14b8a6' }}
                        className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="error"
                        style={{ top: '80%', background: '#ef4444' }}
                        className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    />
                </>
            ) : hasDualHandles ? (
                <>
                    <div className="border-t border-surface-200/40 dark:border-surface-700/25 px-4 py-1.5 flex justify-between items-center">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            {isConditionNode ? 'True' : 'Success'}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-red-500 dark:text-red-400">
                            {isConditionNode ? 'False' : 'Error'}
                        </span>
                    </div>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={isConditionNode ? 'true' : 'success'}
                        style={{ top: '40%', background: '#10b981' }}
                        className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id={isConditionNode ? 'false' : 'error'}
                        style={{ top: '70%', background: '#ef4444' }}
                        className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    />
                </>
            ) : !isEndNode && !isButtonNode ? (
                <Handle
                    type="source"
                    position={Position.Right}
                    className="!w-3.5 !h-3.5 !border-2 !border-white dark:!border-surface-800 !-right-[7px] !rounded-full"
                    style={{ background: theme.handleColor }}
                />
            ) : null}
        </div>
    );
}
