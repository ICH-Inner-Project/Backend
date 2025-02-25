import { Schema, model, Document, Types } from 'mongoose';
export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  fullName: string;
  password: string;
  phone_number?: string; 
  role: 'user' | 'admin' | 'moderator';
  date_of_birth: Date;
  sex?: 'male' | 'female' | 'other'; 
  avatar?:string,
  posts: Types.ObjectId[]; 
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true },
    phone_number: { type: String, required: false },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    date_of_birth: { type: Date, required: true },
    sex: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false,
    },
    avatar: { type: String, required: false },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: false,
      },
    ],
  },
  { timestamps: true }
);

const User = model<IUser>('User', userSchema);

export default User;
