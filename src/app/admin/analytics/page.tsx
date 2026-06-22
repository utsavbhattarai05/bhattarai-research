'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft, FiDownload, FiUsers, FiFileText, FiMail,
} from 'react-icons/fi';
import StatCard from '@/components/ui/StatCard';
import SectionCard from '@/components/ui/SectionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AnalyticsData {
  totals: {
    totalDownloads:    number;
    totalUsers:        number;
    totalPublications: number;
    totalMessages:     number;
  };
  months: { label: string; count: number }[];
  topPublications: { _id: string; count: number; title: string; type: string; year: number }[];
  downloadsByType: { _id: string; count: number }[];
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-40 w-full pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-[9px] text-gray-400 font-medium">{d.count > 0 ? d.count : ''}</span>
          <div className="w-full rounded-t-sm bg-maroon-100 dark:bg-maroon-950 relative overflow-hidden" style={{ height: '100px' }}>
            <div
              className="absolute bottom-0 w-full bg-maroon-600 dark:bg-maroon-500 rounded-t-sm transition-all duration-500"
              style={{ height: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HBarChart({ data }: { data: { label: string; count: number; color?: string }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-700 dark:text-gray-300 capitalize">{d.label.replace('_', ' ')}</span>
            <span className="text-gray-400 font-medium">{d.count}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-maroon-600 dark:bg-maroon-500"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'loading' || loading) return <LoadingSpinner text="Loading analytics..." />;
  if (!data) return <p className="text-center py-16 text-gray-400 text-sm">Failed to load analytics.</p>;

  const { totals, months, topPublications, downloadsByType } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold">Analytics</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Download stats and site overview</p>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total downloads"   value={totals.totalDownloads}    icon={FiDownload}  iconColor="text-maroon-700 dark:text-maroon-400" />
        <StatCard label="Registered users"  value={totals.totalUsers}        icon={FiUsers}     iconColor="text-blue-600 dark:text-blue-400" />
        <StatCard label="Publications"      value={totals.totalPublications}  icon={FiFileText}  iconColor="text-gold-500" />
        <StatCard label="Messages received" value={totals.totalMessages}     icon={FiMail}      iconColor="text-green-600 dark:text-green-400" />
      </div>

      {/* Monthly chart */}
      <div className="mb-6">
        <SectionCard title="Downloads — last 12 months">
          {months.every((m) => m.count === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">No downloads recorded yet.</p>
          ) : (
            <BarChart data={months} />
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top publications */}
        <SectionCard title="Most downloaded" description="Top 5 publications by downloads">
          {topPublications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {topPublications.map((pub, i) => {
                const max = topPublications[0].count;
                return (
                  <div key={pub._id}>
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="text-xs font-semibold text-gray-300 dark:text-gray-600 w-4 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-white line-clamp-2">{pub.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{pub.type.replace('_', ' ')} · {pub.year}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-maroon-700 dark:text-maroon-400 flex-shrink-0">
                        {pub.count}
                      </span>
                    </div>
                    <div className="ml-6 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-maroon-500 dark:bg-maroon-400 rounded-full transition-all duration-500"
                        style={{ width: `${(pub.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Downloads by type */}
        <SectionCard title="Downloads by type" description="Breakdown across publication categories">
          {downloadsByType.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No data yet.</p>
          ) : (
            <HBarChart data={downloadsByType.map((d) => ({ label: d._id, count: d.count }))} />
          )}
        </SectionCard>

      </div>
    </div>
  );
}
