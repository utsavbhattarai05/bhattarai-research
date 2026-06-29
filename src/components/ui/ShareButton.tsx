'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/components/Providers';
import { FiShare2, FiLink, FiTwitter, FiLinkedin, FiCheck, FiX, FiMail } from 'react-icons/fi';
import { FaWhatsapp, FaFacebookMessenger, FaFacebook, FaTelegramPlane, FaRedditAlien } from 'react-icons/fa';

interface ShareButtonProps {
  title: string;
  url: string;
  label?: string;
}

export default function ShareButton({ title, url, label }: ShareButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleShare = async () => {
    // Use native share sheet if available (mobile / modern desktop)
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled — do nothing
      }
      return;
    }
    // Otherwise open popover
    setOpen((v) => !v);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socials = [
    {
      name: 'X / Twitter',
      icon: <FiTwitter size={13} />,
      color: 'text-gray-900 dark:text-gray-100',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`,
    },
    {
      name: 'Facebook',
      icon: <FaFacebook size={13} />,
      color: 'text-blue-600',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    },
    {
      name: 'Messenger',
      icon: <FaFacebookMessenger size={13} />,
      color: 'text-blue-500',
      href: `https://www.facebook.com/dialog/send?link=${encoded}&app_id=291494419107518&redirect_uri=${encoded}`,
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={13} />,
      color: 'text-green-500',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encoded}`,
    },
    {
      name: 'Telegram',
      icon: <FaTelegramPlane size={13} />,
      color: 'text-sky-500',
      href: `https://t.me/share/url?url=${encoded}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: <FiLinkedin size={13} />,
      color: 'text-blue-700',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
    },
    {
      name: 'Reddit',
      icon: <FaRedditAlien size={13} />,
      color: 'text-orange-500',
      href: `https://reddit.com/submit?url=${encoded}&title=${encodedTitle}`,
    },
    {
      name: 'Email',
      icon: <FiMail size={13} />,
      color: 'text-gray-500',
      href: `mailto:?subject=${encodedTitle}&body=${encoded}`,
    },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-xs"
      >
        <FiShare2 size={12} />
        {label ?? t('share.share')}
      </button>

      {open && (
        <div className="absolute bottom-7 left-0 z-30 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-bottom-2 duration-150 max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 pb-2 border-b border-gray-100 dark:border-gray-800 mb-1 sticky top-0 bg-white dark:bg-gray-900">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t('share.share')}</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <FiX size={13} />
            </button>
          </div>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {copied
              ? <FiCheck size={13} className="text-green-500" />
              : <FiLink size={13} className="text-gray-400" />}
            {copied ? t('share.copied') : t('share.copyLink')}
          </button>

          {/* Social options */}
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <span className={s.color}>{s.icon}</span>
              {s.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
