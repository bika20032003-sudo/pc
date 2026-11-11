import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../data/attendance_data.json');
let memoryAttendance = {}; // { [date]: { [memberId]: { status, time_in, time_out, notes, recorded_by } } }

try {
  if (fs.existsSync(jsonPath)) {
    memoryAttendance = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ تم تحميل سجلات الحضور والانصراف (${Object.keys(memoryAttendance).length} يوم)`);
  }
} catch (e) {
  console.error('Error loading attendance json:', e);
}

function persistAttendance() {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(memoryAttendance, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to persist attendance:', e);
  }
}

export async function getAttendance(req, res) {
  try {
    const { date } = req.query;
    if (date) {
      return res.json({
        success: true,
        date,
        records: memoryAttendance[date] || {}
      });
    }

    return res.json({
      success: true,
      allAttendance: memoryAttendance
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function recordAttendance(req, res) {
  try {
    const { date, member_id, status, time_in, time_out, notes, recorded_by } = req.body;
    if (!date || !member_id) {
      return res.status(400).json({ success: false, message: 'التاريخ ورقم المنتسب مطلوبان' });
    }

    if (!memoryAttendance[date]) {
      memoryAttendance[date] = {};
    }

    memoryAttendance[date][member_id] = {
      status: status || 'حاضر',
      time_in: time_in || '',
      time_out: time_out || '',
      notes: notes || '',
      recorded_by: recorded_by || 'الضابط المناوب',
      updated_at: new Date().toISOString()
    };

    persistAttendance();

    return res.json({
      success: true,
      message: 'تم تسجيل التمام بنجاح',
      data: memoryAttendance[date][member_id]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function bulkRecordAttendance(req, res) {
  try {
    const { date, records } = req.body;
    if (!date || !records || typeof records !== 'object') {
      return res.status(400).json({ success: false, message: 'بيانات غير صالحة' });
    }

    if (!memoryAttendance[date]) {
      memoryAttendance[date] = {};
    }

    Object.assign(memoryAttendance[date], records);
    persistAttendance();

    return res.json({
      success: true,
      message: 'تم حفظ سجل التمام الجماعي بنجاح',
      totalRecords: Object.keys(memoryAttendance[date]).length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

