import { IResolvers } from '@graphql-tools/utils';
import { Post } from '@db/models/Post';
import { Types } from 'mongoose';
import { validatePostData } from '@utils/validate';
import { handleImageUpload } from '@utils/uploadImage';

export const postResolver: IResolvers = {
  Query: {
    async getPost(_, { id }, context) {
      console.log(context);
      if (!Types.ObjectId.isValid(id)) {
        throw new Error('Invalid ID format');
      }

      const post = await Post.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      return post;
    },

    async listPosts(
      _,
      { limit = 10, offset = 0, onlyMine, excludeMine, sort },
      context
    ) {
      const filter: any = {};

      // Используем context.user.id для фильтрации постов по автору
      if (onlyMine && context.user.id) {
        filter.authorId = context.user.id; // Отображать только посты текущего пользователя
      }

      if (excludeMine && context.user.id) {
        filter.authorId = { $ne: context.user.id }; // Исключить посты текущего пользователя
      }

      return await Post.find(filter)
        .sort(sort === 'new' ? { createdAt: -1 } : { createdAt: 1 })
        .skip(offset)
        .limit(limit);
    },

    async searchPosts(_, { query }) {
      return await Post.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      });
    },

    async randomPosts(_, { n, onlyMine }, context) {
      if (!n || n <= 0) throw new Error("Parameter 'n' must be greater than 0");

      const filter: any = {};
      if (onlyMine && context?.user?.id) {
        filter.authorId = context.user.id;
      }

      const posts = await Post.aggregate([
        { $match: filter },
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

      return posts;
    },

    async userPosts(_, __, context) {
      if (!context.user.id) throw new Error('Unauthorized');
      return await Post.find({ authorId: context.user.id });
    },
  },

  Mutation: {
    async createPost(
      _,
      { title, content, image, publishedAt, description },
      context
    ) {
      if (!context.user || !context.user.id) {
        console.log(context.user);
        throw new Error('Unauthorized');
      }

      // Валидация данных
      validatePostData(title, content,description);

      // Обработка изображения
      // const imageUrl = image ? await handleImageUpload(image) : null;
      const imageUrl = image ? image : '';

      return await new Post({
        title,
        content,
        authorId: context.user.id,
        image: imageUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        description: description,
      }).save();
    },

    async updatePost(
      _,
      { id, title, content, image, publishedAt, description },
      context
    ) {
      if (!context.user.id) throw new Error('User is not authorized');

      const post = await Post.findById(id);

      if (!post || post.authorId.toString() !== context.user.id) {
        throw new Error('Permission denied');
      }
      validatePostData(title, content, description);
      // const imageUrl = image ? await handleImageUpload(image) : post.image;
      const imageUrl = image ? image : '';
      return await Post.findByIdAndUpdate(
        id,
        {
          title,
          content,
          image: imageUrl,
          publishedAt,
          description,
        },
        { new: true }
      );
    },

    async deletePost(_, { id }, context) {
      if (!context.user.id) throw new Error('User is not authorized');

      const post = await Post.findById(id);

      if (!post || post.authorId.toString() !== context.user.id) {
        throw new Error('Permission denied');
      }

      await Post.findByIdAndDelete(id);
      return true;
    },
  },
};
