import { IResolvers } from '@graphql-tools/utils';
import { generateToken } from '@utils/jwt';
import { comparePassword } from '@utils/bcrypt';
import { User, IUser } from '@db/models/User';
import { GraphQLUpload, FileUpload } from 'graphql-upload-ts';

import nodemailer from 'nodemailer';
import { handleImageUpload } from '@utils/uploadImage';

type AuthPayload = {
  token: string;
  user: IUser;
};

export const userResolver: IResolvers = {
  Upload: GraphQLUpload,
  Query: {
    users: async (_: any) => {
      try {
        return await User.find();
      } catch (error) {
        `Error loading users: ${(error as Error).message}`;
      }
    },
    user: async (_: any, { id }: { id: string }) => {
      try {
        return await User.findById(id);
      } catch (error) {
        throw new Error(`Find user by id error: ${(error as Error).message}`);
      }
    },
    me: async (_: any, __: any, context: any) => {
      const user = await User.findById(context.user.id);
      return user;
    },
  },
  Mutation: {
    login: async (
      _: any,
      { username, password }: { username: string; password: string }
    ): Promise<AuthPayload> => {
      try {
        const user = await User.findOne({ username });

        if (!user) {
          throw new Error('User not found');
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        const token = generateToken({ id: user.id, role: user.role }, '1d');

        return {
          user,
          token,
        };
      } catch (error) {
        throw new Error(`Login error: ${(error as Error).message}`);
      }
    },
    createUser: async (
      _: any,
      {
        username,
        password,
        phone,
        birthday,
        gender,
        role,
        firstName,
        lastName,
        avatar,
      }: {
        username: string;
        phone: string;
        role: string;
        password: string;
        birthday: string;
        gender: string;
        firstName: string;
        lastName: string;
        avatar?: FileUpload | null;
      }
    ): Promise<IUser> => {
      console.log('Creating user...');
      try {
        const doesUserExist = await User.findOne({
          $or: [{ username }, { phone }],
        });

        if (doesUserExist) {
          throw new Error('User with this username or phone already exists.');
        }

        let base64Avatar: string | null = null;

        if (avatar) {
          const resolvedAvatar = await avatar;
          base64Avatar = await handleImageUpload(resolvedAvatar);
        }

        const user = new User({
          username,
          phone,
          role,
          birthday,
          gender,
          firstName,
          lastName,
          password,
          avatar: base64Avatar,
        });

        await user.save();

        const userObject = user.toObject();
        userObject.id = user.id;
        delete userObject._id;

        const token = generateToken({ id: user.id, role: user.role }, '1d');

        return userObject;
      } catch (error) {
        throw new Error(`User create error: ${(error as Error).message}`);
      }
    },
    updateUser: async (
      _: any,
      {
        id,
        username,
        phone,
        birthday,
        gender,
        role,
        firstName,
        lastName,
        avatar,
      }: {
        id: string;
        username?: string;
        phone?: string;
        birthday?: string;
        gender?: string;
        role?: string;
        firstName?: string;
        lastName?: string;
        avatar?: FileUpload | null;
      },
      context: any
    ): Promise<IUser> => {
      try {
        if (!context.user) {
          throw new Error('Unauthorized');
        }

        let updating: Partial<IUser> = {};
        const updateIfExists = (key: string, value: any) => {
          if (value !== undefined && value !== null) {
            updating = { ...updating, [key]: value };
          }
        };

        updateIfExists('username', username);
        updateIfExists('phone', phone);
        updateIfExists('birthday', birthday);
        updateIfExists('gender', gender);
        updateIfExists('role', role);
        updateIfExists('firstName', firstName);
        updateIfExists('lastName', lastName);

        let base64Avatar: string | null = null;

        if (avatar) {
          const resolvedAvatar = await avatar;
          base64Avatar = await handleImageUpload(resolvedAvatar);
        }

        updateIfExists('avatar', base64Avatar);

        const doesUserExist = await User.findOne({
          $or: [{ username }, { phone }],
          _id: { $ne: id },
        });

        if (doesUserExist) {
          throw new Error('User with this username or phone already exists.');
        }

        const updatedUser = await User.findByIdAndUpdate(id, updating, {
          new: true,
        });

        if (!updatedUser) {
          throw new Error('User not found');
        }
        return updatedUser;
      } catch (error) {
        throw new Error(`User update error: ${(error as Error).message}`);
      }
    },
    deleteUser: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
          throw new Error('User not found');
        }

        return true;
      } catch (error) {
        throw new Error(`User delete error: ${(error as Error).message}`);
      }
    },
    sendEmail: async (
      _: any,
      {
        from,
        to,
        subject,
        body,
      }: { from: string; to: string; subject: string; body: string }
    ): Promise<boolean> => {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.PASS_USER,
        },
      });

      const mailOptions = {
        from,
        to,
        subject,
        text: body,
      };
      try {
        await transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        throw new Error(`Failed to send email: ${(error as Error).message}`);
      }
    },
  },
};
