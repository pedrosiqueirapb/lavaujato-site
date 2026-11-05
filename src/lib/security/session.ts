import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'lava_admin_session';
/** Segredo obrigatório: sem valor padrão. Lido sob demanda para não quebrar o build. */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    console.error('[Segurança] ADMIN_SESSION_SECRET ausente ou com menos de 32 caracteres.');
    throw new Error('Configuração de segurança ausente.');
  }
  return secret;
}

export interface SessionData {
  authenticated: boolean;
  authenticatedAt: number;
  is2FAVerified: boolean;
}

/**
 * Cria um token de sessão assinado com HMAC
 */
export function createSessionToken(data: SessionData): string {
  const jsonStr = JSON.stringify(data);
  const base64Str = Buffer.from(jsonStr).toString('base64url');
  const signature = crypto.createHmac('sha256', getSessionSecret()).update(base64Str).digest('base64url');
  return `${base64Str}.${signature}`;
}

/**
 * Valida o token de sessão assinado
 */
export function verifySessionToken(token: string | undefined | null): SessionData | null {
  if (!token || !token.includes('.')) return null;

  const [base64Str, signature] = token.split('.');
  let expectedSig: string;
  try {
    expectedSig = crypto.createHmac('sha256', getSessionSecret()).update(base64Str).digest('base64url');
  } catch {
    return null; // sem segredo configurado, nenhuma sessão é válida
  }

  if (signature !== expectedSig) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Str, 'base64url').toString('utf8');
    const data: SessionData = JSON.parse(jsonStr);
    
    // Expira em 24 horas
    const now = Date.now();
    if (now - data.authenticatedAt > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
}

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const sanitized = base32.toUpperCase().replace(/=+$/, '').replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < sanitized.length; i++) {
    value = (value << 5) | alphabet.indexOf(sanitized[i]);
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

/**
 * Utilitário padrão RFC 4648 para validação de 2FA TOTP (Google Authenticator / Authy)
 */
export function verify2FACode(userInputCode: string, secret?: string): boolean {
  const sanitized = userInputCode.trim();
  
  if (secret) {
    const keyBuffer = base32Decode(secret);
    const currentEpoch = Math.floor(Date.now() / 1000 / 30);

    for (let delta = -1; delta <= 1; delta++) {
      const epoch = currentEpoch + delta;
      const hmac = crypto.createHmac('sha1', keyBuffer);
      const timeBuffer = Buffer.alloc(8);
      timeBuffer.writeUInt32BE(epoch, 4);
      hmac.update(timeBuffer);
      const hash = hmac.digest();
      const offset = hash[hash.length - 1] & 0xf;
      const binary = ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff);
      const otp = (binary % 1000000).toString().padStart(6, '0');
      if (sanitized === otp) return true;
    }
  }
  
  return false;
}

export { SESSION_COOKIE_NAME };
