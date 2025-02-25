import { Schema, model, Document } from 'mongoose';
import { hashPassword, comparePassword } from '../../utils/bcrypt';

interface IUser extends Document {
  username: string;
  password: string;
  phone: string;
  birthday: Date;
  gender: string;
  name: string;
  posts: string[];
  admin: boolean;
  createAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  username: { type: String, trim: true, required: true },
  password: { type: String, trim: true, required: true },
  phone: { type: String, trim: true, required: true },
  birthday: { type: Date, trim: true, required: true },
  gender: { type: String, trim: true, required: true },
  name: { type: String, trim: true, required: true },
  posts: [{ type: String, required: true }],
  admin: { type: Boolean, required: true },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
});

userSchema.methods.comparePassword = async function (password: string) {
  return await comparePassword(password, this.password);
};

const User = model<IUser>('User', userSchema);

export default User;
