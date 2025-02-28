import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

export const encryptContent = (content: string): string => {
  return CryptoJS.AES.encrypt(content, ENCRYPTION_KEY).toString();
};

export const decryptContent = (encryptedContent: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedContent, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}; 