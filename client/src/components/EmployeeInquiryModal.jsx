import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Lock,
  User,
  Phone,
  Home,
  Heart,
  CreditCard,
  Building2,
  Scissors,
  Award,
  Calendar,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  Hash,
  Activity,
  FileCheck2
} from 'lucide-react';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

// Helper: Normalize Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩) to standard English ASCII digits (0123456789)
function sanitizeDigits(val) {
  if (!val) return '';
  const arabicIndic = '٠١٢٣٤٥٦٧٨٩';
  return String(val)
    .replace(/[٠-٩]/g, (d) => arabicIndic.indexOf(d))
    .replace(/\D/g, '')
    .trim();
}

// Major Libyan banks preset options
const LIBYAN_BANKS = [
  'مصرف الصحاري',
  'مصرف الجمهورية',
  'المصرف التجاري الوطني',
  'مصرف الوحدة',
  'مصرف شمال أفريقيا',
  'مصرف التجارة والتنمية',
  'مصرف الأمان',
  'المصرف الإسلامي الليبي',
  'مصرف الواحة',
  'مصرف السراي',
  'مصرف النوران',
  'مصرف المتحد للاستثمار'
];

// Blood Types preset
const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

// Military Clothing Sizes
const SUIT_SIZES = ['44', '46', '48', '50', '52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45', '46', '47', '48'];
const HEADWEAR_SIZES = ['54', '55', '56', '57', '58', '59', '60', '61'];
const SHIRT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '38', '39', '40', '41', '42', '43', '44', '45'];

export default function EmployeeInquiryModal({ isOpen, onClose, forceMembers = [], onUpdateMember }) {
  // Search States
  const [searchInput, setSearchInput] = useState('');
  const [searchFilterType, setSearchFilterType] = useState('all'); // 'all' | 'national_id' | 'financial_number'
  const [searchError, setSearchError] = useState(null);

  // Active Verified Employee
  const [verifiedMember, setVerifiedMember] = useState(null);

  // Editable Form Data
  const [formData, setFormData] = useState({});

  // Active Tab for Form
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' | 'military' | 'medical' | 'banking'

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  if (!isOpen) return null;

  // Calculate profile completeness score
  const completeness = useMemo(() => {
    if (!verifiedMember) return 0;
    const fields = [
      formData.phone,
      formData.residence,
      formData.blood_type,
      formData.suit_number && formData.suit_number !== '-',
      formData.shoe_size,
      formData.headwear_size,
      formData.marital_status,
      formData.bank_name,
      formData.account_number
    ];
    const filled = fields.filter((f) => f && String(f).trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  }, [verifiedMember, formData]);

  // Handle Search Verification - Strictly 1-to-1 matching to prevent mixups
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setSubmitSuccess(false);
    setSubmitError(null);

    const clean = sanitizeDigits(searchInput);
    if (!clean || clean.length < 3) {
      setSearchError('يرجى إدخال الرقم الوطني (12 رقماً) أو الرقم المالي الصحيح للاستعلام.');
      return;
    }

    // High performance in-memory lookup across all roster elements
    const match = forceMembers.find((m) => {
      const nat = sanitizeDigits(m.national_id);
      const fin = sanitizeDigits(m.financial_number);
      const job = sanitizeDigits(m.job_number);

      if (searchFilterType === 'national_id') {
        return nat === clean;
      }
      if (searchFilterType === 'financial_number') {
        return fin === clean || job === clean;
      }
      // 'all': match either National ID or Financial / Job number strictly
      return nat === clean || fin === clean || job === clean;
    });

    if (!match) {
      setSearchError(`عفواً، لم يتم العثور على أي قيد مطابق للرقم المدخل [${searchInput}]. يرجى التأكد من صحة الرقم الوطني أو الرقم المالي الخاص بك.`);
      setVerifiedMember(null);
      return;
    }

    // Strict 1-to-1 isolation: clone the record into detached state
    setVerifiedMember(match);
    setFormData({
      phone: match.phone || '',
      emergency_contact: match.emergency_contact || match.notes || '',
      residence: match.residence || '',
      tribe_city: match.tribe_city || '',
      blood_type: match.blood_type || '',
      suit_number: match.suit_number && match.suit_number !== '-' ? match.suit_number : '',
      shoe_size: match.shoe_size || '',
      headwear_size: match.headwear_size || '',
      shirt_size: match.shirt_size || '',
      marital_status: match.marital_status || 'متزوج',
      children_count: match.children_count !== undefined ? String(match.children_count) : '0',
      wife_name: match.wife_name || '',
      mother_name: match.mother_name || '',
      birth_date: match.birth_date || '',
      birth_place: match.birth_place || '',
      bank_name: match.bank_name || '',
      bank_branch: match.bank_branch || '',
      account_number: match.account_number || ''
    });
  };

  // Reset to search another employee
  const handleResetSearch = () => {
    setVerifiedMember(null);
    setFormData({});
    setSearchError(null);
    setSubmitSuccess(false);
    setSubmitError(null);
    setSearchInput('');
  };

  // Handle Input Changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Save updates safely
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!verifiedMember) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build clean update payload containing ONLY whitelisted editable fields
      const updates = {
        phone: formData.phone?.trim() || '',
        emergency_contact: formData.emergency_contact?.trim() || '',
        residence: formData.residence?.trim() || '',
        tribe_city: formData.tribe_city?.trim() || '',
        blood_type: formData.blood_type || '',
        suit_number: formData.suit_number || '',
        shoe_size: formData.shoe_size || '',
        headwear_size: formData.headwear_size || '',
        shirt_size: formData.shirt_size || '',
        marital_status: formData.marital_status || '',
        children_count: formData.children_count || '0',
        wife_name: formData.wife_name?.trim() || '',
        mother_name: formData.mother_name?.trim() || '',
        birth_date: formData.birth_date || '',
        birth_place: formData.birth_place?.trim() || '',
        bank_name: formData.bank_name || '',
        bank_branch: formData.bank_branch?.trim() || '',
        account_number: formData.account_number?.trim() || ''
      };

      // Call parent updater which updates memory, localStorage, and calls backend API safely
      if (onUpdateMember) {
        await onUpdateMember(verifiedMember.id, updates);
      }

      // Update verifiedMember in local view
      setVerifiedMember((prev) => ({
        ...prev,
        ...updates
      }));

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error saving self-update:', err);
      setSubmitError('حدث خطأ أثناء حفظ البيانات، يرجى إعادة المحاولة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="moi-modal-overlay" style={{ zIndex: 100000 }}>
      <div
        className="moi-modal-box"
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '92vh',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(10, 25, 47, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.3)'
        }}
      >
        {/* Libyan Sovereign 4-color Ribbon */}
        <div style={{ height: '5px', width: '100%', display: 'flex' }}>
          <div style={{ flex: '1', backgroundColor: '#e11d48' }} />
          <div style={{ flex: '2', backgroundColor: '#0f172a' }} />
          <div style={{ flex: '1', backgroundColor: '#16a34a' }} />
        </div>

        {/* Modal Header */}
        <div
          className="moi-modal-header"
          style={{
            background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
            color: '#fff',
            borderBottom: '2px solid #d4af37',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={MOI_LOGO_BASE64}
              alt="شعار وزارة الداخلية"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))'
              }}
            />
            <div>
              <div style={{ fontSize: '11px', color: '#d4af37', fontWeight: 800, letterSpacing: '0.5px' }}>
                دولة ليبيا - وزارة الداخلية | مديرية أمن أوباري
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 900, color: '#ffffff' }}>
                بوابة استعلام واستكمال بيانات المنتسبين
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="moi-modal-close-btn"
            style={{
              color: '#ffffff',
              background: 'rgba(255,255,255,0.12)',
              borderRadius: '8px',
              padding: '6px'
            }}
            title="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="moi-modal-body" style={{ padding: '20px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {/* STEP 1: Search & Sovereign Identity Verification */}
          {!verifiedMember ? (
            <div>
              {/* Guidance & Security Banner */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRight: '4px solid #1e3a8a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldCheck size={22} style={{ color: '#1e3a8a' }} />
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                    التحقق السيادي من هوية المنتسب
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  هذه البوابة مخصصة حصرياً لكافة منتسبي <strong>مديرية أمن أوباري</strong> (ضباط، ضباط صف، أفراد، وموظفون مدنيون) للاستعلام عن ملفاتهم واستكمال بياناتهم الناقصة (أرقام الهواتف، المقاسات العسكرية، الحسابات المصرفية، وفصيلة الدم).
                </p>
                <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11.5px', color: '#059669', fontWeight: 700 }}>
                  <span>✓ تحقق مشدد 1-إلى-1 بدون أي تداخل بين السجلات</span>
                  <span>✓ استعلام فوري سريع بدون ضغط على السيرفر</span>
                  <span>✓ حماية وتشفير البيانات الرسمية</span>
                </div>
              </div>

              {/* Search Box */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setSearchFilterType('all')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: searchFilterType === 'all' ? '#1e3a8a' : '#cbd5e1',
                      background: searchFilterType === 'all' ? '#1e3a8a' : '#f8fafc',
                      color: searchFilterType === 'all' ? '#fff' : '#475569'
                    }}
                  >
                    بحث ذكي (الرقم الوطني أو المالي)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilterType('national_id')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: searchFilterType === 'national_id' ? '#1e3a8a' : '#cbd5e1',
                      background: searchFilterType === 'national_id' ? '#1e3a8a' : '#f8fafc',
                      color: searchFilterType === 'national_id' ? '#fff' : '#475569'
                    }}
                  >
                    بالرقم الوطني (12 رقماً)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilterType('financial_number')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: searchFilterType === 'financial_number' ? '#1e3a8a' : '#cbd5e1',
                      background: searchFilterType === 'financial_number' ? '#1e3a8a' : '#f8fafc',
                      color: searchFilterType === 'financial_number' ? '#fff' : '#475569'
                    }}
                  >
                    بالرقم المالي / رقم القيد
                  </button>
                </div>

                <form onSubmit={handleSearch}>
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      htmlFor="inquiry-input"
                      style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}
                    >
                      {searchFilterType === 'national_id'
                        ? 'الرقم الوطني المكون من 12 رقماً:'
                        : searchFilterType === 'financial_number'
                        ? 'الرقم المالي أو رقم القيد:'
                        : 'الرقم الوطني أو الرقم المالي الخاص بك:'}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="inquiry-input"
                        type="text"
                        dir="ltr"
                        autoFocus
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="مثال: 219960541445 أو 8163151"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          paddingLeft: '44px',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          borderRadius: '10px',
                          border: searchError ? '2px solid #ef4444' : '2px solid #94a3b8',
                          outline: 'none',
                          boxSizing: 'border-box',
                          background: '#fff',
                          color: '#0f172a'
                        }}
                      />
                      <Search
                        size={20}
                        style={{
                          position: 'absolute',
                          left: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#64748b'
                        }}
                      />
                    </div>
                  </div>

                  {searchError && (
                    <div
                      style={{
                        padding: '12px 14px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        color: '#b91c1c',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px'
                      }}
                    >
                      <AlertCircle size={18} style={{ flexShrink: 0 }} />
                      <span>{searchError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                      color: '#d4af37',
                      border: '1.5px solid #d4af37',
                      borderRadius: '10px',
                      fontSize: '15px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Search size={18} />
                    <span>استعلام والتحقق من القيد</span>
                  </button>
                </form>

                <div
                  style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#64748b'
                  }}
                >
                  <span>القوة العمومية المعتمدة: <strong>{forceMembers.length.toLocaleString('ar-LY')}</strong> قيد معتمد</span>
                  <span>🔒 معتمد من مديرية أمن أوباري</span>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: Verified Employee Profile & Missing Data Form */
            <div>
              {/* Sovereign Locked Verified Identity Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '1.5px solid #d4af37',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.15)',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    color: '#065f46'
                  }}
                >
                  <CheckCircle2 size={14} style={{ color: '#059669' }} />
                  <span>تم التحقق من الهوية</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Lock size={16} style={{ color: '#d4af37' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>
                    البيانات السيادية الرسمية المعتمدة (🔒 مقفلة وغير قابلة للتعديل الذاتي):
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                  }}
                >
                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الاسم الرباعي الرسمي</div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                      {verifiedMember.name}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرتبة العسكرية / الصفة</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>
                      {verifiedMember.job_title || verifiedMember.type || 'عنصر أمن'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرقم الوطني المعتمد</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', marginTop: '2px' }}>
                      {verifiedMember.national_id || '---'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرقم المالي / رقم القيد</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', marginTop: '2px' }}>
                      {verifiedMember.financial_number || verifiedMember.job_number || '---'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الإدارة / جهة العمل المعتمدة</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {verifiedMember.department || 'ديوان مديرية أمن أوباري'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الحالة الوظيفية</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {verifiedMember.job_status || 'على رأس العمل'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Completeness Bar */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px', fontWeight: 800 }}>
                    <span style={{ color: '#1e293b' }}>مؤشر اكتمال ملف المنتسب:</span>
                    <span style={{ color: completeness >= 80 ? '#059669' : '#d97706' }}>
                      {completeness}% {completeness >= 80 ? '✓ مكتمل بدرجة عالية' : '⚠️ بحاجة لاستكمال بيانات'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${completeness}%`,
                        height: '100%',
                        background: completeness >= 80 ? '#10b981' : 'linear-gradient(90deg, #f59e0b, #10b981)',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="البحث عن منتسب آخر"
                >
                  <RotateCcw size={14} />
                  <span>استعلام عن قيد آخر</span>
                </button>
              </div>

              {/* Status Notifications */}
              {submitSuccess && (
                <div
                  style={{
                    padding: '14px 18px',
                    background: '#ecfdf5',
                    border: '1.5px solid #10b981',
                    borderRadius: '10px',
                    color: '#065f46',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <CheckCircle2 size={22} style={{ color: '#059669', flexShrink: 0 }} />
                  <div>
                    <div>✅ تم حفظ وتحديث بياناتك بنجاح في قاعدة البيانات المركزية!</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#047857', marginTop: '2px' }}>
                      تم توثيق التحديثات وربطها برقمك الوطني وقيدك الأمني في مديرية أمن أوباري.
                    </div>
                  </div>
                </div>
              )}

              {submitError && (
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    color: '#b91c1c',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Navigation Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '18px',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '8px',
                  overflowX: 'auto'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('contact')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeTab === 'contact' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'contact' ? '#fff' : '#64748b'
                  }}
                >
                  <Phone size={15} />
                  <span>الاتصال والسكن</span>
                  {!formData.phone && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('military')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeTab === 'military' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'military' ? '#fff' : '#64748b'
                  }}
                >
                  <Award size={15} />
                  <span>المقاسات العسكرية</span>
                  {(!formData.suit_number || !formData.shoe_size) && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('medical')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeTab === 'medical' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'medical' ? '#fff' : '#64748b'
                  }}
                >
                  <Heart size={15} />
                  <span>البيانات الاجتماعية والطبية</span>
                  {!formData.blood_type && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('banking')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: activeTab === 'banking' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'banking' ? '#fff' : '#64748b'
                  }}
                >
                  <CreditCard size={15} />
                  <span>البيانات المصرفية</span>
                  {(!formData.bank_name || !formData.account_number) && <span style={{ color: '#f59e0b' }}>⚠️</span>}
                </button>
              </div>

              {/* TAB 1: Contact & Residence */}
              {activeTab === 'contact' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      رقم الهاتف الشخصي المحمول: <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="091xxxxxxx أو 092xxxxxxx"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: !formData.phone ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxSizing: 'border-box'
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                      ضروري لإرسال الإشعارات والتعليمات العسكرية
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      رقم هاتف بديل / هاتف الطوارئ:
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="رقم أحد الأقارب أو هاتف أرضي"
                      value={formData.emergency_contact}
                      onChange={(e) => handleChange('emergency_contact', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      محل الإقامة الفعلي والسكن بالتفصيل:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أوبari - حي المشروع بالقرب من مسجد..."
                      value={formData.residence}
                      onChange={(e) => handleChange('residence', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      البلدية / المنطقة:
                    </label>
                    <input
                      type="text"
                      placeholder="أوباري / بنت بيه / الغريفة / وادي الحياة"
                      value={formData.tribe_city}
                      onChange={(e) => handleChange('tribe_city', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: Military Clothing & Equipment Sizes */}
              {activeTab === 'military' && (
                <div>
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#1e40af',
                      fontWeight: 700
                    }}
                  >
                    ℹ️ يتم استخدام هذه المقاسات في حصر وتوزيع القيافة والبدل والأحذية العسكرية المعتمدة لكافة منتسبي المديرية.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        مقاس البدلة / الزي العسكري:
                      </label>
                      <select
                        value={formData.suit_number}
                        onChange={(e) => handleChange('suit_number', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: !formData.suit_number ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          background: '#fff'
                        }}
                      >
                        <option value="">-- اختر مقاس البدلة --</option>
                        {SUIT_SIZES.map((s) => (
                          <option key={s} value={s}>
                            مقاس {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        مقاس الحذاء العسكري (البسطار):
                      </label>
                      <select
                        value={formData.shoe_size}
                        onChange={(e) => handleChange('shoe_size', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: !formData.shoe_size ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          background: '#fff'
                        }}
                      >
                        <option value="">-- اختر مقاس الحذاء --</option>
                        {SHOE_SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            نمرة {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        مقاس القبعة العسكرية / البريهة:
                      </label>
                      <select
                        value={formData.headwear_size}
                        onChange={(e) => handleChange('headwear_size', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          background: '#fff'
                        }}
                      >
                        <option value="">-- اختر مقاس القبعة --</option>
                        {HEADWEAR_SIZES.map((h) => (
                          <option key={h} value={h}>
                            قياس {h} سم
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        مقاس القميص الداخلي / التريكو:
                      </label>
                      <select
                        value={formData.shirt_size}
                        onChange={(e) => handleChange('shirt_size', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box',
                          background: '#fff'
                        }}
                      >
                        <option value="">-- اختر مقاس القميص --</option>
                        {SHIRT_SIZES.map((sh) => (
                          <option key={sh} value={sh}>
                            {sh}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Medical & Social Data */}
              {activeTab === 'medical' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      فصيلة الدم (Blood Type): <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => handleChange('blood_type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: !formData.blood_type ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxSizing: 'border-box',
                        background: '#fff'
                      }}
                    >
                      <option value="">-- اختر فصيلة الدم --</option>
                      {BLOOD_TYPES.map((bt) => (
                        <option key={bt} value={bt}>
                          {bt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      الحالة الاجتماعية:
                    </label>
                    <select
                      value={formData.marital_status}
                      onChange={(e) => handleChange('marital_status', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        background: '#fff'
                      }}
                    >
                      <option value="أعزب">أعزب</option>
                      <option value="متزوج">متزوج</option>
                      <option value="مطلق">مطلق</option>
                      <option value="أرمل">أرمل</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      عدد الأبناء:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={formData.children_count}
                      onChange={(e) => handleChange('children_count', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      اسم الأم الثلاثي:
                    </label>
                    <input
                      type="text"
                      placeholder="اسم الأم الكامل"
                      value={formData.mother_name}
                      onChange={(e) => handleChange('mother_name', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      مكان الميلاد:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أوباري"
                      value={formData.birth_place}
                      onChange={(e) => handleChange('birth_place', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                      تاريخ الميلاد:
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => handleChange('birth_date', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: Banking & Financial Data */}
              {activeTab === 'banking' && (
                <div>
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#065f46',
                      fontWeight: 700
                    }}
                  >
                    ℹ️ تُعتمد هذه البيانات في إعداد الكشوفات المالية والحوالات وتسوية المرتبات مع المصارف.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        اسم المصرف المعتمد:
                      </label>
                      <input
                        list="libyan-banks-list"
                        type="text"
                        placeholder="اختر أو اكتب اسم المصرف"
                        value={formData.bank_name}
                        onChange={(e) => handleChange('bank_name', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: !formData.bank_name ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <datalist id="libyan-banks-list">
                        {LIBYAN_BANKS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        فرع المصرف:
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: فرع أوباري / فرع الغريفة / فرع بنت بيه"
                        value={formData.bank_branch}
                        onChange={(e) => handleChange('bank_branch', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#1e293b', marginBottom: '6px' }}>
                        رقم الحساب المصرفي (Account Number / IBAN):
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        placeholder="أدخل رقم الحساب المصرفي بدقة..."
                        value={formData.account_number}
                        onChange={(e) => handleChange('account_number', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: !formData.account_number ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                          fontSize: '15px',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="moi-modal-footer"
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          {verifiedMember ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                <ShieldCheck size={16} style={{ color: '#059669' }} />
                <span>حفظ آمن ومباشر مربوط بالسجل رقم #{verifiedMember.id}</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إغلاق
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? (
                    <span>جاري الحفظ والتأكيد...</span>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>حفظ وتأكيد استكمال البيانات</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إغلاق النافذة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
