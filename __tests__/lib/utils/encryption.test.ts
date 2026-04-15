/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */

describe('Encryption Utility', () => {
  const originalEnv = process.env;
  let encrypt: any;
  let decrypt: any;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    
    // Re-import modules to pick up the new env var
    const encryption = require('@/lib/utils/encryption');
    encrypt = encryption.encrypt;
    decrypt = encryption.decrypt;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should encrypt and decrypt text correctly', () => {
    const text = 'Sensitive PII Data';
    const encrypted = encrypt(text);
    expect(encrypted).not.toBe(text);
    expect(encrypted.split(':')).toHaveLength(3);

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should return empty string for empty input', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('should return original text for non-3-part data', () => {
    const corrupted = 'invalid-format';
    const result = decrypt(corrupted);
    expect(result).toBe(corrupted);
  });

  it('should return [DECRYPTION_FAILED] for corrupted 3-part data', () => {
    const corrupted = 'invalid:format:data';
    const result = decrypt(corrupted);
    expect(result).toBe('[DECRYPTION_FAILED]');
  });

  it('should return [DECRYPTION_FAILED] for invalid hex data', () => {
    const corrupted = 'nothex:nothex:nothex';
    const result = decrypt(corrupted);
    expect(result).toBe('[DECRYPTION_FAILED]');
  });

  it('should use fallback in non-production if key is missing', () => {
    jest.resetModules();
    delete process.env.ENCRYPTION_KEY;
    process.env.NODE_ENV = 'development';
    
    const { encrypt: devEncrypt, decrypt: devDecrypt } = require('@/lib/utils/encryption');
    
    const text = 'Dev Data';
    const encrypted = devEncrypt(text);
    expect(encrypted).toBe(`raw:${text}`);
    
    const decrypted = devDecrypt(encrypted);
    expect(decrypted).toBe(text);
  });
});
