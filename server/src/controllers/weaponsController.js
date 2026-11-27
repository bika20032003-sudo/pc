import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import { safeWriteJson } from '../utils/fileUtils.js';
import { sendServerError } from '../utils/controllerUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, '../data/weapons_data.json');

// Helper to save to JSON file as persistent atomic backup
function saveToJsonFile(weapons) {
  try {
    safeWriteJson(jsonPath, weapons);
  } catch (err) {
    console.error('Error saving weapons to JSON backup:', err);
  }
}

// Get all weapons with filtering and stats
export async function getWeapons(req, res) {
  try {
    const { search, type, entity, status, limit, page } = req.query;
    const { db } = getDb();

    let whereClauses = [];
    let params = [];

    if (type && type !== 'الكل') {
      whereClauses.push('weapon_type LIKE ?');
      params.push(`%${type}%`);
    }

    if (entity && entity !== 'الكل') {
      whereClauses.push('(receiving_entity LIKE ? OR receiver_name LIKE ?)');
      params.push(`%${entity}%`, `%${entity}%`);
    }

    if (status && status !== 'الكل') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      whereClauses.push(`(
        weapon_number LIKE ? OR
        weapon_type LIKE ? OR
        receiving_entity LIKE ? OR
        receiver_name LIKE ? OR
        notes LIKE ?
      )`);
      params.push(q, q, q, q, q);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRow = await db.get(`SELECT COUNT(*) as total FROM weapons ${whereSql}`, params);
    const filteredTotal = countRow ? countRow.total : 0;

    // Overall aggregate statistics
    const totalRow = await db.get('SELECT COUNT(*) as c FROM weapons');
    const total = totalRow ? totalRow.c : 0;

    const pistolsRow = await db.get("SELECT COUNT(*) as c FROM weapons WHERE weapon_type LIKE '%مسدس%'");
    const riflesRow = await db.get("SELECT COUNT(*) as c FROM weapons WHERE weapon_type LIKE '%كلاشن%' OR weapon_type LIKE '%بندقية%'");
    const ammoRow = await db.get("SELECT SUM(ammo_count) as s FROM weapons");
    const magsRow = await db.get("SELECT SUM(magazines_count) as s FROM weapons");

    let data = [];
    let currentPage = 1;
    let totalPages = 1;

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      currentPage = Math.max(1, parseInt(page || '1', 10));
      totalPages = Math.ceil(filteredTotal / parsedLimit) || 1;
      const offset = (currentPage - 1) * parsedLimit;

      data = await db.all(
        `SELECT * FROM weapons ${whereSql} ORDER BY id ASC LIMIT ? OFFSET ?`,
        [...params, parsedLimit, offset]
      );
    } else {
      data = await db.all(`SELECT * FROM weapons ${whereSql} ORDER BY id ASC`, params);
    }

    return res.status(200).json({
      success: true,
      data,
      stats: {
        total,
        pistols: pistolsRow ? pistolsRow.c : 0,
        rifles: riflesRow ? riflesRow.c : 0,
        totalAmmo: (ammoRow && ammoRow.s) ? ammoRow.s : 0,
        totalMags: (magsRow && magsRow.s) ? magsRow.s : 0,
        filteredTotal
      },
      pagination: {
        total: filteredTotal,
        page: currentPage,
        limit: limit ? parseInt(limit, 10) : filteredTotal,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    // Fallback to JSON file if SQLite query fails
    try {
      if (fs.existsSync(jsonPath)) {
        const fileData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        return res.status(200).json({
          success: true,
          data: fileData,
          stats: { total: fileData.length, filteredTotal: fileData.length }
        });
      }
    } catch (e) {}
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}

// Get single weapon by ID
export async function getWeaponById(req, res) {
  try {
    const { id } = req.params;
    const { db } = getDb();
    const weapon = await db.get('SELECT * FROM weapons WHERE id = ?', [id]);

    if (!weapon) {
      return res.status(404).json({ success: false, message: 'قطعة السلاح غير موجودة' });
    }

    return res.status(200).json({ success: true, data: weapon });
  } catch (error) {
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}

// Create new weapon
export async function createWeapon(req, res) {
  try {
    const {
      weapon_type,
      weapon_number,
      caliber,
      ammo_count,
      magazines_count,
      receiving_entity,
      receiver_name,
      status,
      issue_date,
      notes
    } = req.body;

    if (!weapon_type || !weapon_number) {
      return res.status(400).json({
        success: false,
        message: 'نوع السلاح ورقم السلاح التسلسلي حقول مطلوبة'
      });
    }

    const { db } = getDb();

    // Check duplicate weapon number
    const existing = await db.get('SELECT id FROM weapons WHERE weapon_number = ?', [weapon_number.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `رقم السلاح (${weapon_number}) مقيد مسبقاً في السجلات الرسمية!`
      });
    }

    const result = await db.run(`
      INSERT INTO weapons (
        weapon_type,
        weapon_number,
        serial_number,
        caliber,
        ammo_count,
        magazines_count,
        receiving_entity,
        receiver_name,
        status,
        issue_date,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      weapon_type,
      weapon_number.trim(),
      weapon_number.trim(),
      caliber || (weapon_type.includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم'),
      parseInt(ammo_count, 10) || 0,
      parseInt(magazines_count, 10) || 0,
      receiving_entity || 'مخزن المديرية',
      receiver_name || '',
      status || 'صالح للعمل ومصروف',
      issue_date || new Date().toISOString().split('T')[0],
      notes || ''
    ]);

    const newWeapon = await db.get('SELECT * FROM weapons WHERE id = ?', [result.lastID]);

    // Update JSON backup
    const allWeapons = await db.all('SELECT * FROM weapons ORDER BY id ASC');
    saveToJsonFile(allWeapons);

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل وصرف عهدة السلاح بنجاح',
      data: newWeapon
    });
  } catch (error) {
    console.error('Error creating weapon:', error);
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}

// Update existing weapon
export async function updateWeapon(req, res) {
  try {
    const { id } = req.params;
    const {
      weapon_type,
      weapon_number,
      caliber,
      ammo_count,
      magazines_count,
      receiving_entity,
      receiver_name,
      status,
      issue_date,
      notes
    } = req.body;

    const { db } = getDb();

    const existing = await db.get('SELECT * FROM weapons WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'قطعة السلاح غير موجودة' });
    }

    await db.run(`
      UPDATE weapons SET
        weapon_type = ?,
        weapon_number = ?,
        serial_number = ?,
        caliber = ?,
        ammo_count = ?,
        magazines_count = ?,
        receiving_entity = ?,
        receiver_name = ?,
        status = ?,
        issue_date = ?,
        notes = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      weapon_type || existing.weapon_type,
      weapon_number ? weapon_number.trim() : existing.weapon_number,
      weapon_number ? weapon_number.trim() : existing.serial_number,
      caliber || existing.caliber,
      ammo_count !== undefined ? parseInt(ammo_count, 10) : existing.ammo_count,
      magazines_count !== undefined ? parseInt(magazines_count, 10) : existing.magazines_count,
      receiving_entity || existing.receiving_entity,
      receiver_name !== undefined ? receiver_name : existing.receiver_name,
      status || existing.status,
      issue_date || existing.issue_date,
      notes !== undefined ? notes : existing.notes,
      id
    ]);

    const updated = await db.get('SELECT * FROM weapons WHERE id = ?', [id]);

    const allWeapons = await db.all('SELECT * FROM weapons ORDER BY id ASC');
    saveToJsonFile(allWeapons);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات عهدة السلاح بنجاح',
      data: updated
    });
  } catch (error) {
    console.error('Error updating weapon:', error);
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}

// Delete weapon
export async function deleteWeapon(req, res) {
  try {
    const { id } = req.params;
    const { db } = getDb();

    const existing = await db.get('SELECT * FROM weapons WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'قطعة السلاح غير موجودة' });
    }

    await db.run('DELETE FROM weapons WHERE id = ?', [id]);

    const allWeapons = await db.all('SELECT * FROM weapons ORDER BY id ASC');
    saveToJsonFile(allWeapons);

    return res.status(200).json({
      success: true,
      message: 'تم حذف قطعة السلاح من العهدة بنجاح'
    });
  } catch (error) {
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}

// Bulk import weapons
export async function importWeapons(req, res) {
  try {
    const { weapons } = req.body;
    if (!Array.isArray(weapons) || weapons.length === 0) {
      return res.status(400).json({ success: false, message: 'بيانات الأسلحة غير صحيحة أو فارغة' });
    }

    const { db } = getDb();
    let imported = 0;
    let skipped = 0;

    for (const w of weapons) {
      const num = String(w.weapon_number || w.WeaponNumber || w.serial_number || '').trim();
      if (!num) {
        skipped++;
        continue;
      }

      const exists = await db.get('SELECT id FROM weapons WHERE weapon_number = ?', [num]);
      if (exists) {
        skipped++;
        continue;
      }

      const type = w.weapon_type || w.WeaponType || 'سلاح ناري';
      const isPistol = type.includes('مسدس');
      const caliber = w.caliber || (isPistol ? '9x19 ملم' : '7.62x39 ملم');

      await db.run(`
        INSERT INTO weapons (
          weapon_type, weapon_number, serial_number, caliber,
          ammo_count, magazines_count, receiving_entity, receiver_name,
          status, issue_date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        type,
        num,
        num,
        caliber,
        parseInt(w.ammo_count || w.AmmoCount, 10) || 0,
        parseInt(w.magazines_count || w.MagazinesCount, 10) || 0,
        w.receiving_entity || w.ReceivingEntity || 'مخزن المديرية',
        w.receiver_name || w.ReceiverName || '',
        w.status || 'صالح للعمل ومصروف',
        w.issue_date || w.IssueDate ? String(w.issue_date || w.IssueDate).split('T')[0] : new Date().toISOString().split('T')[0],
        w.notes || 'مستورد'
      ]);

      imported++;
    }

    const allWeapons = await db.all('SELECT * FROM weapons ORDER BY id ASC');
    saveToJsonFile(allWeapons);

    return res.status(200).json({
      success: true,
      message: `تم استيراد ${imported} قطعة سلاح بنجاح (تم تخطي ${skipped} مكررة)`,
      imported,
      skipped
    });
  } catch (error) {
    return sendServerError(res, error, 'Weapons controller error', 'تعذر معالجة سجل الأسلحة والذخائر');
  }
}
