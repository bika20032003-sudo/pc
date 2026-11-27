import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import { safeReadJson } from '../utils/fileUtils.js';
import { sendServerError, syncJsonPaths, parsePagination } from '../utils/controllerUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.resolve(__dirname, '../data/weapons_data.json');
const WEAPONS_JSON_PATHS = [
  jsonPath,
  path.resolve(__dirname, '../../../client/src/data/weapons_data.json')
];

// Helper to save to JSON file as persistent atomic backup
function saveToJsonFile(weapons) {
  try {
    syncJsonPaths(WEAPONS_JSON_PATHS, weapons);
  } catch (err) {
    console.error('Error saving weapons to JSON backup:', err);
  }
}

// Get all weapons with filtering and stats
export async function getWeapons(req, res) {
  try {
    const { search, type, entity, status } = req.query;
    const { db } = getDb();

    const allRows = await db.all('SELECT * FROM weapons ORDER BY id ASC');
    const normType = type && type !== 'الكل' ? normalizeArabicText(type) : '';
    const normEntity = entity && entity !== 'الكل' ? normalizeArabicText(entity) : '';
    const normSearch = search && search.trim() ? normalizeArabicText(search) : '';

    const filteredRows = allRows.filter((w) => {
      if (status && status !== 'الكل' && w.status !== status) return false;
      if (normType && !normalizeArabicText(w.weapon_type).includes(normType)) return false;
      if (normEntity && !(normalizeArabicText(w.receiving_entity).includes(normEntity) || normalizeArabicText(w.receiver_name).includes(normEntity))) return false;
      if (normSearch) {
        return (
          normalizeArabicText(w.weapon_number).includes(normSearch) ||
          normalizeArabicText(w.weapon_type).includes(normSearch) ||
          normalizeArabicText(w.receiving_entity).includes(normSearch) ||
          normalizeArabicText(w.receiver_name).includes(normSearch) ||
          normalizeArabicText(w.notes).includes(normSearch)
        );
      }
      return true;
    });

    const filteredTotal = filteredRows.length;
    const total = allRows.length;
    const pistols = allRows.filter(w => String(w.weapon_type || '').includes('مسدس')).length;
    const rifles = allRows.filter(w => String(w.weapon_type || '').includes('كلاشن') || String(w.weapon_type || '').includes('بندقية')).length;
    const totalAmmo = allRows.reduce((s, w) => s + (Number(w.ammo_count) || 0), 0);
    const totalMags = allRows.reduce((s, w) => s + (Number(w.magazines_count) || 0), 0);

    const pag = parsePagination(req.query);
    const totalPages = pag.enabled ? (Math.ceil(filteredTotal / pag.limit) || 1) : 1;
    const data = pag.enabled ? filteredRows.slice(pag.offset, pag.offset + pag.limit) : filteredRows;

    return res.status(200).json({
      success: true,
      data,
      stats: {
        total,
        pistols,
        rifles,
        totalAmmo,
        totalMags,
        filteredTotal
      },
      pagination: {
        total: filteredTotal,
        page: pag.page,
        limit: pag.enabled ? pag.limit : filteredTotal,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching weapons:', error);
    // Fallback to JSON file if SQLite query fails
    const fileData = safeReadJson(jsonPath, null);
    if (Array.isArray(fileData)) {
      return res.status(200).json({
        success: true,
        data: fileData,
        stats: { total: fileData.length, filteredTotal: fileData.length }
      });
    }
    return sendServerError(res, error, 'Weapons fetch error', 'تعذر جلب سجل الأسلحة والذخائر');
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

    await db.run('BEGIN TRANSACTION;');
    try {
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
      await db.run('COMMIT;');
    } catch (txError) {
      await db.run('ROLLBACK;').catch(() => {});
      throw txError;
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
