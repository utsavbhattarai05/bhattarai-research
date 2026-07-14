'use client';
import { pickText } from '@/utils/pickText';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft, FiDownload, FiExternalLink,
  FiCalendar, FiUsers, FiLoader,
} from 'react-icons/fi';
import { useLanguage } from '@/components/Providers';
import { useSession } from 'next-auth/react';
import { useDownload } from '@/hooks/useDownload';
import TagBadge from '@/components/ui/TagBadge';
import ShareButton from '@/components/ui/ShareButton';
import CiteModal from '@/components/ui/CiteModal';
import PublicationCard, { Publication } from '@/components/ui/PublicationCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TYPE_LABELS: Record<string, { en: string; ne: string }> = {
  journal:       { en: 'Journal article',  ne: 'जर्नल लेख' },
  conference:    { en: 'Conference paper', ne: 'सम्मेलन पत्र' },
  book_chapter:  { en: 'Book chapter',     ne: 'पुस्तक अध्याय' },
  working_paper: { en: 'Working paper',    ne: 'कार्यपत्र' },
  thesis:        { en: 'Thesis',           ne: 'शोधपत्र' },
  other:         { en: 'Publication',      ne: 'प्रकाशन' },
};

interface Props {
  slug: string;
  /** When set, overrides the global language context (used by the /ne/ route). */
  forceLang?: 'en' | 'ne';
}

export default function PublicationDetail({ slug, forceLang }: Props) {
  const { language: ctxLang, setLanguage, t } = useLanguage();
  const { data: session } = useSession();
  const { download, states } = useDownload();

  // Force language on the /ne/ route on first render
  useEffect(() => {
    if (forceLang) setLanguage(forceLang);
  }, [forceLang, setLanguage]);

  const language = forceLang ?? ctxLang;

  const [publication, setPublication] = useState<Publication & {
    abstract: { en: string; ne?: string };
    doi?: string;
    externalUrl?: string;
    published: boolean;
  } | null>(null);
  const [related, setRelated]   = useState<Publication[]>([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [citeOpen, setCiteOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/publications/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setPublication(d.publication);
        setRelated(d.related ?? []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner text={language === 'ne' ? 'लोड हुँदैछ…' : 'Loading publication…'} />;

  if (notFound || !publication) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">📄</p>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {language === 'ne' ? 'प्रकाशन फेला परेन' : 'Publication not found'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {language === 'ne'
            ? 'यो प्रकाशन हटाइएको वा लिंक गलत हुन सक्छ।'
            : 'This publication may have been removed or the link is incorrect.'}
        </p>
        <Link href="/research" className="text-sm text-maroon-700 dark:text-maroon-400 hover:underline">
          ← {language === 'ne' ? 'अनुसन्धानमा फर्कनुस्' : 'Back to research'}
        </Link>
      </div>
    );
  }

  const title    = pickText(publication.title, language);
  const abstract = pickText(publication.abstract, language);
  const dlState  = states[publication._id] ?? 'idle';
  const pageUrl  = typeof window !== 'undefined' ? window.location.href : '';
  const typeLabel = (TYPE_LABELS[publication.type] ?? TYPE_LABELS.other)[language as 'en' | 'ne'];

  // Cross-language link in the top bar
  const altLangHref = language === 'ne'
    ? `/research/${slug}`
    : `/ne/research/${slug}`;
  const altLangLabel = language === 'ne' ? 'English' : 'नेपाली';

  return (
    <>
      <CiteModal publication={citeOpen ? publication : null} onClose={() => setCiteOpen(false)} />

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Back + language switcher */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
          >
            <FiArrowLeft size={14} /> {t('common.back')} {language === 'ne' ? 'अनुसन्धान' : 'to research'}
          </Link>
          <Link
            href={altLangHref}
            className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-maroon-600 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
          >
            {altLangLabel} →
          </Link>
        </div>

        {/* Type & year badge */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gold-100 dark:bg-gold-900 text-gold-600 dark:text-gold-300">
            {typeLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <FiCalendar size={11} /> {publication.year}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-4">
          {title}
        </h1>

        {/* Authors & journal */}
        <div className="space-y-1 mb-6">
          <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <FiUsers size={14} className="flex-shrink-0 mt-0.5" />
            {publication.authors.join(', ')}
          </p>
          <p className="text-sm font-medium text-maroon-700 dark:text-maroon-400 pl-5">
            {publication.journal}
          </p>
          {publication.doi && (
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors pl-5"
            >
              <FiExternalLink size={11} /> DOI: {publication.doi}
            </a>
          )}
        </div>

        {/* Tags */}
        {publication.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {publication.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 pb-6 mb-8 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => download(publication._id, publication.title.en)}
            disabled={dlState === 'loading'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dlState === 'done'
                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
                : dlState === 'error'
                ? 'bg-red-100 dark:bg-red-950 text-red-600'
                : 'bg-maroon-700 dark:bg-maroon-600 text-white hover:bg-maroon-800 dark:hover:bg-maroon-700'
            } disabled:opacity-60`}
          >
            {dlState === 'loading'
              ? <FiLoader size={14} className="animate-spin" />
              : <FiDownload size={14} />}
            {dlState === 'done'
              ? (language === 'ne' ? 'डाउनलोड भयो!' : 'Downloaded!')
              : dlState === 'error'
              ? (language === 'ne' ? 'असफल' : 'Failed')
              : session
              ? t('research.downloadPDF')
              : t('research.loginToDownload')}
          </button>

          <button
            onClick={() => setCiteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            {t('research.cite')}
          </button>

          {publication.externalUrl && (
            <a
              href={publication.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              <FiExternalLink size={14} /> {language === 'ne' ? 'प्रकाशकमा हेर्नुस्' : 'View on publisher'}
            </a>
          )}

          <div className="ml-auto">
            <ShareButton title={title} url={pageUrl} label={t('research.share')} />
          </div>
        </div>

        {/* Abstract */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-3">
            {t('research.abstract')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {abstract}
          </p>
        </div>

        {/* Download count */}
        <div className="text-xs text-gray-400 mb-12">
          {publication.downloadCount} {t('research.downloads')}
        </div>

        {/* Related publications */}
        {related.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {t('research.relatedResearch')}
            </h2>
            <div className="space-y-3">
              {related.map((pub) => (
                <PublicationCard key={pub._id} publication={pub} />
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}
