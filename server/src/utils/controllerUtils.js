import { safeWriteJson } from './fileUtils.js';
import fs from 'fs';

/**
 * إرسال استجابة خطأ خادم آمنة دون تسريب تفاصيل قاعدة البيانات في بيئة الإنتاج
 */
export function sendServerError(res, error, logLabel, publicMessage = 'حدث خطأ داخلي في مخدم المنظومة') {
  console.error(`${logLabel}:`, error);
  return res.status(500).json({
    success: false,
    message: publicMessage
  });
}

/**
 * توثيق الأحداث الأمنية والإدارية في جدول audit_logs بشكل موحد
 */
export async function writeAuditLog(db, {
  userId = null,
  username = 'system',
  action,
  ipAddress = '',
  status = 'success',
  details = ''
}) {
  try {
    await db.run(
      'INSERT INTO audit_logs (user_id, username, action, ip_address, status, details) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username || 'system', action, ipAddress || '', status, details || '']
    );
  } catch (err) {
    console.warn('Audit log write failed:', err.message);
  }
}

/**
 * مزامنة لقطة البيانات مع مسارات JSON الاحتياطية المعتمدة فقط إن كانت موجودة مسبقاً
 */
export function syncJsonPaths(paths, data, { requireExisting = false } = {}) {
  for (const filePath of paths) {
    if (requireExisting && !fs.existsSync(filePath)) continue;
    safeWriteJson(filePath, data);
  }
}

/**
 * توحيد قراءة معاملات الترقيم (Pagination) مع حدود آمنة
 */
export function parsePagination(query = {}, { defaultLimit = null, maxLimit = 5000 } = {}) {
  const hasLimit = query.limit !== undefined && query.limit !== '';
  const rawLimit = hasLimit ? parseInt(query.limit, 10) : defaultLimit;
  if (!rawLimit || Number.isNaN(rawLimit) || rawLimit <= 0) {
    return { enabled: false, limit: null, page: 1, offset: 0 };
  }
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const rawPage = parseInt(query.page || '1', 10);
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  return {
    enabled: true,
    limit,
    page,
    offset: (page - 1) * limit
  };
}

/**
 * تطبيع الأرقام العربية/الهندية واستخلاص الأرقام الصافية فقط
 */
export function sanitizeDigits(val) {
  if (val === undefined || val === null) return '';
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  return String(val)
    .replace(/[٠-٩]/g, (d) => String(arabicIndic.indexOf(d)))
    .replace(/\D/g, '')
    .trim();
}

/**
 * تحليل مصفوفة الأقسام المسموح بها للمستخدم بشكل موحد
 */
export function parseAllowedSections(rawSections, role, username = '') {
  if (rawSections) {
    try {
      const parsed = typeof rawSections === 'string' ? JSON.parse(rawSections) : rawSections;
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }
  if (role === 'super_admin' || role === 'admin' || username === 'admin') {
    return ['all'];
  }
  return ['dashboard', 'force'];
}
