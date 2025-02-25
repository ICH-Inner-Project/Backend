import { Schema, model, Document } from 'mongoose';

interface IPost extends Document {
  title: string;
  description: string;
  content: string;
  isDraft: boolean;
  isScheuduled: boolean;
  image?: string;
  createAt: Date;
  updateAt: Date;
}

const postSchema = new Schema<IPost>({
  title: { type: String, trim: true, required: true },
  description: { type: String, trim: true, maxlength: 100, required: true },
  content: { type: String, required: true },
  isDraft: { type: Boolean, default: false },
  isScheuduled: { type: Boolean, default: false },
  image: { type: String },
  createAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

postSchema.pre('save', function (next) {
  this.updateAt = new Date();
  next();
});

const Post = model<IPost>('Post', postSchema);

export default Post;
