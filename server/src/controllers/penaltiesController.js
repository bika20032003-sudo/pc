import { getDb } from '../config/db.js';
import { safeWriteJson, safeReadJson } from '../utils/fileUtils.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPaths = [
  path.resolve(__dirname, '../data/penalties_data.json'),
  path.resolve(__dirname, '../../../client/src/data/penalties_data.json'),
  path.resolve(__dirname, '../../../client/public/api/data/penalties_data.json'),
  path.resolve(__dirname, '../../../client/dist/api/data/penalties_data.json')
];

async function syncPenaltiesJson(db) {
  try {
    const rows = await db.all('SELECT * FROM penalties ORDER BY id DESC');
    const formatted = rows.map(r => ({
      PenaltyID: r.penalty_id || r.id,
      FullName: r.full_name,
      AdminNumber: null,
      NationalNumber: r.national_id || '',
      MilitaryNumber: r.job_number || null,
      JobNumber: r.job_number || null,
      EmployeeCategory: r.employee_category || 'نظامي',
      PenaltyType: r.penalty_type,
      Reason: r.reason,
      PenaltyDate: r.penalty_date,
      DeductionDays: Number(r.deduction_days) || 0,
      DecisionNumber: r.decision_number,
      IsApplied: Boolean(r.is_applied)
    }));

    for (const p of jsonPaths) {
      safeWriteJson(p, formatted);
    }
  } catch (err) {
    console.warn('Sync penalties JSON error:', err.message);
  }
}

export async function getPenalties(req, res) {
  try {
    const { db } = getDb();
    const rows = await db.all('SELECT * FROM penalties ORDER BY id DESC');

    const formatted = rows.map(r => ({
      PenaltyID: r.penalty_id || r.id,
      FullName: r.full_name,
      AdminNumber: null,
      NationalNumber: r.national_id || '',
      MilitaryNumber: r.job_number || null,
      JobNumber: r.job_number || null,
      EmployeeCategory: r.employee_category || 'نظامي',
      PenaltyType: r.penalty_type,
      Reason: r.reason,
      PenaltyDate: r.penalty_date,
      DeductionDays: Number(r.deduction_days) || 0,
      DecisionNumber: r.decision_number,
      IsApplied: Boolean(r.is_applied)
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      penalties: formatted,
      data: formatted
    });
  } catch (error) {
    console.error('Error in getPenalties:', error);
    // Fallback to reading file
    const fallback = safeReadJson(jsonPaths[0], []);
    return res.status(200).json({
      success: true,
      count: Array.isArray(fallback) ? fallback.length : 0,
      penalties: Array.isArray(fallback) ? fallback : [],
      data: Array.isArray(fallback) ? fallback : []
    });
  }
}

export async function createPenalty(req, res) {
  try {
    const { db } = getDb();
    const p = req.body;

    if (!p.FullName || !p.Reason) {
      return res.status(400).json({ success: false, message: 'اسم المنتسب وسبب العقوبة حقول إلزامية' });
    }

    const newId = p.PenaltyID || Date.now();
    await db.run(`
      INSERT INTO penalties (
        penalty_id, full_name, national_id, job_number, employee_category,
        penalty_type, reason, penalty_date, deduction_days, decision_number, is_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      p.FullName.trim(),
      p.NationalNumber || '',
      p.JobNumber || p.MilitaryNumber || '',
      p.EmployeeCategory || 'نظامي',
      p.PenaltyType || 'لفت نظر (إنذار)',
      p.Reason.trim(),
      p.PenaltyDate || new Date().toISOString().slice(0, 10),
      Number(p.DeductionDays) || 0,
      p.DecisionNumber || ('2026/ق.ت/' + Math.floor(100 + Math.random() * 900)),
      p.IsApplied ? 1 : 0
    ]);

    await syncPenaltiesJson(db);

    return res.status(201).json({
      success: true,
      message: 'تم تقييد الجزاء التأديبي بنجاح في قاعدة البيانات',
      penalty: { ...p, PenaltyID: newId }
    });
  } catch (error) {
    console.error('Error creating penalty:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletePenalty(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();

    await db.run('DELETE FROM penalties WHERE penalty_id = ? OR id = ?', [id, id]);
    await syncPenaltiesJson(db);

    return res.status(200).json({ success: true, message: 'تم حذف القيد التأديبي بنجاح' });
  } catch (error) {
    console.error('Error deleting penalty:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleApplied(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();

    const row = await db.get('SELECT * FROM penalties WHERE penalty_id = ? OR id = ?', [id, id]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'القيد غير موجود' });
    }

    const nextApplied = row.is_applied ? 0 : 1;
    await db.run('UPDATE penalties SET is_applied = ?, updated_at = datetime("now", "localtime") WHERE id = ?', [nextApplied, row.id]);
    await syncPenaltiesJson(db);

    return res.status(200).json({ success: true, message: 'تم تحديث حالة تنفيذ العقوبة', isApplied: Boolean(nextApplied) });
  } catch (error) {
    console.error('Error toggling penalty applied status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
