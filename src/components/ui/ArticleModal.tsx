import { pickText } from '@/utils/pickText';
'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import { Publication } from './PublicationCard';
import ShareButton from './ShareButton';
import { useDownload } from '@/hooks/useDownload';

interface ArticleModalProps {
  pub: Publication | null;
  language: string;
  onClose: () => void;
  onCite: (p: Publication) => void;
}

export default function ArticleModal({ pub, language, onClose, onCite }: ArticleModalProps) {
  const { download, states } = useDownload();

  useEffect(() => {
    if (!pub) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [pub, onClose]);

  if (!pub) return null;

  const dlState   = states[pub._id] ?? 'idle';
  const title     = pickText(pub.title, language);
  const abstract  = pickText(pub.abstract, language);
  const url       = typeof window !== 'undefined' ? `${window.location.origin}/research/${pub.slug}` : '';
  const typeIcon  = pub.type === 'journal' ? '📰' : pub.type === 'conference' ? '🎤' : pub.type === 'book_chapter' ? '📗' : '📄';
  const typeLabel = pub.type.replace(/_/g, ' ');

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl"
          style={{ maxWidth: '70vw' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-maroon-700 dark:bg-maroon-900 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] text-maroon-200/60 uppercase tracking-widest mb-1.5">
                  {typeIcon} {typeLabel} · {pub.year}
                </p>
                <h2 className="text-lg font-semibold text-maroon-50 leading-snug" style={{ fontFamily: 'Georgia, serif' }}>
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-maroon-200 hover:bg-white/20 transition-colors"
              >
                <FiX size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Authors & journal */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pub.authors.join(', ')} · <span className="italic">{pub.journal}</span>
            </p>

            {/* Abstract */}
            {abstract && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                  {language === 'ne' ? 'सारांश' : 'Abstract'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5">
                  {abstract}
                </p>
              </div>
            )}

            {/* Tags */}
            {pub.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pub.tags.map((tag) => (
                  <span key={tag}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <p className="text-[11px] text-gray-400 dark:text-gray-600">
              {pub.downloadCount} {language === 'ne' ? 'डाउनलोड' : 'downloads'}
              {pub.doi && <> · DOI: <span className="font-mono">{pub.doi}</span></>}
            </p>
          </div>

          {/* Actions */}
          <div className="px-6 pb-5 flex gap-2">
            <button
              onClick={() => download(pub._id, pickText(pub.title, 'en'))}
              disabled={dlState === 'loading'}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                dlState === 'done'
                  ? 'bg-green-600 text-white'
                  : 'bg-maroon-700 dark:bg-maroon-600 hover:bg-maroon-800 dark:hover:bg-maroon-700 text-white'
              }`}
            >
              <FiDownload size={14} />
              {dlState === 'loading'
                ? '...'
                : dlState === 'done'
                ? (language === 'ne' ? 'डाउनलोड भयो!' : 'Downloaded!')
                : (language === 'ne' ? 'PDF डाउनलोड' : 'Download PDF')}
            </button>

            <button
              onClick={() => { onCite(pub); onClose(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              {language === 'ne' ? 'उद्धरण' : 'Cite'}
            </button>

            <div className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <ShareButton title={title} url={url} label={language === 'ne' ? 'साझा' : 'Share'} />
            </div>

            {pub.doi && (
              <a
                href={`https://doi.org/${pub.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                aria-label="View on publisher site"
              >
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
