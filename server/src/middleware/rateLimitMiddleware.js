/**
 * Lightweight dependency-free in-memory rate limiter middleware.
 * Protects authentication and public self-service endpoints from brute-force and DoS attacks.
 */
export function createRateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 30,
  message = 'تم تجاوز الحد المسموح من المحاولات، يرجى المحاولة لاحقاً',
  keyGenerator = null
} = {}) {
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
    const customPart = typeof keyGenerator === 'function' ? String(keyGenerator(req) || '') : '';
    const key = customPart
      ? `${ip}:${req.baseUrl || ''}${req.path || ''}:${customPart}`
      : `${ip}:${req.baseUrl || ''}${req.path || ''}`;
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

function composeLimiters(...limiters) {
  return function combinedRateLimiter(req, res, next) {
    let idx = 0;
    const step = (err) => {
      if (err) return next(err);
      if (idx >= limiters.length) return next();
      const mw = limiters[idx++];
      mw(req, res, step);
    };
    step();
  };
}

export const loginLimiter = composeLimiters(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyGenerator: (req) => String(req.body?.identifier || '').trim().toLowerCase(),
    message: 'تم تجاوز الحد المسموح لمحاولات تسجيل الدخول لهذا الحساب. يرجى الانتظار 15 دقيقة والمحاولة مجدداً'
  }),
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 150,
    message: 'تم رصد محاولات دخول كثيرة جداً من هذه الشبكة. يرجى الانتظار قليلاً'
  })
);

export const selfInquiryLimiter = composeLimiters(
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 25,
    keyGenerator: (req) => String(req.body?.identifier || req.body?.national_id || req.body?.financial_number || '').trim(),
    message: 'تم تجاوز الحد المسموح للاستعلام لهذا الرقم. يرجى الانتظار قليلاً ثم إعادة المحاولة'
  }),
  createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 250,
    message: 'تم رصد ضغط استعلامات مرتفع من هذه الشبكة. يرجى الانتظار لحظات والمحاولة مجدداً'
  })
);

export const apiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 1800,
  message: 'تم رصد معدل طلبات مرتفع جداً، يرجى الانتظار لحظات'
});
