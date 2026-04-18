import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

// The key should be a 32-byte hex string (64 characters)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (process.env.NODE_ENV === 'production' && !ENCRYPTION_KEY) {
  throw new Error('CRITICAL: ENCRYPTION_KEY environment variable is missing in production');
}

/**
 * Production-grade encryption utility for PII.
 * Uses AES-256-GCM for authenticated encryption.
 * 
 * @param text - The plain text to encrypt.
 * @returns The encrypted string in the format iv:authTag:encryptedData.
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  if (!ENCRYPTION_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY environment variable is missing');
    }
    // Fallback for dev if not set, but warn
    console.warn('ENCRYPTION_KEY is missing, using insecure fallback');
    return `raw:${text}`;
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts data encrypted with the encrypt function.
 * 
 * @param encryptedText - The encrypted string in iv:authTag:encryptedData format.
 * @returns The decrypted plain text.
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  // Handle fallback or unencrypted data
  if (encryptedText.startsWith('raw:')) {
    return encryptedText.substring(4);
  }

  if (!ENCRYPTION_KEY) {
    return '[ENCRYPTED]';
  }

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      return encryptedText; // Not in our expected format
    }

    const [ivHex, authTagHex, encryptedData] = parts;
    const key = Buffer.from(ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: 16 });
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[DECRYPTION_FAILED]';
  }
}

// Keep aliases for backward compatibility if needed, but mark as deprecated
export const encryptPII = encrypt;
export const decryptPII = decrypt;
