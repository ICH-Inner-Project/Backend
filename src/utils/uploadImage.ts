import { Client as MinioClient } from 'minio';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Функция для создания клиента MinIO
const createMinIOClient = ({
  endpoint = "localhost",
  port = 9000,
  accessKey = process.env.MINIO_ACCESS_KEY || "",
  secretKey = process.env.MINIO_SECRET_KEY || "",
  useSSL = false,
}: {
  endpoint?: string;
  port?: number;
  accessKey?: string;
  secretKey?: string;
  useSSL?: boolean;
}) => {
  console.log("Подключение к MinIO...");
  return new MinioClient({
    endPoint: endpoint,
    port: port,
    accessKey: accessKey,
    secretKey: secretKey,
    useSSL: useSSL,
  });
};

// Функция для создания бакета в MinIO (если его нет)
const createBucket = async (client: MinioClient, bucketName: string) => {
  const exists = await client.bucketExists(bucketName);
  if (!exists) {
    await client.makeBucket(bucketName, "");
  }
  return bucketName;
};

// Функция для загрузки изображения в base64 в MinIO
const uploadBase64Media = async (
  client: MinioClient,
  base64Media: string,
  objectName?: string
): Promise<string> => {
  await createBucket(client, "media");

  const buffer = Buffer.from(base64Media, "base64");
  const uniqueObjectName = objectName || `uploads/${crypto.randomUUID()}.jpg`;

  await client.putObject("media", uniqueObjectName, buffer);

  return uniqueObjectName;
};

// Создаем клиента MinIO
const minioClient = createMinIOClient({
  endpoint: process.env.MINIO_ENDPOINT,
  port: Number(process.env.MINIO_PORT),
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSL: true,
});

// Функция для загрузки изображения в MinIO
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
  const bucketName = 'media'; // Можно заменить на свой бакет
  const objectName = `uploads/${filename}`; // Имя объекта (файла) в бакете

  // Загружаем объект в MinIO
  await minioClient.putObject(bucketName, objectName, fileStream);

  // Сформируем публичный URL для доступа к изображению
  const imageUrl = `${process.env.MINIO_URL}/media/${objectName}`;

  return imageUrl;
}

// Функция для загрузки изображения в base64 в MinIO
export async function uploadBase64Image(base64Image: string, objectName?: string): Promise<string> {
  // Генерация уникального имени объекта
  const uniqueObjectName = objectName || `uploads/${crypto.randomUUID()}.jpg`; // Генерация уникального имени файла
  
  // Загружаем файл в MinIO из base64
  await uploadBase64Media(minioClient, base64Image, uniqueObjectName);

  // Сформируем публичный URL для доступа к изображению
  const imageUrl = `${process.env.MINIO_URL}/media/${uniqueObjectName}`;

  return imageUrl;
}