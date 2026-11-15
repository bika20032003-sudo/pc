import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';

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
