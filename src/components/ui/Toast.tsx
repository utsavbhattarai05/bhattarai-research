'use client';

import { useEffect, useState } from 'react';
import { FiCheck, FiAlertCircle, FiInfo, FiX, FiDownload } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info' | 'download';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

const ICONS = {
  success:  <FiCheck size={15} className="text-green-500" />,
  error:    <FiAlertCircle size={15} className="text-red-500" />,
  info:     <FiInfo size={15} className="text-blue-500" />,
  download: <FiDownload size={15} className="text-maroon-600 dark:text-maroon-400" />,
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    // Auto-dismiss
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onRemove(toast.id), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-start gap-3 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300); }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <FiX size={14} />
      </button>
    </div>
  );
}

// ── Global toast state ─────────────────────────────────────────────
type Listener = (toasts: ToastMessage[]) => void;
let toasts: ToastMessage[] = [];
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export const toast = {
  show(type: ToastType, title: string, description?: string) {
    const id = Math.random().toString(36).slice(2);
    toasts = [...toasts, { id, type, title, description }];
    notify();
  },
  success: (title: string, description?: string) => toast.show('success', title, description),
  error:   (title: string, description?: string) => toast.show('error',   title, description),
  info:    (title: string, description?: string) => toast.show('info',    title, description),
  download:(title: string, description?: string) => toast.show('download',title, description),
};

// ── Container rendered once in layout ─────────────────────────────
export default function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => { listeners.delete(setItems); };
  }, []);

  const remove = (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
