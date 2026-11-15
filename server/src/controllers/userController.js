import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';

export async function getAllUsers(req, res) {
  try {
    const { db } = getDb();
    const users = await db.all(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login, created_at
      FROM users
      ORDER BY id ASC
    `);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'خطأ في جلب قائمة المستخدمين', error: error.message });
  }
}

export async function createUser(req, res) {
  try {
    const { username, email, password, full_name, badge_number, rank_title, department, role, status } = req.body;

    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور والاسم الكامل حقول إلزامية' });
    }

    const { db } = getDb();

    // Check duplicate
    const existing = await db.get('SELECT id FROM users WHERE username = ? OR (email IS NOT NULL AND email = ?)', [username, email || '']);
    if (existing) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(`
      INSERT INTO users (username, email, password_hash, full_name, badge_number, rank_title, department, role, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      username.trim(),
      email ? email.trim() : null,
      passwordHash,
      full_name.trim(),
      badge_number ? badge_number.trim() : 'MOI-001',
      rank_title ? rank_title.trim() : 'موظف تشغيل',
      department ? department.trim() : 'مديرية أمن أوباري',
      role || 'officer',
      status || 'active'
    ]);

    const newUser = await db.get(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, created_at
      FROM users WHERE id = ?
    `, [result.lastID]);

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      user: newUser
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'خطأ في إضافة المستخدم', error: error.message });
  }
}

export async function updateUser(req, res) {
  try {
    const userId = Number(req.params.id);
    const { full_name, badge_number, rank_title, department, role, status, email, password } = req.body;

    const { db } = getDb();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    let passwordHash = user.password_hash;
    if (password && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    await db.run(`
      UPDATE users SET
        full_name = ?,
        badge_number = ?,
        rank_title = ?,
        department = ?,
        role = ?,
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
      status !== undefined ? status : user.status,
      email !== undefined ? email : user.email,
      passwordHash,
      userId
    ]);

    const updated = await db.get(`
      SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login, updated_at
      FROM users WHERE id = ?
    `, [userId]);

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: updated
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ success: false, message: 'خطأ في تحديث المستخدم', error: error.message });
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
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'خطأ في حذف المستخدم', error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { id, full_name, email, current_password, new_password, avatar } = req.body;
    const { db } = getDb();

    // Must target valid user ID
    const targetId = id || (req.user && req.user.id);
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'معرف المستخدم غير محدد' });
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
      passwordHash = await bcrypt.hash(new_password, 10);
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
    console.error('Error updating profile:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في تحديث البيانات', error: error.message });
  }
}
