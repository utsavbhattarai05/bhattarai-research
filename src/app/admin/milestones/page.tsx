import { pickText } from '@/utils/pickText';
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiMenu,
} from 'react-icons/fi';
import {
  HiOutlineHeart, HiOutlineAcademicCap, HiOutlineBriefcase,
  HiOutlineDocumentText, HiOutlineStar,
} from 'react-icons/hi';
import { Milestone } from '@/components/ui/TimelineItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  early_life:  { bg: 'bg-pink-50 dark:bg-pink-950',    text: 'text-pink-700 dark:text-pink-300',     icon: <HiOutlineHeart size={12} /> },
  education:   { bg: 'bg-blue-50 dark:bg-blue-950',    text: 'text-blue-700 dark:text-blue-300',     icon: <HiOutlineAcademicCap size={12} /> },
  career:      { bg: 'bg-gold-50 dark:bg-gold-900',    text: 'text-gold-600 dark:text-gold-300',     icon: <HiOutlineBriefcase size={12} /> },
  research:    { bg: 'bg-maroon-50 dark:bg-maroon-950', text: 'text-maroon-700 dark:text-maroon-400', icon: <HiOutlineDocumentText size={12} /> },
  achievement: { bg: 'bg-green-50 dark:bg-green-950',  text: 'text-green-700 dark:text-green-300',   icon: <HiOutlineStar size={12} /> },
};

export default function MilestonesListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/');
  }, [status, session, router]);

  useEffect(() => {
    fetch('/api/milestones')
      .then((r) => r.json())
      .then((d) => setMilestones(d.milestones ?? []))
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/milestones?id=${id}`, { method: 'DELETE' });
      if (res.ok) setMilestones((prev) => prev.filter((m) => m._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  // Drag-to-reorder
  const handleDragStart = (index: number) => setDragging(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragging === null || dragging === index) return;
    const updated = [...milestones];
    const [moved] = updated.splice(dragging, 1);
    updated.splice(index, 0, moved);
    setDragging(index);
    setMilestones(updated);
  };
  const handleDragEnd = async () => {
    setDragging(null);
    // Persist new order
    await Promise.all(
      milestones.map((m, i) =>
        fetch('/api/milestones', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: m._id, sortOrder: i }),
        })
      )
    );
  };

  if (status === 'loading' || loading) return <LoadingSpinner text="Loading milestones..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold">Timeline</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {milestones.length} milestones · drag to reorder
            </p>
          </div>
        </div>
        <Link
          href="/admin/milestones/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
        >
          <FiPlus size={14} /> Add milestone
        </Link>
      </div>

      {milestones.length === 0 ? (
        <EmptyState message="No milestones yet. Add the first entry." />
      ) : (
        <div className="space-y-2">
          {milestones.map((m, i) => {
            const style = CATEGORY_STYLES[m.category] ?? CATEGORY_STYLES.career;
            return (
              <div
                key={m._id ?? i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 p-4 bg-[var(--surface)] rounded-xl border transition-all cursor-grab active:cursor-grabbing
                  ${dragging === i
                    ? 'border-maroon-300 dark:border-maroon-700 opacity-60 scale-[0.99]'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'}`}
              >
                {/* Drag handle */}
                <FiMenu className="text-gray-300 dark:text-gray-600 flex-shrink-0" size={16} />

                {/* Year */}
                <span className="text-xs font-mono text-gray-400 w-12 flex-shrink-0">{m.year}</span>

                {/* Category badge */}
                <span className={`hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${style.bg} ${style.text}`}>
                  {style.icon}
                  {m.category.replace('_', ' ')}
                </span>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium truncate">
                    {pickText(m.title, 'en')}
                  </p>
                  {m.isCurrent && (
                    <span className="text-[10px] text-maroon-600 dark:text-maroon-400 font-medium">● Current</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/admin/milestones/${m._id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
                    title="Edit"
                  >
                    <FiEdit2 size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(m._id!)}
                    disabled={deleting === m._id}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
