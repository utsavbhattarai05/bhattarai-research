'use client';

import { useState } from 'react';
import TextInput from './TextInput';
import TextareaInput from './TextareaInput';

type Tab = 'en' | 'ne';

interface BilingualInputProps {
  valueEn: string;
  valueNe: string;
  onChangeEn: (v: string) => void;
  onChangeNe: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

/* ── Preeti font → Unicode Devanagari (standard layout) ── */
const PREETI: Record<string, string> = {
  // lowercase
  'a':'ा','b':'ब','c':'च','d':'द','e':'े','f':'्','g':'ग','h':'ह',
  'i':'ि','j':'ज','k':'क','l':'ल','m':'म','n':'न','o':'ो','p':'प',
  'q':'क्ष','r':'र','s':'स','t':'त','u':'ु','v':'व','w':'ौ','x':'ं',
  'y':'य','z':'ज्ञ',
  // uppercase
  'A':'ा','B':'ब','C':'छ','D':'ड','E':'ए','F':'फ','G':'अ','H':'ह',
  'I':'ई','J':'ञ','K':'ट','L':'ल','M':'म','N':'ण','O':'ओ','P':'ठ',
  'Q':'क्ष','R':'र','S':'स','T':'त','U':'उ','V':'ब','W':'ौ','X':'ः',
  'Y':'य','Z':'ज्ञ',
  // digits
  '0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९',
  // special characters
  '.':'।',',':',',';':'ट',':':'ः',"'":'्','`':'ं','"':'ौ',
  '!':'ऋ','@':'ँ','#':'#','$':'ः','%':'ं','&':'ु','*':'ूू','+':'ऊ',
  '-':'ो','=':'श','/':'ब','\\':'ा','|':'ा',
  '[':'ु',']':'ू','{':'ु','}':'ू',
  '<':'ि','>':'े','^':'ौ','_':'ः','~':'ँ',
  ' ':' ','\n':'\n','\t':'\t',
};

const KANTIPUR: Record<string, string> = {
  ...PREETI,
  'G':'ग', // Kantipur uses G→ग differently
};

const LEGACY_FONTS = ['preeti','kantipur','sagarmatha','himalaya','fontasy','mangal_old'];

function isLegacyFont(html: string): boolean {
  const lower = html.toLowerCase();
  return LEGACY_FONTS.some(f => lower.includes(f));
}

function isKantipur(html: string): boolean {
  return html.toLowerCase().includes('kantipur');
}

// True if text has no Devanagari Unicode characters (U+0900–U+097F)
function hasNoDevanagari(text: string): boolean {
  return !/[ऀ-ॿ]/.test(text);
}

function convertToUnicode(text: string, map: Record<string, string>): string {
  return text.split('').map(ch => map[ch] ?? ch).join('');
}

/* ── Component ── */
export default function BilingualInput({
  valueEn, valueNe, onChangeEn, onChangeNe,
  placeholder, multiline = false, rows = 4, error,
}: BilingualInputProps) {
  const [tab, setTab] = useState<Tab>('en');
  const [converted, setConverted] = useState(false);

  const handlePaste = (e: React.ClipboardEvent) => {
    if (tab !== 'ne') return;
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    // Convert if: font name detected in HTML OR text has zero Devanagari chars (= Preeti/ASCII legacy)
    const shouldConvert = (html && isLegacyFont(html)) || hasNoDevanagari(text);

    if (shouldConvert) {
      e.preventDefault();
      const map = (html && isKantipur(html)) ? KANTIPUR : PREETI;
      const unicode = convertToUnicode(text, map);
      onChangeNe(valueNe + unicode);
      setConverted(true);
      setTimeout(() => setConverted(false), 3000);
    }
    // Unicode Devanagari paste: let browser handle normally
  };

  const sharedNeProps = {
    lang: 'ne' as const,
    spellCheck: false as const,
    autoCorrect: 'off' as const,
    autoCapitalize: 'off' as const,
    onPaste: handlePaste,
  };

  return (
    <div>
      {/* Language tabs */}
      <div className="flex items-center gap-1 mb-2">
        {(['en', 'ne'] as Tab[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setTab(lang)}
            className={`text-[11px] px-2.5 py-1 rounded font-medium transition-colors ${
              tab === lang
                ? 'bg-maroon-700 dark:bg-maroon-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {lang === 'en' ? 'English' : 'नेपाली'}
          </button>
        ))}
        {converted && (
          <span className="text-[10px] text-green-500 ml-2 animate-pulse">
            ✓ Preeti → Unicode converted
          </span>
        )}
      </div>

      {multiline ? (
        <TextareaInput
          value={tab === 'en' ? valueEn : valueNe}
          onChange={(e) => tab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
          placeholder={tab === 'en' ? placeholder : `${placeholder ?? ''} (नेपाली)`}
          rows={rows}
          error={error}
          {...(tab === 'ne' ? sharedNeProps : {})}
        />
      ) : (
        <TextInput
          value={tab === 'en' ? valueEn : valueNe}
          onChange={(e) => tab === 'en' ? onChangeEn(e.target.value) : onChangeNe(e.target.value)}
          placeholder={tab === 'en' ? placeholder : `${placeholder ?? ''} (नेपाली)`}
          error={error}
          {...(tab === 'ne' ? sharedNeProps : {})}
        />
      )}
    </div>
  );
}
