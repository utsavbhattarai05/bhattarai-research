'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';

type Step = 'form' | 'sent';

export default function SignUpPage() {
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
      } else {
        setStep('sent');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-700 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-maroon-700/30 dark:focus:ring-maroon-400/30
    focus:border-maroon-700 dark:focus:border-maroon-400
    placeholder-gray-400 transition-colors`;

  if (step === 'sent') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 mx-auto mb-5 flex items-center justify-center text-3xl">
            ✉️
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            We sent a verification link to
          </p>
          <p className="text-sm font-semibold text-maroon-700 dark:text-maroon-400 mb-6">{form.email}</p>
          <p className="text-xs text-gray-400 mb-8">
            Click the link in the email to activate your account. The link expires in 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-maroon-700 dark:hover:text-maroon-400 transition-colors"
          >
            <FiArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-md dark:shadow-none p-8">

          {/* Header */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 rounded-full bg-maroon-50 dark:bg-maroon-950 mx-auto mb-4 flex items-center justify-center text-base font-bold text-maroon-700 dark:text-maroon-400">
              DB
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get access to research downloads on{' '}
              <span className="text-maroon-700 dark:text-maroon-400 font-medium">Dr. Bhattarai</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
                style={{ color: 'var(--text-primary)' }} className={inputClass}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                style={{ color: 'var(--text-primary)' }} className={inputClass}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                required
                style={{ color: 'var(--text-primary)' }} className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min. 8 characters)"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                required
                style={{ color: 'var(--text-primary)' }} className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                required
                style={{ color: 'var(--text-primary)' }} className={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-maroon-700 dark:bg-maroon-600 text-white text-sm font-semibold rounded-xl hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-[11px] text-gray-400">
              By creating an account you agree to receive research updates.
            </p>

          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="text-maroon-700 dark:text-maroon-400 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
