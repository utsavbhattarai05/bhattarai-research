'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { createContext, useContext, useState, ReactNode } from 'react';
import SignInModal from './ui/SignInModal';

// ── Language context ────────────────────────────────────────────────
type Language = 'en' | 'ne';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within Providers');
  return context;
}

// ── Sign-in modal context ───────────────────────────────────────────
interface SignInModalContextType {
  openSignIn: () => void;
}

const SignInModalContext = createContext<SignInModalContextType | null>(null);

export function useSignIn() {
  const context = useContext(SignInModalContext);
  if (!context) throw new Error('useSignIn must be used within Providers');
  return context;
}

// ── Translations ────────────────────────────────────────────────────
import en from '../../messages/en.json';
import ne from '../../messages/ne.json';

const translations: Record<Language, any> = { en, ne };

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) || path;
}

function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const t = (key: string): string => getNestedValue(translations[language], key);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Combined providers ──────────────────────────────────────────────
export default function Providers({ children }: { children: ReactNode }) {
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <SignInModalContext.Provider value={{ openSignIn: () => setSignInOpen(true) }}>
          <LanguageProvider>
            {children}
            <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
          </LanguageProvider>
        </SignInModalContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
