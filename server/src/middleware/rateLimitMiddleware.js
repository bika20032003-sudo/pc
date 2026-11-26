/**
 * Lightweight dependency-free in-memory rate limiter middleware.
 * Protects authentication and public self-service endpoints from brute-force and DoS attacks.
 */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 30, message = 'تم تجاوز الحد المسموح من المحاولات، يرجى المحاولة لاحقاً' } = {}) {
  const hits = new Map();

  // Periodic cleanup of expired windows so memory stays bounded
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now >= entry.resetAt) {
        hits.delete(key);
      }
    }
  }, Math.min(windowMs, 5 * 60 * 1000));

  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }

  return function rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl || ''}${req.path || ''}`;
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(key, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfterSec
      });
    }

    return next();
  };
}

export const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول. يرجى الانتظار 15 دقيقة والمحاولة مجدداً'
});

export const selfInquiryLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  message: 'تم تجاوز الحد المسموح للاستعلام الذاتي. يرجى الانتظار قليلاً ثم إعادة المحاولة'
});

export const apiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 600,
  message: 'تم رصد معدل طلبات مرتفع جداً، يرجى الانتظار لحظات'
});
