'use client';

import { useState, KeyboardEvent } from 'react';
import { FiX } from 'react-icons/fi';
import { handleNepaliPaste } from '@/utils/nepaliPaste';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = 'Add item, press Enter' }: TagInputProps) {
  const [input, setInput] = useState('');

  const add = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setInput('');
  };

  const remove = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && tags.length) remove(tags[tags.length - 1]);
  };

  return (
    <div className="min-h-[42px] flex flex-wrap gap-1.5 px-3 py-2 bg-[var(--surface)] border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-maroon-700/20 dark:focus-within:ring-maroon-400/20">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-maroon-50 dark:bg-maroon-950 text-maroon-700 dark:text-maroon-400 rounded"
        >
          {tag}
          <button type="button" onClick={() => remove(tag)} className="hover:text-maroon-900 dark:hover:text-maroon-200">
            <FiX size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={add}
        onPaste={async (e) => {
          await handleNepaliPaste(e, input, setInput, () => {});
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
      />
    </div>
  );
}
