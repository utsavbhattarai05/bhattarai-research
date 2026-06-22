'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/Providers';
import { HiOutlineGlobeAlt } from 'react-icons/hi';
import TimelineItem, { Milestone } from '@/components/ui/TimelineItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

export default function JourneyPage() {
  const { t } = useLanguage();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/milestones')
      .then((r) => r.json())
      .then((d) => setMilestones(d.milestones ?? []))
      .catch(() => setMilestones([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
          <HiOutlineGlobeAlt className="text-gold-500" size={24} />
          {t('journey.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          {t('journey.subtitle')}
        </p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-4 text-xs text-maroon-700 dark:text-maroon-400"
        >
          ↓ {t('journey.scrollToExplore')}
        </motion.div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : milestones.length === 0 ? (
        <EmptyState message="No milestones found." />
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-maroon-700 via-gold-500 to-maroon-700 dark:from-maroon-500 dark:via-gold-400 dark:to-maroon-500" />
          {milestones.map((milestone, i) => (
            <TimelineItem key={milestone._id ?? i} milestone={milestone} index={i} />
          ))}
        </div>
      )}

      {!loading && milestones.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 text-center py-8 border-t border-gray-200 dark:border-gray-800"
        >
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
