import { getDb } from '../config/db.js';
import { updateForceMemberStatusDirect } from './forceController.js';
import { safeWriteJson } from '../utils/fileUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEAVES_JSON_PATHS = [
  path.resolve(__dirname, '../data/leaves_data.json'),
  path.resolve(__dirname, '../../../client/public/api/data/leaves_data.json'),
  path.resolve(__dirname, '../../../client/src/data/leaves_data.json')
];

async function syncLeavesJson(db) {
  try {
    const rows = await db.all('SELECT * FROM leaves ORDER BY id DESC');
    for (const p of LEAVES_JSON_PATHS) {
      safeWriteJson(p, rows);
    }
  } catch (err) {
    console.warn('Sync leaves JSON error:', err.message);
  }
}

function parseValidDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

export async function getLeaves(req, res) {
  try {
    const { db } = getDb();
    const rows = await db.all('SELECT * FROM leaves ORDER BY id DESC');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedLeaves = rows.map(leave => {
      const end = parseValidDate(leave.EndDate) || today;
      end.setHours(0, 0, 0, 0);
      const diffTime = end.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let alertStatus = 'active'; // سارية
      if (leave.Status === 'باشر العمل') {
        alertStatus = 'resumed'; // باشر العمل
      } else if (diffDays < 0) {
        alertStatus = 'overdue'; // متأخر عن المباشرة
      } else if (diffDays === 0) {
        alertStatus = 'ends_today'; // تنتهي اليوم
      } else if (diffDays <= 2) {
        alertStatus = 'ends_very_soon'; // تبقى يومان أو يوم
      } else if (diffDays <= 5) {
        alertStatus = 'ends_soon'; // أوشكت على الانتهاء
      }

      return {
        ...leave,
        computed_diff_days: diffDays,
        alert_status: alertStatus,
        is_overdue: leave.Status !== 'باشر العمل' && diffDays < 0,
        overdue_days: leave.Status !== 'باشر العمل' && diffDays < 0 ? Math.abs(diffDays) : 0,
        remaining_days: leave.Status !== 'باشر العمل' && diffDays >= 0 ? diffDays : 0
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedLeaves.length,
      leaves: enrichedLeaves
    });
  } catch (error) {
    console.error('Error fetching leaves from SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createLeave(req, res) {
  try {
    const {
      FullName,
      NationalNumber,
      DepartmentName,
      LeaveType,
      StartDate,
      EndDate,
      TotalDays,
      Notes,
      Rank,
      JobNumber
    } = req.body;

    if (!FullName || !StartDate || !EndDate) {
      return res.status(400).json({ success: false, message: 'البيانات غير مكتملة (الاسم وتواريخ الإجازة إلزامية)' });
    }

    const validStart = parseValidDate(StartDate);
    const validEnd = parseValidDate(EndDate);

    if (!validStart || !validEnd) {
      return res.status(400).json({ success: false, message: 'صيغة تاريخ البداية أو النهاية غير صحيحة' });
    }

    const { db } = getDb();

    // Transaction to atomically insert leave and update member status in SQLite
    await db.run('BEGIN TRANSACTION;');

    const result = await db.run(`
      INSERT INTO leaves (
        FullName, NationalNumber, JobNumber, DepartmentName, Rank,
        LeaveType, StartDate, EndDate, TotalDays, Reason, Status, Notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      FullName.trim(),
      NationalNumber ? String(NationalNumber).trim() : '',
      JobNumber ? String(JobNumber).trim() : '',
      DepartmentName || '',
      Rank || '',
      LeaveType || 'إجازة اعتيادية',
      StartDate,
      EndDate,
      TotalDays || 1,
      req.body.Reason || '',
      'سارية',
      Notes || ''
    ]);

    // Atomic sync of force member status
    if (NationalNumber) {
      await db.run(`
        UPDATE force_members
        SET job_status = 'في إجازة رسمية',
            updated_at = datetime('now', 'localtime')
        WHERE national_id = ? OR job_number = ?
      `, [String(NationalNumber).trim(), String(NationalNumber).trim()]);
    } else {
      await db.run(`
        UPDATE force_members
        SET job_status = 'في إجازة رسمية',
            updated_at = datetime('now', 'localtime')
        WHERE name = ?
      `, [FullName.trim()]);
    }

    await db.run('COMMIT;');
    await syncLeavesJson(db);

    const created = await db.get('SELECT * FROM leaves WHERE id = ?', [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الإجازة ومزامنة حالة المنتسب في SQLite بنجاح',
      leave: created
    });
  } catch (error) {
    const { db } = getDb();
    await db.run('ROLLBACK;').catch(() => {});
    console.error('Error creating leave in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resumeDuty(req, res) {
  try {
    const leaveId = Number(req.params.id);
    const { db } = getDb();

    const leave = await db.get('SELECT * FROM leaves WHERE id = ?', [leaveId]);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'الإجازة غير موجودة' });
    }

    await db.run('BEGIN TRANSACTION;');

    await db.run(`
      UPDATE leaves
      SET Status = 'باشر العمل',
          updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [leaveId]);

    // Atomic sync to return member to duty in force_members
    if (leave.NationalNumber) {
      await db.run(`
        UPDATE force_members
        SET job_status = 'على رأس العمل',
            updated_at = datetime('now', 'localtime')
        WHERE national_id = ? OR job_number = ?
      `, [String(leave.NationalNumber).trim(), String(leave.NationalNumber).trim()]);
    } else if (leave.FullName) {
      await db.run(`
        UPDATE force_members
        SET job_status = 'على رأس العمل',
            updated_at = datetime('now', 'localtime')
        WHERE name = ?
      `, [leave.FullName.trim()]);
    }

    await db.run('COMMIT;');
    await syncLeavesJson(db);

    const updated = await db.get('SELECT * FROM leaves WHERE id = ?', [leaveId]);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل مباشرة العمل بنجاح وتحديث جاهزية المنتسب في SQLite',
      leave: updated
    });
  } catch (error) {
    const { db } = getDb();
    await db.run('ROLLBACK;').catch(() => {});
    console.error('Error resuming duty in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateLeave(req, res) {
  try {
    const leaveId = Number(req.params.id);
    const { db } = getDb();
    const l = req.body;

    const existing = await db.get('SELECT id FROM leaves WHERE id = ?', [leaveId]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'الإجازة غير موجودة' });
    }

    await db.run(`
      UPDATE leaves SET
        FullName = COALESCE(?, FullName),
        NationalNumber = COALESCE(?, NationalNumber),
        JobNumber = COALESCE(?, JobNumber),
        DepartmentName = COALESCE(?, DepartmentName),
        Rank = COALESCE(?, Rank),
        LeaveType = COALESCE(?, LeaveType),
        StartDate = COALESCE(?, StartDate),
        EndDate = COALESCE(?, EndDate),
        TotalDays = COALESCE(?, TotalDays),
        Reason = COALESCE(?, Reason),
        Status = COALESCE(?, Status),
        Notes = COALESCE(?, Notes),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      l.FullName,
      l.NationalNumber ? String(l.NationalNumber) : undefined,
      l.JobNumber ? String(l.JobNumber) : undefined,
      l.DepartmentName,
      l.Rank,
      l.LeaveType,
      l.StartDate,
      l.EndDate,
      l.TotalDays,
      l.Reason,
      l.Status,
      l.Notes,
      leaveId
    ]);

    await syncLeavesJson(db);
    const updated = await db.get('SELECT * FROM leaves WHERE id = ?', [leaveId]);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات الإجازة في SQLite بنجاح',
      leave: updated
    });
  } catch (error) {
    console.error('Error updating leave in SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteLeave(req, res) {
  try {
    const leaveId = Number(req.params.id);
    const { db } = getDb();

    const result = await db.run('DELETE FROM leaves WHERE id = ?', [leaveId]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'الإجازة غير موجودة' });
    }

    await syncLeavesJson(db);

    return res.status(200).json({
      success: true,
      message: 'تم حذف قيد الإجازة من SQLite بنجاح'
    });
  } catch (error) {
    console.error('Error deleting leave from SQLite:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
