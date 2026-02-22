import CryptoJS from 'crypto-js';

/**
 * Lazily resolves the encryption key on first use (after dotenv has loaded).
 * ES imports are hoisted above dotenv.config(), so we can't check at module load time.
 */
let _cachedKey: string | null = null;

function getEncryptionKey(): string {
    if (_cachedKey) return _cachedKey;

    if (!process.env.ENCRYPTION_KEY) {
        console.error('\n❌ FATAL: ENCRYPTION_KEY environment variable is not set.');
        console.error('   This key is required to encrypt/decrypt AI provider API keys.');
        console.error('   Please set ENCRYPTION_KEY in your .env file or environment variables.\n');
        process.exit(1);
    }

    _cachedKey = process.env.ENCRYPTION_KEY;
    return _cachedKey;
}

export const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, getEncryptionKey()).toString();
};

export const decrypt = (ciphertext: string): string => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey());
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
        throw new Error('Decryption failed — ENCRYPTION_KEY may be incorrect or missing');
    }
    return decrypted;
};
