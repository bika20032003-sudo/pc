import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';

const defaultAdminHash = bcrypt.hashSync('admin123', 10);
const defaultUserHash = bcrypt.hashSync('123456', 10);

// Helper to strip sensitive password data from any user object
function sanitizeUser(u) {
  if (!u) return null;
  const { password, password_raw, password_hash, ...safe } = u;
  return safe;
}

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
        const [rows] = await pool.query(
          'SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login, created_at FROM users ORDER BY id ASC'
        );
        if (rows && rows.length > 0) {
          return res.json({ success: true, count: rows.length, data: rows });
        }
      } catch (e) {
        console.warn('Falling back to memory users:', e.message);
      }
    }
    const safeUsers = inMemoryUsers.map(sanitizeUser);
    return res.json({ success: true, count: safeUsers.length, data: safeUsers });
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

    const cleanUsername = username.trim();
    // Check if username already exists
    if (inMemoryUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً' });
    }

    const rawPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Compute a safe numeric ID
    const maxId = inMemoryUsers.reduce((max, u) => (u.id > max ? u.id : max), 0);
    const newId = maxId + 1;

    const newUser = {
      id: newId,
      username: cleanUsername,
      email: email ? email.trim() : `${cleanUsername}@ubari.moi.gov.ly`,
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

    inMemoryUsers.push(newUser);

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

    return res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم ومنحه الصلاحيات بنجاح',
      data: sanitizeUser(newUser)
    });
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

    const { password, new_password, password_hash, ...updates } = req.body;

    // Handle password update if provided
    let newHash = inMemoryUsers[index].password_hash;
    const pwdToSet = new_password || password;
    if (pwdToSet && typeof pwdToSet === 'string' && pwdToSet.trim().length >= 4) {
      newHash = await bcrypt.hash(pwdToSet.trim(), 10);
    }

    inMemoryUsers[index] = {
      ...inMemoryUsers[index],
      ...updates,
      password_hash: newHash,
      id: numId
    };

    // Remove legacy unhashed properties if any
    delete inMemoryUsers[index].password;
    delete inMemoryUsers[index].password_raw;

    // Persist in MySQL if connected
    const { pool, isMySqlConnected } = getDb();
    if (isMySqlConnected && pool) {
      try {
        const u = inMemoryUsers[index];
        await pool.query(
          `UPDATE users SET full_name = ?, badge_number = ?, rank_title = ?, department = ?, role = ?, status = ?, password_hash = ? WHERE id = ? OR username = ?`,
          [u.full_name, u.badge_number, u.rank_title, u.department, u.role === 'super_admin' ? 'super_admin' : 'officer', u.status, u.password_hash, numId, u.username]
        );
      } catch (dbErr) {
        console.warn('MySQL update user notice:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح',
      data: sanitizeUser(inMemoryUsers[index])
    });
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

    const targetUser = inMemoryUsers.find(u => u.id === numId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    inMemoryUsers = inMemoryUsers.filter(u => u.id !== numId);

    // Delete from MySQL if connected
    const { pool, isMySqlConnected } = getDb();
    if (isMySqlConnected && pool) {
      try {
        await pool.query('DELETE FROM users WHERE id = ? OR username = ?', [numId, targetUser.username]);
      } catch (dbErr) {
        console.warn('MySQL delete user notice:', dbErr.message);
      }
    }

    return res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { full_name, badge_number, rank_title, department, phone, email, avatar, current_password, new_password, userId, id } = req.body;

    // Identify target user: from authenticated session (req.user), or explicit userId / id, defaulting to 1
    const targetId = Number(req.user?.id || userId || id || 1);

    const userIndex = inMemoryUsers.findIndex(u => u.id === targetId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const targetUser = inMemoryUsers[userIndex];

    // Password change validation if requested
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغيير' });
      }
      const isMatch = await bcrypt.compare(current_password, targetUser.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
      }
      targetUser.password_hash = await bcrypt.hash(new_password, 10);
    }

    // Update profile fields
    if (full_name) targetUser.full_name = full_name.trim();
    if (badge_number) targetUser.badge_number = badge_number.trim();
    if (rank_title) targetUser.rank_title = rank_title.trim();
    if (department) targetUser.department = department.trim();
    if (phone !== undefined) targetUser.phone = phone;
    if (email) targetUser.email = email.trim();
    if (avatar !== undefined) targetUser.avatar = avatar;

    // Delete legacy plaintext passwords if lingering
    delete targetUser.password;
    delete targetUser.password_raw;

    // Update in MySQL if connected
    const { pool, isMySqlConnected } = getDb();
    if (isMySqlConnected && pool) {
      try {
        await pool.query(
          `UPDATE users SET full_name = ?, badge_number = ?, rank_title = ?, department = ?, email = ?, avatar = ?, password_hash = ? WHERE id = ? OR username = ?`,
          [targetUser.full_name, targetUser.badge_number, targetUser.rank_title, targetUser.department, targetUser.email, targetUser.avatar, targetUser.password_hash, targetId, targetUser.username]
        );
      } catch (dbErr) {
        console.warn('MySQL update profile notice:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'تم تحديث البيانات الشخصية بنجاح',
      data: sanitizeUser(targetUser)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
