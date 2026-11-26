import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  FileCheck2,
  GraduationCap,
  Languages,
  BookOpen,
  FileText,
  Check,
  AlertTriangle,
  Filter,
  Briefcase
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

// Education levels preset
const EDUCATION_LEVELS = [
  'علوم شرطية وأمنية',
  'علوم عسكرية',
  'ليسانس قانون / حقوق',
  'بكالوريوس علوم أمنية',
  'بكالوريوس هندسة / تقنية معلومات',
  'بكالوريوس إدارة واقتصاد',
  'دبلوم عالي',
  'دبلوم متوسط',
  'شهادة ثانوية عامة',
  'شهادة إعدادية',
  'تعليم أساسي / ابتدائي',
  'دراسات عليا (ماجستير/دكتوراه)'
];

// Common languages preset
const LANGUAGES_OPTIONS = [
  'العربية',
  'العربية والإنجليزية',
  'العربية والفرنسية',
  'العربية والطارقية (التماشق)',
  'العربية ولغات أخرى'
];

// Health conditions preset
const HEALTH_CONDITIONS = [
  'سليم ولائق صحياً',
  'ضغط دم مزمن',
  'سكري',
  'أمراض قلب وشرايين',
  'حساسية / ربو مزمن',
  'إصابة عمل سابقة',
  'أخرى (يرجى التدوين في الملاحظات)'
];

export default function EmployeeInquiryModal({ isOpen, onClose, forceMembers = [], onUpdateMember }) {
  // Search States (Strictly National/Admin ID + رقم القيد Two-Factor Verification)
  const [searchInput, setSearchInput] = useState('');
  const [recordNumberInput, setRecordNumberInput] = useState('');
  const [searchError, setSearchError] = useState(null);

  // Active Verified Employee
  const [verifiedMember, setVerifiedMember] = useState(null);

  // Editable Form Data
  const [formData, setFormData] = useState({});

  // Active Tab: 'family' | 'career' | 'contact' | 'education' | 'military' | 'banking'
  const [activeTab, setActiveTab] = useState('career');

  // Filter to show empty fields only
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Complete exhaustive list of all 35 editable / completable fields
  const TRACKED_FIELDS = useMemo(() => [
    // Career & Appointment (التعيين والترقيات والبيانات الوظيفية)
    { key: 'appointment_decision', label: 'قرار التعيين', tab: 'career' },
    { key: 'appointment_date', label: 'تاريخ التعيين', tab: 'career' },
    { key: 'start_date', label: 'تاريخ المباشرة الفعلية', tab: 'career' },
    { key: 'last_promotion_decision', label: 'قرار آخر ترقية', tab: 'career' },
    { key: 'last_promotion_date', label: 'تاريخ آخر ترقية', tab: 'career' },
    { key: 'basic_salary', label: 'المرتب الأساسي', tab: 'career' },

    // Family & Personal (البيانات العائلية والشخصية)
    { key: 'mother_name', label: 'اسم الأم ثلاثياً', tab: 'family' },
    { key: 'marital_status', label: 'الحالة الاجتماعية', tab: 'family' },
    { key: 'wife_name', label: 'اسم الزوجة', tab: 'family', conditional: (d) => d.marital_status === 'متزوج' },
    { key: 'children_count', label: 'عدد الأبناء', tab: 'family' },
    { key: 'family_book', label: 'رقم كتيب العائلة', tab: 'family' },
    { key: 'family_paper', label: 'رقم ورقة العائلة', tab: 'family' },
    { key: 'family_record', label: 'رقم قيد العائلة', tab: 'family' },
    { key: 'passport_number', label: 'رقم الجواز', tab: 'family' },
    { key: 'birth_place', label: 'مكان الميلاد', tab: 'family' },
    { key: 'birth_date', label: 'تاريخ الميلاد', tab: 'family' },

    // Contact & Residence (الاتصال والإقامة)
    { key: 'phone', label: 'رقم الهاتف الشخصي', tab: 'contact' },
    { key: 'emergency_contact', label: 'هاتف الطوارئ / قريب', tab: 'contact' },
    { key: 'email', label: 'البريد الإلكتروني', tab: 'contact' },
    { key: 'residence', label: 'محل الإقامة الفعلي', tab: 'contact' },
    { key: 'tribe_city', label: 'القبيلة / المدينة', tab: 'contact' },

    // Education & Languages (المؤهل العلمي واللغات)
    { key: 'education_level', label: 'المستوى الدراسي (المؤهل)', tab: 'education' },
    { key: 'languages', label: 'اللغات التي يجيدها', tab: 'education' },

    // Physical & Uniform Sizes (المقاسات والتجهيزات الرسمية والبدنية)
    { key: 'blood_type', label: 'فصيلة الدم', tab: 'military' },
    { key: 'suit_number', label: 'رقم / مقاس البدلة', tab: 'military' },
    { key: 'shoe_size', label: 'رقم الحذاء الرسمي (البيادة)', tab: 'military' },
    { key: 'headwear_size', label: 'مقاس غطاء الرأس', tab: 'military' },
    { key: 'shirt_size', label: 'مقاس القميص', tab: 'military' },
    { key: 'height', label: 'الطول (سم)', tab: 'military' },
    { key: 'weight', label: 'الوزن (كجم)', tab: 'military' },
    { key: 'diseases', label: 'الحالة الصحية / الأمراض', tab: 'military' },

    // Banking & Financial (البيانات المصرفية)
    { key: 'bank_name', label: 'اسم المصرف', tab: 'banking' },
    { key: 'bank_branch', label: 'فرع المصرف', tab: 'banking' },
    { key: 'account_number', label: 'رقم الحساب المصرفي', tab: 'banking' }
  ], []);

  // Compute list of currently empty fields for this employee
  const emptyFields = useMemo(() => {
    if (!verifiedMember) return [];
    return TRACKED_FIELDS.filter((f) => {
      if (f.conditional && !f.conditional(formData)) return false;
      const val = formData[f.key];
      return !val || String(val).trim() === '' || String(val).trim() === '-';
    });
  }, [verifiedMember, formData, TRACKED_FIELDS]);

  // Compute profile completeness score (Hooks must be called before any return!)
  const completeness = useMemo(() => {
    if (!verifiedMember) return 0;
    const applicableFields = TRACKED_FIELDS.filter((f) => {
      if (f.conditional && !f.conditional(formData)) return false;
      return true;
    });
    if (applicableFields.length === 0) return 100;
    const filledCount = applicableFields.length - emptyFields.length;
    return Math.round((filledCount / applicableFields.length) * 100);
  }, [verifiedMember, TRACKED_FIELDS, emptyFields, formData]);

  // Helper to check if a specific field is empty
  const isFieldEmpty = (key) => {
    const val = formData[key];
    return !val || String(val).trim() === '' || String(val).trim() === '-';
  };

  // Load matched member record into form
  const loadMemberIntoForm = (match, autoEmail = null) => {
    setVerifiedMember(match);
    setFormData({
      // Career & Appointment
      appointment_decision: match.appointment_decision && match.appointment_decision !== '-' ? match.appointment_decision : '',
      appointment_date: match.appointment_date && match.appointment_date !== '-' ? match.appointment_date : '',
      start_date: match.start_date && match.start_date !== '-' ? match.start_date : '',
      last_promotion_decision: match.last_promotion_decision && match.last_promotion_decision !== '-' ? match.last_promotion_decision : '',
      last_promotion_date: match.last_promotion_date && match.last_promotion_date !== '-' ? match.last_promotion_date : '',
      basic_salary: match.basic_salary && match.basic_salary !== '-' ? String(match.basic_salary) : '',

      // Family & Personal
      mother_name: match.mother_name && match.mother_name !== '-' ? match.mother_name : '',
      marital_status: match.marital_status && match.marital_status !== '-' ? match.marital_status : 'متزوج',
      wife_name: match.wife_name && match.wife_name !== '-' ? match.wife_name : '',
      children_count: match.children_count !== undefined && match.children_count !== '-' ? String(match.children_count) : '',
      family_book: match.family_book && match.family_book !== '-' ? match.family_book : '',
      family_paper: match.family_paper && match.family_paper !== '-' ? match.family_paper : '',
      family_record: match.family_record && match.family_record !== '-' ? match.family_record : '',
      passport_number: match.passport_number && match.passport_number !== '-' ? match.passport_number : '',
      birth_place: match.birth_place && match.birth_place !== '-' ? match.birth_place : '',
      birth_date: match.birth_date && match.birth_date !== '-' ? match.birth_date : '',

      // Contact & Residence
      phone: match.phone && match.phone !== '-' ? match.phone : '',
      emergency_contact: match.emergency_contact || match.notes || '',
      email: autoEmail || (match.email && match.email !== '-' ? match.email : ''),
      residence: match.residence && match.residence !== '-' ? match.residence : '',
      tribe_city: match.tribe_city && match.tribe_city !== '-' ? match.tribe_city : '',

      // Education & Languages
      education_level: match.education_level && match.education_level !== '-' ? match.education_level : '',
      languages: match.languages && match.languages !== '-' ? match.languages : 'العربية',

      // Military Uniform & Physical
      blood_type: match.blood_type && match.blood_type !== '-' ? match.blood_type : '',
      suit_number: match.suit_number && match.suit_number !== '-' ? match.suit_number : '',
      shoe_size: match.shoe_size && match.shoe_size !== '-' ? match.shoe_size : '',
      headwear_size: match.headwear_size && match.headwear_size !== '-' ? match.headwear_size : '',
      shirt_size: match.shirt_size && match.shirt_size !== '-' ? match.shirt_size : '',
      height: match.height && match.height !== '-' ? match.height : '',
      weight: match.weight && match.weight !== '-' ? match.weight : '',
      diseases: match.diseases && match.diseases !== '-' ? match.diseases : 'سليم ولائق صحياً',

      // Banking
      bank_name: match.bank_name && match.bank_name !== '-' ? match.bank_name : '',
      bank_branch: match.bank_branch && match.bank_branch !== '-' ? match.bank_branch : '',
      account_number: match.account_number && match.account_number !== '-' ? match.account_number : ''
    });
    // Default active tab to career (appointment) to easily inspect and complete appointment details
    setActiveTab('career');
  };

  // Strict Two-Factor Verification: (الرقم الوطني أو الإداري) + (رقم القيد)
  // يتحقق من الخادم الحي أولاً (عند الاتصال) ثم من السجل المحلي في حالة العرض الثابت
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setSubmitSuccess(false);
    setSubmitError(null);

    const cleanId = sanitizeDigits(searchInput);
    if (!cleanId || cleanId.length < 4 || cleanId.length > 14) {
      setSearchError('يرجى إدخال الرقم الوطني المعتمد (12 رقماً) أو الرقم الإداري / الوظيفي الصحيح.');
      setVerifiedMember(null);
      return;
    }

    const cleanRecord = sanitizeDigits(recordNumberInput);
    if (!recordNumberInput.trim() || !cleanRecord) {
      setSearchError('تنبيه أمني: يلزم إدخال رقم القيد المربوط بالرقم الوطني أو الإداري؛ لا يمكن عرض الاستعلام لمن لم يدخل رقم القيد.');
      setVerifiedMember(null);
      return;
    }

    // 1. محاولة التحقق الفوري من الخادم المركزي (Node / cPanel) لجلب أحدث نسخة معتمدة دون كشف بقية السجلات
    for (const ep of ['api/force/self-inquiry', '/api/force/self-inquiry', 'api/get-force.php', '/api/get-force.php']) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: cleanId, record_number: cleanRecord })
        });
        if (res.status === 404 || res.status === 405) continue;
        const json = await res.json().catch(() => null);
        if (res.ok && json && json.success && json.data) {
          loadMemberIntoForm({ ...json.data, family_record: json.data.family_record || cleanRecord });
          return;
        }
        if (res.status === 403 || res.status === 400) {
          setSearchError(json?.message || 'رقم القيد المدخل غير متطابق مع الرقم الوطني أو الإداري.');
          setVerifiedMember(null);
          return;
        }
      } catch (_) {}
    }

    // 2. التحقق المحلي الاحتياطي في وضع العرض الثابت (بدون خادم)
    const candidates = forceMembers.filter((m) => {
      const nat = sanitizeDigits(m.national_id);
      const fin = sanitizeDigits(m.financial_number);
      const job = sanitizeDigits(m.job_number);
      const mil = sanitizeDigits(m.military_number);
      return (nat && nat === cleanId) || (fin && fin === cleanId) || (job && job === cleanId) || (mil && mil === cleanId);
    });

    if (candidates.length === 0) {
      setSearchError(`عفواً، لم يتم العثور على أي قيد مطابق للرقم الوطني أو الإداري المدخل [${searchInput}]. يرجى التأكد من كتابته بدقة.`);
      setVerifiedMember(null);
      return;
    }

    // Verify linked رقم القيد (family_record / record_number)
    const getRecordDigits = (m) => sanitizeDigits(m.family_record || m.record_number);
    const exactMatch = candidates.find((m) => {
      const rec = getRecordDigits(m);
      return rec && rec === cleanRecord;
    });

    if (!exactMatch) {
      const anyHasRecord = candidates.some((m) => Boolean(getRecordDigits(m)));
      if (!anyHasRecord) {
        setSearchError('عذراً، لم يتم ربط وتفعيل رقم القيد لهذا المنتسب في السجل المركزي بعد. يرجى مراجعة قسم شؤون الضباط والأفراد لإضافة رقم القيد، ولا يمكن إظهار الاستعلام بدونه.');
      } else {
        setSearchError('عذراً، رقم القيد المدخل غير متطابق مع الرقم الوطني أو الإداري لهذا المنتسب. تم حجب البيانات لحماية الخصوصية.');
      }
      setVerifiedMember(null);
      return;
    }

    loadMemberIntoForm(exactMatch);
  };

  // Reset to search another employee
  const handleResetSearch = () => {
    setVerifiedMember(null);
    setFormData({});
    setSearchError(null);
    setSubmitSuccess(false);
    setSubmitError(null);
    setSearchInput('');
    setRecordNumberInput('');
    setShowEmptyOnly(false);
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
      // Build clean update payload containing all 34 editable personnel details
      const updates = {
        // Career & Appointment
        appointment_decision: formData.appointment_decision?.trim() || '',
        appointment_date: formData.appointment_date?.trim() || '',
        start_date: formData.start_date?.trim() || '',
        last_promotion_decision: formData.last_promotion_decision?.trim() || '',
        last_promotion_date: formData.last_promotion_date?.trim() || '',
        basic_salary: formData.basic_salary?.trim() || '',

        // Family & Personal
        mother_name: formData.mother_name?.trim() || '',
        marital_status: formData.marital_status || '',
        wife_name: formData.wife_name?.trim() || '',
        children_count: formData.children_count || '0',
        family_book: formData.family_book?.trim() || '',
        family_paper: formData.family_paper?.trim() || '',
        family_record: formData.family_record?.trim() || '',
        passport_number: formData.passport_number?.trim() || '',
        birth_place: formData.birth_place?.trim() || '',
        birth_date: formData.birth_date || '',

        // Contact & Residence
        phone: formData.phone?.trim() || '',
        emergency_contact: formData.emergency_contact?.trim() || '',
        notes: formData.emergency_contact?.trim() || '',
        email: formData.email?.trim() || '',
        residence: formData.residence?.trim() || '',
        tribe_city: formData.tribe_city?.trim() || '',

        // Education & Languages
        education_level: formData.education_level?.trim() || '',
        languages: formData.languages?.trim() || '',

        // Military & Physical
        blood_type: formData.blood_type || '',
        suit_number: formData.suit_number || '',
        shoe_size: formData.shoe_size || '',
        headwear_size: formData.headwear_size || '',
        shirt_size: formData.shirt_size || '',
        height: formData.height || '',
        weight: formData.weight || '',
        diseases: formData.diseases || '',

        // Banking
        bank_name: formData.bank_name || '',
        bank_branch: formData.bank_branch?.trim() || '',
        account_number: formData.account_number?.trim() || ''
      };

      // Call parent updater which updates memory, localStorage, and calls backend API safely
      if (onUpdateMember) {
        const res = await onUpdateMember(verifiedMember.id, {
          ...updates,
          family_record: updates.family_record || sanitizeDigits(recordNumberInput)
        });
        if (res && res.success === false) {
          setSubmitError(res.message || 'تعذر حفظ التعديلات على الخادم المركزي.');
          return;
        }
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

  // Helper Badge Component to clearly mark empty fields for individuals
  const FieldStatusBadge = ({ fieldKey, isRequired = false }) => {
    const empty = isFieldEmpty(fieldKey);
    if (empty) {
      return (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '12px',
            background: '#fffbeb',
            color: '#b45309',
            border: '1px solid #fde68a',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <AlertTriangle size={12} style={{ color: '#d97706' }} />
          <span>حقل فارغ - مطلوب تعبئته</span>
          {isRequired && <span style={{ color: '#dc2626' }}>*</span>}
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: '10.5px',
          fontWeight: 700,
          padding: '2px 7px',
          borderRadius: '12px',
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px'
        }}
      >
        <Check size={11} style={{ color: '#16a34a' }} />
        <span>مكتمل</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="moi-modal-overlay" style={{ zIndex: 100000 }}>
      <div
        className="moi-modal-box"
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(10, 25, 47, 0.45)',
          border: '2px solid #d4af37'
        }}
      >
        {/* Modal Sovereign Header */}
        <div
          className="moi-modal-header"
          style={{
            background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '3px solid #d4af37',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '4px',
                border: '1.5px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <img
                src="./moi-logo.png"
                onError={(e) => {
                  e.currentTarget.src = MOI_LOGO_BASE64;
                }}
                alt="شعار وزارة الداخلية"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid #d4af37',
                    color: '#d4af37',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 800
                  }}
                >
                  بوابة الخدمة الذاتية للأفراد
                </span>
                <span style={{ fontSize: '11px', color: '#cbd5e1' }}>وزارة الداخلية - مديرية أمن أوباري</span>
              </div>
              <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#ffffff', margin: '4px 0 0' }}>
                بوابة منتسبي المديرية | استعلام واستكمال الحقول الفارغة (تاريخ التعيين، القرارات، البيانات العائلية والمقاسات)
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            title="إغلاق النافذة"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
          {!verifiedMember ? (
            /* STEP 1: Strict Two-Factor Verification (الرقم الوطني أو الإداري + رقم القيد) */
            <div style={{ maxWidth: '600px', margin: '15px auto', textAlign: 'center' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  border: '2px solid #bfdbfe',
                  color: '#1e3a8a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <ShieldCheck size={34} style={{ color: '#1e3a8a' }} />
              </div>

              <h3 style={{ fontSize: '19px', fontWeight: 900, color: '#0a192f', marginBottom: '8px' }}>
                بوابة استعلام واستيفاء بيانات المنتسب
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
                لحماية خصوصية البيانات ومنع الاطلاع غير المصرح به، يلزم إدخال <strong>الرقم الوطني أو الإداري</strong> مع <strong>رقم القيد</strong> المربوط بالملف معاً.
              </p>

              <form onSubmit={handleSearch} style={{
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '14px',
                padding: '22px',
                textAlign: 'right',
                boxShadow: '0 4px 16px rgba(10, 25, 47, 0.06)'
              }}>
                {/* Field 1: National ID or Administrative Number */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '6px' }}>
                    1. الرقم الوطني أو الرقم الإداري المعتمد (الرقم الوظيفي / المالي):
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={14}
                      placeholder="مثال: 119960541445 أو 8163151"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (searchError) setSearchError(null);
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: '44px',
                        borderRadius: '10px',
                        border: '2px solid #cbd5e1',
                        fontSize: '15.5px',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                      autoFocus
                    />
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                      <Hash size={20} />
                    </div>
                  </div>
                </div>

                {/* Field 2: Linked Record Number (رقم القيد) - Mandatory */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 800, color: '#1e3a8a', marginBottom: '6px' }}>
                    <span>2. رقم القيد (مربوط بالرقم الوطني أو الإداري):</span>
                    <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 800, background: '#fef2f2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                      إلزامي للتحقق *
                    </span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      dir="ltr"
                      maxLength={20}
                      placeholder="أدخل رقم القيد المعتمد..."
                      value={recordNumberInput}
                      onChange={(e) => {
                        setRecordNumberInput(e.target.value);
                        if (searchError) setSearchError(null);
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: '44px',
                        borderRadius: '10px',
                        border: recordNumberInput.trim() ? '2px solid #1e3a8a' : '2px solid #f59e0b',
                        fontSize: '15.5px',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        boxSizing: 'border-box',
                        outline: 'none',
                        background: recordNumberInput.trim() ? '#ffffff' : '#fffbeb'
                      }}
                    />
                    <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#1e3a8a' }}>
                      <Lock size={19} />
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, marginTop: '6px' }}>
                    تنبيه أمني: من لم يدخل رقم القيد المطابق لرقمه الوطني أو الإداري لن يتمكن من فتح الاستعلام أو عرض البيانات.
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
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '14px'
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{searchError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!searchInput.trim() || !recordNumberInput.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (!searchInput.trim() || !recordNumberInput.trim())
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                    color: '#ffffff',
                    border: (!searchInput.trim() || !recordNumberInput.trim())
                      ? '1.5px solid #cbd5e1'
                      : '1.5px solid #d4af37',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: (!searchInput.trim() || !recordNumberInput.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: (!searchInput.trim() || !recordNumberInput.trim()) ? 'none' : '0 4px 14px rgba(10, 25, 47, 0.2)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Search size={18} />
                  <span>التحقق من رقم القيد وعرض الملف</span>
                </button>
              </form>

              {/* Official Advisory & Employee Appreciation Banner */}
              <div
                style={{
                  marginTop: '24px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                  border: '1.5px solid #d4af37',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  textAlign: 'right',
                  boxShadow: '0 2px 10px rgba(212, 175, 55, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a', fontWeight: 800, fontSize: '13px', marginBottom: '8px' }}>
                  <Info size={18} style={{ color: '#d4af37' }} />
                  <span>تنويه إداري هام لجميع المنتسبين:</span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#334155', lineHeight: 1.8, fontWeight: 600 }}>
                  يرجى التأكد التام من إدخال البيانات بشكل صحيح ودقيق، والالتزام بتعبئة واستيفاء كافة الحقول المطلوبة لضمان اكتمال وتحديث ملفك الشخصي بالقوة العمومية.
                </p>
                <div style={{
                  paddingTop: '10px',
                  borderTop: '1px dashed #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#065f46',
                  fontWeight: 800,
                  fontSize: '12px'
                }}>
                  <Award size={16} style={{ color: '#059669', flexShrink: 0 }} />
                  <span>تتقدم إدارة المنظومة بخالص الشكر والتقدير لجميع الموظفين والمنتسبين على حسن تعاونهم والتزامهم.</span>
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
                  padding: '16px 20px',
                  marginBottom: '16px',
                  boxShadow: '0 4px 16px rgba(212, 175, 55, 0.12)',
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
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
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
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Lock size={16} style={{ color: '#d4af37' }} />
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1e3a8a' }}>
                    البيانات السيادية الرسمية (🔒 مقفلة وغير قابلة للتعديل الذاتي):
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '10px'
                  }}
                >
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الاسم الرباعي الرسمي</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                      {verifiedMember.name}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرتبة الشرطية / الوظيفة</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>
                      {verifiedMember.job_title || (verifiedMember.type === 'مدني' ? 'موظف مدني' : 'عضو هيئة الشرطة')}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الكادر المعتمد بالمديرية</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: verifiedMember.type === 'مدني' ? '#475569' : '#0369a1', marginTop: '2px' }}>
                      {verifiedMember.type === 'مدني' ? 'كادر الموظفين المدنيين (مدني)' : 'هيئة الشرطة (شرطي)'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرقم الوطني / الإداري المعتمد</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', marginTop: '2px' }}>
                      {verifiedMember.national_id || '---'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الرقم المالي / الوظيفي</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', direction: 'ltr', textAlign: 'right', marginTop: '2px' }}>
                      {verifiedMember.financial_number || verifiedMember.job_number || '---'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الإدارة / جهة العمل المعتمدة</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {verifiedMember.department || 'ديوان مديرية أمن أوباري'}
                    </div>
                  </div>

                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>الحالة الوظيفية</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                      {verifiedMember.job_status || 'على رأس العمل'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Fields Notice & Completeness Bar */}
              <div
                style={{
                  background: emptyFields.length > 0 ? '#fffbeb' : '#f0fdf4',
                  border: emptyFields.length > 0 ? '1.5px solid #fde68a' : '1.5px solid #bbf7d0',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {emptyFields.length > 0 ? (
                      <AlertTriangle size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                    ) : (
                      <CheckCircle2 size={20} style={{ color: '#16a34a', flexShrink: 0 }} />
                    )}
                    <div>
                      <span style={{ fontSize: '13.5px', fontWeight: 900, color: emptyFields.length > 0 ? '#92400e' : '#166534' }}>
                        {emptyFields.length > 0
                          ? `تنبيه الحقول الفارغة: يوجد (${emptyFields.length}) حقول فارغة تحتاج إلى استكمال من المنتسب`
                          : 'تهانينا! كافة بيانات ملفك الشخصي مكتملة 100%'}
                      </span>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        نسبة اكتمال الملف: <strong>{completeness}%</strong> (تم تعبئة {TRACKED_FIELDS.length - emptyFields.length} من أصل {TRACKED_FIELDS.length} حقول)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowEmptyOnly(!showEmptyOnly)}
                      style={{
                        padding: '6px 12px',
                        background: showEmptyOnly ? '#b45309' : '#ffffff',
                        color: showEmptyOnly ? '#ffffff' : '#b45309',
                        border: '1px solid #d97706',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Filter size={13} />
                      <span>{showEmptyOnly ? 'عرض كافة الحقول' : `عرض الحقول الفارغة فقط (${emptyFields.length})`}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSearch}
                      style={{
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="البحث عن منتسب آخر"
                    >
                      <RotateCcw size={13} />
                      <span>استعلام آخر</span>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${completeness}%`,
                      height: '100%',
                      background: completeness >= 80 ? '#10b981' : completeness >= 50 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>

                {/* Quick Empty Fields Badges */}
                {emptyFields.length > 0 && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#78350f' }}>حقول متبقية:</span>
                    {emptyFields.slice(0, 10).map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setActiveTab(f.tab)}
                        style={{
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#92400e',
                          cursor: 'pointer'
                        }}
                        title={`الانتقال لتعبئة ${f.label}`}
                      >
                        + {f.label}
                      </button>
                    ))}
                    {emptyFields.length > 10 && (
                      <span style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>
                        +{emptyFields.length - 10} حقول أخرى
                      </span>
                    )}
                  </div>
                )}
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
                    marginBottom: '16px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                  }}
                >
                  <CheckCircle2 size={22} style={{ color: '#059669', flexShrink: 0 }} />
                  <div>
                    <div>✅ تم حفظ وتوثيق البيانات بنجاح في قاعدة البيانات المركزية!</div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#047857', marginTop: '2px' }}>
                      تم اعتماد التحديثات (التعيين، الترقيات، البيانات العائلية والمقاسات) وربطها برقمك الوطني وقيدك الأمني في منظومة مديرية أمن أوباري.
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
                    marginBottom: '16px'
                  }}
                >
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Form Navigation Tabs (6 Complete Categories) */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  marginBottom: '16px',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '8px',
                  overflowX: 'auto'
                }}
              >
                {/* TAB BUTTON: Career & Appointment (التعيين والترقيات والبيانات الوظيفية) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('career')}
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
                    background: activeTab === 'career' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'career' ? '#fff' : '#64748b'
                  }}
                >
                  <Award size={16} />
                  <span>التعيين والترقيات والبيانات الوظيفية</span>
                  {emptyFields.filter(f => f.tab === 'career').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'career').length}
                    </span>
                  )}
                </button>

                {/* TAB BUTTON: Family & Personal (البيانات العائلية والشخصية) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('family')}
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
                    background: activeTab === 'family' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'family' ? '#fff' : '#64748b'
                  }}
                >
                  <BookOpen size={16} />
                  <span>البيانات العائلية والشخصية</span>
                  {emptyFields.filter(f => f.tab === 'family').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'family').length}
                    </span>
                  )}
                </button>

                {/* TAB BUTTON: Contact & Residence (الاتصال والإقامة) */}
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
                  <Phone size={16} />
                  <span>الاتصال والإقامة</span>
                  {emptyFields.filter(f => f.tab === 'contact').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'contact').length}
                    </span>
                  )}
                </button>

                {/* TAB BUTTON: Education & Languages (المؤهل العلمي واللغات) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('education')}
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
                    background: activeTab === 'education' ? '#1e3a8a' : 'transparent',
                    color: activeTab === 'education' ? '#fff' : '#64748b'
                  }}
                >
                  <GraduationCap size={16} />
                  <span>المؤهل العلمي واللغات</span>
                  {emptyFields.filter(f => f.tab === 'education').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'education').length}
                    </span>
                  )}
                </button>

                {/* TAB BUTTON: Uniform & Physical Measurements (المقاسات والتجهيزات الرسمية والبدنية) */}
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
                  <Scissors size={16} />
                  <span>المقاسات والتجهيزات والعهد</span>
                  {emptyFields.filter(f => f.tab === 'military').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'military').length}
                    </span>
                  )}
                </button>

                {/* TAB BUTTON: Banking & Finance (البيانات المصرفية والمالية) */}
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
                  <CreditCard size={16} />
                  <span>البيانات المصرفية والمالية</span>
                  {emptyFields.filter(f => f.tab === 'banking').length > 0 && (
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                      {emptyFields.filter(f => f.tab === 'banking').length}
                    </span>
                  )}
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit}>
                {/* TAB: Career, Appointment & Promotion (التعيين والترقيات والبيانات الوظيفية) */}
                {activeTab === 'career' && (
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Award size={16} />
                      <span>
                        بيانات التعيين الرسمي، المباشرة الفعلية بالعمل، وقرارات الترقية الصادرة من وزارة الداخلية لحفظ الأقدمية والاستحقاقات الوظيفية.
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      {/* Appointment Date */}
                      {(!showEmptyOnly || isFieldEmpty('appointment_date')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('appointment_date') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              تاريخ التعيين (يوم/شهر/سنة):
                            </label>
                            <FieldStatusBadge fieldKey="appointment_date" />
                          </div>
                          <input
                            type="text"
                            placeholder="يوم/شهر/سنة (مثال: 2012/03/15)"
                            value={formData.appointment_date}
                            onChange={(e) => handleChange('appointment_date', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                            تاريخ صدور قرار التعيين المعتمد بملف الخدمة
                          </span>
                        </div>
                      )}

                      {/* Appointment Decision */}
                      {(!showEmptyOnly || isFieldEmpty('appointment_decision')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('appointment_decision') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              قرار التعيين الرسمي:
                            </label>
                            <FieldStatusBadge fieldKey="appointment_decision" />
                          </div>
                          <input
                            type="text"
                            placeholder="مثال: قرار وزير الداخلية رقم (142) لسنة 2012م"
                            value={formData.appointment_decision}
                            onChange={(e) => handleChange('appointment_decision', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                            رقم وتاريخ قرار التعيين الصادر من الوزارة
                          </span>
                        </div>
                      )}

                      {/* Actual Start Date */}
                      {(!showEmptyOnly || isFieldEmpty('start_date')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('start_date') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              تاريخ المباشرة الفعلية بالعمل (يوم/شهر/سنة):
                            </label>
                            <FieldStatusBadge fieldKey="start_date" />
                          </div>
                          <input
                            type="text"
                            placeholder="يوم/شهر/سنة (مثال: 2012/04/01)"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                            تاريخ استلام العمل والمباشرة الفعلية بالمديرية
                          </span>
                        </div>
                      )}

                      {/* Last Promotion Decision */}
                      {(!showEmptyOnly || isFieldEmpty('last_promotion_decision')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('last_promotion_decision') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              قرار آخر ترقية:
                            </label>
                            <FieldStatusBadge fieldKey="last_promotion_decision" />
                          </div>
                          <input
                            type="text"
                            placeholder="رقم وتاريخ قرار آخر ترقية (شرطية أو وظيفية)..."
                            value={formData.last_promotion_decision}
                            onChange={(e) => handleChange('last_promotion_decision', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Last Promotion Date */}
                      {(!showEmptyOnly || isFieldEmpty('last_promotion_date')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('last_promotion_date') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              تاريخ سريان آخر ترقية:
                            </label>
                            <FieldStatusBadge fieldKey="last_promotion_date" />
                          </div>
                          <input
                            type="text"
                            placeholder="يوم/شهر/سنة (مثال: 2022/01/01)"
                            value={formData.last_promotion_date}
                            onChange={(e) => handleChange('last_promotion_date', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Basic Salary */}
                      {(!showEmptyOnly || isFieldEmpty('basic_salary')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('basic_salary') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              المرتب الأساسي (د.ل):
                            </label>
                            <FieldStatusBadge fieldKey="basic_salary" />
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="مثال: 1250"
                            value={formData.basic_salary}
                            onChange={(e) => handleChange('basic_salary', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: Family & Personal Data (البيانات العائلية والشخصية) */}
                {activeTab === 'family' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* Mother's Full Name */}
                    {(!showEmptyOnly || isFieldEmpty('mother_name')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('mother_name') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            اسم الأم ثلاثياً:
                          </label>
                          <FieldStatusBadge fieldKey="mother_name" />
                        </div>
                        <input
                          type="text"
                          placeholder="مثال: خديجة محمد علي"
                          value={formData.mother_name}
                          onChange={(e) => handleChange('mother_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          يكتب اسم والدة المنتسب كاملاً كما في قيد العائلة
                        </span>
                      </div>
                    )}

                    {/* Marital Status */}
                    {(!showEmptyOnly || isFieldEmpty('marital_status')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            الحالة الاجتماعية:
                          </label>
                          <FieldStatusBadge fieldKey="marital_status" />
                        </div>
                        <select
                          value={formData.marital_status}
                          onChange={(e) => handleChange('marital_status', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box',
                            background: '#fff'
                          }}
                        >
                          <option value="متزوج">متزوج</option>
                          <option value="أعزب">أعزب</option>
                          <option value="مطلق">مطلق</option>
                          <option value="أرمل">أرمل</option>
                        </select>
                      </div>
                    )}

                    {/* Wife's Name (if married) */}
                    {formData.marital_status === 'متزوج' && (!showEmptyOnly || isFieldEmpty('wife_name')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('wife_name') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            اسم الزوجة:
                          </label>
                          <FieldStatusBadge fieldKey="wife_name" />
                        </div>
                        <input
                          type="text"
                          placeholder="اسم الزوجة الثلاثي"
                          value={formData.wife_name}
                          onChange={(e) => handleChange('wife_name', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Children Count */}
                    {(!showEmptyOnly || isFieldEmpty('children_count')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('children_count') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            عدد الأبناء:
                          </label>
                          <FieldStatusBadge fieldKey="children_count" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="25"
                          placeholder="0"
                          value={formData.children_count}
                          onChange={(e) => handleChange('children_count', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Family Booklet Number */}
                    {(!showEmptyOnly || isFieldEmpty('family_book')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('family_book') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            رقم كتيب العائلة:
                          </label>
                          <FieldStatusBadge fieldKey="family_book" />
                        </div>
                        <input
                          type="text"
                          placeholder="رقم كتيب العائلة..."
                          value={formData.family_book}
                          onChange={(e) => handleChange('family_book', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Family Paper Number */}
                    {(!showEmptyOnly || isFieldEmpty('family_paper')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('family_paper') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            رقم ورقة العائلة:
                          </label>
                          <FieldStatusBadge fieldKey="family_paper" />
                        </div>
                        <input
                          type="text"
                          placeholder="رقم ورقة العائلة..."
                          value={formData.family_paper}
                          onChange={(e) => handleChange('family_paper', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Family Registry Number */}
                    {(!showEmptyOnly || isFieldEmpty('family_record')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('family_record') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            رقم قيد العائلة (السجل المدني):
                          </label>
                          <FieldStatusBadge fieldKey="family_record" />
                        </div>
                        <input
                          type="text"
                          placeholder="رقم قيد العائلة..."
                          value={formData.family_record}
                          onChange={(e) => handleChange('family_record', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Passport Number */}
                    {(!showEmptyOnly || isFieldEmpty('passport_number')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('passport_number') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            رقم جواز السفر:
                          </label>
                          <FieldStatusBadge fieldKey="passport_number" />
                        </div>
                        <input
                          type="text"
                          dir="ltr"
                          placeholder="P0123456"
                          value={formData.passport_number}
                          onChange={(e) => handleChange('passport_number', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Birth Place */}
                    {(!showEmptyOnly || isFieldEmpty('birth_place')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('birth_place') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            مكان الميلاد:
                          </label>
                          <FieldStatusBadge fieldKey="birth_place" />
                        </div>
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
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Birth Date */}
                    {(!showEmptyOnly || isFieldEmpty('birth_date')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('birth_date') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            تاريخ الميلاد:
                          </label>
                          <FieldStatusBadge fieldKey="birth_date" />
                        </div>
                        <input
                          type="text"
                          placeholder="يوم/شهر/سنة (مثال: 1985/05/12)"
                          value={formData.birth_date}
                          onChange={(e) => handleChange('birth_date', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Contact & Residence Data (الاتصال والإقامة) */}
                {activeTab === 'contact' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* Phone Number */}
                    {(!showEmptyOnly || isFieldEmpty('phone')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('phone') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            رقم الهاتف الشخصي المحمول: <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <FieldStatusBadge fieldKey="phone" isRequired />
                        </div>
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
                            border: '1px solid #cbd5e1',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          ضروري لإرسال البلاغات والإشعارات والتعميمات الرسمية
                        </span>
                      </div>
                    )}

                    {/* Emergency Contact Phone */}
                    {(!showEmptyOnly || isFieldEmpty('emergency_contact')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('emergency_contact') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            هاتف الطوارئ (رقم أحد الأقارب):
                          </label>
                          <FieldStatusBadge fieldKey="emergency_contact" />
                        </div>
                        <input
                          type="tel"
                          dir="ltr"
                          placeholder="هاتف الأخ / الوالد / القريب"
                          value={formData.emergency_contact}
                          onChange={(e) => handleChange('emergency_contact', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          للتواصل في الحالات الطارئة وأوقات الاستنفار
                        </span>
                      </div>
                    )}

                    {/* Official Email */}
                    {(!showEmptyOnly || isFieldEmpty('email')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('email') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>البريد الإلكتروني:</span>
                          </label>
                          <FieldStatusBadge fieldKey="email" />
                        </div>
                        <input
                          type="email"
                          dir="ltr"
                          placeholder="name@example.com"
                          value={formData.email || ''}
                          onChange={(e) => handleChange('email', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14.5px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          البريد الإلكتروني الشخصي أو الرسمي للتواصل
                        </span>
                      </div>
                    )}

                    {/* Residence Full Address */}
                    {(!showEmptyOnly || isFieldEmpty('residence')) && (
                      <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('residence') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            محل الإقامة والسكن الحالي بالتفصيل:
                          </label>
                          <FieldStatusBadge fieldKey="residence" />
                        </div>
                        <input
                          type="text"
                          placeholder="مثال: أوباري - محلة المشروع - بالقرب من مدرسة..."
                          value={formData.residence}
                          onChange={(e) => handleChange('residence', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}

                    {/* Tribe / City */}
                    {(!showEmptyOnly || isFieldEmpty('tribe_city')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('tribe_city') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            القبيلة / المدينة:
                          </label>
                          <FieldStatusBadge fieldKey="tribe_city" />
                        </div>
                        <input
                          type="text"
                          placeholder="أوباري / الغريفة / بنت بيه / جرمة..."
                          value={formData.tribe_city}
                          onChange={(e) => handleChange('tribe_city', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Education & Languages (المؤهل العلمي واللغات) */}
                {activeTab === 'education' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Education Level / Qualification */}
                    {(!showEmptyOnly || isFieldEmpty('education_level')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('education_level') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            المستوى الدراسي (المؤهل العلمي):
                          </label>
                          <FieldStatusBadge fieldKey="education_level" />
                        </div>
                        <input
                          type="text"
                          list="education-levels-list"
                          placeholder="اختر أو اكتب المؤهل العلمي..."
                          value={formData.education_level}
                          onChange={(e) => handleChange('education_level', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                        <datalist id="education-levels-list">
                          {EDUCATION_LEVELS.map((el) => (
                            <option key={el} value={el} />
                          ))}
                        </datalist>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                          المؤهل الدراسي المعتمد بملف الخدمة بالمديرية
                        </span>
                      </div>
                    )}

                    {/* Languages Spoken */}
                    {(!showEmptyOnly || isFieldEmpty('languages')) && (
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('languages') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                            اللغات التي يجيدها المنتسب:
                          </label>
                          <FieldStatusBadge fieldKey="languages" />
                        </div>
                        <input
                          type="text"
                          list="languages-options-list"
                          placeholder="العربية / الطارقية / الإنجليزية..."
                          value={formData.languages}
                          onChange={(e) => handleChange('languages', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxSizing: 'border-box'
                          }}
                        />
                        <datalist id="languages-options-list">
                          {LANGUAGES_OPTIONS.map((lang) => (
                            <option key={lang} value={lang} />
                          ))}
                        </datalist>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: Uniform Sizes & Physical Measurements (المقاسات والتجهيزات الرسمية والبدنية) */}
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Info size={16} />
                      <span>
                        تُستخدم هذه المقاسات مباشرة لصرف البدلات الرسمية، الأحذية الرسمية (البيادة)، والبوريهات من هيئة الإمداد والتموين.
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                      {/* Suit Number / Uniform Size */}
                      {(!showEmptyOnly || isFieldEmpty('suit_number')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('suit_number') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              مقاس البدلة الرسمية:
                            </label>
                            <FieldStatusBadge fieldKey="suit_number" />
                          </div>
                          <select
                            value={formData.suit_number}
                            onChange={(e) => handleChange('suit_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
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
                      )}

                      {/* Shoe Size */}
                      {(!showEmptyOnly || isFieldEmpty('shoe_size')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('shoe_size') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              رقم الحذاء الرسمي (البيادة):
                            </label>
                            <FieldStatusBadge fieldKey="shoe_size" />
                          </div>
                          <select
                            value={formData.shoe_size}
                            onChange={(e) => handleChange('shoe_size', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box',
                              background: '#fff'
                            }}
                          >
                            <option value="">-- اختر رقم الحذاء --</option>
                            {SHOE_SIZES.map((sz) => (
                              <option key={sz} value={sz}>
                                نمرة {sz}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Headwear Size */}
                      {(!showEmptyOnly || isFieldEmpty('headwear_size')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('headwear_size') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              مقاس غطاء الرأس (البوريه/القبعة):
                            </label>
                            <FieldStatusBadge fieldKey="headwear_size" />
                          </div>
                          <select
                            value={formData.headwear_size}
                            onChange={(e) => handleChange('headwear_size', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box',
                              background: '#fff'
                            }}
                          >
                            <option value="">-- اختر مقاس غطاء الرأس --</option>
                            {HEADWEAR_SIZES.map((hs) => (
                              <option key={hs} value={hs}>
                                مقاس {hs}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Shirt Size */}
                      {(!showEmptyOnly || isFieldEmpty('shirt_size')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('shirt_size') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              مقاس القميص الرسمي:
                            </label>
                            <FieldStatusBadge fieldKey="shirt_size" />
                          </div>
                          <select
                            value={formData.shirt_size}
                            onChange={(e) => handleChange('shirt_size', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box',
                              background: '#fff'
                            }}
                          >
                            <option value="">-- اختر مقاس القميص --</option>
                            {SHIRT_SIZES.map((ss) => (
                              <option key={ss} value={ss}>
                                {ss}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Blood Type */}
                      {(!showEmptyOnly || isFieldEmpty('blood_type')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('blood_type') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              فصيلة الدم (Blood Type): <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <FieldStatusBadge fieldKey="blood_type" isRequired />
                          </div>
                          <select
                            value={formData.blood_type}
                            onChange={(e) => handleChange('blood_type', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
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
                      )}

                      {/* Height (cm) */}
                      {(!showEmptyOnly || isFieldEmpty('height')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('height') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              الطول (سم):
                            </label>
                            <FieldStatusBadge fieldKey="height" />
                          </div>
                          <input
                            type="number"
                            min="140"
                            max="220"
                            placeholder="مثال: 175"
                            value={formData.height}
                            onChange={(e) => handleChange('height', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Weight (kg) */}
                      {(!showEmptyOnly || isFieldEmpty('weight')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('weight') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              الوزن (كجم):
                            </label>
                            <FieldStatusBadge fieldKey="weight" />
                          </div>
                          <input
                            type="number"
                            min="45"
                            max="180"
                            placeholder="مثال: 75"
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Health Conditions / Diseases */}
                      {(!showEmptyOnly || isFieldEmpty('diseases')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('diseases') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              الحالة الصحية والأمراض (إن وجدت):
                            </label>
                            <FieldStatusBadge fieldKey="diseases" />
                          </div>
                          <input
                            type="text"
                            list="health-conditions-list"
                            placeholder="سليم ولائق صحياً..."
                            value={formData.diseases}
                            onChange={(e) => handleChange('diseases', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                          <datalist id="health-conditions-list">
                            {HEALTH_CONDITIONS.map((c) => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: Banking & Financial Data (البيانات المصرفية والمالية) */}
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
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShieldCheck size={16} />
                      <span>
                        تُستخدم هذه البيانات بدقة لصرف المرتبات والمستحقات المالية الرسمية عبر منظومة الحسابات المصرفية المعتمدة.
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                      {/* Bank Name */}
                      {(!showEmptyOnly || isFieldEmpty('bank_name')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('bank_name') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              اسم المصرف التجاري:
                            </label>
                            <FieldStatusBadge fieldKey="bank_name" />
                          </div>
                          <input
                            type="text"
                            list="libyan-banks-list"
                            placeholder="اختر أو اكتب اسم المصرف..."
                            value={formData.bank_name}
                            onChange={(e) => handleChange('bank_name', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                          <datalist id="libyan-banks-list">
                            {LIBYAN_BANKS.map((b) => (
                              <option key={b} value={b} />
                            ))}
                          </datalist>
                        </div>
                      )}

                      {/* Bank Branch */}
                      {(!showEmptyOnly || isFieldEmpty('bank_branch')) && (
                        <div style={{ background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('bank_branch') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              الفرع المصرفي:
                            </label>
                            <FieldStatusBadge fieldKey="bank_branch" />
                          </div>
                          <input
                            type="text"
                            placeholder="فرع أوباري / الغريفة / بنت بيه..."
                            value={formData.bank_branch}
                            onChange={(e) => handleChange('bank_branch', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}

                      {/* Account Number */}
                      {(!showEmptyOnly || isFieldEmpty('account_number')) && (
                        <div style={{ gridColumn: '1 / -1', background: '#ffffff', padding: '14px', borderRadius: '10px', border: isFieldEmpty('account_number') ? '1.5px solid #f59e0b' : '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
                              رقم الحساب المصرفي المعتمد:
                            </label>
                            <FieldStatusBadge fieldKey="account_number" />
                          </div>
                          <input
                            type="text"
                            dir="ltr"
                            placeholder="أدخل رقم الحساب المصرفي بدقة..."
                            value={formData.account_number}
                            onChange={(e) => handleChange('account_number', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              fontFamily: 'monospace',
                              letterSpacing: '1px',
                              boxSizing: 'border-box'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                            يرجى التأكد التام من مطابقة رقم الحساب المصرفي الخاص بك لتفادي تأخر المرتبات
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Form Actions Footer */}
                <div
                  style={{
                    marginTop: '24px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} style={{ color: '#059669' }} />
                    <span>يتم تحديث وتوثيق البيانات فورياً ومزامنتها بالقاعدة المركزية</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        padding: '10px 18px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      إلغاء
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{
                        padding: '10px 24px',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #0a192f 100%)',
                        color: '#d4af37',
                        border: '1.5px solid #d4af37',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 900,
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(10, 25, 47, 0.25)',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      <Save size={16} />
                      <span>{isSubmitting ? 'جارٍ حفظ التحديثات...' : 'حفظ وتحديث بياناتي بالمنظومة'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
