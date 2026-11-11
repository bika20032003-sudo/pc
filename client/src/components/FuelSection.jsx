import React, { useState, useEffect } from 'react';
import { Fuel, Plus, Search, Truck, CheckCircle2, AlertTriangle, Printer, QrCode } from 'lucide-react';
import initialFuelData from '../data/fuel_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

export default function FuelSection() {
  const [fuelData, setFuelData] = useState(() => {
    const saved = localStorage.getItem('ubari_fuel_data');
    return saved ? JSON.parse(saved) : initialFuelData;
  });

  // State for Inbound Shipment
  const [shipmentForm, setShipmentForm] = useState({
    station: 'المحطة الرئيسية',
    quantity: '',
    supplier: 'مستودع سبها النفطي - شحنة رقم '
  });

  // State for Dispense
  const [dispenseForm, setDispenseForm] = useState({
    station: 'المحطة الرئيسية',
    plate_number: '',
    driver_name: '',
    vehicle_type: '',
    liters: '',
    odometer: '',
    is_external: false
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStation, setFilterStation] = useState('all');

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('ubari_fuel_data', JSON.stringify(fuelData));
  }, [fuelData]);

  // Handle Add Inbound Shipment
  const handleAddShipment = (e) => {
    e.preventDefault();
    const qty = Number(shipmentForm.quantity);
    if (!qty || qty <= 0) {
      alert('يرجى إدخال كمية صحيحة باللتر');
      return;
    }

    const newShipment = {
      id: Date.now(),
      station: shipmentForm.station,
      quantity: qty,
      supplier: shipmentForm.supplier.trim() || 'مستودع سبها النفطي',
      date: new Date().toISOString().slice(0, 10)
    };

    setFuelData(prev => ({
      ...prev,
      main_balance: shipmentForm.station === 'المحطة الرئيسية' ? prev.main_balance + qty : prev.main_balance,
      sub_balance: shipmentForm.station === 'المحطة الفرعية' ? prev.sub_balance + qty : prev.sub_balance,
      shipments: [newShipment, ...prev.shipments]
    }));

    setShipmentForm({
      station: 'المحطة الرئيسية',
      quantity: '',
      supplier: 'مستودع سبها النفطي - شحنة رقم '
    });
    alert('تم إيداع الشحنة في خزان ' + shipmentForm.station + ' بنجاح');
  };

  // Handle Dispense
  const handleDispense = (e) => {
    e.preventDefault();
    const liters = Number(dispenseForm.liters);
    if (!liters || liters <= 0) {
      alert('يرجى تحديد كمية الوقود المنصرفة باللتر');
      return;
    }

    // Check balance
    const currentBalance = dispenseForm.station === 'المحطة الرئيسية' ? fuelData.main_balance : fuelData.sub_balance;
    if (liters > currentBalance) {
      alert(`الرصيد المتاح في ${dispenseForm.station} (${currentBalance} لتر) لا يكفي لصرف ${liters} لتر!`);
      return;
    }

    const newTx = {
      id: Date.now(),
      station: dispenseForm.station,
      plate_number: dispenseForm.plate_number.trim() || 'بدون لوحة',
      driver_name: dispenseForm.driver_name.trim() || 'سائق الدورية',
      vehicle_type: dispenseForm.vehicle_type.trim() || 'مركبة أمنية',
      liters: liters,
      odometer: Number(dispenseForm.odometer) || 0,
      date: new Date().toISOString(),
      is_external: dispenseForm.is_external
    };

    setFuelData(prev => ({
      ...prev,
      main_balance: dispenseForm.station === 'المحطة الرئيسية' ? prev.main_balance - liters : prev.main_balance,
      sub_balance: dispenseForm.station === 'المحطة الفرعية' ? prev.sub_balance - liters : prev.sub_balance,
      total_consumed: prev.total_consumed + liters,
      transactions: [newTx, ...prev.transactions]
    }));

    setDispenseForm({
      station: 'المحطة الرئيسية',
      plate_number: '',
      driver_name: '',
      vehicle_type: '',
      liters: '',
      odometer: '',
      is_external: false
    });
    alert('تم صرف الوقود وقيد العملية بنجاح');
  };

  // Filter transactions
  const filteredTransactions = fuelData.transactions.filter(tx => {
    const matchSearch = tx.plate_number.includes(searchTerm) || tx.driver_name.includes(searchTerm) || tx.vehicle_type.includes(searchTerm);
    const matchStation = filterStation === 'all' || tx.station === filterStation;
    return matchSearch && matchStation;
  });

  // Print Fuel Report
  const handlePrintFuelReport = () => {
    const printHtml = `
      <div style="width: 100%; max-width: 740px; margin: 0 auto; font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #0f172a;">
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
              <div style="font-size: 9px; color: #64748b;">Fuel Operations Brief</div>
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
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #15803d; font-size: 16px;">${fuelData.main_balance.toLocaleString()} لتر</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #0284c7; font-size: 16px;">${fuelData.sub_balance.toLocaleString()} لتر</td>
            <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: 900; color: #dc2626; font-size: 16px;">${fuelData.total_consumed.toLocaleString()} لتر</td>
          </tr>
        </table>

        <h3 style="font-size: 12px; margin: 10px 0 6px 0; color: #1e3a8a;">أحدث عمليات صرف الوقود للمركبات:</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 11px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">المحطة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">رقم اللوحة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الآلية والسائق</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الكمية (لتر)</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">عداد الكيلومتر</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">تاريخ وساعة الصرف</th>
            </tr>
          </thead>
          <tbody>
            ${fuelData.transactions.slice(0, 10).map((t, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
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

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 24px; font-size: 11px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">مشرف محطة وقود المديرية</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">ملازم / بشير مصطفى التارقي</div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(printHtml, 'موقف محروقات مديرية أمن أوباري');
  };

  return (
    <div className="fuel-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}>
            <Fuel size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>محطة وقود المديرية (إدارة المحروقات)</h1>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>المتابعة الدقيقة لرصيد الخزانات، توريد شحنات سبها، وصرف الوقود للمركبات</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrintFuelReport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}
          >
            <Printer size={16} />
            <span>طباعة تقرير المحروقات (A4)</span>
          </button>
        </div>
      </div>

      {/* KPI Balances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #16a34a', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>⛽ رصيد المحطة الرئيسية (لتر)</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>{fuelData.main_balance.toLocaleString()}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #0891b2', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>⛽ رصيد المحطة الفرعية (لتر)</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#0891b2', marginTop: '4px' }}>{fuelData.sub_balance.toLocaleString()}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px 24px', borderRadius: '14px', border: '1px solid #cbd5e1', borderTop: '5px solid #dc2626', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 800 }}>📤 إجمالي المنصرف التراكمي (لتر)</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>{fuelData.total_consumed.toLocaleString()}</div>
        </div>
      </div>

      {/* Two Operation Boxes: 1. Inbound Shipment, 2. Dispense Fuel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Box 1: Inbound Shipment */}
        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderRight: '5px solid #1e3a8a', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 900, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} />
            <span>تسجيل شحنة محروقات واردة (إضافة رصيد)</span>
          </h3>

          <form onSubmit={handleAddShipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
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
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>الكمية الواردة باللتر:</label>
              <input
                type="number"
                required
                min="1000"
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
              style={{ marginTop: '8px', padding: '11px', borderRadius: '8px', background: '#1e3a8a', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer' }}
            >
              ➕ إيداع الشحنة في خزان المحطة
            </button>
          </form>
        </div>

        {/* Box 2: Dispense Fuel */}
        <div style={{ background: '#ffffff', padding: '22px', borderRadius: '14px', border: '1.5px solid #cbd5e1', borderRight: '5px solid #dc2626', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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

          <form onSubmit={handleDispense} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 800, color: '#64748b', display: 'block', marginBottom: '4px' }}>الخصم من رصيد محطة:</label>
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
                max="300"
                value={dispenseForm.liters}
                onChange={(e) => setDispenseForm({ ...dispenseForm, liters: e.target.value })}
                placeholder="مثال: 60"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #dc2626', fontSize: '15px', fontWeight: 900, color: '#dc2626', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{ gridColumn: 'span 2', marginTop: '6px', padding: '11px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', border: 'none', fontWeight: 900, cursor: 'pointer' }}
            >
              ⛽ تنفيذ أمر الصرف وخصم اللترات
            </button>
          </form>
        </div>

      </div>

      {/* Transactions History Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 18px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>سجل عمليات صرف المحروقات</h3>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث برقم اللوحة أو السائق..."
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
            />
            <select
              value={filterStation}
              onChange={(e) => setFilterStation(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 800 }}
            >
              <option value="all">كافة المحطات</option>
              <option value="المحطة الرئيسية">المحطة الرئيسية</option>
              <option value="المحطة الفرعية">المحطة الفرعية</option>
            </select>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
              <th style={{ padding: '10px 14px' }}>المحطة</th>
              <th style={{ padding: '10px 14px' }}>رقم اللوحة</th>
              <th style={{ padding: '10px 14px' }}>نوع وطراز المركبة</th>
              <th style={{ padding: '10px 14px' }}>السائق / الدورية</th>
              <th style={{ padding: '10px 14px' }}>الكمية المصروفة</th>
              <th style={{ padding: '10px 14px' }}>قراءة العداد</th>
              <th style={{ padding: '10px 14px' }}>التاريخ والساعة</th>
              <th style={{ padding: '10px 14px' }}>نوع الصرف</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                  لا توجد حركات صرف مسجلة
                </td>
              </tr>
            ) : (
              filteredTransactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 800, color: '#1e3a8a' }}>{tx.station}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#0284c7' }}>{tx.plate_number}</td>
                  <td style={{ padding: '10px 14px' }}>{tx.vehicle_type}</td>
                  <td style={{ padding: '10px 14px', color: '#334155' }}>{tx.driver_name}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 900, color: '#dc2626' }}>{tx.liters} لتر</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{tx.odometer ? `${tx.odometer} كم` : '---'}</td>
                  <td style={{ padding: '10px 14px', fontSize: '11px', color: '#64748b' }}>{new Date(tx.date).toLocaleString('ar-LY')}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, background: tx.is_external ? '#fffbeb' : '#f0fdf4', color: tx.is_external ? '#b45309' : '#16a34a', border: `1px solid ${tx.is_external ? '#fde68a' : '#bbf7d0'}` }}>
                      {tx.is_external ? 'استثنائي (خارجي)' : 'نظامي معتمد'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

