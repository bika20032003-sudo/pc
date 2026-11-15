import fs from 'fs';
import path from 'path';

/**
 * كتابة الملفات بشكل ذري وآمن لمنع تلف البيانات أو فقدانها
 * Atomic File Writer with Safe Temp Replacement
 */
export function safeWriteJson(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonString = JSON.stringify(data, null, 2);
    const tempPath = `${filePath}.${Date.now()}.tmp`;

    // 1. الكتابة في ملف مؤقت أولاً
    fs.writeFileSync(tempPath, jsonString, 'utf8');

    // 2. الاستبدال الذري الآمن للملف الأصلي
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (error) {
    console.error(`❌ فشل الحفظ الآمن للملف (${filePath}):`, error);
    // محاولة تنظيف الملف المؤقت إذا وجد
    try {
      const tempPattern = `${filePath}.${Date.now()}.tmp`;
      if (fs.existsSync(tempPattern)) fs.unlinkSync(tempPattern);
    } catch (_) {}
    return false;
  }
}

/**
 * قراءة آمنة لملف JSON مع إرجاع قيمة افتراضية عند الفشل
 */
export function safeReadJson(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`❌ خطأ في قراءة ملف JSON (${filePath}):`, error);
  }
  return defaultValue;
}
