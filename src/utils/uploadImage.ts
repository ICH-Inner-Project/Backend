import { createWriteStream } from 'fs';
import path from 'path';

export async function uploadImage(file: any): Promise<string> {
  const { createReadStream, filename, mimetype } = await file;

  if (!['image/jpeg', 'image/png'].includes(mimetype)) {
    throw new Error('Only JPEG and PNG images are allowed.');
  }

  const fileSize = (await file).encoding.length;
  if (fileSize > 2 * 1024 * 1024) { // 2MB
    throw new Error('File size must be under 2MB.');
  }

  const filePath = path.join(__dirname, '../uploads', filename);
  await new Promise((resolve, reject) =>
    createReadStream()
      .pipe(createWriteStream(filePath))
      .on('finish', resolve)
      .on('error', reject)
  );

  return `/uploads/${filename}`;
}