import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Printer,
  FileText,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  MapPin,
  Scale
} from 'lucide-react';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { printIndictmentSheet } from '../utils/indictmentSheetTemplate';

export default function IndictmentSheetModal({
  member = {},
  penalty = null,
  onClose
}) {
  if (!member && !penalty) return null;

  // Resolved Identifiers
  const accusedName = penalty?.FullName || member?.name || '---';
  const militaryId = penalty?.MilitaryNumber || member?.military_number || penalty?.JobNumber || member?.financial_number || member?.job_number || member?.national_id || '---';
  const officerRank = member?.rank || penalty?.EmployeeCategory || member?.type || 'غير محدد';
  const officerPhoto = member?.photo || localStorage.getItem(`ubari_officer_photo_${member?.id}`) || '';

  // Form Fields State
  const [incidentDate, setIncidentDate] = useState(
    penalty?.PenaltyDate || penalty?.penalty_date || new Date().toISOString().slice(0, 10)
  );
  const [incidentLocation, setIncidentLocation] = useState('أوباري');
  const [charge, setCharge] = useState(
    penalty?.Reason || 'غياب عن العمل'
  );
  const [verdict, setVerdict] = useState(
    penalty?.PenaltyType ? `${penalty.PenaltyType}${penalty.DeductionDays > 0 ? ` (${penalty.DeductionDays} أيام)` : ''}` : 'خصم مالي'
  );
  const [trialDate, setTrialDate] = useState('..... / ..... / 202 م');
  const [trialLocation, setTrialLocation] = useState('مديرية أمن أوباري');
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Generate QR Code for verification
  useEffect(() => {
    const qrData = `وزارة الداخلية - مديرية أمن أوباري\nصحيفة اتهام للحالات الموجزة\nالمتهم: ${accusedName}\nالرقم: ${militaryId}\nالتهمة: ${charge}\nالحكم: ${verdict}\nالتاريخ: ${incidentDate}`;
    QRCode.toDataURL(qrData, { width: 140, margin: 1 })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [accusedName, militaryId, charge, verdict, incidentDate]);

  // Dedicated Print Trigger
  const handlePrint = () => {
    printIndictmentSheet({
      member,
      penalty: penalty || {
        FullName: accusedName,
        MilitaryNumber: militaryId,
        Reason: charge,
        PenaltyType: verdict,
        PenaltyDate: incidentDate
      },
      qrCodeUrl,
      customFields: {
        incidentDate,
        incidentLocation,
        charge,
        verdict,
        trialDate,
        trialLocation
      }
    });
  };

  return (
    <div
      className="moi-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif"
      }}
      onClick={onClose}
    >
      <div
        className="moi-modal-container"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #cbd5e1',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
            color: '#ffffff',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #d4af37'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Scale size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900 }}>
                صحيفة اتهام للحالات الموجزة
              </div>
              <div style={{ fontSize: '11.5px', color: '#93c5fd', fontWeight: 600 }}>
                المتهم: {accusedName} | الرقم: {militaryId} | مديرية أمن أوباري
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: isEditing ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Edit3 size={14} />
              <span>{isEditing ? 'معاينة الصحيفة' : 'تعديل البيانات'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(185, 28, 28, 0.4)'
              }}
            >
              <Printer size={15} />
              <span>طباعة الصحيفة (A4)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="إغلاق"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '24px', flex: 1, background: '#f8fafc' }}>
          
          {/* Optional Editing Drawer */}
          {isEditing && (
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.06)'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit3 size={15} />
                <span>تخصيص بنود ومحاكمة صحيفة الاتهام:</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>مكان الواقعة</label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>تاريخ الواقعة</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>التهمة والمادة القانونية</label>
                  <input
                    type="text"
                    value={charge}
                    onChange={(e) => setCharge(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>الحكم / الإجراء</label>
                  <input
                    type="text"
                    value={verdict}
                    onChange={(e) => setVerdict(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>تاريخ المحاكمة</label>
                  <input
                    type="text"
                    value={trialDate}
                    onChange={(e) => setTrialDate(e.target.value)}
                    placeholder="..... / ..... / 202 م"
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>مكان المحاكمة</label>
                  <input
                    type="text"
                    value={trialLocation}
                    onChange={(e) => setTrialLocation(e.target.value)}
                    placeholder="...................."
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontWeight: 700 }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Authentic Document Canvas matching 100% Libyan MOI Portrait Standard */}
          <div
            className="indictment-sheet-page"
            style={{
              background: '#ffffff',
              border: '2px solid #94a3b8',
              borderRadius: '8px',
              padding: '24px 28px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              color: '#0f172a',
              width: '100%',
              maxWidth: '820px',
              margin: '0 auto',
              boxSizing: 'border-box',
              fontFamily: "'Cairo', Arial, sans-serif"
            }}
          >
            {/* Libyan 4-Color Sovereign Ribbon */}
            <div style={{ height: '5px', width: '100%', display: 'flex', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
              <div style={{ flex: 1, background: '#e11d48' }}></div>
              <div style={{ flex: 2, background: '#000000' }}></div>
              <div style={{ flex: 1, background: '#16a34a' }}></div>
            </div>

            {/* Top Sovereign Header (Robust Fixed Table - Zero Overlap in Portrait) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '8px', direction: 'rtl', border: 'none' }}>
              <colgroup>
                <col style={{ width: '34%' }} />
                <col style={{ width: '36%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <tbody>
                <tr>
                  {/* Right: Ministry Title with Logo */}
                  <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '0 4px', border: 'none' }}>
                    <table style={{ borderCollapse: 'collapse', border: 'none', margin: 0, direction: 'rtl' }}>
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: 'middle', paddingLeft: '8px', border: 'none' }}>
                            <img
                              src={MOI_LOGO_BASE64}
                              alt="شعار وزارة الداخلية"
                              style={{ width: '52px', height: '52px', objectFit: 'contain', display: 'block' }}
                            />
                          </td>
                          <td style={{ verticalAlign: 'middle', border: 'none', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.3 }}>وزارة الــداخــلــيــة</div>
                            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>مديرية أمن أوباري</div>
                            <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', lineHeight: 1.2 }}>مكتب الانضباط والشؤون القانونية</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Center: Red Bordered Title Box */}
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 2px', border: 'none' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        border: '2.5px solid #b91c1c',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        background: '#ffffff',
                        boxShadow: '0 1px 3px rgba(185, 28, 28, 0.08)'
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: '16.5px', fontWeight: 900, color: '#b91c1c', letterSpacing: '0.3px', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                        صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة
                      </h2>
                    </div>
                  </td>

                  {/* Left: QR Code & Photo Box */}
                  <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '0 4px', border: 'none' }}>
                    <table style={{ borderCollapse: 'collapse', border: 'none', marginRight: 'auto', marginLeft: 0, direction: 'ltr' }}>
                      <tbody>
                        <tr>
                          {/* QR Code */}
                          <td style={{ verticalAlign: 'middle', paddingLeft: '8px', border: 'none' }}>
                            {qrCodeUrl ? (
                              <div style={{ width: '56px', height: '56px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                              </div>
                            ) : (
                              <div style={{ width: '56px', height: '56px', border: '1px dashed #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8.5px', color: '#94a3b8' }}>
                                QR
                              </div>
                            )}
                          </td>

                          {/* Photo Box */}
                          <td style={{ verticalAlign: 'middle', border: 'none' }}>
                            <div
                              style={{
                                width: '58px',
                                height: '72px',
                                border: '1.5px solid #d97706',
                                borderRadius: '4px',
                                background: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              {officerPhoto ? (
                                <img src={officerPhoto} alt={accusedName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 800 }}>صورة</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Double Divider Line */}
            <div style={{ borderTop: '3px double #000000', margin: '8px 0 12px 0' }} />

            {/* Sovereign Metadata / Identification Bar */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', background: '#f8fafc', fontSize: '12.5px', marginBottom: '14px', tableLayout: 'fixed' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '7px 10px', border: '1px solid #000000', width: '25%', fontWeight: 800, color: '#1e3a8a' }}>
                    الرقم الوطني: <span style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 900, color: '#000000' }}>{member?.national_id || penalty?.NationalId || '---'}</span>
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #000000', width: '25%', fontWeight: 800, color: '#1e3a8a' }}>
                    رقم القيد العسكري: <span style={{ fontFamily: 'monospace', fontSize: '13.5px', fontWeight: 900, color: '#000000' }}>{militaryId}</span>
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #000000', width: '25%', fontWeight: 800, color: '#1e3a8a' }}>
                    تاريخ الواقعة: <span style={{ fontWeight: 900, color: '#000000' }}>{incidentDate}</span>
                  </td>
                  <td style={{ padding: '7px 10px', border: '1px solid #000000', width: '25%', fontWeight: 800, color: '#1e3a8a' }}>
                    مكان الضبط: <span style={{ fontWeight: 900, color: '#000000' }}>{incidentLocation}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Section Title 1 */}
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
              ■ بيانات المتهم والواقعة المنسوبة:
            </div>

            {/* Main Charge Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '16px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', color: '#0f172a' }}>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 4px', fontSize: '12.5px', fontWeight: 900, textAlign: 'center', width: '12%' }}>الرقم</th>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 4px', fontSize: '12.5px', fontWeight: 900, textAlign: 'center', width: '14%' }}>الرتبة / الصفة</th>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 6px', fontSize: '13.5px', fontWeight: 900, textAlign: 'center', width: '24%' }}>اسم المتهم</th>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 4px', fontSize: '12.5px', fontWeight: 900, textAlign: 'center', width: '18%' }}>تاريخ ومكان الواقعة</th>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 6px', fontSize: '12.5px', fontWeight: 900, textAlign: 'center', width: '18%' }}>التهمة والمادة القانونية</th>
                  <th style={{ border: '1.5px solid #000000', padding: '8px 4px', fontSize: '12.5px', fontWeight: 900, textAlign: 'center', width: '14%' }}>الحكم / الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 6px', textAlign: 'center', fontSize: '13.5px', fontWeight: 900, fontFamily: 'monospace' }}>
                    {militaryId}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 6px', textAlign: 'center', fontSize: '13px', fontWeight: 800 }}>
                    {officerRank}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 8px', textAlign: 'center', fontSize: '14.5px', fontWeight: 900, color: '#dc2626' }}>
                    {accusedName}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 6px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800 }}>
                    {incidentLocation} - {incidentDate}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 8px', textAlign: 'center', fontSize: '12.5px', fontWeight: 800, color: '#334155' }}>
                    {charge}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '14px 6px', textAlign: 'center', fontSize: '13px', fontWeight: 900, color: '#0f172a' }}>
                    {verdict}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Section Title 2: حيثيات الاتهام والسند القانوني */}
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>
              ■ حيثيات الاتهام والسند القانوني للعقوبة الانضباطية:
            </div>

            {/* Legal Grounds Box */}
            <div style={{ border: '1.5px solid #000000', background: '#ffffff', padding: '10px 14px', marginBottom: '16px', fontSize: '12.5px', lineHeight: 1.8, color: '#000000' }}>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#1e3a8a' }}>1. وصف الواقعة والتحقيق: </strong>
                <span>بناءً على التقارير الأمنية والانضباطية الواردة ومذكرة الضبط المؤرخة في <strong>{incidentDate}</strong>، ثبت ارتكاب المتهم المذكور أعلاه للمخالفة الانضباطية المنسوبة إليه (<strong>{charge}</strong>) بما يخل بمقتضيات الواجب المسلكي وشرف الخدمة بهيئة الشرطة.</span>
              </div>
              <div style={{ marginBottom: '6px' }}>
                <strong style={{ color: '#1e3a8a' }}>2. السند القانوني: </strong>
                <span>تطبيقاً لأحكام القانون رقم (10) لسنة 1992م بشأن الشرطة، والقوانين واللوائح المنظمة للانضباط بالمديرية، ولما تقتضيه المصلحة الأمنية العامة لفرض الضبط والربط العسكري.</span>
              </div>
              <div>
                <strong style={{ color: '#b91c1c' }}>3. منطوق قرار المحاكمة الموجزة: </strong>
                <span>تقرر توقيع عقوبة <strong>( {verdict} )</strong> على المتهم المذكور، مع قيدها بالسجل الانضباطي وإحالة نسخة رسمية لإدارة الشؤون الإدارية والمالية للتنفيذ فوراً.</span>
              </div>
            </div>

            {/* Bottom Row: Signatures on Right + Trial Schedule on Left */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', tableLayout: 'fixed', border: 'none' }}>
              <tbody>
                <tr>
                  {/* Right: Official Signatures */}
                  <td style={{ verticalAlign: 'top', width: '48%', textAlign: 'right', paddingRight: '8px', border: 'none' }}>
                    <div style={{ display: 'inline-block', textAlign: 'right', fontSize: '12.5px', fontWeight: 800, lineHeight: 2.1, color: '#0f172a' }}>
                      <div>التوقيع: .......................................</div>
                      <div>الرتبة: .......................................</div>
                      <div>المنصب: .......................................</div>
                      <div>الاسم: .......................................</div>
                    </div>
                  </td>

                  {/* Center: Official Ministry Stamp Placeholder */}
                  <td style={{ verticalAlign: 'middle', width: '24%', textAlign: 'center', border: 'none' }}>
                    <div style={{ width: '78px', height: '78px', borderRadius: '50%', border: '2px dashed #1e3a8a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900, color: '#1e3a8a', margin: '0 auto', lineHeight: 1.25, background: 'rgba(30,58,138,0.02)' }}>
                      <span>دولة ليبيا</span>
                      <span>وزارة الداخلية</span>
                      <span style={{ fontSize: '8.5px', color: '#000000', fontWeight: 900 }}>مديرية أمن أوباري</span>
                      <span style={{ color: '#b91c1c', fontSize: '7.5px', marginTop: '1px' }}>الختم المعتمد</span>
                    </div>
                  </td>

                  {/* Left: Trial Schedule Box */}
                  <td style={{ verticalAlign: 'top', width: '28%', textAlign: 'left', paddingLeft: '4px', border: 'none' }}>
                    <table style={{ borderCollapse: 'collapse', border: '1.5px solid #000000', width: '100%', fontSize: '12px', marginRight: 'auto', marginLeft: 0 }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1.5px solid #000000', padding: '6px 8px', background: '#f8fafc', fontWeight: 800, width: '45%', textAlign: 'center' }}>
                            تاريخ المحاكمة
                          </td>
                          <td style={{ border: '1.5px solid #000000', padding: '6px 8px', textAlign: 'center', fontWeight: 800, direction: 'ltr' }}>
                            {trialDate}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1.5px solid #000000', padding: '6px 8px', background: '#f8fafc', fontWeight: 800, textAlign: 'center' }}>
                            مكان المحاكمة
                          </td>
                          <td style={{ border: '1.5px solid #000000', padding: '6px 8px', textAlign: 'center', fontWeight: 800 }}>
                            {trialLocation}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Official Directorate Endorsement Bar */}
            <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1.5px solid #000000', paddingTop: '8px', marginBottom: '12px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '60%', textAlign: 'right', verticalAlign: 'middle', fontSize: '12px', fontWeight: 800 }}>
                    <div style={{ color: '#1e3a8a' }}>يعتمد / مدير مديرية أمن أوباري</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#000000', marginTop: '2px' }}>لواء / موسى سعد البدین</div>
                  </td>
                  <td style={{ width: '40%', textAlign: 'left', verticalAlign: 'middle', fontSize: '12px', fontWeight: 800 }}>
                    <div>التوقيع: .......................................</div>
                    <div style={{ marginTop: '3px' }}>التاريخ: ..... / ..... / 202 م</div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Carbon Copy Footer */}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', fontSize: '10.5px', color: '#475569', fontWeight: 700, lineHeight: 1.6 }}>
              <div>صورة / مكتب الانضباط والشؤون القانونية</div>
              <div>صورة / مدير إدارة الشؤون الإدارية والمالية (قسم المرتبات للتنفيذ)</div>
              <div>صورة / الملف 2.2 ج الدوري للحفظ</div>
              <div>الملف الشخصي للمنتسب للحفظ</div>
            </div>

          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div
          style={{
            padding: '12px 24px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
            معتمدة رسمياً وفق نموذج صحائف الاتهام للحالات الموجزة - وزارة الداخلية دولة ليبيا
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handlePrint}
              style={{
                background: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} />
              <span>طباعة المستند الرسمي</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
