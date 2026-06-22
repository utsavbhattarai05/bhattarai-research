'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSignIn } from '@/components/Providers';
import { toast } from '@/components/ui/Toast';

type DownloadState = 'idle' | 'loading' | 'done' | 'error';

function isSameOrigin(url: string): boolean {
  try {
    return new URL(url).origin === window.location.origin;
  } catch {
    return false;
  }
}

// Returns 'blob' if file saved to disk, 'tab' if opened in new tab
async function triggerDownload(url: string, fileName: string): Promise<'blob' | 'tab'> {
  // Same-origin: fetch as blob → real file download
  if (isSameOrigin(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`File request failed (${res.status})`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    return 'blob';
  }

  // Cross-origin: try blob fetch (works if server sends CORS headers)
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('cors fetch failed');
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
    return 'blob';
  } catch {
    // CORS blocked — <a download> is also ignored cross-origin.
    // Best we can do is open in a new tab so the user can save manually.
    window.open(url, '_blank', 'noopener,noreferrer');
    return 'tab';
  }
}

export function useDownload() {
  const { data: session } = useSession();
  const { openSignIn } = useSignIn();
  const [states, setStates] = useState<Record<string, DownloadState>>({});

  const download = useCallback(async (publicationId: string, title: string) => {
    // Not signed in → open modal
    if (!session) {
      openSignIn();
      return;
    }

    // Block if email explicitly not verified (strict false check — undefined/null = old session, allow through)
    const emailVerified = (session.user as any)?.emailVerified;
    if (emailVerified === false) {
      toast.info('Email not verified', 'Check your inbox for a verification link.');
      return;
    }

    setStates((s) => ({ ...s, [publicationId]: 'loading' }));

    try {
      const res = await fetch(`/api/download/${publicationId}`);
      const data = await res.json();

      if (res.status === 401) {
        openSignIn();
        setStates((s) => ({ ...s, [publicationId]: 'idle' }));
        return;
      }

      if (!res.ok) {
        throw new Error(data.error ?? 'Download failed');
      }

      const result = await triggerDownload(data.downloadUrl, data.fileName);

      setStates((s) => ({ ...s, [publicationId]: 'done' }));
      if (result === 'blob') {
        toast.download('Download started', data.fileName);
      } else {
        toast.info('File opened in new tab', 'Save it from your browser (Cmd+S / Ctrl+S).');
      }
      setTimeout(() => setStates((s) => ({ ...s, [publicationId]: 'idle' })), 3000);
    } catch (err: any) {
      setStates((s) => ({ ...s, [publicationId]: 'error' }));
      toast.error('Download failed', err.message ?? 'Please try again.');
      setTimeout(() => setStates((s) => ({ ...s, [publicationId]: 'idle' })), 3000);
    }
  }, [session, openSignIn]);

  return { download, states };
}
