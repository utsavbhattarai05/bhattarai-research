import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, adminSecret } = await req.json();

    // ── Admin creation (secret-gated) ──────────────────────────────
    if (adminSecret) {
      if (adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (!name || !email || !password) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
      }
      await dbConnect();
      const existing = await User.findOne({ email });
      if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({
        name, email, password: hashed,
        role: 'admin', provider: 'credentials', emailVerified: true,
      });
      return NextResponse.json({ message: 'Admin account created', userId: user._id }, { status: 201 });
    }

    // ── Public sign-up ─────────────────────────────────────────────
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'Name, email, phone and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    const phoneRegex = /^\+?[\d\s\-().]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await User.create({
      name, email, phone, password: hashed,
      role: 'user', provider: 'credentials',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
    });

    // Try to send verification email — if it fails, roll back the user so they can retry
    try {
      const { sendVerificationEmail } = await import('@/lib/email');
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.error('Email send failed, rolling back user:', emailErr);
      await User.findByIdAndDelete(user._id);
      return NextResponse.json(
        { error: 'Account created but verification email could not be sent. Please contact the administrator.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: 'Account created. Check your email to verify.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
