import { getDb } from '../config/db.js';

export async function getOperationsLocations(req, res) {
  try {
    const { db } = getDb();
    const rows = await db.all('SELECT * FROM operations_locations ORDER BY id ASC');
    const logs = await db.all('SELECT id, log_time AS time, text, tag, created_by, created_at FROM operations_logs ORDER BY id DESC LIMIT 100');
    return res.status(200).json({ success: true, count: rows.length, data: rows, logs });
  } catch (error) {
    console.error('Error fetching operations locations:', error);
    return res.status(500).json({ success: false, message: 'تعذر جلب مواقع العمليات والنقاط الميدانية' });
  }
}

export async function addOperationsLog(req, res) {
  try {
    const { text, tag = 'بلاغ عمليات' } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ success: false, message: 'نص البلاغ أو الإفادة الميدانية مطلوب' });
    }
    const { db } = getDb();
    const timeStr = new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
    const createdBy = (req.user && req.user.username) ? req.user.username : 'ضابط العمليات';

    const result = await db.run(
      'INSERT INTO operations_logs (log_time, text, tag, created_by) VALUES (?, ?, ?, ?)',
      [timeStr, String(text).trim(), tag, createdBy]
    );
    const created = await db.get(
      'SELECT id, log_time AS time, text, tag, created_by, created_at FROM operations_logs WHERE id = ?',
      [result.lastID]
    );
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating operations log:', error);
    return res.status(500).json({ success: false, message: 'تعذر تسجيل البلاغ الميداني' });
  }
}

export async function createOperationsLocation(req, res) {
  try {
    const { name, type = 'نقطة تفتيش', category = 'gate', lat, lng, icon = 'gate', status = 'تمركز أمني نشط', color = '#dc2626', officers = 0, vehicles = 0, commander = '', phone = '', notes = '' } = req.body;
    if (!name || !String(name).trim() || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'اسم الموقع والإحداثيات حقول إلزامية' });
    }
    const { db } = getDb();
    const result = await db.run(
      `INSERT INTO operations_locations (name, type, category, lat, lng, icon, status, color, officers, vehicles, commander, phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [String(name).trim(), type, category, Number(lat), Number(lng), icon, status, color, Number(officers) || 0, Number(vehicles) || 0, commander, phone, notes]
    );
    const created = await db.get('SELECT * FROM operations_locations WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error creating operations location:', error);
    return res.status(500).json({ success: false, message: 'تعذر إضافة الموقع الميداني' });
  }
}

export async function updateOperationsLocation(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, type, category, lat, lng, status, color, officers, vehicles, commander, phone, notes } = req.body;
    const { db } = getDb();
    const existing = await db.get('SELECT * FROM operations_locations WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'الموقع غير موجود' });
    }

    await db.run(
      `UPDATE operations_locations SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        lat = COALESCE(?, lat),
        lng = COALESCE(?, lng),
        status = COALESCE(?, status),
        color = COALESCE(?, color),
        officers = COALESCE(?, officers),
        vehicles = COALESCE(?, vehicles),
        commander = COALESCE(?, commander),
        phone = COALESCE(?, phone),
        notes = COALESCE(?, notes),
        updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [
        name, type, category,
        lat !== undefined ? Number(lat) : undefined,
        lng !== undefined ? Number(lng) : undefined,
        status, color,
        officers !== undefined ? Number(officers) : undefined,
        vehicles !== undefined ? Number(vehicles) : undefined,
        commander, phone, notes, id
      ]
    );

    const updated = await db.get('SELECT * FROM operations_locations WHERE id = ?', [id]);
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating operations location:', error);
    return res.status(500).json({ success: false, message: 'تعذر تحديث بيانات النقطة الميدانية' });
  }
}

export async function deleteOperationsLocation(req, res) {
  try {
    const id = Number(req.params.id);
    const { db } = getDb();
    const result = await db.run('DELETE FROM operations_locations WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'الموقع غير موجود' });
    }
    return res.status(200).json({ success: true, message: 'تم حذف الموقع الميداني بنجاح' });
  } catch (error) {
    console.error('Error deleting operations location:', error);
    return res.status(500).json({ success: false, message: 'تعذر حذف الموقع الميداني' });
  }
}

export async function getDashboardLiveStats(req, res) {
  try {
    const { db } = getDb();
    const [
      vehiclesTotal,
      vehiclesReady,
      activeLeaves,
      mailTotal,
      referredPending,
      penaltiesTotal,
      weaponsTotal,
      deptsTotal,
      deptsAssigned,
      opsLocations,
      fuelTank
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as c FROM vehicles'),
      db.get("SELECT COUNT(*) as c FROM vehicles WHERE status = 'جاهزة للعمل'"),
      db.get("SELECT COUNT(*) as c FROM leaves WHERE Status != 'باشر العمل'"),
      db.get('SELECT COUNT(*) as c FROM mail_records'),
      db.get("SELECT COUNT(*) as c FROM mail_records WHERE type = 'referred' AND status != 'تم التنفيذ'"),
      db.get('SELECT COUNT(*) as c FROM penalties'),
      db.get('SELECT COUNT(*) as c FROM weapons'),
      db.get('SELECT COUNT(*) as c FROM departments'),
      db.get("SELECT COUNT(*) as c FROM departments WHERE head_name IS NOT NULL AND head_name != '' AND head_name != 'غير محدد'"),
      db.get('SELECT COUNT(*) as c FROM operations_locations'),
      db.get('SELECT main_balance, sub_balance, total_consumed FROM fuel_tanks WHERE id = 1')
    ]);

    const totalVeh = vehiclesTotal?.c || 0;
    const readyVeh = vehiclesReady?.c || 0;

    return res.status(200).json({
      success: true,
      data: {
        vehiclesTotal: totalVeh,
        vehiclesReady: readyVeh,
        vehiclesReadinessPct: totalVeh > 0 ? ((readyVeh / totalVeh) * 100).toFixed(1) : '0.0',
        activeLeaves: activeLeaves?.c || 0,
        mailTotal: mailTotal?.c || 0,
        referredPending: referredPending?.c || 0,
        penaltiesTotal: penaltiesTotal?.c || 0,
        weaponsTotal: weaponsTotal?.c || 0,
        departmentsTotal: deptsTotal?.c || 0,
        departmentsAssigned: deptsAssigned?.c || 0,
        operationsLocations: opsLocations?.c || 0,
        fuelBalanceTotal: Number(fuelTank?.main_balance || 0) + Number(fuelTank?.sub_balance || 0)
      }
    });
  } catch (error) {
    console.error('Error computing dashboard live stats:', error);
    return res.status(500).json({ success: false, message: 'تعذر جلب إحصائيات لوحة القيادة' });
  }
}
