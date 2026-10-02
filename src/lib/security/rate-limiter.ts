interface RateLimitRecord {
  attempts: number;
  blockedUntil: number | null;
}

const attemptStore = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function checkRateLimit(ipOrKey: string): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attemptStore.get(ipOrKey);

  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfterSeconds = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  // Se o tempo de bloqueio passou, reseta
  if (record.blockedUntil && now >= record.blockedUntil) {
    attemptStore.delete(ipOrKey);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: record.attempts < MAX_ATTEMPTS, remaining };
}

export function recordFailedAttempt(ipOrKey: string): { blocked: boolean; remaining: number; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attemptStore.get(ipOrKey) || { attempts: 0, blockedUntil: null };

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    attemptStore.set(ipOrKey, record);
    return { blocked: true, remaining: 0, retryAfterSeconds: Math.ceil(BLOCK_DURATION_MS / 1000) };
  }

  attemptStore.set(ipOrKey, record);
  return { blocked: false, remaining: MAX_ATTEMPTS - record.attempts };
}

export function resetRateLimit(ipOrKey: string): void {
  attemptStore.delete(ipOrKey);
}
