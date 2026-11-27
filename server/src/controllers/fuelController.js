import { getDb } from '../config/db.js';
import { safeWriteJson } from '../utils/fileUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FUEL_JSON_PATHS = [
  path.resolve(__dirname, '../data/fuel_data.json'),
  path.resolve(__dirname, '../../../client/src/data/fuel_data.json')
];

async function buildFuelSnapshot(db) {
  const tank = await db.get('SELECT * FROM fuel_tanks WHERE id = 1');
  const shipments = await db.all('SELECT * FROM fuel_shipments ORDER BY id DESC');
  const transactions = await db.all('SELECT * FROM fuel_transactions ORDER BY id DESC');
  return {
    main_balance: tank ? Number(tank.main_balance) : 0,
    sub_balance: tank ? Number(tank.sub_balance) : 0,
    total_consumed: tank ? Number(tank.total_consumed) : 0,
    shipments,
    transactions: transactions.map(t => ({ ...t, is_external: Boolean(t.is_external) }))
  };
}

async function syncFuelJson(db) {
  try {
    const snapshot = await buildFuelSnapshot(db);
    for (const p of FUEL_JSON_PATHS) {
      safeWriteJson(p, snapshot);
    }
  } catch (err) {
    console.warn('Sync fuel JSON error:', err.message);
  }
}

export async function getFuelState(req, res) {
  try {
    const { db } = getDb();
    const snapshot = await buildFuelSnapshot(db);
    return res.status(200).json({ success: true, data: snapshot });
  } catch (error) {
    console.error('Error fetching fuel state:', error);
    return res.status(500).json({ success: false, message: 'تعذر جلب بيانات الوقود والمحروقات' });
  }
}

export async function addFuelShipment(req, res) {
  const { db } = getDb();
  try {
    const { station = 'المحطة الرئيسية', fuel_type = 'بنزين 95 ممتاز', quantity, supplier, date } = req.body;
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كمية شحنة صحيحة باللتر' });
    }

    const col = station === 'المحطة الفرعية' ? 'sub_balance' : 'main_balance';
    const shipDate = date || new Date().toISOString().slice(0, 10);
    const cleanSupplier = supplier ? String(supplier).trim() : 'مستودع سبها النفطي';

    await db.run('BEGIN TRANSACTION;');
    const result = await db.run(
      'INSERT INTO fuel_shipments (station, fuel_type, quantity, supplier, date) VALUES (?, ?, ?, ?, ?)',
      [station, fuel_type, qty, cleanSupplier, shipDate]
    );
    await db.run(
      `UPDATE fuel_tanks SET ${col} = ${col} + ?, updated_at = datetime('now', 'localtime') WHERE id = 1`,
      [qty]
    );
    await db.run('COMMIT;');

    await syncFuelJson(db);
    const snapshot = await buildFuelSnapshot(db);
    const created = await db.get('SELECT * FROM fuel_shipments WHERE id = ?', [result.lastID]);
    return res.status(201).json({ success: true, shipment: created, data: snapshot });
  } catch (error) {
    await db.run('ROLLBACK;').catch(() => {});
    console.error('Error adding fuel shipment:', error);
    return res.status(500).json({ success: false, message: 'تعذر تسجيل الشحنة في قاعدة البيانات' });
  }
}

export async function dispenseFuel(req, res) {
  const { db } = getDb();
  try {
    const {
      station = 'المحطة الرئيسية',
      plate_number,
      driver_name,
      vehicle_type,
      fuel_type = 'بنزين',
      liters,
      odometer = 0,
      is_external = false,
      notes = ''
    } = req.body;

    const amount = Number(liters);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'يرجى تحديد كمية الوقود المنصرفة باللتر' });
    }

    await db.run('BEGIN TRANSACTION;');
    const tank = await db.get('SELECT * FROM fuel_tanks WHERE id = 1');
    const isSub = station === 'المحطة الفرعية';
    const available = isSub ? Number(tank?.sub_balance || 0) : Number(tank?.main_balance || 0);

    if (amount > available) {
      await db.run('ROLLBACK;');
      return res.status(400).json({
        success: false,
        message: `الرصيد المتاح في ${station} (${available.toLocaleString('ar-LY')} لتر) لا يكفي لصرف ${amount} لتر`
      });
    }

    const col = isSub ? 'sub_balance' : 'main_balance';
    const countRow = await db.get('SELECT COUNT(*) as c FROM fuel_transactions');
    const seq = (countRow?.c || 0) + 1;
    const voucherNo = `FUEL-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`;
    const txDate = new Date().toISOString();

    const result = await db.run(
      `INSERT INTO fuel_transactions (
        voucher_no, station, plate_number, driver_name, vehicle_type,
        fuel_type, liters, odometer, date, is_external, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        voucherNo,
        station,
        plate_number ? String(plate_number).trim() : 'بدون لوحة',
        driver_name ? String(driver_name).trim() : 'سائق الدورية',
        vehicle_type ? String(vehicle_type).trim() : 'مركبة أمنية',
        fuel_type,
        amount,
        Number(odometer) || 0,
        txDate,
        is_external ? 1 : 0,
        notes || ''
      ]
    );

    await db.run(
      `UPDATE fuel_tanks SET ${col} = ${col} - ?, total_consumed = total_consumed + ?, updated_at = datetime('now', 'localtime') WHERE id = 1`,
      [amount, amount]
    );
    await db.run('COMMIT;');

    await syncFuelJson(db);
    const snapshot = await buildFuelSnapshot(db);
    const created = await db.get('SELECT * FROM fuel_transactions WHERE id = ?', [result.lastID]);
    return res.status(201).json({
      success: true,
      transaction: { ...created, is_external: Boolean(created?.is_external) },
      data: snapshot
    });
  } catch (error) {
    await db.run('ROLLBACK;').catch(() => {});
    console.error('Error dispensing fuel:', error);
    return res.status(500).json({ success: false, message: 'تعذر تسجيل عملية صرف الوقود' });
  }
}
