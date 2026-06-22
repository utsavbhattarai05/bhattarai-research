'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PublicationCard, { Publication } from '@/components/ui/PublicationCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

const TYPES      = ['journal', 'conference', 'book_chapter', 'working_paper', 'thesis', 'other'];
const PER_PAGE   = 10;

interface Pagination {
  page:  number;
  limit: number;
  total: number;
  pages: number;
}

export default function ResearchPage() {
  const { t } = useLanguage();
  const topRef = useRef<HTMLDivElement>(null);

  const [publications, setPublications] = useState<Publication[]>([]);
  const [pagination, setPagination]     = useState<Pagination | null>(null);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [yearFilter, setYearFilter]     = useState('');
  const [page, setPage]                 = useState(1);
  const [years, setYears]               = useState<number[]>([]);

  const fetchPublications = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)     params.set('search', search);
      if (typeFilter) params.set('type',   typeFilter);
      if (yearFilter) params.set('year',   yearFilter);
      params.set('page',  String(p));
      params.set('limit', String(PER_PAGE));

      const res  = await fetch(`/api/publications?${params}`);
      const data = await res.json();
      setPublications(data.publications ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setPublications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, yearFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, yearFilter]);

  useEffect(() => {
    fetchPublications(page);
  }, [fetchPublications, page]);

  // Fetch available years for the year filter dropdown
  useEffect(() => {
    fetch('/api/publications?limit=200')
      .then((r) => r.json())
      .then((d) => {
        const uniq = [...new Set<number>((d.publications ?? []).map((p: Publication) => p.year))].sort((a, b) => b - a);
        setYears(uniq);
      });
  }, []);

  const goTo = (p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" ref={topRef}>
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
          {t('research.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('research.subtitle')}
          {pagination && (
            <span className="ml-2 text-gray-400">— {pagination.total} publication{pagination.total !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Search & filters */}
      <div className="mb-8 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder={t('research.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ color: 'var(--text-primary)' }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[var(--surface)] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiFilter size={14} />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs px-3 py-1.5 bg-[var(--surface)] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none"
          >
            <option value="">{t('research.allTypes')}</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>{t(`research.${type}`)}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs px-3 py-1.5 bg-[var(--surface)] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none"
          >
            <option value="">{t('research.allYears')}</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : publications.length === 0 ? (
        <EmptyState message={t('research.noResults')} />
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {publications.map((pub) => (
              <PublicationCard key={pub._id} publication={pub} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
              {/* Previous */}
              <button
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={15} /> Previous
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goTo(p as number)}
                        className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                          page === p
                            ? 'bg-maroon-700 dark:bg-maroon-600 text-white font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              {/* Mobile page indicator */}
              <span className="sm:hidden text-sm text-gray-500 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>

              {/* Next */}
              <button
                onClick={() => goTo(page + 1)}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next <FiChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
