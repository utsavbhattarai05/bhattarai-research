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

/* ── Preeti font → Unicode Devanagari converter ── */
const PREETI: Record<string, string> = {
  '!':'ऋ','"':'ौ','#':'ओ','$':'ः','%':'ं','&':'ु',"'":'क्ष','*':'ूू','+':'ऊ',',':'÷',
  '-':'ो','.':'।','/':'ब','0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६',
  '7':'७','8':'८','9':'९',':':'ः',';':'ट','<':'ि','=':'श','>':'े','?':'श','@':'ँ',
  'A':'ा','B':'ब','C':'छ','D':'ड','E':'ए','F':'फ','G':'ग','H':'ह','I':'ई','J':'ज',
  'K':'क','L':'ल','M':'म','N':'न','O':'ओ','P':'प','Q':'क्ष','R':'र','S':'स','T':'त',
  'U':'उ','V':'ब','W':'ौ','X':'ं','Y':'य','Z':'ज्ञ','[':'ु','\\':'ा',']':'ू',
  '^':'ौ','_':'ः','`':'ं','a':'ा','b':'ब','c':'च','d':'द','e':'े','f':'फ','g':'ग',
  'h':'ह','i':'ि','j':'ज','k':'क','l':'ल','m':'म','n':'न','o':'ो','p':'प','q':'क्ष',
  'r':'र','s':'स','t':'त','u':'ु','v':'ब','w':'ौ','x':'ं','y':'य','z':'ज्ञ',
  '{':'ु','|':'ा','}':'ू','~':'ँ',' ':' ','\n':'\n','\t':'\t',
};

const KANTIPUR: Record<string, string> = {
  ...PREETI,
  'f':'फ','F':'फ','ä':'फ','ü':'फ',
};

const LEGACY_FONTS = ['preeti','kantipur','sagarmatha','himalaya','fontasy','mangal_old'];

function isLegacyFont(html: string): boolean {
  const lower = html.toLowerCase();
  return LEGACY_FONTS.some(f => lower.includes(f));
}

function isKantipur(html: string): boolean {
  return html.toLowerCase().includes('kantipur');
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
    if (tab !== 'ne') return; // only intercept Nepali tab
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html && isLegacyFont(html)) {
      e.preventDefault();
      const map = isKantipur(html) ? KANTIPUR : PREETI;
      const unicode = convertToUnicode(text, map);
      onChangeNe(valueNe + unicode);
      setConverted(true);
      setTimeout(() => setConverted(false), 3000);
    }
    // else: let browser handle Unicode paste normally
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
