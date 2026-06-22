'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiTrash2, FiMail, FiX } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (msg: Message, read: boolean) => {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: msg._id, read }),
    });
    setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, read } : m));
    if (selected?._id === msg._id) setSelected({ ...msg, read });
  };

  const openMessage = (msg: Message) => {
    setSelected(msg);
    if (!msg.read) markRead(msg, true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selected?._id === id) setSelected(null);
      }
    } finally {
      setDeleting(null);
    }
  };

  const displayed = filter === 'unread' ? messages.filter((m) => !m.read) : messages;
  const unreadCount = messages.filter((m) => !m.read).length;

  if (status === 'loading' || loading) return <LoadingSpinner text="Loading messages..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold flex items-center gap-2">
              Messages
              {unreadCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-maroon-100 dark:bg-maroon-950 text-maroon-700 dark:text-maroon-400 font-medium">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{messages.length} total messages</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-lg p-1">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                filter === f
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {f === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <EmptyState message={filter === 'unread' ? 'No unread messages.' : 'No messages yet.'} />
      ) : (
        <div className="flex gap-4 h-[calc(100vh-220px)]">

          {/* Message list */}
          <div className={`flex flex-col gap-1 overflow-y-auto ${selected ? 'hidden md:flex md:w-2/5' : 'w-full'}`}>
            {displayed.map((msg) => (
              <button
                key={msg._id}
                onClick={() => openMessage(msg)}
                className={`text-left p-4 rounded-xl border transition-colors w-full ${
                  selected?._id === msg._id
                    ? 'bg-maroon-50 dark:bg-maroon-950/40 border-maroon-200 dark:border-maroon-800'
                    : 'bg-[var(--surface)] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.read && (
                      <span className="w-2 h-2 rounded-full bg-maroon-600 dark:bg-maroon-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm truncate ${!msg.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {msg.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(msg.createdAt)}</span>
                </div>
                <p className={`text-xs truncate mb-1 ${!msg.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{msg.message}</p>
              </button>
            ))}
          </div>

          {/* Message detail */}
          {selected && (
            <div className="flex-1 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
              {/* Detail header */}
              <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{selected.subject}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From <span className="font-medium text-gray-700 dark:text-gray-300">{selected.name}</span>
                    {' · '}
                    <a href={`mailto:${selected.email}`} className="text-maroon-700 dark:text-maroon-400 hover:underline">{selected.email}</a>
                    {' · '}
                    {formatDate(selected.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => markRead(selected, !selected.read)}
                    title={selected.read ? 'Mark unread' : 'Mark read'}
                    className="p-1.5 text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
                  >
                    {selected.read ? <FiMail size={15} /> : <FiMail size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(selected._id)}
                    disabled={deleting === selected._id}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    <FiTrash2 size={15} />
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors md:hidden"
                  >
                    <FiX size={15} />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              {/* Reply button */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
                >
                  <FiMail size={14} /> Reply via email
                </a>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
