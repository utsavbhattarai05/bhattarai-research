import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Message from '@/models/Message';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Limit message length
    if (data.message.length > 5000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    await dbConnect();

    const message = await Message.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
    });

    return NextResponse.json(
      { message: 'Message sent successfully', id: message._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
