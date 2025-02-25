import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';

function generateToken(payload: Record<string, unknown>, expiresIn: string = '1d'): string {
  const secretKey: string = process.env.JWT_SECRET || 'your-secret-key';
  const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, secretKey, options);
}
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