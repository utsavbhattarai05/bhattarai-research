'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Publication } from '@/components/ui/PublicationCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import TagBadge from '@/components/ui/TagBadge';

export default function PublicationsListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/publications?limit=100')
      .then((r) => r.json())
      .then((d) => setPublications(d.publications ?? []))
      .catch(() => setPublications([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this publication? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/publications/${id}`, { method: 'DELETE' });
      if (res.ok) setPublications((prev) => prev.filter((p) => p._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  if (status === 'loading' || loading) return <LoadingSpinner text="Loading publications..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold">Publications</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{publications.length} entries</p>
          </div>
        </div>
        <Link
          href="/admin/publications/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
        >
          <FiPlus size={14} /> Add new
        </Link>
      </div>

      {publications.length === 0 ? (
        <EmptyState message="No publications yet. Add your first one." />
      ) : (
        <div className="bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Year</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 hidden lg:table-cell">Tags</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {publications.map((pub) => (
                <tr key={pub._id} className="border-b border-gray-200/50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div style={{ color: 'var(--text-primary)' }} className="text-sm font-medium line-clamp-1">{pub.title.en}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{pub.authors.slice(0, 2).join(', ')}{pub.authors.length > 2 ? ' et al.' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden sm:table-cell">{pub.year}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gold-100 dark:bg-gold-900 text-gold-600 dark:text-gold-300">
                      {pub.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {pub.tags.slice(0, 2).map((tag) => <TagBadge key={tag} label={tag} />)}
                      {pub.tags.length > 2 && <span className="text-[10px] text-gray-400">+{pub.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/publications/${pub._id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(pub._id)}
                        disabled={deleting === pub._id}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
