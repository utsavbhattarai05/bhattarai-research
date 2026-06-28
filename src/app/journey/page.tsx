import { pickText } from '@/utils/pickText';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/components/Providers';
import { Milestone } from '@/components/ui/TimelineItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const CATEGORY_CONFIG: Record<string, {
  emoji: string;
  bg: string;
  text: string;
  border: string;
  label: string;
}> = {
  early_life:  { emoji: '🌱', bg: 'bg-pink-50 dark:bg-pink-950',    text: 'text-pink-700 dark:text-pink-300',     border: 'border-pink-200 dark:border-pink-800',   label: 'Early life' },
  education:   { emoji: '📚', bg: 'bg-blue-50 dark:bg-blue-950',    text: 'text-blue-700 dark:text-blue-300',     border: 'border-blue-200 dark:border-blue-800',   label: 'Education' },
  career:      { emoji: '💼', bg: 'bg-gold-50 dark:bg-gold-900',    text: 'text-gold-700 dark:text-gold-300',     border: 'border-gold-200 dark:border-gold-800',   label: 'Career' },
  research:    { emoji: '🔬', bg: 'bg-maroon-50 dark:bg-maroon-950', text: 'text-maroon-700 dark:text-maroon-400', border: 'border-maroon-200 dark:border-maroon-800', label: 'Research' },
  achievement: { emoji: '🏆', bg: 'bg-green-50 dark:bg-green-950',  text: 'text-green-700 dark:text-green-300',   border: 'border-green-200 dark:border-green-800', label: 'Achievement' },
};

function MilestoneCard({ milestone, index, isOpen, onToggle, language }: {
  milestone: Milestone;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  language: string;
}) {
  const cfg = CATEGORY_CONFIG[milestone.category] ?? CATEGORY_CONFIG.career;
  const title = pickText(milestone.title, language);
  const description = language === 'ne' && milestone.description.ne ? milestone.description.ne : milestone.description.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <button
        onClick={onToggle}
        className={`w-full text-left rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          isOpen
            ? `${cfg.bg} ${cfg.border}`
            : 'bg-[var(--surface)] border-transparent hover:border-gray-200 dark:hover:border-gray-700'
        } ${milestone.isCurrent ? 'ring-2 ring-maroon-400 dark:ring-maroon-500' : ''}`}
      >
        {/* Card header — always visible */}
        <div className="flex items-center gap-4 p-4">
          {/* Emoji bubble */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-all duration-300 ${
            isOpen ? 'scale-110' : ''
          } ${cfg.bg} border ${cfg.border}`}>
            {cfg.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-semibold ${cfg.text}`}>
                {milestone.isCurrent ? `${milestone.year} — Present` : milestone.year}
              </span>
              {milestone.isCurrent && (
                <span className="flex items-center gap-1 text-[10px] bg-maroon-100 dark:bg-maroon-900 text-maroon-700 dark:text-maroon-300 px-2 py-0.5 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-maroon-500 animate-pulse inline-block" />
                  Now
                </span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug truncate">
              {title}
            </h3>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className={`text-lg flex-shrink-0 ${cfg.text}`}
          >
            ↓
          </motion.div>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0">
                <div className={`h-px ${cfg.border} border-t mb-3`} />
                <p className={`text-sm leading-relaxed ${cfg.text} opacity-80`}>
                  {description}
                </p>
                <div className="mt-3">
                  <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function JourneyPage() {
  const { language, t } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/milestones')
      .then((r) => r.json())
      .then((d) => {
        const ms = d.milestones ?? [];
        setMilestones(ms);
        // Auto-open current milestone
        const currentIdx = ms.findIndex((m: Milestone) => m.isCurrent);
        if (currentIdx !== -1) setOpenIndex(currentIdx);
      })
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['all', ...Array.from(new Set(milestones.map((m) => m.category)))];
  const filtered = filter === 'all' ? milestones : milestones.filter((m) => m.category === filter);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-4xl mb-3"
        >
          🗺️
        </motion.div>
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-semibold mb-2">
          {t('journey.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          {t('journey.subtitle')}
        </p>
      </motion.div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Category filter pills */}
          {milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 justify-center mb-8"
            >
              {categories.map((cat) => {
                const cfg = cat === 'all' ? null : CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => { setFilter(cat); setOpenIndex(null); }}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                      filter === cat
                        ? cfg
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} scale-105`
                          : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent scale-105'
                        : 'bg-[var(--surface)] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:scale-105'
                    }`}
                  >
                    {cfg && <span>{cfg.emoji}</span>}
                    {cat === 'all' ? 'All chapters' : cfg?.label ?? cat}
                  </button>
                );
              })}
            </motion.div>
          )}

          {/* Count */}
          {milestones.length > 0 && (
            <p className="text-xs text-gray-400 text-center mb-6">
              {filtered.length} chapter{filtered.length !== 1 ? 's' : ''} in this story
            </p>
          )}

          {/* Cards */}
          <div className="space-y-3">
            {filtered.map((milestone, i) => (
              <MilestoneCard
                key={milestone._id ?? i}
                milestone={milestone}
                index={i}
                isOpen={openIndex === milestones.indexOf(milestone)}
                onToggle={() => {
                  const realIdx = milestones.indexOf(milestone);
                  setOpenIndex(openIndex === realIdx ? null : realIdx);
                }}
                language={language}
              />
            ))}
          </div>

          {/* Quote footer */}
          {milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mt-14 text-center py-8 border-t border-gray-200 dark:border-gray-800"
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
        </>
      )}
    </div>
  );
}
