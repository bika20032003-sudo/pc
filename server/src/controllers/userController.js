import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';

const defaultAdminHash = bcrypt.hashSync('admin123', 10);
const defaultUserHash = bcrypt.hashSync('123456', 10);

// Pre-configured official system users
export let inMemoryUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'mousa.albedin@moi.gov.ly',
    password_hash: defaultAdminHash,
    full_name: 'سيادة اللواء / موسى سعد محمد البدين',
    badge_number: 'MOI-10492',
    rank_title: 'لواء شرطة / رئيس مركز العمليات والتحكم',
    department: 'غرفة العمليات المركزية والتحكم',
    role: 'super_admin',
    role_label: 'مدير عام المنظومة (صلاحيات سيادية كاملة)',
    allowed_sections: ['all'],
    phone: '091-2345678',
    status: 'active',
    avatar: '',
    last_login: new Date().toISOString()
  },
  {
    id: 2,
    username: 'ali.ahmed',
    email: 'ali.ahmed@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'عقيد شرطة / علي محمد أحمد',
    badge_number: 'MOI-10488',
    rank_title: 'عقيد شرطة / نائب مدير المديرية',
    department: 'إدارة الأمن الداخلي والسيطرة',
    role: 'admin',
    role_label: 'نائب مدير (صلاحيات إدارية شاملة)',
    allowed_sections: ['dashboard', 'operations', 'force', 'attendance', 'shifts', 'records'],
    phone: '092-8765432',
    status: 'active',
    avatar: '',
    last_login: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 3,
    username: 'omar.fassi',
    email: 'omar.fassi@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'رائد شرطة / عمر مصطفى الفاسي',
    badge_number: 'MOI-10502',
    rank_title: 'رائد شرطة / مدير شؤون القوة والذاتية',
    department: 'إدارة القوة العمومية والذاتية',
    role: 'force_manager',
    role_label: 'مسؤول القوة العمومية والبيانات',
    allowed_sections: ['dashboard', 'force', 'attendance', 'leaves'],
    phone: '091-5544332',
    status: 'active',
    avatar: '',
    last_login: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 4,
    username: 'khalil.tareqi',
    email: 'khalil.tareqi@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'نقيب شرطة / خليل إبراهيم التارقي',
    badge_number: 'MOI-10515',
    rank_title: 'نقيب شرطة / رئيس قسم البلاغات والمناوبات',
    department: 'غرفة العمليات اللاسلكية',
    role: 'operations_lead',
    role_label: 'ضابط عمليات وسيطرة لاسلكية',
    allowed_sections: ['dashboard', 'operations', 'shifts', 'records'],
    phone: '092-1122334',
    status: 'active',
    avatar: '',
    last_login: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 5,
    username: 'tareq.barasi',
    email: 'tareq.barasi@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'ملازم أول / طارق مفتاح البرعصي',
    badge_number: 'MOI-10530',
    rank_title: 'ملازم أول / مسؤول الشؤون المالية والمرتبات',
    department: 'الشؤون المالية والإمداد',
    role: 'finance_officer',
    role_label: 'مسؤول المالية والمرتبات',
    allowed_sections: ['dashboard', 'salaries', 'inventory', 'fuel'],
    phone: '091-9988776',
    status: 'active',
    avatar: '',
    last_login: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 6,
    username: 'fatima.warfalli',
    email: 'fatima.warfalli@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'مدني / فاطمة سالم الورفلي',
    badge_number: 'MOI-C402',
    rank_title: 'رئيس وحدة إدخال البيانات والأرشيف',
    department: 'الأرشيف الإلكتروني والتوثيق',
    role: 'data_entry',
    role_label: 'مدخل بيانات ومسؤول أرشيف',
    allowed_sections: ['dashboard', 'force', 'archive'],
    phone: '094-3322110',
    status: 'active',
    avatar: '',
    last_login: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 7,
    username: 'abdulsamad',
    email: 'abdulsamad@ubari.moi.gov.ly',
    password_hash: defaultUserHash,
    full_name: 'عبدالصمد موسى محمد الشيخ الانصارى',
    badge_number: 'MOI-3043754',
    rank_title: 'مدني',
    department: 'مديرية أمن أوباري',
    role: 'force_manager',
    role_label: 'مسؤول القوة العمومية والصلاحيات',
    allowed_sections: ['force', 'user_management', 'mail', 'letters'],
    phone: '091-3043754',
    status: 'active',
    avatar: '',
    last_login: new Date().toISOString()
  }
];

export async function getAllUsers(req, res) {
  try {
    const { pool, isMySqlConnected } = getDb();
    if (isMySqlConnected && pool) {
      try {
        const [rows] = await pool.query('SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login, created_at FROM users ORDER BY id ASC');
        if (rows && rows.length > 0) {
          return res.json({ success: true, count: rows.length, data: rows });
        }
      } catch (e) {
        console.warn('Falling back to memory users:', e.message);
      }
    }
    return res.json({ success: true, count: inMemoryUsers.length, data: inMemoryUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { username, email, full_name, badge_number, rank_title, department, role, role_label, allowed_sections, phone, password, status, avatar } = req.body;
    if (!username || !full_name) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم والاسم الكامل مطلوبان' });
    }

    const rawPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: email ? email.trim() : `${username.trim()}@ubari.moi.gov.ly`,
      password: rawPassword,
      password_raw: rawPassword,
      password_hash: hashedPassword,
      full_name: full_name.trim(),
      badge_number: badge_number ? badge_number.trim() : `MOI-${Math.floor(10000 + Math.random() * 90000)}`,
      rank_title: rank_title ? rank_title.trim() : 'ضابط شرطة',
      department: department ? department.trim() : 'مديرية أمن أوباري',
      role: role || 'officer',
      role_label: role_label || 'ضابط عمليات',
      allowed_sections: Array.isArray(allowed_sections) ? allowed_sections : ['dashboard', 'force'],
      phone: phone || '',
      status: status || 'active',
      avatar: avatar || '',
      last_login: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    inMemoryUsers.unshift(newUser);

    // Also persist in MySQL if connected
    const { pool, isMySqlConnected } = getDb();
    if (isMySqlConnected && pool) {
      try {
        await pool.query(
          `INSERT INTO users (username, email, password_hash, full_name, badge_number, rank_title, department, role, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newUser.username, newUser.email, newUser.password_hash, newUser.full_name, newUser.badge_number, newUser.rank_title, newUser.department, newUser.role === 'super_admin' ? 'super_admin' : 'officer', newUser.status]
        );
      } catch (dbErr) {
        console.warn('MySQL insert user notice:', dbErr.message);
      }
    }

    return res.status(201).json({ success: true, message: 'تم إنشاء المستخدم ومنحه الصلاحيات بنجاح', data: newUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const numId = Number(id);
    const index = inMemoryUsers.findIndex(u => u.id === numId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    inMemoryUsers[index] = {
      ...inMemoryUsers[index],
      ...req.body,
      id: numId
    };

    return res.json({ success: true, message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح', data: inMemoryUsers[index] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const numId = Number(id);
    if (numId === 1) {
      return res.status(403).json({ success: false, message: 'لا يمكن حذف الحساب القيادي الرئيسي للمنظومة' });
    }
    inMemoryUsers = inMemoryUsers.filter(u => u.id !== numId);
    return res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { full_name, badge_number, rank_title, department, phone, email, avatar, current_password, new_password } = req.body;
    
    // Update the main admin user in memory
    const adminIndex = inMemoryUsers.findIndex(u => u.id === 1);
    if (adminIndex !== -1) {
      inMemoryUsers[adminIndex] = {
        ...inMemoryUsers[adminIndex],
        full_name: full_name || inMemoryUsers[adminIndex].full_name,
        badge_number: badge_number || inMemoryUsers[adminIndex].badge_number,
        rank_title: rank_title || inMemoryUsers[adminIndex].rank_title,
        department: department || inMemoryUsers[adminIndex].department,
        phone: phone !== undefined ? phone : inMemoryUsers[adminIndex].phone,
        email: email || inMemoryUsers[adminIndex].email,
        avatar: avatar !== undefined ? avatar : inMemoryUsers[adminIndex].avatar
      };
    }

    return res.json({
      success: true,
      message: 'تم تحديث البيانات الشخصية والصورة بنجاح',
      data: inMemoryUsers[adminIndex]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
