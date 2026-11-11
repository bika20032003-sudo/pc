import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from '../config/db.js';
import { normalizeArabicText } from '../utils/arabicUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.resolve(__dirname, '../data/force_data.json');
let memoryForce = [];

try {
  if (fs.existsSync(jsonPath)) {
    memoryForce = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ تم تحميل ${memoryForce.length} سجل للقوة العمومية في ذاكرة المخدم`);
  }
} catch (e) {
  console.error('Error loading force json:', e);
}

export async function getForceList(req, res) {
  try {
    const { search, type, limit, page } = req.query;
    let list = [...memoryForce];

    if (type && (type === 'شرطي' || type === 'مدني')) {
      list = list.filter(item => item.type === type);
    }

    if (search && search.trim()) {
      const q = normalizeArabicText(search);
      list = list.filter(item =>
        normalizeArabicText(item.name).includes(q) ||
        normalizeArabicText(item.financial_number).includes(q) ||
        normalizeArabicText(item.national_id).includes(q) ||
        normalizeArabicText(item.job_title).includes(q) ||
        normalizeArabicText(item.department).includes(q) ||
        normalizeArabicText(item.bank_name).includes(q)
      );
    }

    const total = list.length;
    const policeCount = memoryForce.filter(m => m.type === 'شرطي').length;
    const civilCount = memoryForce.filter(m => m.type === 'مدني').length;

    let paginated = list;
    let currentPage = 1;
    let totalPages = 1;

    if (limit) {
      const parsedLimit = Math.max(1, parseInt(limit, 10));
      currentPage = Math.max(1, parseInt(page || '1', 10));
      totalPages = Math.ceil(total / parsedLimit) || 1;
      const offset = (currentPage - 1) * parsedLimit;
      paginated = list.slice(offset, offset + parsedLimit);
    }

    return res.json({
      success: true,
      total,
      policeCount,
      civilCount,
      page: limit ? currentPage : 1,
      totalPages: limit ? totalPages : 1,
      limit: limit ? parseInt(limit, 10) : total,
      data: paginated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createForceMember(req, res) {
  try {
    const newMember = {
      id: Date.now(),
      ...req.body
    };
    memoryForce.unshift(newMember);

    // Save to file
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(memoryForce, null, 2), 'utf8');
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: 'تم إضافة المنتسب بنجاح',
      data: newMember
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateForceMember(req, res) {
  try {
    const id = Number(req.params.id);
    const index = memoryForce.findIndex(m => m.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'السجل غير موجود' });
    }

    memoryForce[index] = {
      ...memoryForce[index],
      ...req.body,
      id
    };

    // Save to file
    try {
      fs.writeFileSync(jsonPath, JSON.stringify(memoryForce, null, 2), 'utf8');
    } catch (e) {}

    return res.json({
      success: true,
      message: 'تم تحديث بيانات المنتسب بنجاح',
      data: memoryForce[index]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteForceMember(req, res) {
  try {
    const id = Number(req.params.id);
    memoryForce = memoryForce.filter(m => m.id !== id);

    try {
      fs.writeFileSync(jsonPath, JSON.stringify(memoryForce, null, 2), 'utf8');
    } catch (e) {}

    return res.json({
      success: true,
      message: 'تم حذف القيد بنجاح'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function replaceForceList(req, res) {
  try {
    const { members } = req.body;
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'قائمة الأفراد غير صالحة أو فارغة' });
    }

    memoryForce = members.map((m, idx) => ({
      ...m,
      id: m.id || idx + 1
    }));

    try {
      fs.writeFileSync(jsonPath, JSON.stringify(memoryForce, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving force json:', e);
    }

    console.log(`✅ تم استبدال القوة العمومية بنجاح: ${memoryForce.length} عضو`);

    return res.json({
      success: true,
      message: `تم استبدال وتحديث القوة العمومية بنجاح (${memoryForce.length} فرد)`,
      total: memoryForce.length,
      data: memoryForce
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

