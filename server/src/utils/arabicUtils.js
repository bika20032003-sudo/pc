/**
 * أدوات معالجة النصوص والأسماء العربية الموحدة
 */
export function normalizeArabicText(text) {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[\u0640\u064B-\u065F\u0670]/g, '') // حذف التشكيل والتطويل
    .replace(/[إأآاٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();
}

