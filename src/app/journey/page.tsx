'use client';
import { pickText } from '@/utils/pickText';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/Providers';
import { Milestone } from '@/components/ui/TimelineItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CHAPTERS: { key: string; icon: string; label: string; short: string }[] = [
  { key: 'early_life',  icon: '🌱', label: 'Beginnings', short: 'Ch.1' },
  { key: 'education',   icon: '📚', label: 'Education',  short: 'Ch.2' },
  { key: 'career',      icon: '💼', label: 'Career',     short: 'Ch.3' },
  { key: 'research',    icon: '🔬', label: 'Research',   short: 'Ch.4' },
  { key: 'achievement', icon: '🏆', label: 'Legacy',     short: 'Ch.5' },
];

const CHAPTER_COLORS: Record<string, { text: string; accent: string; light: string }> = {
  early_life:  { text: 'text-pink-700 dark:text-pink-300',   accent: '#be185d', light: '#fdf2f8' },
  education:   { text: 'text-blue-700 dark:text-blue-300',   accent: '#1d4ed8', light: '#eff6ff' },
  career:      { text: 'text-amber-700 dark:text-amber-300', accent: '#b45309', light: '#fffbeb' },
  research:    { text: 'text-maroon-700 dark:text-maroon-400', accent: '#8B1A1A', light: '#fdf2f2' },
  achievement: { text: 'text-green-700 dark:text-green-300', accent: '#15803d', light: '#f0fdf4' },
};

export default function JourneyPage() {
  const { language } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    fetch('/api/milestones')
      .then((r) => r.json())
      .then((d) => {
        const ms: Milestone[] = d.milestones ?? [];
        setMilestones(ms);
        // Open chapter that has a current milestone
        const currentMs = ms.find((m) => m.isCurrent);
        if (currentMs) {
          const idx = CHAPTERS.findIndex((c) => c.key === currentMs.category);
          if (idx !== -1) setActiveChapter(idx);
        }
      })
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, []);

  const chapterMilestones = milestones.filter(
    (m) => m.category === CHAPTERS[activeChapter].key
  );
  const colors = CHAPTER_COLORS[CHAPTERS[activeChapter].key];
  const progress = ((activeChapter + 1) / CHAPTERS.length) * 100;

  const pick = (field: { en: string; ne?: string }) =>
    language === 'ne' && field.ne ? field.ne : field.en;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {loading ? <LoadingSpinner /> : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm"
        >
          {/* Book header */}
          <div className="bg-maroon-700 dark:bg-maroon-900 px-6 py-4 text-center">
            <p className="text-xs text-maroon-200 dark:text-maroon-400 uppercase tracking-widest mb-1">
              The story of
            </p>
            <h2 className="text-lg font-semibold text-maroon-50 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
              Prof. Dhruba Prasad Bhattarai
            </h2>
          </div>

          {/* Chapter tabs */}
          <div className="grid grid-cols-5 border-b border-gray-200 dark:border-gray-800">
            {CHAPTERS.map((ch, i) => (
              <button
                key={ch.key}
                onClick={() => setActiveChapter(i)}
                className={`flex flex-col items-center gap-1 py-3 px-1 text-center transition-all border-r last:border-r-0 border-gray-200 dark:border-gray-800 ${
                  i === activeChapter
                    ? 'bg-maroon-700 dark:bg-maroon-900'
                    : 'bg-[var(--surface)] hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="text-[10px] font-medium" style={{ color: i === activeChapter ? 'rgba(243,237,224,0.5)' : '#aaa' }}>
                  {ch.short}
                </span>
                <span className="text-xl">{ch.icon}</span>
                <span className="text-[9px] font-medium" style={{ color: i === activeChapter ? 'rgba(243,237,224,0.8)' : '#aaa' }}>
                  {ch.label}
                </span>
              </button>
            ))}
          </div>

          {/* Chapter content */}
          <div className="bg-[var(--surface)] dark:bg-gray-900 min-h-[200px] p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {chapterMilestones.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-3 block">{CHAPTERS[activeChapter].icon}</span>
                    <p className="text-sm text-gray-400">No milestones in this chapter yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Add them from the admin dashboard.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {chapterMilestones.map((m, i) => (
                      <motion.div
                        key={m._id ?? i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-4"
                      >
                        {/* Year column */}
                        <div className="flex flex-col items-center flex-shrink-0 pt-1">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors.accent }} />
                          {i < chapterMilestones.length - 1 && (
                            <div className="w-px flex-1 mt-1" style={{ background: `${colors.accent}30`, minHeight: '40px' }} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="pb-2 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold" style={{ color: colors.accent }}>
                              {m.isCurrent ? `${m.year} — Present` : m.year}
                            </span>
                            {m.isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{ background: colors.light, color: colors.accent }}>
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse inline-block" style={{ background: colors.accent }} />
                                Now
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {pick(m.title)}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {pick(m.description)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation footer */}
          <div className="flex items-center justify-between px-6 py-3 bg-[var(--surface)] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveChapter((p) => Math.max(0, p - 1))}
              disabled={activeChapter === 0}
              className="text-xs px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <span className="text-xs text-gray-400">
              Chapter {activeChapter + 1} of {CHAPTERS.length}
            </span>

            <button
              onClick={() => setActiveChapter((p) => Math.min(CHAPTERS.length - 1, p + 1))}
              disabled={activeChapter === CHAPTERS.length - 1}
              className="text-xs px-4 py-2 rounded-lg bg-maroon-700 dark:bg-maroon-600 text-white hover:bg-maroon-800 dark:hover:bg-maroon-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <motion.div
              className="h-full bg-maroon-600 dark:bg-maroon-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>
      )}

      {/* Quote */}
      {!loading && milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center py-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="text-3xl mb-4">✨</div>
          <p className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg mx-auto mb-3">
            &ldquo;The pursuit of knowledge is a journey without a destination — every answer opens a new question.&rdquo;
          </p>
          <span className="text-xs font-medium text-maroon-700 dark:text-maroon-400">
            — Prof. Dhruba Prasad Bhattarai
          </span>
        </motion.div>
      )}
    </div>
  );
}
