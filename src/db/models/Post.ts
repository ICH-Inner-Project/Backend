import { Schema, model, Document, Types } from 'mongoose';
import { format } from 'date-fns';

export interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  image?: string;
  authorId: Types.ObjectId;
  publishedAt?: Date | null;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, maxlength: 100, required: true },
    content: { type: String, required: true },
    image: { type: String },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'UserChatty',
      required: true,
    },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,

    toObject: {
      virtuals: true,
      transform(doc, ret) {
        if (ret.publishedAt) {
          ret.publishedAt = format(
            new Date(ret.publishedAt),
            'yyyy-MM-dd HH:mm:ss'
          );
        }
        if (ret.createdAt) {
          ret.createdAt = format(
            new Date(ret.createdAt),
            'yyyy-MM-dd HH:mm:ss'
          );
        }
        if (ret.updatedAt) {
          ret.updatedAt = format(
            new Date(ret.updatedAt),
            'yyyy-MM-dd HH:mm:ss'
          );
        }
        return ret;
      },
    },
  }
);

export const Post = model<IPost>('PostChatty', postSchema);
