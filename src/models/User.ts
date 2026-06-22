import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  image?: string;
  role: 'admin' | 'user';
  provider: 'credentials' | 'google';
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  bookmarks: mongoose.Types.ObjectId[];
  language: 'en' | 'ne';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String },
    phone:    { type: String },
    image:    { type: String },
    role:     { type: String, enum: ['admin', 'user'], default: 'user' },
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    emailVerified:           { type: Boolean, default: false },
    verificationToken:       { type: String },
    verificationTokenExpiry: { type: Date },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
    language:  { type: String, enum: ['en', 'ne'], default: 'en' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
