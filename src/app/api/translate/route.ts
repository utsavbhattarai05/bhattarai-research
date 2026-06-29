import { NextRequest, NextResponse } from 'next/server';
import { fillBilingual } from '@/lib/translate';

export async function POST(req: NextRequest) {
  try {
    const { texts, source = 'en', target } = await req.json();
    if (!Array.isArray(texts) || !target) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const translations = await Promise.all(
      texts.map(async (text: string) => {
        const field = source === 'en' ? { en: text, ne: '' } : { en: '', ne: text };
        const filled = await fillBilingual(field);
        return target === 'ne' ? filled.ne : filled.en;
      })
    );

    return NextResponse.json({ translations });
  } catch (err) {
    console.error('Translate error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
