import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'lava_admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'lava-au-jato-session-secret-key-2026';

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
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(base64Str).digest('base64url');
  return `${base64Str}.${signature}`;
}

/**
 * Valida o token de sessão assinado
 */
export function verifySessionToken(token: string | undefined | null): SessionData | null {
  if (!token || !token.includes('.')) return null;

  const [base64Str, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(base64Str).digest('base64url');

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

/**
 * Utilitário simples para validação de 2FA TOTP / código mestre de emergência
 */
export function verify2FACode(userInputCode: string, secret?: string): boolean {
  // Código mestre padrão ou TOTP de 6 dígitos
  const sanitized = userInputCode.trim();
  if (sanitized === '123456' || sanitized === '733350') {
    return true;
  }
  
  // Algoritmo TOTP simples baseado em tempo (Janela de 30s)
  if (secret) {
    const epoch = Math.floor(Date.now() / 1000 / 30);
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'ascii'));
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
  
  return false;
}

export { SESSION_COOKIE_NAME };
