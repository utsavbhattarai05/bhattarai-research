'use client';
import { pickText } from '@/utils/pickText';

import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiCopy } from 'react-icons/fi';
import { Publication } from './PublicationCard';

interface CiteModalProps {
  publication: Publication | null;
  onClose: () => void;
}

type Format = 'APA' | 'Harvard' | 'MLA' | 'BibTeX';

// ── Citation generators ─────────────────────────────────────────────

function formatAuthorsAPA(authors: string[]): string {
  return authors
    .map((a) => {
      const parts = a.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const last = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
      return `${last}, ${initials}`;
    })
    .join(', ');
}

function formatAuthorsHarvard(authors: string[]): string {
  return authors
    .map((a, i) => {
      const parts = a.trim().split(/\s+/);
      if (parts.length === 1) return parts[0];
      const last = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join('');
      const formatted = `${last}, ${initials}`;
      if (authors.length > 1 && i === authors.length - 1) return `and ${formatted}`;
      return formatted;
    })
    .join(', ');
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return '';
  if (authors.length === 1) return authors[0];
  const parts = authors[0].trim().split(/\s+/);
  const firstLast = parts[parts.length - 1];
  const firstRest = parts.slice(0, -1).join(' ');
  const first = `${firstLast}, ${firstRest}`;
  if (authors.length === 2) return `${first}, and ${authors[1]}`;
  return `${first}, et al.`;
}

function bibtexKey(pub: Publication): string {
  const firstAuthor = pub.authors[0]?.split(/\s+/).pop()?.toLowerCase() ?? 'unknown';
  const firstWord   = pub.title.en.split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
  return `${firstAuthor}${pub.year}${firstWord}`;
}

function bibtexType(type: string): string {
  const map: Record<string, string> = {
    journal:       'article',
    conference:    'inproceedings',
    book_chapter:  'incollection',
    working_paper: 'techreport',
    thesis:        'phdthesis',
    other:         'misc',
  };
  return map[type] ?? 'misc';
}

function generateCitation(pub: Publication, format: Format): string {
  const { authors, year, title, journal, doi } = pub;
  const doiSuffix = doi ? ` https://doi.org/${doi}` : '';

  switch (format) {
    case 'APA': {
      const auth = formatAuthorsAPA(authors);
      return `${auth} (${year}). ${title.en}. *${journal}*.${doiSuffix}`;
    }
    case 'Harvard': {
      const auth = formatAuthorsHarvard(authors);
      return `${auth} (${year}) '${title.en}', *${journal}*.${doiSuffix}`;
    }
    case 'MLA': {
      const auth = formatAuthorsMLA(authors);
      return `${auth}. "${title.en}." *${journal}*, ${year}.${doiSuffix}`;
    }
    case 'BibTeX': {
      const authField = authors.join(' and ');
      return [
        `@${bibtexType(pub.type)}{${bibtexKey(pub)},`,
        `  title     = {${title.en}},`,
        `  author    = {${authField}},`,
        `  journal   = {${journal}},`,
        `  year      = {${year}},`,
        doi ? `  doi       = {${doi}},` : null,
        `}`,
      ].filter(Boolean).join('\n');
    }
  }
}

// ── Component ───────────────────────────────────────────────────────

const FORMATS: Format[] = ['APA', 'Harvard', 'MLA', 'BibTeX'];

export default function CiteModal({ publication, onClose }: CiteModalProps) {
  const [format, setFormat]   = useState<Format>('APA');
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = publication ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [publication]);

  if (!publication) return null;

  const citation = generateCitation(publication, format);

  const copy = async () => {
    // Strip markdown asterisks for plain-text copy
    await navigator.clipboard.writeText(citation.replace(/\*/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Cite this publication</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{pickText(publication.title, 'en')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <FiX size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => { setFormat(f); setCopied(false); }}
                className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-colors ${
                  format === f
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Citation text */}
          <div className="relative bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 min-h-[100px]">
            {format === 'BibTeX' ? (
              <pre className="text-xs text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                {citation}
              </pre>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {citation.split('*').map((part, i) =>
                  i % 2 === 1
                    ? <em key={i}>{part}</em>
                    : <span key={i}>{part}</span>
                )}
              </p>
            )}
          </div>

          {/* Copy button */}
          <button
            onClick={copy}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              copied
                ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
                : 'bg-maroon-700 dark:bg-maroon-600 text-white hover:bg-maroon-800 dark:hover:bg-maroon-700'
            }`}
          >
            {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
            {copied ? 'Copied to clipboard!' : `Copy ${format} citation`}
          </button>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-400 pt-1">
            <span><span className="font-medium text-gray-500 dark:text-gray-500">Authors:</span> {publication.authors.join(', ')}</span>
            <span><span className="font-medium text-gray-500 dark:text-gray-500">Year:</span> {publication.year}</span>
            {publication.downloadCount !== undefined && (
              <span><span className="font-medium text-gray-500 dark:text-gray-500">Downloads:</span> {publication.downloadCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
