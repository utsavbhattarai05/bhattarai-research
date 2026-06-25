'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useLanguage, useSignIn } from '@/components/Providers';
import { useState, useEffect } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';
import Logo from '@/components/ui/Logo';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { openSignIn } = useSignIn();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isAdmin = (session?.user as any)?.role === 'admin';

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/research', label: t('nav.research') },
    { href: '/journey', label: t('nav.journey') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size={36} variant="full" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm text-maroon-700 dark:text-maroon-400 font-medium"
              >
                {t('nav.admin')}
              </Link>
            )}

            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {language === 'en' ? (
                <>EN | <span className="font-medium text-maroon-700 dark:text-maroon-400">ने</span></>
              ) : (
                <><span className="font-medium text-maroon-700 dark:text-maroon-400">EN</span> | ने</>
              )}
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />)}
            </button>

            {/* Auth */}
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-maroon-700 transition-colors"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <button
                onClick={openSignIn}
                className="flex items-center gap-2 text-xs px-3 py-2 bg-maroon-700 dark:bg-maroon-600 text-white rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors"
              >
                {t('nav.signIn')}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-600 dark:text-gray-400"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-maroon-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
                  className="text-xs px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                >
                  {language === 'en' ? 'नेपाली' : 'English'}
                </button>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-gray-600 dark:text-gray-400"
                >
                  {mounted && (theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />)}
                </button>
              </div>
              {session ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {session.user?.name}
                  </span>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-maroon-700 dark:text-maroon-400 hover:underline"
                    >
                      {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="text-left text-sm text-gray-600 dark:text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
                  >
                    {t('nav.signOut')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openSignIn(); setMobileOpen(false); }}
                  className="flex items-center justify-center gap-2 text-xs px-3 py-2 bg-maroon-700 text-white rounded-lg"
                >
                  {t('nav.signIn')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
