export function validatePostData(
  title: string,
  content: string,
  description: string
) {
  if (!title || title.length < 5 || title.length > 100) {
    throw new Error('Title must be between 5 and 100 characters.');
  }

  if (!content||  content.length < 10||  content.length > 8000000) {
    throw new Error('Content must be between 10 and 8,000,000 characters.');
  }

  if (!description || description.length > 100) {
    throw new Error('Description must be at most 100 characters long.');
  }
}