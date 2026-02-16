import { TNodeType } from '../../types';
import {
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

interface Props {
    onAddNode: (nodeType: TNodeType) => void;
}

const nodeLibrary: Array<{ type: TNodeType; label: string; icon: React.ElementType; color: string; desc: string }> = [
    { type: 'MESSAGE', label: 'Message', icon: MessageSquare, color: 'text-blue-500', desc: 'Send text' },
    { type: 'BUTTON', label: 'Button', icon: MousePointer, color: 'text-violet-500', desc: 'Interactive buttons' },
    { type: 'INPUT', label: 'Input', icon: FormInput, color: 'text-amber-500', desc: 'Collect user input' },
    { type: 'CONDITION', label: 'Condition', icon: GitBranch, color: 'text-orange-500', desc: 'Branch logic' },
    { type: 'DELAY', label: 'Delay', icon: Clock, color: 'text-cyan-500', desc: 'Wait time' },
    { type: 'API', label: 'API Call', icon: Globe, color: 'text-indigo-500', desc: 'HTTP requests' },
    { type: 'AI', label: 'AI Reply', icon: Bot, color: 'text-purple-500', desc: 'OpenAI response' },
    { type: 'LOOP', label: 'Loop', icon: Repeat, color: 'text-teal-500', desc: 'Iterate items' },
    { type: 'GOTO_SUBFLOW', label: 'Go to Subflow', icon: ArrowRightCircle, color: 'text-pink-500', desc: 'Jump to subflow' },
    { type: 'END', label: 'End', icon: Square, color: 'text-red-500', desc: 'Terminate flow' },
];

export default function NodeLibrary({ onAddNode }: Props) {
    return (
        <div className="w-56 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-surface-200 dark:border-surface-700">
                <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Node Library</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {nodeLibrary.map((node) => (
                    <button
                        key={node.type}
                        onClick={() => onAddNode(node.type)}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-800 transition-all duration-150 group text-left"
                    >
                        <div className={`w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <node.icon className={`w-4 h-4 ${node.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{node.label}</p>
                            <p className="text-[10px] text-surface-500">{node.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
