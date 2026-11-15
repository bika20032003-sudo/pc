import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { safeWriteJson } from '../utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadExcelData() {
  const rootDir = path.resolve(__dirname, '../../..');
  const files = fs.readdirSync(rootDir).filter(f => f.includes('2222') && f.endsWith('.xlsx'));
  
  if (files.length === 0) {
    console.warn('⚠️ لم يتم العثور على ملف إكسل قوة 2222 في المجلد الجذري');
    return [];
  }

  const filePath = path.join(rootDir, files[0]);
  console.log('📖 قراءة ملف إكسل:', files[0]);
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(sheet);

  console.log(`✅ تم قراءة ${rawRows.length} سجل من ملف إكسل`);

  const cleanRecords = rawRows.map((row, index) => {
    const rawJob = (row['الوظيفة'] || '').toString().trim();
    const isCivilian = rawJob === 'مدني';
    const type = isCivilian ? 'مدني' : 'شرطي';
    const employeeNum = (row['رقم الموظف'] || '').toString().trim();
    const nationalId = (row['الرقم الوطني'] || '').toString().trim();
    const accountNum = (row['رقم الحساب'] || '').toString().trim();
    const bankName = (row['اسم المصرف'] || '').toString().trim();
    const name = (row['الاسم'] || '').toString().trim();

    return {
      id: index + 1,
      type: type, // 'شرطي' أو 'مدني'
      name: name,
      job_number: employeeNum,
      national_id: nationalId,
      birth_date: nationalId.length === 12 ? (nationalId.startsWith('1') ? '19' : '20') + nationalId.substring(1, 3) + '-01-01' : '',
      birth_place: 'أوباري',
      mother_name: '',
      marital_status: 'متزوج',
      wife_name: '',
      children_count: '0',
      tribe_city: 'أوباري',
      residence: 'أوباري',
      phone: '',
      languages: 'العربية',
      education_level: isCivilian ? 'مؤهل مدني' : 'علوم شرطية وأمنية',
      // المستندات والعهد
      family_book: '',
      family_paper: '',
      family_record: '',
      passport_number: '',
      suit_number: isCivilian ? '-' : `MOI-${employeeNum.slice(-4)}`,
      shoe_size: '42',
      headwear_size: '58',
      shirt_size: 'L',
      blood_type: 'O+',
      diseases: 'سليم ولائق صحياً',
      height: '175',
      weight: '75',
      // الوظيفية والمالية
      department: isCivilian ? 'الشؤون الإدارية والمالية' : 'مديرية أمن أوباري',
      job_title: rawJob || (isCivilian ? 'موظف مدني' : 'شرطي'),
      job_status: 'على رأس العمل',
      start_date: '',
      appointment_decision: '',
      appointment_date: '',
      last_promotion_decision: '',
      last_promotion_date: '',
      financial_number: employeeNum,
      basic_salary: isCivilian ? '1950' : '2600',
      bank_name: bankName || 'مصرف الجمهورية',
      bank_branch: 'فرع أوباري',
      account_number: accountNum
    };
  });

  return cleanRecords;
}

// Write to json cache file only if real records exist to prevent wiping central data
try {
  const data = loadExcelData();
  const outputPath = path.resolve(__dirname, '../data/force_data.json');
  if (data && data.length > 0) {
    safeWriteJson(outputPath, data);
    console.log(`💾 تم حفظ بيانات ${data.length} منتسب بأمان في: ${outputPath}`);
  } else {
    console.log('🛡️ تم الحفاظ على ملف بيانات القوة العمومية الحالي دون أي تصفير (Data Preservation).');
  }
} catch (e) {
  console.error('Error in importForce.js:', e);
}
