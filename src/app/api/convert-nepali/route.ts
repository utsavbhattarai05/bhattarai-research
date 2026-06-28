import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, font = 'preeti' } = await req.json();
    if (!text) return NextResponse.json({ converted: '', wasConverted: false });

    const { convertFont } = await import('preeti-to-unicode');
    const fontKey = font === 'kantipur' ? 'kantipur' : 'preeti';
    const converted = convertFont(text, fontKey);

    return NextResponse.json({
      converted,
      font: fontKey,
      wasConverted: converted !== text,
    });
  } catch (error) {
    console.error('Nepali conversion error:', error);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
