'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/Providers';
import { FiDownload, FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { HiOutlineBookOpen, HiOutlineSparkles } from 'react-icons/hi';
import PublicationCard, { Publication } from '@/components/ui/PublicationCard';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Profile {
  name: { en: string; ne?: string };
  title: { en: string; ne?: string };
  bio: { en: string; ne?: string };
  email: string;
  location: { en: string; ne?: string };
  cvUrl?: string;
  researchInterests: { en: string[] };
}

const HOME_STATS = [
  { key: 'home.publications',  value: '42' },
  { key: 'home.downloads',     value: '1.2k' },
  { key: 'home.yearsActive',   value: '15' },
  { key: 'home.collaborators', value: '8' },
];

export default function Home() {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featured, setFeatured] = useState<Publication[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => null);

    fetch('/api/publications?featured=true&limit=2')
      .then((r) => r.json())
      .then((d) => setFeatured(d.publications ?? []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  const name = profile
    ? (language === 'ne' && profile.name.ne ? profile.name.ne : profile.name.en)
    : (language === 'ne' ? 'प्रा. ध्रुव प्रसाद भट्टराई' : 'Prof. Dhruba Prasad Bhattarai');

  const bio = profile
    ? (language === 'ne' && profile.bio.ne ? profile.bio.ne : profile.bio.en)
    : null;

  const location = profile
    ? (language === 'ne' && profile.location.ne ? profile.location.ne : profile.location.en)
    : (language === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal');

  const email = profile?.email || '';
  const initials = language === 'ne' ? 'ध.भ.' : 'DB';

  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 text-center border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-maroon-50 dark:bg-maroon-950 mx-auto mb-6 flex items-center justify-center text-3xl font-semibold text-maroon-700 dark:text-maroon-400">
            {initials}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-3">
            {name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {['Applied science', 'Policy research', 'Development studies'].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-gold-100 dark:bg-gold-900 text-gold-600 dark:text-gold-300">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
            >
              <HiOutlineBookOpen size={16} />
              {t('home.browseResearch')}
            </Link>
            {profile?.cvUrl && (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <FiDownload size={16} />
                {t('home.downloadCV')}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4">
          {HOME_STATS.map((stat, i) => (
            <div key={i} className="text-center py-8 border-r last:border-r-0 border-gray-200 dark:border-gray-800">
              <StatCard label={t(stat.key)} value={stat.value} />
            </div>
          ))}
        </div>
      </section>

      {/* Featured Research */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HiOutlineSparkles className="text-gold-500" size={18} />
              {t('home.featuredResearch')}
            </h2>
            <Link href="/research" className="text-sm text-maroon-700 dark:text-maroon-400 flex items-center gap-1 hover:underline">
              {t('home.viewAll')} <FiArrowRight size={14} />
            </Link>
          </div>
          {loadingFeatured ? (
            <LoadingSpinner />
          ) : featured.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No featured publications yet.</p>
          ) : (
            <div className="space-y-4">
              {featured.map((pub) => (
                <PublicationCard key={pub._id} publication={pub} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About preview */}
      <section className="py-12 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('home.about')}</h2>
            <Link href="/about" className="text-sm text-maroon-700 dark:text-maroon-400 flex items-center gap-1 hover:underline">
              {t('home.readMore')} <FiArrowRight size={14} />
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {bio ?? 'Professor Dhruba Prasad Bhattarai is a researcher and scholar based in Nepal with over 15 years of experience in applied research.'}
          </p>
        </div>
      </section>

      {/* Contact preview */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('home.getInTouch')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-[var(--surface)] rounded-lg p-4">
              <FiMail className="text-maroon-700 dark:text-maroon-400" size={20} />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('home.email')}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{email}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[var(--surface)] rounded-lg p-4">
              <FiMapPin className="text-maroon-700 dark:text-maroon-400" size={20} />
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-500">{t('home.location')}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">{location}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
