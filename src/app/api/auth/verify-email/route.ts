import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify?error=missing', req.url));
  }

  try {
    await dbConnect();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/auth/verify?error=invalid', req.url));
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.redirect(new URL('/auth/verify?success=true', req.url));
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(new URL('/auth/verify?error=server', req.url));
  }
}
