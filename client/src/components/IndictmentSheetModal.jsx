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

          {/* Authentic Document Canvas matching 100% Screenshot */}
          <div
            className="indictment-sheet-page orientation-landscape"
            style={{
              background: '#ffffff',
              border: '2px solid #94a3b8',
              borderRadius: '8px',
              padding: '24px 30px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              color: '#0f172a',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {/* Top Sovereign Header (Strict Fixed Table - Zero Overlap) */}
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', marginBottom: '8px', direction: 'rtl', border: 'none' }}>
              <colgroup>
                <col style={{ width: '31%' }} />
                <col style={{ width: '38%' }} />
                <col style={{ width: '31%' }} />
              </colgroup>
              <tbody>
                <tr>
                  {/* Right (Col 1 in RTL): Ministry Title with Logo */}
                  <td style={{ textAlign: 'right', verticalAlign: 'middle', padding: '0 4px', border: 'none', overflow: 'hidden' }}>
                    <table style={{ borderCollapse: 'collapse', border: 'none', margin: 0, direction: 'rtl' }}>
                      <tbody>
                        <tr>
                          <td style={{ verticalAlign: 'middle', paddingLeft: '10px', border: 'none' }}>
                            <img
                              src={MOI_LOGO_BASE64}
                              alt="شعار وزارة الداخلية"
                              style={{ width: '56px', height: '56px', objectFit: 'contain', display: 'block' }}
                            />
                          </td>
                          <td style={{ verticalAlign: 'middle', border: 'none', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ fontSize: '15px', fontWeight: 900, color: '#1e3a8a', lineHeight: 1.35, letterSpacing: '0.2px' }}>وزارة الــداخــلــيــة</div>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>مديرية أمن أوباري</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>

                  {/* Center (Col 2 in RTL): Red Bordered Title Box */}
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 4px', border: 'none' }}>
                    <div
                      style={{
                        display: 'inline-block',
                        border: '2.5px solid #b91c1c',
                        borderRadius: '10px',
                        padding: '7px 22px',
                        background: '#ffffff',
                        boxShadow: '0 1px 4px rgba(185, 28, 28, 0.08)'
                      }}
                    >
                      <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#b91c1c', letterSpacing: '0.5px', whiteSpace: 'nowrap', lineHeight: 1.25 }}>
                        صحـيـفـة اتـهـام لـلـحـالات الـمـوجـزة
                      </h2>
                    </div>
                  </td>

                  {/* Left (Col 3 in RTL): Photo Box & QR Code */}
                  <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '0 4px', border: 'none' }}>
                    <table style={{ borderCollapse: 'collapse', border: 'none', marginRight: 'auto', marginLeft: 0, direction: 'ltr' }}>
                      <tbody>
                        <tr>
                          {/* Photo Box (At outer left edge) */}
                          <td style={{ verticalAlign: 'middle', paddingRight: '12px', border: 'none' }}>
                            <div
                              style={{
                                width: '76px',
                                height: '96px',
                                border: '1.5px solid #d97706',
                                borderRadius: '6px',
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
                                <span style={{ color: '#94a3b8', fontSize: '13.5px', fontWeight: 800 }}>صورة</span>
                              )}
                            </div>
                          </td>

                          {/* QR Code */}
                          <td style={{ verticalAlign: 'middle', border: 'none' }}>
                            {qrCodeUrl ? (
                              <div style={{ width: '72px', height: '72px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                              </div>
                            ) : (
                              <div style={{ width: '72px', height: '72px', border: '1px dashed #cbd5e1', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8' }}>
                                QR
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Double Divider Line */}
            <div style={{ borderTop: '3px double #000000', margin: '10px 0 20px 0' }} />

            {/* Main Charge Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #000000', marginBottom: '45px', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ background: '#cbd5e1', color: '#0f172a' }}>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 4px', fontSize: '13px', fontWeight: 900, textAlign: 'center', width: '12%' }}>الرقم</th>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 4px', fontSize: '13px', fontWeight: 900, textAlign: 'center', width: '14%' }}>الرتبة / الصفة</th>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 6px', fontSize: '14px', fontWeight: 900, textAlign: 'center', width: '24%' }}>اسم المتهم</th>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 4px', fontSize: '13px', fontWeight: 900, textAlign: 'center', width: '18%' }}>تاريخ ومكان الواقعة</th>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 6px', fontSize: '13px', fontWeight: 900, textAlign: 'center', width: '18%' }}>التهمة والمادة القانونية</th>
                  <th style={{ border: '1.5px solid #000000', padding: '9px 4px', fontSize: '13px', fontWeight: 900, textAlign: 'center', width: '14%' }}>الحكم / الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 6px', textAlign: 'center', fontSize: '14px', fontWeight: 900, fontFamily: 'monospace' }}>
                    {militaryId}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 6px', textAlign: 'center', fontSize: '13px', fontWeight: 800 }}>
                    {officerRank}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 8px', textAlign: 'center', fontSize: '15.5px', fontWeight: 900, color: '#dc2626' }}>
                    {accusedName}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 6px', textAlign: 'center', fontSize: '13px', fontWeight: 700 }}>
                    {incidentLocation} - {incidentDate}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 8px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                    {charge}
                  </td>
                  <td style={{ border: '1.5px solid #000000', padding: '20px 6px', textAlign: 'center', fontSize: '13.5px', fontWeight: 900, color: '#0f172a' }}>
                    {verdict}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Row: Signatures on Right + Trial Schedule on Left */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '25px', tableLayout: 'fixed', border: 'none' }}>
              <tbody>
                <tr>
                  {/* Right (First TD in RTL): Signatures removed */}
                  <td style={{ verticalAlign: 'bottom', width: '50%', textAlign: 'right', paddingRight: '15px', border: 'none' }}>
                  </td>

                  {/* Left (Second TD in RTL): Trial Schedule Box */}
                  <td style={{ verticalAlign: 'bottom', width: '50%', textAlign: 'left', paddingLeft: '15px', border: 'none' }}>
                    <table style={{ borderCollapse: 'collapse', border: '1.5px solid #000000', width: '280px', fontSize: '12.5px', marginRight: 'auto', marginLeft: 0 }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1.5px solid #000000', padding: '7px 10px', background: '#f8fafc', fontWeight: 800, width: '45%', textAlign: 'center' }}>
                            تاريخ المحاكمة
                          </td>
                          <td style={{ border: '1.5px solid #000000', padding: '7px 10px', textAlign: 'center', fontWeight: 700, direction: 'ltr' }}>
                            {trialDate}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1.5px solid #000000', padding: '7px 10px', background: '#f8fafc', fontWeight: 800, textAlign: 'center' }}>
                            مكان المحاكمة
                          </td>
                          <td style={{ border: '1.5px solid #000000', padding: '7px 10px', textAlign: 'center', fontWeight: 700 }}>
                            {trialLocation}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

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
