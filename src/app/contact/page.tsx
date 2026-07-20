'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';

/* ── Slot machine data ── */
const REELS_EN = [
  ['🤝 Collab','📄 Cite','🎓 Mentor','💡 Idea','🌏 Nepal','📊 Data','🔬 Research','🏛️ Policy'],
  ['📚 Research','✍️ Writing','🤔 Question','💬 Chat','🌱 Develop','📈 Impact','🎯 Goal','🤝 Partner'],
  ['🇳🇵 Nepal','🌏 Global','📍 Local','🏔️ Himalayan','🌍 South Asia','🏫 Academic','💼 Prof','🔗 Network'],
];
const REELS_NE = [
  ['🤝 सहकार्य','📄 उद्धरण','🎓 मार्गदर्शन','💡 विचार','🌏 नेपाल','📊 डेटा','🔬 अनुसन्धान','🏛️ नीति'],
  ['📚 शोध','✍️ लेखन','🤔 प्रश्न','💬 कुराकानी','🌱 विकास','📈 प्रभाव','🎯 लक्ष्य','🤝 साझेदार'],
  ['🇳🇵 नेपाल','🌏 विश्व','📍 स्थानीय','🏔️ हिमाली','🌍 दक्षिण एसिया','🏫 शैक्षिक','💼 प्राध्यापक','🔗 नेटवर्क'],
];

const COMBOS_EN = [
  { icon:'🤝', text:'How about a <b>research collaboration</b>? Prof. Bhattarai loves partnering on development studies.', msg:'Hello Prof. Bhattarai,\n\nI am interested in collaborating on research related to...' },
  { icon:'📄', text:'Enquiring about <b>citing his publications</b>? He is always happy to help with references.', msg:'Dear Prof. Bhattarai,\n\nI would like to cite your work on...' },
  { icon:'🎓', text:'Looking for <b>academic mentorship</b>? Prof. Bhattarai mentors researchers in Nepal and beyond.', msg:'Hello Prof. Bhattarai,\n\nI am looking for academic guidance on...' },
  { icon:'🌏', text:'A <b>South Asia development</b> discussion? He is a leading expert in regional policy research.', msg:'Dear Prof. Bhattarai,\n\nI would love to discuss your research on development in South Asia...' },
  { icon:'📊', text:'Interested in his <b>data and findings</b>? Reach out for datasets and methodology details.', msg:'Hello Prof. Bhattarai,\n\nI am interested in your research data on...' },
];
const COMBOS_NE = [
  { icon:'🤝', text:'<b>अनुसन्धान सहकार्य</b>को बारेमा कुरा गर्न चाहनुहुन्छ?', msg:'नमस्ते प्रा. भट्टराई,\n\nम अनुसन्धानमा सहकार्य गर्न इच्छुक छु...' },
  { icon:'📄', text:'<b>उद्धरण</b>को बारेमा सोध्न चाहनुहुन्छ? उहाँ सधैँ मद्दत गर्न तयार हुनुहुन्छ।', msg:'प्रिय प्रा. भट्टराई,\n\nम तपाईंको यो कार्य उद्धृत गर्न चाहन्छु...' },
  { icon:'🎓', text:'<b>शैक्षिक मार्गदर्शन</b> खोज्दै हुनुहुन्छ? उहाँ नेपाल र विदेशका अनुसन्धानकर्तालाई सहयोग गर्नुहुन्छ।', msg:'नमस्ते प्रा. भट्टराई,\n\nम शैक्षिक मार्गदर्शन खोज्दैछु...' },
  { icon:'🌏', text:'<b>दक्षिण एसिया विकास</b>को बारेमा छलफल गर्न चाहनुहुन्छ?', msg:'प्रिय प्रा. भट्टराई,\n\nम तपाईंको दक्षिण एसिया विकासमा अनुसन्धान बारे कुरा गर्न चाहन्छु...' },
  { icon:'📊', text:'उहाँको <b>डेटा र निष्कर्ष</b>मा रुचि छ? सम्पर्क गर्नुहोस्।', msg:'नमस्ते प्रा. भट्टराई,\n\nम तपाईंको अनुसन्धान डेटामा रुचि राख्छु...' },
];

export default function ContactPage() {
  const { language, t } = useLanguage();
  const [profileEmail, setProfileEmail] = useState('');
  const [flipped, setFlipped]   = useState(false);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => { if (d.profile?.email) setProfileEmail(d.profile.email); })
      .catch(() => null);
  }, []);
  const [spinning, setSpinning] = useState(false);
  const [reelVals, setReelVals] = useState(['🤝\nCollab', '📚\nResearch', '🇳🇵\nNepal']);
  const [result, setResult]     = useState<{ icon: string; text: string } | null>(null);
  const [form, setForm]         = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus]     = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const reels  = language === 'ne' ? REELS_NE  : REELS_EN;
  const combos = language === 'ne' ? COMBOS_NE : COMBOS_EN;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    let count = 0;
    const timer = setInterval(() => {
      setReelVals(reels.map((reel) => {
        const item = reel[Math.floor(Math.random() * reel.length)];
        const [em, ...rest] = item.split(' ');
        return `${em}\n${rest.join(' ')}`;
      }));
      count++;
      if (count >= 14) {
        clearInterval(timer);
        setSpinning(false);
        const combo = combos[Math.floor(Math.random() * combos.length)];
        setResult(combo);
        setForm((f) => ({ ...f, message: combo.msg }));
      }
    }, 80);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? 'success' : 'error');
      if (res.ok) setForm({ name: '', email: '', subject: '', message: '' });
    } catch { setStatus('error'); }
  };

  const inputStyle = { color: 'var(--text-primary)' } as const;
  const inputClass = 'w-full px-3 py-2.5 text-sm bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20';

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="sr-only">{language === 'ne' ? 'प्रा. डा. ध्रुव प्रसाद भट्टराईलाई सम्पर्क गर्नुहोस्' : 'Contact Prof. Dr. Dhruba Prasad Bhattarai'}</h1>

      {/* ── Flip card ── */}
      <div
        className="h-44 mb-5 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-maroon-700 dark:bg-maroon-900 p-6 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px] font-bold text-maroon-100 font-serif">DPB</div>
              <span className="text-[10px] text-maroon-200/50 uppercase tracking-widest">{language === 'ne' ? 'अनुसन्धान · नेपाल' : 'Research · Nepal'}</span>
            </div>
            <div>
              <div className="text-lg font-semibold text-maroon-50" style={{ fontFamily: 'Georgia, serif' }}>
                {language === 'ne' ? 'प्रा. ध्रुव प्रसाद भट्टराई' : 'Prof. Dhruba Prasad Bhattarai'}
              </div>
              <div className="text-xs text-maroon-200/50 mt-0.5">{language === 'ne' ? 'अनुसन्धानकर्ता · विद्वान · लेखक' : 'Researcher · Scholar · Author'}</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[9px] text-maroon-200/25">{t('contact.cardFlipHint')}</span>
              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-maroon-200/40">↻</div>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-5 flex flex-col"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: 'var(--text-primary)' }} className="text-xs font-bold uppercase tracking-widest">{t('contact.cardBack')}</span>
              <span className="text-xs text-maroon-600 dark:text-maroon-400">{t('contact.cardFlipBack')} ↻</span>
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                { icon: '📧', label: t('contact.emailLabel'), val: profileEmail || 'dp.bhattarai@email.com' },
                { icon: '🌐', label: t('contact.scholarLabel'), val: language === 'ne' ? 'अनुसन्धान हेर्नुहोस्' : 'View research' },
                { icon: '📍', label: t('contact.locationLabel'), val: t('contact.locationValue') },
                { icon: '🌍', label: t('contact.websiteLabel'), val: 'dhrubabhattarai.com.np' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 bg-[var(--surface)] rounded-lg px-3 py-2">
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[9px] text-gray-400">{item.label}</div>
                    <div style={{ color: 'var(--text-primary)' }} className="text-[10px] font-medium truncate">{item.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        <span className="text-[11px] text-gray-400 whitespace-nowrap">🎰 {t('contact.spinDivider')}</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* ── Slot machine ── */}
      <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-4 mb-3">
        <p className="text-[10px] text-gray-600 text-center uppercase tracking-widest mb-3">{t('contact.spinLabel')}</p>
        <div className="flex gap-2 mb-3">
          {reelVals.map((val, i) => (
            <div key={i} className="flex-1 bg-black/40 border border-white/5 rounded-xl h-14 flex items-center justify-center">
              <span className="text-maroon-100 text-xs font-medium text-center whitespace-pre-line leading-tight">{val}</span>
            </div>
          ))}
        </div>
        <button
          onClick={spin}
          disabled={spinning}
          className="w-full bg-maroon-700 hover:bg-maroon-800 dark:bg-maroon-600 dark:hover:bg-maroon-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {spinning ? '🎰 ...' : result ? t('contact.spinAgain') : t('contact.spinBtn')}
        </button>
      </div>

      {/* ── Result pill ── */}
      <div className="flex items-center gap-3 bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 mb-5 min-h-[52px]">
        <span className="text-xl flex-shrink-0">{result?.icon ?? '💡'}</span>
        <span
          className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: result?.text ?? t('contact.spinHint') }}
        />
      </div>

      {/* ── Contact form ── */}
      {status === 'success' ? (
        <div className="text-center py-10">
          <FiCheck className="mx-auto text-green-500 mb-3" size={36} />
          <p className="text-green-600 dark:text-green-400 font-medium text-sm">{t('contact.success')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.name')}</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.email')}</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.subject')}</label>
            <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={inputStyle} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.message')}</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={inputStyle} className={`${inputClass} resize-none`} />
          </div>
          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <FiAlertCircle size={13} />{t('contact.error')}
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">{t('contact.replyHint')}</span>
            <button type="submit" disabled={status === 'sending'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-xl hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors disabled:opacity-50">
              <FiSend size={13} />
              {status === 'sending' ? '...' : t('contact.send')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
