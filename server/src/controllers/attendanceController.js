import { getDb } from '../config/db.js';
import { sendServerError } from '../utils/controllerUtils.js';

export async function getAttendance(req, res) {
  try {
    const { date } = req.query;
    const { db } = getDb();

    if (date) {
      const rows = await db.all('SELECT * FROM attendance WHERE date = ?', [date]);
      const records = {};
      rows.forEach(r => {
        records[r.member_id] = {
          status: r.status,
          time_in: r.time_in || '',
          time_out: r.time_out || '',
          notes: r.notes || '',
          recorded_by: r.recorded_by || 'الضابط المناوب',
          updated_at: r.updated_at
        };
      });

      return res.status(200).json({
        success: true,
        date,
        records
      });
    }

    const allRows = await db.all('SELECT * FROM attendance ORDER BY date DESC');
    const allAttendance = {};
    allRows.forEach(r => {
      if (!allAttendance[r.date]) {
        allAttendance[r.date] = {};
      }
      allAttendance[r.date][r.member_id] = {
        status: r.status,
        time_in: r.time_in || '',
        time_out: r.time_out || '',
        notes: r.notes || '',
        recorded_by: r.recorded_by || 'الضابط المناوب',
        updated_at: r.updated_at
      };
    });

    return res.status(200).json({
      success: true,
      allAttendance
    });
  } catch (error) {
    console.error('Error fetching attendance from SQLite:', error);
    return sendServerError(res, error, 'Attendance controller error', 'تعذر معالجة سجل الحضور والانصراف');
  }
}

export async function recordAttendance(req, res) {
  try {
    const { date, member_id, status, time_in, time_out, notes, recorded_by } = req.body;
    if (!date || !member_id) {
      return res.status(400).json({ success: false, message: 'التاريخ ورقم المنتسب مطلوبان' });
    }

    const { db } = getDb();

    await db.run(`
      INSERT INTO attendance (date, member_id, status, time_in, time_out, notes, recorded_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
      ON CONFLICT(date, member_id) DO UPDATE SET
        status = excluded.status,
        time_in = excluded.time_in,
        time_out = excluded.time_out,
        notes = excluded.notes,
        recorded_by = excluded.recorded_by,
        updated_at = datetime('now', 'localtime')
    `, [
      date,
      String(member_id),
      status || 'حاضر',
      time_in || '',
      time_out || '',
      notes || '',
      recorded_by || 'الضابط المناوب'
    ]);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل تمام الحضور في SQLite بنجاح',
      data: {
        date,
        member_id,
        status: status || 'حاضر',
        time_in,
        time_out,
        notes,
        recorded_by
      }
    });
  } catch (error) {
    console.error('Error recording attendance in SQLite:', error);
    return sendServerError(res, error, 'Attendance controller error', 'تعذر معالجة سجل الحضور والانصراف');
  }
}

export async function bulkRecordAttendance(req, res) {
  try {
    const { date, records } = req.body;
    if (!date || !records || typeof records !== 'object') {
      return res.status(400).json({ success: false, message: 'بيانات غير صالحة' });
    }

    const { db } = getDb();

    await db.run('BEGIN TRANSACTION;');

    const stmt = await db.prepare(`
      INSERT INTO attendance (date, member_id, status, time_in, time_out, notes, recorded_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
      ON CONFLICT(date, member_id) DO UPDATE SET
        status = excluded.status,
        time_in = excluded.time_in,
        time_out = excluded.time_out,
        notes = excluded.notes,
        recorded_by = excluded.recorded_by,
        updated_at = datetime('now', 'localtime')
    `);

    for (const [memberId, rec] of Object.entries(records)) {
      await stmt.run([
        date,
        String(memberId),
        rec.status || 'حاضر',
        rec.time_in || '',
        rec.time_out || '',
        rec.notes || '',
        rec.recorded_by || 'الضابط المناوب'
      ]);
    }

    await stmt.finalize();
    await db.run('COMMIT;');

    return res.status(200).json({
      success: true,
      message: 'تم حفظ سجل التمام الميداني الجماعي في SQLite بنجاح',
      totalRecords: Object.keys(records).length
    });
  } catch (error) {
    const { db } = getDb();
    await db.run('ROLLBACK;').catch(() => {});
    console.error('Error bulk recording attendance in SQLite:', error);
    return sendServerError(res, error, 'Attendance controller error', 'تعذر معالجة سجل الحضور والانصراف');
  }
}
