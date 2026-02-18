import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { IFlow } from '../types';
import { Plus, GitBranch, ArrowLeft, Trash2, CheckCircle, Clock, Loader2, Copy, ShieldCheck } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useToast } from './Toast';

export default function FlowListPage() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [flows, setFlows] = useState<IFlow[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const [duplicatingFlowId, setDuplicatingFlowId] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; flowId: string }>({ isOpen: false, flowId: '' });
    const toast = useToast();

    const fetchFlows = async () => {
        try {
            const res = await api.get(`/bots/${botId}/flows`);
            if (res.data.success) {
                // Sort Main Flow to top
                const sortedFlows = (res.data.data as IFlow[]).sort((a, b) => {
                    if (a.isMainFlow) return -1;
                    if (b.isMainFlow) return 1;
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                });
                setFlows(sortedFlows);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFlows(); }, [botId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await api.post(`/bots/${botId}/flows`, { name: newName, description: newDesc });
            if (res.data.success) {
                setShowCreate(false);
                setNewName('');
                setNewDesc('');
                fetchFlows();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (flowId: string) => {
        setConfirmModal({ isOpen: false, flowId: '' });
        try {
            await api.delete(`/bots/${botId}/flows/${flowId}`);
            setFlows(flows.filter((f) => f._id !== flowId));
            toast.success('Flow deleted successfully');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete flow. Main flow cannot be deleted.');
        }
    };

    const handleDuplicate = async (flowId: string) => {
        setDuplicatingFlowId(flowId);
        try {
            const res = await api.post(`/bots/${botId}/flows/${flowId}/duplicate`);
            if (res.data.success) {
                fetchFlows();
                toast.success('Flow duplicated successfully');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to duplicate flow');
        } finally {
            setDuplicatingFlowId(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-20">
            <button onClick={() => navigate('/bots')} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Bots
            </button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-surface-900 to-surface-600 dark:from-white dark:to-surface-400">Flows</h1>
                    <p className="text-surface-500 mt-1">Manage your bot's conversation flows</p>
                </div>
                <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Subflow
                </button>
            </div>

            {/* Create flow modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowCreate(false)}>
                    <div className="card p-6 w-full max-w-md shadow-2xl scale-100 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold mb-4">Create New Subflow</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="input-label">Flow Name</label>
                                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="input-field" placeholder="Order Status Flow" required autoFocus />
                            </div>
                            <div>
                                <label className="input-label">Description</label>
                                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="input-field" placeholder="Handles order status queries..." rows={3} />
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                                    {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="card p-6 animate-pulse"><div className="h-6 w-40 bg-surface-200 dark:bg-surface-700 rounded" /></div>)}
                </div>
            ) : flows.length === 0 ? (
                <div className="card p-12 text-center">
                    <GitBranch className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No flows found</h3>
                    <p className="text-surface-500 mb-4">Something is wrong (Main Flow should exist automatically).</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {flows.map((flow) => (
                        <div
                            key={flow._id}
                            className={`card p-5 flex items-center gap-4 group hover:scale-[1.01] transition-all duration-200 ${flow.isMainFlow ? 'border-l-4 border-l-brand-500 bg-brand-50/50 dark:bg-brand-900/10' : ''
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${flow.isMainFlow
                                ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-lg shadow-brand-500/20'
                                : 'bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 text-surface-500 dark:text-surface-400'
                                }`}>
                                {flow.isMainFlow ? <ShieldCheck className="w-5 h-5" /> : <GitBranch className="w-5 h-5" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">{flow.name}</h3>
                                    {flow.isMainFlow && (
                                        <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                                            Main Flow
                                        </span>
                                    )}
                                </div>
                                {flow.description && <p className="text-sm text-surface-500 truncate mt-0.5">{flow.description}</p>}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-surface-500 mr-2">
                                {flow.isDeployed ? (
                                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-900/20">
                                        <CheckCircle className="w-3.5 h-3.5" /> Live v{flow.productionVersion}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-100 dark:bg-surface-800">
                                        <Clock className="w-3.5 h-3.5" /> Draft
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigate(`/builder/${botId}/${flow._id}`)}
                                    className="btn-primary text-sm py-2 px-4 shadow-sm"
                                >
                                    Open Builder
                                </button>

                                {!flow.isMainFlow && (
                                    <>
                                        <button
                                            onClick={() => handleDuplicate(flow._id)}
                                            disabled={duplicatingFlowId === flow._id}
                                            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
                                            title="Duplicate Subflow"
                                        >
                                            {duplicatingFlowId === flow._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setConfirmModal({ isOpen: true, flowId: flow._id })}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
                                            title="Delete Subflow"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Delete Flow"
                message="Delete this flow and all its versions? This action cannot be undone."
                confirmLabel="Delete Flow"
                variant="danger"
                onConfirm={() => handleDelete(confirmModal.flowId)}
                onCancel={() => setConfirmModal({ isOpen: false, flowId: '' })}
            />
        </div>
    );
}
