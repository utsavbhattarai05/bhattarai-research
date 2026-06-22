import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  year: string;
  title: { en: string; ne?: string };
  description: { en: string; ne?: string };
  category: 'early_life' | 'education' | 'career' | 'research' | 'achievement';
  imageUrl?: string;
  sortOrder: number;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    year: { type: String, required: true },
    title: {
      en: { type: String, required: true },
      ne: { type: String },
    },
    description: {
      en: { type: String, required: true },
      ne: { type: String },
    },
    category: {
      type: String,
      enum: ['early_life', 'education', 'career', 'research', 'achievement'],
      required: true,
    },
    imageUrl: { type: String },
    sortOrder: { type: Number, required: true },
    isCurrent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MilestoneSchema.index({ sortOrder: 1 });

export default mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);
