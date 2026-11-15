import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';
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
    await db.run(
      'INSERT INTO audit_logs (user_id, username, action, ip_address, status, details) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.username, 'تسجيل دخول', req.ip || '127.0.0.1', 'success', 'تم تسجيل الدخول بنجاح إلى منظومة أوباري']
    );

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
        avatar: user.avatar || '',
        databaseEngine: 'SQLite WAL Mode'
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

    const { db } = getDb();
    const user = await db.get(
      'SELECT id, username, email, full_name, badge_number, rank_title, department, role, status, avatar, last_login FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        databaseEngine: 'SQLite WAL Mode'
      }
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'انتهت صلاحية الجلسة أو أن التوكن غير صالح' });
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
