import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

/**
 * Генерирует JWT токен с заданным payload и временем жизни.
 *
 * @param payload - Данные, которые будут закодированы в токене.
 * @param expiresIn - Время жизни токена. По умолчанию '1d'.
 * @returns Сгенерированный JWT токен.
 */
function generateToken(
  payload: Record<string, unknown>,
  expiresIn: string = '1d'
): string {
  const secretKey: string = process.env.JWT_SECRET || 'your-secret-key';
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secretKey, options);
}

/**
 * Проверяет валидность JWT токена и возвращает декодированные данные.
 *
 * @param token - JWT токен для проверки.
 * @returns Декодированные данные из токена или null, если токен недействителен.
 */
function verifyToken(token: string): JwtPayload | null {
  const secretKey: string = process.env.JWT_SECRET || 'your-secret-key';
  try {
    return jwt.verify(token, secretKey) as JwtPayload;
  } catch (error) {
    console.error('Invalid token:', (error as Error).message);
    return null;
  }
}

export { generateToken, verifyToken };
