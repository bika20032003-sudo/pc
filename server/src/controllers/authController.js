import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import { JWT_SECRET } from '../config/jwt.js';
import { sendServerError, writeAuditLog, parseAllowedSections } from '../utils/controllerUtils.js';

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'يرجى إدخال اسم المستخدم / البريد الإلكتروني وكلمة المرور'
      });
    }

    const { db } = getDb();
    const cleanId = String(identifier).trim();
    const normId = normalizeArabicText(cleanId);

    // Search user in SQLite
    let user = await db.get(
      'SELECT * FROM users WHERE (username = ? OR email = ? OR badge_number = ? OR full_name = ?) AND status = ? LIMIT 1',
      [cleanId, cleanId, cleanId, cleanId, 'active']
    );

    // Secondary Arabic normalized search
    if (!user) {
      const allUsers = await db.all('SELECT * FROM users WHERE status = ?', ['active']);
      user = allUsers.find(u => {
        const uUser = normalizeArabicText(u.username || '');
        const uEmail = (u.email || '').toLowerCase().trim();
        const uBadge = (u.badge_number || '').trim();
        const uName = normalizeArabicText(u.full_name || '');
        return uUser === normId || uEmail === cleanId.toLowerCase() || uBadge === cleanId || uName === normId;
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو كلمة المرور'
      });
    }

    // Verify password strictly with bcrypt
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

    // Update last login and insert audit log in SQLite
    const nowIso = new Date().toISOString();
    await db.run('UPDATE users SET last_login = ? WHERE id = ?', [nowIso, user.id]);
    await writeAuditLog(db, {
      userId: user.id,
      username: user.username,
      action: 'تسجيل دخول',
      ipAddress: req.ip || '127.0.0.1',
      status: 'success',
      details: 'تم تسجيل الدخول بنجاح إلى منظومة أوباري'
    });

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
        allowed_sections: parseAllowedSections(user.allowed_sections, user.role, user.username),
        avatar: user.avatar || '',
        databaseEngine: 'SQLite WAL Mode'
      }
    });
  } catch (error) {
    return sendServerError(res, error, 'Login error', 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'جلسة غير مصرح بها' });
    }

    const { db } = getDb();
    const user = await db.get(
      'SELECT id, username, email, full_name, badge_number, rank_title, department, role, allowed_sections, status, avatar, last_login FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!user || user.status !== 'active') {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود أو غير نشط' });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        allowed_sections: parseAllowedSections(user.allowed_sections, user.role, user.username),
        databaseEngine: 'SQLite WAL Mode'
      }
    });
  } catch (error) {
    return sendServerError(res, error, 'Error fetching user profile', 'تعذر جلب الملف الشخصي للمستخدم');
  }
}

export function getSystemStatus(req, res) {
  const { isSqliteConnected } = getDb();
  res.json({
    status: 'online',
    systemName: 'منظومة مديرية أمن أوباري | وزارة الداخلية',
    databaseType: 'SQLite (WAL Mode High Concurrency)',
    databaseStatus: isSqliteConnected ? 'قاعدة بيانات SQLite المعتمدة متصلة وتعمل بكفاءة' : 'غير متصل',
    timestamp: new Date().toISOString()
  });
}
