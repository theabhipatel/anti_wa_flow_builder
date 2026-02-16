import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Key, Check, Trash2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [apiKey, setApiKey] = useState('');
    const [hasKey, setHasKey] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/openai/status');
                if (res.data.success) setHasKey(res.data.data.hasApiKey);
            } catch (err) {
                console.error(err);
            }
        };
        fetch();
    }, []);

    const saveKey = async () => {
        if (!apiKey.trim()) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await api.post('/openai/key', { apiKey });
            if (res.data.success) {
                setHasKey(true);
                setApiKey('');
                setSuccess('API key saved and validated ✓');
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setError(axiosErr.response?.data?.error || 'Failed to save key');
        } finally {
            setSaving(false);
        }
    };

    const deleteKey = async () => {
        if (!confirm('Remove your OpenAI API key?')) return;
        try {
            await api.delete('/openai/key');
            setHasKey(false);
            setSuccess('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="card p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Key className="w-5 h-5 text-brand-500" /> OpenAI API Key
                </h2>
                <p className="text-sm text-surface-500 mb-4">
                    Your API key is encrypted and stored securely. It is used for AI nodes in your flows.
                </p>

                {hasKey && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                            <Check className="w-4 h-4" /> API key is configured
                        </span>
                        <button onClick={deleteKey} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1">
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                    </div>
                )}

                {error && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm">{success}</div>}

                <div className="flex gap-3">
                    <input
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        type="password"
                        className="input-field flex-1"
                        placeholder={hasKey ? 'Enter new key to replace...' : 'sk-...'}
                    />
                    <button onClick={saveKey} disabled={saving || !apiKey.trim()} className="btn-primary flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {hasKey ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
