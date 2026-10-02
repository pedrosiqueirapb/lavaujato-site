import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.PII_ENCRYPTION_KEY 
  ? crypto.createHash('sha256').update(process.env.PII_ENCRYPTION_KEY).digest() 
  : crypto.createHash('sha256').update('lava-au-jato-camilly-secret-key-2026').digest();

const HMAC_SECRET = process.env.PII_HMAC_SECRET || 'lava-au-jato-hmac-salt-secret-2026';

/**
 * Criptografa uma string PII usando AES-256-GCM
 */
export function encryptPII(text: string | undefined | null): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    // Format: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Erro na criptografia PII:', error);
    return text;
  }
}

/**
 * Descriptografa uma string PII criptografada com AES-256-GCM
 */
export function decryptPII(encryptedFormatted: string | undefined | null): string {
  if (!encryptedFormatted) return '';
  if (!encryptedFormatted.includes(':')) return encryptedFormatted; // Caso esteja em texto puro
  
  try {
    const parts = encryptedFormatted.split(':');
    if (parts.length !== 3) return encryptedFormatted;
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    // Se falhar na descriptografia, retorna o valor original de forma graciosa
    return encryptedFormatted;
  }
}

/**
 * Gera um Hash HMAC SHA-256 determinístico para permitir busca de clientes
 */
export function hashPII(text: string | undefined | null): string {
  if (!text) return '';
  const sanitized = text.trim().toLowerCase();
  return crypto.createHmac('sha256', HMAC_SECRET).update(sanitized).digest('hex');
}
