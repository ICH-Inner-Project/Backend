import { FileUpload } from 'graphql-upload-ts';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Разрешенные расширения изображений
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// Максимальный размер изображения в байтах (2MB)
const MAX_SIZE = 2 * 1024 * 1024;

//Функция для проверки расширения файла
function checkFileExtension(extname: string): boolean {
  // console.log('Проверка расширения:', extname);
  // console.log('Допустимые расширения:', ALLOWED_EXTENSIONS);
  return ALLOWED_EXTENSIONS.includes(extname);
}

// Функция для сжатия изображения и конвертации в Base64
export async function compressAndConvertToBase64(
  imageBuffer: Buffer,
  fileExtension: string
): Promise<string> {
  const imageResizedBuffer = await sharp(imageBuffer)
    .resize({ width: 800, height: 800, fit: 'inside' }) // Уменьшаем изображение до 800x800
    .toBuffer();

  // Проверка размера изображения
  if (imageResizedBuffer.length > MAX_SIZE) {
    throw new Error('The image size exceeds the maximum allowed size of 2MB');
  }

  // Определяем MIME тип в зависимости от расширения
  let mimeType = 'image/jpeg';
  if (fileExtension === '.png') mimeType = 'image/png';
  else if (fileExtension === '.gif') mimeType = 'image/gif';
  else if (fileExtension === '.jpg') mimeType = 'image/jpeg';

  // Конвертируем в Base64 с правильным MIME типом
  return `data:${mimeType};base64,${imageResizedBuffer.toString('base64')}`;
}

// Основная функция для загрузки и обработки изображения
export async function handleImageUpload(
  imageFile: FileUpload
): Promise<string> {
  const resolvedFile = await imageFile; // Ожидание промиса (если нужно)
  // console.log('Получен файл:', resolvedFile);

  const { createReadStream, filename } = resolvedFile;

  if (!filename) {
    throw new Error('The file does not have a name');
  }

  // console.log('Имя файла:', filename);
  const fileExtension = path.extname(filename).toLowerCase().trim();

  // Проверка расширения файла
  if (!checkFileExtension(fileExtension)) {
    throw new Error('Invalid file type. Only JPG, PNG, and GIF are allowed');
  }

  if (!createReadStream) {
    throw new Error('СreateReadStream is missing.');
  }

  try {
    // Чтение потока файла
    const stream = createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    const imageBuffer = Buffer.concat(chunks); // Здесь создается правильный Buffer без дополнительных типов

    // Конвертируем изображение в Base64 и сжимаем его
    const base64Image = await compressAndConvertToBase64(
      imageBuffer,
      fileExtension
    );

    return base64Image;
  } catch (error) {
    throw new Error(
      'Error while processing the image: ' + (error as Error).message
    );
  }
}
