import { parseISO, isAfter } from 'date-fns';
import { IPost } from '@db/models/Post';
export function addTimeToDate(date: string | null): Date | null {
  if (!date) return null;

  const [year, month, day] = date.split('-').map(Number);

  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    throw new Error('Invalid date format');
  }

  const parsedDate = new Date(year, month - 1, day);
  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date format');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  parsedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0);

  if (parsedDate < today) {
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