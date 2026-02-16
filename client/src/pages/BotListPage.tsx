import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { IBot } from '../types';
import { Plus, Bot, Settings, GitBranch, Phone, Trash2, Loader2 } from 'lucide-react';

export default function BotListPage() {
    const [bots, setBots] = useState<IBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    const fetchBots = async () => {
        try {
            const res = await api.get('/bots');
            if (res.data.success) setBots(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBots(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post('/bots', { name: newName, description: newDesc });
            if (res.data.success) {
                setBots([res.data.data, ...bots]);
                setShowCreate(false);
                setNewName('');
                setNewDesc('');
                fetchBots();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (botId: string) => {
        if (!window.confirm('Are you sure? This will delete all flows, sessions, and data.')) return;
        try {
            await api.delete(`/bots/${botId}`);
            setBots(bots.filter((b) => b._id !== botId));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Bots</h1>
                    <p className="text-surface-500 mt-1">Manage your WhatsApp bots</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Bot
                </button>
            </div>

            {/* Create bot modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
                    <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold mb-4">Create New Bot</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="input-label">Bot Name</label>
                                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" placeholder="My WhatsApp Bot" required />
                            </div>
                            <div>
                                <label className="input-label">Description (optional)</label>
                                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input-field" placeholder="What does this bot do?" rows={3} />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create Bot
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-6 animate-pulse">
                            <div className="h-6 w-32 bg-surface-200 dark:bg-surface-700 rounded mb-4" />
                            <div className="h-4 w-48 bg-surface-200 dark:bg-surface-700 rounded mb-2" />
                            <div className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded" />
                        </div>
                    ))}
                </div>
            ) : bots.length === 0 ? (
                <div className="card p-12 text-center">
                    <Bot className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No bots yet</h3>
                    <p className="text-surface-500 mb-4">Create your first WhatsApp bot to get started.</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">Create Bot</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bots.map((bot) => (
                        <div key={bot._id} className="card p-6 hover:scale-[1.02] transition-all duration-200 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <button onClick={() => handleDelete(bot._id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="font-semibold text-lg mb-1">{bot.name}</h3>
                            {bot.description && <p className="text-sm text-surface-500 mb-4 line-clamp-2">{bot.description}</p>}

                            <div className="flex items-center gap-4 text-xs text-surface-500 mb-4">
                                <span className="flex items-center gap-1"><GitBranch className="w-3.5 h-3.5" /> {bot.flowCount ?? 0} flows</span>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5" />
                                    {bot.isWhatsAppConnected ? (
                                        <span className="text-emerald-600 dark:text-emerald-400">Connected</span>
                                    ) : (
                                        <span className="text-surface-400">Not connected</span>
                                    )}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/bots/${bot._id}/flows`)} className="flex-1 btn-primary text-sm py-2">
                                    <GitBranch className="w-3.5 h-3.5 inline mr-1" /> Flows
                                </button>
                                <button onClick={() => navigate(`/bots/${bot._id}/settings`)} className="btn-secondary text-sm py-2 px-3">
                                    <Settings className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
