'use client';
import { pickText } from '@/utils/pickText';

import { useState } from 'react';
import Link from 'next/link';
import { FiDownload, FiLoader } from 'react-icons/fi';
import TagBadge from './TagBadge';
import ShareButton from './ShareButton';
import CiteModal from './CiteModal';
import { useLanguage } from '@/components/Providers';
import { useSession } from 'next-auth/react';
import { useDownload } from '@/hooks/useDownload';

export interface Publication {
  _id: string;
  slug: string;
  title: { en: string; ne?: string };
  abstract: { en: string; ne?: string };
  authors: string[];
  year: number;
  type: string;
  journal: string;
  tags: string[];
  downloadCount: number;
  featured?: boolean;
  doi?: string;
}

interface PublicationCardProps {
  publication: Publication;
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  const { language, t } = useLanguage();
  const { data: session } = useSession();
  const { download, states } = useDownload();
  const [citeOpen, setCiteOpen] = useState(false);

  const dlState = states[publication._id] ?? 'idle';

  const title = language === 'ne' && publication.title.ne
    ? publication.title.ne
    : publication.title.en;

  const abstract = language === 'ne' && publication.abstract.ne
    ? publication.abstract.ne
    : publication.abstract.en;

  return (
    <>
    <CiteModal publication={citeOpen ? publication : null} onClose={() => setCiteOpen(false)} />
    <div className="bg-[var(--surface)] rounded-lg p-5 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
      <div className="text-xs text-gold-500 font-medium mb-1">
        {t(`research.${publication.type}`)} · {publication.year}
      </div>

      <Link href={`/research/${publication.slug}`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors">
          {title}
        </h3>
      </Link>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {publication.authors.join(', ')} · {publication.journal}
      </p>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">
        {abstract}
      </p>

      {publication.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {publication.tags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => download(publication._id, pickText(publication.title, 'en'))}
            disabled={dlState === 'loading'}
            className={`flex items-center gap-1 transition-colors ${
              dlState === 'done'
                ? 'text-green-600 dark:text-green-400'
                : dlState === 'error'
                ? 'text-red-500'
                : 'text-maroon-700 dark:text-maroon-400 hover:underline'
            } disabled:opacity-60`}
          >
            {dlState === 'loading'
              ? <FiLoader size={12} className="animate-spin" />
              : <FiDownload size={12} />}
            {dlState === 'done'
              ? 'Downloaded!'
              : dlState === 'error'
              ? 'Failed'
              : session
              ? t('research.downloadPDF')
              : t('research.loginToDownload')}
          </button>
          <button
            onClick={() => setCiteOpen(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {t('research.cite')}
          </button>
          <ShareButton
            title={title}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/research/${publication.slug}`}
            label={t('research.share')}
          />
        </div>
        <span className="text-[10px] text-gray-400">
          {publication.downloadCount} {t('research.downloads')}
        </span>
      </div>
    </div>
    </>
  );
}
