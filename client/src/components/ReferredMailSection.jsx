import React, { useState, useEffect, useMemo } from 'react';
import { Share2, Search, Plus, Building2, Printer, Trash2 } from 'lucide-react';
import initialReferred from '../data/referred_mail_data.json';
import initialDepartments from '../data/departments_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { apiFetch } from '../utils/apiClient';
import { normalizeArabicText } from '../utils/arabicUtils';

const STATUS_OPTIONS = [
  { value: 'تحت الإجراء', label: '⏳ تحت الإجراء', bg: '#fef9c3', border: '#fde047', color: '#854d0e' },
  { value: 'قيد المتابعة', label: '🔄 قيد المتابعة', bg: '#dbeafe', border: '#93c5fd', color: '#1e40af' },
  { value: 'تم التنفيذ', label: '✅ تم التنفيذ', bg: '#dcfce7', border: '#86efac', color: '#166534' },
  { value: 'محفوظة', label: '📁 محفوظة', bg: '#f1f5f9', border: '#cbd5e1', color: '#475569' }
];

function getStatusStyle(statusValue) {
  return STATUS_OPTIONS.find((opt) => opt.value === statusValue) || STATUS_OPTIONS[0];
}

function formatReferralDateTime(rawDate) {
  if (!rawDate) return { dateLine: '---', timeLine: '' };
  const parsed = new Date(rawDate);
  if (isNaN(parsed.getTime())) {
    return { dateLine: String(rawDate), timeLine: '' };
  }
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  const dd = String(parsed.getDate()).padStart(2, '0');
  const timeStr = parsed.toLocaleTimeString('ar-LY', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  return {
    dateLine: `${yyyy}/${mm}/${dd}`,
    timeLine: timeStr
  };
}

function mapServerMailToReferred(m) {
  return {
    ReferralID: m.id,
    id: m.id,
    MailID: m.id,
    MailNumber: m.reference || m.code_no || m.record_number || `${m.id}`,
    Subject: m.subject || 'بدون موضوع',
    TargetDept: m.target_dept || m.recipient || 'الشؤون العامة',
    DirectorNotes: m.director_notes || m.notes || 'للإجراء اللازم والعرض',
    ReferralDate: m.date || m.created_at,
    Status: m.status || 'تحت الإجراء',
    FilePath: m.attachment_name || ''
  };
}

export default function ReferredMailSection({ user = {} }) {
  const [referredList, setReferredList] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_referred_mail');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return Array.isArray(initialReferred) ? initialReferred : [];
  });

  const [departmentsList, setDepartmentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('ubari_departments_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((d) => d.DepartmentName || d.department_name).filter(Boolean);
        }
      }
    } catch (_) {}
    return Array.isArray(initialDepartments)
      ? initialDepartments.map((d) => d.DepartmentName).filter(Boolean)
      : ['الشؤون الأمنية', 'الشؤون العامة', 'قسم الخدمات'];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice((prev) => (prev?.text === text ? null : prev)), 4000);
  };

  // مزامنة البريد المحال والأقسام مع قاعدة بيانات SQLite
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const [mailRes, deptRes] = await Promise.all([
          apiFetch('/api/mail?type=referred'),
          apiFetch('/api/departments').catch(() => null)
        ]);

        if (isMounted && mailRes.ok) {
          const data = await mailRes.json();
          if (data.success && Array.isArray(data.mail)) {
            const mapped = data.mail.map(mapServerMailToReferred);
            setReferredList(mapped);
            try {
              localStorage.setItem('ubari_referred_mail', JSON.stringify(mapped));
            } catch (_) {}
          }
        }

        if (isMounted && deptRes && deptRes.ok) {
          const dJson = await deptRes.json();
          if (dJson.success && Array.isArray(dJson.data) && dJson.data.length > 0) {
            setDepartmentsList(dJson.data.map((d) => d.DepartmentName || d.department_name).filter(Boolean));
          }
        }
      } catch (e) {
        console.warn('Referred sync note:', e.message);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  // New Referral Form
  const [form, setForm] = useState({
    MailNumber: '',
    Subject: '',
    TargetDept: 'الشؤون الأمنية',
    DirectorNotes: '',
    Status: 'تحت الإجراء'
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ubari_referred_mail', JSON.stringify(referredList));
    } catch (_) {}
  }, [referredList]);

  // Unique Departments appearing in referrals + directorate list
  const deptFilterOptions = useMemo(() => {
    const set = new Set();
    referredList.forEach((r) => {
      if (r.TargetDept) set.add(r.TargetDept);
    });
    return Array.from(set);
  }, [referredList]);

  // Filtered List with Arabic normalization
  const filteredList = useMemo(() => {
    const normQuery = normalizeArabicText(searchTerm);
    return referredList.filter((item) => {
      const matchDept = selectedDept === 'all' || item.TargetDept === selectedDept;
      const matchStatus = selectedStatus === 'all' || (item.Status || 'تحت الإجراء') === selectedStatus;
      if (!matchDept || !matchStatus) return false;
      if (!normQuery) return true;
      return (
        normalizeArabicText(item.MailNumber).includes(normQuery) ||
        normalizeArabicText(item.Subject).includes(normQuery) ||
        normalizeArabicText(item.DirectorNotes).includes(normQuery) ||
        normalizeArabicText(item.TargetDept).includes(normQuery)
      );
    });
  }, [referredList, selectedDept, selectedStatus, searchTerm]);

  // Add Referral to SQLite
  const handleAddReferral = async (e) => {
    e.preventDefault();
    if (!form.Subject.trim() || !form.DirectorNotes.trim()) {
      showNotice('error', 'يرجى إدخال موضوع الكتاب وتأشيرة مدير الأمن');
      return;
    }

    const nowIso = new Date().toISOString();
    const cleanMailNo = form.MailNumber.trim() || 'بدون رقم';
    let newEntry = {
      ReferralID: Date.now(),
      MailID: Date.now(),
      MailNumber: cleanMailNo,
      Subject: form.Subject.trim(),
      TargetDept: form.TargetDept,
      DirectorNotes: form.DirectorNotes.trim(),
      Status: form.Status || 'تحت الإجراء',
      ReferralDate: nowIso
    };

    try {
      const res = await apiFetch('/api/mail', {
        method: 'POST',
        body: JSON.stringify({
          type: 'referred',
          code_no: cleanMailNo,
          record_number: cleanMailNo,
          reference: cleanMailNo,
          subject: newEntry.Subject,
          target_dept: newEntry.TargetDept,
          director_notes: newEntry.DirectorNotes,
          status: newEntry.Status,
          recipient: newEntry.TargetDept,
          date: nowIso
        })
      });
      if (res.status !== 404) {
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          showNotice('error', data?.message || 'تعذر حفظ الإحالة في قاعدة البيانات');
          return;
        }
        if (data?.success && data.mail) {
          newEntry = mapServerMailToReferred(data.mail);
        }
      }
    } catch (err) {
      console.warn('Referred add offline note:', err.message);
    }

    setReferredList((prev) => [newEntry, ...prev]);
    setIsAddModalOpen(false);
    setForm({
      MailNumber: '',
      Subject: '',
      TargetDept: departmentsList[0] || 'الشؤون الأمنية',
      DirectorNotes: '',
      Status: 'تحت الإجراء'
    });
    showNotice('success', '✅ تم قيد الإحالة وتأشيرة مدير الأمن وحفظها في قاعدة البيانات');
  };

  // Live Interactive Status Update directly from table dropdown (تحت الإجراء / قيد المتابعة / تم التنفيذ)
  const handleStatusChange = async (item, nextStatus) => {
    const targetId = item.id || item.ReferralID;
    setReferredList((prev) =>
      prev.map((r) =>
        String(r.id || r.ReferralID) === String(targetId)
          ? { ...r, Status: nextStatus }
          : r
      )
    );

    try {
      const res = await apiFetch(`/api/mail/${targetId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showNotice('success', `✅ تم تحديث حالة المعاملة (${item.MailNumber || 'بدون رقم'}) إلى "${nextStatus}"`);
      }
    } catch (err) {
      console.warn('Status update offline note:', err.message);
    }
  };

  // Delete Referral from SQLite & State
  const handleDeleteReferral = async (item) => {
    const id = item.id || item.ReferralID;
    if (!window.confirm('هل أنت متأكد من حذف هذه المعاملة المحالة نهائياً؟')) return;

    try {
      const res = await apiFetch(`/api/mail/${id}`, { method: 'DELETE' });
      if (res.status !== 404 && !res.ok) {
        const errJson = await res.json().catch(() => null);
        showNotice('error', errJson?.message || 'يتطلب الحذف صلاحية المسؤول');
        return;
      }
    } catch (err) {
      console.warn('Referred delete offline note:', err.message);
    }

    setReferredList((prev) => prev.filter((r) => String(r.id || r.ReferralID) !== String(id)));
    showNotice('success', '🗑️ تم حذف المعاملة المحالة من السجل');
  };

  // Print Referral Card A4
  const handlePrintReferral = (item) => {
    const dt = formatReferralDateTime(item.ReferralDate);
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px 26px; color: #0a192f; max-width: 740px; margin: 0 auto;">
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 38%;">
              <div style="font-size: 14.5px; font-weight: 800; color: #1e3a8a;">دولة ليبيا • وزارة الداخلية</div>
              <div style="font-size: 16px; font-weight: 900; color: #0a192f;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">مكتب مدير الأمن • قسم الإحالات والمتابعة</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 24%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 65px; height: 65px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 38%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0a192f;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Director Endorsements Office</div>
            </td>
          </tr>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px; font-size: 14px; line-height: 2;">
          <div><strong>رقم الكتاب والمراسلة:</strong> <span style="font-family: monospace; font-weight: 900; color: #1e3a8a;">${item.MailNumber || 'بدون رقم'}</span></div>
          <div><strong>موضوع الكتاب:</strong> ${item.Subject || 'بدون موضوع'}</div>
          <div><strong>القسم المحال إليه:</strong> <span style="font-weight: 800; color: #1e40af;">${item.TargetDept}</span></div>
          <div><strong>تاريخ ووقت الإحالة:</strong> ${dt.dateLine} ${dt.timeLine ? `- ${dt.timeLine}` : ''}</div>
          <div><strong>حالة الإنجاز:</strong> ${item.Status || 'تحت الإجراء'}</div>
        </div>

        <div style="background: #fffbeb; border: 2px dashed #d97706; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
          <h4 style="margin: 0 0 10px; color: #b45309; font-size: 16px; font-weight: 900;">
            تأشيرة وتوجيهات السيد مدير أمن أوباري:
          </h4>
          <div style="font-size: 18px; font-weight: 900; color: #b91c1c; line-height: 1.8;">
            "${item.DirectorNotes || 'للإجراء اللازم والعرض'}"
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 50px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 14px;">مستلم الإحالة بالقسم المختص</div>
            <div style="margin-top: 40px; font-size: 13px;">الاسم: ................................</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 14px;">مدير أمن أوباري</div>
            <div style="margin-top: 40px; font-size: 13px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, `إحالة_بريد_${item.ReferralID}`);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Header matching Official Endorsements Layout */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderRight: '4px solid #d4af37', paddingRight: '12px' }}>
          <Share2 size={24} color="#1e3a8a" />
          <div>
            <h1 style={{ fontSize: '21px', fontWeight: 900, color: '#0f1b2d', margin: 0 }}>
              البريد المُحال وتأشيرات مدير الأمن
            </h1>
            <p style={{ color: '#64748b', fontSize: '12.5px', margin: '2px 0 0', fontWeight: 600 }}>
              متابعة المراسلات المحالة للأقسام، توجيهات مدير الأمن، وحالة التنفيذ الفورية
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
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
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(30, 58, 138, 0.2)'
          }}
        >
          <Plus size={18} />
          قيد إحالة وتأشيرة جديدة
        </button>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div
          style={{
            marginBottom: '14px',
            padding: '10px 14px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '13px',
            background: notice.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: notice.type === 'error' ? '#991b1b' : '#166534',
            border: `1px solid ${notice.type === 'error' ? '#fca5a5' : '#86efac'}`
          }}
        >
          {notice.text}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="بحث برقم المراسلة أو الموضوع أو التأشيرة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 36px 8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#ffffff'
            }}
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 700,
            background: '#ffffff',
            color: '#0f172a'
          }}
        >
          <option value="all">جميع الأقسام ({referredList.length})</option>
          {deptFilterOptions.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            fontWeight: 700,
            background: '#ffffff',
            color: '#0f172a'
          }}
        >
          <option value="all">كافة حالات الإنجاز</option>
          {STATUS_OPTIONS.map((st) => (
            <option key={st.value} value={st.value}>{st.value}</option>
          ))}
        </select>
      </div>

      {/* Clean White Card Table Matching Official Reference Layout */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 18px rgba(15, 23, 42, 0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0f1b2d', color: '#ffffff', fontWeight: 800 }}>
                <th style={{ padding: '14px 14px', width: '110px', textAlign: 'center' }}>رقم المراسلة</th>
                <th style={{ padding: '14px 16px' }}>الموضوع</th>
                <th style={{ padding: '14px 14px', width: '145px', textAlign: 'center' }}>القسم المحال إليه</th>
                <th style={{ padding: '14px 16px', width: '240px', textAlign: 'center' }}>تأشيرة / توجيهات مدير الأمن</th>
                <th style={{ padding: '14px 14px', width: '115px', textAlign: 'center' }}>تاريخ الإحالة</th>
                <th style={{ padding: '14px 14px', width: '145px', textAlign: 'center' }}>حالة الإنجاز</th>
                <th style={{ padding: '14px 12px', width: '115px', textAlign: 'center' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                    لا توجد مراسلات محالة مطابقة
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const dt = formatReferralDateTime(item.ReferralDate);
                  const stStyle = getStatusStyle(item.Status);
                  return (
                    <tr
                      key={item.id || item.ReferralID || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: idx % 2 === 0 ? '#ffffff' : '#fafbfc'
                      }}
                    >
                      <td style={{ padding: '14px', textAlign: 'center', fontWeight: 900, color: '#1d4ed8', fontSize: '13.5px' }}>
                        {item.MailNumber || 'بدون رقم'}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', lineHeight: 1.55 }}>
                        {item.Subject || 'بدون موضوع'}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '5px 10px',
                            borderRadius: '10px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#1e40af',
                            fontWeight: 800,
                            fontSize: '11.5px',
                            lineHeight: 1.35
                          }}
                        >
                          {item.TargetDept}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#b91c1c', lineHeight: 1.5 }}>
                        {item.DirectorNotes || 'للإجراء اللازم'}
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', color: '#475569', fontSize: '11.5px', fontWeight: 700, lineHeight: 1.45 }}>
                        <div style={{ fontFamily: 'monospace' }}>{dt.dateLine}</div>
                        {dt.timeLine && <div style={{ color: '#64748b', fontSize: '11px' }}>{dt.timeLine}</div>}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'center' }}>
                        <select
                          value={item.Status || 'تحت الإجراء'}
                          onChange={(e) => handleStatusChange(item, e.target.value)}
                          style={{
                            padding: '5px 8px',
                            borderRadius: '8px',
                            border: `1.5px solid ${stStyle.border}`,
                            background: stStyle.bg,
                            color: stStyle.color,
                            fontWeight: 800,
                            fontSize: '11.5px',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                          title="تغيير حالة الإنجاز"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '14px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handlePrintReferral(item)}
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            marginLeft: '5px'
                          }}
                          title="طباعة ورقة التأشيرة"
                        >
                          <Printer size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReferral(item)}
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            padding: '5px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11.5px',
                            fontWeight: 800
                          }}
                          title="حذف الإحالة نهائياً"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Referral Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f1b2d', margin: '0 0 16px' }}>قيد إحالة بريد وتأشيرة مدير الأمن</h3>
            <form onSubmit={handleAddReferral}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>رقم المراسلة</label>
                  <input
                    type="text"
                    placeholder="رقم الكتاب أو بدون رقم"
                    value={form.MailNumber}
                    onChange={(e) => setForm({ ...form, MailNumber: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>القسم المحال إليه</label>
                  <select
                    value={form.TargetDept}
                    onChange={(e) => setForm({ ...form, TargetDept: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>موضوع المراسلة</label>
                <input
                  type="text"
                  required
                  placeholder="موضوع المراسلة المحالة..."
                  value={form.Subject}
                  onChange={(e) => setForm({ ...form, Subject: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, marginBottom: '6px', color: '#334155' }}>تأشيرة / توجيهات مدير الأمن</label>
                <textarea
                  rows="3"
                  required
                  placeholder="مثال: فتح تحقيق / تحال للمركز المختص / العامة للإجراء..."
                  value={form.DirectorNotes}
                  onChange={(e) => setForm({ ...form, DirectorNotes: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800, fontFamily: 'inherit' }}
                >
                  قيد وحفظ الإحالة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
