import { getDb } from '../config/db.js';
import { sendServerError, syncJsonPaths } from '../utils/controllerUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEPT_JSON_PATHS = [
  path.resolve(__dirname, '../data/departments_data.json'),
  path.resolve(__dirname, '../../../client/src/data/departments_data.json')
];

async function syncDepartmentsJson(db) {
  try {
    const rows = await db.all(
      'SELECT id AS DepartmentID, department_name AS DepartmentName, head_name AS HeadName FROM departments ORDER BY id ASC'
    );
    syncJsonPaths(DEPT_JSON_PATHS, rows);
  } catch (err) {
    console.warn('Sync departments JSON error:', err.message);
  }
}

export async function getDepartments(req, res) {
  try {
    const { db } = getDb();
    const rows = await db.all(
      'SELECT id AS DepartmentID, department_name AS DepartmentName, head_name AS HeadName, updated_at FROM departments ORDER BY id ASC'
    );
    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ success: false, message: 'تعذر جلب الأقسام والمراكز' });
  }
}

export async function createDepartment(req, res) {
  try {
    const { DepartmentName, HeadName } = req.body;
    const cleanName = DepartmentName ? String(DepartmentName).trim() : '';
    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'اسم القسم أو المركز إلزامي' });
    }
    const cleanHead = HeadName && String(HeadName).trim() ? String(HeadName).trim() : 'غير محدد';
    const { db } = getDb();

    const result = await db.run(
      'INSERT INTO departments (department_name, head_name) VALUES (?, ?)',
      [cleanName, cleanHead]
    );
    await syncDepartmentsJson(db);

    const created = await db.get(
      'SELECT id AS DepartmentID, department_name AS DepartmentName, head_name AS HeadName, updated_at FROM departments WHERE id = ?',
      [result.lastID]
    );
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating department:', error);
    return res.status(500).json({ success: false, message: 'تعذر إضافة القسم' });
  }
}

export async function updateDepartment(req, res) {
  try {
    const id = Number(req.params.id);
    const { DepartmentName, HeadName } = req.body;
    const cleanName = DepartmentName ? String(DepartmentName).trim() : '';
    if (!cleanName) {
      return res.status(400).json({ success: false, message: 'اسم القسم أو المركز إلزامي' });
    }
    const cleanHead = HeadName && String(HeadName).trim() ? String(HeadName).trim() : 'غير محدد';
    const { db } = getDb();

    const result = await db.run(
      "UPDATE departments SET department_name = ?, head_name = ?, updated_at = datetime('now', 'localtime') WHERE id = ?",
      [cleanName, cleanHead, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    }
    await syncDepartmentsJson(db);

    const updated = await db.get(
      'SELECT id AS DepartmentID, department_name AS DepartmentName, head_name AS HeadName, updated_at FROM departments WHERE id = ?',
      [id]
    );
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating department:', error);
    return res.status(500).json({ success: false, message: 'تعذر تحديث بيانات القسم' });
  }
}

export async function deleteDepartment(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();
    const result = await db.run('DELETE FROM departments WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'القسم غير موجود' });
    }
    await syncDepartmentsJson(db);
    return res.status(200).json({ success: true, message: 'تم حذف القسم بنجاح' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return res.status(500).json({ success: false, message: 'تعذر حذف القسم' });
  }
}
