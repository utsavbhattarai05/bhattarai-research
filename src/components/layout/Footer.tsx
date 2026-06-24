'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiLinkedin, FiGlobe, FiMail } from 'react-icons/fi';
import { FaResearchgate, FaFacebook } from 'react-icons/fa';
import { LogoSeal } from '@/components/ui/Logo';

interface SocialLinks {
  linkedin?:      string;
  googleScholar?: string;
  researchGate?:  string;
  website?:       string;
  facebook?:      string;
  email?:         string;
}

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [links, setLinks] = useState<SocialLinks>({});

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then(({ profile }) => {
        if (profile) {
          setLinks({
            ...profile.socialLinks,
            email: profile.email,
          });
        }
      })
      .catch(() => null);
  }, []);

  const socials = [
    links.linkedin      && { href: links.linkedin,      icon: <FiLinkedin size={18} />,   label: 'LinkedIn' },
    links.googleScholar && { href: links.googleScholar, icon: <FiGlobe size={18} />,       label: 'Google Scholar' },
    links.researchGate  && { href: links.researchGate,       icon: <FaResearchgate size={18} />, label: 'ResearchGate' },
    links.facebook      && { href: links.facebook,           icon: <FaFacebook size={18} />,    label: 'Facebook' },
    links.website       && { href: links.website,            icon: <FiGlobe size={18} />,       label: 'Website' },
    links.email         && { href: `mailto:${links.email}`,  icon: <FiMail size={18} />,        label: 'Email' },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

  // Fallback: show email icon if no profile loaded yet
  const displayLinks = socials.length > 0 ? socials : [
    { href: 'mailto:', icon: <FiMail size={18} />, label: 'Email' },
  ];

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Logo + copyright */}
          <div className="flex items-center gap-3">
            <LogoSeal size={28} />
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {t('footer.copyright').replace('{year}', year.toString())}
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4">
            {displayLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('mailto') ? undefined : '_blank'}
                rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                className="text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Built with */}
          <div className="text-xs text-gray-400 dark:text-gray-600">
            {t('footer.builtWith')}
          </div>

        </div>
      </div>
    </footer>
  );
}
