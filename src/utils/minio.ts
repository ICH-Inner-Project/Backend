import { Client } from 'minio';
import crypto from 'crypto';

export function createMinIOClient({
  endpoint = 'localhost',
  port = 9000,
  accessKey = process.env.MINIO_ACCESS_KEY || '',
  secretKey = process.env.MINIO_SECRET_KEY || '',
  useSSL = false,
}: {
  endpoint?: string;
  port?: number;
  accessKey?: string;
  secretKey?: string;
  useSSL?: boolean;
}): Client {
  console.log('подключились к MinIO');
  try {
    return new Client({
      endPoint: endpoint,
      port: port,
      accessKey: accessKey,
      secretKey: secretKey,
      useSSL: useSSL,
    });
  } catch (error) {
    console.error('Ошибка при подключении к MinIO:', error);
    throw new Error('Не удалось подключиться к MinIO');
  }
}

export async function createBucket(
  client: Client,
  bucketName: string
): Promise<string> {
  try {
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName, '');
    }
    return bucketName;
  } catch (error) {
    console.error('Ошибка при создании бакета:', error);
    throw new Error(`Не удалось создать бакет ${bucketName}`);
  }
}

function isValidBase64(str: string): boolean {
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  return base64Pattern.test(str);
}

export async function uploadBase64Media(
  client: Client,
  base64Media: string,
  objectName?: string
): Promise<string> {
  if (!isValidBase64(base64Media)) {
    throw new Error('Переданная строка не является валидным base64');
  }

  await createBucket(client, 'media');

  const buffer = Buffer.from(base64Media, 'base64');

  const uniqueObjectName = objectName || `media-${crypto.randomUUID()}`;

  try {
    await client.putObject('media', uniqueObjectName, buffer);
    return uniqueObjectName;
  } catch (error) {
    console.error('Ошибка при загрузке медиа в MinIO:', error);
    throw new Error('Не удалось загрузить медиа в MinIO');
  }
}

export async function getMedia(
  client: Client,
  objectName: string
): Promise<string> {
  try {
    const stream = await client.getObject('media', objectName);
    const chunks: Buffer[] = [];

    return new Promise(async (resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        const result = Buffer.concat(chunks).toString('utf-8');
        resolve(result);
      });

      stream.on('error', (error) => reject(error));
    });
  } catch (error) {
    console.error('Ошибка при получении медиа из MinIO:', error);
    throw new Error('Не удалось получить медиа из MinIO');
  }
}
