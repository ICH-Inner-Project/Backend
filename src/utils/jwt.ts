import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secretKey = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, secretKey, { expiresIn: '1d' });
}

export function verifyToken(
  token: string,
): { userId: string, role: string } | null {
  try {
    return jwt.verify(token, secretKey) as { userId: string, role: string };
  } catch (err) {
    console.log(`Error occured: ${(err as Error).message}`);
    return null;
  }
}
