import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { normalizeArabicText } from '../utils/arabicUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../data/moi_system.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;
let isConnected = false;

/**
 * تهيئة محرك قاعدة بيانات SQLite السيادية المعتمدة
 */
export async function initDatabase() {
  try {
    console.log('⚡ جارٍ تشغيل محرك قاعدة بيانات SQLite السيادية المعتمدة...');

    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // ضبط إعدادات التزامن العالي وتحمل الضغط الميداني
    await dbInstance.exec('PRAGMA journal_mode = WAL;');
    await dbInstance.exec('PRAGMA busy_timeout = 5000;');
    await dbInstance.exec('PRAGMA synchronous = NORMAL;');
    await dbInstance.exec('PRAGMA foreign_keys = ON;');
    await dbInstance.exec('PRAGMA cache_size = -64000;'); // 64MB Cache

    // 1. جدول المستخدمين والصلاحيات
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        badge_number TEXT DEFAULT 'MOI-001',
        rank_title TEXT DEFAULT 'لواء شرطة / مدير النظام',
        department TEXT DEFAULT 'الإدارة العامة للعمليات والأمن',
        role TEXT CHECK(role IN ('super_admin', 'officer', 'operator', 'auditor')) DEFAULT 'super_admin',
        status TEXT CHECK(status IN ('active', 'suspended', 'inactive')) DEFAULT 'active',
        avatar TEXT,
        last_login TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 2. جدول سجل القوة العمومية المركزي
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS force_members (
        id INTEGER PRIMARY KEY,
        type TEXT DEFAULT 'شرطي',
        name TEXT NOT NULL,
        name_normalized TEXT,
        job_number TEXT,
        national_id TEXT,
        birth_date TEXT,
        birth_place TEXT,
        mother_name TEXT,
        marital_status TEXT,
        wife_name TEXT,
        children_count TEXT,
        tribe_city TEXT,
        residence TEXT,
        phone TEXT,
        languages TEXT,
        education_level TEXT,
        family_book TEXT,
        family_paper TEXT,
        family_record TEXT,
        passport_number TEXT,
        suit_number TEXT,
        shoe_size TEXT,
        headwear_size TEXT,
        shirt_size TEXT,
        blood_type TEXT,
        diseases TEXT,
        height TEXT,
        weight TEXT,
        department TEXT,
        job_title TEXT,
        job_status TEXT DEFAULT 'على رأس العمل',
        start_date TEXT,
        appointment_decision TEXT,
        appointment_date TEXT,
        last_promotion_decision TEXT,
        last_promotion_date TEXT,
        financial_number TEXT,
        basic_salary TEXT,
        bank_name TEXT,
        bank_branch TEXT,
        account_number TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 3. جدول الآليات والدوريات والمركبات الأمنية
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY,
        plate_number TEXT NOT NULL,
        plate_type TEXT,
        make_model TEXT,
        vehicle_type TEXT,
        model_year TEXT,
        chassis_number TEXT,
        engine_number TEXT,
        color TEXT,
        category TEXT,
        department TEXT,
        status TEXT DEFAULT 'جاهزة للعمل',
        fuel_type TEXT,
        odometer TEXT,
        custodian_name TEXT,
        custodian_id TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 4. جدول شؤون الإجازات والمأموريات
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        FullName TEXT NOT NULL,
        NationalNumber TEXT,
        JobNumber TEXT,
        DepartmentName TEXT,
        Rank TEXT,
        LeaveType TEXT NOT NULL,
        StartDate TEXT NOT NULL,
        EndDate TEXT NOT NULL,
        TotalDays INTEGER NOT NULL,
        Reason TEXT,
        Status TEXT DEFAULT 'سارية',
        Notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 5. جدول الحضور والانصراف والدوام الميداني
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        member_id TEXT NOT NULL,
        status TEXT DEFAULT 'حاضر',
        time_in TEXT,
        time_out TEXT,
        notes TEXT,
        recorded_by TEXT DEFAULT 'الضابط المناوب',
        updated_at TEXT DEFAULT (datetime('now', 'localtime')),
        UNIQUE(date, member_id)
      );
    `);

    // 6. جدول الرقابة وسجلات التدقيق الأمني
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT,
        status TEXT DEFAULT 'success',
        details TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 7. إنشاء الفهارس الذكية لسرعة البحث الفوري بالاسم والرقم الوطني
    await dbInstance.exec(`
      CREATE INDEX IF NOT EXISTS idx_force_national_id ON force_members(national_id);
      CREATE INDEX IF NOT EXISTS idx_force_job_number ON force_members(job_number);
      CREATE INDEX IF NOT EXISTS idx_force_name_norm ON force_members(name_normalized);
      CREATE INDEX IF NOT EXISTS idx_force_dept ON force_members(department);
      CREATE INDEX IF NOT EXISTS idx_force_status ON force_members(job_status);
      CREATE INDEX IF NOT EXISTS idx_force_type ON force_members(type);
      CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON vehicles(plate_number);
      CREATE INDEX IF NOT EXISTS idx_vehicles_dept ON vehicles(department);
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
      CREATE INDEX IF NOT EXISTS idx_leaves_nat_id ON leaves(NationalNumber);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    // 8. التحقق من وجود مستخدم المسؤول الافتراضي
    const adminUser = await dbInstance.get('SELECT id FROM users WHERE username = ?', ['admin']);
    if (!adminUser) {
      const passwordHash = bcrypt.hashSync('admin', 10);
      await dbInstance.run(`
        INSERT INTO users (username, email, password_hash, full_name, badge_number, rank_title, department, role, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin',
        'admin@moi.gov.ly',
        passwordHash,
        'سيادة اللواء / موسى سعد محمد البدين',
        'MOI-10492',
        'لواء شرطة / رئيس مركز العمليات والتحكم',
        'غرفة العمليات المركزية - ديوان الوزارة',
        'super_admin',
        'active'
      ]);
      console.log('👤 تم إنشاء حساب المسؤول الرئيسي في SQLite: admin / admin');
    }

    // 9. ترحيل سجلات القوة العمومية (2,211 فرداً) إذا كان الجدول فارغاً
    const forceCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM force_members');
    if (!forceCountRow || forceCountRow.c === 0) {
      const forceJsonPath = path.resolve(__dirname, '../data/force_data.json');
      if (fs.existsSync(forceJsonPath)) {
        try {
          const raw = fs.readFileSync(forceJsonPath, 'utf8');
          const members = JSON.parse(raw);
          console.log(`📦 جارٍ ترحيل ${members.length} سجلاً للقوة العمومية إلى SQLite...`);

          await dbInstance.run('BEGIN TRANSACTION;');
          const stmt = await dbInstance.prepare(`
            INSERT INTO force_members (
              id, type, name, name_normalized, job_number, national_id, birth_date, birth_place,
              mother_name, marital_status, wife_name, children_count, tribe_city, residence,
              phone, languages, education_level, family_book, family_paper, family_record,
              passport_number, suit_number, shoe_size, headwear_size, shirt_size, blood_type,
              diseases, height, weight, department, job_title, job_status, start_date,
              appointment_decision, appointment_date, last_promotion_decision, last_promotion_date,
              financial_number, basic_salary, bank_name, bank_branch, account_number, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const m of members) {
            await stmt.run([
              m.id,
              m.type || 'شرطي',
              m.name || '',
              normalizeArabicText(m.name || ''),
              m.job_number ? String(m.job_number) : '',
              m.national_id ? String(m.national_id) : '',
              m.birth_date || '',
              m.birth_place || '',
              m.mother_name || '',
              m.marital_status || '',
              m.wife_name || '',
              m.children_count ? String(m.children_count) : '0',
              m.tribe_city || '',
              m.residence || '',
              m.phone || '',
              m.languages || 'العربية',
              m.education_level || '',
              m.family_book || '',
              m.family_paper || '',
              m.family_record || '',
              m.passport_number || '',
              m.suit_number || '',
              m.shoe_size ? String(m.shoe_size) : '',
              m.headwear_size ? String(m.headwear_size) : '',
              m.shirt_size || '',
              m.blood_type || 'O+',
              m.diseases || 'سليم ولائق صحياً',
              m.height ? String(m.height) : '',
              m.weight ? String(m.weight) : '',
              m.department || 'الشؤون الإدارية والمالية',
              m.job_title || 'شرطي',
              m.job_status || 'على رأس العمل',
              m.start_date || '',
              m.appointment_decision || '',
              m.appointment_date || '',
              m.last_promotion_decision || '',
              m.last_promotion_date || '',
              m.financial_number ? String(m.financial_number) : (m.job_number ? String(m.job_number) : ''),
              m.basic_salary ? String(m.basic_salary) : '0',
              m.bank_name || '',
              m.bank_branch || '',
              m.account_number ? String(m.account_number) : '',
              m.notes || ''
            ]);
          }
          await stmt.finalize();
          await dbInstance.run('COMMIT;');
          console.log(`✅ تم ترحيل وتأمين ${members.length} منتسب في SQLite بنجاح.`);
        } catch (err) {
          await dbInstance.run('ROLLBACK;');
          console.error('❌ خطأ في ترحيل سجلات القوة:', err.message);
        }
      }
    } else {
      console.log(`✅ قاعدة بيانات القوة العمومية جاهزة (${forceCountRow.c} سجل)`);
    }

    // 10. ترحيل سجلات الآليات (92 مركبة) إذا كان الجدول فارغاً
    const vehicleCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM vehicles');
    if (!vehicleCountRow || vehicleCountRow.c === 0) {
      const vehiclesJsonPath = path.resolve(__dirname, '../data/vehicles_data.json');
      if (fs.existsSync(vehiclesJsonPath)) {
        try {
          const raw = fs.readFileSync(vehiclesJsonPath, 'utf8');
          const vehiclesList = JSON.parse(raw);
          console.log(`🚗 جارٍ ترحيل ${vehiclesList.length} آلية ومركبة إلى SQLite...`);

          await dbInstance.run('BEGIN TRANSACTION;');
          const vStmt = await dbInstance.prepare(`
            INSERT INTO vehicles (
              id, plate_number, plate_type, make_model, vehicle_type, model_year,
              chassis_number, engine_number, color, category, department,
              status, fuel_type, odometer, custodian_name, custodian_id, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const v of vehiclesList) {
            await vStmt.run([
              v.id,
              v.plate_number ? String(v.plate_number) : '',
              v.plate_type || 'شرطة',
              v.make_model || v.vehicle_type || '',
              v.vehicle_type || v.make_model || '',
              v.model_year ? String(v.model_year) : '',
              v.chassis_number || '',
              v.engine_number || '',
              v.color || '',
              v.category || 'سيارة مراكز وأقسام',
              v.department || 'مديرية أمن أوباري',
              v.status || 'جاهزة للعمل',
              v.fuel_type || 'بنزين',
              v.odometer ? String(v.odometer) : '0',
              v.custodian_name || '',
              v.custodian_id ? String(v.custodian_id) : '',
              v.notes || ''
            ]);
          }
          await vStmt.finalize();
          await dbInstance.run('COMMIT;');
          console.log(`✅ تم ترحيل ${vehiclesList.length} آلية ومركبة إلى SQLite بنجاح.`);
        } catch (err) {
          await dbInstance.run('ROLLBACK;');
          console.error('❌ خطأ في ترحيل الآليات:', err.message);
        }
      }
    } else {
      console.log(`✅ قاعدة بيانات الآليات جاهزة (${vehicleCountRow.c} مركبة)`);
    }

    // 11. ترحيل سجلات الإجازات إذا كان الجدول فارغاً
    const leaveCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM leaves');
    if (!leaveCountRow || leaveCountRow.c === 0) {
      const leavesJsonPath = path.resolve(__dirname, '../data/leaves_data.json');
      if (fs.existsSync(leavesJsonPath)) {
        try {
          const raw = fs.readFileSync(leavesJsonPath, 'utf8');
          const leavesList = JSON.parse(raw);
          if (Array.isArray(leavesList) && leavesList.length > 0) {
            console.log(`🏖️ جارٍ ترحيل ${leavesList.length} إجازة إلى SQLite...`);

            await dbInstance.run('BEGIN TRANSACTION;');
            const lStmt = await dbInstance.prepare(`
              INSERT INTO leaves (
                FullName, NationalNumber, JobNumber, DepartmentName, Rank,
                LeaveType, StartDate, EndDate, TotalDays, Reason, Status, Notes
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            for (const l of leavesList) {
              await lStmt.run([
                l.FullName || '',
                l.NationalNumber ? String(l.NationalNumber) : '',
                l.JobNumber ? String(l.JobNumber) : '',
                l.DepartmentName || '',
                l.Rank || '',
                l.LeaveType || 'إجازة اعتيادية',
                l.StartDate || '',
                l.EndDate || '',
                l.TotalDays || 1,
                l.Reason || '',
                l.Status || 'سارية',
                l.Notes || ''
              ]);
            }
            await lStmt.finalize();
            await dbInstance.run('COMMIT;');
            console.log(`✅ تم ترحيل ${leavesList.length} إجازة إلى SQLite بنجاح.`);
          }
        } catch (err) {
          await dbInstance.run('ROLLBACK;');
          console.error('❌ خطأ في ترحيل الإجازات:', err.message);
        }
      }
    } else {
      console.log(`✅ قاعدة بيانات الإجازات جاهزة (${leaveCountRow.c} إجازة)`);
    }

    isConnected = true;
    console.log(`🚀 قاعدة بيانات SQLite تعمل بنجاح فائق على الملف: ${dbPath}`);
  } catch (err) {
    isConnected = false;
    console.error('❌ خطأ في تهيئة SQLite:', err);
    throw err;
  }
}

/**
 * الحصول على مرجع قاعدة بيانات SQLite
 */
export function getDb() {
  if (!dbInstance) {
    throw new Error('لم يتم تهيئة قاعدة بيانات SQLite بعد. يرجى استدعاء initDatabase() أولاً.');
  }
  return {
    db: dbInstance,
    isSqliteConnected: isConnected
  };
}
