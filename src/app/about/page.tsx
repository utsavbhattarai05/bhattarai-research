'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  socialLinks?: { googleScholar?: string; website?: string; facebook?: string };
}

const SECTIONS = {
  en: [
    {
      icon: '🧭', title: 'His mission', hint: 'Why he does this work',
      quote: '"Every folk song is a library. Every folk tale is a history book. My work is to make sure they are never lost."',
      attr: '— Prof. D.P. Bhattarai · On preserving Nepal\'s oral traditions',
    },
    {
      icon: '💡', title: 'His philosophy', hint: 'How he thinks',
      quote: '"The pursuit of knowledge is a journey without a destination — every answer opens a new question."',
      attr: '— Prof. D.P. Bhattarai · On research philosophy',
    },
    {
      icon: '🌏', title: 'His impact', hint: 'What he\'s achieved',
      body: '42 peer-reviewed publications. Fieldwork in 15+ districts of Nepal. Over 1,200 downloads by researchers worldwide. His documentation of oral traditions has influenced how Nepali universities approach folk literature preservation.',
    },
    {
      icon: '🎓', title: 'As a mentor', hint: 'Beyond research',
      quote: '"The next generation of researchers will tackle challenges I haven\'t even imagined yet. Nurturing them is as important as publishing."',
      attr: '— Prof. D.P. Bhattarai · On mentorship',
    },
  ],
  ne: [
    {
      icon: '🧭', title: 'उहाँको लक्ष्य', hint: 'उहाँ किन यो काम गर्नुहुन्छ',
      quote: '"हरेक लोकगीत एउटा पुस्तकालय हो। हरेक लोककथा इतिहासको किताब। तिनीहरू कहिल्यै नहराउन् — यही मेरो काम हो।"',
      attr: '— प्रा. डी.पी. भट्टराई · मौखिक परम्परा संरक्षणमा',
    },
    {
      icon: '💡', title: 'उहाँको दर्शन', hint: 'उहाँ कसरी सोच्नुहुन्छ',
      quote: '"ज्ञानको खोज एउटा यस्तो यात्रा हो जसको गन्तव्य छैन — हरेक उत्तरले नयाँ प्रश्न खोल्छ।"',
      attr: '— प्रा. डी.पी. भट्टराई · अनुसन्धान दर्शनमा',
    },
    {
      icon: '🌏', title: 'उहाँको प्रभाव', hint: 'उहाँले के हासिल गर्नुभयो',
      body: '४२ सहकर्मी-समीक्षित प्रकाशनहरू। नेपालका १५+ जिल्लामा क्षेत्रकार्य। विश्वभरबाट १,२०० भन्दा बढी डाउनलोड। उहाँको मौखिक परम्परा दस्तावेजीकरणले नेपाली विश्वविद्यालयहरूलाई प्रभावित गरेको छ।',
    },
    {
      icon: '🎓', title: 'गुरुको रूपमा', hint: 'अनुसन्धानभन्दा बाहिर',
      quote: '"अर्को पुस्ताका अनुसन्धानकर्ताहरूले मैले कल्पना पनि नगरेका चुनौतीहरू सामना गर्नेछन्। तिनीहरूलाई पालनपोषण गर्नु प्रकाशन गर्नुजत्तिकै महत्त्वपूर्ण छ।"',
      attr: '— प्रा. डी.पी. भट्टराई · गुरुत्वमा',
    },
  ],
};

const FALLBACK: Profile = {
  name:              { en: 'Prof. Dhruba Prasad Bhattarai', ne: 'प्रा. ध्रुव प्रसाद भट्टराई' },
  title:             { en: 'Folk Literature Researcher', ne: 'लोकसाहित्य अनुसन्धानकर्ता' },
  bio: {
    en: "Professor Dhruba Prasad Bhattarai is a researcher of Nepali folk literature based in Kathmandu. His life's work is the preservation of oral traditions — the songs, stories and rituals that communities pass down through generations before they disappear.",
    ne: 'प्राध्यापक ध्रुव प्रसाद भट्टराई काठमाडौंमा आधारित लोकसाहित्य अनुसन्धानकर्ता हुनुहुन्छ। उहाँको जीवनको काम मौखिक परम्पराहरूको संरक्षण हो — लोकगीत, लोककथा र परम्पराहरू जुन समुदायहरूले पुस्तौंपुस्ता हस्तान्तरण गर्दै आएका छन्।',
  },
  researchInterests: {
    en: ['🎵 लोकगीत', '📖 लोककथा', '🪔 संस्कृति', '🗣️ मौखिक', '🇳🇵 Nepal'],
    ne: ['🎵 लोकगीत', '📖 लोककथा', '🪔 संस्कृति', '🗣️ मौखिक परम्परा', '🇳🇵 नेपाल'],
  },
  email:    'dp.bhattarai@email.com',
  location: { en: 'Kathmandu, Nepal', ne: 'काठमाडौं, नेपाल' },
};

export default function AboutPage() {
  const { language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(0);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile ?? null))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const p        = profile ?? FALLBACK;
  const pick     = (f: { en: string; ne?: string }) => language === 'ne' && f.ne ? f.ne : f.en;
  const sections = language === 'ne' ? SECTIONS.ne : SECTIONS.en;
  const current  = sections[active];

  // Use fallback bio/interests if DB values are empty or too short
  const bio = pick(p.bio).length > 30 ? pick(p.bio) : pick(FALLBACK.bio);
  const rawInterests = language === 'ne' && p.researchInterests.ne?.length
    ? p.researchInterests.ne
    : p.researchInterests.en;
  const interests = rawInterests.length > 0 ? rawInterests
    : (language === 'ne' ? FALLBACK.researchInterests.ne! : FALLBACK.researchInterests.en);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[120px_1fr] sm:grid-cols-[140px_1fr]">

          {/* ── Left sidebar ── */}
          <div className="bg-maroon-700 dark:bg-maroon-900 px-3 py-5 flex flex-col items-center gap-3">
            {p.photoUrl ? (
              <img src={p.photoUrl} alt={pick(p.name)}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-lg font-bold text-maroon-50"
                style={{ fontFamily: 'Georgia, serif' }}>
                DPB
              </div>
            )}
            <div className="text-center">
              <div className="text-[11px] font-semibold text-maroon-50 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                {pick(p.name)}
              </div>
              <div className="text-[9px] text-maroon-200/45 mt-1 leading-tight">{pick(p.title)}</div>
            </div>
            <div className="flex flex-col gap-1.5 w-full mt-1">
              {[
                { n: '42',   l: language === 'ne' ? 'प्रकाशन' : 'Publications' },
                { n: '15yr', l: language === 'ne' ? 'अनुभव'   : 'Experience'   },
                { n: '🇳🇵',  l: language === 'ne' ? 'नेपाल'   : 'Nepal'        },
              ].map((s) => (
                <div key={s.l} className="bg-black/20 rounded-lg py-1.5 text-center">
                  <div className="text-sm font-bold text-maroon-50" style={{ fontFamily: 'Georgia, serif' }}>{s.n}</div>
                  <div className="text-[7px] uppercase tracking-wider text-maroon-200/30 mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right content ── */}
          <div className="bg-[var(--surface)] p-4 flex flex-col gap-3">

            {/* Bio */}
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {bio}
            </p>

            {/* Research tags */}
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span key={tag}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                  {tag}
                </span>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* 4 clickable tiles */}
            <div className="grid grid-cols-2 gap-1.5">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all border ${
                    i === active
                      ? 'bg-maroon-700 dark:bg-maroon-800 border-maroon-700 dark:border-maroon-700'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-maroon-300 dark:hover:border-maroon-700'
                  }`}
                >
                  <span className="text-base">{sec.icon}</span>
                  <span className={`text-[11px] font-semibold leading-tight ${
                    i === active ? 'text-maroon-50' : 'text-gray-900 dark:text-white'
                  }`}>
                    {sec.title}
                  </span>
                  <span className={`text-[9px] leading-tight ${
                    i === active ? 'text-maroon-200/50' : 'text-gray-400'
                  }`}>
                    {sec.hint}
                  </span>
                </button>
              ))}
            </div>

            {/* Expanded content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-900 dark:bg-gray-950 rounded-xl px-4 py-3"
              >
                {'quote' in current && current.quote ? (
                  <>
                    <p className="text-[12px] italic text-gray-300 leading-relaxed mb-1.5"
                      style={{ fontFamily: 'Georgia, serif' }}>
                      {current.quote}
                    </p>
                    <p className="text-[10px] text-amber-500">{current.attr}</p>
                  </>
                ) : (
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    {'body' in current ? current.body : ''}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
}
