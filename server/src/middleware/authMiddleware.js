import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { getDb } from '../config/db.js';
import { parseAllowedSections } from '../utils/controllerUtils.js';

/**
 * وسيط التحقق الإلزامي من الجلسة وتوكن JWT
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'جلسة غير مصرح بها. يرجى تسجيل الدخول أولاً'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'انتهت صلاحية جلسة العمل أو أن التوكن غير صالح'
    });
  }
}

/**
 * وسيط فحص الهوية المرن (يستخرج المستخدم إذا توفر التوكن دون حظر الطلب)
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (_) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
}

/**
 * وسيط التحقق من الصلاحيات الإدارية والقيادية
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'يتطلب هذا الإجراء تسجيل الدخول' });
  }

  const role = req.user.role;
  if (role === 'super_admin' || role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'عذراً، هذا الإجراء مخصص للقيادة والمسؤولين فقط ولا تملك الصلاحية الكافية'
  });
}

/**
 * وسيط التحقق من صلاحية الوصول للأقسام التشغيلية من قاعدة البيانات لحظياً
 */
export function requireSectionAccess(...allowedSectionIds) {
  return async function sectionAccessMiddleware(req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ success: false, message: 'يتطلب هذا الإجراء تسجيل الدخول' });
      }

      const { db } = getDb();
      const dbUser = await db.get(
        'SELECT id, role, allowed_sections, status FROM users WHERE id = ?',
        [req.user.id]
      );

      if (!dbUser || dbUser.status !== 'active') {
        return res.status(401).json({ success: false, message: 'الحساب موقوف أو غير موجود' });
      }

      if (dbUser.role === 'super_admin' || dbUser.role === 'admin') {
        return next();
      }

      const userSections = parseAllowedSections(dbUser.allowed_sections, dbUser.role);

      if (
        Array.isArray(userSections) &&
        (userSections.includes('all') || allowedSectionIds.some((sec) => userSections.includes(sec)))
      ) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'عذراً، لا تملك صلاحية الوصول إلى هذا القسم في المنظومة'
      });
    } catch (error) {
      return next(error);
    }
  };
}
