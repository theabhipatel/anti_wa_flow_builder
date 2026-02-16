import { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';
import { X, Send, RotateCcw, Loader2, Bot, User } from 'lucide-react';

interface Props {
    botId: string;
    flowId: string;
    onClose: () => void;
}

interface IMessage {
    id: string;
    role: 'user' | 'bot';
    text: string;
    buttons?: Array<{ id: string; label: string }>;
    timestamp: Date;
}

export default function SimulatorPanel({ botId, flowId, onClose }: Props) {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-start the flow
    useEffect(() => {
        sendMessage('');
    }, []);

    const sendMessage = async (text: string, buttonId?: string) => {
        if (text) {
            setMessages((prev) => [...prev, {
                id: `user_${Date.now()}`,
                role: 'user',
                text,
                timestamp: new Date(),
            }]);
        }
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/simulator/message', {
                botId,
                flowId,
                message: text || undefined,
                buttonId,
            });

            if (res.data.success && res.data.data.responses) {
                const botMessages: IMessage[] = res.data.data.responses.map((r: { type: string; content: string; buttons?: Array<{ id: string; label: string }> }, i: number) => ({
                    id: `bot_${Date.now()}_${i}`,
                    role: 'bot' as const,
                    text: r.content,
                    buttons: r.buttons,
                    timestamp: new Date(),
                }));
                setMessages((prev) => [...prev, ...botMessages]);
            }
        } catch (err) {
            setMessages((prev) => [...prev, {
                id: `err_${Date.now()}`,
                role: 'bot',
                text: '⚠️ Error processing message',
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        try {
            await api.post('/simulator/reset', { botId });
            setMessages([]);
            // Restart
            setTimeout(() => sendMessage(''), 300);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        sendMessage(input.trim());
    };

    return (
        <div className="w-80 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    Simulator
                </h3>
                <div className="flex gap-1">
                    <button onClick={handleReset} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800" title="Reset">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-surface-50 dark:bg-surface-950">
                {messages.length === 0 && !loading && (
                    <div className="text-center text-surface-400 text-sm py-8">
                        Starting flow simulation...
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user'
                            ? 'bg-brand-500 text-white rounded-2xl rounded-br-md px-3 py-2'
                            : 'bg-white dark:bg-surface-800 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm border border-surface-200 dark:border-surface-700'
                            }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            {msg.buttons && msg.buttons.length > 0 && (
                                <div className="mt-2 space-y-1.5">
                                    {msg.buttons.map((btn) => (
                                        <button
                                            key={btn.id}
                                            onClick={() => sendMessage(btn.label, btn.id)}
                                            disabled={loading}
                                            className="w-full text-left text-xs px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors border border-brand-200 dark:border-brand-800"
                                        >
                                            {btn.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-surface-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-surface-200 dark:border-surface-700">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-surface-200 dark:border-surface-700 flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Type a message..."
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !input.trim()} className="p-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 transition-colors">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
