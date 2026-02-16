import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Shield, Bot, Users, Loader2 } from 'lucide-react';

interface IAdminUser {
    _id: string;
    email: string;
    role: string;
    botCount: number;
    createdAt: string;
}

interface IAdminBot {
    _id: string;
    name: string;
    userId: { email: string };
    flowCount: number;
    sessionCount: number;
    createdAt: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<IAdminUser[]>([]);
    const [bots, setBots] = useState<IAdminBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'users' | 'bots'>('users');

    useEffect(() => {
        const fetch = async () => {
            try {
                const [usersRes, botsRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/bots'),
                ]);
                if (usersRes.data.success) setUsers(usersRes.data.data);
                if (botsRes.data.success) setBots(botsRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-brand-500" /> Admin Panel
            </h1>

            <div className="flex gap-1 mb-6 bg-surface-100 dark:bg-surface-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setTab('users')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'users' ? 'bg-white dark:bg-surface-700 shadow-sm' : 'text-surface-500'}`}
                >
                    <Users className="w-4 h-4" /> Users ({users.length})
                </button>
                <button
                    onClick={() => setTab('bots')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === 'bots' ? 'bg-white dark:bg-surface-700 shadow-sm' : 'text-surface-500'}`}
                >
                    <Bot className="w-4 h-4" /> Bots ({bots.length})
                </button>
            </div>

            {tab === 'users' ? (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surface-50 dark:bg-surface-800/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Email</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Role</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Bots</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                                    <td className="px-6 py-4 font-medium">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">{u.botCount}</td>
                                    <td className="px-6 py-4 text-sm text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-surface-50 dark:bg-surface-800/50">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Bot Name</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Owner</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Flows</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Sessions</th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-surface-500 uppercase">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
                            {bots.map((b) => (
                                <tr key={b._id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30">
                                    <td className="px-6 py-4 font-medium">{b.name}</td>
                                    <td className="px-6 py-4 text-surface-500">{b.userId?.email ?? 'N/A'}</td>
                                    <td className="px-6 py-4 text-surface-500">{b.flowCount}</td>
                                    <td className="px-6 py-4 text-surface-500">{b.sessionCount}</td>
                                    <td className="px-6 py-4 text-sm text-surface-500">{new Date(b.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
