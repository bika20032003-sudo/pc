import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Plus, Shield, AlertTriangle, CheckCircle2, Printer, ArrowDownRight, RotateCcw, Box, Cpu } from 'lucide-react';
import initialInventory from '../data/inventory_data.json';
import { printDocumentInIframe } from '../utils/printHelper';

export default function InventorySection({ forceMembers = [], user = {} }) {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'issued'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [stock, setStock] = useState(() => {
    const saved = localStorage.getItem('ubari_inventory_stock');
    return saved ? JSON.parse(saved) : (initialInventory.stock || []);
  });

  const [issued, setIssued] = useState(() => {
    const saved = localStorage.getItem('ubari_inventory_issued');
    return saved ? JSON.parse(saved) : (initialInventory.issued || []);
  });

  // Modal States
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  // New Stock Form
  const [stockForm, setStockForm] = useState({
    name: '',
    category: 'أسلحة وذخائر',
    serial_number: '',
    quantity: 10,
    unit: 'قطعة',
    min_limit: 5
  });

  // Issue Custody Form
  const [issueForm, setIssueForm] = useState({
    item_id: '',
    receiver_name: '',
    receiver_id: '',
    department: 'مديرية أمن أوباري',
    quantity: 1,
    issue_type: 'عهدة عسكرية شخصية',
    notes: 'تسليم رسمي بموجب التكليف'
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_inventory_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('ubari_inventory_issued', JSON.stringify(issued));
  }, [issued]);

  // Filtered Stock
  const filteredStock = useMemo(() => {
    return stock.filter(item => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [stock, selectedCategory, searchTerm]);

  // Filtered Issued
  const filteredIssued = useMemo(() => {
    return issued.filter(item => {
      return !searchTerm ||
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.receiver_id).includes(searchTerm) ||
        item.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [issued, searchTerm]);

  // Handle Add Stock
  const handleAddStock = (e) => {
    e.preventDefault();
    if (!stockForm.name) return;
    const newItem = {
      id: Date.now(),
      ...stockForm,
      quantity: Number(stockForm.quantity),
      min_limit: Number(stockForm.min_limit)
    };
    setStock([newItem, ...stock]);
    setIsAddStockOpen(false);
    setStockForm({
      name: '',
      category: 'أسلحة وذخائر',
      serial_number: '',
      quantity: 10,
      unit: 'قطعة',
      min_limit: 5
    });
  };

  // Handle Issue Custody
  const handleIssueCustody = (e) => {
    e.preventDefault();
    const stockItem = stock.find(s => String(s.id) === String(issueForm.item_id));
    if (!stockItem || !issueForm.receiver_name) return;

    const issueQty = Number(issueForm.quantity) || 1;
    if (stockItem.quantity < issueQty) {
      alert(`الكمية المتاحة في المخزن (${stockItem.quantity}) غير كافية لصرف ${issueQty}`);
      return;
    }

    // Deduct from stock
    setStock(stock.map(s => s.id === stockItem.id ? { ...s, quantity: s.quantity - issueQty } : s));

    // Add to issued
    const newIssuedItem = {
      id: Date.now(),
      item_name: stockItem.name,
      serial_number: stockItem.serial_number || 'N/A',
      receiver_name: issueForm.receiver_name,
      receiver_id: issueForm.receiver_id || 'غير مدخل',
      department: issueForm.department,
      quantity: issueQty,
      issue_type: issueForm.issue_type,
      issue_date: new Date().toISOString().slice(0, 10),
      status: 'مصروفة - تحت العهدة'
    };
    setIssued([newIssuedItem, ...issued]);
    setIsIssueModalOpen(false);
  };

  // Handle Return Custody
  const handleReturnCustody = (issuedItem) => {
    if (!window.confirm(`هل أنت متأكد من استرجاع العهدة (${issuedItem.item_name}) من (${issuedItem.receiver_name}) وإعادتها للمخزن؟`)) {
      return;
    }

    // Return to stock
    setStock(prev => {
      const match = prev.find(s => s.name === issuedItem.item_name);
      if (match) {
        return prev.map(s => s.id === match.id ? { ...s, quantity: s.quantity + issuedItem.quantity } : s);
      }
      return prev;
    });

    // Update issued status or remove
    setIssued(issued.map(item => item.id === issuedItem.id ? { ...item, status: 'مسترجعة - تم التوريد للمخزن', return_date: new Date().toISOString().slice(0, 10) } : item));
  };

  // Print Custody Voucher A4
  const handlePrintCustodyVoucher = (item) => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا</h3>
            <h2 style="margin: 3px 0; font-size: 17px; font-weight: 900; color: #1e3a8a;">وزارة الداخلية</h2>
            <h4 style="margin: 0; font-size: 14px; color: #475569;">مديرية أمن أوباري | إدارة الشؤون الفنية والمخازن</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 24px; font-weight: 900; color: #1e3a8a; letter-spacing: 2px;">نموذج تسليم عهدة عسكرية رسمية</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">إذن صرف مخزني معتمد - قطاع التسليح والتجهيز</div>
          </div>
          <div style="text-align: left; font-size: 13px;">
            <div><strong>رقم الإذن:</strong> INV-UBR-${item.id}</div>
            <div><strong>التاريخ:</strong> ${today}</div>
          </div>
        </div>

        <!-- Details Card -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px; color: #1e3a8a; font-size: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
            أولاً: بيانات المستلم (المسؤول عن العهدة)
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
            <div><strong>اسم المستلم الرباعي:</strong> ${item.receiver_name}</div>
            <div><strong>الرقم المالي / الوظيفي:</strong> ${item.receiver_id || 'غير متوفر'}</div>
            <div><strong>جهة العمل والتبعية:</strong> ${item.department}</div>
            <div><strong>نوع التكليف / العهدة:</strong> ${item.issue_type}</div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 12px; color: #1e3a8a; font-size: 16px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
            ثانياً: مواصفات الصنف والعتاد المصروف
          </h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: center;">
            <thead>
              <tr style="background: #1e3a8a; color: white;">
                <th style="padding: 10px; border: 1px solid #cbd5e1;">الصنف / البيان</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1;">الرقم المتسلسل (Serial No)</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1;">الكمية المصروفة</th>
                <th style="padding: 10px; border: 1px solid #cbd5e1;">حالة العتاد</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${item.item_name}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; direction: ltr; font-family: monospace;">${item.serial_number}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #cbd5e1; color: #15803d; font-weight: bold;">صالح وجاهز للخدمة 100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Official Undertaking -->
        <div style="border: 1px solid #94a3b8; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.8; margin-bottom: 25px; background: #fffbeb;">
          <strong>إقرار والتزام قانوني:</strong> أقر أنا المستلم الموضح بياناته أعلاه بأنني استلمت الصنف المذكور بحالة ممتازة وجاهزة للاستخدام الأمني، وأتعهد بالمحافظة عليه وعدم تسليمه أو التفريط فيه أو استخدامه في غير الأغراض المخصصة له، والالتزام برده فور انتهاء التكليف أو طلب الإدارة، وأتحمل المسؤولية القانونية والانضباطية في حال الفقد أو الإهمال.
        </div>

        <!-- Signatures -->
        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 40px; padding: 0 30px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">توقيع المستلم للعهدة</div>
            <div style="margin-top: 40px; font-size: 13px;">الاسم: ${item.receiver_name}</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">أمين مخزن السلاح والتجهيز</div>
            <div style="margin-top: 40px; font-size: 13px;">ملازم / مصطفى سالم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `إذن_صرف_عهدة_${item.receiver_name}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Title & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={28} color="#1e3a8a" />
            قسم المخازن والعهد العسكرية
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | الإشراف على مستودعات التسليح، الذخائر، أجهزة الاتصال، المهمات، وصرف العهد الشخصية
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAddStockOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#ffffff',
              color: '#1e3a8a',
              border: '1px solid #1e3a8a',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            إضافة صنف للمخزن
          </button>

          <button
            onClick={() => setIsIssueModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(30,58,138,0.2)'
            }}
          >
            <ArrowDownRight size={16} />
            صرف عهدة جديدة
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>أصناف المستودعات</span>
            <Box size={20} color="#1e3a8a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0a192f' }}>{stock.length} <span style={{ fontSize: '14px', color: '#64748b' }}>أصناف مسجلة</span></div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>العهد المصروفة نشطة</span>
            <Shield size={20} color="#2563eb" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb' }}>
            {issued.filter(i => !i.status.includes('مسترجعة')).length} <span style={{ fontSize: '14px', color: '#64748b' }}>عهدة نشطة</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>تنبيهات الحد الحرج</span>
            <AlertTriangle size={20} color="#ea580c" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#ea580c' }}>
            {stock.filter(s => s.quantity <= s.min_limit).length} <span style={{ fontSize: '14px', color: '#64748b' }}>صنف قارب النفاد</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>جاهزية المخزون</span>
            <CheckCircle2 size={20} color="#16a34a" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#16a34a' }}>100% <span style={{ fontSize: '14px', color: '#64748b' }}>جاهزية تشغيلية</span></div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('stock')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'stock' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'stock' ? '#ffffff' : '#475569'
            }}
          >
            📦 أرصدة المخازن والعتاد ({stock.length})
          </button>
          <button
            onClick={() => setActiveTab('issued')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'issued' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'issued' ? '#ffffff' : '#475569'
            }}
          >
            🛡️ سجل العهد المصروفة للأعضاء ({issued.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {activeTab === 'stock' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                outline: 'none'
              }}
            >
              <option value="all">كافة الفئات</option>
              <option value="أسلحة وذخائر">أسلحة وذخائر</option>
              <option value="مهمات وأجهزة">مهمات وأجهزة</option>
              <option value="قطع غيار وزيوت">قطع غيار وزيوت</option>
              <option value="سلع تموينية وإعاشة">سلع تموينية وإعاشة</option>
            </select>
          )}

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم المتسلسل أو الضابط..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 36px 8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        {activeTab === 'stock' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '14px 16px' }}>ر.م</th>
                <th style={{ padding: '14px 16px' }}>الفئة والتصنيف</th>
                <th style={{ padding: '14px 16px' }}>اسم الصنف / العتاد</th>
                <th style={{ padding: '14px 16px' }}>الرقم المتسلسل / الدفعة</th>
                <th style={{ padding: '14px 16px' }}>الرصيد المتاح</th>
                <th style={{ padding: '14px 16px' }}>وحدة القياس</th>
                <th style={{ padding: '14px 16px' }}>حالة المخزون</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item, idx) => {
                const isCritical = item.quantity <= item.min_limit;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: item.category === 'أسلحة وذخائر' ? '#fee2e2' : item.category === 'مهمات وأجهزة' ? '#e0f2fe' : '#f1f5f9',
                        color: item.category === 'أسلحة وذخائر' ? '#b91c1c' : item.category === 'مهمات وأجهزة' ? '#0369a1' : '#334155'
                      }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{item.name}</td>
                    <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                      {item.serial_number || '---'}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 900, fontSize: '15px', color: isCritical ? '#dc2626' : '#0a192f' }}>
                      {item.quantity.toLocaleString('ar-LY')}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.unit}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {isCritical ? (
                        <span style={{ color: '#dc2626', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={14} /> حرج (أقل من {item.min_limit})
                        </span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> كافٍ وآمن
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '14px 16px' }}>ر.م</th>
                <th style={{ padding: '14px 16px' }}>اسم الضابط / المستلم</th>
                <th style={{ padding: '14px 16px' }}>الرقم المالي</th>
                <th style={{ padding: '14px 16px' }}>جهة العمل</th>
                <th style={{ padding: '14px 16px' }}>العتاد المسلّم</th>
                <th style={{ padding: '14px 16px' }}>الرقم المتسلسل</th>
                <th style={{ padding: '14px 16px' }}>الكمية</th>
                <th style={{ padding: '14px 16px' }}>تاريخ الصرف</th>
                <th style={{ padding: '14px 16px' }}>الحالة</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssued.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>{item.receiver_name}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.receiver_id}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.department}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#1e3a8a' }}>{item.item_name}</td>
                  <td style={{ padding: '14px 16px', direction: 'ltr', textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.serial_number}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800 }}>{item.quantity}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{item.issue_date}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: item.status.includes('مسترجعة') ? '#f1f5f9' : '#dcfce7',
                      color: item.status.includes('مسترجعة') ? '#64748b' : '#15803d'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handlePrintCustodyVoucher(item)}
                        title="طباعة إذن صرف عهدة A4"
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        <Printer size={14} /> طباعة
                      </button>

                      {!item.status.includes('مسترجعة') && (
                        <button
                          onClick={() => handleReturnCustody(item)}
                          title="استرجاع العهدة وتوريدها للمخزن"
                          style={{
                            background: '#fef2f2',
                            color: '#b91c1c',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          <RotateCcw size={14} /> استرجاع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Stock Modal */}
      {isAddStockOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>إضافة صنف جديد لمستودع المديرية</h3>
            <form onSubmit={handleAddStock}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم الصنف</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مسدس جلوك 19 ملم"
                  value={stockForm.name}
                  onChange={(e) => setStockForm({ ...stockForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>التصنيف</label>
                  <select
                    value={stockForm.category}
                    onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="أسلحة وذخائر">أسلحة وذخائر</option>
                    <option value="مهمات وأجهزة">مهمات وأجهزة</option>
                    <option value="قطع غيار وزيوت">قطع غيار وزيوت</option>
                    <option value="سلع تموينية وإعاشة">سلع تموينية وإعاشة</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>وحدة القياس</label>
                  <input
                    type="text"
                    value={stockForm.unit}
                    onChange={(e) => setStockForm({ ...stockForm, unit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الكمية الموردة</label>
                  <input
                    type="number"
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الحد الأدنى للتنبيه</label>
                  <input
                    type="number"
                    min="1"
                    value={stockForm.min_limit}
                    onChange={(e) => setStockForm({ ...stockForm, min_limit: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddStockOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Custody Modal */}
      {isIssueModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '560px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>إذن صرف وتسليم عهدة عسكرية</h3>
            <form onSubmit={handleIssueCustody}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اختر الصنف من المخزن</label>
                <select
                  required
                  value={issueForm.item_id}
                  onChange={(e) => setIssueForm({ ...issueForm, item_id: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                >
                  <option value="">-- اضغط لاختيار الصنف المتاح --</option>
                  {stock.map(s => (
                    <option key={s.id} value={s.id} disabled={s.quantity <= 0}>
                      {s.name} - رصيد: {s.quantity} {s.unit} ({s.serial_number})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم العضو / المستلم</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الضابط الرباعي..."
                    value={issueForm.receiver_name}
                    onChange={(e) => setIssueForm({ ...issueForm, receiver_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الرقم المالي / الوظيفي</label>
                  <input
                    type="text"
                    placeholder="مثال: 1082235"
                    value={issueForm.receiver_id}
                    onChange={(e) => setIssueForm({ ...issueForm, receiver_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الجهة / القسم</label>
                  <input
                    type="text"
                    value={issueForm.department}
                    onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الكمية المصروفة</label>
                  <input
                    type="number"
                    min="1"
                    value={issueForm.quantity}
                    onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  اعتماد وصرف العهدة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

