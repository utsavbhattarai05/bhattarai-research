'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/Providers';
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
  socialLinks?: {
    googleScholar?: string;
    researchGate?:  string;
    website?:       string;
    facebook?:      string;
  };
}

const SECTIONS_EN = [
  {
    icon: '🧭',
    title: 'His mission',
    hint: 'Why he does this work',
    content: {
      quote: '"Every folk song is a library. Every folk tale is a history book. My work is to make sure they are never lost."',
      attr: '— Prof. D.P. Bhattarai · On preserving Nepal\'s oral traditions',
    },
  },
  {
    icon: '💡',
    title: 'His philosophy',
    hint: 'How he thinks about research',
    content: {
      quote: '"The pursuit of knowledge is a journey without a destination — every answer opens a new question."',
      attr: '— Prof. D.P. Bhattarai · On research philosophy',
    },
  },
  {
    icon: '🌏',
    title: 'His impact',
    hint: 'What his work has achieved',
    content: {
      body: '42 peer-reviewed publications. Research cited across South Asia. Field work in 15+ districts of Nepal. Over 1,200 downloads by researchers worldwide. His documentation of oral traditions has influenced how Nepali universities approach folk literature preservation.',
    },
  },
  {
    icon: '🎓',
    title: 'As a mentor',
    hint: 'His role beyond research',
    content: {
      quote: '"The next generation of researchers will tackle challenges I haven\'t even imagined yet. Nurturing them is as important as publishing."',
      attr: '— Prof. D.P. Bhattarai · On mentorship',
    },
  },
];

const SECTIONS_NE = [
  {
    icon: '🧭',
    title: 'उहाँको लक्ष्य',
    hint: 'उहाँ किन यो काम गर्नुहुन्छ',
    content: {
      quote: '"हरेक लोकगीत एउटा पुस्तकालय हो। हरेक लोककथा इतिहासको किताब हो। तिनीहरू कहिल्यै नहराउन् — यही मेरो काम हो।"',
      attr: '— प्रा. डी.पी. भट्टराई · मौखिक परम्परा संरक्षणमा',
    },
  },
  {
    icon: '💡',
    title: 'उहाँको दर्शन',
    hint: 'उहाँ अनुसन्धानलाई कसरी हेर्नुहुन्छ',
    content: {
      quote: '"ज्ञानको खोज एउटा यस्तो यात्रा हो जसको कुनै गन्तव्य छैन — हरेक उत्तरले नयाँ प्रश्न खोल्छ।"',
      attr: '— प्रा. डी.पी. भट्टराई · अनुसन्धान दर्शनमा',
    },
  },
  {
    icon: '🌏',
    title: 'उहाँको प्रभाव',
    hint: 'उहाँको कामले के हासिल गर्‍यो',
    content: {
      body: '४२ सहकर्मी-समीक्षित प्रकाशनहरू। दक्षिण एसियाभर उद्धृत अनुसन्धान। नेपालका १५+ जिल्लामा क्षेत्रकार्य। विश्वभरका अनुसन्धानकर्ताहरूद्वारा १,२०० भन्दा बढी डाउनलोड। उहाँको मौखिक परम्परा दस्तावेजीकरणले नेपाली विश्वविद्यालयहरूलाई प्रभावित गरेको छ।',
    },
  },
  {
    icon: '🎓',
    title: 'गुरुको रूपमा',
    hint: 'अनुसन्धानभन्दा बाहिरको भूमिका',
    content: {
      quote: '"अर्को पुस्ताका अनुसन्धानकर्ताहरूले मैले कल्पना पनि नगरेका चुनौतीहरू सामना गर्नेछन्। तिनीहरूलाई पालनपोषण गर्नु प्रकाशन गर्नुजत्तिकै महत्त्वपूर्ण छ।"',
      attr: '— प्रा. डी.पी. भट्टराई · गुरुत्वमा',
    },
  },
];

const FALLBACK: Profile = {
  name:              { en: 'Prof. Dhruba Prasad Bhattarai', ne: 'प्रा. ध्रुव प्रसाद भट्टराई' },
  title:             { en: 'Folk Literature Researcher · लोकसाहित्य अनुसन्धानकर्ता', ne: 'लोकसाहित्य अनुसन्धानकर्ता' },
  bio:               { en: 'Professor Dhruba Prasad Bhattarai is a folk literature researcher based in Kathmandu. His work focuses on preserving the oral traditions, folk songs, and cultural heritage of Nepal\'s communities before they are lost to modernisation.', ne: 'प्राध्यापक ध्रुव प्रसाद भट्टराई काठमाडौंमा आधारित लोकसाहित्य अनुसन्धानकर्ता हुनुहुन्छ। उहाँको काम नेपालका समुदायहरूका मौखिक परम्परा, लोकगीत र सांस्कृतिक सम्पदालाई आधुनिकीकरणमा हराउनु अघि संरक्षण गर्नमा केन्द्रित छ।' },
  researchInterests: { en: ['🎵 लोकगीत', '📖 लोककथा', '🪔 संस्कृति', '🗣️ मौखिक परम्परा', '🇳🇵 Nepal'], ne: ['🎵 लोकगीत', '📖 लोककथा', '🪔 संस्कृति', '🗣️ मौखिक परम्परा'] },
  email:             'dp.bhattarai@email.com',
  location:          { en: 'Kathmandu, Nepal', ne: 'काठमाडौं, नेपाल' },
};

export default function AboutPage() {
  const { language } = useLanguage();
  const [profile, setProfile]   = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [active, setActive]     = useState(0);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const p = profile ?? FALLBACK;
  const pick = (f: { en: string; ne?: string }) => language === 'ne' && f.ne ? f.ne : f.en;
  const sections = language === 'ne' ? SECTIONS_NE : SECTIONS_EN;
  const current = sections[active];
  const interests = language === 'ne' && p.researchInterests.ne?.length
    ? p.researchInterests.ne
    : p.researchInterests.en;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* ── 4 clickable section tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-1">
        {sections.map((sec, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex flex-col items-start gap-1 px-3 py-3 text-left transition-colors ${
              i === active
                ? 'bg-maroon-700 dark:bg-maroon-800'
                : 'bg-[var(--surface)] hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="text-xl">{sec.icon}</span>
            <span className={`text-xs font-semibold leading-tight ${i === active ? 'text-maroon-50' : 'text-gray-900 dark:text-white'}`}>
              {sec.title}
            </span>
            <span className={`text-[10px] leading-tight ${i === active ? 'text-maroon-200/60' : 'text-gray-400'}`}>
              {sec.hint}
            </span>
          </button>
        ))}
      </div>

      {/* ── Expanded content panel ── */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-b-2xl px-5 py-4 mb-6 min-h-[80px]">
        {current.content.quote ? (
          <>
            <p className="text-sm italic text-gray-300 font-serif leading-relaxed mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              {current.content.quote}
            </p>
            <p className="text-[11px] text-amber-500">{current.content.attr}</p>
          </>
        ) : (
          <p className="text-sm text-gray-400 leading-relaxed">{current.content.body}</p>
        )}
      </div>

      {/* ── Profile card ── */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr]">

          {/* Left — maroon sidebar */}
          <div className="bg-maroon-700 dark:bg-maroon-900 px-4 py-5 flex flex-col items-center gap-3">
            {p.photoUrl ? (
              <img src={p.photoUrl} alt={pick(p.name)}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-lg font-bold text-maroon-50 font-serif">
                DPB
              </div>
            )}
            <div className="text-center">
              <div className="text-xs font-semibold text-maroon-50 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {pick(p.name)}
              </div>
              <div className="text-[9px] text-maroon-200/50 mt-1">{pick(p.title)}</div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              {[
                { n: '42', l: language === 'ne' ? 'प्रकाशन' : 'Publications' },
                { n: '15yr', l: language === 'ne' ? 'अनुभव' : 'Experience' },
                { n: '🇳🇵', l: language === 'ne' ? 'नेपाल' : 'Nepal' },
              ].map((s) => (
                <div key={s.l} className="bg-black/20 rounded-lg py-1.5 text-center">
                  <div className="text-base font-bold text-maroon-50" style={{ fontFamily: 'Georgia, serif' }}>{s.n}</div>
                  <div className="text-[8px] uppercase tracking-wider text-maroon-200/30">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — bio + tags */}
          <div className="bg-[var(--surface)] p-4 flex flex-col gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {pick(p.bio)}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span key={tag} className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
