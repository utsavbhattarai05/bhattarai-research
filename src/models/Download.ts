import mongoose, { Schema, Document } from 'mongoose';

export interface IDownload extends Document {
  user: mongoose.Types.ObjectId;
  publication: mongoose.Types.ObjectId;
  downloadedAt: Date;
  ipAddress?: string;
}

const DownloadSchema = new Schema<IDownload>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  publication: { type: Schema.Types.ObjectId, ref: 'Publication', required: true },
  downloadedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
});

DownloadSchema.index({ user: 1, publication: 1 });
DownloadSchema.index({ publication: 1 });
DownloadSchema.index({ downloadedAt: -1 });

export default mongoose.models.Download || mongoose.model<IDownload>('Download', DownloadSchema);
