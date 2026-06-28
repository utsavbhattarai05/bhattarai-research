'use client';

import { detectFont } from './nepaliConverter';

export async function handleNepaliPaste(
  e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  currentValue: string,
  onChange: (newValue: string) => void,
  onNotice: (msg: string) => void,
): Promise<void> {
  const text = e.clipboardData.getData('text/plain');
  if (!text) return;

  const font = detectFont(text);
  if (font === 'unicode' || font === 'english') return; // let browser handle

  e.preventDefault();

  try {
    const res = await fetch('/api/convert-nepali', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, font }),
    });
    const data = await res.json();
    const converted: string = data.converted ?? text;

    const el = e.target as HTMLInputElement | HTMLTextAreaElement;
    const start = el.selectionStart ?? currentValue.length;
    const end   = el.selectionEnd   ?? currentValue.length;
    const newVal = currentValue.slice(0, start) + converted + currentValue.slice(end);

    onChange(newVal);

    if (converted !== text) {
      onNotice(`✓ ${font === 'preeti' ? 'Preeti' : 'Kantipur'} → Unicode`);
    }
  } catch {
    // Conversion failed — fall back to normal paste by re-dispatching
    document.execCommand('insertText', false, text);
  }
}
