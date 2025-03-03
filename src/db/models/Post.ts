import { Schema, model, Document, Types} from 'mongoose';

export interface IPost extends Document {

  title: string;
  description: string;
  content: string;
  image?: string;
  authorId:Types.ObjectId
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, maxlength: 100, required: true },
    content: { type: String, required: true },
    image: { type: String },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  }
);

export const Post = model<IPost>('Post', postSchema);

