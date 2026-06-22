'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function VerifyContent() {
  const params = useSearchParams();
  const success = params.get('success') === 'true';
  const error   = params.get('error');

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 mx-auto mb-5 flex items-center justify-center text-3xl">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email verified!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Your account is now active. You can sign in and start downloading research papers.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-700 dark:bg-maroon-600 text-white text-sm font-semibold rounded-xl hover:bg-maroon-800 transition-colors"
        >
          Go to home
        </Link>
      </div>
    );
  }

  const messages: Record<string, string> = {
    invalid: 'This verification link is invalid or has expired. Links are valid for 24 hours.',
    missing: 'No verification token was found in the link.',
    server:  'Something went wrong on our end. Please try again.',
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 mx-auto mb-5 flex items-center justify-center text-3xl">❌</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {messages[error ?? ''] ?? 'An unknown error occurred.'}
      </p>
      <Link
        href="/auth/signup"
        className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-700 dark:bg-maroon-600 text-white text-sm font-semibold rounded-xl hover:bg-maroon-800 transition-colors"
      >
        Try signing up again
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<p className="text-center text-gray-400 text-sm">Loading…</p>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
