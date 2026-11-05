import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.length < 16) {
    console.error(`[Segurança] ${name} ausente ou curta demais.`);
    throw new Error('Configuração de segurança ausente.');
  }
  return v;
}

/** Chaves obrigatórias, sem valor padrão. Lidas sob demanda para não quebrar o build. */
const getSecretKey = () => crypto.createHash('sha256').update(requireEnv('PII_ENCRYPTION_KEY')).digest();
const getHmacSecret = () => requireEnv('PII_HMAC_SECRET');

/**
 * Criptografa uma string PII usando AES-256-GCM
 */
export function encryptPII(text: string | undefined | null): string {
  if (!text) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
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
    const decipher = crypto.createDecipheriv(ALGORITHM, getSecretKey(), iv);
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
  return crypto.createHmac('sha256', getHmacSecret()).update(sanitized).digest('hex');
}
