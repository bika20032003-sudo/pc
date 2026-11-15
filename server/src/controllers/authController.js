import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { inMemoryUsers } from './userController.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'interior_ministry_super_secure_jwt_secret_key_2026';

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم / البريد الإلكتروني وكلمة المرور'
      });
    }

    const { pool, isMySqlConnected, memoryUsers } = getDb();
    let user = null;
    const cleanId = String(identifier).trim();
    const normId = normalizeArabicText(cleanId);

    // 1. Check MySQL if connected
    if (isMySqlConnected && pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE (username = ? OR email = ? OR badge_number = ? OR full_name = ?) AND status = ? LIMIT 1',
          [cleanId, cleanId, cleanId, cleanId, 'active']
        );
        if (rows.length > 0) {
          user = rows[0];
        }
      } catch (err) {
        console.warn('MySQL login query notice:', err.message);
      }
    }

    // 2. Search inMemoryUsers and memoryUsers (precise matching only)
    if (!user) {
      const allPool = [...(inMemoryUsers || []), ...(memoryUsers || [])];
      user = allPool.find((u) => {
        if (u.status && u.status !== 'active') return false;
        const uUser = normalizeArabicText(u.username || '');
        const uEmail = (u.email || '').toLowerCase().trim();
        const uBadge = (u.badge_number || '').trim();
        const uName = normalizeArabicText(u.full_name || '');

        return (
          uUser === normId ||
          uEmail === cleanId.toLowerCase() ||
          uBadge === cleanId ||
          uName === normId
        );
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو كلمة المرور'
      });
    }

    // Verify password strictly using bcrypt (never plaintext comparison)
    let passwordMatches = false;
    if (user.password_hash) {
      try {
        passwordMatches = await bcrypt.compare(password, user.password_hash);
      } catch (e) {
        console.error('Password hash comparison error:', e);
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة'
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        badge_number: user.badge_number
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Update last login
    if (isMySqlConnected && pool) {
      pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]).catch(() => {});
      pool.query(
        'INSERT INTO audit_logs (user_id, username, action, ip_address, status, details) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.username, 'تسجيل دخول', req.ip || '127.0.0.1', 'success', 'تم تسجيل الدخول بنجاح']
      ).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        badge_number: user.badge_number,
        rank_title: user.rank_title,
        department: user.department,
        role: user.role,
        role_label: user.role_label,
        allowed_sections: user.allowed_sections || ['dashboard', 'force'],
        avatar: user.avatar || '',
        isMySqlConnected
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ غير متوقع أثناء تسجيل الدخول',
      error: error.message
    });
  }
}

export async function getProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'جلسة غير مصرح بها' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const { pool, isMySqlConnected, memoryUsers } = getDb();
    let user = null;

    if (isMySqlConnected && pool) {
      const [rows] = await pool.query(
        'SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, last_login FROM users WHERE id = ? LIMIT 1',
        [decoded.id]
      );
      if (rows.length > 0) user = rows[0];
    }
    
    // Check in-memory fallback without unsafe defaulting to admin
    if (!user) {
      const allPool = [...(inMemoryUsers || []), ...(memoryUsers || [])];
      user = allPool.find((u) => u.id === decoded.id || u.username === decoded.username);
    }

    // Never default to memoryUsers[0]
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    // Strip any password fields
    const { password, password_raw, password_hash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: { ...safeUser, isMySqlConnected }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'انتهت صلاحية الجلسة أو أن التوكن غير صالح' });
  }
}

export function getSystemStatus(req, res) {
  const { isMySqlConnected } = getDb();
  res.json({
    status: 'online',
    systemName: 'منظومة وزارة الداخلية الموحدة',
    databaseType: 'MySQL',
    databaseStatus: isMySqlConnected ? 'متصل بقاعدة البيانات' : 'وضع المعاينة النشط (قيد انتظار خادم MySQL)',
    timestamp: new Date().toISOString()
  });
}
