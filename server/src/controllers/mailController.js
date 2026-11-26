import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';

/**
 * جلب سجلات البريد والمراسلات مع دعم التصفية والبحث الذكي
 */
export async function getMail(req, res) {
  try {
    const { type, search, status } = req.query;
    const { db } = getDb();

    let query = 'SELECT * FROM mail_records WHERE 1=1';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';

    const rows = await db.all(query, params);

    // تصفية البحث باللغة العربية الموحدة
    let filtered = rows;
    if (search && search.trim()) {
      const q = normalizeArabicText(search);
      filtered = rows.filter(r => {
        const normSubject = normalizeArabicText(r.subject || '');
        const normRecipient = normalizeArabicText(r.recipient || '');
        const normSource = normalizeArabicText(r.source_entity || '');
        const normRef = normalizeArabicText(r.reference || '');
        const normCode = normalizeArabicText(r.code_no || '');
        const normRecord = normalizeArabicText(r.record_number || '');
        const normBody = normalizeArabicText(r.letter_body || '');
        const normSender = normalizeArabicText(r.sender_employee || '');
        const normReceiver = normalizeArabicText(r.receiver_employee || '');
        const normDept = normalizeArabicText(r.target_dept || '');

        return (
          normSubject.includes(q) ||
          normRecipient.includes(q) ||
          normSource.includes(q) ||
          normRef.includes(q) ||
          normCode.includes(q) ||
          normRecord.includes(q) ||
          normBody.includes(q) ||
          normSender.includes(q) ||
          normReceiver.includes(q) ||
          normDept.includes(q)
        );
      });
    }

    // تفكيك قائمة النسخ cc_list إن كانت مخزنة كسلسلة JSON
    const parsedRows = filtered.map(item => {
      let cc = [];
      if (item.cc_list) {
        try {
          cc = typeof item.cc_list === 'string' ? JSON.parse(item.cc_list) : item.cc_list;
        } catch (e) {
          cc = [];
        }
      }
      return {
        ...item,
        cc_list: Array.isArray(cc) ? cc : []
      };
    });

    return res.status(200).json({
      success: true,
      count: parsedRows.length,
      mail: parsedRows
    });
  } catch (error) {
    console.error('Error in getMail:', error);
    return res.status(500).json({
      success: false,
      message: 'تعذر جلب سجلات البريد: ' + error.message
    });
  }
}

/**
 * جلب معاملة بريدية واحدة بالمعرف
 */
export async function getMailById(req, res) {
  try {
    const { id } = req.params;
    const { db } = getDb();

    const row = await db.get('SELECT * FROM mail_records WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({
        success: false,
        message: 'المعاملة البريدية المطلوبة غير موجودة'
      });
    }

    let cc = [];
    if (row.cc_list) {
      try {
        cc = typeof row.cc_list === 'string' ? JSON.parse(row.cc_list) : row.cc_list;
      } catch (e) {
        cc = [];
      }
    }

    return res.status(200).json({
      success: true,
      mail: {
        ...row,
        cc_list: Array.isArray(cc) ? cc : []
      }
    });
  } catch (error) {
    console.error('Error in getMailById:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * إضافة معاملة بريدية جديدة (صادر / وارد / محال / خطاب رسمي)
 */
export async function createMail(req, res) {
  try {
    const {
      type = 'outgoing',
      code_no,
      record_number,
      reference,
      reply_to_reference,
      reply_date,
      recipient,
      recipient_title,
      source_entity,
      date,
      time,
      subject,
      delivery_method,
      sender_employee,
      editor_employee,
      receiver_employee,
      print_employee,
      status = 'delivered',
      attachment_name,
      attachment_data,
      letter_body,
      cc_list,
      signer_name = 'لواء / موسى سعد محمد البدين',
      signer_title = 'مدير مديرية أمن أوباري',
      phone,
      email,
      template_type,
      force_member_id,
      director_notes,
      target_dept,
      notes
    } = req.body;

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: 'موضوع المعاملة إلزامي ولا يمكن تركه فارغاً'
      });
    }

    const { db } = getDb();

    // احتساب رقم القيد التلقائي والكود إذا لم يتم تزويدهما
    const maxRow = await db.get('SELECT MAX(id) as maxId, COUNT(*) as total FROM mail_records WHERE type = ?', [type]);
    const nextNum = (maxRow?.total || 0) + 1;
    const currentYear = new Date().getFullYear();

    const computedCode = code_no || `${currentYear}-${String(nextNum).padStart(3, '0')}`;
    const computedRecord = record_number || String(nextNum);
    const computedRef = reference || `${nextNum}/${currentYear}`;
    const computedDate = date || new Date().toLocaleDateString('en-GB');

    const serializedCc = Array.isArray(cc_list) ? JSON.stringify(cc_list) : (cc_list || '[]');

    const result = await db.run(`
      INSERT INTO mail_records (
        type, code_no, record_number, reference, reply_to_reference, reply_date,
        recipient, recipient_title, source_entity, date, time, subject,
        delivery_method, sender_employee, editor_employee, receiver_employee,
        print_employee, status, attachment_name, attachment_data, letter_body,
        cc_list, signer_name, signer_title, phone, email, template_type,
        force_member_id, director_notes, target_dept, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `, [
      type,
      computedCode,
      computedRecord,
      computedRef,
      reply_to_reference || '',
      reply_date || '',
      recipient || '',
      recipient_title || '',
      source_entity || '',
      computedDate,
      time || new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      subject.trim(),
      delivery_method || 'إلكتروني (منظومة/إيميل)',
      sender_employee || 'عبدالصمد',
      editor_employee || 'عبدالصمد',
      receiver_employee || '',
      print_employee || 'عبدالصمد',
      status,
      attachment_name || '',
      attachment_data || '',
      letter_body || '',
      serializedCc,
      signer_name,
      signer_title,
      phone || '0921250071',
      email || 'moderytamnobari@gmail.com',
      template_type || '',
      force_member_id ? Number(force_member_id) : null,
      director_notes || '',
      target_dept || '',
      notes || ''
    ]);

    const newId = result.lastID;
    const inserted = await db.get('SELECT * FROM mail_records WHERE id = ?', [newId]);

    // تسجيل العملية في سجل التدقيق الأمني
    try {
      await db.run(
        'INSERT INTO audit_logs (username, action, details) VALUES (?, ?, ?)',
        [editor_employee || 'admin', `إضافة بريد (${type})`, `تم إنشاء قيد بريد جديد برقم ${computedRef} - موضوع: ${subject.slice(0, 50)}`]
      );
    } catch (e) {}

    let cc = [];
    if (inserted?.cc_list) {
      try { cc = JSON.parse(inserted.cc_list); } catch (e) {}
    }

    return res.status(201).json({
      success: true,
      message: 'تم حفظ وقيد المعاملة بنجاح في قاعدة البيانات',
      mail: {
        ...inserted,
        cc_list: Array.isArray(cc) ? cc : []
      }
    });
  } catch (error) {
    console.error('Error in createMail:', error);
    return res.status(500).json({
      success: false,
      message: 'تعذر حفظ المعاملة: ' + error.message
    });
  }
}

/**
 * تحديث معاملة بريدية قائمة
 */
export async function updateMail(req, res) {
  try {
    const { id } = req.params;
    const {
      code_no,
      record_number,
      reference,
      reply_to_reference,
      reply_date,
      recipient,
      recipient_title,
      source_entity,
      date,
      time,
      subject,
      delivery_method,
      sender_employee,
      editor_employee,
      receiver_employee,
      print_employee,
      status,
      attachment_name,
      attachment_data,
      letter_body,
      cc_list,
      signer_name,
      signer_title,
      phone,
      email,
      template_type,
      director_notes,
      target_dept,
      notes
    } = req.body;

    const { db } = getDb();
    const existing = await db.get('SELECT * FROM mail_records WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'المعاملة البريدية المراد تعديلها غير موجودة'
      });
    }

    const serializedCc = cc_list !== undefined
      ? (Array.isArray(cc_list) ? JSON.stringify(cc_list) : cc_list)
      : existing.cc_list;

    await db.run(`
      UPDATE mail_records SET
        code_no = COALESCE(?, code_no),
        record_number = COALESCE(?, record_number),
        reference = COALESCE(?, reference),
        reply_to_reference = COALESCE(?, reply_to_reference),
        reply_date = COALESCE(?, reply_date),
        recipient = COALESCE(?, recipient),
        recipient_title = COALESCE(?, recipient_title),
        source_entity = COALESCE(?, source_entity),
        date = COALESCE(?, date),
        time = COALESCE(?, time),
        subject = COALESCE(?, subject),
        delivery_method = COALESCE(?, delivery_method),
        sender_employee = COALESCE(?, sender_employee),
        editor_employee = COALESCE(?, editor_employee),
        receiver_employee = COALESCE(?, receiver_employee),
        print_employee = COALESCE(?, print_employee),
        status = COALESCE(?, status),
        attachment_name = COALESCE(?, attachment_name),
        attachment_data = COALESCE(?, attachment_data),
        letter_body = COALESCE(?, letter_body),
        cc_list = ?,
        signer_name = COALESCE(?, signer_name),
        signer_title = COALESCE(?, signer_title),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        template_type = COALESCE(?, template_type),
        director_notes = COALESCE(?, director_notes),
        target_dept = COALESCE(?, target_dept),
        notes = COALESCE(?, notes),
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `, [
      code_no,
      record_number,
      reference,
      reply_to_reference,
      reply_date,
      recipient,
      recipient_title,
      source_entity,
      date,
      time,
      subject ? subject.trim() : null,
      delivery_method,
      sender_employee,
      editor_employee,
      receiver_employee,
      print_employee,
      status,
      attachment_name,
      attachment_data,
      letter_body,
      serializedCc,
      signer_name,
      signer_title,
      phone,
      email,
      template_type,
      director_notes,
      target_dept,
      notes,
      id
    ]);

    const updated = await db.get('SELECT * FROM mail_records WHERE id = ?', [id]);

    // تسجيل في سجل الرقابة
    try {
      await db.run(
        'INSERT INTO audit_logs (username, action, details) VALUES (?, ?, ?)',
        [editor_employee || 'admin', `تحديث بريد (${existing.type})`, `تم تحديث قيد المعاملة رقم ${id} - ${updated.subject}`]
      );
    } catch (e) {}

    let cc = [];
    if (updated?.cc_list) {
      try { cc = JSON.parse(updated.cc_list); } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'تم تحديث بيانات المعاملة بنجاح',
      mail: {
        ...updated,
        cc_list: Array.isArray(cc) ? cc : []
      }
    });
  } catch (error) {
    console.error('Error in updateMail:', error);
    return res.status(500).json({
      success: false,
      message: 'تعذر تحديث المعاملة: ' + error.message
    });
  }
}

/**
 * حذف معاملة بريدية نهائياً
 */
export async function deleteMail(req, res) {
  try {
    const { id } = req.params;
    const { db } = getDb();

    const existing = await db.get('SELECT * FROM mail_records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'المعاملة البريدية غير موجودة أو تم حذفها مسبقاً'
      });
    }

    await db.run('DELETE FROM mail_records WHERE id = ?', [id]);

    // تسجيل عملية الحذف في سجل التدقيق الأمني
    try {
      await db.run(
        'INSERT INTO audit_logs (username, action, details) VALUES (?, ?, ?)',
        ['admin', `حذف بريد (${existing.type})`, `تم حذف القيد رقم ${id} - الموضوع: ${existing.subject}`]
      );
    } catch (e) {}

    return res.status(200).json({
      success: true,
      message: 'تم حذف القيد البريدي بنجاح من قاعدة البيانات المركزية'
    });
  } catch (error) {
    console.error('Error in deleteMail:', error);
    return res.status(500).json({
      success: false,
      message: 'تعذر حذف المعاملة: ' + error.message
    });
  }
}

/**
 * إحصائيات المعاملات البريدية
 */
export async function getMailStats(req, res) {
  try {
    const { db } = getDb();

    const [totalRow, outgoingRow, incomingRow, referredRow, lettersRow, deliveredRow, inProgressRow] = await Promise.all([
      db.get('SELECT COUNT(*) as c FROM mail_records'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE type = "outgoing"'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE type = "incoming"'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE type = "referred"'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE type = "official_letter"'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE status = "delivered"'),
      db.get('SELECT COUNT(*) as c FROM mail_records WHERE status IN ("in_progress", "تحت الإجراء")')
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total: totalRow?.c || 0,
        outgoing: outgoingRow?.c || 0,
        incoming: incomingRow?.c || 0,
        referred: referredRow?.c || 0,
        letters: lettersRow?.c || 0,
        delivered: deliveredRow?.c || 0,
        in_progress: inProgressRow?.c || 0
      }
    });
  } catch (error) {
    console.error('Error in getMailStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}
