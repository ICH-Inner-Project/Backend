export function validatePostData(
  title: string,
  content: string,
  description: string
) {
  if (!title || title.length < 1 || title.length > 40) {
    throw new Error('Title must be between 1 and 40 characters.');
  }

  if (!content || content.length < 1 || content.length > 1000) {
    throw new Error('Content must be between 1 and 1000 characters.');
  }

  if (!description || description.length > 100) {
    throw new Error('Description must be at most 100 characters long.');
  }
}
