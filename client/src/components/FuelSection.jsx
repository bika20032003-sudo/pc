import React, { useState, useEffect, useMemo } from 'react';
import {
  Fuel,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  QrCode,
  Download,
  FileSpreadsheet,
  Car,
  Filter,
  FileText
} from 'lucide-react';
import initialFuelData from '../data/fuel_data.json';
import vehiclesData from '../data/vehicles_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { apiFetch } from '../utils/apiClient';
import * as XLSX from 'xlsx';

export default function FuelSection({ user, forceMembers = [] }) {
  const [fuelData, setFuelData] = useState(() => {
    const saved = localStorage.getItem('ubari_fuel_data');
    return saved ? JSON.parse(saved) : initialFuelData;
  });

  const [registeredVehicles, setRegisteredVehicles] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_vehicles_data');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
    return vehiclesData;
  });

  // Sync real fuel state and vehicles fleet from SQLite backend
  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/fuel')
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (isMounted && json?.success && json.data) {
          setFuelData(json.data);
          try {
            localStorage.setItem('ubari_fuel_data', JSON.stringify(json.data));
          } catch (_) {}
        }
      })
      .catch(() => {});

    apiFetch('/api/vehicles')
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (isMounted && json?.success && Array.isArray(json.data) && json.data.length > 0) {
          setRegisteredVehicles(json.data);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  // State for Inbound Shipment
  const [shipmentForm, setShipmentForm] = useState({
    station: 'المحطة الرئيسية',
    fuel_type: 'بنزين 95 ممتاز',
    quantity: '',
    supplier: 'مستودع سبها النفطي - شحنة رقم '
  });

  // State for Dispense
  const [dispenseForm, setDispenseForm] = useState({
    station: 'المحطة الرئيسية',
    selected_vehicle_id: '',
    plate_number: '',
    driver_name: '',
    vehicle_type: '',
    fuel_type: 'بنزين',
    liters: '',
    odometer: '',
    is_external: false,
    notes: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ubari_fuel_data', JSON.stringify(fuelData));
  }, [fuelData]);

  // Handle Quick Select Registered Directorate Vehicle
  const handleSelectRegisteredVehicle = (e) => {
    const vId = e.target.value;
    if (!vId) {
      setDispenseForm((prev) => ({
        ...prev,
        selected_vehicle_id: '',
        plate_number: '',
        driver_name: '',
        vehicle_type: '',
        fuel_type: 'بنزين'
      }));
      return;
    }

    const matched = registeredVehicles.find((v) => String(v.id) === String(vId));
    if (matched) {
      setDispenseForm((prev) => ({
        ...prev,
        selected_vehicle_id: vId,
        plate_number: matched.plate_number || '',
        vehicle_type: matched.vehicle_type || '',
        driver_name: matched.custodian_name || matched.department || '',
        fuel_type: matched.fuel_type || 'بنزين',
        is_external: false
      }));
    }
  };

  // Handle Add Inbound Shipment (synced with SQLite)
  const handleAddShipment = async (e) => {
    e.preventDefault();
    const qty = Number(shipmentForm.quantity);
    if (!qty || qty <= 0) {
      alert('يرجى إدخال كمية صحيحة باللتر');
      return;
    }

    const payload = {
      station: shipmentForm.station,
      fuel_type: shipmentForm.fuel_type,
      quantity: qty,
      supplier: shipmentForm.supplier.trim() || 'مستودع سبها النفطي',
      date: new Date().toISOString().slice(0, 10)
    };

    try {
      const res = await apiFetch('/api/fuel/shipment', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json.data) {
          setFuelData(json.data);
          setShipmentForm({
            station: 'المحطة الرئيسية',
            fuel_type: 'بنزين 95 ممتاز',
            quantity: '',
            supplier: 'مستودع سبها النفطي - شحنة رقم '
          });
          alert(`✅ تم إيداع الشحنة (${qty.toLocaleString('ar-LY')} لتر) وحفظها في قاعدة البيانات المركزية!`);
          return;
        }
      }
    } catch (_) {}

    const newShipment = { id: Date.now(), ...payload };
    setFuelData((prev) => ({
      ...prev,
      main_balance: shipmentForm.station === 'المحطة الرئيسية' ? prev.main_balance + qty : prev.main_balance,
      sub_balance: shipmentForm.station === 'المحطة الفرعية' ? prev.sub_balance + qty : prev.sub_balance,
      shipments: [newShipment, ...prev.shipments]
    }));

    setShipmentForm({
      station: 'المحطة الرئيسية',
      fuel_type: 'بنزين 95 ممتاز',
      quantity: '',
      supplier: 'مستودع سبها النفطي - شحنة رقم '
    });
    alert(`✅ تم إيداع الشحنة (${qty.toLocaleString('ar-LY')} لتر) في خزان ${shipmentForm.station} بنجاح!`);
  };

  // Handle Dispense (synced atomically with SQLite)
  const handleDispense = async (e) => {
    e.preventDefault();
    const liters = Number(dispenseForm.liters);
    if (!liters || liters <= 0) {
      alert('يرجى تحديد كمية الوقود المنصرفة باللتر');
      return;
    }

    // Check balance
    const currentBalance = dispenseForm.station === 'المحطة الرئيسية' ? fuelData.main_balance : fuelData.sub_balance;
    if (liters > currentBalance) {
      alert(`الرصيد المتاح في ${dispenseForm.station} (${currentBalance.toLocaleString('ar-LY')} لتر) لا يكفي لصرف ${liters.toLocaleString('ar-LY')} لتر!`);
      return;
    }

    const dispensePayload = {
      station: dispenseForm.station,
      plate_number: dispenseForm.plate_number.trim() || 'بدون لوحة',
      driver_name: dispenseForm.driver_name.trim() || 'سائق الدورية',
      vehicle_type: dispenseForm.vehicle_type.trim() || 'مركبة أمنية',
      fuel_type: dispenseForm.fuel_type || 'بنزين',
      liters,
      odometer: Number(dispenseForm.odometer) || 0,
      is_external: dispenseForm.is_external,
      notes: dispenseForm.notes || ''
    };

    try {
      const res = await apiFetch('/api/fuel/dispense', {
        method: 'POST',
        body: JSON.stringify(dispensePayload)
      });
      if (res.status !== 404) {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          alert(json?.message || 'تعذر تنفيذ عملية الصرف على الخادم');
          return;
        }
        if (json?.success && json.data) {
          setFuelData(json.data);
          setDispenseForm({
            station: 'المحطة الرئيسية',
            selected_vehicle_id: '',
            plate_number: '',
            driver_name: '',
            vehicle_type: '',
            fuel_type: 'بنزين',
            liters: '',
            odometer: '',
            is_external: false,
            notes: ''
          });
          alert(`✅ تم صرف الوقود (${liters} لتر) وتوليد إذن الصرف المعتمد رقم: ${json.transaction?.voucher_no}`);
          return;
        }
      }
    } catch (_) {}

    const newTx = {
      id: Date.now(),
      voucher_no: `FUEL-${new Date().getFullYear()}-${String((fuelData.transactions?.length || 0) + 1).padStart(4, '0')}`,
      ...dispensePayload,
      date: new Date().toISOString()
    };

    setFuelData((prev) => ({
      ...prev,
      main_balance: dispenseForm.station === 'المحطة الرئيسية' ? prev.main_balance - liters : prev.main_balance,
      sub_balance: dispenseForm.station === 'المحطة الفرعية' ? prev.sub_balance - liters : prev.sub_balance,
      total_consumed: prev.total_consumed + liters,
      transactions: [newTx, ...prev.transactions]
    }));

    setDispenseForm({
      station: 'المحطة الرئيسية',
      selected_vehicle_id: '',
      plate_number: '',
      driver_name: '',
      vehicle_type: '',
      fuel_type: 'بنزين',
      liters: '',
      odometer: '',
      is_external: false,
      notes: ''
    });

    alert(`✅ تم صرف الوقود (${liters} لتر) للآلية بنجاح وتوليد إذن الصرف رقم: ${newTx.voucher_no}`);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return fuelData.transactions.filter((tx) => {
      const matchSearch =
        tx.plate_number?.includes(searchTerm) ||
        tx.driver_name?.includes(searchTerm) ||
        tx.vehicle_type?.includes(searchTerm) ||
        tx.voucher_no?.includes(searchTerm);

      const matchStation = filterStation === 'all' || tx.station === filterStation;

      if (!matchSearch || !matchStation) return false;

      if (filterDateRange === 'today') {
        const txDate = new Date(tx.date).toDateString();
        const today = new Date().toDateString();
        return txDate === today;
      }

      if (filterDateRange === 'week') {
        const txTime = new Date(tx.date).getTime();
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return txTime >= weekAgo;
      }

      return true;
    });
  }, [fuelData.transactions, searchTerm, filterStation, filterDateRange]);

  // Export to Excel
  const handleExportExcel = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }

    const rows = filteredTransactions.map((tx, idx) => ({
      'م': idx + 1,
      'رقم الإذن': tx.voucher_no || `FUEL-${tx.id}`,
      'المحطة': tx.station,
      'رقم لوحة الآلية': tx.plate_number,
      'نوع وطراز الآلية': tx.vehicle_type,
      'اسم السائق / الدورية': tx.driver_name,
      'نوع الوقود': tx.fuel_type || 'بنزين',
      'الكمية المصروفة (لتر)': tx.liters,
      'قراءة العداد (كم)': tx.odometer || '---',
      'نوع الصرف': tx.is_external ? 'استثنائي (خارجي)' : 'نظامي معتمد',
      'تاريخ وساعة الصرف': new Date(tx.date).toLocaleString('ar-LY')
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'سجل صرف المحروقات');
    XLSX.writeFile(wb, `سجل_محروقات_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Print Single Transaction Fuel Voucher (إذن صرف محروقات رسمي)
  const handlePrintVoucher = (tx) => {
    const printHtml = `
      <div style="width: 100%; max-width: 640px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a; padding: 15px; border: 2px solid #1e3a8a; border-radius: 12px;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 14px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 14px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">قسم الآليات والمحروقات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Fuel Dispense Slip</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 17px; font-weight: 900; color: #1e3a8a; text-decoration: underline;">
            إذن صرف محروقات رسمي (مركبة أمنية)
          </h2>
          <div style="font-size: 12px; font-weight: 800; color: #d4af37; margin-top: 4px;">
            رقم الإذن: ${tx.voucher_no || `FUEL-${tx.id}`}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12.5px; margin-bottom: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569; width: 25%;">محطة الصرف:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a; width: 25%;">${tx.station}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569; width: 25%;">تاريخ وساعة الصرف:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #0f172a; width: 25%;">${new Date(tx.date).toLocaleString('ar-LY')}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">رقم لوحة الآلية:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #0284c7; font-size: 14px;">${tx.plate_number}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">نوع وطراز الآلية:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #334155;">${tx.vehicle_type}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">السائق / المستلم:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a;">${tx.driver_name}</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">قراءة العداد الحالية:</td>
            <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${tx.odometer ? `${tx.odometer} كم` : '---'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">الكمية المصروفة:</td>
            <td style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626; font-size: 16px;">${tx.liters} لتر</td>
            <td style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #475569;">نوع المحروقات:</td>
            <td style="padding: 10px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #15803d;">${tx.fuel_type || 'بنزين 95 ممتاز'}</td>
          </tr>
        </table>

        <div style="margin-bottom: 20px; font-size: 11.5px; color: #64748b; background: #eff6ff; padding: 8px 12px; border-radius: 6px; border: 1px solid #bfdbfe;">
          تنبيه: يصرف الوقود للآليات الأمنية لتأدية المهام الرسمية والدوريات المكلفة فقط ويحظر استخدامه في غير الأغراض المخصصة.
        </div>

      </div>
    `;

    printDocumentInIframe(printHtml, `إذن صرف وقود ${tx.voucher_no || tx.plate_number}`);
  };

  // Print Complete Fuel Ledger Report (تقرير شامل)
  const handlePrintFuelReport = () => {
    const printHtml = `
      <div style="width: 100%; max-width: 760px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 8px; margin-bottom: 12px;">
          <tr>
            <td style="text-align: right; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: 900; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">لجنة إدارة ومتابعة المحروقات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Fuel Logistics Report</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            تقرير الموقف اللوجستي لمخزون واستهلاك المحروقات
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 3px;">
            تاريخ وساعة التقرير: ${new Date().toLocaleString('ar-LY')}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12px; margin-bottom: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 33%;">رصيد المحطة الرئيسية (لتر):</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 33%;">رصيد المحطة الفرعية (لتر):</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; color: #64748b; width: 33%;">إجمالي المنصرف التراكمي (لتر):</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #15803d; font-size: 16px;">${fuelData.main_balance.toLocaleString('ar-LY')} لتر</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #0284c7; font-size: 16px;">${fuelData.sub_balance.toLocaleString('ar-LY')} لتر</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626; font-size: 16px;">${fuelData.total_consumed.toLocaleString('ar-LY')} لتر</td>
          </tr>
        </table>

        <h3 style="font-size: 12px; margin: 10px 0 6px 0; color: #1e3a8a;">أحدث عمليات صرف الوقود للمركبات:</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">رقم الإذن</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">المحطة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">رقم اللوحة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الآلية والسائق</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الكمية (لتر)</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">العداد</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">تاريخ الصرف</th>
            </tr>
          </thead>
          <tbody>
            ${filteredTransactions.slice(0, 15).map((t, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 10px;">${t.voucher_no || `FUEL-${t.id}`}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.station}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: 900; color: #0284c7;">${t.plate_number}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${t.vehicle_type} (${t.driver_name})</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626;">${t.liters} لتر</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace;">${t.odometer || '---'} كم</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-size: 10px;">${new Date(t.date).toLocaleString('ar-LY')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

      </div>
    `;

    printDocumentInIframe(printHtml, 'موقف محروقات مديرية أمن أوباري');
  };

  return (
    <div className="fuel-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div
        className="module-view-header"
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
            }}
          >
            <Fuel size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
              محطة وقود المديرية (إدارة المحروقات)
            </h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
              المتابعة الدقيقة لرصيد الخزانات، توريد شحنات سبها، وصرف حصص الوقود لمركبات ودوريات المديرية
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleExportExcel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid #86efac',
              background: '#f0fdf4',
              color: '#15803d',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={16} />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={handlePrintFuelReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: '1px solid #1e3a8a',
              background: '#1e3a8a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)'
            }}
          >
            <Printer size={16} />
            <span>طباعة الموقف اللوجستي (A4)</span>
          </button>
        </div>
      </div>

      {/* KPI Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px 22px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #16a34a', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>⛽ رصيد المحطة الرئيسية (بنزين)</span>
            <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>خزان 1</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', marginTop: '6px' }}>
            {fuelData.main_balance.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>لتر</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 22px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #0891b2', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>⛽ رصيد المحطة الفرعية (ديزل / بنزين)</span>
            <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>خزان 2</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0891b2', marginTop: '6px' }}>
            {fuelData.sub_balance.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>لتر</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 22px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #dc2626', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>📤 إجمالي المنصرف التراكمي</span>
            <span style={{ fontSize: '11px', background: '#fef2f2', color: '#b91c1c', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>سجل الصرف</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#dc2626', marginTop: '6px' }}>
            {fuelData.total_consumed.toLocaleString('ar-LY')} <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>لتر</span>
          </div>
        </div>
      </div>

      {/* Two Operation Boxes: 1. Inbound Shipment, 2. Dispense Fuel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Box 1: Inbound Shipment */}
        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderRight: '5px solid #1e3a8a', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} />
            <span>تسجيل شحنة محروقات واردة (إضافة رصيد)</span>
          </h3>

          <form onSubmit={handleAddShipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>تفريغ الشحنة في:</label>
                <select
                  value={shipmentForm.station}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, station: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #1e3a8a', fontWeight: 900, color: '#1e3a8a' }}
                >
                  <option value="المحطة الرئيسية">المحطة الرئيسية</option>
                  <option value="المحطة الفرعية">المحطة الفرعية</option>
                </select>
              </div>

              <div>
                <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>نوع المحروقات:</label>
                <select
                  value={shipmentForm.fuel_type}
                  onChange={(e) => setShipmentForm({ ...shipmentForm, fuel_type: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
                >
                  <option value="بنزين 95 ممتاز">بنزين 95 ممتاز</option>
                  <option value="ديزل سولار">ديزل سولار</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>الكمية الواردة باللتر:</label>
              <input
                type="number"
                required
                min="500"
                value={shipmentForm.quantity}
                onChange={(e) => setShipmentForm({ ...shipmentForm, quantity: e.target.value })}
                placeholder="مثال: 40000"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', fontWeight: 900, color: '#1e3a8a', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>المصدر أو رقم الإيصال / الشحنة:</label>
              <input
                type="text"
                value={shipmentForm.supplier}
                onChange={(e) => setShipmentForm({ ...shipmentForm, supplier: e.target.value })}
                placeholder="مستودع سبها النفطي - إيصال رقم..."
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ marginTop: '8px', padding: '11px', borderRadius: '8px', background: '#1e3a8a', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              <span>إيداع الشحنة في خزان المحطة</span>
            </button>
          </form>
        </div>

        {/* Box 2: Dispense Fuel */}
        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderRight: '5px solid #dc2626', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Fuel size={18} />
              <span>صرف وقود للمركبات والآليات</span>
            </h3>

            <label style={{ background: '#fef2f2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={dispenseForm.is_external}
                onChange={(e) => setDispenseForm({ ...dispenseForm, is_external: e.target.checked })}
              />
              <span>صرف استثنائي (آلية خارجية)</span>
            </label>
          </div>

          <form onSubmit={handleDispense} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>اختيار آلية من أسطول المديرية المسجل ({registeredVehicles.length} آلية):</label>
              <select
                value={dispenseForm.selected_vehicle_id}
                onChange={handleSelectRegisteredVehicle}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontWeight: 800, color: '#0f172a', background: '#f8fafc' }}
              >
                <option value="">-- اختيار آلية من أسطول المديرية لتعبئة البيانات تلقائياً --</option>
                {registeredVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    لوحة {v.plate_number} • {v.vehicle_type} ({v.department || v.custodian_name || 'المديرية'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>الخصم من محطة:</label>
              <select
                value={dispenseForm.station}
                onChange={(e) => setDispenseForm({ ...dispenseForm, station: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', fontWeight: 800, color: '#dc2626' }}
              >
                <option value="المحطة الرئيسية">المحطة الرئيسية</option>
                <option value="المحطة الفرعية">المحطة الفرعية</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع الوقود:</label>
              <select
                value={dispenseForm.fuel_type}
                onChange={(e) => setDispenseForm({ ...dispenseForm, fuel_type: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 800 }}
              >
                <option value="بنزين">بنزين</option>
                <option value="ديزل">ديزل</option>
              </select>
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>رقم لوحة الآلية:</label>
              <input
                type="text"
                required
                value={dispenseForm.plate_number}
                onChange={(e) => setDispenseForm({ ...dispenseForm, plate_number: e.target.value })}
                placeholder="مثال: 31595"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 900, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>نوع وطراز الآلية:</label>
              <input
                type="text"
                value={dispenseForm.vehicle_type}
                onChange={(e) => setDispenseForm({ ...dispenseForm, vehicle_type: e.target.value })}
                placeholder="مثال: هونداي ستار فيرد / تويوتا"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>اسم السائق المستلم:</label>
              <input
                type="text"
                value={dispenseForm.driver_name}
                onChange={(e) => setDispenseForm({ ...dispenseForm, driver_name: e.target.value })}
                placeholder="اسم السائق أو الدورية..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontWeight: 800, color: '#334155', display: 'block', marginBottom: '4px' }}>قراءة العداد الحالية (كم):</label>
              <input
                type="number"
                value={dispenseForm.odometer}
                onChange={(e) => setDispenseForm({ ...dispenseForm, odometer: e.target.value })}
                placeholder="كيلومتر العداد..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 800, color: '#dc2626', display: 'block', marginBottom: '4px' }}>الكمية المصروفة (لتر):</label>
              <input
                type="number"
                required
                min="5"
                max="500"
                value={dispenseForm.liters}
                onChange={(e) => setDispenseForm({ ...dispenseForm, liters: e.target.value })}
                placeholder="مثال: 60"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', fontSize: '15px', fontWeight: 900, color: '#dc2626', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ gridColumn: 'span 2', marginTop: '6px', padding: '11px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <Fuel size={16} />
              <span>تنفيذ أمر الصرف وخصم اللترات</span>
            </button>
          </form>
        </div>

      </div>

      {/* Transactions History Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>سجل عمليات صرف المحروقات</h3>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>إجمالي الحركات المعروضة: {filteredTransactions.length} حركة</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث برقم اللوحة، السائق أو الإذن..."
                style={{ padding: '7px 12px', paddingLeft: '30px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', width: '220px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>

            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 800 }}
            >
              <option value="all">كافة المحطات</option>
              <option value="المحطة الرئيسية">المحطة الرئيسية</option>
              <option value="المحطة الفرعية">المحطة الفرعية</option>
            </select>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 800 }}
            >
              <option value="all">كافة التواريخ</option>
              <option value="today">اليوم فقط</option>
              <option value="week">آخر 7 أيام</option>
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                <th style={{ padding: '10px 14px' }}>رقم الإذن</th>
                <th style={{ padding: '10px 14px' }}>المحطة</th>
                <th style={{ padding: '10px 14px' }}>رقم اللوحة</th>
                <th style={{ padding: '10px 14px' }}>نوع وطراز المركبة</th>
                <th style={{ padding: '10px 14px' }}>السائق / الدورية</th>
                <th style={{ padding: '10px 14px' }}>نوع الوقود</th>
                <th style={{ padding: '10px 14px' }}>الكمية المصروفة</th>
                <th style={{ padding: '10px 14px' }}>قراءة العداد</th>
                <th style={{ padding: '10px 14px' }}>التاريخ والساعة</th>
                <th style={{ padding: '10px 14px' }}>نوع الصرف</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                    لا توجد حركات صرف مسجلة مطابقة للبحث
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontWeight: 800, color: '#1e3a8a' }}>
                      {tx.voucher_no || `FUEL-${tx.id}`}
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 800, color: '#475569' }}>{tx.station}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 900, color: '#0284c7' }}>{tx.plate_number}</td>
                    <td style={{ padding: '10px 14px' }}>{tx.vehicle_type}</td>
                    <td style={{ padding: '10px 14px', color: '#334155', fontWeight: 700 }}>{tx.driver_name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '4px', background: tx.fuel_type === 'ديزل' ? '#fef3c7' : '#ecfdf5', color: tx.fuel_type === 'ديزل' ? '#92400e' : '#065f46', fontWeight: 800 }}>
                        {tx.fuel_type || 'بنزين'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 900, color: '#dc2626' }}>{tx.liters} لتر</td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{tx.odometer ? `${tx.odometer} كم` : '---'}</td>
                    <td style={{ padding: '10px 14px', fontSize: '11px', color: '#64748b' }}>{new Date(tx.date).toLocaleString('ar-LY')}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, background: tx.is_external ? '#fffbeb' : '#f0fdf4', color: tx.is_external ? '#b45309' : '#16a34a', border: `1px solid ${tx.is_external ? '#fde68a' : '#bbf7d0'}` }}>
                        {tx.is_external ? 'استثنائي (خارجي)' : 'نظامي معتمد'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => handlePrintVoucher(tx)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          background: '#eff6ff',
                          color: '#1e3a8a',
                          border: '1px solid #bfdbfe',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="طباعة إذن صرف رسمي لهذه الآلية"
                      >
                        <Printer size={13} />
                        <span>طباعة إذن الصرف</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
