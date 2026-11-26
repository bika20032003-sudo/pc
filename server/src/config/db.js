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
        referredJsonPath = path.resolve(__dirname, '../../client/src/data/referred_mail_data.json');
      }
      if (fs.existsSync(referredJsonPath)) {
        try {
          const rawRef = fs.readFileSync(referredJsonPath, 'utf8');
          const refList = JSON.parse(rawRef);
          if (Array.isArray(refList)) {
            for (const r of refList) {
              await mStmt.run([
                'referred', '', String(r.MailID || ''), String(r.MailNumber || ''), '', '',
                r.TargetDept || '', '', 'ديوان المديرية', (r.ReferralDate || '').slice(0, 10), '', r.Subject || '',
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
