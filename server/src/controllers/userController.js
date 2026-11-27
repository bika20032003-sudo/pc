import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { BCRYPT_ROUNDS } from '../config/jwt.js';
import { sendServerError } from '../utils/controllerUtils.js';

export async function getAllUsers(req, res) {
  try {
    const { db } = getDb();
    const rawUsers = await db.all(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, allowed_sections, status, avatar, last_login, created_at
      FROM users
      ORDER BY id ASC
    `);

    const users = rawUsers.map(u => {
      let sections = ['dashboard', 'force'];
      if (u.allowed_sections) {
        try {
          sections = typeof u.allowed_sections === 'string' ? JSON.parse(u.allowed_sections) : u.allowed_sections;
        } catch (_) {
          sections = ['dashboard', 'force'];
        }
      } else if (u.role === 'super_admin' || u.username === 'admin') {
        sections = ['all'];
      }
      return {
        ...u,
        allowed_sections: sections
      };
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return sendServerError(res, error, 'Error fetching users', 'خطأ في جلب قائمة المستخدمين');
  }
}

export async function createUser(req, res) {
  try {
    const { username, email, password, full_name, badge_number, rank_title, department, role, status, allowed_sections } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور والاسم الكامل حقول إلزامية' });
    }

    const { db } = getDb();

    // Check duplicate
    const existing = await db.get('SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [username, email || '']);
    if (existing) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const sectionsJson = JSON.stringify(Array.isArray(allowed_sections) ? allowed_sections : (role === 'super_admin' ? ['all'] : ['dashboard', 'force']));

    const result = await db.run(`
      INSERT INTO users (username, email, password_hash, full_name, badge_number, rank_title, department, role, allowed_sections, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username.trim(),
      email ? email.trim() : null,
      passwordHash,
      full_name.trim(),
      badge_number ? badge_number.trim() : 'MOI-001',
      rank_title ? rank_title.trim() : 'موظف تشغيل',
      department ? department.trim() : 'مديرية أمن أوباري',
      role || 'officer',
      sectionsJson,
      status || 'active'
    ]);

    const newUser = await db.get(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, allowed_sections, status, created_at
      FROM users WHERE id = ?
    `, [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      user: {
        ...newUser,
        allowed_sections: Array.isArray(allowed_sections) ? allowed_sections : ['dashboard', 'force']
      }
    });
  } catch (error) {
    return sendServerError(res, error, 'Error creating user', 'خطأ في إضافة المستخدم');
  }
}

export async function updateUser(req, res) {
  try {
    const userId = Number(req.params.id);
    const { full_name, badge_number, rank_title, department, role, status, email, password, allowed_sections } = req.body;

    const { db } = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    let passwordHash = user.password_hash;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    const sectionsJson = allowed_sections !== undefined
      ? JSON.stringify(Array.isArray(allowed_sections) ? allowed_sections : (role === 'super_admin' ? ['all'] : ['dashboard', 'force']))
      : user.allowed_sections;

    await db.run(`
      UPDATE users SET
        full_name = ?,
        badge_number = ?,
        rank_title = ?,
        department = ?,
        role = ?,
        allowed_sections = ?,
        status = ?,
        email = ?,
        password_hash = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      full_name !== undefined ? full_name : user.full_name,
      badge_number !== undefined ? badge_number : user.badge_number,
      rank_title !== undefined ? rank_title : user.rank_title,
      department !== undefined ? department : user.department,
      role !== undefined ? role : user.role,
      sectionsJson,
      status !== undefined ? status : user.status,
      email !== undefined ? email : user.email,
      passwordHash,
      userId
    ]);

    const updated = await db.get(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, allowed_sections, status, avatar, last_login, updated_at
      FROM users WHERE id = ?
    `, [userId]);

    let parsedSections = ['dashboard', 'force'];
    if (updated.allowed_sections) {
      try {
        parsedSections = typeof updated.allowed_sections === 'string' ? JSON.parse(updated.allowed_sections) : updated.allowed_sections;
      } catch (_) {}
    } else if (updated.role === 'super_admin' || updated.username === 'admin') {
      parsedSections = ['all'];
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: {
        ...updated,
        allowed_sections: parsedSections
      }
    });
  } catch (error) {
    return sendServerError(res, error, 'Error updating user', 'خطأ في تحديث المستخدم');
  }
}

export async function deleteUser(req, res) {
  try {
    const userId = Number(req.params.id);
    const { db } = getDb();

    if (userId === 1) {
      return res.status(403).json({ success: false, message: 'لا يمكن حذف حساب المسؤول الرئيسي للنظام' });
    }

    const result = await db.run('DELETE FROM users WHERE id = ?', [userId]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    return sendServerError(res, error, 'Error deleting user', 'خطأ في حذف المستخدم');
  }
}

export async function updateProfile(req, res) {
  try {
    const { id, full_name, email, current_password, new_password, avatar } = req.body;
    const { db } = getDb();

    // Prevent IDOR: non-admin users may ONLY update their own authenticated account
    const isAdmin = req.user && (req.user.role === 'super_admin' || req.user.role === 'admin');
    const targetId = isAdmin && id ? Number(id) : (req.user && req.user.id);
    if (!targetId) {
      return res.status(401).json({ success: false, message: 'جلسة غير صالحة أو معرف المستخدم غير محدد' });
    }

    if (!isAdmin && id && Number(id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بتعديل ملف مستخدم آخر' });
    }

    const user = await db.get('SELECT * FROM users WHERE id = ?', [targetId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    let passwordHash = user.password_hash;
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, message: 'يرجى إدخال كلمة المرور الحالية لتأكيد التغيير' });
      }
      const match = await bcrypt.compare(current_password, user.password_hash);
      if (!match) {
        return res.status(400).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
      }
      passwordHash = await bcrypt.hash(new_password, BCRYPT_ROUNDS);
    }

    await db.run(`
      UPDATE users SET
        full_name = ?,
        email = ?,
        avatar = ?,
        password_hash = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      full_name || user.full_name,
      email || user.email,
      avatar !== undefined ? avatar : user.avatar,
      passwordHash,
      targetId
    ]);

    const updatedUser = await db.get(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login
      FROM users WHERE id = ?
    `, [targetId]);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedUser
    });
  } catch (error) {
    return sendServerError(res, error, 'Error updating profile', 'حدث خطأ في تحديث البيانات');
  }
}
