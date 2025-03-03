export function validatePostData(title: string, content: string) {
  if (!title || title.length < 5 || title.length > 100) {
    throw new Error('Title must be between 5 and 100 characters.');
  }
  if (!content || content.length < 10) {
    throw new Error('Content must be at least 10 characters long.');
  }
}
