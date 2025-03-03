import { Client as MinioClient } from 'minio';

// Создание клиента MinIO
const minioClient = new MinioClient({
  endPoint: 'your-minio-endpoint',  // Например, 'play.min.io'
  port: 9000,                      // Порт MinIO
  useSSL: true,                     // Использовать SSL или нет
  accessKey: 'your-access-key',     // Ваш access key
  secretKey: 'your-secret-key'      // Ваш secret key
});

export async function uploadImage(file: any): Promise<string> {
  const { createReadStream, filename, mimetype, encoding } = await file;

  // Ограничение на типы изображений
  if (!['image/jpeg', 'image/png'].includes(mimetype)) {
    throw new Error('Only JPEG and PNG images are allowed.');
  }

  // Ограничение на размер файла (2MB)
  const fileSize = encoding.length; // Получаем размер файла из encoding
  if (fileSize > 2 * 1024 * 1024) { // 2MB
    throw new Error('File size must be under 2MB.');
  }

  // Получение потока из файла
  const fileStream = createReadStream();

  // Загружаем изображение в MinIO
  const bucketName = 'your-bucket-name';
  const objectName = `uploads/${filename}`; // Имя объекта (файла) в бакете

  // Загружаем объект в MinIO
  await minioClient.putObject(bucketName, objectName, fileStream);

  // Сформируем публичный URL для доступа к изображению
  const imageUrl = `https://your-minio-endpoint/your-bucket-name/${objectName}`;

  return imageUrl;
}