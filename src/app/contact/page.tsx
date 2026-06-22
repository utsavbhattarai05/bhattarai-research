'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiSend, FiCheck, FiAlertCircle } from 'react-icons/fi';

const inputStyle = { color: 'var(--text-primary)' } as const;
const inputClass = "w-full px-3 py-2.5 text-sm bg-[var(--surface)] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-700/20";

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 style={{ color: 'var(--text-primary)' }} className="text-2xl sm:text-3xl font-semibold mb-2">
          {t('contact.title')}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('contact.subtitle')}
        </p>
      </div>

      {status === 'success' ? (
        <div className="text-center py-12">
          <FiCheck className="mx-auto text-green-500 mb-4" size={40} />
          <p className="text-green-600 dark:text-green-400 font-medium">{t('contact.success')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.name')}</label>
            <input
              type="text" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={inputStyle} className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.email')}</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle} className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.subject')}</label>
            <input
              type="text" required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={inputStyle} className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t('contact.message')}</label>
            <textarea
              required rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={inputStyle} className={`${inputClass} resize-none`}
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <FiAlertCircle size={14} />
              {t('contact.error')}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-maroon-700 dark:bg-maroon-600 text-white text-sm rounded-lg hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors disabled:opacity-50"
          >
            <FiSend size={14} />
            {status === 'sending' ? t('common.loading') : t('contact.send')}
          </button>
        </form>
      )}
    </div>
  );
}
