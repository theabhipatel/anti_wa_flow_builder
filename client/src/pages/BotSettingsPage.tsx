import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { IBot, IBotVariable } from '../types';
import { ArrowLeft, Phone, Check, X, Plus, Trash2, Loader2, Save } from 'lucide-react';

export default function BotSettingsPage() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState<IBot | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Bot info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // WhatsApp
    const [phoneNumberId, setPhoneNumberId] = useState('');
    const [businessAccountId, setBusinessAccountId] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [waConnecting, setWaConnecting] = useState(false);
    const [waError, setWaError] = useState('');
    const [waSuccess, setWaSuccess] = useState('');

    // Variables
    const [variables, setVariables] = useState<IBotVariable[]>([]);
    const [newVarName, setNewVarName] = useState('');
    const [newVarValue, setNewVarValue] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get(`/bots/${botId}`);
                if (res.data.success) {
                    const b = res.data.data;
                    setBot(b);
                    setName(b.name);
                    setDescription(b.description || '');
                    if (b.whatsapp) {
                        setPhoneNumberId(b.whatsapp.phoneNumberId);
                        setBusinessAccountId(b.whatsapp.businessAccountId);
                        setPhoneNumber(b.whatsapp.phoneNumber);
                    }
                }

                const varRes = await api.get(`/bots/${botId}/variables`);
                if (varRes.data.success) setVariables(varRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [botId]);

    const saveBotInfo = async () => {
        setSaving(true);
        try {
            await api.put(`/bots/${botId}`, { name, description });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const connectWhatsApp = async () => {
        setWaConnecting(true);
        setWaError('');
        setWaSuccess('');
        try {
            const res = await api.post(`/bots/${botId}/whatsapp/connect`, {
                phoneNumberId, businessAccountId, accessToken, phoneNumber,
            });
            if (res.data.success) {
                setWaSuccess('WhatsApp connected successfully!');
                setBot({ ...bot!, isWhatsAppConnected: true });
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setWaError(axiosErr.response?.data?.error || 'Failed to connect');
        } finally {
            setWaConnecting(false);
        }
    };

    const disconnectWhatsApp = async () => {
        if (!confirm('Disconnect WhatsApp?')) return;
        try {
            await api.delete(`/bots/${botId}/whatsapp/disconnect`);
            setBot({ ...bot!, isWhatsAppConnected: false });
            setPhoneNumberId('');
            setBusinessAccountId('');
            setAccessToken('');
            setPhoneNumber('');
        } catch (err) {
            console.error(err);
        }
    };

    const addVariable = async () => {
        if (!newVarName.trim()) return;
        try {
            const res = await api.post(`/bots/${botId}/variables`, {
                variableName: newVarName, variableValue: newVarValue, variableType: 'STRING',
            });
            if (res.data.success) {
                setVariables([...variables, res.data.data]);
                setNewVarName('');
                setNewVarValue('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteVariable = async (varName: string) => {
        try {
            await api.delete(`/bots/${botId}/variables/${varName}`);
            setVariables(variables.filter((v) => v.variableName !== varName));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-6">
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-2xl font-bold mb-6">Bot Settings — {bot?.name}</h1>

            {/* Bot Info */}
            <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">General</h2>
                <div className="space-y-4">
                    <div>
                        <label className="input-label">Bot Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="input-label">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={3} />
                    </div>
                    <button onClick={saveBotInfo} disabled={saving} className="btn-primary flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                </div>
            </div>

            {/* WhatsApp Connection */}
            <div className="card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="w-5 h-5 text-emerald-500" /> WhatsApp Connection
                    </h2>
                    {bot?.isWhatsAppConnected && (
                        <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4" /> Connected
                        </span>
                    )}
                </div>

                {waError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{waError}</div>}
                {waSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">{waSuccess}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="input-label">Phone Number ID</label>
                        <input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} className="input-field" placeholder="e.g. 123456789012345" />
                    </div>
                    <div>
                        <label className="input-label">Business Account ID</label>
                        <input value={businessAccountId} onChange={(e) => setBusinessAccountId(e.target.value)} className="input-field" placeholder="e.g. 123456789012345" />
                    </div>
                    <div>
                        <label className="input-label">Access Token</label>
                        <input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} className="input-field" placeholder="Bearer token from Meta" type="password" />
                    </div>
                    <div>
                        <label className="input-label">Phone Number (with country code)</label>
                        <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" placeholder="e.g. +919876543210" />
                    </div>
                    <div className="flex gap-3">
                        <button onClick={connectWhatsApp} disabled={waConnecting} className="btn-primary flex items-center gap-2">
                            {waConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                            {bot?.isWhatsAppConnected ? 'Update Connection' : 'Connect WhatsApp'}
                        </button>
                        {bot?.isWhatsAppConnected && (
                            <button onClick={disconnectWhatsApp} className="btn-danger flex items-center gap-2">
                                <X className="w-4 h-4" /> Disconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bot Variables */}
            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Bot Variables</h2>
                <p className="text-sm text-surface-500 mb-4">Global variables shared across all flows and sessions.</p>

                {variables.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {variables.map((v) => (
                            <div key={v.variableName} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
                                <code className="text-sm font-mono text-brand-600 dark:text-brand-400 flex-1">{`{{${v.variableName}}}`}</code>
                                <span className="text-sm text-surface-500 flex-1">{String(v.variableValue)}</span>
                                <button onClick={() => deleteVariable(v.variableName)} className="p-1 text-surface-400 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-2">
                    <input value={newVarName} onChange={(e) => setNewVarName(e.target.value)} className="input-field flex-1" placeholder="Variable name" />
                    <input value={newVarValue} onChange={(e) => setNewVarValue(e.target.value)} className="input-field flex-1" placeholder="Value" />
                    <button onClick={addVariable} className="btn-primary px-3"><Plus className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
}
