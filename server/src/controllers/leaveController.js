import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../data/leaves_data.json');
const forceJsonPath = path.resolve(__dirname, '../data/force_data.json');

let memoryLeaves = [];

try {
  if (fs.existsSync(jsonPath)) {
    memoryLeaves = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ تم تحميل سجل الإجازات المركزي (${memoryLeaves.length} إجازة)`);
  }
} catch (e) {
  console.error('خطأ في تحميل سجل الإجازات:', e);
}

function persistLeaves() {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(memoryLeaves, null, 2), 'utf8');
  } catch (e) {
    console.error('فشل في حفظ سجل الإجازات:', e);
  }
}

// تحديث حالة المنتسب في قاعدة بيانات القوة العمومية المركزية
function updateForceMemberStatus(nationalNumber, newStatus) {
  try {
    if (!fs.existsSync(forceJsonPath)) return;
    const forceList = JSON.parse(fs.readFileSync(forceJsonPath, 'utf8'));
    let updated = false;
    for (let m of forceList) {
      if (
        (m.national_id && m.national_id === nationalNumber) ||
        (m.job_number && m.job_number === nationalNumber) ||
        (m.financial_number && m.financial_number === nationalNumber)
      ) {
        m.job_status = newStatus;
        updated = true;
        break;
      }
    }
    if (updated) {
      fs.writeFileSync(forceJsonPath, JSON.stringify(forceList, null, 2), 'utf8');
      console.log(`🔄 تم تحديث حالة المنتسب [${nationalNumber}] في القوة العمومية إلى: ${newStatus}`);
    }
  } catch (err) {
    console.error('فشل تحديث حالة المنتسب في ملف القوة:', err);
  }
}

export async function getLeaves(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // احتساب الأيام المتبقية وحالة الإجازة لكل قيد
    const enrichedLeaves = memoryLeaves.map(leave => {
      const end = new Date(leave.EndDate);
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

    return res.json({
      success: true,
      count: enrichedLeaves.length,
      leaves: enrichedLeaves
    });
  } catch (error) {
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
      Rank
    } = req.body;

    if (!FullName || !StartDate || !EndDate) {
      return res.status(400).json({ success: false, message: 'البيانات غير مكتملة (الاسم وتواريخ الإجازة إلزامية)' });
    }

    const newLeave = {
      LeaveID: Date.now(),
      NationalNumber: NationalNumber || '---',
      FullName,
      Rank: Rank || 'شرطي',
      DepartmentName: DepartmentName || 'ديوان المديرية',
      LeaveType: LeaveType || 'اجازة سنوية',
      StartDate: new Date(StartDate).toISOString(),
      EndDate: new Date(EndDate).toISOString(),
      TotalDays: Number(TotalDays) || 1,
      Notes: Notes || 'داخل ليبيا',
      Status: 'سارية',
      CreatedAt: new Date().toISOString()
    };

    memoryLeaves.unshift(newLeave);
    persistLeaves();

    // تحديث حالة المنتسب في القوة العمومية إلى إجازة رسمية
    if (NationalNumber && NationalNumber !== '---') {
      updateForceMemberStatus(NationalNumber, 'إجازة رسمية');
    }

    return res.status(201).json({
      success: true,
      message: 'تم تسجيل الإجازة واعتمادها بنجاح',
      leave: newLeave
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateLeave(req, res) {
  try {
    const { id } = req.params;
    const leaveId = Number(id);
    const index = memoryLeaves.findIndex(l => l.LeaveID === leaveId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'سجل الإجازة غير موجود' });
    }

    const updatedData = req.body;
    memoryLeaves[index] = {
      ...memoryLeaves[index],
      ...updatedData,
      LeaveID: leaveId // تأكيد ثبات المعرف
    };

    persistLeaves();

    return res.json({
      success: true,
      message: 'تم تحديث بيانات الإجازة بنجاح',
      leave: memoryLeaves[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function resumeDuty(req, res) {
  try {
    const { id } = req.params;
    const { resumptionDate, resumptionNotes } = req.body;
    const leaveId = Number(id);
    const index = memoryLeaves.findIndex(l => l.LeaveID === leaveId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'سجل الإجازة غير موجود' });
    }

    const leave = memoryLeaves[index];
    leave.Status = 'باشر العمل';
    leave.ActualResumptionDate = resumptionDate || new Date().toISOString().slice(0, 10);
    leave.ResumptionNotes = resumptionNotes || 'تمت مباشرة العمل بالموعد واستلام المهام';
    leave.ResumedAt = new Date().toISOString();

    persistLeaves();

    // إعادة حالة المنتسب في القوة العمومية إلى على رأس العمل
    if (leave.NationalNumber && leave.NationalNumber !== '---') {
      updateForceMemberStatus(leave.NationalNumber, 'على رأس العمل');
    }

    return res.json({
      success: true,
      message: 'تم تسجيل مباشرة العمل وإعادة حالة المنتسب إلى (على رأس العمل) بنجاح',
      leave
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteLeave(req, res) {
  try {
    const { id } = req.params;
    const leaveId = Number(id);
    const index = memoryLeaves.findIndex(l => l.LeaveID === leaveId);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'سجل الإجازة غير موجود' });
    }

    const deleted = memoryLeaves.splice(index, 1)[0];
    persistLeaves();

    return res.json({
      success: true,
      message: 'تم حذف قيد الإجازة بنجاح',
      leave: deleted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

