import { IResolvers } from '@graphql-tools/utils';
import { hashPassword } from '../../utils/bcrypt';
import { generateToken, verifyToken } from '@utils/jwt';
import { User } from '@db/models/User';
import { Post } from '@db/models/Post';
import { Query, Types } from 'mongoose';

type AuthPayload = {
  status: number;
  token: string;
};

const userResolver: IResolvers = {
  Query: {
    users: async (_: any, { token }: { token: string }) => {
      try {
        if (!token) {
          throw new Error('Authorization token is required');
        }

        const verifiedToken = verifyToken(token);
        if (!verifiedToken) {
          throw new Error('Invalid or expired token');
        }

        return await User.find();
      } catch (error) {
        `Oшибка при загрузке пользователей: ${(error as Error).message}`;
      }
    },
    user: async (
      _: any,
      { id }: { id: string },
      { token }: { token: string }
    ) => {
      try {
        if (!token) {
          throw new Error('Authorization token is required');
        }

        const verifiedToken = verifyToken(token);
        if (verifiedToken) {
          throw new Error('Invalid or expired token');
        }

        return await User.findOne({ id });
      } catch (error) {
        throw new Error(
          `Find user by nickname error: ${(error as Error).message}`
        );
      }
    },
    me: async (_: any, { token }, { token: string }) => {},
  },
};
