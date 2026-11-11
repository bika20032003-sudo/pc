import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeArabicText } from '../utils/arabicUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../data/vehicles_data.json');
let memoryVehicles = [];

try {
  if (fs.existsSync(jsonPath)) {
    memoryVehicles = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ تم تحميل ${memoryVehicles.length} آلية ومركبة في ذاكرة المخدم`);
  }
} catch (e) {
  console.error('Error loading vehicles json:', e);
}

function persistVehicles() {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(memoryVehicles, null, 2), 'utf8');
    // Also sync to client if exists
    const clientPath = path.resolve(__dirname, '../../../client/src/data/vehicles_data.json');
    if (fs.existsSync(path.dirname(clientPath))) {
      fs.writeFileSync(clientPath, JSON.stringify(memoryVehicles, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Failed to persist vehicles:', e);
  }
}

export async function getVehicleList(req, res) {
  try {
    const { search, category, status, department, limit, page } = req.query;
    let list = [...memoryVehicles];

    if (category && category !== 'الكل') {
      list = list.filter(item => item.category === category);
    }

    if (status && status !== 'الكل') {
      list = list.filter(item => item.status === status);
    }

    if (department && department !== 'الكل') {
      list = list.filter(item => item.department === department);
    }

    if (search && search.trim()) {
      const q = normalizeArabicText(search);
      list = list.filter(item =>
        normalizeArabicText(item.plate_number).includes(q) ||
        normalizeArabicText(item.chassis_number).includes(q) ||
        normalizeArabicText(item.vehicle_type).includes(q) ||
        normalizeArabicText(item.custodian_name).includes(q) ||
        normalizeArabicText(item.department).includes(q) ||
        normalizeArabicText(item.notes).includes(q)
      );
    }

    const total = memoryVehicles.length;
    const activeCount = memoryVehicles.filter(v => v.status === 'جاهزة للعمل').length;
    const custodyCount = memoryVehicles.filter(v => v.category === 'سيارة عهدة شخصية').length;
    const departmentCount = memoryVehicles.filter(v => v.category === 'سيارة مراكز وأقسام').length;
    const motorcycleCount = memoryVehicles.filter(v => v.category === 'دراجة نارية شرطية').length;
    const outOfServiceCount = memoryVehicles.filter(v => v.status !== 'جاهزة للعمل').length;

    let paginated = list;
    let currentPage = 1;
    let totalPages = 1;

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      currentPage = Math.max(1, parseInt(page || '1', 10));
      totalPages = Math.ceil(list.length / parsedLimit) || 1;
      const offset = (currentPage - 1) * parsedLimit;
      paginated = list.slice(offset, offset + parsedLimit);
    }

    return res.json({
      success: true,
      total,
      filteredTotal: list.length,
      page: limit ? currentPage : 1,
      totalPages: limit ? totalPages : 1,
      limit: limit ? parseInt(limit, 10) : list.length,
      stats: {
        total,
        activeCount,
        custodyCount,
        departmentCount,
        motorcycleCount,
        outOfServiceCount
      },
      data: paginated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createVehicle(req, res) {
  try {
    const newVehicle = {
      id: Date.now(),
      record_no: memoryVehicles.length + 1,
      created_at: new Date().toISOString(),
      status: 'جاهزة للعمل',
      fuel_type: 'بنزين',
      ...req.body
    };

    memoryVehicles.unshift(newVehicle);
    persistVehicles();

    return res.status(201).json({
      success: true,
      message: 'تم إضافة الآلية إلى المنظومة بنجاح',
      data: newVehicle
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const index = memoryVehicles.findIndex(v => v.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'الآلية غير موجودة' });
    }

    memoryVehicles[index] = {
      ...memoryVehicles[index],
      ...req.body,
      id,
      updated_at: new Date().toISOString()
    };

    persistVehicles();

    return res.json({
      success: true,
      message: 'تم تحديث بيانات الآلية بنجاح',
      data: memoryVehicles[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const index = memoryVehicles.findIndex(v => v.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'الآلية غير موجودة' });
    }

    const deleted = memoryVehicles.splice(index, 1)[0];
    persistVehicles();

    return res.json({
      success: true,
      message: 'تم حذف الآلية من السجل بنجاح',
      data: deleted
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function replaceVehicleList(req, res) {
  try {
    const { vehicles } = req.body;
    if (!Array.isArray(vehicles)) {
      return res.status(400).json({ success: false, message: 'بيانات غير صالحة' });
    }

    memoryVehicles = vehicles;
    persistVehicles();

    return res.json({
      success: true,
      message: 'تم استبدال وحفظ سجل الآليات بنجاح',
      count: memoryVehicles.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

