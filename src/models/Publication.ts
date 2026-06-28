import mongoose, { Schema, Document } from 'mongoose';

export interface IPublication extends Document {
  title: { en?: string; ne?: string };
  abstract: { en?: string; ne?: string };
  authors: string[];
  year: number;
  type: 'journal' | 'conference' | 'book_chapter' | 'working_paper' | 'thesis' | 'other';
  journal: string;
  tags: string[];
  slug: string;
  fileUrl: string;
  fileName: string;
  doi?: string;
  externalUrl?: string;
  downloadCount: number;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublicationSchema = new Schema<IPublication>(
  {
    title: {
      en: { type: String, default: '' },
      ne: { type: String, default: '' },
    },
    abstract: {
      en: { type: String, default: '' },
      ne: { type: String, default: '' },
    },
    authors: [{ type: String, required: true }],
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ['journal', 'conference', 'book_chapter', 'working_paper', 'thesis', 'other'],
      required: true,
    },
    journal: { type: String, required: true },
    tags: [{ type: String }],
    slug: { type: String, required: true, unique: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    doi: { type: String },
    externalUrl: { type: String },
    downloadCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

PublicationSchema.index({ 'title.en': 'text', 'abstract.en': 'text', tags: 'text' });
PublicationSchema.index({ year: -1 });
PublicationSchema.index({ type: 1 });
PublicationSchema.index({ tags: 1 });
PublicationSchema.index({ slug: 1 });

export default mongoose.models.Publication || mongoose.model<IPublication>('Publication', PublicationSchema);
