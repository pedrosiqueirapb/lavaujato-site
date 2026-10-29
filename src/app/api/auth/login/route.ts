import { NextResponse } from 'next/server';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/security/rate-limiter';
import { createSessionToken, verify2FACode, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST(request: Request) {
  try {
    const rawIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const ip = rawIp.split(',')[0].trim();
    
    // 1. Checa Rate Limit (OWASP Protection)
    const limitCheck = checkRateLimit(ip);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Muitas tentativas de login. Acesso bloqueado temporariamente. Tente novamente em ${limitCheck.retryAfterSeconds} segundos.`,
          retryAfterSeconds: limitCheck.retryAfterSeconds 
        },
        { status: 429 }
      );
    }

    const { password, twoFactorCode } = await request.json();
    const is2FAEnabled = Boolean(process.env.ADMIN_2FA_SECRET);
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // 2. Valida Senha
    if (password !== correctPassword) {
      const failed = recordFailedAttempt(ip);
      return NextResponse.json(
        { 
          error: `Senha incorreta. Tentativas restantes: ${failed.remaining}`,
          remainingAttempts: failed.remaining 
        },
        { status: 401 }
      );
    }

    // 3. Valida 2FA se habilitado
    if (is2FAEnabled) {
      if (!twoFactorCode) {
        return NextResponse.json(
          { require2FA: true, message: 'Digite o código de verificação 2FA (6 dígitos).' },
          { status: 200 }
        );
      }

      const secret = process.env.ADMIN_2FA_SECRET;
      const isValid2FA = verify2FACode(twoFactorCode, secret);
      if (!isValid2FA) {
        const failed = recordFailedAttempt(ip);
        return NextResponse.json(
          { error: `Código 2FA inválido ou expirado. Tentativas restantes: ${failed.remaining}` },
          { status: 401 }
        );
      }
    }

    // 4. Sucesso -> Reseta tentativas e gera cookie HTTP-Only
    resetRateLimit(ip);

    const sessionToken = createSessionToken({
      authenticated: true,
      authenticatedAt: Date.now(),
      is2FAVerified: true,
    });

    const response = NextResponse.json({ success: true, redirect: '/admin' });
    
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 1 dia
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno ao processar autenticação.' }, { status: 500 });
  }
}
