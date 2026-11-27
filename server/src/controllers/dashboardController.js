import { getDb } from '../config/db.js';
import { sendServerError } from '../utils/controllerUtils.js';

/**
 * جلب الإحصائيات اللحظية المجمعة للوحة القيادة من كافة جداول SQLite
 */
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
    return sendServerError(res, error, 'Error computing dashboard live stats', 'تعذر جلب إحصائيات لوحة القيادة');
  }
}
