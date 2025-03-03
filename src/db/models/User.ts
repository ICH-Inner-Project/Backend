import { hashPassword } from "@utils/bcrypt";

import { Schema, model, Document, Types } from 'mongoose';

export enum Roles {
    user = "user",
    admin = "admin",
}

export interface IUser extends Document {
  username: string;
  password: string;
  phone: string;
  birthday: Date;
  gender: string;
  firstName: string;
  lastName: string;
  posts: Types.ObjectId[];
  role: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, trim: true, required: true },
  password: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  birthday: { type: Date, trim: true, required: true },
  gender: { type: String, trim: true, required: true },
  firstName: { type: String, trim: true, required: true },
  lastName: { type: String, trim: true, required: true },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  role: { type: String, trim: true, required: true },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await hashPassword(this.password);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

export const User = model<IUser>('UserChatty', userSchema);

