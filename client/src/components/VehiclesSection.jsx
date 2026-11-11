import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { printDocumentInIframe } from '../utils/printHelper';
import {
  Car,
  Wrench,
  Fuel,
  Shield,
  Printer,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Calendar,
  X,
  FileText,
  RefreshCw,
  Copy,
  Check,
  FileCheck,
  Layers,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import initialVehiclesData from '../data/vehicles_data.json';
import ForceNameAutocomplete from './ForceNameAutocomplete';

const API_BASE_URL = 'http://localhost:5050/api/vehicles';

export default function VehiclesSection({ user, forceMembers = [] }) {
  const [vehicles, setVehicles] = useState(initialVehiclesData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [selectedDepartment, setSelectedDepartment] = useState('الكل');
  const [selectedFuel, setSelectedFuel] = useState('الكل');

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [selectedVehicleForView, setSelectedVehicleForView] = useState(null);
  const [selectedVehicleForHandover, setSelectedVehicleForHandover] = useState(null);
  const [isPrintAllOpen, setIsPrintAllOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Form state
  const defaultFormData = {
    plate_number: '',
    vehicle_type: 'تويوتا مزدوجة رباعي',
    category: 'سيارة مراكز وأقسام',
    model_year: '2024',
    chassis_number: '',
    department: 'مركز شرطة أوباري',
    custodian_name: '',
    custodian_rank: 'ضابط',
    status: 'جاهزة للعمل',
    fuel_type: 'بنزين',
    notes: ''
  };
  const [formData, setFormData] = useState(defaultFormData);

  // Load vehicles from backend on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Keyboard Escape listener to close any open modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedVehicleForView(null);
        setSelectedVehicleForHandover(null);
        setIsAddEditModalOpen(false);
        setIsPrintAllOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setVehicles(json.data);
        }
      }
    } catch (e) {
      console.warn('Backend not responding, using offline vehicles cache:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR Code when a vehicle is selected for viewing
  useEffect(() => {
    if (selectedVehicleForView) {
      const qrData = `وزارة الداخلية - دولة ليبيا\nمديرية أمن أوباري | القوة الآلية\nرقم اللوحة: ${selectedVehicleForView.plate_number}\nنوع المركبة: ${selectedVehicleForView.vehicle_type}\nرقم الهيكل: ${selectedVehicleForView.chassis_number}\nالمستلم/الجهة: ${selectedVehicleForView.custodian_name || selectedVehicleForView.department}`;
      QRCode.toDataURL(qrData, { width: 140, margin: 1 }, (err, url) => {
        if (!err) setQrCodeUrl(url);
      });
    }
  }, [selectedVehicleForView]);

  // Extract unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set();
    vehicles.forEach(v => {
      if (v.department && v.department.trim()) set.add(v.department.trim());
    });
    return Array.from(set).sort();
  }, [vehicles]);

  // Filtering
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Category filter
      if (selectedCategory !== 'الكل' && v.category !== selectedCategory) return false;
      // Status filter
      if (selectedStatus !== 'الكل' && v.status !== selectedStatus) return false;
      // Department filter
      if (selectedDepartment !== 'الكل' && v.department !== selectedDepartment) return false;
      // Fuel filter
      if (selectedFuel !== 'الكل' && v.fuel_type !== selectedFuel) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const matchesPlate = v.plate_number && v.plate_number.toLowerCase().includes(q);
        const matchesChassis = v.chassis_number && v.chassis_number.toLowerCase().includes(q);
        const matchesType = v.vehicle_type && v.vehicle_type.toLowerCase().includes(q);
        const matchesDept = v.department && v.department.toLowerCase().includes(q);
        const matchesCustodian = v.custodian_name && v.custodian_name.toLowerCase().includes(q);
        const matchesNotes = v.notes && v.notes.toLowerCase().includes(q);
        if (!matchesPlate && !matchesChassis && !matchesType && !matchesDept && !matchesCustodian && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [vehicles, selectedCategory, selectedStatus, selectedDepartment, selectedFuel, searchTerm]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'جاهزة للعمل').length;
    const custody = vehicles.filter(v => v.category === 'سيارة عهدة شخصية').length;
    const department = vehicles.filter(v => v.category === 'سيارة مراكز وأقسام').length;
    const motorcycles = vehicles.filter(v => v.category === 'دراجة نارية شرطية').length;
    const outOfService = vehicles.filter(v => v.status !== 'جاهزة للعمل').length;
    return { total, active, custody, department, motorcycles, outOfService };
  }, [vehicles]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage) || 1;
  const paginatedVehicles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVehicles.slice(start, start + itemsPerPage);
  }, [filteredVehicles, currentPage, itemsPerPage]);

  const handleCopyChassis = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };


  // Isolated Single-Page Iframe Printing for Vehicle Card
  const handlePrintVehicleCard = (v) => {
    if (!v) return;
    const cardHtml = `
      <div style="width: 100%; max-width: 540px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم الخدمات والمركبات والآليات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 60px;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style="width: 48px; height: 48px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Fleet Division</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 12px;">
          <div style="display: inline-block; background: #eff6ff; border: 1.5px solid #1e3a8a; padding: 4px 18px; border-radius: 20px; font-size: 12px; font-weight: 900; color: #1e3a8a;">
            بطاقة قيد ومعاينة الآلية الأمنية الرسمية
          </div>
        </div>

        <div style="border: 2px solid #0284c7; background: #f8fafc; border-radius: 10px; padding: 12px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: #64748b; font-weight: 700;">رقم اللوحة الرسمي:</div>
            <div style="font-size: 26px; font-weight: 900; color: #0f172a;">
              ${v.plate_number} <span style="font-size: 16px; color: #0284c7;">/ شرطة ليبيا</span>
            </div>
            <div style="font-size: 11px; font-weight: 800; color: ${v.status === 'جاهزة للعمل' ? '#166534' : '#991b1b'}; margin-top: 4px;">
              ● الحالة التشغيلية: ${v.status}
            </div>
          </div>
          ${qrCodeUrl ? `
            <div style="text-align: center; background: #ffffff; padding: 4px; border: 1px solid #cbd5e1; border-radius: 6px;">
              <img src="${qrCodeUrl}" alt="QR" style="width: 65px; height: 65px; display: block;" />
              <div style="font-size: 8px; color: #64748b; font-weight: 700; margin-top: 2px;">رمز التحقق</div>
            </div>
          ` : ''}
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11.5px; margin-bottom: 14px;">
          <tr style="background: #f1f5f9;">
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">نوع وطراز الآلية:</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800; width: 25%;">${v.vehicle_type}</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b; width: 25%;">سنة الصنع / الموديل:</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800; width: 25%;">${v.model_year || '---'}</td>
          </tr>
          <tr>
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b;">رقم الهيكل (VIN):</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${v.chassis_number || 'غير متوفر'}</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b;">نوع الوقود المشغل:</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800;">${v.fuel_type || 'بنزين'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b;">جهة التبعية والتشغيل:</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800; color: #1e3a8a;">${v.department}</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; color: #64748b;">المستلم والمسؤول:</td>
            <td style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 800;">${v.custodian_name || 'عهدة القسم'}${v.custodian_rank ? ' (' + v.custodian_rank + ')' : ''}</td>
          </tr>
          ${v.notes ? `
            <tr>
              <td style="padding: 7px; border: 1px solid #cbd5e1; color: #b45309; background: #fffbeb;">ملاحظات التشغيل:</td>
              <td colspan="3" style="padding: 7px; border: 1px solid #cbd5e1; font-weight: 700; color: #78350f; background: #fffbeb;">${v.notes}</td>
            </tr>
          ` : ''}
        </table>

        <table style="width: 100%; border-collapse: collapse; border-top: 2px solid #1e3a8a; padding-top: 10px; margin-top: 20px;">
          <tr>
            <td style="text-align: center; vertical-align: top; width: 33%;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 3px;">رئيس قسم الخدمات والآليات</div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a;">عميد / حامد علي عبدالرحمن</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 33%;">
              <div style="width: 52px; height: 52px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6.5px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.2;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 6px;">ختم رسمي</span>
              </div>
            </td>
            <td style="text-align: center; vertical-align: top; width: 33%;">
              <div style="font-size: 10px; color: #64748b; font-weight: 700; margin-bottom: 3px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 800; color: #0f172a;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(cardHtml, 'بطاقة قيد الآلية - ' + v.plate_number);
  };

  // Isolated Single-Page Printing for Handover Report
  const handlePrintHandoverReport = (v) => {
    if (!v) return;
    const todayStr = new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const docHtml = `
      <div style="width: 100%; max-width: 680px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; line-height: 1.6;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم الخدمات والمركبات والآليات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 60px;">
              <img src="${window.location.origin}/moi-logo.png" alt="شعار وزارة الداخلية" style="width: 50px; height: 50px; object-fit: contain;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Fleet Division</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 12px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            محضر تسليم واستلام عهدة آلية شرطية رسمية
          </h2>
          <div style="font-size: 11px; color: #b45309; font-weight: 800; margin-top: 3px;">
            رقم القيد: MOI-UBR-${v.plate_number}-2026
          </div>
        </div>

        <p style="font-size: 12px; margin-bottom: 10px; text-align: justify;">
          إنه في يوم <strong>${todayStr}</strong>، وبناءً على تعليمات السيد مدير أمن أوباري وبإشراف السيد رئيس قسم الخدمات والمركبات، تم تسليم الآلية المبينة بياناتها أدناه بصفة عهدة رسمية:
        </p>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11.5px; margin-bottom: 12px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; width: 25%;">رقم اللوحة:</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #0284c7;">${v.plate_number} (شرطة ليبيا)</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; width: 25%;">نوع وطراز المركبة:</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">${v.vehicle_type}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">سنة الصنع (الموديل):</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${v.model_year || '---'}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">رقم الهيكل (VIN):</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${v.chassis_number || 'غير مدون'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">الجهة المسلمة لها:</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #1e3a8a; font-weight: 800;">${v.department}</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">نوع الوقود:</td>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${v.fuel_type || 'بنزين'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800;">المستلم المفوض:</td>
            <td colspan="3" style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 800; color: #0f172a;">
              ${v.custodian_name || 'رئيس القسم / المركز'}${v.custodian_rank ? ' (' + v.custodian_rank + ')' : ''}
            </td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #1e3a8a; padding: 8px 12px; border-radius: 6px; font-size: 11px; margin-bottom: 14px;">
          <strong style="color: #1e3a8a;">إقرار وتعهد المستلم:</strong>
          <p style="margin: 3px 0 0 0; color: #334155; line-height: 1.5;">
            أقر أنا المستلم الموقع أدناه بأنني استلمت الآلية المذكورة أعلاه بحالة فنية صالحة وجيدة للاستعمال الأمني، وأتعهد بالمحافظة التامة عليها وصيانتها الدورية واستخدامها في الأغراض الأمنية المخصصة لها فقط دون سواها، وإرجاعها لقسم الخدمات والمركبات عند انتهاء المهام أو نقل العمل.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 16px; font-size: 11px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">المستلم للعهدة</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">${v.custodian_name || '........................'}</div>
              <div style="font-size: 10px; color: #64748b;">التوقيع والصفة</div>
            </td>
            <td style="width: 33%; vertical-align: middle;">
              <div style="width: 50px; height: 50px; border-radius: 50%; border: 1.5px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 6.5px; font-weight: 800; color: #1e3a8a; margin: 0 auto; line-height: 1.2;">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style="color: #dc2626; font-size: 6px;">ختم رسمي</span>
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">يعتمد / مدير أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">لواء / موسى سعد محمد</div>
              <div style="font-size: 10px; color: #64748b;">مدير الأمن العام</div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(docHtml, 'محضر تسليم عهدة آلية - ' + v.plate_number);
  };

  const handleOpenAddModal = () => {
    setEditingVehicle(null);
    setFormData(defaultFormData);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      plate_number: vehicle.plate_number || '',
      vehicle_type: vehicle.vehicle_type || '',
      category: vehicle.category || 'سيارة مراكز وأقسام',
      model_year: vehicle.model_year || '2024',
      chassis_number: vehicle.chassis_number || '',
      department: vehicle.department || '',
      custodian_name: vehicle.custodian_name || '',
      custodian_rank: vehicle.custodian_rank || '',
      status: vehicle.status || 'جاهزة للعمل',
      fuel_type: vehicle.fuel_type || 'بنزين',
      notes: vehicle.notes || ''
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    if (!formData.plate_number.trim()) {
      alert('يرجى إدخال رقم اللوحة / المركبة');
      return;
    }

    try {
      if (editingVehicle) {
        // Update
        const updated = {
          ...editingVehicle,
          ...formData
        };
        const res = await fetch(`${API_BASE_URL}/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        if (res.ok) {
          const json = await res.json();
          setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? json.data : v));
        } else {
          // Local fallback
          setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? updated : v));
        }
      } else {
        // Create new
        const newVehicle = {
          id: Date.now(),
          record_no: vehicles.length + 1,
          ...formData,
          created_at: new Date().toISOString()
        };
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newVehicle)
        });
        if (res.ok) {
          const json = await res.json();
          setVehicles(prev => [json.data, ...prev]);
        } else {
          // Local fallback
          setVehicles(prev => [newVehicle, ...prev]);
        }
      }
      setIsAddEditModalOpen(false);
    } catch (err) {
      console.error('Save vehicle error:', err);
      // Fallback locally
      if (editingVehicle) {
        setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? { ...v, ...formData } : v));
      } else {
        setVehicles(prev => [{ id: Date.now(), record_no: prev.length + 1, ...formData }, ...prev]);
      }
      setIsAddEditModalOpen(false);
    }
  };

  const handleDeleteVehicle = async (id, plate) => {
    if (!window.confirm(`هل أنت متأكد من حذف المركبة ذات اللوحة (${plate}) من السجل؟`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVehicles(prev => prev.filter(v => v.id !== id));
      } else {
        setVehicles(prev => prev.filter(v => v.id !== id));
      }
    } catch (err) {
      setVehicles(prev => prev.filter(v => v.id !== id));
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredVehicles.map((v, i) => ({
      'ت': i + 1,
      'ر.م': v.record_no || i + 1,
      'رقم المركبة / اللوحة': v.plate_number,
      'نوع المركبة': v.vehicle_type,
      'التصنيف': v.category,
      'الموديل (سنة الصنع)': v.model_year,
      'رقم الهيكل (VIN)': v.chassis_number,
      'جهة العمل المسلمة لها': v.department,
      'المستلم / المسؤول': v.custodian_name,
      'الرتبة': v.custodian_rank,
      'الحالة التشغيلية': v.status,
      'نوع الوقود': v.fuel_type,
      'ملاحظات': v.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'القوة الآلية أوباري');
    XLSX.writeFile(workbook, `كشف_القوة_الآلية_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="vehicles-section-container" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Header bar */}
      <div className="module-view-header">
        <div className="module-title-box">
          <div className="title-gold-bar" />
          <div>
            <h1>قسم الآليات والمركبات والقوة الآلية</h1>
            <span>دولة ليبيا - وزارة الداخلية | مديرية أمن أوباري</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPrintAllOpen(true)}
            className="btn-official-secondary"
            title="طباعة كشف حصر الآليات الرسمي"
          >
            <Printer size={16} />
            <span>طباعة الكشف الرسمي</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="btn-official-secondary"
            title="تصدير لملف إكسيل"
          >
            <Download size={16} />
            <span>تصدير إكسيل</span>
          </button>

          <button
            onClick={fetchVehicles}
            className="btn-official-secondary"
            title="تحديث البيانات"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="btn-official-primary"
          >
            <Plus size={16} />
            <span>إضافة آلية جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #1e3a8a' }}>
          <div style={{ background: '#dbeafe', color: '#1e3a8a', padding: '12px', borderRadius: '10px' }}>
            <Car size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>إجمالي القوة الآلية</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a' }}>{stats.total}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>مركبة ودراجة شرطية</div>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #059669' }}>
          <div style={{ background: '#d1fae5', color: '#059669', padding: '12px', borderRadius: '10px' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>الآليات الجاهزة للعمل</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{stats.active}</div>
            <div style={{ fontSize: '11px', color: '#10b981' }}>على أهبة الاستعداد</div>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #b45309' }}>
          <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '10px' }}>
            <User size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>سيارات العهد الشخصية</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309' }}>{stats.custody}</div>
            <div style={{ fontSize: '11px', color: '#d97706' }}>بعهدة قيادات وضباط</div>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #2563eb' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: '12px', borderRadius: '10px' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>سيارات المراكز والأقسام</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>{stats.department}</div>
            <div style={{ fontSize: '11px', color: '#3b82f6' }}>دوريات وتأمين منافذ</div>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #7c3aed' }}>
          <div style={{ background: '#ede9fe', color: '#7c3aed', padding: '12px', borderRadius: '10px' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>الدراجات النارية</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#7c3aed' }}>{stats.motorcycles}</div>
            <div style={{ fontSize: '11px', color: '#8b5cf6' }}>مرور ودفع رباعي</div>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', borderRight: '4px solid #dc2626' }}>
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '10px' }}>
            <Wrench size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>عاطلة / تحت الصيانة</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>{stats.outOfService}</div>
            <div style={{ fontSize: '11px', color: '#ef4444' }}>تحتاج صيانة وإصلاح</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="table-panel-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          {[
            { id: 'الكل', label: 'كافة الآليات', count: stats.total },
            { id: 'سيارة عهدة شخصية', label: 'سيارات العهد الشخصية', count: stats.custody },
            { id: 'سيارة مراكز وأقسام', label: 'سيارات المراكز والأقسام', count: stats.department },
            { id: 'دراجة نارية شرطية', label: 'الدراجات النارية', count: stats.motorcycles },
            { id: 'حافلة نقل وشاحنة خدمات', label: 'الحافلات والشاحنات', count: vehicles.filter(v => v.category === 'حافلة نقل وشاحنة خدمات').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setSelectedCategory(tab.id); setCurrentPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: selectedCategory === tab.id ? '1px solid #1e3a8a' : '1px solid #e5e7eb',
                background: selectedCategory === tab.id ? '#1e3a8a' : '#ffffff',
                color: selectedCategory === tab.id ? '#ffffff' : '#4b5563',
                fontWeight: selectedCategory === tab.id ? 'bold' : 'normal',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: selectedCategory === tab.id ? '#ffffff33' : '#f3f4f6',
                color: selectedCategory === tab.id ? '#ffffff' : '#6b7280',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="البحث برقم اللوحة، رقم الهيكل VIN، نوع المركبة، اسم المستلم، أو جهة العمل..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 40px 10px 14px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => { setSelectedDepartment(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="الكل">كافة الأقسام والمراكز ({departmentsList.length})</option>
              {departmentsList.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="الكل">كافة الحالات التشغيلية</option>
              <option value="جاهزة للعمل">جاهزة للعمل</option>
              <option value="عاطلة">عاطلة</option>
              <option value="حادث سير / في الصيانة">حادث سير / في الصيانة</option>
            </select>
          </div>

          {/* Fuel Filter */}
          <div>
            <select
              value={selectedFuel}
              onChange={(e) => { setSelectedFuel(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '13px',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="الكل">كافة أنواع الوقود</option>
              <option value="بنزين">بنزين</option>
              <option value="ديزل">ديزل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-panel-card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#374151' }}>
            النتائج المعروضة: <span style={{ color: '#1e3a8a' }}>{filteredVehicles.length}</span> من أصل <span style={{ color: '#6b7280' }}>{vehicles.length}</span> آلية
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280' }}>
            <span>عرض في الصفحة:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '12px' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#ffffff', fontWeight: 'bold' }}>
                <th style={{ padding: '12px 14px', width: '50px' }}>ر.م</th>
                <th style={{ padding: '12px 14px', width: '130px' }}>رقم اللوحة</th>
                <th style={{ padding: '12px 14px' }}>نوع وطراز المركبة</th>
                <th style={{ padding: '12px 14px', width: '70px' }}>الموديل</th>
                <th style={{ padding: '12px 14px' }}>رقم الهيكل (VIN)</th>
                <th style={{ padding: '12px 14px' }}>جهة العمل المسلمة لها</th>
                <th style={{ padding: '12px 14px' }}>المستلم / المسؤول</th>
                <th style={{ padding: '12px 14px', width: '80px' }}>الوقود</th>
                <th style={{ padding: '12px 14px', width: '120px' }}>الحالة</th>
                <th style={{ padding: '12px 14px', width: '160px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    <Car size={40} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                    <p style={{ fontWeight: 'bold', fontSize: '15px' }}>لا توجد آليات مطابقة لمعايير البحث الحالية</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>جرب تعديل خيارات الفلترة أو تفريغ خانة البحث</p>
                  </td>
                </tr>
              ) : (
                paginatedVehicles.map((vehicle, idx) => {
                  const globalIdx = (currentPage - 1) * itemsPerPage + idx + 1;
                  const isCustody = vehicle.category === 'سيارة عهدة شخصية';
                  const isBroken = vehicle.status === 'عاطلة';
                  const isAccident = vehicle.status.includes('حادث') || vehicle.status.includes('صيانة');

                  return (
                    <tr
                      key={vehicle.id}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#fcfcfd'}
                    >
                      {/* Record No */}
                      <td style={{ padding: '12px 14px', color: '#6b7280', fontWeight: 'bold' }}>
                        {vehicle.record_no || globalIdx}
                      </td>

                      {/* Plate Number with Police Badge Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#f8fafc',
                          border: '2px solid #0284c7',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontWeight: '800',
                          color: '#0f172a',
                          fontSize: '13px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          <span style={{ color: '#0284c7', fontSize: '10px', borderLeft: '1px solid #cbd5e1', paddingLeft: '5px' }}>ليبيا</span>
                          <span>{vehicle.plate_number}</span>
                        </div>
                      </td>

                      {/* Vehicle Type & Category */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                          {vehicle.vehicle_type}
                        </div>
                        <div style={{ fontSize: '11px', color: isCustody ? '#b45309' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {isCustody ? <User size={12} /> : <Building2 size={12} />}
                          <span>{vehicle.category}</span>
                        </div>
                      </td>

                      {/* Model Year */}
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#475569' }}>
                        {vehicle.model_year || '—'}
                      </td>

                      {/* Chassis Number VIN with Quick Copy */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            background: '#f1f5f9',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            color: '#334155'
                          }}>
                            {vehicle.chassis_number || 'غير مسجل'}
                          </span>
                          {vehicle.chassis_number && (
                            <button
                              onClick={() => handleCopyChassis(vehicle.chassis_number, vehicle.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === vehicle.id ? '#10b981' : '#94a3b8' }}
                              title="نسخ رقم الهيكل"
                            >
                              {copiedId === vehicle.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                          {vehicle.department || 'ديوان المديرية'}
                        </span>
                      </td>

                      {/* Custodian */}
                      <td style={{ padding: '12px 14px' }}>
                        {vehicle.custodian_name ? (
                          <div>
                            <span style={{ fontWeight: '700', color: '#1e293b' }}>{vehicle.custodian_name}</span>
                            {vehicle.custodian_rank && (
                              <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>
                                ({vehicle.custodian_rank})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>عهدة القسم المباشر</span>
                        )}
                      </td>

                      {/* Fuel Type */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: vehicle.fuel_type === 'ديزل' ? '#fef3c7' : '#e0f2fe',
                          color: vehicle.fuel_type === 'ديزل' ? '#92400e' : '#0369a1'
                        }}>
                          {vehicle.fuel_type || 'بنزين'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '14px',
                          fontSize: '11px',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isBroken ? '#fee2e2' : isAccident ? '#fef3c7' : '#dcfce7',
                          color: isBroken ? '#991b1b' : isAccident ? '#92400e' : '#166534'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: isBroken ? '#dc2626' : isAccident ? '#d97706' : '#16a34a'
                          }} />
                          {vehicle.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedVehicleForView(vehicle)}
                            style={{
                              background: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                            title="عرض بطاقة الآلية الأمنية"
                          >
                            <Eye size={13} />
                            <span>بطاقة</span>
                          </button>

                          <button
                            onClick={() => setSelectedVehicleForHandover(vehicle)}
                            style={{
                              background: '#eff6ff',
                              color: '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold'
                            }}
                            title="محضر تسليم واستلام عهدة"
                          >
                            <FileCheck size={13} />
                            <span>محضر</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(vehicle)}
                            style={{
                              background: '#fefce8',
                              color: '#854d0e',
                              border: '1px solid #fef08a',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer'
                            }}
                            title="تعديل بيانات المركبة"
                          >
                            <Edit size={13} />
                          </button>

                          <button
                            onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate_number)}
                            style={{
                              background: '#fef2f2',
                              color: '#991b1b',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              cursor: 'pointer'
                            }}
                            title="حذف من السجل"
                          >
                            <Trash2 size={13} />
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
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff'
          }}>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>
              الصفحة <strong>{currentPage}</strong> من إجمالي <strong>{totalPages}</strong> صفحات
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: currentPage === 1 ? '#f3f4f6' : '#ffffff',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <ChevronRight size={14} />
                <span>السابق</span>
              </button>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: currentPage === totalPages ? '#f3f4f6' : '#ffffff',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <span>التالي</span>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          1. Modal: View Vehicle Inspection Card (بطاقة الآلية الأمنية)
          ══════════════════════════════════════════════════════════════ */}
      {selectedVehicleForView && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVehicleForView(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10500,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: 'min(90vh, 740px)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              border: '2px solid #1e3a8a',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Fixed at top) */}
            <div style={{
              flex: '0 0 auto',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #d97706'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: '#d97706', padding: '8px', borderRadius: '8px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Car size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>بطاقة قيد الآلية الأمنية الرسمية</h3>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>وزارة الداخلية - مديرية أمن أوباري | قسم الخدمات والمركبات</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicleForView(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="إغلاق النافذة (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: '20px'
            }}>
              {/* Plate Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc',
                border: '2px solid #0284c7',
                borderRadius: '12px',
                padding: '12px 18px',
                marginBottom: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>رقم لوحة الآلية:</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', letterSpacing: '1px', marginTop: '2px' }}>
                    {selectedVehicleForView.plate_number} <span style={{ fontSize: '15px', color: '#0284c7' }}>/ شرطة ليبيا</span>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: selectedVehicleForView.status === 'جاهزة للعمل' ? '#166534' : '#991b1b',
                    fontWeight: 'bold',
                    background: selectedVehicleForView.status === 'جاهزة للعمل' ? '#dcfce7' : '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginTop: '4px'
                  }}>
                    <span>●</span>
                    <span>{selectedVehicleForView.status}</span>
                  </div>
                </div>

                {qrCodeUrl && (
                  <div style={{ textAlign: 'center', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <img src={qrCodeUrl} alt="QR Code" style={{ width: '75px', height: '75px', display: 'block' }} />
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px', fontWeight: 'bold' }}>رمز التحقق الأمني</div>
                  </div>
                )}
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>نوع وطراز المركبة:</span>
                  <strong style={{ color: '#1e293b', fontSize: '13px' }}>{selectedVehicleForView.vehicle_type}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>سنة الصنع / الموديل:</span>
                  <strong style={{ color: '#1e293b', fontSize: '13px' }}>{selectedVehicleForView.model_year || '—'}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>رقم الهيكل (VIN):</span>
                  <strong style={{ color: '#1e293b', fontFamily: 'monospace', fontSize: '12px' }}>{selectedVehicleForView.chassis_number || 'غير متوفر'}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>نوع الوقود المشغل:</span>
                  <strong style={{ color: '#1e293b', fontSize: '13px' }}>{selectedVehicleForView.fuel_type || 'بنزين'}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>جهة العمل المسلمة لها:</span>
                  <strong style={{ color: '#1e3a8a', fontSize: '14px' }}>{selectedVehicleForView.department}</strong>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px', marginBottom: '2px' }}>المستلم والمسؤول عن العهدة:</span>
                  <strong style={{ color: '#1e293b', fontSize: '14px' }}>
                    {selectedVehicleForView.custodian_name || 'عهدة القسم المباشر'}
                    {selectedVehicleForView.custodian_rank ? ` (${selectedVehicleForView.custodian_rank})` : ''}
                  </strong>
                </div>

                {selectedVehicleForView.notes && (
                  <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: '8px', border: '1px solid #fef3c7', gridColumn: 'span 2' }}>
                    <span style={{ color: '#b45309', display: 'block', fontSize: '11px', marginBottom: '2px', fontWeight: 'bold' }}>ملاحظات القيادة والتشغيل:</span>
                    <span style={{ color: '#78350f', fontSize: '12px' }}>{selectedVehicleForView.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div style={{
              flex: '0 0 auto',
              background: '#f8fafc',
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                type="button"
                onClick={() => handlePrintVehicleCard(selectedVehicleForView)}
                className="btn-official-secondary"
              >
                <Printer size={16} />
                <span>طباعة البطاقة (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVehicleForView(null)}
                className="btn-official-primary"
                style={{ minWidth: '120px' }}
              >
                <span>إغلاق النافذة (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          2. Modal: Vehicle Custody Handover Report (محضر تسليم واستلام عهدة مركبة)
          ══════════════════════════════════════════════════════════════ */}
      {selectedVehicleForHandover && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVehicleForHandover(null);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10500,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '780px',
              maxHeight: 'min(90vh, 800px)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              border: '2px solid #b45309',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handover Modal Header */}
            <div style={{
              flex: '0 0 auto',
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #d97706'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={22} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  محضر تسليم واستلام عهدة مركبة رسمية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVehicleForHandover(null)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="إغلاق (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Document Body for Print (Scrollable) */}
            <div id="handover-document" style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              padding: '24px',
              fontSize: '13px',
              lineHeight: 1.8,
              color: '#1e293b'
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '14px', marginBottom: '18px' }}>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#1e3a8a' }}>دولة ليبيا - وزارة الداخلية</div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>مديرية أمن أوباري | قسم الخدمات والمركبات</div>
                <div style={{ fontSize: '13px', color: '#b45309', fontWeight: 'bold', marginTop: '4px' }}>
                  محضر تسليم عهدة آلية شرطية رقم: MOI-UBR-{selectedVehicleForHandover.plate_number}-2026
                </div>
              </div>

              {/* Legal Text */}
              <p style={{ textAlign: 'justify', marginBottom: '14px' }}>
                إنه في يوم <strong>{new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>،
                وبناءً على تعليمات السيد مدير أمن أوباري وبإشراف السيد رئيس قسم الخدمات والمركبات، تم تسليم الآلية المبينة بياناتها أدناه بصفة عهدة رسمية:
              </p>

              {/* Table of Vehicle Specs */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px', border: '1px solid #cbd5e1' }}>
                <tbody>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', width: '25%' }}>رقم اللوحة:</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: '900', color: '#0284c7' }}>{selectedVehicleForHandover.plate_number} (شرطة)</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', width: '25%' }}>نوع وطراز المركبة:</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>{selectedVehicleForHandover.vehicle_type}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>سنة الصنع (الموديل):</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>{selectedVehicleForHandover.model_year || '—'}</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>رقم الهيكل (VIN):</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontFamily: 'monospace' }}>{selectedVehicleForHandover.chassis_number || 'غير مدون'}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>الجهة المسلمة لها:</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', color: '#1e3a8a', fontWeight: 'bold' }}>{selectedVehicleForHandover.department}</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>نوع الوقود:</td>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1' }}>{selectedVehicleForHandover.fuel_type || 'بنزين'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>المستلم المفوض:</td>
                    <td colSpan={3} style={{ padding: '8px 12px', border: '1px solid #cbd5e1', fontWeight: 'bold', color: '#0f172a' }}>
                      {selectedVehicleForHandover.custodian_name || 'رئيس القسم / المركز'}
                      {selectedVehicleForHandover.custodian_rank ? ` (${selectedVehicleForHandover.custodian_rank})` : ''}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Obligation Clause */}
              <div style={{ background: '#f1f5f9', padding: '12px 14px', borderRadius: '8px', borderRight: '4px solid #1e3a8a', marginBottom: '20px' }}>
                <strong>إقرار وتعهد المستلم:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155' }}>
                  أقر أنا المستلم الموقع أدناه بأنني استلمت الآلية المذكورة أعلاه بحالة فنية صالحة وجيدة للاستعمال الأمني،
                  وأتعهد بالمحافظة التامة عليها وصيانتها الدورية واستخدامها في الأغراض الأمنية المخصصة لها فقط دون سواها،
                  وإرجاعها لقسم الخدمات والمركبات عند انتهاء المهام أو نقل العمل، وفقاً للقوانين واللوائح المعمول بها بوزارة الداخلية.
                </p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center', marginTop: '20px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>المستلم للعهدة</div>
                  <div style={{ marginTop: '30px', borderBottom: '1px dashed #94a3b8', paddingBottom: '4px', fontWeight: 'bold' }}>
                    {selectedVehicleForHandover.custodian_name || '................................'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>التوقيع والختم</div>
                </div>

                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>رئيس قسم الخدمات والمركبات</div>
                  <div style={{ marginTop: '30px', borderBottom: '1px dashed #94a3b8', paddingBottom: '4px', fontWeight: 'bold' }}>
                    عميد / حامد علي عبدالرحمن
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>التوقيع والختم الرسمي</div>
                </div>

                <div>
                  <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>يعتمد / مدير أمن أوباري</div>
                  <div style={{ marginTop: '30px', borderBottom: '1px dashed #94a3b8', paddingBottom: '4px', fontWeight: 'bold' }}>
                    سيادة اللواء مدير الأمن
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ختم الإدارة العامة</div>
                </div>
              </div>
            </div>

            {/* Actions (Fixed at bottom) */}
            <div style={{
              flex: '0 0 auto',
              background: '#f8fafc',
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => handlePrintHandoverReport(selectedVehicleForHandover)}
                className="btn-official-primary"
              >
                <Printer size={16} />
                <span>طباعة المحضر الرسمي (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedVehicleForHandover(null)}
                className="btn-official-secondary"
              >
                <span>إغلاق (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          3. Modal: Add / Edit Vehicle
          ══════════════════════════════════════════════════════════════ */}
      {isAddEditModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddEditModalOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10500,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: 'min(90vh, 760px)',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              border: '2px solid #1e3a8a',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Fixed at top) */}
            <div style={{
              flex: '0 0 auto',
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #d97706'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Car size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  {editingVehicle ? 'تعديل بيانات الآلية الأمنية' : 'إدراج آلية / مركبة جديدة بالقوة العمومية'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="إغلاق (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveVehicle} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', overflow: 'hidden' }}>
              <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  {/* Plate */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      رقم اللوحة / المركبة: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: 31680"
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      نوع وطراز المركبة: *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تويوتا مزدوجة رباعي"
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      تصنيف الآلية:
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="سيارة مراكز وأقسام">سيارة مراكز وأقسام</option>
                      <option value="سيارة عهدة شخصية">سيارة عهدة شخصية</option>
                      <option value="دراجة نارية شرطية">دراجة نارية شرطية</option>
                      <option value="حافلة نقل وشاحنة خدمات">حافلة نقل وشاحنة خدمات</option>
                    </select>
                  </div>

                  {/* Model Year */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      سنة الصنع / الموديل:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: 2024"
                      value={formData.model_year}
                      onChange={(e) => setFormData({ ...formData, model_year: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Chassis VIN */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      رقم الهيكل (Chassis / VIN):
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: DERJ 030399"
                      value={formData.chassis_number}
                      onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', fontFamily: 'monospace' }}
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      جهة العمل المسلمة لها:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: قسم شرطة النجدة"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      الحالة التشغيلية:
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="جاهزة للعمل">جاهزة للعمل</option>
                      <option value="عاطلة">عاطلة</option>
                      <option value="حادث سير / في الصيانة">حادث سير / في الصيانة</option>
                    </select>
                  </div>

                  {/* Custodian Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      المستلم / المسؤول عن العهدة:
                    </label>
                    <input
                      type="text"
                      placeholder="اسم الضابط أو المسؤول"
                      value={formData.custodian_name}
                      onChange={(e) => setFormData({ ...formData, custodian_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Custodian Rank */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      الرتبة / الصفة:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: لواء، عميد، عقيد، موظف"
                      value={formData.custodian_rank}
                      onChange={(e) => setFormData({ ...formData, custodian_rank: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                    />
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      نوع الوقود:
                    </label>
                    <select
                      value={formData.fuel_type}
                      onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="بنزين">بنزين</option>
                      <option value="ديزل">ديزل</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
                      ملاحظات وبيان الاستلام:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="أية ملاحظات إضافية تتعلق بحالة الآلية أو موقعها..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              {/* Form buttons (Fixed at bottom) */}
              <div style={{
                flex: '0 0 auto',
                background: '#f8fafc',
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="btn-official-secondary"
                >
                  إلغاء (Esc)
                </button>
                <button
                  type="submit"
                  className="btn-official-primary"
                >
                  <span>{editingVehicle ? 'حفظ التعديلات' : 'إدراج الآلية'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          4. Full Printable Official Fleet Statement (كشف حصر القوة الآلية بالكامل)
          ══════════════════════════════════════════════════════════════ */}
      {isPrintAllOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPrintAllOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 25, 47, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10500,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '960px',
              maxHeight: 'min(92vh, 850px)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5)',
              border: '2px solid #1e3a8a'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              flex: '0 0 auto',
              background: '#1e3a8a',
              color: '#ffffff',
              padding: '14px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '3px solid #d97706'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Printer size={20} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  معاينة كشف بيان القوة العمومية للآليات وتوزيعها (مديرية أمن أوباري)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintAllOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                title="إغلاق (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div id="printable-vehicles-roster" style={{ flex: '1 1 auto', padding: '24px', overflowY: 'auto', fontSize: '12px' }}>
              {/* Official Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ fontSize: '17px', fontWeight: '900', color: '#1e3a8a' }}>دولة ليبيا - وزارة الداخلية</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>مديرية أمن أوباري | قسم الخدمات والمركبات</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#b45309', marginTop: '4px' }}>
                  بيان القوة العمومية للآليات والسيارات الرسمية وآلية توزيعها
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  تاريخ استخراج الكشف: {new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Summary Stats Box */}
              <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8fafc', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold', fontSize: '12px' }}>
                <div>إجمالي الآليات: <span style={{ color: '#1e3a8a' }}>{stats.total}</span></div>
                <div>سيارات العهد: <span style={{ color: '#b45309' }}>{stats.custody}</span></div>
                <div>المراكز والأقسام: <span style={{ color: '#2563eb' }}>{stats.department}</span></div>
                <div>الدراجات النارية: <span style={{ color: '#7c3aed' }}>{stats.motorcycles}</span></div>
                <div>الحالة الجاهزة: <span style={{ color: '#059669' }}>{stats.active}</span></div>
                <div>عاطلة / صيانة: <span style={{ color: '#dc2626' }}>{stats.outOfService}</span></div>
              </div>

              {/* Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', textAlign: 'right' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderBottom: '2px solid #0f172a' }}>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '35px' }}>ر.م</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '80px' }}>رقم المركبة</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>نوع المركبة</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '55px' }}>الموديل</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>رقم الهيكل (VIN)</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>جهة العمل المسلمة لها</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1' }}>المستلم / العهدة</th>
                    <th style={{ padding: '8px', border: '1px solid #cbd5e1', width: '70px' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, i) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #cbd5e1', background: i % 2 === 0 ? '#fff' : '#fcfcfd' }}>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}>{v.record_no || i + 1}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{v.plate_number}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{v.vehicle_type}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>{v.model_year || '—'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '11px' }}>{v.chassis_number || '—'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{v.department}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1' }}>{v.custodian_name || 'عهد المراكز'}</td>
                      <td style={{ padding: '6px 8px', border: '1px solid #cbd5e1', fontSize: '11px', textAlign: 'center' }}>{v.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Signature Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', padding: '0 20px', textAlign: 'center', fontWeight: 'bold' }}>
                <div>
                  <div>مسؤول سجل الآليات</div>
                  <div style={{ marginTop: '25px' }}>.............................</div>
                </div>
                <div>
                  <div>رئيس قسم الخدمات والمركبات</div>
                  <div style={{ marginTop: '25px' }}>عميد / حامد علي عبدالرحمن</div>
                </div>
                <div>
                  <div>يعتمد / مدير أمن أوباري</div>
                  <div style={{ marginTop: '25px' }}>.............................</div>
                </div>
              </div>
            </div>

            {/* Footer (Fixed at bottom) */}
            <div style={{
              flex: '0 0 auto',
              background: '#f8fafc',
              padding: '12px 20px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('printable-vehicles-roster');
                  if (el) {
                    printDocumentInIframe(el.outerHTML, 'كشف_الآليات_والمركبات_أوباري');
                  } else {
                    window.print();
                  }
                }}
                className="btn-official-primary"
              >
                <Printer size={16} />
                <span>طباعة الكشف كاملاً</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPrintAllOpen(false)}
                className="btn-official-secondary"
              >
                <span>إغلاق (Esc)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
