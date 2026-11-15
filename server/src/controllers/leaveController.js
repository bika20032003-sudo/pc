import path from 'path';
import { fileURLToPath } from 'url';
import { updateForceMemberStatusDirect } from './forceController.js';
import { safeReadJson, safeWriteJson } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../data/leaves_data.json');
let memoryLeaves = [];

try {
  memoryLeaves = safeReadJson(jsonPath, []);
  console.log(`✅ تم تحميل سجل الإجازات المركزي (${memoryLeaves.length} إجازة)`);
} catch (e) {
  console.error('خطأ في تحميل سجل الإجازات:', e);
}

function persistLeaves() {
  return safeWriteJson(jsonPath, memoryLeaves);
}

// دالة مساعدة للتحقق من صحة وصلاحية التاريخ
function parseValidDate(dateInput) {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

export async function getLeaves(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // احتساب الأيام المتبقية وحالة الإجازة لكل قيد
    const enrichedLeaves = memoryLeaves.map(leave => {
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

    const validStart = parseValidDate(StartDate);
    const validEnd = parseValidDate(EndDate);

    if (!validStart || !validEnd) {
      return res.status(400).json({ success: false, message: 'صيغة تاريخ البداية أو النهاية غير صحيحة' });
    }

    const newLeave = {
      LeaveID: Date.now(),
      NationalNumber: NationalNumber || '---',
      FullName: FullName.trim(),
      Rank: Rank || 'شرطي',
      DepartmentName: DepartmentName || 'ديوان المديرية',
      LeaveType: LeaveType || 'اجازة سنوية',
      StartDate: validStart.toISOString(),
      EndDate: validEnd.toISOString(),
      TotalDays: Number(TotalDays) || 1,
      Notes: Notes || 'داخل ليبيا',
      Status: 'سارية',
      CreatedAt: new Date().toISOString()
    };

    memoryLeaves.unshift(newLeave);
    persistLeaves();

    // تحديث حالة المنتسب في القوة العمومية إلى إجازة رسمية عبر وحدة القوة مباشرة
    if (NationalNumber && NationalNumber !== '---') {
      updateForceMemberStatusDirect(NationalNumber, 'إجازة رسمية');
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

    // إعادة حالة المنتسب في القوة العمومية إلى على رأس العمل عبر وحدة القوة المشتركة
    if (leave.NationalNumber && leave.NationalNumber !== '---') {
      updateForceMemberStatusDirect(leave.NationalNumber, 'على رأس العمل');
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
