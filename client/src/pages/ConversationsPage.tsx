import { useEffect, useState, useRef, useCallback } from 'react';
import api from '../lib/api';
import { IBot, IConversationSummary, IConversationMessage } from '../types';
import {
    Search,
    Send,
    RefreshCw,
    MessageSquare,
    Bot as BotIcon,
    User,
    Hand,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Loader2,
    MessagesSquare,
    Phone,
    X,
} from 'lucide-react';
import { useToast } from '../components/Toast';

// ─── Custom Themed Date Picker ─────────────────────────────────────────────
interface DatePickerProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

function DatePicker({ value, onChange, placeholder = 'Select date' }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const today = new Date();

    const selectedDate = value ? new Date(value) : null;

    const handleSelect = (day: number) => {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        onChange(`${viewYear}-${m}-${d}`);
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
        else setViewMonth(viewMonth - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
        else setViewMonth(viewMonth + 1);
    };

    const displayValue = selectedDate
        ? `${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
        : '';

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="input-field py-1.5 px-3 text-xs text-left w-full flex items-center gap-2 cursor-pointer"
            >
                <Calendar className="w-3 h-3 text-surface-400 flex-shrink-0" />
                <span className={displayValue ? '' : 'text-surface-400'}>
                    {displayValue || placeholder}
                </span>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 w-[260px] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl z-50 p-3">
                    {/* Month/Year header */}
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                            <ChevronLeft className="w-4 h-4 text-surface-500" />
                        </button>
                        <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
                        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                            <ChevronRight className="w-4 h-4 text-surface-500" />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {DAYS.map((d) => (
                            <div key={d} className="text-center text-[10px] font-medium text-surface-400 py-1">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
                            const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelect(day)}
                                    className={`w-8 h-8 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                                        isSelected
                                            ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-md shadow-brand-500/20'
                                            : isToday
                                            ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 ring-1 ring-brand-300 dark:ring-brand-600'
                                            : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            className="text-[11px] text-surface-500 hover:text-red-500 transition-colors px-2 py-1 rounded"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const m = String(today.getMonth() + 1).padStart(2, '0');
                                const d = String(today.getDate()).padStart(2, '0');
                                onChange(`${today.getFullYear()}-${m}-${d}`);
                                setOpen(false);
                            }}
                            className="text-[11px] text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors px-2 py-1 rounded"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Main Conversations Page ───────────────────────────────────────────────
export default function ConversationsPage() {
    // --- State ---
    const [bots, setBots] = useState<IBot[]>([]);
    const [selectedBotId, setSelectedBotId] = useState<string>('');
    const [conversations, setConversations] = useState<IConversationSummary[]>([]);
    const [selectedPhone, setSelectedPhone] = useState<string>('');
    const [messages, setMessages] = useState<IConversationMessage[]>([]);
    const [manualMsg, setManualMsg] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);

    const [loadingBots, setLoadingBots] = useState(true);
    const [loadingConvos, setLoadingConvos] = useState(false);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [sending, setSending] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [botDropdownOpen, setBotDropdownOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    // --- Debounce search input (300ms) ---
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // --- Close dropdown on outside click ---
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setBotDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- Fetch bots ---
    useEffect(() => {
        const fetchBots = async () => {
            try {
                const res = await api.get('/bots');
                if (res.data.success) {
                    const sorted = [...res.data.data].sort((a: IBot, b: IBot) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    setBots(sorted);
                    if (sorted.length > 0 && !selectedBotId) {
                        setSelectedBotId(sorted[0]._id);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingBots(false);
            }
        };
        fetchBots();
    }, []);

    // --- Fetch conversations when bot or filters change ---
    const fetchConversations = useCallback(async (botId: string, silent = false) => {
        if (!botId) return;
        if (!silent) setLoadingConvos(true);
        try {
            const params = new URLSearchParams();
            if (debouncedSearch) params.set('search', debouncedSearch);
            if (dateFrom) params.set('from', new Date(dateFrom).toISOString());
            if (dateTo) params.set('to', new Date(dateTo + 'T23:59:59').toISOString());

            const res = await api.get(`/conversations/${botId}?${params.toString()}`);
            if (res.data.success) {
                setConversations(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoadingConvos(false);
        }
    }, [debouncedSearch, dateFrom, dateTo]);

    useEffect(() => {
        if (selectedBotId) {
            setSelectedPhone('');
            setMessages([]);
            fetchConversations(selectedBotId);
        }
    }, [selectedBotId, fetchConversations]);

    // --- Fetch messages when conversation selected ---
    const fetchMessages = useCallback(async (botId: string, phone: string, silent = false) => {
        if (!botId || !phone) return;
        if (!silent) setLoadingMsgs(true);
        try {
            const res = await api.get(`/conversations/${botId}/${encodeURIComponent(phone)}/messages?limit=200`);
            if (res.data.success) {
                setMessages(res.data.data.messages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!silent) setLoadingMsgs(false);
        }
    }, []);

    // Track whether we should force scroll (initial load / conversation switch)
    const shouldForceScrollRef = useRef(true);
    // Track scroll position continuously (BEFORE new messages render)
    const isUserNearBottomRef = useRef(true);

    useEffect(() => {
        if (selectedBotId && selectedPhone) {
            shouldForceScrollRef.current = true;
            isUserNearBottomRef.current = true;
            fetchMessages(selectedBotId, selectedPhone);
        }
    }, [selectedBotId, selectedPhone, fetchMessages]);

    // --- Scroll listener: continuously track if user is near bottom ---
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            isUserNearBottomRef.current =
                container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [selectedPhone]); // Re-attach when conversation changes

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // --- Scroll on messages change ---
    useEffect(() => {
        if (shouldForceScrollRef.current || isUserNearBottomRef.current) {
            scrollToBottom();
            shouldForceScrollRef.current = false;
        }
    }, [messages]);

    // --- Polling (30 seconds) — fully silent, no loading indicators ---
    useEffect(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }

        if (selectedBotId && selectedPhone) {
            pollingRef.current = setInterval(() => {
                fetchMessages(selectedBotId, selectedPhone, true);
                fetchConversations(selectedBotId, true);
            }, 30000);
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [selectedBotId, selectedPhone, fetchMessages, fetchConversations]);

    // --- Send manual message ---
    const handleSend = async () => {
        if (!manualMsg.trim() || !selectedBotId || !selectedPhone) return;
        setSending(true);
        try {
            const res = await api.post(
                `/conversations/${selectedBotId}/${encodeURIComponent(selectedPhone)}/send`,
                { message: manualMsg }
            );
            if (res.data.success) {
                setManualMsg('');
                // Refresh messages silently
                await fetchMessages(selectedBotId, selectedPhone, true);
                await fetchConversations(selectedBotId, true);
            }
        } catch (err: unknown) {
            const errorMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send message';
            toast.error(errorMsg);
        } finally {
            setSending(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (selectedBotId && selectedPhone) {
            await fetchMessages(selectedBotId, selectedPhone, true);
        }
        if (selectedBotId) {
            await fetchConversations(selectedBotId, true);
        }
        setRefreshing(false);
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString();
    };

    const formatMessageTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    /** Render message content with newlines preserved (for button/list details) */
    const renderMessageContent = (content?: string) => {
        if (!content) return '(empty)';
        // Split by newlines and render as separate elements
        const lines = content.split('\n');
        if (lines.length === 1) return content;
        return (
            <span>
                {lines.map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < lines.length - 1 && <br />}
                    </span>
                ))}
            </span>
        );
    };

    const selectedBot = bots.find((b) => b._id === selectedBotId);

    return (
        <div className="h-[calc(100vh-7rem)] max-w-7xl mx-auto flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold">Conversations</h1>
                    <p className="text-surface-500 mt-1">View and manage WhatsApp conversations</p>
                </div>

                {/* Bot Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setBotDropdownOpen(!botDropdownOpen)}
                        disabled={loadingBots}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-brand-400 dark:hover:border-brand-500 transition-all min-w-[220px] shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <BotIcon className="w-4 h-4 text-white" />
                        </div>
                        <span className="flex-1 text-left text-sm font-medium truncate">
                            {loadingBots ? 'Loading...' : selectedBot?.name || 'Select a bot'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${botDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {botDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full min-w-[260px] bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                            {[...bots].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((bot) => (
                                <button
                                    key={bot._id}
                                    onClick={() => {
                                        setSelectedBotId(bot._id);
                                        setBotDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors ${selectedBotId === bot._id ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedBotId === bot._id ? 'bg-gradient-to-br from-brand-500 to-purple-600' : 'bg-surface-100 dark:bg-surface-700'}`}>
                                        <BotIcon className={`w-3.5 h-3.5 ${selectedBotId === bot._id ? 'text-white' : 'text-surface-500'}`} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-sm font-medium truncate">{bot.name}</p>
                                        {bot.description && <p className="text-xs text-surface-500 truncate">{bot.description}</p>}
                                    </div>
                                    {selectedBotId === bot._id && (
                                        <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                            {bots.length === 0 && (
                                <div className="px-4 py-3 text-sm text-surface-500 text-center">No bots available</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Main content — 2 panels */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left: Conversation List */}
                <div className="w-[340px] flex-shrink-0 flex flex-col card" style={{ overflow: 'visible' }}>
                    {/* Search & Filters */}
                    <div className="p-3 border-b border-surface-200 dark:border-surface-700 space-y-2 relative z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by phone number..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="input-field py-2 text-sm"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDateFilter(!showDateFilter)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                    showDateFilter || dateFrom || dateTo
                                        ? 'border-brand-400 dark:border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-sm shadow-brand-500/10'
                                        : 'border-surface-200 dark:border-surface-700 text-surface-500 hover:border-surface-300 dark:hover:border-surface-600 hover:text-surface-600'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Date Filter
                                {(dateFrom || dateTo) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 ml-0.5" />
                                )}
                            </button>
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={() => { setDateFrom(''); setDateTo(''); setShowDateFilter(false); }}
                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <X className="w-3 h-3" /> Clear
                                </button>
                            )}
                        </div>
                        {showDateFilter && (
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-surface-400 mb-0.5 block">From</label>
                                    <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="Start date" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-surface-400 mb-0.5 block">To</label>
                                    <DatePicker value={dateTo} onChange={setDateTo} placeholder="End date" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Conversation entries */}
                    <div className="flex-1 overflow-y-auto">
                        {!selectedBotId ? (
                            <div className="flex flex-col items-center justify-center h-full text-surface-400 p-6">
                                <BotIcon className="w-10 h-10 mb-3 opacity-50" />
                                <p className="text-sm text-center">Select a bot to view conversations</p>
                            </div>
                        ) : loadingConvos ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                                        <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700" />
                                        <div className="flex-1">
                                            <div className="h-4 w-28 bg-surface-200 dark:bg-surface-700 rounded mb-2" />
                                            <div className="h-3 w-40 bg-surface-200 dark:bg-surface-700 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-surface-400 p-6">
                                <MessagesSquare className="w-10 h-10 mb-3 opacity-50" />
                                <p className="text-sm text-center">No conversations found</p>
                                <p className="text-xs text-surface-400 mt-1 text-center">Messages will appear here when users interact with your bot</p>
                            </div>
                        ) : (
                            conversations.map((convo) => (
                                <button
                                    key={convo.phoneNumber}
                                    onClick={() => setSelectedPhone(convo.phoneNumber)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors text-left ${selectedPhone === convo.phoneNumber ? 'bg-brand-50 dark:bg-brand-900/20 border-l-2 border-l-brand-500' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPhone === convo.phoneNumber ? 'bg-gradient-to-br from-brand-500 to-purple-600' : 'bg-surface-100 dark:bg-surface-700'}`}>
                                        <Phone className={`w-4 h-4 ${selectedPhone === convo.phoneNumber ? 'text-white' : 'text-surface-500'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-medium truncate">{convo.phoneNumber}</p>
                                            <span className="text-[10px] text-surface-400 ml-2 flex-shrink-0">{formatTime(convo.lastMessageAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {convo.lastSender === 'USER' && <User className="w-3 h-3 text-surface-400 flex-shrink-0" />}
                                            {convo.lastSender === 'BOT' && <BotIcon className="w-3 h-3 text-brand-500 flex-shrink-0" />}
                                            {convo.lastSender === 'MANUAL' && <Hand className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                            <p className="text-xs text-surface-500 truncate">{convo.lastMessage?.split('\n')[0] || '(no content)'}</p>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 bg-surface-100 dark:bg-surface-700 text-surface-500 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                                        {convo.messageCount}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Chat View */}
                <div className="flex-1 flex flex-col card overflow-hidden">
                    {!selectedPhone ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-surface-400">
                            <div className="w-20 h-20 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 opacity-40" />
                            </div>
                            <p className="text-lg font-medium mb-1">Select a conversation</p>
                            <p className="text-sm">Choose a conversation from the left to view messages</p>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{selectedPhone}</p>
                                        <p className="text-[11px] text-surface-500">
                                            {messages.length} messages
                                            {selectedBot && <> · via <strong>{selectedBot.name}</strong></>}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                                    title="Refresh messages"
                                >
                                    <RefreshCw className={`w-4 h-4 text-surface-500 ${refreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                                {loadingMsgs ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-surface-400">
                                        <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                                        <p className="text-sm">No messages yet</p>
                                    </div>
                                ) : (
                                    <>
                                        {messages.map((msg) => {
                                            const isUser = msg.sender === 'USER';
                                            const isManual = msg.sender === 'MANUAL';
                                            const isBot = msg.sender === 'BOT';

                                            return (
                                                <div
                                                    key={msg._id}
                                                    className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                                                >
                                                    <div className={`max-w-[70%] group`}>
                                                        {/* Sender badge */}
                                                        <div className={`flex items-center gap-1.5 mb-1 ${isUser ? '' : 'justify-end'}`}>
                                                            {isUser && <User className="w-3 h-3 text-surface-400" />}
                                                            {isBot && <BotIcon className="w-3 h-3 text-brand-500" />}
                                                            {isManual && <Hand className="w-3 h-3 text-emerald-500" />}
                                                            <span className={`text-[10px] font-medium ${isUser ? 'text-surface-400' : isManual ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'}`}>
                                                                {isUser ? 'User' : isBot ? 'Bot' : 'Manual'}
                                                            </span>
                                                        </div>

                                                        {/* Message bubble */}
                                                        <div
                                                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-line ${
                                                                isUser
                                                                    ? 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-md'
                                                                    : isManual
                                                                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-md shadow-md shadow-emerald-500/20'
                                                                    : 'bg-gradient-to-br from-brand-500 to-purple-600 text-white rounded-tr-md shadow-md shadow-brand-500/20'
                                                            }`}
                                                        >
                                                            {renderMessageContent(msg.messageContent)}
                                                        </div>

                                                        {/* Time */}
                                                        <p className={`text-[10px] text-surface-400 mt-1 ${isUser ? '' : 'text-right'}`}>
                                                            {formatMessageTime(msg.sentAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Send box */}
                            <div className="px-4 py-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Type a manual message..."
                                        value={manualMsg}
                                        onChange={(e) => setManualMsg(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        className="input-field py-2.5 text-sm flex-1"
                                        disabled={sending}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!manualMsg.trim() || sending}
                                        className="btn-primary p-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-surface-400 mt-1.5 flex items-center gap-1">
                                    <Hand className="w-3 h-3" />
                                    Messages sent from here will be delivered via WhatsApp and marked as "Manual"
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
