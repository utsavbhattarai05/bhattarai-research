'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/Providers';
import { useDownload } from '@/hooks/useDownload';
import { Publication } from '@/components/ui/PublicationCard';
import CiteModal from '@/components/ui/CiteModal';
import ShareButton from '@/components/ui/ShareButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { FiSearch, FiChevronLeft, FiChevronRight, FiX, FiDownload, FiExternalLink } from 'react-icons/fi';

type PubType = 'journal' | 'conference' | 'book_chapter';

const CATEGORIES: { type: PubType; icon: string; labelEn: string; labelNe: string; recentEn: string; recentNe: string }[] = [
  { type: 'journal',      icon: '📰', labelEn: 'Journal article',  labelNe: 'जर्नल लेख',    recentEn: 'Recent journal articles',  recentNe: 'हालका जर्नल लेखहरू' },
  { type: 'conference',   icon: '🎤', labelEn: 'Conference paper', labelNe: 'सम्मेलन पत्र',  recentEn: 'Recent conference papers',  recentNe: 'हालका सम्मेलन पत्रहरू' },
  { type: 'book_chapter', icon: '📗', labelEn: 'Book chapter',     labelNe: 'पुस्तक अध्याय', recentEn: 'Recent book chapters',      recentNe: 'हालका पुस्तक अध्यायहरू' },
];

/* ── Article popup modal ── */
function ArticleModal({
  pub,
  language,
  onClose,
  onCite,
}: {
  pub: Publication;
  language: string;
  onClose: () => void;
  onCite: (p: Publication) => void;
}) {
  const { download, states } = useDownload();
  const dlState = states[pub._id] ?? 'idle';
  const title    = language === 'ne' && pub.title.ne    ? pub.title.ne    : pub.title.en;
  const abstract = language === 'ne' && pub.abstract.ne ? pub.abstract.ne : pub.abstract.en;
  const url = typeof window !== 'undefined' ? `${window.location.origin}/research/${pub.slug}` : '';
  const typeIcon = pub.type === 'journal' ? '📰' : pub.type === 'conference' ? '🎤' : pub.type === 'book_chapter' ? '📗' : '📄';

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Maroon header */}
          <div className="bg-maroon-700 dark:bg-maroon-900 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-maroon-200/60 uppercase tracking-widest mb-1">
                  {typeIcon} {pub.type.replace('_', ' ')} · {pub.year}
                </p>
                <h2 className="text-base font-semibold text-maroon-50 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                  {title}
                </h2>
              </div>
              <button onClick={onClose}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-maroon-200 hover:bg-white/20 transition-colors">
                <FiX size={14} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            {/* Authors */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pub.authors.join(', ')} · <span className="italic">{pub.journal}</span>
            </p>

            {/* Abstract */}
            {abstract && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  {language === 'ne' ? 'सारांश' : 'Abstract'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
                  {abstract}
                </p>
              </div>
            )}

            {/* Tags */}
            {pub.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pub.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Download count */}
            <p className="text-[10px] text-gray-400 dark:text-gray-600">
              {pub.downloadCount} {language === 'ne' ? 'डाउनलोड' : 'downloads'}
              {pub.doi && <> · DOI: {pub.doi}</>}
            </p>
          </div>

          {/* Action bar */}
          <div className="px-5 pb-4 flex gap-2">
            <button
              onClick={() => download(pub._id, pub.title.en)}
              disabled={dlState === 'loading'}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                dlState === 'done'
                  ? 'bg-green-600 text-white'
                  : 'bg-maroon-700 dark:bg-maroon-600 hover:bg-maroon-800 text-white'
              } disabled:opacity-50`}
            >
              <FiDownload size={14} />
              {dlState === 'loading' ? '...' : dlState === 'done' ? (language === 'ne' ? 'डाउनलोड भयो!' : 'Downloaded!') : (language === 'ne' ? 'PDF डाउनलोड' : 'Download PDF')}
            </button>
            <button onClick={() => { onCite(pub); onClose(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              {language === 'ne' ? 'उद्धरण' : 'Cite'}
            </button>
            <div className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <ShareButton title={title} url={url} label={language === 'ne' ? 'साझा' : 'Share'} />
            </div>
            {pub.doi && (
              <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Article row ── */
function RecentItem({ pub, language, onClick }: { pub: Publication; language: string; onClick: () => void }) {
  const title = language === 'ne' && pub.title.ne ? pub.title.ne : pub.title.en;
  const typeIcon = pub.type === 'journal' ? '📰' : pub.type === 'conference' ? '🎤' : pub.type === 'book_chapter' ? '📗' : '📄';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-maroon-300 dark:hover:border-maroon-700 transition-all text-left group"
    >
      <span className="text-lg flex-shrink-0">{typeIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate" style={{ fontFamily: 'Georgia, serif' }}>
          {title}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
          {pub.year} · {pub.journal}
        </p>
      </div>
      <span className="text-gray-300 dark:text-gray-700 group-hover:text-maroon-600 dark:group-hover:text-maroon-400 transition-colors text-sm flex-shrink-0">→</span>
    </motion.button>
  );
}

/* ── Main page ── */
export default function ResearchPage() {
  const { language } = useLanguage();
  const [activeType, setActiveType]   = useState<PubType>('journal');
  const [allPubs, setAllPubs]         = useState<Record<PubType, Publication[]>>({ journal: [], conference: [], book_chapter: [] });
  const [counts, setCounts]           = useState<Record<PubType, number>>({ journal: 0, conference: 0, book_chapter: 0 });
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [filtered, setFiltered]       = useState<Publication[]>([]);
  const [filteredLoading, setFL]      = useState(false);
  const [selectedPub, setSelectedPub] = useState<Publication | null>(null);
  const [citeTarget, setCiteTarget]   = useState<Publication | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 10;

  useEffect(() => {
    const fetchType = async (type: PubType) => {
      const res = await fetch(`/api/publications?type=${type}&limit=100`);
      const d = await res.json();
      return { type, pubs: (d.publications ?? []) as Publication[], count: d.pagination?.total ?? 0 };
    };
    Promise.all(CATEGORIES.map(c => fetchType(c.type)))
      .then(results => {
        const newAll: Record<PubType, Publication[]> = { journal: [], conference: [], book_chapter: [] };
        const newCounts: Record<PubType, number> = { journal: 0, conference: 0, book_chapter: 0 };
        results.forEach(r => { newAll[r.type] = r.pubs; newCounts[r.type] = r.count; });
        setAllPubs(newAll);
        setCounts(newCounts);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyFilter = useCallback(() => {
    setFL(true);
    const pubs = allPubs[activeType];
    const q = search.toLowerCase();
    const matches = q
      ? pubs.filter(p => p.title.en.toLowerCase().includes(q) || p.journal?.toLowerCase().includes(q))
      : pubs;
    const start = (page - 1) * PER_PAGE;
    setFiltered(matches.slice(start, start + PER_PAGE));
    setTotalPages(Math.max(1, Math.ceil(matches.length / PER_PAGE)));
    setFL(false);
  }, [allPubs, activeType, search, page]);

  useEffect(() => { applyFilter(); }, [applyFilter]);

  const switchType = (type: PubType) => {
    setActiveType(type);
    setPage(1);
    setSearch('');
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cat = CATEGORIES.find(c => c.type === activeType)!;
  const recentLabel = language === 'ne' ? cat.recentNe : cat.recentEn;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {/* Article popup */}
      {selectedPub && (
        <ArticleModal
          pub={selectedPub}
          language={language}
          onClose={() => setSelectedPub(null)}
          onCite={(p) => { setCiteTarget(p); }}
        />
      )}

      {/* Cite modal */}
      <CiteModal publication={citeTarget} onClose={() => setCiteTarget(null)} />

      <div className="w-full px-4 sm:px-8 py-8 min-h-screen" style={{ background: 'var(--bg-page)' }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 max-w-5xl mx-auto">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Georgia, serif' }}>
            {language === 'ne' ? 'अनुसन्धान संग्रह' : 'Research Collection'}
          </h1>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600" size={13} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={language === 'ne' ? 'खोज्नुहोस्...' : 'Search...'}
              style={{ color: 'var(--text-primary)' }}
              className="pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/8 rounded-lg w-40 focus:outline-none focus:border-maroon-700/50"
            />
          </div>
        </div>

        {/* 3 category cards */}
        <div className="grid grid-cols-3 gap-3 mb-5 max-w-5xl mx-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.type}
              onClick={() => switchType(cat.type)}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all duration-200 ${
                activeType === cat.type
                  ? 'bg-maroon-50 dark:bg-maroon-900/30 border-maroon-600 dark:border-maroon-700'
                  : 'bg-white dark:bg-white/[0.02] border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-gray-300 dark:hover:border-white/10'
              }`}
            >
              <span className={`text-4xl transition-transform duration-200 ${activeType === cat.type ? 'scale-110' : ''}`}>
                {cat.icon}
              </span>
              <span className={`text-[11px] font-semibold uppercase tracking-widest transition-colors ${
                activeType === cat.type ? 'text-maroon-700 dark:text-maroon-400' : 'text-gray-500 dark:text-gray-600'
              }`}>
                {language === 'ne' ? cat.labelNe : cat.labelEn}
              </span>
              <span className={`text-xs transition-colors ${
                activeType === cat.type ? 'text-maroon-500 dark:text-maroon-700' : 'text-gray-400 dark:text-gray-700'
              }`}>
                {counts[cat.type]} {language === 'ne' ? 'पत्रहरू' : 'papers'}
              </span>
            </button>
          ))}
        </div>

        {/* Dynamic recent list */}
        <div className="max-w-5xl mx-auto" ref={listRef}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
            <AnimatePresence mode="wait">
              <motion.span key={recentLabel} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest whitespace-nowrap font-medium">
                {recentLabel}
              </motion.span>
            </AnimatePresence>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/5" />
          </div>

          {filteredLoading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <EmptyState message={language === 'ne' ? 'कुनै प्रकाशन फेला परेन।' : 'No publications found.'} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${activeType}-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} className="space-y-2">
                {filtered.map((pub) => (
                  <RecentItem key={pub._id} pub={pub} language={language} onClick={() => setSelectedPub(pub)} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-white/5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 disabled:opacity-30 transition-colors">
                <FiChevronLeft size={13} /> {language === 'ne' ? 'अघिल्लो' : 'Previous'}
              </button>
              <span className="text-xs text-gray-400 dark:text-gray-700">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 disabled:opacity-30 transition-colors">
                {language === 'ne' ? 'अर्को' : 'Next'} <FiChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
