import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from './mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Block sign-in for unverified credential users (admins are pre-verified)
        if (!user.emailVerified && user.role !== 'admin') {
          throw new Error('Please verify your email before signing in.');
        }

        return {
          id:            user._id.toString(),
          name:          user.name,
          email:         user.email,
          image:         user.image,
          role:          user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });

        if (!existingUser) {
          await User.create({
            name:          user.name,
            email:         user.email,
            image:         user.image,
            provider:      'google',
            role:          'user',
            emailVerified: true, // Google guarantees email ownership
          });
        } else if (!existingUser.emailVerified) {
          // Auto-verify existing users who sign in via Google
          await User.findByIdAndUpdate(existingUser._id, { emailVerified: true });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.role          = dbUser.role;
          token.id            = dbUser._id.toString();
          token.emailVerified = dbUser.emailVerified;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role          = token.role;
        (session.user as any).id            = token.id;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
