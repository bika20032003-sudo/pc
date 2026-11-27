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
    await dbInstance.exec('PRAGMA busy_timeout = 10000;');
    await dbInstance.exec('PRAGMA synchronous = NORMAL;');
    await dbInstance.exec('PRAGMA foreign_keys = ON;');
    await dbInstance.exec('PRAGMA cache_size = -64000;'); // 64MB Cache
    await dbInstance.exec('PRAGMA temp_store = MEMORY;');
    await dbInstance.exec('PRAGMA mmap_size = 268435456;'); // 256MB zero-copy memory-mapped I/O

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
        role TEXT DEFAULT 'super_admin',
        allowed_sections TEXT DEFAULT '["all"]',
        status TEXT CHECK(status IN ('active', 'suspended', 'inactive')) DEFAULT 'active',
        avatar TEXT,
        last_login TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // ترقية وتوسيع جدول المستخدمين لدعم كافة الأدوار الحديثة والصلاحيات
    try {
      const tableInfo = await dbInstance.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='users';");
      if (tableInfo && tableInfo.sql && tableInfo.sql.includes("role IN ('super_admin', 'officer', 'operator', 'auditor')")) {
        await dbInstance.exec(`
          BEGIN TRANSACTION;
          CREATE TABLE users_upgraded (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            badge_number TEXT DEFAULT 'MOI-001',
            rank_title TEXT DEFAULT 'لواء شرطة / مدير النظام',
            department TEXT DEFAULT 'الإدارة العامة للعمليات والأمن',
            role TEXT DEFAULT 'super_admin',
            allowed_sections TEXT DEFAULT '["all"]',
            status TEXT DEFAULT 'active',
            avatar TEXT,
            last_login TEXT,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime'))
          );
          INSERT INTO users_upgraded (id, username, email, password_hash, full_name, badge_number, rank_title, department, role, status, avatar, last_login, created_at, updated_at)
          SELECT id, username, email, password_hash, full_name, badge_number, rank_title, department, role, status, avatar, last_login, created_at, updated_at FROM users;
          DROP TABLE users;
          ALTER TABLE users_upgraded RENAME TO users;
          COMMIT;
        `);
      } else {
        const userCols = await dbInstance.all('PRAGMA table_info(users);');
        if (!userCols.some(c => c.name === 'allowed_sections')) {
          await dbInstance.exec("ALTER TABLE users ADD COLUMN allowed_sections TEXT DEFAULT '[\"all\"]';");
        }
      }
    } catch (e) {
      console.warn('تنبيه أثناء فحص ترقية جدول المستخدمين:', e.message);
    }

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

    // 7. جدول البريد والمراسلات والرسائل الرسمية (الصادر، الوارد، المحال، النماذج)
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS mail_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL DEFAULT 'outgoing',
        code_no TEXT,
        record_number TEXT,
        reference TEXT,
        reply_to_reference TEXT,
        reply_date TEXT,
        recipient TEXT,
        recipient_title TEXT,
        source_entity TEXT,
        date TEXT,
        time TEXT,
        subject TEXT NOT NULL,
        delivery_method TEXT,
        sender_employee TEXT,
        editor_employee TEXT,
        receiver_employee TEXT,
        print_employee TEXT,
        status TEXT DEFAULT 'delivered',
        attachment_name TEXT,
        attachment_data TEXT,
        letter_body TEXT,
        cc_list TEXT,
        signer_name TEXT DEFAULT 'لواء / موسى سعد محمد',
        signer_title TEXT DEFAULT 'مدير مديرية أمن أوباري',
        phone TEXT,
        email TEXT,
        template_type TEXT,
        force_member_id INTEGER,
        director_notes TEXT,
        target_dept TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 8. جدول سجل الأسلحة والذخائر والعهد الرسمية
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS weapons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weapon_type TEXT NOT NULL,
        weapon_number TEXT NOT NULL UNIQUE,
        serial_number TEXT,
        caliber TEXT,
        ammo_count INTEGER DEFAULT 0,
        magazines_count INTEGER DEFAULT 0,
        receiving_entity TEXT NOT NULL,
        receiver_name TEXT,
        status TEXT DEFAULT 'صالح للعمل ومصروف',
        issue_date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 9. إنشاء الفهارس الذكية لسرعة البحث الفوري بالاسم والرقم الوطني
    await dbInstance.exec(`
      CREATE INDEX IF NOT EXISTS idx_force_national_id ON force_members(national_id);
      CREATE INDEX IF NOT EXISTS idx_force_job_number ON force_members(job_number);
      CREATE INDEX IF NOT EXISTS idx_force_financial_number ON force_members(financial_number);
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
      CREATE INDEX IF NOT EXISTS idx_mail_type ON mail_records(type);
      CREATE INDEX IF NOT EXISTS idx_mail_ref ON mail_records(reference);
      CREATE INDEX IF NOT EXISTS idx_mail_status ON mail_records(status);
      CREATE INDEX IF NOT EXISTS idx_mail_created_at ON mail_records(created_at);
      CREATE INDEX IF NOT EXISTS idx_weapons_number ON weapons(weapon_number);
      CREATE INDEX IF NOT EXISTS idx_weapons_type ON weapons(weapon_type);
      CREATE INDEX IF NOT EXISTS idx_weapons_entity ON weapons(receiving_entity);
      CREATE INDEX IF NOT EXISTS idx_weapons_receiver ON weapons(receiver_name);
    `);

    // 10. جدول سجل العقوبات والانضباط وصحائف الاتهام
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS penalties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        penalty_id INTEGER,
        full_name TEXT NOT NULL,
        national_id TEXT,
        job_number TEXT,
        employee_category TEXT DEFAULT 'نظامي',
        penalty_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        penalty_date TEXT NOT NULL,
        deduction_days INTEGER DEFAULT 0,
        decision_number TEXT,
        is_applied INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
      CREATE INDEX IF NOT EXISTS idx_penalties_name ON penalties(full_name);
      CREATE INDEX IF NOT EXISTS idx_penalties_nat_id ON penalties(national_id);
      CREATE INDEX IF NOT EXISTS idx_penalties_job_no ON penalties(job_number);
      CREATE INDEX IF NOT EXISTS idx_penalties_type ON penalties(penalty_type);
    `);

    // 10b. إضافة عمود الصورة الشخصية لجدول القوة العمومية إن لم يكن موجوداً
    const forceCols = await dbInstance.all('PRAGMA table_info(force_members)');
    if (forceCols && !forceCols.some(c => c.name === 'photo')) {
      await dbInstance.exec('ALTER TABLE force_members ADD COLUMN photo TEXT;');
    }

    // 11. جدول الأقسام والمراكز المعتمدة
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT NOT NULL,
        head_name TEXT DEFAULT 'غير محدد',
        created_at TEXT DEFAULT (datetime('now', 'localtime')),
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
      CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(department_name);
    `);

    // 12. جداول الوقود والمحروقات (الأرصدة، الشحنات الواردة، أذونات الصرف)
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS fuel_tanks (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        main_balance REAL DEFAULT 0,
        sub_balance REAL DEFAULT 0,
        total_consumed REAL DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
      CREATE TABLE IF NOT EXISTS fuel_shipments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station TEXT NOT NULL,
        fuel_type TEXT DEFAULT 'بنزين 95 ممتاز',
        quantity REAL NOT NULL,
        supplier TEXT,
        date TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
      CREATE TABLE IF NOT EXISTS fuel_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucher_no TEXT,
        station TEXT NOT NULL,
        plate_number TEXT,
        driver_name TEXT,
        vehicle_type TEXT,
        fuel_type TEXT DEFAULT 'بنزين',
        liters REAL NOT NULL,
        odometer REAL DEFAULT 0,
        date TEXT,
        is_external INTEGER DEFAULT 0,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 13. جدول غرفة العمليات والنقاط والتمركزات الميدانية
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS operations_locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT,
        category TEXT DEFAULT 'gate',
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        icon TEXT DEFAULT 'gate',
        status TEXT DEFAULT 'تمركز أمني نشط',
        color TEXT DEFAULT '#dc2626',
        officers INTEGER DEFAULT 0,
        vehicles INTEGER DEFAULT 0,
        commander TEXT,
        phone TEXT,
        notes TEXT,
        updated_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 8. التحقق من وجود مستخدم المسؤول الافتراضي
    const adminUser = await dbInstance.get('SELECT id FROM users WHERE username = ?', ['admin']);
    if (!adminUser) {
      const passwordHash = bcrypt.hashSync('admin1234', 12);
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
      console.log('👤 تم إنشاء حساب المسؤول الرئيسي في SQLite: admin');
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

    // 12. ترحيل سجلات البريد والمراسلات إذا كان الجدول فارغاً
    const mailCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM mail_records');
    if (!mailCountRow || mailCountRow.c === 0) {
      console.log('📬 جارٍ تهيئة سجلات البريد والمراسلات الرسمية في SQLite...');
      await dbInstance.run('BEGIN TRANSACTION;');
      const mStmt = await dbInstance.prepare(`
        INSERT INTO mail_records (
          type, code_no, record_number, reference, reply_to_reference, reply_date,
          recipient, recipient_title, source_entity, date, time, subject,
          delivery_method, sender_employee, editor_employee, receiver_employee,
          print_employee, status, attachment_name, letter_body, cc_list,
          signer_name, signer_title, phone, email, director_notes, target_dept, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // 12.1 الصادر المعتمد
      const initialOutgoing = [
        {
          code_no: '2026-002',
          record_number: '1',
          reference: '12/2026',
          reply_to_reference: '1.2/2026',
          reply_date: '10/10/2026',
          recipient: 'آمر المنطقة العسكرية الجنوبية',
          recipient_title: 'إلى السيد / آمر المنطقة العسكرية الجنوبية',
          date: '11/10/2026',
          subject: 'التنسيق الأمني وتسيير الدوريات بالمنطقة الجنوبية وتأمين مداخل مدينة أوباري',
          delivery_method: 'إلكتروني (منظومة/إيميل)',
          sender_employee: 'عبدالصمد',
          editor_employee: 'عبدالصمد',
          print_employee: 'عبدالصمد',
          status: 'delivered',
          attachment_name: 'مذكرة_تنسيق_رسمية.pdf',
          letter_body: 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
          cc_list: JSON.stringify([
            'السيد / وكيل وزارة الداخلية',
            'معالي / وزير الداخلية',
            'آمر المنطقة العسكرية الجنوبية',
            'المساعد للشؤون الأمنية',
            'الغرفة الأمنية المشتركة',
            'الإدارة العامة للتفتيش والمتابعة'
          ])
        },
        {
          code_no: '2026-001',
          record_number: '150',
          reference: '10/2026',
          reply_to_reference: '',
          reply_date: '',
          recipient: 'مدير الإدارة العامة للتفتيش والمتابعة',
          recipient_title: 'إلى السيد / مدير الإدارة العامة للتفتيش والمتابعة',
          date: '08/10/2026',
          subject: 'إحالة التقرير الشهري لضبطيات الدوريات ومراكز الشرطة بالمديرية',
          delivery_method: 'يدوي / ورقي',
          sender_employee: 'عبدالصمد',
          editor_employee: 'عبدالصمد',
          print_employee: 'عبدالصمد',
          status: 'delivered',
          attachment_name: 'تقرير_شهري_أكتوبر.pdf',
          letter_body: 'نحيل إليكم طيه كشف التقرير الأمني الدوري لمديرية أمن أوباري، المتضمن كافة المحاضر والضبطيات ومناوبات الأجهزة الأمنية لشهر أكتوبر 2026م للتفضل بالاطلاع.',
          cc_list: JSON.stringify([
            'السيد / وكيل وزارة الداخلية',
            'المساعد للشؤون الأمنية'
          ])
        }
      ];

      for (const o of initialOutgoing) {
        await mStmt.run([
          'outgoing', o.code_no, o.record_number, o.reference, o.reply_to_reference, o.reply_date,
          o.recipient, o.recipient_title, '', o.date, '', o.subject,
          o.delivery_method, o.sender_employee, o.editor_employee, '',
          o.print_employee, o.status, o.attachment_name, o.letter_body, o.cc_list,
          'لواء / موسى سعد محمد البدين', 'مدير مديرية أمن أوباري', '0921250071', 'moderytamnobari@gmail.com',
          '', '', ''
        ]);
      }

      // 12.2 الوارد المعتمد
      const initialIncoming = [
        {
          reference: '1.2/2026',
          reply_to_reference: '12/2026',
          source_entity: 'آمر المنطقة العسكرية الجنوبية',
          date: '10/10/2026',
          time: '11:45',
          subject: 'طلب تنسيق مشترك بخصوص تأمين النقاط والمراكز الحيوية',
          delivery_method: 'مناولة باليد (مراسل)',
          receiver_employee: 'عبدالصمد',
          status: 'replied',
          attachment_name: 'كتاب_عسكري_وارد_1_2.pdf'
        },
        {
          reference: '77/م.و/2026',
          reply_to_reference: '',
          source_entity: 'مكتب وكيل وزارة الداخلية للشؤون الفنية',
          date: '05/10/2026',
          time: '09:30',
          subject: 'تعليمات عاجلة بشأن جاهزية الاتصالات اللاسلكية والغرف المشتركة',
          delivery_method: 'بريد إلكتروني رسمي',
          receiver_employee: 'عبدالصمد',
          status: 'in_progress',
          attachment_name: 'تعليمات_وكيل_الوزارة.pdf'
        }
      ];

      for (const inc of initialIncoming) {
        await mStmt.run([
          'incoming', '', '', inc.reference, inc.reply_to_reference, '',
          'مديرية أمن أوباري', 'إلى السيد / مدير مديرية أمن أوباري', inc.source_entity, inc.date, inc.time, inc.subject,
          inc.delivery_method, '', '', inc.receiver_employee,
          '', inc.status, inc.attachment_name, '', '[]',
          'لواء / موسى سعد محمد البدين', 'مدير مديرية أمن أوباري', '', '',
          '', '', ''
        ]);
      }

      // 12.3 البريد المحال المعتمد (من ملف referred_mail_data.json)
      let referredJsonPath = path.resolve(__dirname, '../data/referred_mail_data.json');
      if (!fs.existsSync(referredJsonPath)) {
        referredJsonPath = path.resolve(__dirname, '../../../client/src/data/referred_mail_data.json');
      }
      if (fs.existsSync(referredJsonPath)) {
        try {
          const rawRef = fs.readFileSync(referredJsonPath, 'utf8');
          const refList = JSON.parse(rawRef);
          if (Array.isArray(refList)) {
            for (const r of refList) {
              await mStmt.run([
                'referred', String(r.MailNumber || ''), String(r.MailID || ''), String(r.MailNumber || ''), '', '',
                r.TargetDept || '', '', 'ديوان المديرية', r.ReferralDate || new Date().toISOString(), '', r.Subject || '',
                'إحالة رسمية', 'عبدالصمد', 'عبدالصمد', '',
                '', r.Status || 'تحت الإجراء', r.FilePath || '', '', '[]',
                'لواء / موسى سعد محمد البدين', 'مدير مديرية أمن أوباري', '', '',
                r.DirectorNotes || '', r.TargetDept || '', ''
              ]);
            }
          }
        } catch (e) {
          console.error('تنبيه: تعذر قراءة referred_mail_data:', e.message);
        }
      }

      await mStmt.finalize();
      await dbInstance.run('COMMIT;');
      console.log('✅ تم تهيئة وترحيل سجلات البريد الصادر والوارد والمحال إلى SQLite بنجاح.');
    } else {
      console.log(`✅ قاعدة بيانات البريد والمراسلات جاهزة (${mailCountRow.c} سجلاً)`);
    }

    // 13. ترحيل سجل الأسلحة والذخائر (69 قطعة سلاح) إذا كان الجدول فارغاً
    const weaponCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM weapons');
    if (!weaponCountRow || weaponCountRow.c === 0) {
      const weaponsJsonPath = path.resolve(__dirname, '../data/weapons_data.json');
      if (fs.existsSync(weaponsJsonPath)) {
        try {
          const raw = fs.readFileSync(weaponsJsonPath, 'utf8');
          const weaponsList = JSON.parse(raw);
          console.log(`🔫 جارٍ ترحيل ${weaponsList.length} قطعة سلاح وذخيرة إلى SQLite...`);

          await dbInstance.run('BEGIN TRANSACTION;');
          const wStmt = await dbInstance.prepare(`
            INSERT INTO weapons (
              id, weapon_type, weapon_number, serial_number, caliber,
              ammo_count, magazines_count, receiving_entity, receiver_name,
              status, issue_date, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const w of weaponsList) {
            await wStmt.run([
              w.id,
              w.weapon_type || w.WeaponType || 'سلاح ناري',
              String(w.weapon_number || w.WeaponNumber || w.serial_number || '').trim(),
              String(w.serial_number || w.weapon_number || w.WeaponNumber || '').trim(),
              w.caliber || (String(w.weapon_type || w.WeaponType).includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم'),
              parseInt(w.ammo_count || w.AmmoCount, 10) || 0,
              parseInt(w.magazines_count || w.MagazinesCount, 10) || 0,
              w.receiving_entity || w.ReceivingEntity || 'مخزن المديرية',
              w.receiver_name || w.ReceiverName || '',
              w.status || 'صالح للعمل ومصروف',
              w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : '2026-11-01'),
              w.notes || 'عهدة رسمية مقيدة بسجلات مديرية أمن أوباري'
            ]);
          }
          await wStmt.finalize();
          await dbInstance.run('COMMIT;');
          console.log(`✅ تم ترحيل ${weaponsList.length} قطعة سلاح وذخيرة إلى SQLite بنجاح.`);
        } catch (err) {
          await dbInstance.run('ROLLBACK;');
          console.error('❌ خطأ في ترحيل الأسلحة والذخائر:', err.message);
        }
      }
    } else {
      console.log(`✅ قاعدة بيانات الأسلحة والذخائر جاهزة (${weaponCountRow.c} قطعة سلاح)`);
    }

    // 14. إضافة عمود الملاحظات والأوقات بسجل العمليات الميدانية
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS operations_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_time TEXT,
        text TEXT NOT NULL,
        tag TEXT DEFAULT 'إشعار ميداني',
        created_by TEXT DEFAULT 'ضابط العمليات',
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      );
    `);

    // 15. ترحيل الأقسام والمراكز (إن كان الجدول فارغاً)
    const deptCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM departments');
    if (!deptCountRow || deptCountRow.c === 0) {
      let deptJsonPath = path.resolve(__dirname, '../data/departments_data.json');
      if (!fs.existsSync(deptJsonPath)) {
        deptJsonPath = path.resolve(__dirname, '../../../client/src/data/departments_data.json');
      }
      if (fs.existsSync(deptJsonPath)) {
        try {
          const depts = JSON.parse(fs.readFileSync(deptJsonPath, 'utf8'));
          if (Array.isArray(depts) && depts.length > 0) {
            await dbInstance.run('BEGIN TRANSACTION;');
            const dStmt = await dbInstance.prepare('INSERT INTO departments (id, department_name, head_name) VALUES (?, ?, ?)');
            for (const d of depts) {
              await dStmt.run([d.DepartmentID || null, d.DepartmentName || '', d.HeadName || 'غير محدد']);
            }
            await dStmt.finalize();
            await dbInstance.run('COMMIT;');
            console.log(`🏢 تم ترحيل ${depts.length} قسماً ومركزاً إلى SQLite.`);
          }
        } catch (err) {
          await dbInstance.run('ROLLBACK;').catch(() => {});
        }
      }
    }

    // 16. ترحيل بيانات الوقود والمحروقات (إن كان الجدول فارغاً)
    const fuelTankRow = await dbInstance.get('SELECT id FROM fuel_tanks WHERE id = 1');
    if (!fuelTankRow) {
      let fuelJsonPath = path.resolve(__dirname, '../data/fuel_data.json');
      if (!fs.existsSync(fuelJsonPath)) {
        fuelJsonPath = path.resolve(__dirname, '../../../client/src/data/fuel_data.json');
      }
      let fData = { main_balance: 0, sub_balance: 0, total_consumed: 0, shipments: [], transactions: [] };
      if (fs.existsSync(fuelJsonPath)) {
        try {
          fData = JSON.parse(fs.readFileSync(fuelJsonPath, 'utf8'));
        } catch (_) {}
      }
      await dbInstance.run('BEGIN TRANSACTION;');
      try {
        await dbInstance.run(
          'INSERT INTO fuel_tanks (id, main_balance, sub_balance, total_consumed) VALUES (1, ?, ?, ?)',
          [Number(fData.main_balance) || 0, Number(fData.sub_balance) || 0, Number(fData.total_consumed) || 0]
        );
        if (Array.isArray(fData.shipments)) {
          for (const s of fData.shipments) {
            await dbInstance.run(
              'INSERT INTO fuel_shipments (station, fuel_type, quantity, supplier, date) VALUES (?, ?, ?, ?, ?)',
              [s.station || 'المحطة الرئيسية', s.fuel_type || 'بنزين 95 ممتاز', Number(s.quantity) || 0, s.supplier || '', s.date || '']
            );
          }
        }
        if (Array.isArray(fData.transactions)) {
          for (const t of fData.transactions) {
            await dbInstance.run(
              'INSERT INTO fuel_transactions (voucher_no, station, plate_number, driver_name, vehicle_type, fuel_type, liters, odometer, date, is_external, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [t.voucher_no || '', t.station || 'المحطة الرئيسية', t.plate_number || '', t.driver_name || '', t.vehicle_type || '', t.fuel_type || 'بنزين', Number(t.liters) || 0, Number(t.odometer) || 0, t.date || '', t.is_external ? 1 : 0, t.notes || '']
            );
          }
        }
        await dbInstance.run('COMMIT;');
        console.log('⛽ تم ترحيل أرصدة وسجلات الوقود إلى SQLite بنجاح.');
      } catch (err) {
        await dbInstance.run('ROLLBACK;').catch(() => {});
      }
    }

    // 17. ترحيل مواقع ونقاط التفتيش لغرفة العمليات (إن كان الجدول فارغاً)
    const opsLocCountRow = await dbInstance.get('SELECT COUNT(*) as c FROM operations_locations');
    if (!opsLocCountRow || opsLocCountRow.c === 0) {
      const seedLocations = [
        { name: 'بوابة أوباري الشرقية (نقطة تفتيش رئيسية)', type: 'نقطة تفتيش', category: 'gate', lat: 26.5850, lng: 12.8250, icon: 'gate', status: 'تشديد وتدقيق أمني', color: '#dc2626', officers: 12, vehicles: 3, commander: 'نقيب / مصطفى سالم', phone: 'لاسلكي - قناة 2 (عمليات)', notes: 'المدخل الرئيسي للمدينة من جهة سبها' },
        { name: 'بوابة أوباري الغربية (مفرق جرمة وغات)', type: 'نقطة تفتيش', category: 'gate', lat: 26.5720, lng: 12.7280, icon: 'gate', status: 'تفتيش مستمر وتأمين', color: '#dc2626', officers: 10, vehicles: 2, commander: 'ملازم أول / عبدالسلام المهدي', phone: 'لاسلكي - قناة 2', notes: 'تأمين مدخل ومخرج أوباري نحو الغريفة وغات' },
        { name: 'بوابة الحطية الأمنية', type: 'نقطة تفتيش', category: 'gate', lat: 26.5910, lng: 12.8950, icon: 'gate', status: 'تمركز أمني نشط', color: '#dc2626', officers: 8, vehicles: 2, commander: 'مساعد ضابط / عثمان مسعود', phone: 'لاسلكي - قناة 4', notes: 'نقطة ارتكاز وتفتيش متقدمة' },
        { name: 'بوابة الفجيج (مدخل الوادي الشرقي)', type: 'نقطة تفتيش', category: 'gate', lat: 26.6850, lng: 13.8200, icon: 'gate', status: 'جاهزية واستيقاف', color: '#dc2626', officers: 14, vehicles: 4, commander: 'نقيب / أبوبكر الشريف', phone: 'لاسلكي - قناة 1', notes: 'البوابة الإستراتيجية لقطاع وادي الحياة' },
        { name: 'بوابة الأبيض الحدودية للقطاع', type: 'نقطة تفتيش', category: 'gate', lat: 26.7650, lng: 14.0100, icon: 'gate', status: 'مراقبة مشددة', color: '#dc2626', officers: 12, vehicles: 3, commander: 'ملازم / علي أحمد التارقي', phone: 'لاسلكي - قناة 1', notes: 'تأمين الحدود الإدارية مع قطاع سبها' },
        { name: 'بوابة الغريفة المركزية', type: 'نقطة تفتيش', category: 'gate', lat: 26.5350, lng: 13.0180, icon: 'gate', status: 'استقرار وتفتيش', color: '#dc2626', officers: 8, vehicles: 2, commander: 'رئيس عرفاء / محمد الهادي', phone: '071-523002', notes: 'مدخل بلدية الغريفة' },
        { name: 'بوابة جرمة الأثرية (المثلث الغربي)', type: 'نقطة تفتيش', category: 'gate', lat: 26.5290, lng: 13.0720, icon: 'gate', status: 'تأمين سياحي وحيوي', color: '#dc2626', officers: 8, vehicles: 2, commander: 'ملازم / بشير محمد', phone: 'لاسلكي - قناة 3', notes: 'تأمين محيط مدينة جرمة' },
        { name: 'بوابة سوق الخميس (تمركز أمني وسط أوباري)', type: 'نقطة تفتيش', category: 'gate', lat: 26.5880, lng: 12.7710, icon: 'gate', status: 'دورية متمركزة', color: '#2563eb', officers: 8, vehicles: 2, commander: 'مساعد ضابط / خليفة الصالحين', phone: 'لاسلكي - قناة 3', notes: 'تأمين المنطقة التجارية والمفترق الرئيسي' },
        { name: 'بوابة بنت بية الشمالية', type: 'نقطة تفتيش', category: 'gate', lat: 26.6520, lng: 13.6620, icon: 'gate', status: 'تفتيش وتدقيق', color: '#dc2626', officers: 10, vehicles: 2, commander: 'نقيب / مفتاح سالم', phone: '071-524110', notes: 'تأمين مدخل بلدية بنت بية' },
        { name: 'استيقاف مثلث قريقيرة الأمني', type: 'نقطة تفتيش', category: 'gate', lat: 26.5580, lng: 13.2200, icon: 'gate', status: 'استيقاف فجائي نشط', color: '#d97706', officers: 6, vehicles: 2, commander: 'دورية النجدة والإسناد', phone: 'لاسلكي - قناة 2', notes: 'استيقافات أمنية فجائية' },
        { name: 'بوابة الديسة / تين كاشف (المدخل الجنوبي)', type: 'نقطة تفتيش', category: 'gate', lat: 26.5400, lng: 12.7450, icon: 'gate', status: 'مراقبة المسارب الصحراوية', color: '#dc2626', officers: 8, vehicles: 3, commander: 'ملازم أول / حسن بركة', phone: 'لاسلكي - دوريات صحراوية', notes: 'تأمين المسارات الصحراوية الجنوبية' },
        { name: 'نقطة تفتيش مطار أوباري المدني', type: 'نقطة تفتيش', category: 'gate', lat: 26.5680, lng: 12.8120, icon: 'gate', status: 'حماية منشأة حيوية', color: '#1e3a8a', officers: 12, vehicles: 3, commander: 'رائد / طارق عبدالكريم', phone: '071-522105', notes: 'تأمين محيط مطار أوباري المدني' },
        { name: 'مديرية أمن أوباري (القيادة المركزية والسيطرة)', type: 'مركز قيادة', category: 'police', lat: 26.5896, lng: 12.7745, icon: 'hq', status: 'جاهزية تامة واستنفار', color: '#16a34a', officers: 48, vehicles: 12, commander: 'سيادة اللواء / موسى سعد البدين (مدير الأمن)', phone: '071-522101', notes: 'المقر العام للمديرية وغرفة العمليات المركزية' },
        { name: 'مركز شرطة أوباري المدينة', type: 'مركز شرطة', category: 'police', lat: 26.5950, lng: 12.7800, icon: 'police', status: 'دورية نشطة ومناوبة', color: '#2563eb', officers: 24, vehicles: 6, commander: 'عقيد / إدريس علي', phone: '071-522114', notes: 'استقبال البلاغات والدوريات داخل المدينة' },
        { name: 'قسم البحث الجنائي أوباري', type: 'مركز شرطة', category: 'police', lat: 26.5870, lng: 12.7760, icon: 'police', status: 'تحريات وتحقيقات مستمرة', color: '#2563eb', officers: 20, vehicles: 5, commander: 'مقدم / يوسف الطاهر', phone: '071-522120', notes: 'التحري وجمع الاستدلالات' },
        { name: 'وحدة النجدة والدوريات الصحراوية', type: 'مركز شرطة', category: 'police', lat: 26.5860, lng: 12.7810, icon: 'police', status: 'استجابة سريعة', color: '#2563eb', officers: 26, vehicles: 8, commander: 'رائد / خالد عمر', phone: '071-522133', notes: 'الدوريات المسلحة الجوالة' },
        { name: 'مركز شرطة الغريفة', type: 'مركز شرطة', category: 'police', lat: 26.6341, lng: 12.8711, icon: 'police', status: 'مستقر وجاهز', color: '#16a34a', officers: 18, vehicles: 4, commander: 'رائد / مصطفى عمران', phone: '071-523002', notes: 'نطاق بلدية الغريفة' },
        { name: 'مركز شرطة بنت بية', type: 'مركز شرطة', category: 'police', lat: 26.6500, lng: 13.0000, icon: 'police', status: 'استقرار أمني', color: '#16a34a', officers: 16, vehicles: 3, commander: 'مقدم / حسن سالم', phone: '071-524110', notes: 'نطاق بلدية بنت بية' },
        { name: 'قسم المرور والتراخيص أوباري', type: 'مركز شرطة', category: 'police', lat: 26.5910, lng: 12.7780, icon: 'police', status: 'تنظيم سير ودوريات مرورية', color: '#2563eb', officers: 15, vehicles: 4, commander: 'رائد / عبدالحميد محمد', phone: '071-522108', notes: 'مراقبة السلامة المرورية' },
        { name: 'محطة وقود المديرية المركزية (711)', type: 'محطة وقود', category: 'fuel', lat: 26.5877, lng: 12.7793, icon: 'fuel', status: 'مراقبة وتوزيع منتظم', color: '#d97706', officers: 4, vehicles: 1, commander: 'ملازم / بشير مصطفى', phone: '', notes: 'حصة 40,000 لتر' },
        { name: 'محطة وقود مشروع أوباري (713)', type: 'محطة وقود', category: 'fuel', lat: 26.5945, lng: 12.7259, icon: 'fuel', status: 'مراقبة وتأمين', color: '#d97706', officers: 4, vehicles: 1, commander: 'مساعد ضابط / عثمان علي', phone: '', notes: 'حصة 30,000 لتر' },
        { name: 'محطة وقود الغريفة الرئيسية', type: 'محطة وقود', category: 'fuel', lat: 26.5258, lng: 13.0121, icon: 'fuel', status: 'تزويد منتظم', color: '#16a34a', officers: 3, vehicles: 1, commander: 'قسم النجدة', phone: '', notes: 'حصة 25,000 لتر' },
        { name: 'محطة وقود جرمة التاريخية', type: 'محطة وقود', category: 'fuel', lat: 26.5261, lng: 13.0643, icon: 'fuel', status: 'مراقبة وتأمين', color: '#d97706', officers: 3, vehicles: 1, commander: 'دورية جرمة', phone: '', notes: 'حصة 20,000 لتر' },
        { name: 'محطة وقود قريقيرة', type: 'محطة وقود', category: 'fuel', lat: 26.5536, lng: 13.2148, icon: 'fuel', status: 'تزويد منتظم', color: '#16a34a', officers: 3, vehicles: 1, commander: 'مركز الغريفة', phone: '', notes: 'حصة 20,000 لتر' },
        { name: 'محطة وقود الرميلة', type: 'محطة وقود', category: 'fuel', lat: 26.5543, lng: 13.4173, icon: 'fuel', status: 'مراقبة', color: '#d97706', officers: 2, vehicles: 1, commander: 'دورية الإسناد', phone: '', notes: 'حصة 15,000 لتر' },
        { name: 'محطة وقود قبرعون', type: 'محطة وقود', category: 'fuel', lat: 26.5757, lng: 13.4314, icon: 'fuel', status: 'تزويد منتظم', color: '#16a34a', officers: 2, vehicles: 1, commander: 'مركز بنت بية', phone: '', notes: 'حصة 15,000 لتر' },
        { name: 'محطة وقود التناحمة', type: 'محطة وقود', category: 'fuel', lat: 26.6314, lng: 13.6369, icon: 'fuel', status: 'مراقبة', color: '#d97706', officers: 2, vehicles: 1, commander: 'مركز بنت بية', phone: '', notes: 'حصة 15,000 لتر' },
        { name: 'محطة وقود بنت بية', type: 'محطة وقود', category: 'fuel', lat: 26.6471, lng: 13.6581, icon: 'fuel', status: 'تزويد منتظم', color: '#16a34a', officers: 3, vehicles: 1, commander: 'مركز بنت بية', phone: '', notes: 'حصة 25,000 لتر' },
        { name: 'محطة وقود الأبيض', type: 'محطة وقود', category: 'fuel', lat: 26.7622, lng: 14.0057, icon: 'fuel', status: 'مراقبة تامة', color: '#d97706', officers: 3, vehicles: 1, commander: 'دورية الأبيض', phone: '', notes: 'حصة 20,000 لتر' }
      ];
      await dbInstance.run('BEGIN TRANSACTION;');
      try {
        const lStmt = await dbInstance.prepare(
          'INSERT INTO operations_locations (name, type, category, lat, lng, icon, status, color, officers, vehicles, commander, phone, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        for (const loc of seedLocations) {
          await lStmt.run([loc.name, loc.type, loc.category, loc.lat, loc.lng, loc.icon, loc.status, loc.color, loc.officers, loc.vehicles, loc.commander, loc.phone, loc.notes]);
        }
        await lStmt.finalize();
        await dbInstance.run('COMMIT;');
        console.log(`🛰️ تم ترحيل ${seedLocations.length} موقعاً ونقطة تفتيش لغرفة العمليات في SQLite.`);
      } catch (err) {
        await dbInstance.run('ROLLBACK;').catch(() => {});
      }
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
