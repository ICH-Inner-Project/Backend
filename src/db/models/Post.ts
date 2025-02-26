import { Schema, model, Document } from 'mongoose';

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  image?: string;
}

const postSchema = new Schema<IPost>({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, maxlength: 100, required: true },
  content: { type: String, required: true },
  image: { type: String },
}, {
    timestamps: true,
});

export const Post = model<IPost>('Post', postSchema);

