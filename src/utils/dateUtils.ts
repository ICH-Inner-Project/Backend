import { parseISO, isAfter } from 'date-fns';
import { IPost } from '@db/models/Post';
export function addTimeToDate(date: string | null): Date | null {
  if (!date) return null;

  const parsedDate = new Date(date);
  const now = new Date();

  if (parsedDate.getTime() < now.getTime()) {
    throw new Error('Published date cannot be in the past');
  }

  return parsedDate;
}

export function isFuturePost(publishedAt?: string): boolean {
  if (!publishedAt) return false;

  const currentDate = new Date();
  const postDate = parseISO(publishedAt);

  return isAfter(postDate, currentDate);
}

export const filterAndFormatPosts = (posts: IPost[]): IPost[] => {
  const filteredPosts = posts.filter(
    (post) => !isFuturePost(post.publishedAt?.toISOString())
  );
  return filteredPosts.map((post) => post.toObject());
};
