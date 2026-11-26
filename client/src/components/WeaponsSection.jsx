import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Printer,
  FileSpreadsheet,
  UploadCloud,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Calendar,
  X,
  FileText,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Save,
  Check
} from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { normalizeArabicText } from '../utils/arabicUtils';
import initialWeaponsData from '../data/weapons_data.json';
import { apiFetch } from '../utils/apiClient';

const API_BASE_URL = '/api/weapons';

const EMPTY_WEAPON_FORM = {
  weapon_type: 'بندقية كلاشن كوف',
  weapon_number: '',
  caliber: '7.62x39 ملم',
  ammo_count: 20,
  magazines_count: 1,
  receiving_entity: 'مركز شرطة أوباري المدينة',
  receiver_name: '',
  status: 'صالح للعمل ومصروف',
  issue_date: new Date().toISOString().split('T')[0],
  notes: 'عهدة رسمية مقيدة بسجلات مديرية أمن أوباري'
};

const WEAPON_TYPES = [
  { label: 'بندقية كلاشن كوف', caliber: '7.62x39 ملم', defaultAmmo: 20, defaultMags: 1 },
  { label: 'مسدس عيار (9) ملي', caliber: '9x19 ملم', defaultAmmo: 10, defaultMags: 1 },
  { label: 'مسدس طارق عيار 9 ملم', caliber: '9x19 ملم', defaultAmmo: 10, defaultMags: 1 },
  { label: 'بندقية قنص عسكرية', caliber: '7.62x54 ملم', defaultAmmo: 10, defaultMags: 1 },
  { label: 'رشاش متوسط (بيكتسي)', caliber: '7.62x54 ملم', defaultAmmo: 100, defaultMags: 2 },
  { label: 'بندقية إف إن (FN-FAL)', caliber: '7.62x51 ملم', defaultAmmo: 20, defaultMags: 1 },
  { label: 'بندقية خرطوش / شوزن', caliber: '12 Gauge', defaultAmmo: 12, defaultMags: 0 },
  { label: 'سلاح ناري آخر / خاص', caliber: 'متنوع', defaultAmmo: 0, defaultMags: 1 }
];

const KNOWN_ENTITIES = [
  'مركز شرطة أوباري المدينة',
  'مركز شرطة الغريفة',
  'مركز شرطة بنت بية',
  'مركز شرطة جرمة',
  'مركز شرطة الفجيج',
  'مركز شرطة قراقرة',
  'مركز شرطة المشروع',
  'مركز شرطة الحطية',
  'قسم البحث الجنائي',
  'قسم المرور والتراخيص أوباري',
  'قسم شرطة النجدة أوباري',
  'قسم الأهداف الحيوية',
  'ديوان مديرية أمن أوباري',
  'مخزن السلاح والذخائر المركزي',
  'أخرى (عهدة شخصية للضباط)'
];

export default function WeaponsSection({ user, forceMembers = [] }) {
  // Local state with localStorage persistence and initial data fallback
  const [weapons, setWeapons] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_weapons_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialWeaponsData || [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('الكل');
  const [selectedEntity, setSelectedEntity] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_WEAPON_FORM);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Modals state
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [receiptModalWeapon, setReceiptModalWeapon] = useState(null);
  const [viewDetailsWeapon, setViewDetailsWeapon] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Auto-complete receiver suggestions from forceMembers (قوة 2222)
  const [receiverSearchQuery, setReceiverSearchQuery] = useState('');
  const [showReceiverSuggestions, setShowReceiverSuggestions] = useState(false);

  // Show notification toast
  const showToast = (msg, type = 'success') => {
    setNotificationMsg(msg);
    setNotificationType(type);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Sync with Backend API if available
  useEffect(() => {
    let isMounted = true;
    async function fetchFromBackend() {
      try {
        const res = await apiFetch(API_BASE_URL);
        if (res.ok) {
          const result = await res.json();
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            if (isMounted) {
              setWeapons(result.data);
              try {
                localStorage.setItem('ubari_weapons_data', JSON.stringify(result.data));
              } catch (e) {}
            }
          }
        }
      } catch (err) {
        // Backend offline or unreachable, local data is already active
      }
    }
    fetchFromBackend();
    return () => { isMounted = false; };
  }, []);

  // Save to localStorage whenever weapons change
  const saveWeaponsState = (newList) => {
    setWeapons(newList);
    try {
      localStorage.setItem('ubari_weapons_data', JSON.stringify(newList));
    } catch (e) {}
  };

  // Helper date functions
  const getArabicDayName = (date = new Date()) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  };

  const getArabicDateString = (date = new Date()) => {
    const day = date.getDate();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}م`;
  };

  // Receiver auto-complete filtering
  const receiverSuggestions = useMemo(() => {
    if (!receiverSearchQuery || receiverSearchQuery.trim().length < 2) return [];
    const q = normalizeArabicText(receiverSearchQuery.trim());
    return forceMembers
      .filter(m => {
        const nameNorm = normalizeArabicText(m.name || '');
        const num = String(m.financial_number || m.job_number || '');
        return nameNorm.includes(q) || num.includes(q);
      })
      .slice(0, 8);
  }, [forceMembers, receiverSearchQuery]);

  // Overall Statistics Calculation
  const stats = useMemo(() => {
    let pistols = 0;
    let rifles = 0;
    let totalAmmo = 0;
    let totalMags = 0;
    const entitiesSet = new Set();

    weapons.forEach(w => {
      const type = (w.weapon_type || w.WeaponType || '').toLowerCase();
      if (type.includes('مسدس')) pistols++;
      else rifles++;

      totalAmmo += Number(w.ammo_count || w.AmmoCount) || 0;
      totalMags += Number(w.magazines_count || w.MagazinesCount) || 0;

      const ent = (w.receiving_entity || w.ReceivingEntity || '').trim();
      if (ent) entitiesSet.add(ent);
    });

    return {
      total: weapons.length,
      pistols,
      rifles,
      totalAmmo,
      totalMags,
      uniqueEntities: entitiesSet.size
    };
  }, [weapons]);

  // Filtered List
  const filteredWeapons = useMemo(() => {
    return weapons.filter(w => {
      const wType = w.weapon_type || w.WeaponType || '';
      const wNum = String(w.weapon_number || w.WeaponNumber || w.serial_number || '');
      const wEnt = w.receiving_entity || w.ReceivingEntity || '';
      const wRec = w.receiver_name || w.ReceiverName || '';
      const wStatus = w.status || 'صالح للعمل ومصروف';
      const wNotes = w.notes || '';

      // Type Filter
      if (selectedType !== 'الكل') {
        if (!wType.includes(selectedType)) return false;
      }

      // Entity Filter
      if (selectedEntity !== 'الكل') {
        if (!wEnt.includes(selectedEntity) && !wRec.includes(selectedEntity)) return false;
      }

      // Status Filter
      if (selectedStatus !== 'الكل') {
        if (wStatus !== selectedStatus) return false;
      }

      // Search Query
      if (searchTerm && searchTerm.trim()) {
        const q = normalizeArabicText(searchTerm.trim());
        const target = normalizeArabicText(`${wType} ${wNum} ${wEnt} ${wRec} ${wNotes}`);
        if (!target.includes(q)) return false;
      }

      return true;
    });
  }, [weapons, selectedType, selectedEntity, selectedStatus, searchTerm]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredWeapons.length / itemsPerPage) || 1;
  const paginatedWeapons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWeapons.slice(start, start + itemsPerPage);
  }, [filteredWeapons, currentPage, itemsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedEntity, selectedStatus]);

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto update caliber and default ammo if weapon type changes
      if (field === 'weapon_type') {
        const found = WEAPON_TYPES.find(t => t.label === value);
        if (found) {
          updated.caliber = found.caliber;
          if (!updated.ammo_count || updated.ammo_count === 0 || updated.ammo_count === 20 || updated.ammo_count === 10) {
            updated.ammo_count = found.defaultAmmo;
            updated.magazines_count = found.defaultMags;
          }
        }
      }
      return updated;
    });
  };

  // Open Form to Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_WEAPON_FORM);
    setReceiverSearchQuery('');
    setShowForm(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Open Form to Edit
  const handleOpenEdit = (w) => {
    setEditingId(w.id || w.WeaponID);
    setFormData({
      weapon_type: w.weapon_type || w.WeaponType || 'بندقية كلاشن كوف',
      weapon_number: w.weapon_number || w.WeaponNumber || w.serial_number || '',
      caliber: w.caliber || (String(w.weapon_type || w.WeaponType).includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم'),
      ammo_count: Number(w.ammo_count || w.AmmoCount) || 0,
      magazines_count: Number(w.magazines_count || w.MagazinesCount) || 0,
      receiving_entity: w.receiving_entity || w.ReceivingEntity || '',
      receiver_name: w.receiver_name || w.ReceiverName || '',
      status: w.status || 'صالح للعمل ومصروف',
      issue_date: w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : new Date().toISOString().split('T')[0]),
      notes: w.notes || ''
    });
    setReceiverSearchQuery(w.receiver_name || w.ReceiverName || '');
    setShowForm(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Save Weapon (Add or Edit)
  const handleSaveWeapon = async (e) => {
    e.preventDefault();

    if (!formData.weapon_type || !formData.weapon_number.trim()) {
      showToast('يرجى تحديد نوع السلاح وإدخال الرقم التسلسلي', 'error');
      return;
    }

    const trimmedNumber = formData.weapon_number.trim();

    // Check duplicate serial number (except for current item being edited)
    const duplicate = weapons.find(w => {
      const currId = w.id || w.WeaponID;
      const num = String(w.weapon_number || w.WeaponNumber || w.serial_number || '').trim();
      return num === trimmedNumber && currId !== editingId;
    });

    if (duplicate) {
      showToast(`رقم السلاح (${trimmedNumber}) مقيد ومصروف مسبقاً في السجلات!`, 'error');
      return;
    }

    setIsLoading(true);

    const payload = {
      ...formData,
      weapon_number: trimmedNumber,
      serial_number: trimmedNumber,
      WeaponNumber: trimmedNumber,
      WeaponType: formData.weapon_type,
      AmmoCount: Number(formData.ammo_count) || 0,
      MagazinesCount: Number(formData.magazines_count) || 0,
      ReceivingEntity: formData.receiving_entity,
      ReceiverName: formData.receiver_name,
      IssueDate: formData.issue_date
    };

    try {
      if (editingId) {
        // Try backend update
        apiFetch(`${API_BASE_URL}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        }).catch(() => {});

        // Local state update
        const updatedList = weapons.map(w => {
          if ((w.id || w.WeaponID) === editingId) {
            return { ...w, ...payload };
          }
          return w;
        });
        saveWeaponsState(updatedList);
        showToast('تم تحديث بيانات عهدة السلاح بنجاح 🔄');
      } else {
        // Try backend create
        apiFetch(API_BASE_URL, {
          method: 'POST',
          body: JSON.stringify(payload)
        }).catch(() => {});

        // Local state create
        const newId = Math.max(...weapons.map(w => Number(w.id || w.WeaponID) || 0), 0) + 1;
        const newRecord = {
          id: newId,
          WeaponID: newId,
          ...payload
        };
        const updatedList = [newRecord, ...weapons];
        saveWeaponsState(updatedList);
        showToast('تم تسجيل وصرف عهدة السلاح بنجاح 🔫');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(EMPTY_WEAPON_FORM);
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ السلاح', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Weapon
  const handleDeleteWeapon = (w) => {
    const id = w.id || w.WeaponID;
    const num = w.weapon_number || w.WeaponNumber || '';
    if (!window.confirm(`تحذير رسمي:\nهل أنت متأكد من مسح وإسقاط السلاح رقم (${num}) من سجلات العهدة؟`)) {
      return;
    }

    apiFetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' }).catch(() => {});
    const updated = weapons.filter(item => (item.id || item.WeaponID) !== id);
    saveWeaponsState(updated);
    showToast(`تم مسح السلاح رقم (${num}) من السجلات بنجاح 🗑️`);
  };

  // Export to Excel / CSV with Arabic UTF-8 BOM
  const handleExportExcel = () => {
    try {
      const headers = [
        'ت',
        'نوع السلاح',
        'الرقم التسلسلي',
        'العيار',
        'الذخيرة (طلقة)',
        'عدد المخازن',
        'الجهة المستلمة',
        'المستلم الفعلي (عهدة شخصية)',
        'تاريخ الصرف',
        'الحالة',
        'ملاحظات'
      ];

      const rows = filteredWeapons.map((w, idx) => [
        `"${idx + 1}"`,
        `"${w.weapon_type || w.WeaponType || ''}"`,
        `"${w.weapon_number || w.WeaponNumber || w.serial_number || ''}"`,
        `"${w.caliber || ''}"`,
        `"${w.ammo_count || w.AmmoCount || 0}"`,
        `"${w.magazines_count || w.MagazinesCount || 0}"`,
        `"${w.receiving_entity || w.ReceivingEntity || ''}"`,
        `"${w.receiver_name || w.ReceiverName || ''}"`,
        `"${w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : '')}"`,
        `"${w.status || 'صالح للعمل ومصروف'}"`,
        `"${w.notes || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `كشف_الأسلحة_والذخائر_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('تم تصدير سجل الأسلحة والذخائر إلى ملف إكسل بنجاح 📊');
    } catch (e) {
      showToast('حدث خطأ أثناء تصدير الملف', 'error');
    }
  };

  // Import from Excel (XLSX / CSV)
  const fileInputRef = useRef(null);
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          showToast('ملف الإكسل فارغ أو غير متوافق', 'error');
          return;
        }

        let importedCount = 0;
        let skippedCount = 0;
        const existingNumbers = new Set(weapons.map(w => String(w.weapon_number || w.WeaponNumber || '').trim()));
        const newRecords = [];

        rawJson.forEach((row, idx) => {
          const type = row['نوع السلاح'] || row['النوع'] || row['WeaponType'] || 'سلاح ناري';
          const num = String(row['الرقم التسلسلي'] || row['رقم السلاح'] || row['WeaponNumber'] || row['Serial'] || '').trim();
          if (!num || existingNumbers.has(num)) {
            skippedCount++;
            return;
          }

          existingNumbers.add(num);
          const ammo = parseInt(row['الذخيرة (طلقة)'] || row['الذخيرة'] || row['AmmoCount'], 10) || 10;
          const mags = parseInt(row['عدد المخازن'] || row['المخازن'] || row['MagazinesCount'], 10) || 1;
          const ent = row['الجهة المستلمة'] || row['الجهة'] || row['ReceivingEntity'] || 'مخزن المديرية';
          const rec = row['المستلم الفعلي'] || row['المستلم'] || row['ReceiverName'] || '';
          const date = row['تاريخ الصرف'] || row['التاريخ'] || new Date().toISOString().split('T')[0];

          newRecords.push({
            id: weapons.length + importedCount + 1,
            WeaponID: weapons.length + importedCount + 1,
            weapon_type: type,
            WeaponType: type,
            weapon_number: num,
            WeaponNumber: num,
            serial_number: num,
            caliber: type.includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم',
            ammo_count: ammo,
            AmmoCount: ammo,
            magazines_count: mags,
            MagazinesCount: mags,
            receiving_entity: ent,
            ReceivingEntity: ent,
            receiver_name: rec,
            ReceiverName: rec,
            status: 'صالح للعمل ومصروف',
            issue_date: date,
            IssueDate: date,
            notes: 'مستورد من ملف إكسل'
          });
          importedCount++;
        });

        if (newRecords.length > 0) {
          const updated = [...newRecords, ...weapons];
          saveWeaponsState(updated);
          // Try backend bulk import
          apiFetch(`${API_BASE_URL}/import`, {
            method: 'POST',
            body: JSON.stringify({ weapons: newRecords })
          }).catch(() => {});
          showToast(`تم استيراد ${importedCount} قطعة سلاح بنجاح! (تم تخطي ${skippedCount} مكررة)`);
        } else {
          showToast(`لم يتم إضافة أسلحة جديدة (جميع السجلات البالغ عددها ${skippedCount} مكررة مسبقاً)`, 'info');
        }
      } catch (err) {
        showToast('خطأ أثناء قراءة ملف الإكسل', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Print Full Certified Weapons Roster (A4 Landscape)
  const handlePrintWeaponsRoster = () => {
    const dayName = getArabicDayName();
    const fullDate = getArabicDateString();

    const html = `
      <div class="printable-force-roster printable-roster-container" style="font-family: 'Cairo', 'Amiri', sans-serif; direction: rtl; padding: 6px 12px; color: #0a192f; width: 100%; box-sizing: border-box; background: #ffffff;">
        <style>
          @page {
            size: A4 landscape;
            margin: 6mm 8mm;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .printable-roster-container {
              padding: 0 !important;
              width: 100% !important;
            }
            table {
              page-break-inside: auto !important;
              break-inside: auto !important;
            }
            tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            thead {
              display: table-header-group !important;
            }
            tfoot {
              display: table-footer-group !important;
            }
          }
        </style>

        <!-- Sovereign Header Block (Attached to Table) -->
        <div class="roster-sovereign-header" style="page-break-inside: avoid !important; break-inside: avoid !important; page-break-after: avoid !important; break-after: avoid !important; margin-bottom: 4px;">
          <!-- الشريط الرسمي بألوان العلم الليبي -->
          <div style="height: 4px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 6px;">
            <div style="flex: 1; background: #e11d48;"></div>
            <div style="flex: 2; background: #000000;"></div>
            <div style="flex: 1; background: #16a34a;"></div>
          </div>

          <!-- الترويسة السيادية الرسمية ثلاثية الأعمدة -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 4px; margin-bottom: 6px;">
            <tr>
              <td style="text-align: right; vertical-align: middle; width: 32%;">
                <div style="font-size: 14px; font-weight: 900; color: #1e3a8a; line-height: 1.2;">دولة ليبيــــا</div>
                <div style="font-size: 13px; font-weight: 800; color: #0a192f; line-height: 1.2;">وزارة الداخليـــــة</div>
                <div style="font-size: 12px; font-weight: 800; color: #0369a1; line-height: 1.2;">مديرية أمن أوبــــاري</div>
                <div style="font-size: 10px; font-weight: 700; color: #475569;">قسم الأسلحة والذخائر والعهد المستديمة</div>
              </td>
              <td style="text-align: center; vertical-align: middle; width: 36%;">
                <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 58px; height: 58px; object-fit: contain; margin: 0 auto 2px; display: block;" />
                <div style="display: inline-block; background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%); color: #ffffff; padding: 3px 16px; border-radius: 6px; font-size: 13.5px; font-weight: 900; letter-spacing: 0.5px; border: 1px solid #d4af37;">
                  كشف حصر الأسلحة والذخائر والعهد المعتمد
                </div>
                <div style="font-size: 10px; font-weight: 800; color: #b45309; margin-top: 2px;">
                  السجل الرسمي لأسلحة وذخائر ومهمات مديرية أمن أوباري
                </div>
              </td>
              <td style="text-align: left; direction: rtl; vertical-align: middle; width: 32%;">
                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 10px; display: inline-block; min-width: 200px;">
                  <div style="font-size: 11.5px; font-weight: 800; color: #0a192f; margin-bottom: 2px;">
                    <span style="color: #1e3a8a; font-weight: 900;">اليوم:</span> ${dayName}
                  </div>
                  <div style="font-size: 11px; font-weight: 800; color: #0a192f; margin-bottom: 2px;">
                    <span style="color: #1e3a8a; font-weight: 900;">التاريخ:</span> ${fullDate}
                  </div>
                  <div style="font-size: 10px; font-weight: 700; color: #475569;">
                    <span style="color: #1e3a8a; font-weight: 800;">إجمالي الأسلحة:</span> <span style="color: #0284c7; font-weight: 900; font-size: 11.5px;">${filteredWeapons.length}</span> قطعة سلاح
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- شريط الإحصائيات الموجز -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px; background: #f1f5f9; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 10px;">
            <tr>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">إجمالي الأسلحة:</span>
                <strong style="color: #0a192f; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.total} قطعة</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">بنادق كلاشنكوف:</span>
                <strong style="color: #1e3a8a; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.rifles}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">مسدسات 9 ملم:</span>
                <strong style="color: #0369a1; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.pistols}</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center; border-left: 1px solid #cbd5e1;">
                <span style="color: #475569; font-weight: 700;">إجمالي الذخيرة:</span>
                <strong style="color: #b91c1c; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.totalAmmo} طلقة</strong>
              </td>
              <td style="padding: 3px 6px; text-align: center;">
                <span style="color: #475569; font-weight: 700;">إجمالي المخازن:</span>
                <strong style="color: #16a34a; font-weight: 900; font-size: 11px; margin-right: 4px;">${stats.totalMags} مخزن</strong>
              </td>
            </tr>
          </table>
        </div>

        <!-- جدول الأسلحة والذخائر الكامل -->
        <table class="roster-data-table" style="width: 100%; border-collapse: collapse; font-size: 9px; text-align: right; border: 1.5px solid #64748b; margin-bottom: 12px; page-break-before: avoid !important; break-before: avoid !important; page-break-inside: auto !important; break-inside: auto !important;">
          <thead>
            <tr style="background: #0a192f; color: #ffffff;">
              <th style="padding: 5px 3px; border: 1px solid #475569; width: 28px; text-align: center; font-weight: 800;">ت</th>
              <th style="padding: 5px 8px; border: 1px solid #475569; width: 140px; font-weight: 800;">نوع السلاح</th>
              <th style="padding: 5px 6px; border: 1px solid #475569; width: 110px; text-align: center; font-weight: 800;">رقم السلاح (التسلسلي)</th>
              <th style="padding: 5px 5px; border: 1px solid #475569; width: 85px; text-align: center; font-weight: 800;">العيار</th>
              <th style="padding: 5px 6px; border: 1px solid #475569; width: 100px; text-align: center; font-weight: 800;">الذخيرة والمخازن</th>
              <th style="padding: 5px 8px; border: 1px solid #475569; width: 170px; font-weight: 800;">الجهة المستلمة</th>
              <th style="padding: 5px 8px; border: 1px solid #475569; width: 150px; font-weight: 800;">المستلم الفعلي (عهدة شخصية)</th>
              <th style="padding: 5px 6px; border: 1px solid #475569; width: 80px; text-align: center; font-weight: 800;">تاريخ الصرف</th>
              <th style="padding: 5px 6px; border: 1px solid #475569; width: 90px; text-align: center; font-weight: 800;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredWeapons.map((w, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'}; page-break-inside: avoid; break-inside: avoid;">
                <td style="padding: 3.5px 2px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #475569;">${idx + 1}</td>
                <td style="padding: 3.5px 8px; border: 1px solid #cbd5e1; font-weight: 800; color: #0a192f;">${w.weapon_type || w.WeaponType || '---'}</td>
                <td style="padding: 3.5px 6px; border: 1px solid #cbd5e1; text-align: center; font-family: monospace; color: #b91c1c; font-weight: 900; font-size: 10px; letter-spacing: 0.5px;">${w.weapon_number || w.WeaponNumber || w.serial_number || '---'}</td>
                <td style="padding: 3.5px 5px; border: 1px solid #cbd5e1; text-align: center; color: #475569; font-size: 9px;">${w.caliber || (String(w.weapon_type || w.WeaponType).includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم')}</td>
                <td style="padding: 3.5px 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #1e3a8a; font-size: 9.5px;">${w.ammo_count || w.AmmoCount || 0} طلقة | ${w.magazines_count || w.MagazinesCount || 0} مخزن</td>
                <td style="padding: 3.5px 8px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 700;">${w.receiving_entity || w.ReceivingEntity || 'مخزن المديرية'}</td>
                <td style="padding: 3.5px 8px; border: 1px solid #cbd5e1; color: #047857; font-weight: 800;">${w.receiver_name || w.ReceiverName || '---'}</td>
                <td style="padding: 3.5px 6px; border: 1px solid #cbd5e1; text-align: center; color: #64748b; font-size: 9px;">${w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : '---')}</td>
                <td style="padding: 3.5px 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: 800; color: #15803d; font-size: 9px;">${w.status || 'صالح للعمل ومصروف'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- تذييل الوثيقة الرسمية المعتمدة -->
        <div style="border-top: 1px solid #cbd5e1; margin-top: 12px; padding-top: 5px; display: flex; justify-content: space-between; font-size: 8.5px; color: #64748b; font-weight: 600;">
          <div>وثيقة أمنية رسمية معتمدة صادرة عن منظومة مديرية أمن أوباري - قسم الأسلحة والذخائر - وزارة الداخلية</div>
          <div>تاريخ الاستخراج: ${dayName} ${fullDate} | عدد السجلات المقيدة: ${filteredWeapons.length}</div>
        </div>
      </div>
    `;

    printDocumentInIframe(html, 'كشف_حصر_الأسلحة_والذخائر_مديرية_أمن_أوباري');
  };

  // Print Single Weapon Custody Receipt (A4 Portrait)
  const handlePrintSingleReceipt = (w) => {
    const dayName = getArabicDayName();
    const fullDate = getArabicDateString();

    const wType = w.weapon_type || w.WeaponType || 'سلاح ناري';
    const wNum = w.weapon_number || w.WeaponNumber || w.serial_number || '---';
    const wAmmo = w.ammo_count || w.AmmoCount || 0;
    const wMags = w.magazines_count || w.MagazinesCount || 0;
    const wEnt = w.receiving_entity || w.ReceivingEntity || '---';
    const wRec = w.receiver_name || w.ReceiverName || wEnt;
    const wCaliber = w.caliber || (wType.includes('مسدس') ? '9x19 ملم' : '7.62x39 ملم');
    const wDate = w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : fullDate);

    const html = `
      <div class="official-a4-letter-sheet" style="font-family: 'Cairo', 'Amiri', sans-serif; direction: rtl; padding: 0; color: #0a192f; width: 100%; max-width: 186mm; margin: 0 auto; background: #ffffff;">
        <style>
          @page {
            size: A4 portrait !important;
            margin: 10mm 12mm !important;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .official-a4-letter-sheet {
              padding: 0 !important;
              max-width: 186mm !important;
              width: 100% !important;
            }
          }
        </style>

        <!-- Libyan 4-Color Ribbon -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 15px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <!-- Sovereign Header -->
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 35%;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيــــا</div>
              <div style="font-size: 14px; font-weight: 800; color: #0a192f;">وزارة الداخليـــــة</div>
              <div style="font-size: 13px; font-weight: 800; color: #0369a1;">مديرية أمن أوبــــاري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">قسم الأسلحة والذخائر والعهد</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 30%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 72px; height: 72px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: rtl; vertical-align: middle; width: 35%;">
              <div style="font-size: 12px; font-weight: 800; color: #0a192f;">الرقم الإشاري: م أ أ / س ذ / ${w.id || 1}</div>
              <div style="font-size: 12px; font-weight: 800; color: #0a192f; margin-top: 3px;">اليوم: ${dayName}</div>
              <div style="font-size: 11.5px; font-weight: 700; color: #475569; margin-top: 3px;">التاريخ: ${fullDate}</div>
            </td>
          </tr>
        </table>

        <!-- Document Title Banner -->
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%); color: #ffffff; padding: 6px 28px; border-radius: 8px; font-size: 16px; font-weight: 900; border: 1.5px solid #d4af37; letter-spacing: 0.5px;">
            إشعار صرف واستلام عهدة سلاح رسمي
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 700;">
            وثيقة أمنية رسمية صادرة بموجب القوانين واللوائح المنظمة لحيازة واستخدام السلاح الشرطي
          </div>
        </div>

        <!-- Weapon & Recipient Details Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px; border: 1.5px solid #cbd5e1;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; width: 28%; font-weight: 800; color: #1e3a8a;">الجهة المستلمة:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #0a192f;" colspan="3">${wEnt}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">المستلم الفعلي (العهدة):</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #047857;" colspan="3">${wRec || 'مخزن الوحدة / القسم'}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">نوع السلاح المصروف:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 900; color: #0a192f;">${wType}</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; width: 22%; font-weight: 800; color: #1e3a8a;">عيار السلاح:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #0a192f;">${wCaliber}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">الرقم التسلسلي للسلاح:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 900; font-family: monospace; font-size: 15px; color: #b91c1c; letter-spacing: 1px;" colspan="3">${wNum}</td>
          </tr>
          <tr style="background: #f1f5f9;">
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">كمية الذخيرة الحية:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a;">${wAmmo} طلقة</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">عدد المخازن:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a;">${wMags} مخزن</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">تاريخ الصرف والتسجيل:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 700; color: #475569;">${wDate}</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">الحالة الفنية:</td>
            <td style="padding: 10px 14px; border: 1px solid #cbd5e1; font-weight: 800; color: #15803d;">صالح وجاهز للاستخدام</td>
          </tr>
        </table>

        <!-- Legal Pledge / إقرار الاستلام والمسؤولية -->
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-right: 4px solid #d97706; padding: 12px 18px; border-radius: 8px; margin-bottom: 30px; font-size: 12px; line-height: 1.6; color: #92400e;">
          <strong>إقرار وتعهد بالمسؤولية القانونية:</strong><br />
          أقر أنا المستلم الموضح اسمي أعلاه بأنني استلمت السلاح المبينة مواصفاته وأرقامه وذخيرته أعلاه في حالة سليمة وجاهزة للعمل، وأتعهد بالمحافظة التامة عليه وعدم تسليمه أو إعارته لأي طرف، واستخدامه حصراً في أداء الواجبات والمهام الأمنية الرسمية المكلف بها وفق تعليمات وضوابط وزارة الداخلية وقانون هيئة الشرطة، وأتحمل كامل المسؤولية الجنائية والمسلكية في حال الفقدان أو التلف أو سوء الاستخدام.
        </div>

        <!-- Document Footer -->
        <div style="border-top: 1px solid #cbd5e1; margin-top: 35px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 9px; color: #64748b; font-weight: 700;">
          <div>صادر عن المنظومة المركزية - مديرية أمن أوباري - وزارة الداخلية - دولة ليبيا</div>
          <div>رقم السلاح: ${wNum} | تاريخ الاستخراج: ${fullDate}</div>
        </div>
      </div>
    `;

    printDocumentInIframe(html, `إيصال_عهدة_سلاح_${wNum}`);
  };

  return (
    <div className="weapons-module-container" style={{ direction: 'rtl', padding: '20px 28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Libyan 4-Color Ribbon */}
      <div style={{ height: '4px', width: '100%', display: 'flex', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: '#e11d48' }} />
        <div style={{ flex: 2, background: '#000000' }} />
        <div style={{ flex: 1, background: '#16a34a' }} />
      </div>

      {/* Module Header Bar */}
      <div className="module-view-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="module-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0a192f' }}>قسم الأسلحة والذخائر والعهد</h1>
            <span style={{
              background: 'rgba(30, 58, 138, 0.08)',
              color: '#1e3a8a',
              padding: '2px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 800,
              border: '1px solid rgba(30, 58, 138, 0.2)'
            }}>
              سجل رسمي معتمد
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
            حصر وتوثيق الأسلحة النارية والبنادق والمسدسات والذخائر ومتابعة صرف العهد بالمراكز والأقسام
          </p>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Hidden Excel File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
            onChange={handleImportExcel}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <UploadCloud size={16} />
            <span>استيراد إكسل</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: '#059669',
              border: '1.5px solid #059669',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)',
              transition: 'all 0.2s'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير إكسل</span>
          </button>

          <button
            type="button"
            onClick={handlePrintWeaponsRoster}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
              color: '#ffffff',
              border: '1px solid #d4af37',
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Printer size={16} />
            <span>طباعة كشف الأسلحة</span>
          </button>

          <button
            type="button"
            onClick={showForm ? () => setShowForm(false) : handleOpenAdd}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showForm ? '#dc2626' : 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? 'إلغاء النموذج' : 'تسجيل وصرف عهدة سلاح'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Alert */}
      {notificationMsg && (
        <div style={{
          background: notificationType === 'error' ? '#fef2f2' : notificationType === 'info' ? '#eff6ff' : '#ecfdf5',
          border: `1px solid ${notificationType === 'error' ? '#fecaca' : notificationType === 'info' ? '#bfdbfe' : '#a7f3d0'}`,
          color: notificationType === 'error' ? '#991b1b' : notificationType === 'info' ? '#1e40af' : '#065f46',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {notificationType === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Summary Statistics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        {/* Total Weapons */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderRight: '4px solid #1e3a8a'
        }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي الأسلحة المصروفة</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', marginTop: '6px' }}>
            {stats.total.toLocaleString('ar-LY')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>قطعة</span>
          </div>
        </div>

        {/* Rifles (كلاشنكوف) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderRight: '4px solid #b91c1c'
        }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>بنادق كلاشنكوف</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#b91c1c', marginTop: '6px' }}>
            {stats.rifles.toLocaleString('ar-LY')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>بندقية</span>
          </div>
        </div>

        {/* Pistols (مسدسات 9 ملم) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderRight: '4px solid #0369a1'
        }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>مسدسات عيار (9) ملي</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0369a1', marginTop: '6px' }}>
            {stats.pistols.toLocaleString('ar-LY')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>مسدس</span>
          </div>
        </div>

        {/* Total Magazines */}
        <div style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          borderRight: '4px solid #059669'
        }}>
          <div>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>إجمالي المخازن والملحقات</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', marginTop: '6px' }}>
            {stats.totalMags.toLocaleString('ar-LY')} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>مخزن</span>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Panel */}
      {showForm && (
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px solid #1e3a8a',
          padding: '24px',
          marginBottom: '25px',
          boxShadow: '0 10px 30px rgba(30, 58, 138, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#1e3a8a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {editingId ? <Edit size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#0a192f' }}>
                  {editingId ? 'تعديل بيانات عهدة السلاح' : 'تسجيل وصرف عهدة سلاح جديدة'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  تسجيل بيانات السلاح الناري والذخيرة وتحديد المستلم الفعلي والمركز
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ background: '#f1f5f9', border: 'none', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveWeapon}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {/* Weapon Type */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  نوع السلاح: <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.weapon_type}
                  onChange={(e) => handleInputChange('weapon_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 700,
                    background: '#ffffff'
                  }}
                  required
                >
                  {WEAPON_TYPES.map(t => (
                    <option key={t.label} value={t.label}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Serial Number */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#b91c1c', marginBottom: '6px' }}>
                  رقم السلاح (التسلسلي): <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: 20BV06194 أو 3215835..."
                  value={formData.weapon_number}
                  onChange={(e) => handleInputChange('weapon_number', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '2px solid #b91c1c',
                    fontSize: '13.5px',
                    fontFamily: 'monospace',
                    fontWeight: 900,
                    direction: 'ltr',
                    textAlign: 'center',
                    background: '#fffbfb'
                  }}
                  required
                />
              </div>

              {/* Caliber */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  عيار السلاح:
                </label>
                <input
                  type="text"
                  value={formData.caliber}
                  onChange={(e) => handleInputChange('caliber', e.target.value)}
                  placeholder="مثال: 9x19 ملم أو 7.62x39 ملم"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif'
                  }}
                />
              </div>

              {/* Ammo Count */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  كمية الذخيرة (طلقة):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={formData.ammo_count}
                  onChange={(e) => handleInputChange('ammo_count', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 800
                  }}
                />
              </div>

              {/* Magazines Count */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  عدد المخازن:
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.magazines_count}
                  onChange={(e) => handleInputChange('magazines_count', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 800
                  }}
                />
              </div>

              {/* Receiving Entity */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  الجهة المستلمة: <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={formData.receiving_entity}
                  onChange={(e) => handleInputChange('receiving_entity', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 700
                  }}
                  required
                >
                  {KNOWN_ENTITIES.map(ent => (
                    <option key={ent} value={ent}>{ent}</option>
                  ))}
                </select>
              </div>

              {/* Receiver Name (with Autocomplete from forceMembers) */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#047857', marginBottom: '6px' }}>
                  المستلم الفعلي (عهدة شخصية):
                </label>
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو أدخل الرتبة والاسم الرباعي..."
                  value={formData.receiver_name}
                  onChange={(e) => {
                    handleInputChange('receiver_name', e.target.value);
                    setReceiverSearchQuery(e.target.value);
                    setShowReceiverSuggestions(true);
                  }}
                  onFocus={() => setShowReceiverSuggestions(true)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #047857',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 700
                  }}
                />

                {/* Autocomplete Dropdown */}
                {showReceiverSuggestions && receiverSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '100%',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 50,
                    maxHeight: '220px',
                    overflowY: 'auto',
                    marginTop: '4px'
                  }}>
                    {receiverSuggestions.map(member => (
                      <div
                        key={member.id}
                        onClick={() => {
                          const full = `${member.rank || member.job_title || 'شرطي'} / ${member.name}`;
                          handleInputChange('receiver_name', full);
                          setReceiverSearchQuery('');
                          setShowReceiverSuggestions(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12.5px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                      >
                        <div>
                          <strong style={{ color: '#0a192f' }}>{member.rank || 'شرطي'} / {member.name}</strong>
                          <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>({member.department || 'المديرية'})</span>
                        </div>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#0284c7', fontWeight: 700 }}>
                          {member.financial_number || member.job_number}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Issue Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  تاريخ الصرف:
                </label>
                <input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif'
                  }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  حالة السلاح:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif',
                    fontWeight: 700
                  }}
                >
                  <option value="صالح للعمل ومصروف">صالح للعمل ومصروف</option>
                  <option value="في المخزن (جاهز)">في المخزن (جاهز)</option>
                  <option value="تحت الصيانة">تحت الصيانة</option>
                  <option value="مسلّم ومنتهي العهدة">مسلّم ومنتهي العهدة</option>
                </select>
              </div>

              {/* Notes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  ملاحظات العهدة:
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="أي ملاحظات خاصة برقم القرار أو تسليم العهدة..."
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontFamily: 'Cairo, sans-serif'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                  color: '#ffffff',
                  border: '1px solid #d4af37',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: isLoading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)'
                }}
              >
                <Save size={16} />
                <span>{editingId ? 'حفظ التعديلات' : 'حفظ وصرف عهدة السلاح'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Quick Search Toolbar */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          flex: '1 1 300px',
          minWidth: '240px'
        }}>
          <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث برقم السلاح، النوع، الجهة، أو اسم المستلم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 38px 9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontFamily: 'Cairo, sans-serif'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Weapon Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>النوع:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 700,
                background: '#ffffff'
              }}
            >
              <option value="الكل">كل الأنواع ({weapons.length})</option>
              <option value="مسدس">مسدسات ({stats.pistols})</option>
              <option value="كلاشن">بنادق كلاشنكوف ({stats.rifles})</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>الجهة:</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 700,
                background: '#ffffff',
                maxWidth: '200px'
              }}
            >
              <option value="الكل">كافة الجهات والمراكز</option>
              {KNOWN_ENTITIES.map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedType !== 'الكل' || selectedEntity !== 'الكل') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('الكل');
                setSelectedEntity('الكل');
              }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              إعادة ضبط
            </button>
          )}
        </div>
      </div>

      {/* Main Weapons Table Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right' }}>
            <thead>
              <tr style={{ background: '#0a192f', color: '#ffffff' }}>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #d4af37', width: '38px', textAlign: 'center' }}>ت</th>
                <th style={{ padding: '12px 12px', borderBottom: '2px solid #d4af37', width: '160px' }}>نوع السلاح</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '130px' }}>رقم السلاح (التسلسلي)</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '100px' }}>العيار</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '130px' }}>الذخيرة والمخازن</th>
                <th style={{ padding: '12px 12px', borderBottom: '2px solid #d4af37' }}>الجهة المستلمة</th>
                <th style={{ padding: '12px 12px', borderBottom: '2px solid #d4af37' }}>المستلم الفعلي (عهدة شخصية)</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '95px' }}>تاريخ الصرف</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '100px' }}>الحالة</th>
                <th style={{ padding: '12px 10px', borderBottom: '2px solid #d4af37', textAlign: 'center', width: '120px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWeapons.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                    لا توجد أسلحة مسجلة مطابقة لمعايير البحث الحالية
                  </td>
                </tr>
              ) : (
                paginatedWeapons.map((w, idx) => {
                  const serialIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isPistol = (w.weapon_type || w.WeaponType || '').includes('مسدس');

                  return (
                    <tr
                      key={w.id || w.WeaponID || idx}
                      style={{
                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                    >
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 800, color: '#64748b' }}>
                        {serialIndex}
                      </td>

                      {/* Type Badge */}
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: '#0a192f' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: isPistol ? 'rgba(3, 105, 161, 0.08)' : 'rgba(185, 28, 28, 0.08)',
                          color: isPistol ? '#0369a1' : '#b91c1c',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}>
                          {w.weapon_type || w.WeaponType}
                        </span>
                      </td>

                      {/* Serial Number */}
                      <td style={{ padding: '10px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, color: '#b91c1c', fontSize: '13px', letterSpacing: '0.5px' }}>
                        {w.weapon_number || w.WeaponNumber || w.serial_number || '---'}
                      </td>

                      {/* Caliber */}
                      <td style={{ padding: '10px', textAlign: 'center', color: '#475569', fontSize: '11.5px', fontWeight: 600 }}>
                        {w.caliber || (isPistol ? '9x19 ملم' : '7.62x39 ملم')}
                      </td>

                      {/* Ammo & Mags */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 800
                        }}>
                          {w.ammo_count || w.AmmoCount || 0} طلقة | {w.magazines_count || w.MagazinesCount || 0} مخزن
                        </span>
                      </td>

                      {/* Entity */}
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1e293b' }}>
                        <span>{w.receiving_entity || w.ReceivingEntity || 'مخزن المديرية'}</span>
                      </td>

                      {/* Receiver */}
                      <td style={{ padding: '10px 12px' }}>
                        {w.receiver_name || w.ReceiverName ? (
                          <span style={{ color: '#047857', fontWeight: 800 }}>
                            {w.receiver_name || w.ReceiverName}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>عهدة قسم / مركز</span>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontSize: '11.5px', fontWeight: 600 }}>
                        {w.issue_date || (w.IssueDate ? String(w.IssueDate).split('T')[0] : '---')}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{
                          background: 'rgba(22, 163, 74, 0.1)',
                          color: '#15803d',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {w.status || 'صالح للعمل ومصروف'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {/* Print Receipt */}
                          <button
                            type="button"
                            onClick={() => handlePrintSingleReceipt(w)}
                            style={{
                              background: '#eff6ff',
                              color: '#1e3a8a',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="طباعة إيصال عهدة رسمي"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(w)}
                            style={{
                              background: '#f8fafc',
                              color: '#0284c7',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="تعديل العهدة"
                          >
                            <Edit size={15} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteWeapon(w)}
                            style={{
                              background: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '5px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="مسح من السجلات"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '14px',
            borderTop: '1px solid #edf2f7',
            background: '#ffffff'
          }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronRight size={16} />
              <span>السابق</span>
            </button>

            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e3a8a', padding: '0 8px' }}>
              الصفحة {currentPage} من {totalPages} (إجمالي {filteredWeapons.length} قطعة سلاح)
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <span>التالي</span>
              <ChevronLeft size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
