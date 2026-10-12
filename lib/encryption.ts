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
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

    // Fast check: A valid AES-256-CBC hex ciphertext must:
    // 1. Be non-empty and at least one 16-byte block (32 hex characters)
    // 2. Have a length that is a multiple of 32 hex characters
    // 3. Contain only hexadecimal characters (0-9, a-f, A-F)
    // Plain text values (e.g. "1234567", "12345", SSNs, phone numbers) fail this check and are returned directly.
    if (encryptedText.length < 32 || encryptedText.length % 32 !== 0 || !/^[0-9a-fA-F]+$/.test(encryptedText)) {
        return encryptedText;
    }

    try {
        const iv = Buffer.alloc(IV_LENGTH, 0);
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch {
        // Return original unencrypted/corrupt text gracefully without polluting logs
        return encryptedText;
    }
}

