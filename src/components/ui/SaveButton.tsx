'use client';

import { FiCheck, FiSave } from 'react-icons/fi';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveButtonProps {
  state: SaveState;
  label?: string;
  className?: string;
}

export default function SaveButton({ state, label = 'Save changes', className = '' }: SaveButtonProps) {
  const config = {
    idle:   { text: label,          icon: <FiSave size={14} />,  style: 'bg-maroon-700 dark:bg-maroon-600 hover:bg-maroon-800 dark:hover:bg-maroon-700' },
    saving: { text: 'Saving...',    icon: null,                   style: 'bg-maroon-700/70 dark:bg-maroon-600/70 cursor-not-allowed' },
    saved:  { text: 'Saved!',       icon: <FiCheck size={14} />, style: 'bg-green-600 dark:bg-green-700' },
    error:  { text: 'Failed — retry', icon: <FiSave size={14} />, style: 'bg-red-600 dark:bg-red-700' },
  }[state];

  return (
    <button
      type="submit"
      disabled={state === 'saving'}
      className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm text-white rounded-lg transition-colors ${config.style} ${className}`}
    >
      {config.icon}
      {config.text}
    </button>
  );
}
