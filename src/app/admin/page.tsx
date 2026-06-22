'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiFileText, FiUsers, FiDownload, FiMail,
  FiPlus, FiBarChart2, FiClock, FiBookOpen, FiUser,
} from 'react-icons/fi';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Stats {
  publications: number;
  users: number;
  downloads: number;
  unreadMessages: number;
}

const QUICK_ACTIONS = [
  { label: 'Add publication',    href: '/admin/publications/new', icon: FiPlus,      desc: 'Upload new research' },
  { label: 'Manage publications', href: '/admin/publications',    icon: FiBookOpen,   desc: 'Edit or remove entries' },
  { label: 'Edit profile',       href: '/admin/profile',          icon: FiUser,       desc: 'Update your information' },
  { label: 'Manage timeline',    href: '/admin/milestones',       icon: FiClock,      desc: 'Edit journey milestones' },
  { label: 'View messages',      href: '/admin/messages',         icon: FiMail,       desc: 'Contact form submissions' },
  { label: 'Analytics',          href: '/admin/analytics',        icon: FiBarChart2,  desc: 'Download statistics' },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role === 'admin') {
      fetch('/api/admin/stats')
        .then((r) => r.json())
        .then((d) => setStats(d))
        .catch(() => null);
    }
  }, [status, session]);

  if (status === 'loading') return <LoadingSpinner text="Loading dashboard..." />;

  const statCards = stats
    ? [
        { label: 'Publications',    value: stats.publications,    icon: FiFileText, color: 'text-maroon-700 dark:text-maroon-400' },
        { label: 'Registered users', value: stats.users,          icon: FiUsers,    color: 'text-blue-600 dark:text-blue-400' },
        { label: 'Total downloads', value: stats.downloads,       icon: FiDownload, color: 'text-green-600 dark:text-green-400' },
        { label: 'Unread messages', value: stats.unreadMessages,  icon: FiMail,     color: 'text-gold-500' },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl font-semibold mb-1">Admin dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {session?.user?.name}. Manage your research and site content.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats ? (
          statCards.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColor={s.color} />
          ))
        ) : (
          <div className="col-span-4"><LoadingSpinner text="Loading stats..." /></div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-start gap-3 p-4 bg-[var(--surface)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
            >
              <action.icon className="text-maroon-700 dark:text-maroon-400 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
              <div>
                <div style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">{action.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
