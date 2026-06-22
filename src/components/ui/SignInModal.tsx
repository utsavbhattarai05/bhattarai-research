'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SignInModal({ open, onClose }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      const msg = result.error.toLowerCase();
      if (msg.includes('verify')) {
        setError('Please verify your email first. Check your inbox.');
      } else {
        setError('Invalid email or password');
      }
    } else if (result?.ok) {
      onClose();
      window.location.reload();
    }
  };

  const inputClass = `w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-gray-900
    border border-gray-200 dark:border-gray-700 rounded-xl
    focus:outline-none focus:ring-2 focus:ring-maroon-700/30 dark:focus:ring-maroon-400/30
    focus:border-maroon-700 dark:focus:border-maroon-400
    placeholder-gray-400 transition-colors`;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <FiX size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-full bg-maroon-50 dark:bg-maroon-950 mx-auto mb-4 flex items-center justify-center text-base font-bold text-maroon-700 dark:text-maroon-400">
            DB
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Access your account on{' '}
            <span className="text-maroon-700 dark:text-maroon-400 font-medium">Dr. Bhattarai</span>
          </p>
        </div>

        {/* Google */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-5"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Credentials form */}
        <form onSubmit={handleCredentials} className="space-y-3">
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ color: 'var(--text-primary)' }} className={inputClass}
            />
          </div>

          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-maroon-700 dark:bg-maroon-600 text-white text-sm font-semibold rounded-xl hover:bg-maroon-800 dark:hover:bg-maroon-700 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            onClick={onClose}
            className="text-maroon-700 dark:text-maroon-400 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
