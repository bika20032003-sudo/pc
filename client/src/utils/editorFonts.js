/**
 * Shared Official Typography & Footer Contact Defaults for Mail & Document/Templates Editors.
 * Single source of truth across MailSection, TemplatesSection, and officialLetterTemplate.
 */
export const OFFICIAL_EDITOR_FONTS = [
  { value: "'Cairo', sans-serif", label: 'خط كايرو الرسمي (Cairo)' },
  { value: "'Calibri Light', 'Calibri', 'Cairo', sans-serif", label: 'Calibri Light (العناوين)' },
  { value: "'Calibri', 'Cairo', sans-serif", label: 'Calibri (النص الأساسي)' },
  { value: "'Times New Roman', 'Amiri', 'Traditional Arabic', serif", label: 'Times New Roman (العناوين)' },
  { value: "'Amiri', serif", label: 'خط الأميري النسخي (Amiri)' },
  { value: "'Scheherazade New', serif", label: 'خط شهرزاد الفاخر (Scheherazade)' },
  { value: "'Tajawal', sans-serif", label: 'خط تجوال الحديث (Tajawal)' },
  { value: "'Almarai', sans-serif", label: 'خط المراعي المعاصر (Almarai)' },
  { value: "'Noto Naskh Arabic', serif", label: 'خط نوتو نسخ (Noto Naskh)' },
  { value: "'Traditional Arabic', serif", label: 'خط عربي تقليدي (Traditional)' }
];

export const OFFICIAL_CONTACT_DEFAULTS = {
  phone: '0921250071',
  email: 'moderytamnobari@gmail.com'
};

export function resolveOfficialPhone(phone) {
  const clean = phone ? String(phone).trim() : '';
  if (!clean || clean === '0915938137') return OFFICIAL_CONTACT_DEFAULTS.phone;
  return clean;
}

export function resolveOfficialEmail(email) {
  const clean = email ? String(email).trim() : '';
  if (!clean || clean.toLowerCase() === 'info@ubari-security.ly') return OFFICIAL_CONTACT_DEFAULTS.email;
  return clean;
}
