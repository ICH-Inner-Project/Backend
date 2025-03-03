import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Разрешенные расширения изображений
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

// Максимальный размер изображения в байтах ( 2MB)
const MAX_SIZE = 2 * 1024 * 1024;

// Функция для проверки расширения файла
function checkFileExtension(filename: string): boolean {
  const extname = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(extname);
}

// Функция для сжатия изображения и конвертации в Base64
export async function compressAndConvertToBase64(imagePath: string, fileExtension: string): Promise<string> {
  const imageBuffer = await sharp(imagePath)
    .resize({ width: 800, height: 800, fit: 'inside' }) // Уменьшаем изображение до 800x800
    .toBuffer();

  // Проверка размера изображения
  if (imageBuffer.length > MAX_SIZE) {
    throw new Error('Image size exceeds the maximum allowed size of 2MB');
  }

  // Определяем MIME type в зависимости от расширения
  let mimeType = 'image/jpeg'; 
  if (fileExtension === '.png') mimeType = 'image/png';
  else if (fileExtension === '.gif') mimeType = 'image/gif';

  // Конвертация в Base64 с правильным MIME type
  return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
}

// Основная функция для загрузки и обработки изображения
export async function handleImageUpload(imageFile: Express.Multer.File): Promise<string> {
  const { originalname, path: tempPath } = imageFile;
  const fileExtension = path.extname(originalname).toLowerCase();

  // Проверка расширения файла
  if (!checkFileExtension(originalname)) {
    throw new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.');
  }

  try {
    // Конвертируем изображение в Base64 и сжимаем его
    const base64Image = await compressAndConvertToBase64(tempPath, fileExtension);
    
    // Удаляем временный файл после обработки
    fs.unlinkSync(tempPath);

    return base64Image;
  } catch (error) {
    // Удаляем временный файл в случае ошибки
    fs.unlinkSync(tempPath);
    throw new Error('Error processing the image: ' + (error as Error).message);
  }
}