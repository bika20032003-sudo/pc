import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { inMemoryUsers } from './userController.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';

const JWT_SECRET = process.env.JWT_SECRET || 'interior_ministry_secret_key_2026';

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
    const cleanId = identifier.trim();
    const normId = normalizeArabicText(cleanId);

    // 1. Check MySQL if connected
    if (isMySqlConnected && pool) {
      try {
        const [rows] = await pool.query(
          'SELECT * FROM users WHERE (username = ? OR email = ? OR badge_number = ? OR full_name LIKE ?) AND status = ? LIMIT 1',
          [cleanId, cleanId, cleanId, `%${cleanId}%`, 'active']
        );
        if (rows.length > 0) {
          user = rows[0];
        }
      } catch (err) {
        console.warn('MySQL login query notice:', err.message);
      }
    }

    // 2. Search inMemoryUsers and memoryUsers
    if (!user) {
      const allPool = [...(inMemoryUsers || []), ...(memoryUsers || [])];
      user = allPool.find((u) => {
        if (u.status && u.status !== 'active') return false;
        const uUser = normalizeArabicText(u.username || '');
        const uEmail = normalizeArabicText(u.email || '');
        const uBadge = normalizeArabicText(u.badge_number || '');
        const uName = normalizeArabicText(u.full_name || '');

        return (
          uUser === normId ||
          uEmail === normId ||
          uBadge === normId ||
          uName === normId ||
          uName.includes(normId) ||
          normId.includes(uName)
        );
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو كلمة المرور'
      });
    }

    // Verify password securely using bcrypt
    let passwordMatches = false;
    if (user.password_hash) {
      try {
        passwordMatches = await bcrypt.compare(password, user.password_hash);
      } catch (e) {
        console.error('Password hash comparison error:', e);
      }
    } else if (user.password) {
      // Legacy unhashed fallback only if hash not set yet
      passwordMatches = (user.password === password);
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
    } else {
      user = memoryUsers.find((u) => u.id === decoded.id) || memoryUsers[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      success: true,
      user: { ...user, isMySqlConnected }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'انتهت صلاحية الجلسة' });
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
