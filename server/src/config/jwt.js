import './env.js';
import crypto from 'crypto';

let resolvedSecret = (process.env.JWT_SECRET || '').trim();

if (!resolvedSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FATAL: JWT_SECRET environment variable must be configured in production.');
  }
  // Ephemeral fallback for non-production environments without .env
  resolvedSecret = crypto.randomBytes(48).toString('hex');
  console.warn('⚠️ [Security Notice] JWT_SECRET not found in environment; generated ephemeral session secret for this process.');
}

export const JWT_SECRET = resolvedSecret;
export const BCRYPT_ROUNDS = 12;
