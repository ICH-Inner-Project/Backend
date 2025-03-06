import { IResolvers } from '@graphql-tools/utils';
import { Post, IPost } from '@db/models/Post';
import { Types } from 'mongoose';
import { validatePostData } from '@utils/validate';
import { handleImageUpload } from '@utils/uploadImage';
import {
  addTimeToDate,
  isFuturePost,
  filterAndFormatPosts,
} from '@utils/dateUtils';

interface Context {
  user?: { id: string };
}

interface GetPostArgs {
  id: string;
}

interface ListPostsArgs {
  limit?: number;
  offset?: number;
  onlyMine?: boolean;
  excludeMine?: boolean;
  sort?: 'new' | 'old';
}

interface SearchPostsArgs {
  query: string;
}

interface RandomPostsArgs {
  n: number;
  onlyMine?: boolean;
}

interface UserPostsArgs {}

interface CreatePostArgs {
  title: string;
  content: string;
  image?: string;
  publishedAt?: string;
  description: string;
}

interface UpdatePostArgs extends CreatePostArgs {
  id: string;
}

interface DeletePostArgs {
  id: string;
}

export const postResolver: IResolvers = {
  Query: {
    async getPost(
      _: unknown,
      { id }: GetPostArgs,
      context: Context
    ): Promise<IPost | null> {
      console.log(context);
      if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      if (isFuturePost(post.publishedAt?.toISOString())) {
        throw new Error('Post cannot be from the future');
      }
      return post;
    },

    async listPosts(
      _: unknown,
      { limit = 10, offset = 0, onlyMine, excludeMine, sort }: ListPostsArgs,
      context: Context
    ): Promise<IPost[]> {
      const filter: Record<string, any> = {};

      // Используем context.user.id для фильтрации постов по автору
      if (onlyMine && excludeMine) {
        throw new Error(
          'Only one option of onlyMine and excludeMine should be true'
        );
      }
      if (onlyMine && context.user?.id) {
        filter.authorId = context.user.id; // Отображать только посты текущего пользователя
      }

      if (excludeMine && context.user?.id) {
        filter.authorId = { $ne: context.user.id }; // Исключить посты текущего пользователя
      }

      const posts = await Post.find(filter)
        .sort(sort === 'new' ? { createdAt: -1 } : { createdAt: 1 })
        .skip(offset)
        .limit(limit);

      return filterAndFormatPosts(posts);
    },

    async searchPosts(
      _: unknown,
      { query }: SearchPostsArgs
    ): Promise<IPost[]> {
      const posts = await Post.find({
        $or: [{ title: { $regex: query, $options: 'i' } }],
      });
      return filterAndFormatPosts(posts);
    },

    async randomPosts(
      _: unknown,
      { n, onlyMine }: RandomPostsArgs,
      context: Context
    ): Promise<IPost[]> {
      if (!n || n <= 0) throw new Error("Parameter 'n' must be greater than 0");

      const filter: Record<string, any> = {};
      if (context.user?.id) {
        const userId = new Types.ObjectId(context.user.id);

        if (onlyMine) {
          filter.authorId = userId;
        } else {
          filter.authorId = { $ne: userId };
        }
      }

      
      const currentDate = new Date();

      const posts = await Post.aggregate([
        { $match: filter },
        { $match: { publishedAt: { $lte: currentDate } } },
        { $sample: { size: n } },
        {
          $project: {
            id: '$_id',
            title: 1,
            content: 1,
            authorId: 1,
            createdAt: 1,
            updatedAt: 1,
            publishedAt: 1,
            image: 1,
          },
        },
      ]);

      const hydratedPosts = posts.map((post) => Post.hydrate(post));

      return hydratedPosts.map((post) => post.toObject());
    },

    async userPosts(
      _: unknown,
      __: UserPostsArgs,
      context: Context
    ): Promise<IPost[]> {
      if (!context.user?.id) throw new Error('Unauthorized');
      const posts = await Post.find({ authorId: context.user.id });
      return filterAndFormatPosts(posts);
    },
  },

  Mutation: {
    async createPost(
      _: unknown,
      { title, content, image, publishedAt, description }: CreatePostArgs,
      context: Context
    ): Promise<IPost> {
      if (!context.user || !context.user.id) {
        throw new Error('Unauthorized');
      }

      validatePostData(title, content, description);
      const imageUrl = image || '';

      const fullPublishedAt = publishedAt
        ? addTimeToDate(publishedAt)
        : undefined;

      const post = await new Post({
        title,
        content,
        authorId: context.user.id,
        image: imageUrl,
        publishedAt: fullPublishedAt,
        description,
      }).save();

      return post.toObject();
    },

    async updatePost(
      _: unknown,
      { id, title, content, image, publishedAt, description }: UpdatePostArgs,
      context: Context
    ): Promise<IPost | null> {
      if (!context.user?.id) throw new Error('User is not authorized');

      const post = await Post.findById(id);
      if (!post || post.authorId.toString() !== context.user.id) {
        throw new Error('Permission denied');
      }

      validatePostData(title, content, description);

      const imageUrl = image || post.image;
      const fullPublishedAt = publishedAt
        ? addTimeToDate(publishedAt)
        : post.publishedAt;

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          title,
          content,
          image: imageUrl,
          publishedAt: fullPublishedAt,
          description,
        },
        { new: true }
      );

      if (!updatedPost) throw new Error('Post update failed');

      return updatedPost.toObject();
    },

    async deletePost(
      _: unknown,
      { id }: DeletePostArgs,
      context: Context
    ): Promise<boolean> {
      if (!context.user?.id) throw new Error('User is not authorized');

      const post = await Post.findById(id);
      if (!post || post.authorId.toString() !== context.user.id) {
        throw new Error('Permission denied');
      }

      await Post.findByIdAndDelete(id);
      return true;
    },
  },
};
