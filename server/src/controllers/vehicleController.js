import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import { sendServerError, syncJsonPaths, parsePagination } from '../utils/controllerUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vehiclesJsonPaths = [
  path.resolve(__dirname, '../data/vehicles_data.json'),
  path.resolve(__dirname, '../../../client/public/api/data/vehicles_data.json'),
  path.resolve(__dirname, '../../../client/src/data/vehicles_data.json')
];

async function syncVehiclesJson(db) {
  try {
    const all = await db.all('SELECT * FROM vehicles ORDER BY id ASC');
    if (Array.isArray(all) && all.length > 0) {
      syncJsonPaths(vehiclesJsonPaths, all);
    }
  } catch (e) {
    console.warn('Vehicle JSON backup sync error:', e.message);
  }
}

export async function getVehicleList(req, res) {
  try {
    const { search, category, status, department } = req.query;
    const { db } = getDb();

    const allRows = await db.all('SELECT * FROM vehicles ORDER BY id ASC');
    const normSearch = search && search.trim() ? normalizeArabicText(search) : '';

    const filteredRows = allRows.filter((v) => {
      if (category && category !== 'الكل' && v.category !== category) return false;
      if (status && status !== 'الكل' && v.status !== status) return false;
      if (department && department !== 'الكل' && v.department !== department) return false;
      if (normSearch) {
        return (
          normalizeArabicText(v.plate_number).includes(normSearch) ||
          normalizeArabicText(v.chassis_number).includes(normSearch) ||
          normalizeArabicText(v.make_model).includes(normSearch) ||
          normalizeArabicText(v.vehicle_type).includes(normSearch) ||
          normalizeArabicText(v.custodian_name).includes(normSearch) ||
          normalizeArabicText(v.department).includes(normSearch) ||
          normalizeArabicText(v.notes).includes(normSearch)
        );
      }
      return true;
    });

    const filteredTotal = filteredRows.length;
    const total = allRows.length;
    const activeCount = allRows.filter(v => v.status === 'جاهزة للعمل').length;
    const custodyCount = allRows.filter(v => v.category === 'سيارة عهدة شخصية').length;
    const departmentCount = allRows.filter(v => v.category === 'سيارة مراكز وأقسام').length;
    const motorcycleCount = allRows.filter(v => v.category === 'دراجة نارية شرطية').length;
    const outOfServiceCount = allRows.filter(v => v.status !== 'جاهزة للعمل').length;

    const pag = parsePagination(req.query);
    const totalPages = pag.enabled ? (Math.ceil(filteredTotal / pag.limit) || 1) : 1;
    const data = pag.enabled ? filteredRows.slice(pag.offset, pag.offset + pag.limit) : filteredRows;

    return res.status(200).json({
      success: true,
      total,
      filteredTotal,
      page: pag.page,
      totalPages,
      limit: pag.enabled ? pag.limit : total,
      stats: {
        total,
        activeCount,
        custodyCount,
        departmentCount,
        motorcycleCount,
        outOfServiceCount
      },
      data
    });
  } catch (error) {
    return sendServerError(res, error, 'Vehicles controller error', 'تعذر معالجة سجل الآليات والمركبات');
  }
}

export async function createVehicle(req, res) {
  try {
    const { db } = getDb();
    const v = req.body;

    const maxIdRow = await db.get('SELECT MAX(id) as maxId FROM vehicles');
    const newId = (maxIdRow && maxIdRow.maxId ? maxIdRow.maxId : 0) + 1;

    await db.run(`
      INSERT INTO vehicles (
        id, plate_number, plate_type, make_model, vehicle_type, model_year,
        chassis_number, engine_number, color, category, department,
        status, fuel_type, odometer, custodian_name, custodian_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      v.plate_number ? String(v.plate_number) : '',
      v.plate_type || 'شرطة',
      v.make_model || v.vehicle_type || '',
      v.vehicle_type || v.make_model || '',
      v.model_year ? String(v.model_year) : '',
      v.chassis_number || '',
      v.engine_number || '',
      v.color || '',
      v.category || 'سيارة مراكز وأقسام',
      v.department || 'مديرية أمن أوباري',
      v.status || 'جاهزة للعمل',
      v.fuel_type || 'بنزين',
      v.odometer ? String(v.odometer) : '0',
      v.custodian_name || '',
      v.custodian_id ? String(v.custodian_id) : '',
      v.notes || ''
    ]);

    const created = await db.get('SELECT * FROM vehicles WHERE id = ?', [newId]);
    await syncVehiclesJson(db);

    return res.status(201).json({
      success: true,
      message: 'تم إضافة الآلية بنجاح وتوثيقها في SQLite',
      data: created
    });
  } catch (error) {
    console.error('Error creating vehicle in SQLite:', error);
    return sendServerError(res, error, 'Vehicles controller error', 'تعذر معالجة سجل الآليات والمركبات');
  }
}

export async function updateVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();
    const v = req.body;

    const existing = await db.get('SELECT id FROM vehicles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'الآلية غير موجودة' });
    }

    await db.run(`
      UPDATE vehicles SET
        plate_number = COALESCE(?, plate_number),
        plate_type = COALESCE(?, plate_type),
        make_model = COALESCE(?, make_model),
        vehicle_type = COALESCE(?, vehicle_type),
        model_year = COALESCE(?, model_year),
        chassis_number = COALESCE(?, chassis_number),
        engine_number = COALESCE(?, engine_number),
        color = COALESCE(?, color),
        category = COALESCE(?, category),
        department = COALESCE(?, department),
        status = COALESCE(?, status),
        fuel_type = COALESCE(?, fuel_type),
        odometer = COALESCE(?, odometer),
        custodian_name = COALESCE(?, custodian_name),
        custodian_id = COALESCE(?, custodian_id),
        notes = COALESCE(?, notes),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      v.plate_number ? String(v.plate_number) : undefined,
      v.plate_type,
      v.make_model,
      v.vehicle_type,
      v.model_year ? String(v.model_year) : undefined,
      v.chassis_number,
      v.engine_number,
      v.color,
      v.category,
      v.department,
      v.status,
      v.fuel_type,
      v.odometer ? String(v.odometer) : undefined,
      v.custodian_name,
      v.custodian_id ? String(v.custodian_id) : undefined,
      v.notes,
      id
    ]);

    const updated = await db.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    await syncVehiclesJson(db);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الآلية بنجاح في SQLite',
      data: updated
    });
  } catch (error) {
    console.error('Error updating vehicle in SQLite:', error);
    return sendServerError(res, error, 'Vehicles controller error', 'تعذر معالجة سجل الآليات والمركبات');
  }
}

export async function deleteVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();

    const result = await db.run('DELETE FROM vehicles WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'الآلية غير موجودة' });
    }

    await syncVehiclesJson(db);

    return res.status(200).json({
      success: true,
      message: 'تم حذف الآلية من SQLite بنجاح'
    });
  } catch (error) {
    console.error('Error deleting vehicle from SQLite:', error);
    return sendServerError(res, error, 'Vehicles controller error', 'تعذر معالجة سجل الآليات والمركبات');
  }
}

export async function replaceVehicleList(req, res) {
  try {
    const { vehicles } = req.body;
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ success: false, message: 'قائمة الآليات غير صالحة' });
    }

    const { db } = getDb();

    await db.run('BEGIN TRANSACTION;');
    await db.run('DELETE FROM vehicles;');

    const stmt = await db.prepare(`
      INSERT INTO vehicles (
        id, plate_number, plate_type, make_model, vehicle_type, model_year,
        chassis_number, engine_number, color, category, department,
        status, fuel_type, odometer, custodian_name, custodian_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (let idx = 0; idx < vehicles.length; idx++) {
      const v = vehicles[idx];
      await stmt.run([
        v.id || idx + 1,
        v.plate_number ? String(v.plate_number) : '',
        v.plate_type || 'شرطة',
        v.make_model || v.vehicle_type || '',
        v.vehicle_type || v.make_model || '',
        v.model_year ? String(v.model_year) : '',
        v.chassis_number || '',
        v.engine_number || '',
        v.color || '',
        v.category || 'سيارة مراكز وأقسام',
        v.department || 'مديرية أمن أوباري',
        v.status || 'جاهزة للعمل',
        v.fuel_type || 'بنزين',
        v.odometer ? String(v.odometer) : '0',
        v.custodian_name || '',
        v.custodian_id ? String(v.custodian_id) : '',
        v.notes || ''
      ]);
    }

    await stmt.finalize();
    await db.run('COMMIT;');
    await syncVehiclesJson(db);

    console.log(`✅ تم استبدال أسطول الآليات في SQLite بنجاح (${vehicles.length} مركبة)`);

    return res.status(200).json({
      success: true,
      message: `تم استبدال وتحديث أسطول الآليات بنجاح (${vehicles.length} آلية)`,
      total: vehicles.length
    });
  } catch (error) {
    const { db } = getDb();
    await db.run('ROLLBACK;');
    console.error('Error replacing vehicles in SQLite:', error);
    return sendServerError(res, error, 'Vehicles controller error', 'تعذر معالجة سجل الآليات والمركبات');
  }
}
