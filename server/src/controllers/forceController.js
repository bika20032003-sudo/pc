import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * تحديث حالة منتسب في قاعدة بيانات SQLite مباشرة
 */
export async function updateForceMemberStatusDirect(identifier, newStatus) {
  if (!identifier || identifier === '---') return false;
  const cleanId = String(identifier).trim();

  try {
    const { db } = getDb();
    const result = await db.run(`
      UPDATE force_members
      SET job_status = ?,
          updated_at = datetime('now', 'localtime')
      WHERE national_id = ? OR job_number = ? OR financial_number = ? OR id = ?
    `, [newStatus, cleanId, cleanId, cleanId, cleanId]);

    if (result.changes > 0) {
      console.log(`🔄 تم مزامنة حالة المنتسب [${cleanId}] في SQLite إلى: ${newStatus}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating member status in SQLite:', error);
    return false;
  }
}

export async function getForceList(req, res) {
  try {
    const { search, type, limit, page } = req.query;
    const { db } = getDb();

    let whereClauses = [];
    let params = [];

    if (type && (type === 'شرطي' || type === 'مدني')) {
      whereClauses.push('type = ?');
      params.push(type);
    }

    if (search && search.trim()) {
      const q = normalizeArabicText(search);
      const rawQ = `%${search.trim()}%`;
      const normQ = `%${q}%`;

      whereClauses.push(`(
        name LIKE ? OR
        name_normalized LIKE ? OR
        national_id LIKE ? OR
        job_number LIKE ? OR
        financial_number LIKE ? OR
        job_title LIKE ? OR
        department LIKE ? OR
        bank_name LIKE ?
      )`);
      params.push(rawQ, normQ, rawQ, rawQ, rawQ, rawQ, rawQ, rawQ);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total counts
    const countRow = await db.get(`SELECT COUNT(*) as total FROM force_members ${whereSql}`, params);
    const total = countRow ? countRow.total : 0;

    const policeCountRow = await db.get("SELECT COUNT(*) as c FROM force_members WHERE type = 'شرطي'");
    const civilCountRow = await db.get("SELECT COUNT(*) as c FROM force_members WHERE type = 'مدني'");
    const policeCount = policeCountRow ? policeCountRow.c : 0;
    const civilCount = civilCountRow ? civilCountRow.c : 0;

    let data = [];
    let currentPage = 1;
    let totalPages = 1;

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      currentPage = Math.max(1, parseInt(page || '1', 10));
      totalPages = Math.ceil(total / parsedLimit) || 1;
      const offset = (currentPage - 1) * parsedLimit;

      data = await db.all(
        `SELECT * FROM force_members ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        [...params, parsedLimit, offset]
      );
    } else {
      data = await db.all(`SELECT * FROM force_members ${whereSql} ORDER BY id ASC`, params);
    }

    return res.status(200).json({
      success: true,
      total,
      policeCount,
      civilCount,
      page: limit ? currentPage : 1,
      totalPages: limit ? totalPages : 1,
      limit: limit ? parseInt(limit, 10) : total,
      data
    });
  } catch (error) {
    console.error('Error fetching force list from SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createForceMember(req, res) {
  try {
    const { db } = getDb();
    const m = req.body;

    const maxIdRow = await db.get('SELECT MAX(id) as maxId FROM force_members');
    const newId = (maxIdRow && maxIdRow.maxId ? maxIdRow.maxId : 0) + 1;

    await db.run(`
      INSERT INTO force_members (
        id, type, name, name_normalized, job_number, national_id, birth_date, birth_place,
        mother_name, marital_status, wife_name, children_count, tribe_city, residence,
        phone, languages, education_level, family_book, family_paper, family_record,
        passport_number, suit_number, shoe_size, headwear_size, shirt_size, blood_type,
        diseases, height, weight, department, job_title, job_status, start_date,
        appointment_decision, appointment_date, last_promotion_decision, last_promotion_date,
        financial_number, basic_salary, bank_name, bank_branch, account_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      m.type || 'شرطي',
      m.name || '',
      normalizeArabicText(m.name || ''),
      m.job_number ? String(m.job_number) : '',
      m.national_id ? String(m.national_id) : '',
      m.birth_date || '',
      m.birth_place || '',
      m.mother_name || '',
      m.marital_status || '',
      m.wife_name || '',
      m.children_count ? String(m.children_count) : '0',
      m.tribe_city || '',
      m.residence || '',
      m.phone || '',
      m.languages || 'العربية',
      m.education_level || '',
      m.family_book || '',
      m.family_paper || '',
      m.family_record || '',
      m.passport_number || '',
      m.suit_number || '',
      m.shoe_size ? String(m.shoe_size) : '',
      m.headwear_size ? String(m.headwear_size) : '',
      m.shirt_size || '',
      m.blood_type || 'O+',
      m.diseases || 'سليم ولائق صحياً',
      m.height ? String(m.height) : '',
      m.weight ? String(m.weight) : '',
      m.department || 'الشؤون الإدارية والمالية',
      m.job_title || 'شرطي',
      m.job_status || 'على رأس العمل',
      m.start_date || '',
      m.appointment_decision || '',
      m.appointment_date || '',
      m.last_promotion_decision || '',
      m.last_promotion_date || '',
      m.financial_number ? String(m.financial_number) : (m.job_number ? String(m.job_number) : ''),
      m.basic_salary ? String(m.basic_salary) : '0',
      m.bank_name || '',
      m.bank_branch || '',
      m.account_number ? String(m.account_number) : '',
      m.notes || ''
    ]);

    const created = await db.get('SELECT * FROM force_members WHERE id = ?', [newId]);

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المنتسب بنجاح وحفظه في SQLite',
      data: created
    });
  } catch (error) {
    console.error('Error creating force member in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateForceMember(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();
    const m = req.body;

    const existing = await db.get('SELECT id FROM force_members WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'السجل غير موجود' });
    }

    await db.run(`
      UPDATE force_members SET
        type = COALESCE(?, type),
        name = COALESCE(?, name),
        name_normalized = COALESCE(?, name_normalized),
        job_number = COALESCE(?, job_number),
        national_id = COALESCE(?, national_id),
        birth_date = COALESCE(?, birth_date),
        birth_place = COALESCE(?, birth_place),
        mother_name = COALESCE(?, mother_name),
        marital_status = COALESCE(?, marital_status),
        wife_name = COALESCE(?, wife_name),
        children_count = COALESCE(?, children_count),
        tribe_city = COALESCE(?, tribe_city),
        residence = COALESCE(?, residence),
        phone = COALESCE(?, phone),
        languages = COALESCE(?, languages),
        education_level = COALESCE(?, education_level),
        family_book = COALESCE(?, family_book),
        family_paper = COALESCE(?, family_paper),
        family_record = COALESCE(?, family_record),
        passport_number = COALESCE(?, passport_number),
        suit_number = COALESCE(?, suit_number),
        shoe_size = COALESCE(?, shoe_size),
        headwear_size = COALESCE(?, headwear_size),
        shirt_size = COALESCE(?, shirt_size),
        blood_type = COALESCE(?, blood_type),
        diseases = COALESCE(?, diseases),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        department = COALESCE(?, department),
        job_title = COALESCE(?, job_title),
        job_status = COALESCE(?, job_status),
        start_date = COALESCE(?, start_date),
        appointment_decision = COALESCE(?, appointment_decision),
        appointment_date = COALESCE(?, appointment_date),
        last_promotion_decision = COALESCE(?, last_promotion_decision),
        last_promotion_date = COALESCE(?, last_promotion_date),
        financial_number = COALESCE(?, financial_number),
        basic_salary = COALESCE(?, basic_salary),
        bank_name = COALESCE(?, bank_name),
        bank_branch = COALESCE(?, bank_branch),
        account_number = COALESCE(?, account_number),
        notes = COALESCE(?, notes),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      m.type,
      m.name,
      m.name ? normalizeArabicText(m.name) : undefined,
      m.job_number ? String(m.job_number) : undefined,
      m.national_id ? String(m.national_id) : undefined,
      m.birth_date,
      m.birth_place,
      m.mother_name,
      m.marital_status,
      m.wife_name,
      m.children_count ? String(m.children_count) : undefined,
      m.tribe_city,
      m.residence,
      m.phone,
      m.languages,
      m.education_level,
      m.family_book,
      m.family_paper,
      m.family_record,
      m.passport_number,
      m.suit_number,
      m.shoe_size ? String(m.shoe_size) : undefined,
      m.headwear_size ? String(m.headwear_size) : undefined,
      m.shirt_size,
      m.blood_type,
      m.diseases,
      m.height ? String(m.height) : undefined,
      m.weight ? String(m.weight) : undefined,
      m.department,
      m.job_title,
      m.job_status,
      m.start_date,
      m.appointment_decision,
      m.appointment_date,
      m.last_promotion_decision,
      m.last_promotion_date,
      m.financial_number ? String(m.financial_number) : undefined,
      m.basic_salary ? String(m.basic_salary) : undefined,
      m.bank_name,
      m.bank_branch,
      m.account_number ? String(m.account_number) : undefined,
      m.notes,
      id
    ]);

    const updated = await db.get('SELECT * FROM force_members WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المنتسب بنجاح في SQLite',
      data: updated
    });
  } catch (error) {
    console.error('Error updating force member in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteForceMember(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();

    const result = await db.run('DELETE FROM force_members WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'السجل غير موجود' });
    }

    return res.status(200).json({
      success: true,
      message: 'تم حذف القيد من SQLite بنجاح'
    });
  } catch (error) {
    console.error('Error deleting force member from SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function replaceForceList(req, res) {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'قائمة الأفراد غير صالحة أو فارغة' });
    }

    const { db } = getDb();
    const currentCount = (await db.get('SELECT COUNT(*) as c FROM force_members')).c;

    if (currentCount > 1000 && members.length < 500) {
      return res.status(400).json({
        success: false,
        message: 'تم رفض العملية: حجم القائمة المستبدلة يقل كثيراً عن الحجم المعتمد للقوة العمومية (حماية البيانات)'
      });
    }

    await db.run('BEGIN TRANSACTION;');
    await db.run('DELETE FROM force_members;');

    const insertStmt = await db.prepare(`
      INSERT INTO force_members (
        id, type, name, name_normalized, job_number, national_id, birth_date, birth_place,
        mother_name, marital_status, wife_name, children_count, tribe_city, residence,
        phone, languages, education_level, family_book, family_paper, family_record,
        passport_number, suit_number, shoe_size, headwear_size, shirt_size, blood_type,
        diseases, height, weight, department, job_title, job_status, start_date,
        appointment_decision, appointment_date, last_promotion_decision, last_promotion_date,
        financial_number, basic_salary, bank_name, bank_branch, account_number, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < members.length; idx++) {
      const m = members[idx];
      await insertStmt.run([
        m.id || idx + 1,
        m.type || 'شرطي',
        m.name || '',
        normalizeArabicText(m.name || ''),
        m.job_number ? String(m.job_number) : '',
        m.national_id ? String(m.national_id) : '',
        m.birth_date || '',
        m.birth_place || '',
        m.mother_name || '',
        m.marital_status || '',
        m.wife_name || '',
        m.children_count ? String(m.children_count) : '0',
        m.tribe_city || '',
        m.residence || '',
        m.phone || '',
        m.languages || 'العربية',
        m.education_level || '',
        m.family_book || '',
        m.family_paper || '',
        m.family_record || '',
        m.passport_number || '',
        m.suit_number || '',
        m.shoe_size ? String(m.shoe_size) : '',
        m.headwear_size ? String(m.headwear_size) : '',
        m.shirt_size || '',
        m.blood_type || 'O+',
        m.diseases || 'سليم ولائق صحياً',
        m.height ? String(m.height) : '',
        m.weight ? String(m.weight) : '',
        m.department || 'الشؤون الإدارية والمالية',
        m.job_title || 'شرطي',
        m.job_status || 'على رأس العمل',
        m.start_date || '',
        m.appointment_decision || '',
        m.appointment_date || '',
        m.last_promotion_decision || '',
        m.last_promotion_date || '',
        m.financial_number ? String(m.financial_number) : (m.job_number ? String(m.job_number) : ''),
        m.basic_salary ? String(m.basic_salary) : '0',
        m.bank_name || '',
        m.bank_branch || '',
        m.account_number ? String(m.account_number) : '',
        m.notes || ''
      ]);
    }
    await insertStmt.finalize();
    await db.run('COMMIT;');

    console.log(`✅ تم استبدال وتأمين القوة العمومية في SQLite بنجاح: ${members.length} عضو`);

    return res.status(200).json({
      success: true,
      message: `تم استبدال وتحديث القوة العمومية بنجاح (${members.length} فرد)`,
      total: members.length
    });
  } catch (error) {
    const { db } = getDb();
    await db.run('ROLLBACK;');
    console.error('Error replacing force list in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * بوابة الاستعلام والتحديث الذاتي لبيانات المنتسبين
 * مصممة لتحمل ضغط العمل العالي (High-Concurrency) والتحقق المشدد 1-إلى-1 لمنع أي تداخل أو تشابك بين بيانات الموظفين
 */
export async function selfUpdateForceMember(req, res) {
  try {
    const { id, national_id, financial_number, updates } = req.body;

    if (!id || (!national_id && !financial_number)) {
      return res.status(400).json({
        success: false,
        message: 'بيانات التحقق غير مكتملة (المعرف والرقم الوطني أو المالي إلزامي)'
      });
    }

    const { db } = getDb();
    const cleanId = Number(id);
    const cleanNat = national_id ? String(national_id).trim().replace(/\D/g, '') : '';
    const cleanFin = financial_number ? String(financial_number).trim().replace(/\D/g, '') : '';

    // التحقق الصارم 1-إلى-1: التأكد من مطابقة السجل بالرقم الوطني أو الرقم المالي للمعرف لمنع أي تلاعب أو خلط بين الموظفين
    const existing = await db.get(`
      SELECT * FROM force_members
      WHERE id = ? AND (
        (national_id IS NOT NULL AND national_id != '' AND REPLACE(national_id, ' ', '') = ?) OR
        (financial_number IS NOT NULL AND financial_number != '' AND REPLACE(financial_number, ' ', '') = ?) OR
        (job_number IS NOT NULL AND job_number != '' AND REPLACE(job_number, ' ', '') = ?)
      )
    `, [cleanId, cleanNat || '___NONE___', cleanFin || '___NONE___', cleanFin || '___NONE___']);

    if (!existing) {
      return res.status(403).json({
        success: false,
        message: 'فشل التحقق الأمني: لا يتطابق المعرف مع الرقم الوطني أو المالي المسجل لهذا المنتسب.'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'لم يتم تقديم أي حقول للتحديث'
      });
    }

    // السماح فقط بالحقول الشخصية وحقول الاتصال والمهمات العسكرية والمصرفية المعتمدة
    // الحقول السيادية (الاسم، الرتبة، الرقم الوطني، الرقم المالي، الإدارة) غير قابلة للتعديل الذاتي
    const safeUpdates = {
      phone: updates.phone !== undefined ? String(updates.phone).trim() : existing.phone,
      notes: updates.emergency_contact !== undefined ? String(updates.emergency_contact).trim() : (updates.notes !== undefined ? String(updates.notes).trim() : existing.notes),
      residence: updates.residence !== undefined ? String(updates.residence).trim() : existing.residence,
      tribe_city: updates.tribe_city !== undefined ? String(updates.tribe_city).trim() : existing.tribe_city,
      blood_type: updates.blood_type !== undefined ? String(updates.blood_type).trim() : existing.blood_type,
      marital_status: updates.marital_status !== undefined ? String(updates.marital_status).trim() : existing.marital_status,
      children_count: updates.children_count !== undefined ? String(updates.children_count).trim() : existing.children_count,
      wife_name: updates.wife_name !== undefined ? String(updates.wife_name).trim() : existing.wife_name,
      mother_name: updates.mother_name !== undefined ? String(updates.mother_name).trim() : existing.mother_name,
      birth_date: updates.birth_date !== undefined ? String(updates.birth_date).trim() : existing.birth_date,
      birth_place: updates.birth_place !== undefined ? String(updates.birth_place).trim() : existing.birth_place,
      family_book: updates.family_book !== undefined ? String(updates.family_book).trim() : existing.family_book,
      family_paper: updates.family_paper !== undefined ? String(updates.family_paper).trim() : existing.family_paper,
      family_record: updates.family_record !== undefined ? String(updates.family_record).trim() : existing.family_record,
      passport_number: updates.passport_number !== undefined ? String(updates.passport_number).trim() : existing.passport_number,
      languages: updates.languages !== undefined ? String(updates.languages).trim() : existing.languages,
      education_level: updates.education_level !== undefined ? String(updates.education_level).trim() : existing.education_level,
      diseases: updates.diseases !== undefined ? String(updates.diseases).trim() : existing.diseases,
      height: updates.height !== undefined ? String(updates.height).trim() : existing.height,
      weight: updates.weight !== undefined ? String(updates.weight).trim() : existing.weight,
      suit_number: updates.suit_number !== undefined ? String(updates.suit_number).trim() : existing.suit_number,
      shoe_size: updates.shoe_size !== undefined ? String(updates.shoe_size).trim() : existing.shoe_size,
      headwear_size: updates.headwear_size !== undefined ? String(updates.headwear_size).trim() : existing.headwear_size,
      shirt_size: updates.shirt_size !== undefined ? String(updates.shirt_size).trim() : existing.shirt_size,
      bank_name: updates.bank_name !== undefined ? String(updates.bank_name).trim() : existing.bank_name,
      bank_branch: updates.bank_branch !== undefined ? String(updates.bank_branch).trim() : existing.bank_branch,
      account_number: updates.account_number !== undefined ? String(updates.account_number).trim() : existing.account_number,
      appointment_decision: updates.appointment_decision !== undefined ? String(updates.appointment_decision).trim() : existing.appointment_decision,
      appointment_date: updates.appointment_date !== undefined ? String(updates.appointment_date).trim() : existing.appointment_date,
      start_date: updates.start_date !== undefined ? String(updates.start_date).trim() : existing.start_date,
      last_promotion_decision: updates.last_promotion_decision !== undefined ? String(updates.last_promotion_decision).trim() : existing.last_promotion_decision,
      last_promotion_date: updates.last_promotion_date !== undefined ? String(updates.last_promotion_date).trim() : existing.last_promotion_date,
      basic_salary: updates.basic_salary !== undefined ? String(updates.basic_salary).trim() : existing.basic_salary,
      type: updates.type !== undefined ? String(updates.type).trim() : existing.type
    };

    // تنفيذ التحديث الفوري في SQLite بجملة مفهرسة وفائقة السرعة
    await db.run(`
      UPDATE force_members SET
        phone = ?,
        notes = ?,
        residence = ?,
        tribe_city = ?,
        blood_type = ?,
        marital_status = ?,
        children_count = ?,
        wife_name = ?,
        mother_name = ?,
        birth_date = ?,
        birth_place = ?,
        family_book = ?,
        family_paper = ?,
        family_record = ?,
        passport_number = ?,
        languages = ?,
        education_level = ?,
        diseases = ?,
        height = ?,
        weight = ?,
        suit_number = ?,
        shoe_size = ?,
        headwear_size = ?,
        shirt_size = ?,
        bank_name = ?,
        bank_branch = ?,
        account_number = ?,
        appointment_decision = ?,
        appointment_date = ?,
        start_date = ?,
        last_promotion_decision = ?,
        last_promotion_date = ?,
        basic_salary = ?,
        type = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      safeUpdates.phone,
      safeUpdates.notes,
      safeUpdates.residence,
      safeUpdates.tribe_city,
      safeUpdates.blood_type,
      safeUpdates.marital_status,
      safeUpdates.children_count,
      safeUpdates.wife_name,
      safeUpdates.mother_name,
      safeUpdates.birth_date,
      safeUpdates.birth_place,
      safeUpdates.family_book,
      safeUpdates.family_paper,
      safeUpdates.family_record,
      safeUpdates.passport_number,
      safeUpdates.languages,
      safeUpdates.education_level,
      safeUpdates.diseases,
      safeUpdates.height,
      safeUpdates.weight,
      safeUpdates.suit_number,
      safeUpdates.shoe_size,
      safeUpdates.headwear_size,
      safeUpdates.shirt_size,
      safeUpdates.bank_name,
      safeUpdates.bank_branch,
      safeUpdates.account_number,
      safeUpdates.appointment_decision,
      safeUpdates.appointment_date,
      safeUpdates.start_date,
      safeUpdates.last_promotion_decision,
      safeUpdates.last_promotion_date,
      safeUpdates.basic_salary,
      safeUpdates.type,
      cleanId
    ]);

    const updated = await db.get('SELECT * FROM force_members WHERE id = ?', [cleanId]);

    // مزامنة الملف الاحتياطي JSON بشكل غير متزامن بدون تعطيل الاستجابة
    try {
      const forceJsonPath = path.resolve(__dirname, '../data/force_data.json');
      if (fs.existsSync(forceJsonPath)) {
        const fileContent = fs.readFileSync(forceJsonPath, 'utf8');
        const list = JSON.parse(fileContent);
        const idx = list.findIndex(item => Number(item.id) === cleanId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...safeUpdates };
          fs.writeFileSync(forceJsonPath, JSON.stringify(list, null, 2), 'utf8');
        }
      }
    } catch (fileErr) {
      console.warn('تنبيه: تعذر حفظ نسخة JSON في الخلفية:', fileErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث واستكمال بيانات المنتسب بنجاح',
      data: updated
    });
  } catch (error) {
    console.error('Error in selfUpdateForceMember:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
