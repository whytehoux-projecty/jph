import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes
const IV_LENGTH = 16;

/**
 * Deterministic encryption allows for querying by the encrypted value.
 * Warning: Not semantically secure since identical plaintexts yield identical ciphertexts.
 */
export function encryptDeterministic(text: string): string {
    if (!text) return text;
    // Use a static IV for deterministic encryption so we can query it in the DB
    const iv = Buffer.alloc(IV_LENGTH, 0); 
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function decryptDeterministic(encryptedText: string): string {
    if (!encryptedText) return encryptedText;
    try {
        const iv = Buffer.alloc(IV_LENGTH, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (e) {
        console.error('Decryption error:', e);
        return encryptedText; // return original if decryption fails (e.g. legacy unencrypted data)
    }
}
