import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_TRANSLATE_URL =
  'https://translation.googleapis.com/language/translate/v2';

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_TRANSLATE_API_KEY is not configured' },
      { status: 503 }
    );
  }

  try {
    const { texts, target } = await req.json();

    if (!Array.isArray(texts) || !target) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: texts, source: 'en', target, format: 'text' }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err?.error?.message ?? 'Translation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const translations: string[] = data.data.translations.map(
      (t: { translatedText: string }) => t.translatedText
    );

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
