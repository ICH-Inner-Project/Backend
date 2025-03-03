import { IResolvers } from '@graphql-tools/utils';
import { Post } from '@db/models/Post';
import { validatePostData } from '@utils/validate';
import { uploadImage } from '@utils/uploadImage';
import { verifyToken } from '@utils/jwt';

export const postResolver: IResolvers = {
  Query: {
    async getPost(_, { id }) {
      // Получение одного поста по id
      return await Post.findById(id);
    },

    async listPosts(
      _,
      { limit = 10, offset = 0, onlyMine, excludeMine, sort },
      { authToken }
    ) {
      const user = verifyToken(authToken); // Проверка авторизации

      const filter: any = {};

      // Фильтрация постов
      if (onlyMine && user) filter.authorId = user.id;
      if (excludeMine && user) filter.authorId = { $ne: user.id };

      // Основной запрос
      const posts = await Post.find(filter)
        .sort(sort === 'new' ? { createdAt: -1 } : { createdAt: 1 }) // Сортировка по дате
        .skip(offset) // Пропуск данных по offset
        .limit(limit); // Ограничение на количество постов

      return posts;
    },

    async searchPosts(_, { query }) {
      // Поиск постов по заголовку или контенту
      return await Post.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
        ],
      });
    },
  },

  Mutation: {
    async createPost(_, { title, content, image, publishedAt }, { authToken }) {
      const user = verifyToken(authToken);
      if (!user) throw new Error('Unauthorized');

      validatePostData(title, content);

      const imageUrl = image ? await uploadImage(image) : null;

      return await new Post({
        title,
        content,
        authorId: user.id,
        image: imageUrl, 
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }).save();
    },

    async updatePost(
      _,
      { id, title, content, image, publishedAt },
      { authToken }
    ) {
      const user = verifyToken(authToken);
      if (!user) {
        throw new Error('User is not authorized');
      }
      const post = await Post.findById(id);

      if (!post || post.authorId.toString() !== user.id) {
        throw new Error('Permission denied');
      }

      const imageUrl = image ? await uploadImage(image) : post.image;

      return await Post.findByIdAndUpdate(
        id,
        { title, content, image: imageUrl, publishedAt },
        { new: true }
      );
    },

    async deletePost(_, { id }, { authToken }) {
      const user = verifyToken(authToken);
      if (!user) {
        throw new Error('User is not authorized');
      }

      const post = await Post.findById(id).lean();

      if (!post || post.authorId.toString() !== user.id) {
        throw new Error('Permission denied');
      }

      await Post.findByIdAndDelete(id);
      return true;
    },
  },
};
