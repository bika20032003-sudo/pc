import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

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
