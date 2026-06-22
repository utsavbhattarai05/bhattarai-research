'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/components/Providers';
import {
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineHeart,
} from 'react-icons/hi';

export interface Milestone {
  _id?: string;
  year: string;
  title: { en: string; ne?: string };
  description: { en: string; ne?: string };
  category: 'early_life' | 'education' | 'career' | 'research' | 'achievement';
  isCurrent: boolean;
  sortOrder?: number;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  early_life:  { bg: 'bg-pink-50 dark:bg-pink-950',   text: 'text-pink-700 dark:text-pink-300' },
  education:   { bg: 'bg-blue-50 dark:bg-blue-950',   text: 'text-blue-700 dark:text-blue-300' },
  career:      { bg: 'bg-gold-50 dark:bg-gold-900',   text: 'text-gold-600 dark:text-gold-300' },
  research:    { bg: 'bg-maroon-50 dark:bg-maroon-950', text: 'text-maroon-700 dark:text-maroon-400' },
  achievement: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300' },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  early_life:  <HiOutlineHeart size={14} />,
  education:   <HiOutlineAcademicCap size={14} />,
  career:      <HiOutlineBriefcase size={14} />,
  research:    <HiOutlineDocumentText size={14} />,
  achievement: <HiOutlineStar size={14} />,
};

interface TimelineItemProps {
  milestone: Milestone;
  index: number;
}

export default function TimelineItem({ milestone, index }: TimelineItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { language, t } = useLanguage();
  const style = CATEGORY_STYLES[milestone.category];

  const title = language === 'ne' && milestone.title.ne
    ? milestone.title.ne
    : milestone.title.en;

  const description = language === 'ne' && milestone.description.ne
    ? milestone.description.ne
    : milestone.description.en;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex gap-4 relative"
    >
      <div className="flex flex-col items-center flex-shrink-0 w-8 z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`w-4 h-4 rounded-full border-[2.5px] flex-shrink-0 ${
            milestone.isCurrent
              ? 'w-5 h-5 bg-maroon-700 dark:bg-maroon-500 border-maroon-200 dark:border-maroon-900 ring-2 ring-maroon-700 dark:ring-maroon-500 animate-pulse'
              : milestone.category === 'career' || milestone.category === 'early_life'
              ? 'bg-white dark:bg-gray-950 border-gold-500'
              : 'bg-white dark:bg-gray-950 border-maroon-700 dark:border-maroon-500'
          }`}
        />
      </div>

      <div
        className={`flex-1 rounded-lg p-4 mb-6 transition-colors ${
          milestone.isCurrent
            ? 'bg-maroon-50 dark:bg-maroon-950/50 border border-maroon-200 dark:border-maroon-800'
            : 'bg-[var(--surface)] hover:bg-gray-100 dark:hover:bg-gray-900'
        }`}
      >
        <div
          className={`text-xs font-medium mb-1 ${
            milestone.category === 'career' || milestone.category === 'early_life'
              ? 'text-gold-500'
              : 'text-maroon-700 dark:text-maroon-400'
          }`}
        >
          {milestone.isCurrent ? `${milestone.year} — Present` : milestone.year}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          {CATEGORY_ICONS[milestone.category]}
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        <div className="mt-3 flex gap-1.5">
          <span className={`text-[10px] px-2 py-0.5 rounded ${style.bg} ${style.text}`}>
            {t(`journey.${milestone.category}`)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
