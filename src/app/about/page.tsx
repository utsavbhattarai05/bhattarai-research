'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiDownload, FiMail, FiLinkedin, FiGlobe } from 'react-icons/fi';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Profile {
  name:              { en: string; ne?: string };
  title:             { en: string; ne?: string };
  bio:               { en: string; ne?: string };
  researchInterests: { en: string[]; ne?: string[] };
  photoUrl?:         string;
  cvUrl?:            string;
  email:             string;
  location:          { en: string; ne?: string };
  quote?:            { en?: string; ne?: string };
  socialLinks?: {
    linkedin?:      string;
    googleScholar?: string;
    researchGate?:  string;
    website?:       string;
  };
}

// Fallback values shown until profile is loaded from DB
const FALLBACK: Profile = {
  name:              { en: 'Prof. Dhruba Prasad Bhattarai', ne: 'प्रा. ध्रुव प्रसाद भट्टराई' },
  title:             { en: 'Researcher · Scholar · Nepal', ne: 'अनुसन्धानकर्ता · विद्वान · नेपाल' },
  bio:               { en: 'Professor Dhruba Prasad Bhattarai is a researcher and scholar based in Nepal with over 15 years of experience in applied research. His work spans sustainable development, economic policy, and social impact studies across South Asia.' },
  researchInterests: { en: ['Sustainable development', 'Economic policy', 'Rural development', 'Microfinance', 'Climate adaptation', 'Digital literacy', 'Social impact', 'Development studies'] },
  email:             'dp.bhattarai@email.com',
  location:          { en: 'Kathmandu, Nepal', ne: 'काठमाडौं, नेपाल' },
};

export default function AboutPage() {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const p = profile ?? FALLBACK;

  const pick = (field: { en: string; ne?: string } | undefined) =>
    field ? (language === 'ne' && field.ne ? field.ne : field.en) : '';

  const name      = pick(p.name);
  const title     = pick(p.title);
  const bio       = pick(p.bio);
  const location  = pick(p.location);
  const interests = language === 'ne' && p.researchInterests.ne?.length
    ? p.researchInterests.ne
    : p.researchInterests.en;
  const quote     = p.quote ? pick(p.quote as any) : null;
  const initials  = language === 'ne' ? 'ध.भ.' : 'DB';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-10">
        {p.photoUrl ? (
          <img
            src={p.photoUrl}
            alt={name}
            className="w-28 h-28 rounded-full object-cover mx-auto mb-6 ring-4 ring-maroon-100 dark:ring-maroon-900"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-maroon-50 dark:bg-maroon-950 mx-auto mb-6 flex items-center justify-center text-4xl font-semibold text-maroon-700 dark:text-maroon-400">
            {initials}
          </div>
        )}

        {loading ? (
          <div className="h-8 w-64 bg-gray-100 dark:bg-gray-800 rounded-lg mx-auto mb-2 animate-pulse" />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            {name}
          </h1>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{location}</p>
      </div>

      {/* Bio */}
      {loading ? (
        <div className="space-y-3 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" style={{ width: `${90 - i * 10}%` }} />
          ))}
        </div>
      ) : (
        <div className="mb-10 space-y-4">
          {bio.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Research interests */}
      {interests.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('about.researchInterests')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="text-xs px-3 py-1.5 rounded-full bg-gold-50 dark:bg-gold-900 text-gold-600 dark:text-gold-300 border border-gold-200 dark:border-gold-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quote */}
      {quote && (
        <blockquote className="mb-10 border-l-4 border-maroon-200 dark:border-maroon-800 pl-4 py-1">
          <p className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed">
            &ldquo;{quote}&rdquo;
          </p>
        </blockquote>
      )}

      {/* Contact & links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
        <a
          href={`mailto:${p.email}`}
          className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-maroon-300 dark:hover:border-maroon-700 transition-colors"
        >
          <FiMail className="text-maroon-700 dark:text-maroon-400 flex-shrink-0" size={16} />
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t('home.email')}</p>
            <p className="text-xs font-medium text-gray-900 dark:text-white">{p.email}</p>
          </div>
        </a>

        {p.socialLinks?.linkedin && (
          <a href={p.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-maroon-300 dark:hover:border-maroon-700 transition-colors">
            <FiLinkedin className="text-blue-600 flex-shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">LinkedIn</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">View profile</p>
            </div>
          </a>
        )}

        {p.socialLinks?.googleScholar && (
          <a href={p.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-maroon-300 dark:hover:border-maroon-700 transition-colors">
            <FiGlobe className="text-maroon-700 dark:text-maroon-400 flex-shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Google Scholar</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">View publications</p>
            </div>
          </a>
        )}

        {p.socialLinks?.researchGate && (
          <a href={p.socialLinks.researchGate} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-maroon-300 dark:hover:border-maroon-700 transition-colors">
            <FiGlobe className="text-green-600 flex-shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">ResearchGate</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">View profile</p>
            </div>
          </a>
        )}

        {p.socialLinks?.website && (
          <a href={p.socialLinks.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] rounded-xl border border-gray-200 dark:border-gray-800 hover:border-maroon-300 dark:hover:border-maroon-700 transition-colors">
            <FiGlobe className="text-gray-500 flex-shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Website</p>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Visit site</p>
            </div>
          </a>
        )}
      </div>

      {/* CV download */}
      {p.cvUrl && (
        <div className="text-center">
          <a
            href={p.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
          >
            <FiDownload size={16} />
            {t('about.downloadCV')}
          </a>
        </div>
      )}
    </div>
  );
}
