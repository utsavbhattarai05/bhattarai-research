import mongoose, { Schema, Document } from 'mongoose';

export interface IProfile extends Document {
  name: { en: string; ne?: string };
  title: { en: string; ne?: string };
  bio: { en: string; ne?: string };
  researchInterests: { en: string[]; ne?: string[] };
  photoUrl: string;
  cvUrl?: string;
  email: string;
  location: { en: string; ne?: string };
  quote: { en?: string; ne?: string };
  socialLinks: {
    linkedin?: string;
    googleScholar?: string;
    researchGate?: string;
    website?: string;
    facebook?: string;
  };
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    name: {
      en: { type: String, default: '' },
      ne: { type: String },
    },
    title: {
      en: { type: String, default: '' },
      ne: { type: String },
    },
    bio: {
      en: { type: String, default: '' },
      ne: { type: String },
    },
    researchInterests: {
      en: [{ type: String }],
      ne: [{ type: String }],
    },
    photoUrl: { type: String, default: '' },
    cvUrl: { type: String },
    email: { type: String, default: '' },
    location: {
      en: { type: String, default: 'Kathmandu, Nepal' },
      ne: { type: String, default: 'काठमाडौं, नेपाल' },
    },
    quote: {
      en: { type: String },
      ne: { type: String },
    },
    socialLinks: {
      linkedin:      { type: String },
      googleScholar: { type: String },
      researchGate:  { type: String },
      website:       { type: String },
      facebook:      { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
