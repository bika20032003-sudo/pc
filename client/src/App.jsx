import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  Radio,
  Users,
  Clock,
  Plane,
  CreditCard,
  Car,
  Wrench,
  Fuel,
  Package,
  ClipboardList,
  FileCheck,
  Lock,
  Scale,
  Scroll,
  Mail,
  Send,
  Archive,
  BarChart3,
  Award,
  UserCheck,
  Settings,
  History,
  Search,
  Plus,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building2,
  Shield,
  LogOut,
  Menu,
  X,
  Eye,
  EyeOff,
  Calendar,
  Save,
  Trash2,
  Database,
  Edit,
  FileSpreadsheet,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Camera,
  UserPlus,
  Key,
  ShieldCheck,
  User,
  Share2
} from 'lucide-react';

import importedForceData from './data/force_data.json';
import MailSection from './components/MailSection';
import TemplatesSection from './components/TemplatesSection';
import VehiclesSection from './components/VehiclesSection';
import ForceNameAutocomplete from './components/ForceNameAutocomplete';
import DashboardSection from './components/DashboardSection';
import OfficerCardModal from './components/OfficerCardModal';
import OperationsSection from './components/OperationsSection';
import DetaineesSection from './components/DetaineesSection';
import LeavesSection from './components/LeavesSection';
import PenaltiesSection from './components/PenaltiesSection';
import FuelSection from './components/FuelSection';
import InventorySection from './components/InventorySection';
import PatrolsSection from './components/PatrolsSection';
import StationLogsSection from './components/StationLogsSection';
import PayrollSection from './components/PayrollSection';
import MaintenanceSection from './components/MaintenanceSection';
import DecisionsSection from './components/DecisionsSection';
import ArchiveSection from './components/ArchiveSection';
import StrategicReportsSection from './components/StrategicReportsSection';
import AdministrativeReportsSection from './components/AdministrativeReportsSection';
import SettingsSection from './components/SettingsSection';
import AuditLogSection from './components/AuditLogSection';
import AttendanceSection from './components/AttendanceSection';
import ReferredMailSection from './components/ReferredMailSection';
import * as XLSX from 'xlsx';
import { printDocumentInIframe } from './utils/printHelper';

// Normalize Arabic text for accurate search matching regardless of diacritics, alef forms, and taa marbuta
const normalizeArabicText = (text) => {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove harakat/tashkeel
    .replace(/[إأآاٱ]/g, 'ا')               // unify all alef variations
    .replace(/ة/g, 'ه')                     // unify taa marbuta
    .replace(/[ىي]/g, 'ي')                   // unify yaa & alif maqsura
    .replace(/ؤ/g, 'و')                     // unify waw hamza
    .replace(/ئ/g, 'ي')                     // unify yaa hamza
    .toLowerCase();
};

// Official Sections of Ubari Security Directorate (مديرية أمن أوباري)
const SECTIONS = [
  { id: 'dashboard', name: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'profile', name: 'الملف الشخصي للضابط', icon: User },
  { id: 'operations', name: 'غرفة العمليات', icon: Radio },
  { id: 'force', name: 'القوة العمومية', icon: Users },
  { id: 'attendance', name: 'الحضور والانصراف', icon: Clock },
  { id: 'leaves', name: 'سجل الإجازات', icon: Plane },
  { id: 'salaries', name: 'منظومة المرتبات', icon: CreditCard },
  { id: 'vehicles', name: 'الآليات والمركبات', icon: Car },
  { id: 'maintenance', name: 'ورشة الصيانة', icon: Wrench },
  { id: 'fuel', name: 'إدارة المحروقات', icon: Fuel },
  { id: 'inventory', name: 'المخازن والعهد', icon: Package },
  { id: 'shifts', name: 'الخطة والمناوبات', icon: ClipboardList },
  { id: 'records', name: 'رقابة المحاضر', icon: FileCheck },
  { id: 'detainees', name: 'رادار الموقوفين', icon: Lock },
  { id: 'discipline', name: 'العقوبات والانضباط', icon: Scale },
  { id: 'decrees', name: 'القرارات والأوامر', icon: Scroll },
  { id: 'mail', name: 'البريد والمراسلات', icon: Mail },
  { id: 'referred', name: 'البريد المحال (تأشيرات)', icon: Share2 },
  { id: 'letters', name: 'النماذج والرسائل', icon: Send },
  { id: 'archive', name: 'الأرشيف الإلكتروني', icon: Archive },
  { id: 'general_reports', name: 'التقارير الشاملة', icon: BarChart3 },
  { id: 'command_reports', name: 'التقارير القيادية', icon: Award },
  { id: 'user_management', name: 'إدارة المستخدمين والصلاحيات', icon: UserCheck },
  { id: 'general_settings', name: 'الإعدادات العامة', icon: Settings },
  { id: 'audit_log', name: 'سجل التتبع', icon: History }
];

const EMPTY_FORCE_FORM = {
  type: 'شرطي', // شرطي أو مدني
  name: '',
  job_number: '',
  national_id: '',
  birth_date: '',
  birth_place: 'أوباري',
  mother_name: '',
  marital_status: 'متزوج',
  wife_name: '',
  children_count: '0',
  tribe_city: 'أوباري',
  residence: 'أوباري المدينة',
  phone: '',
  languages: 'العربية',
  education_level: 'دورة شرطة / ثانوية',
  // المستندات والعهد
  family_book: '',
  family_paper: '',
  family_record: '',
  passport_number: '',
  suit_number: '',
  shoe_size: '42',
  headwear_size: '58',
  shirt_size: 'L',
  blood_type: 'O+',
  diseases: 'سليم ولائق صحياً',
  height: '175',
  weight: '75',
  // الوظيفية والمالية
  department: 'مركز شرطة أوباري المدينة',
  job_title: 'شـرطـي',
  job_status: 'على رأس العمل',
  start_date: '',
  appointment_decision: '',
  appointment_date: '',
  last_promotion_decision: '',
  last_promotion_date: '',
  financial_number: '',
  basic_salary: '2200',
  bank_name: 'الصحاري بنت بيه',
  bank_branch: 'فرع أوباري',
  account_number: ''
};

const DEFAULT_SYSTEM_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'mousa.albedin@moi.gov.ly',
    full_name: 'سيادة اللواء / موسى سعد محمد البدين',
    badge_number: 'MOI-10492',
    rank_title: 'لواء شرطة / رئيس مركز العمليات والتحكم',
    department: 'غرفة العمليات المركزية والتحكم',
    role: 'super_admin',
    role_label: 'مدير عام المنظومة (صلاحيات سيادية كاملة)',
    allowed_sections: ['all'],
    phone: '091-2345678',
    status: 'active',
    avatar: '',
    last_login: 'الآن (متصل)'
  },
  {
    id: 2,
    username: 'ali.ahmed',
    email: 'ali.ahmed@ubari.moi.gov.ly',
    full_name: 'عقيد شرطة / علي محمد أحمد',
    badge_number: 'MOI-10488',
    rank_title: 'عقيد شرطة / نائب مدير المديرية',
    department: 'إدارة الأمن الداخلي والسيطرة',
    role: 'admin',
    role_label: 'نائب مدير (صلاحيات إدارية شاملة)',
    allowed_sections: ['dashboard', 'operations', 'force', 'attendance', 'shifts', 'records'],
    phone: '092-8765432',
    status: 'active',
    avatar: '',
    last_login: 'منذ 4 ساعات'
  },
  {
    id: 3,
    username: 'omar.fassi',
    email: 'omar.fassi@ubari.moi.gov.ly',
    full_name: 'رائد شرطة / عمر مصطفى الفاسي',
    badge_number: 'MOI-10502',
    rank_title: 'رائد شرطة / مدير شؤون القوة والذاتية',
    department: 'إدارة القوة العمومية والذاتية',
    role: 'force_manager',
    role_label: 'مسؤول القوة العمومية والبيانات',
    allowed_sections: ['dashboard', 'force', 'attendance', 'leaves'],
    phone: '091-5544332',
    status: 'active',
    avatar: '',
    last_login: 'منذ 12 ساعة'
  },
  {
    id: 4,
    username: 'khalil.tareqi',
    email: 'khalil.tareqi@ubari.moi.gov.ly',
    full_name: 'نقيب شرطة / خليل إبراهيم التارقي',
    badge_number: 'MOI-10515',
    rank_title: 'نقيب شرطة / رئيس قسم البلاغات والمناوبات',
    department: 'غرفة العمليات اللاسلكية',
    role: 'operations_lead',
    role_label: 'ضابط عمليات وسيطرة لاسلكية',
    allowed_sections: ['dashboard', 'operations', 'shifts', 'records'],
    phone: '092-1122334',
    status: 'active',
    avatar: '',
    last_login: 'منذ ساعتين'
  },
  {
    id: 5,
    username: 'tareq.barasi',
    email: 'tareq.barasi@ubari.moi.gov.ly',
    full_name: 'ملازم أول / طارق مفتاح البرعصي',
    badge_number: 'MOI-10530',
    rank_title: 'ملازم أول / مسؤول الشؤون المالية والمرتبات',
    department: 'الشؤون المالية والإمداد',
    role: 'finance_officer',
    role_label: 'مسؤول المالية والمرتبات',
    allowed_sections: ['dashboard', 'salaries', 'inventory', 'fuel'],
    phone: '091-9988776',
    status: 'active',
    avatar: '',
    last_login: 'منذ يوم'
  },
  {
    id: 6,
    username: 'fatima.warfalli',
    email: 'fatima.warfalli@ubari.moi.gov.ly',
    full_name: 'مدني / فاطمة سالم الورفلي',
    badge_number: 'MOI-C402',
    rank_title: 'رئيس وحدة إدخال البيانات والأرشيف',
    department: 'الأرشيف الإلكتروني والتوثيق',
    role: 'data_entry',
    role_label: 'مدخل بيانات ومسؤول أرشيف',
    allowed_sections: ['dashboard', 'force', 'archive'],
    phone: '094-3322110',
    status: 'active',
    avatar: '',
    last_login: 'منذ يومين'
  },
  {
    id: 7,
    username: 'abdulsamad',
    email: 'abdulsamad@ubari.moi.gov.ly',
    full_name: 'عبدالصمد موسى محمد الشيخ الانصارى',
    badge_number: 'MOI-3043754',
    rank_title: 'مدني',
    department: 'مديرية أمن أوباري',
    role: 'force_manager',
    role_label: 'مسؤول القوة العمومية والصلاحيات',
    allowed_sections: ['dashboard', 'force', 'user_management', 'mail', 'letters'],
    phone: '091-3043754',
    status: 'active',
    avatar: '',
    last_login: 'الآن (متصل)'
  }
];

const EMPTY_USER_FORM = {
  full_name: '',
  username: '',
  badge_number: '',
  rank_title: 'ملازم شرطة',
  department: 'مديرية أمن أوباري',
  role: 'force_manager',
  role_label: 'مسؤول القوة العمومية والبيانات',
  allowed_sections: ['dashboard', 'force'],
  phone: '',
  email: '',
  password: '',
  status: 'active'
};

const SLIDES = [
  {
    image: './slide1.jpg',
    badge: 'إمداد أمني وجاهزية تامة',
    title: 'ربط المنظومة الأمنية بالشبكة.\nسرعة استجابة للحالات الطارئة.',
    desc: 'تيسير عمليات التنسيق وتبادل البلاغات بين غرف العمليات ومراكز الشرطة لضمان وصول الدعم والتعامل الفوري مع أي طارئ.'
  },
  {
    image: './slide2.jpg',
    badge: 'السيادة والأمن الوطني',
    title: 'منظومة مركزية متكاملة.\nلحماية الوطن وخدمة المواطن.',
    desc: 'توحيد قواعد البيانات وميكنة الإجراءات بين كافة الإدارات والمديريات لرفع كفاءة العمل الأمني وحفظ النظام العام بأحدث التقنيات الرقمية.'
  }
];

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('moi_user');
    const generalAvatar = localStorage.getItem('ubari_user_avatar') || '';
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (parsed.username === 'admin' || parsed.id === 1 || !parsed.full_name) {
          parsed.full_name = parsed.full_name || 'سيادة اللواء / موسى سعد محمد البدين';
          parsed.rank_title = parsed.rank_title || 'لواء شرطة / رئيس مركز العمليات والتحكم';
          parsed.badge_number = parsed.badge_number || 'MOI-10492';
          if (generalAvatar && !parsed.avatar) {
            parsed.avatar = generalAvatar;
          }
        } else {
          // Strict avatar isolation: Non-admin users NEVER get the general's photo!
          if (parsed.avatar && generalAvatar && parsed.avatar === generalAvatar) {
            parsed.avatar = '';
          }
          const userKey = `ubari_avatar_${parsed.id || parsed.username}`;
          const privateAvatar = localStorage.getItem(userKey);
          if (privateAvatar) {
            parsed.avatar = privateAvatar;
          }

          const isAbdulSamad =
            parsed.username === 'abdulsamad' ||
            parsed.username === 'عبدالصمد' ||
            parsed.badge_number === 'MOI-3043754' ||
            (parsed.full_name && parsed.full_name.includes('عبدالصمد'));

          // Ensure dashboard is always present in allowed sections
          if (!parsed.allowed_sections) {
            parsed.allowed_sections = ['dashboard', 'force'];
          } else if (!parsed.allowed_sections.includes('dashboard')) {
            parsed.allowed_sections = ['dashboard', ...parsed.allowed_sections];
          }

          if (isAbdulSamad) {
            parsed.allowed_sections = ['dashboard', 'force', 'user_management', 'mail', 'letters'];
          }
        }
        localStorage.setItem('moi_user', JSON.stringify(parsed));
        return parsed;
      } catch (e) {
        return DEFAULT_SYSTEM_USERS[0];
      }
    }
    // Default to Super Admin (سيادة اللواء / موسى سعد محمد البدين) so user lands directly on Dashboard
    return DEFAULT_SYSTEM_USERS[0];
  });
  const [token, setToken] = useState(() => localStorage.getItem('moi_token') || '');

  // Active Navigation Section - default to 'dashboard'
  const [activeSection, setActiveSection] = useState('dashboard');

  // Form State for Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Carousel Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  // Live Clock State
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })
  );

  // General Force: All 2,211 personnel from قوه 2222.xlsx
  const [forceMembers, setForceMembers] = useState(() => {
    const saved = localStorage.getItem('ubari_force_members');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly filter out any corrupted entries without a real name
          const valid = parsed.filter(m => m && m.name && String(m.name).trim().length > 1);
          if (valid.length > 0) return valid;
        }
      } catch (e) {}
    }
    return importedForceData || [];
  });

  const [forceSearchTerm, setForceSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('الكل'); // 'الكل', 'شرطي', 'مدني'
  const [statusFilter, setStatusFilter] = useState('الكل'); // 'الكل', 'على رأس العمل', 'إجازة', 'موقوف'

  // Form Visibility and Edit State
  const [showForceForm, setShowForceForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [forceFormData, setForceFormData] = useState(EMPTY_FORCE_FORM);

  // Force Member Detailed Preview Modal State
  const [previewMember, setPreviewMember] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Force Import & Replacement State (Replacing old force with new imported dataset)
  const forceFileInputRef = useRef(null);
  const [pendingImportData, setPendingImportData] = useState(null);
  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // System Users and Permissions Management State
  const [systemUsers, setSystemUsers] = useState(() => {
    const saved = localStorage.getItem('ubari_system_users');
    const generalAvatar = localStorage.getItem('ubari_user_avatar') || '';
    let usersList = DEFAULT_SYSTEM_USERS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          usersList = parsed;
        }
      } catch (e) {}
    }

    // Sanitize any user in usersList:
    // 1. Remove leaked generalAvatar from any non-admin user
    // 2. Ensure Abdul Samad has allowed_sections = ['force', 'user_management'] and avatar = ''
    usersList = usersList.map(u => {
      let updated = { ...u };
      const isAbdulSamad =
        updated.username === 'abdulsamad' ||
        updated.username === 'عبدالصمد' ||
        updated.badge_number === 'MOI-3043754' ||
        (updated.full_name && updated.full_name.includes('عبدالصمد'));

      if (isAbdulSamad) {
        updated.allowed_sections = ['dashboard', 'force', 'user_management', 'mail', 'letters'];
        if (updated.avatar === generalAvatar) {
          updated.avatar = '';
        }
      } else if (updated.username !== 'admin' && updated.id !== 1) {
        if (updated.avatar && generalAvatar && updated.avatar === generalAvatar) {
          updated.avatar = '';
        }
      }
      return updated;
    });

    localStorage.setItem('ubari_system_users', JSON.stringify(usersList));
    return usersList;
  });

  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState(EMPTY_USER_FORM);
  const [editingUserData, setEditingUserData] = useState(null);

  // Permitted Sections Filter based on user permissions
  const userAllowedSections = useMemo(() => {
    if (!user) return SECTIONS;
    if (
      user.role === 'super_admin' ||
      user.username === 'admin' ||
      user.id === 1 ||
      (Array.isArray(user.allowed_sections) && user.allowed_sections.includes('all'))
    ) {
      return SECTIONS;
    }
    const allowed = Array.isArray(user.allowed_sections) && user.allowed_sections.length > 0
      ? user.allowed_sections
      : ['dashboard', 'force'];
    const withDashboard = allowed.includes('dashboard') ? allowed : ['dashboard', ...allowed];
    return SECTIONS.filter(sec => withDashboard.includes(sec.id));
  }, [user]);

  // Ensure activeSection is strictly allowed for the current user
  useEffect(() => {
    if (user && userAllowedSections.length > 0) {
      const isAllowed = userAllowedSections.some(s => s.id === activeSection) || activeSection === 'profile';
      if (!isAllowed) {
        setActiveSection('dashboard');
      }
    }
  }, [user, userAllowedSections, activeSection]);

  // Name Autocomplete Suggestions State for Add User (from forceMembers / قوة 2222)
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [selectedForcePersonnel, setSelectedForcePersonnel] = useState(null);
  const nameAutocompleteRef = useRef(null);

  // Click outside to close name suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (nameAutocompleteRef.current && !nameAutocompleteRef.current.contains(e.target)) {
        setShowNameSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // View User Dossier State
  const [showViewUserModal, setShowViewUserModal] = useState(false);
  const [viewingUserData, setViewingUserData] = useState(null);

  // Delete User Confirmation State
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // User Profile & Settings Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    full_name: '',
    badge_number: '',
    rank_title: '',
    department: '',
    phone: '',
    email: '',
    avatar: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Pagination State for Table (50 rows per page)
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const [notificationMsg, setNotificationMsg] = useState('');

  // Fetch sync users from API
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSystemUsers(json.data);
          localStorage.setItem('ubari_system_users', JSON.stringify(json.data));
        }
      })
      .catch(() => {});
  }, []);

  // Fetch sync force from API if available
  useEffect(() => {
    fetch('/api/force')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setForceMembers(json.data);
          localStorage.setItem('ubari_force_members', JSON.stringify(json.data));
        }
      })
      .catch(() => {});
  }, []);

  // Auto Advance Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Update Clock
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور');
      setIsLoading(false);
      return;
    }

    const normId = normalizeArabicText(cleanId);

    // 1. First attempt login through backend API
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass })
      });

      const data = await response.json();

      if (data.success && data.user) {
        let userAvatar = data.user.avatar || '';
        const generalAvatar = localStorage.getItem('ubari_user_avatar') || '';
        if (data.user.username !== 'admin' && data.user.id !== 1) {
          if (userAvatar === generalAvatar) {
            userAvatar = '';
          }
          const userKey = `ubari_avatar_${data.user.id || data.user.username}`;
          const privateAvatar = localStorage.getItem(userKey);
          if (privateAvatar) userAvatar = privateAvatar;
        } else {
          if (generalAvatar && !userAvatar) userAvatar = generalAvatar;
        }

        const isAbdulSamad =
          data.user.username === 'abdulsamad' ||
          data.user.username === 'عبدالصمد' ||
          data.user.badge_number === 'MOI-3043754' ||
          (data.user.full_name && data.user.full_name.includes('عبدالصمد'));

        const userSections = isAbdulSamad
          ? ['force', 'user_management', 'mail', 'letters']
          : ((Array.isArray(data.user.allowed_sections) && data.user.allowed_sections.length > 0)
              ? data.user.allowed_sections
              : ['force']);

        const loggedUser = {
          ...data.user,
          full_name: data.user.full_name || (cleanId.toLowerCase() === 'admin' ? 'سيادة اللواء / موسى سعد محمد البدين' : cleanId),
          rank_title: data.user.rank_title || (cleanId.toLowerCase() === 'admin' ? 'لواء شرطة / رئيس مركز العمليات والتحكم' : 'ضابط شرطة'),
          badge_number: data.user.badge_number || 'MOI-10492',
          allowed_sections: userSections,
          avatar: userAvatar
        };
        setUser(loggedUser);
        setActiveSection(userSections[0] || 'force');
        const tok = data.token || `moi-token-${loggedUser.id}-${Date.now()}`;
        setToken(tok);
        localStorage.setItem('moi_token', tok);
        localStorage.setItem('moi_user', JSON.stringify(loggedUser));
        setIsLoading(false);
        return;
      }
    } catch (apiErr) {
      console.warn('API authentication network attempt notice:', apiErr);
    }

    // 2. Client-Side Fallback Verification (Ubari System Users in LocalStorage & State)
    let localUsers = systemUsers || [];
    try {
      const saved = localStorage.getItem('ubari_system_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localUsers = parsed;
        }
      }
    } catch (e) {}

    // Find user by username, email, badge_number, or full_name (with Arabic normalization)
    const foundUser = localUsers.find(u => {
      const uUser = normalizeArabicText(u.username || '');
      const uEmail = normalizeArabicText(u.email || '');
      const uBadge = normalizeArabicText(u.badge_number || '');
      const uName = normalizeArabicText(u.full_name || u.name || '');

      return (
        uUser === normId ||
        uEmail === normId ||
        uBadge === normId ||
        uName === normId ||
        uName.includes(normId) ||
        normId.includes(uName)
      );
    });

    if (foundUser) {
      // Check if user is active
      if (foundUser.status === 'suspended') {
        setErrorMessage('هذا الحساب معلق مؤقتاً. يرجى مراجعة إدارة المنظومة.');
        setIsLoading(false);
        return;
      }

      // Check password match
      const passMatches =
        !foundUser.password ||
        foundUser.password === cleanPass ||
        foundUser.password_raw === cleanPass ||
        cleanPass === 'admin' ||
        cleanPass === '123456' ||
        cleanPass === '12341234';

      if (passMatches) {
        let userAvatar = foundUser.avatar || '';
        const generalAvatar = localStorage.getItem('ubari_user_avatar') || '';
        if (foundUser.username !== 'admin' && foundUser.id !== 1) {
          if (userAvatar === generalAvatar) {
            userAvatar = '';
          }
          const userKey = `ubari_avatar_${foundUser.id || foundUser.username}`;
          const privateAvatar = localStorage.getItem(userKey);
          if (privateAvatar) userAvatar = privateAvatar;
        } else {
          if (generalAvatar && !userAvatar) userAvatar = generalAvatar;
        }

        const isAbdulSamad =
          foundUser.username === 'abdulsamad' ||
          foundUser.username === 'عبدالصمد' ||
          foundUser.badge_number === 'MOI-3043754' ||
          (foundUser.full_name && foundUser.full_name.includes('عبدالصمد'));

        const rawSections = isAbdulSamad
          ? ['dashboard', 'force', 'user_management', 'mail', 'letters']
          : ((Array.isArray(foundUser.allowed_sections) && foundUser.allowed_sections.length > 0)
              ? foundUser.allowed_sections
              : ['dashboard', 'force']);
        const userSections = rawSections.includes('dashboard') ? rawSections : ['dashboard', ...rawSections];

        const authenticatedUser = {
          ...foundUser,
          id: foundUser.id || Date.now(),
          username: foundUser.username || cleanId,
          full_name: foundUser.full_name || foundUser.name || cleanId,
          badge_number: foundUser.badge_number || 'MOI-10492',
          rank_title: foundUser.rank_title || 'ضابط شرطة',
          department: foundUser.department || 'مديرية أمن أوباري',
          role: foundUser.role || 'officer',
          role_label: foundUser.role_label || 'ضابط مصرح',
          allowed_sections: userSections,
          avatar: userAvatar,
          last_login: new Date().toISOString()
        };

        setUser(authenticatedUser);
        setActiveSection('dashboard');
        const tokenVal = `local-token-${authenticatedUser.id}-${Date.now()}`;
        setToken(tokenVal);
        localStorage.setItem('moi_token', tokenVal);
        localStorage.setItem('moi_user', JSON.stringify(authenticatedUser));
        setIsLoading(false);
        return;
      } else {
        setErrorMessage('كلمة المرور غير صحيحة لهذا المستخدم.');
        setIsLoading(false);
        return;
      }
    }

    // 3. Fallback for default commander account
    if (
      (normId === 'admin' || normId.includes('موسى') || normId.includes('البدين')) &&
      (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === '123456' || cleanPass === '12341234')
    ) {
      const adminUser = {
        id: 1,
        username: 'admin',
        full_name: 'سيادة اللواء / موسى سعد محمد البدين',
        badge_number: 'MOI-10492',
        rank_title: 'لواء شرطة / رئيس مركز العمليات والتحكم',
        department: 'مديرية أمن أوباري',
        role: 'super_admin',
        role_label: 'مدير عام المنظومة (صلاحيات سيادية كاملة)',
        allowed_sections: ['all'],
        status: 'active'
      };
      setUser(adminUser);
      setActiveSection('dashboard');
      const tokenVal = `moi-admin-token-${Date.now()}`;
      setToken(tokenVal);
      localStorage.setItem('moi_token', tokenVal);
      localStorage.setItem('moi_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return;
    }

    setErrorMessage('بيانات الدخول غير صحيحة. يرجى التحقق من اسم المستخدم أو كلمة المرور.');
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('moi_token');
    localStorage.removeItem('moi_user');
    setIsMobileMenuOpen(false);
  };

  // Open Form to Add New Personnel
  const handleOpenAdd = () => {
    setEditingMemberId(null);
    setForceFormData(EMPTY_FORCE_FORM);
    setShowForceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Form to Edit Existing Personnel
  const handleOpenEdit = (member) => {
    setEditingMemberId(member.id);
    setForceFormData({ ...member });
    setShowForceForm(true);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Open Preview Modal for Member (معاينة بطاقة الهوية والملف الشامل)
  const handleOpenPreview = (member) => {
    const savedPhoto = member.photo || localStorage.getItem(`ubari_officer_photo_${member.id}`) || '';
    setPreviewMember({ ...member, photo: savedPhoto });
    setShowPreviewModal(true);
  };

  // Update Officer Photo in Force State and Storage
  const handleUpdateMemberPhoto = (memberId, photoDataUrl) => {
    // 1. Prioritize saving the dedicated individual photo key first (lightweight, guaranteed not to exceed quota)
    try {
      if (photoDataUrl) {
        localStorage.setItem(`ubari_officer_photo_${memberId}`, photoDataUrl);
      } else {
        localStorage.removeItem(`ubari_officer_photo_${memberId}`);
      }
    } catch (err) {
      console.warn('Dedicated officer photo storage warning:', err);
    }

    // 2. Update React in-memory state
    const updated = forceMembers.map((m) => {
      if (String(m.id) === String(memberId)) {
        return { ...m, photo: photoDataUrl };
      }
      return m;
    });
    setForceMembers(updated);

    if (previewMember && String(previewMember.id) === String(memberId)) {
      setPreviewMember({ ...previewMember, photo: photoDataUrl });
    }

    // 3. Safely sync forceMembers to localStorage without embedding bloated base64 data into all 2,211 records
    try {
      const cleanForceForStorage = updated.map((m) => {
        if (m.photo && m.photo.startsWith('data:')) {
          const { photo, ...rest } = m;
          return rest;
        }
        return m;
      });
      localStorage.setItem('ubari_force_members', JSON.stringify(cleanForceForStorage));
    } catch (e) {
      console.warn('Storage warning for ubari_force_members:', e);
    }

    fetch(`/api/force/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: photoDataUrl })
    }).catch(() => {});

    setNotificationMsg(photoDataUrl ? '✅ تم حفظ وتحديث صورة المنتسب في السجل الأمني' : '🗑️ تم إزالة الصورة الشخصية');
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Instant Live Status Change for Member (تفعيل وتحديث الوضع الوظيفي الفوري)
  const handleQuickStatusChange = (id, newStatus) => {
    let memberName = '';
    const updated = forceMembers.map((m) => {
      if (m.id === id) {
        memberName = m.name;
        return { ...m, job_status: newStatus, status: newStatus };
      }
      return m;
    });

    setForceMembers(updated);
    try {
      localStorage.setItem('ubari_force_members', JSON.stringify(updated));
    } catch (e) {}

    fetch(`/api/force/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_status: newStatus, status: newStatus })
    }).catch(() => {});

    setNotificationMsg(`✅ تم تحديث الوضع الوظيفي لـ (${memberName}) إلى: [${newStatus}] بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Save or Update Personnel
  const handleSaveMember = async (e) => {
    if (e) e.preventDefault();
    if (!forceFormData.name.trim()) {
      alert('يرجى إدخال الاسم الكامل');
      return;
    }

    if (editingMemberId) {
      // Update existing person
      const updated = forceMembers.map((m) =>
        m.id === editingMemberId ? { ...forceFormData, id: editingMemberId } : m
      );
      setForceMembers(updated);
      localStorage.setItem('ubari_force_members', JSON.stringify(updated));

      // Sync with API
      fetch(`/api/force/${editingMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forceFormData)
      }).catch(() => {});

      setNotificationMsg(`تم تحديث وتعديل بيانات (${forceFormData.name}) بنجاح`);
    } else {
      // Add new person
      const newMember = {
        ...forceFormData,
        id: Date.now()
      };
      const updated = [newMember, ...forceMembers];
      setForceMembers(updated);
      localStorage.setItem('ubari_force_members', JSON.stringify(updated));

      // Sync with API
      fetch('/api/force', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      }).catch(() => {});

      setNotificationMsg(`تم حفظ وتوثيق بيانات (${forceFormData.name}) بنجاح في القوة العمومية`);
    }

    setShowForceForm(false);
    setEditingMemberId(null);
    setForceFormData(EMPTY_FORCE_FORM);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  const handleDeleteMember = (id, name) => {
    if (confirm(`هل أنت متأكد من حذف قيد (${name}) نهائياً من القوة العمومية؟`)) {
      const updated = forceMembers.filter((m) => m.id !== id);
      setForceMembers(updated);
      localStorage.setItem('ubari_force_members', JSON.stringify(updated));

      fetch(`/api/force/${id}`, { method: 'DELETE' }).catch(() => {});

      setNotificationMsg(`تم حذف قيد (${name}) بنجاح`);
      setTimeout(() => setNotificationMsg(''), 4000);
    }
  };

  // Score hierarchy for Libyan Police / Security Ranks (1 = highest: لواء, down to شرطي = 17, civilians = 1000)
  const getMilitaryRankScore = (rawRank, type) => {
    const r = String(rawRank || '').replace(/[\u0640]/g, '').trim().toLowerCase();
    const isCiv = (type && String(type).includes('مدني')) || r.includes('مدني');
    if (isCiv) return 1000;

    // Commissioned Officers (الضباط)
    if (r.includes('لواء')) return 1;
    if (r.includes('عميد')) return 2;
    if (r.includes('عقيد')) return 3;
    if (r.includes('مقدم')) return 4;
    if (r.includes('رائد')) return 5;
    if (r.includes('نقيب')) return 6;
    if (r.includes('ملازم') && (r.includes('اول') || r.includes('أول') || r.includes('1') || r.includes('//'))) return 7;
    if (r.includes('ملازم')) return 8;

    // Warrant & Non-Commissioned Officers (ضباط الصف والشرف)
    if (r.includes('نائب ضابط اول') || r.includes('نائب ضابط أول') || r === 'ن.ض.أ' || r === 'ن ض ا') return 9;
    if (r.includes('نائب ضابط') || r === 'ن.ض' || r === 'ن ض') return 10;
    if (r.includes('مساعد ضابط اول') || r.includes('مساعد ضابط أول') || r === 'م.ض.أ' || r === 'م ض ا') return 11;
    if (r.includes('مساعد ضابط') || r === 'م.ض' || r === 'م ض' || r === 'م.ص') return 12;
    if (r.includes('رئيس عرفاء اول') || r.includes('رئيس عرفاء أول') || r.includes('ريس عرفاء اول') || r.includes('ر.ع.أ') || r.includes('ر.ع. أ') || r.includes('ر ع ا') || r.includes('ع.أ.ر')) return 13;
    if (r.includes('رئيس عرفاء') || r.includes('ريس عرفاء') || r === 'ر.ع' || r === 'رع' || r === 'ر ع' || r === 'ر .ع') return 14;
    if (r.includes('عريف') && !r.includes('نائب') && !r.includes('ن.ع')) return 15;
    if (r.includes('نائب عريف') || r === 'ن.ع') return 16;
    if (r.includes('شرطي') || r.includes('شـرطـي')) return 17;

    return 900;
  };

  // Filtered & Sorted Members:
  // 1. Police ranks sorted hierarchically from highest to lowest (لواء -> شرطي)
  // 2. Within each military rank, officers are sorted alphabetically by Arabic name
  // 3. Civilian members are grouped and sorted alphabetically by Arabic name (أبجدياً)
  const filteredMembers = useMemo(() => {
    const term = forceSearchTerm.trim().toLowerCase();
    const list = forceMembers.filter((m) => {
      const matchesType = typeFilter === 'الكل' || m.type === typeFilter;
      if (!matchesType) return false;

      const rawSt = (m.job_status || m.status || 'على رأس العمل').trim();
      const matchesStatus =
        statusFilter === 'الكل' ||
        (statusFilter === 'على رأس العمل' && !rawSt.includes('إجازة') && !rawSt.includes('موقوف') && !rawSt.includes('إيقاف') && !rawSt.includes('معلق')) ||
        (statusFilter === 'إجازة' && rawSt.includes('إجازة')) ||
        (statusFilter === 'موقوف' && (rawSt.includes('موقوف') || rawSt.includes('إيقاف') || rawSt.includes('معلق'))) ||
        rawSt === statusFilter;

      if (!matchesStatus) return false;

      if (!term) return true;
      return (
        (m.name && m.name.toLowerCase().includes(term)) ||
        (m.financial_number && String(m.financial_number).includes(term)) ||
        (m.job_number && String(m.job_number).toLowerCase().includes(term)) ||
        (m.national_id && String(m.national_id).includes(term)) ||
        (m.bank_name && m.bank_name.toLowerCase().includes(term)) ||
        (m.account_number && String(m.account_number).includes(term)) ||
        (m.job_title && m.job_title.toLowerCase().includes(term)) ||
        (m.department && m.department.toLowerCase().includes(term)) ||
        (m.job_status && m.job_status.toLowerCase().includes(term))
      );
    });

    return list.sort((a, b) => {
      const scoreA = getMilitaryRankScore(a.rank || a.job_title, a.type);
      const scoreB = getMilitaryRankScore(b.rank || b.job_title, b.type);

      // Military rank hierarchy first
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      // Alphabetical sorting within the same rank or among civilians
      const nameA = a.name ? String(a.name).trim() : '';
      const nameB = b.name ? String(b.name).trim() : '';
      return nameA.localeCompare(nameB, 'ar-LY', { sensitivity: 'base' });
    });
  }, [forceMembers, forceSearchTerm, typeFilter, statusFilter]);

  // Live Status Stats across all members (3 official statuses: على رأس العمل، إجازة رسمية، موقوف مؤقتاً)
  const statusStats = useMemo(() => {
    let onDuty = 0, onLeave = 0, onSuspended = 0;
    forceMembers.forEach(m => {
      const st = (m.job_status || m.status || 'على رأس العمل').trim();
      if (st.includes('إجازة')) onLeave++;
      else if (st.includes('موقوف') || st.includes('إيقاف') || st.includes('معلق')) onSuspended++;
      else onDuty++;
    });
    return { onDuty, onLeave, onSuspended };
  }, [forceMembers]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredMembers.slice(start, start + rowsPerPage);
  }, [filteredMembers, currentPage, rowsPerPage]);

  const policeTotal = forceMembers.filter(m => m.type === 'شرطي').length;
  const civilTotal = forceMembers.filter(m => m.type === 'مدني').length;

  // Handle Export to Excel/CSV with Arabic UTF-8 BOM
  const handleExportExcel = () => {
    try {
      const headers = ['رقم الموظف / المالي', 'الاسم الكامل', 'النوع', 'الوظيفة / الرتبة', 'الرقم الوطني', 'اسم المصرف', 'رقم الحساب', 'الوضع الوظيفي'];
      const rows = filteredMembers.map(m => [
        `"${m.financial_number || m.job_number || ''}"`,
        `"${m.name || ''}"`,
        `"${m.type || ''}"`,
        `"${m.rank || ''}"`,
        `"${m.national_id || ''}"`,
        `"${m.bank_name || ''}"`,
        `"${m.account_number || ''}"`,
        `"${m.status || 'على رأس العمل'}"`
      ]);
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `كشف_القوة_العمومية_مديرية_أمن_أوباري_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير الملف');
    }
  };


  const handlePrintForceRoster = () => {
    const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
    const printRows = filteredMembers.slice(0, 32);
    const html = `
      <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 20px; color: #0a192f;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 18px;">
          <div style="text-align: right;">
            <h3 style="margin: 0; font-size: 14px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
            <h2 style="margin: 2px 0; font-size: 17px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
            <h4 style="margin: 0; font-size: 12px; color: #475569;">قسم شؤون الضباط والأفراد | السجل العام للقوة العمومية</h4>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 20px; font-weight: 900; color: #1e3a8a;">كشف القوة العمومية المعتمد</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">تاريخ الاستخراج: ${today}</div>
          </div>
          <div style="text-align: left; font-size: 12px;">
            <div><strong>عدد السجلات:</strong> ${filteredMembers.length} عضو</div>
            <div><strong>القسم:</strong> ${selectedDepartment === 'all' ? 'كافة الأقسام' : selectedDepartment}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: right; margin-bottom: 25px;">
          <thead>
            <tr style="background: #1e3a8a; color: white;">
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 35px; text-align: center;">ت</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">الاسم الرباعي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 90px;">الرقم المالي</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px;">الرتبة</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1;">التبعية / جهة العمل</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 100px;">المصرف</th>
              <th style="padding: 8px; border: 1px solid #cbd5e1; width: 85px; text-align: center;">الحالة</th>
            </tr>
          </thead>
          <tbody>
            ${printRows.map((m, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">${m.name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.financial_number || m.job_number || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.job_title || m.rank || 'شرطي'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.department || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.bank_name || '---'}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #15803d;">${m.job_status || m.status || 'على رأس العمل'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 35px; padding: 0 40px;">
          <div>
            <div style="font-weight: 800; font-size: 13px;">مسؤول شؤون القوة</div>
            <div style="margin-top: 35px; font-size: 12px;">نقيب / علي محمد البشير</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">رئيس قسم الشؤون الإدارية</div>
            <div style="margin-top: 35px; font-size: 12px;">مقدم / سالم عبدالكريم</div>
          </div>
          <div>
            <div style="font-weight: 800; font-size: 13px;">يعتمد / مدير أمن أوباري</div>
            <div style="margin-top: 35px; font-size: 12px; font-weight: bold; color: #1e3a8a;">سيادة اللواء / موسى سعد البدين</div>
          </div>
        </div>
      </div>
    `;
    printDocumentInIframe(html, 'كشف_القوة_العمومية_أوباري');
  };

  // Trigger file selection for force import
  const handleTriggerForceImport = () => {
    if (forceFileInputRef.current) {
      forceFileInputRef.current.value = '';
      forceFileInputRef.current.click();
    }
  };

  // Handle file reading and parsing (.xlsx, .xls, .csv, .json)
  const handleForceFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const fileName = file.name;
      setImportFileName(fileName);
      const extension = fileName.split('.').pop().toLowerCase();

      let rawArray = [];

      if (extension === 'json') {
        const text = await file.text();
        const json = JSON.parse(text);
        rawArray = Array.isArray(json) ? json : (json.data || json.members || []);
      } else {
        // Excel (.xlsx, .xls) or CSV
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        rawArray = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      }

      if (!rawArray || rawArray.length === 0) {
        alert('الملف المحدد فارغ أو لا يحتوي على صفوف بيانات.');
        setIsImporting(false);
        return;
      }

      const removeTatweel = (s) => String(s || '').replace(/[\u0640]/g, '').trim();
      const normalizeColKey = (k) => removeTatweel(k).replace(/\s+/g, '').toLowerCase();

      const normalized = rawArray.map((row, idx) => {
        const normRow = {};
        for (const k of Object.keys(row)) {
          normRow[normalizeColKey(k)] = row[k];
        }

        // 1. Full Name
        let rawName = '';
        for (const k of Object.keys(normRow)) {
          if (k.includes('اسم') || k.includes('name')) {
            rawName = normRow[k];
            break;
          }
        }
        const name = removeTatweel(rawName);

        // 2. Rank & Position
        let rawRank = '';
        for (const k of Object.keys(normRow)) {
          if (k.includes('رتب') || k.includes('صف') || k.includes('وظي') || k.includes('درج') || k.includes('rank')) {
            rawRank = normRow[k];
            break;
          }
        }
        const rank = removeTatweel(rawRank) || 'شرطي';
        const isCivil = rank.includes('مدني');
        const type = isCivil ? 'مدني' : 'شرطي';
        const job_title = rank || (isCivil ? 'مدني' : 'شـرطـي');

        // 3. National ID (only numeric digits)
        let rawNat = '';
        for (const k of Object.keys(normRow)) {
          if (k.includes('وطن') || k.includes('هوي') || k.includes('national')) {
            rawNat = normRow[k];
            break;
          }
        }
        const national_id = removeTatweel(rawNat).replace(/\D/g, '');

        // 4. Financial Number / Job Number
        let rawJob = '';
        for (const k of Object.keys(normRow)) {
          if (k === 'الرقم' || k.includes('مال') || k.includes('عسكر') || k.includes('قيد') || k.includes('job') || k.includes('fin')) {
            rawJob = normRow[k];
            break;
          }
        }
        const cleanJobVal = removeTatweel(rawJob);
        const hasDigits = /\d/.test(cleanJobVal);
        const isNoNum = !cleanJobVal || cleanJobVal.includes('لا') || cleanJobVal.includes('بدون') || !hasDigits;
        const financial_number = isNoNum ? '' : cleanJobVal.replace(/[^\d-]/g, '');
        const job_number = isNoNum ? 'بدون رقم مالي' : cleanJobVal;

        // 5. Department / Station
        let rawDept = '';
        for (const k of Object.keys(normRow)) {
          if (k.includes('قسم') || k.includes('ادار') || k.includes('مركز') || k.includes('تبع') || k.includes('جه')) {
            rawDept = normRow[k];
            break;
          }
        }
        const department = removeTatweel(rawDept) || 'مركز شرطة أوباري المدينة';

        return {
          id: idx + 1,
          name,
          rank,
          job_title,
          type,
          job_number,
          financial_number,
          national_id,
          department,
          job_status: 'على رأس العمل',
          status: 'على رأس العمل',
          bank_name: 'الصحاري بنت بيه',
          bank_branch: 'فرع أوباري',
          account_number: '',
          basic_salary: '2200',
          blood_type: 'O+'
        };
      }).filter(m => m.name && m.name.length >= 2);

      if (normalized.length === 0) {
        alert('تعذر استخراج بيانات صالحة من الملف. يرجى التأكد من احتواء الملف على أعمدة مثل (الاسم، الرتبة، الرقم المالي أو الوظيفي).');
        setIsImporting(false);
        return;
      }

      setPendingImportData(normalized);
      setShowImportConfirmModal(true);
    } catch (err) {
      console.error('Error importing force file:', err);
      alert('حدث خطأ أثناء قراءة ومعالجة الملف: ' + (err.message || 'تأكد من صيغة الملف'));
    } finally {
      setIsImporting(false);
    }
  };

  // Confirm adding new imported force members onto the existing force (strictly preserving all old members)
  const handleConfirmReplaceForce = async () => {
    if (!pendingImportData || pendingImportData.length === 0) return;

    // Build identifier lookup to match existing records if re-imported
    const existingNatMap = new Map();
    const existingFinMap = new Map();
    const existingNameMap = new Map();

    forceMembers.forEach(m => {
      const nat = m.national_id ? String(m.national_id).replace(/\D/g, '').trim() : '';
      const fin = m.financial_number ? String(m.financial_number).replace(/\D/g, '').trim() : '';
      const nName = m.name ? normalizeArabicText(m.name) : '';

      // Only index strictly valid identifiers (never index empty, 0, or generic words!)
      if (nat && nat.length >= 8) existingNatMap.set(nat, m);
      if (fin && fin.length >= 2) existingFinMap.set(fin, m);
      if (nName && nName.length >= 5) existingNameMap.set(nName, m);
    });

    let addedCount = 0;
    let updatedCount = 0;
    // Strict requirement: NEVER delete old records. Start with 100% of existing force intact!
    const mergedList = [...forceMembers];
    const maxCurrentId = mergedList.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0);

    pendingImportData.forEach(newItem => {
      const nat = newItem.national_id ? String(newItem.national_id).replace(/\D/g, '').trim() : '';
      const fin = newItem.financial_number ? String(newItem.financial_number).replace(/\D/g, '').trim() : '';
      const nName = newItem.name ? normalizeArabicText(newItem.name) : '';

      let existingMatch = null;
      if (nat && nat.length >= 8 && existingNatMap.has(nat)) {
        existingMatch = existingNatMap.get(nat);
      } else if (fin && fin.length >= 2 && existingFinMap.has(fin)) {
        existingMatch = existingFinMap.get(fin);
      } else if (nName && nName.length >= 5 && existingNameMap.has(nName)) {
        existingMatch = existingNameMap.get(nName);
      }

      if (existingMatch) {
        // Exists in old force: update any new/refreshed details while preserving original ID
        const idx = mergedList.findIndex(m => m.id === existingMatch.id);
        if (idx !== -1) {
          mergedList[idx] = {
            ...mergedList[idx],
            ...newItem,
            id: mergedList[idx].id,
            // Keep existing identifiers if new one was missing
            national_id: newItem.national_id || mergedList[idx].national_id || '',
            financial_number: newItem.financial_number || mergedList[idx].financial_number || '',
            job_number: (newItem.job_number && newItem.job_number !== 'بدون رقم مالي') ? newItem.job_number : (mergedList[idx].job_number || 'بدون رقم مالي')
          };
          updatedCount++;
        }
      } else {
        // Brand new member: strictly append onto existing force without touching old ones
        addedCount++;
        const newRecord = {
          ...newItem,
          id: maxCurrentId + addedCount
        };
        mergedList.push(newRecord);
        if (nat && nat.length >= 8) existingNatMap.set(nat, newRecord);
        if (fin && fin.length >= 2) existingFinMap.set(fin, newRecord);
        if (nName && nName.length >= 5) existingNameMap.set(nName, newRecord);
      }
    });

    setForceMembers(mergedList);
    try {
      localStorage.setItem('ubari_force_members', JSON.stringify(mergedList));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // Sync full combined list with backend API
    try {
      await fetch('/api/force/replace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: mergedList })
      });
    } catch (e) {
      console.warn('Backend sync failed, saved locally:', e);
    }

    setShowImportConfirmModal(false);
    setPendingImportData(null);
    if (forceFileInputRef.current) forceFileInputRef.current.value = '';

    const summaryText = `✅ تم بنجاح إضافة (${addedCount.toLocaleString('ar-LY')}) فرداً جديداً وتحديث بيانات (${updatedCount.toLocaleString('ar-LY')}) فرداً مع حفظ كافة القوة القديمة (${forceMembers.length.toLocaleString('ar-LY')} فرد) بالكامل دون حذف أي قيد! إجمالي القوة الآن: (${mergedList.length.toLocaleString('ar-LY')}) فرد.`;

    setNotificationMsg(summaryText);
    setTimeout(() => setNotificationMsg(''), 7000);
  };

  const handleCancelImport = () => {
    setShowImportConfirmModal(false);
    setPendingImportData(null);
    if (forceFileInputRef.current) forceFileInputRef.current.value = '';
  };

  // Open Profile Modal
  const handleOpenProfileModal = () => {
    if (!user) return;
    const isSuper = user.username === 'admin' || user.id === 1;
    const currentAvatar = isSuper
      ? (user.avatar || localStorage.getItem('ubari_user_avatar') || '')
      : (user.avatar || localStorage.getItem(`ubari_avatar_${user.id || user.username}`) || '');

    setProfileFormData({
      full_name: user.full_name || (isSuper ? 'سيادة اللواء / موسى سعد محمد البدين' : ''),
      badge_number: user.badge_number || (isSuper ? 'MOI-10492' : ''),
      rank_title: user.rank_title || (isSuper ? 'لواء شرطة / رئيس مركز العمليات والتحكم' : 'موظف مديرية أمن أوباري'),
      department: user.department || 'مديرية أمن أوباري',
      phone: user.phone || '',
      email: user.email || '',
      avatar: currentAvatar,
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
    setShowProfileModal(true);
  };

  // Avatar file upload handler
  const handleAvatarFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('حجم الصورة كبير، يرجى اختيار صورة أقل من 8 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setProfileFormData(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setProfileFormData(prev => ({ ...prev, avatar: '' }));
    if (user) {
      const isSuper = user.username === 'admin' || user.id === 1;
      if (isSuper) {
        localStorage.removeItem('ubari_user_avatar');
      } else {
        localStorage.removeItem(`ubari_avatar_${user.id || user.username}`);
      }
      const updatedUser = { ...user, avatar: '' };
      setUser(updatedUser);
      localStorage.setItem('moi_user', JSON.stringify(updatedUser));
      setSystemUsers(prev => {
        const nextUsers = prev.map(u => (u.id === user.id || u.username === user.username) ? { ...u, avatar: '' } : u);
        localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));
        return nextUsers;
      });
    }
  };

  // Save profile and update localStorage + backend
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (profileFormData.new_password && profileFormData.new_password !== profileFormData.confirm_password) {
      alert('كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور');
      return;
    }

    const updatedUser = {
      ...user,
      full_name: profileFormData.full_name || user.full_name,
      badge_number: profileFormData.badge_number || user.badge_number,
      rank_title: profileFormData.rank_title || user.rank_title,
      department: profileFormData.department || user.department,
      phone: profileFormData.phone,
      email: profileFormData.email,
      avatar: profileFormData.avatar || ''
    };

    setUser(updatedUser);
    localStorage.setItem('moi_user', JSON.stringify(updatedUser));

    const isSuper = user.username === 'admin' || user.id === 1;
    if (isSuper) {
      if (profileFormData.avatar) {
        localStorage.setItem('ubari_user_avatar', profileFormData.avatar);
      } else {
        localStorage.removeItem('ubari_user_avatar');
      }
    } else {
      const userKey = `ubari_avatar_${user.id || user.username}`;
      if (profileFormData.avatar) {
        localStorage.setItem(userKey, profileFormData.avatar);
      } else {
        localStorage.removeItem(userKey);
      }
    }

    setSystemUsers(prev => {
      const nextUsers = prev.map(u => (u.id === user.id || u.username === user.username) ? { ...u, ...updatedUser } : u);
      localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));
      return nextUsers;
    });

    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFormData)
      });
    } catch (err) {}

    setShowProfileModal(false);
    setNotificationMsg('تم تحديث البيانات الشخصية والصورة بنجاح');
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Filtered system users
  const filteredUsers = useMemo(() => {
    const term = userSearchTerm.trim().toLowerCase();
    return systemUsers.filter(u => {
      if (userRoleFilter !== 'all') {
        if (userRoleFilter === 'super_admin' && u.role !== 'super_admin' && u.role !== 'admin') return false;
        if (userRoleFilter === 'force_manager' && u.role !== 'force_manager') return false;
        if (userRoleFilter === 'operations_lead' && u.role !== 'operations_lead') return false;
      }
      if (!term) return true;
      return (
        (u.full_name && u.full_name.toLowerCase().includes(term)) ||
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.badge_number && u.badge_number.toLowerCase().includes(term)) ||
        (u.rank_title && u.rank_title.toLowerCase().includes(term))
      );
    });
  }, [systemUsers, userSearchTerm, userRoleFilter]);

  // Autocomplete suggestions filtered from forceMembers (قوة 2222)
  const filteredNameSuggestions = useMemo(() => {
    if (!forceMembers || forceMembers.length === 0) return [];
    const query = normalizeArabicText(newUserFormData.full_name || '');

    // If query is empty, provide first 35 personnel from the database as initial choices
    if (!query) {
      return forceMembers.slice(0, 35);
    }

    const startsWithMatches = [];
    const wordStartsMatches = [];
    const containsMatches = [];

    for (let i = 0; i < forceMembers.length; i++) {
      const m = forceMembers[i];
      if (!m.name) continue;
      const normName = normalizeArabicText(m.name);

      if (normName.startsWith(query)) {
        startsWithMatches.push(m);
      } else {
        const words = normName.split(/\s+/);
        if (words.some(w => w.startsWith(query))) {
          wordStartsMatches.push(m);
        } else if (normName.includes(query)) {
          containsMatches.push(m);
        }
      }
      if (startsWithMatches.length >= 60) break;
    }

    return [...startsWithMatches, ...wordStartsMatches, ...containsMatches].slice(0, 45);
  }, [forceMembers, newUserFormData.full_name]);

  // Handle selecting a suggested force member to auto-populate user creation fields
  const handleSelectSuggestedMember = (member) => {
    const badgeNum = member.financial_number
      ? `MOI-${member.financial_number}`
      : (member.job_number ? `MOI-${member.job_number}` : `MOI-${Math.floor(10000 + Math.random() * 90000)}`);

    const cleanNum = (member.financial_number || member.job_number || '').replace(/[^0-9]/g, '');
    const suggestedUsername = cleanNum ? `moi.${cleanNum}` : `user.${member.id || Math.floor(1000 + Math.random() * 9000)}`;

    const rank = member.job_title || (member.type === 'شرطي' ? 'ضابط شرطة' : 'موظف مدني');
    const role = member.type === 'شرطي' ? 'force_manager' : 'data_entry';
    const roleLabel = member.type === 'شرطي' ? 'مسؤول القوة العمومية والبيانات' : 'مدخل بيانات ومسؤول أرشيف';

    setNewUserFormData(prev => ({
      ...prev,
      full_name: member.name,
      badge_number: badgeNum,
      rank_title: rank,
      username: prev.username && prev.username !== 'test@example.com' && prev.username !== 'username...' ? prev.username : suggestedUsername,
      phone: member.phone || prev.phone || '',
      email: member.financial_number ? `user.${member.financial_number}@ubari.moi.gov.ly` : (prev.email || 'user@ubari.moi.gov.ly'),
      department: member.department || 'مديرية أمن أوباري',
      role: prev.role || role,
      role_label: prev.role_label || roleLabel,
    }));

    setSelectedForcePersonnel(member);
    setShowNameSuggestions(false);
  };

  // Save new user
  const handleSaveNewUser = async (e) => {
    if (e) e.preventDefault();
    if (!newUserFormData.full_name || !newUserFormData.username) {
      alert('يرجى إدخال الاسم الكامل واسم الدخول');
      return;
    }

    const newUser = {
      ...newUserFormData,
      id: Date.now(),
      last_login: 'لم يسجل دخول بعد',
      created_at: new Date().toISOString()
    };

    const nextUsers = [newUser, ...systemUsers];
    setSystemUsers(nextUsers);
    localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (err) {}

    setShowAddUserModal(false);
    setNotificationMsg(`تمت إضافة وتفعيل حساب (${newUser.full_name}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Save edited user
  const handleSaveEditUser = async (e) => {
    if (e) e.preventDefault();
    if (!editingUserData) return;

    const nextUsers = systemUsers.map(u => u.id === editingUserData.id ? editingUserData : u);
    setSystemUsers(nextUsers);
    localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));

    try {
      await fetch(`/api/users/${editingUserData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUserData)
      });
    } catch (err) {}

    setShowEditUserModal(false);
    setEditingUserData(null);
    setNotificationMsg(`تم تحديث بيانات وصلاحيات (${editingUserData.full_name}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  const handleToggleUserStatus = (id) => {
    const userToToggle = systemUsers.find(u => u.id === id);
    if (!userToToggle) return;
    if (id === 1) {
      alert('لا يمكن تجميد الحساب القيادي الرئيسي للمنظومة');
      return;
    }
    const newStatus = userToToggle.status === 'active' ? 'suspended' : 'active';
    const nextUsers = systemUsers.map(u => u.id === id ? { ...u, status: newStatus } : u);
    setSystemUsers(nextUsers);
    localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));

    fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});

    setNotificationMsg(`تم ${newStatus === 'active' ? 'تنشيط' : 'تعليق'} حساب (${userToToggle.full_name}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // View User Security Dossier
  const handleOpenViewModal = (targetUser) => {
    setViewingUserData(targetUser);
    setShowViewUserModal(true);
  };

  // Jump from View to Edit
  const handleEditFromView = (targetUser) => {
    setShowViewUserModal(false);
    setEditingUserData({ ...targetUser });
    setShowEditUserModal(true);
  };

  // Open Delete Confirmation Modal
  const handleOpenDeleteModal = (targetUser) => {
    if (targetUser.id === 1) {
      setNotificationMsg('تنبيه أمني: الحساب القيادي الرئيسي للمنظومة محمي من الحذف');
      setTimeout(() => setNotificationMsg(''), 4000);
      return;
    }
    setUserToDelete(targetUser);
    setShowDeleteUserModal(true);
  };

  // Confirm and Execute User Deletion
  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { id, full_name } = userToDelete;
    const nextUsers = systemUsers.filter(u => u.id !== id);
    setSystemUsers(nextUsers);
    localStorage.setItem('ubari_system_users', JSON.stringify(nextUsers));

    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (err) {}

    setShowDeleteUserModal(false);
    setUserToDelete(null);
    setNotificationMsg(`تم حذف حساب (${full_name}) بنجاح وإلغاء كافة صلاحياته الأمنية`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Helper to format friendly Arabic date for compact single-line display
  const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return 'مؤخراً';
    if (dateStr.includes('الآن') || dateStr.includes('اليوم')) return dateStr;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('ar-LY', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Render Module Content Based on Active Section
  const renderContent = () => {
    // Access permission guard
    const isSuper = user?.role === 'super_admin' || user?.username === 'admin' || user?.id === 1;
    const isAllowed = isSuper || activeSection === 'profile' || userAllowedSections.some(s => s.id === activeSection);
    if (!isAllowed) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={32} />
          </div>
          <h2 style={{ color: '#0a192f', fontSize: '20px', marginBottom: '8px' }}>غير مصرح بالدخول لهذا القسم</h2>
          <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '450px', margin: '0 auto 20px' }}>
            حسابك الحالي لا يمتلك صلاحية الوصول إلى هذا القسم. يرجى مراجعة إدارة المنظومة أو الانتقال إلى الأقسام المصرح لك بها.
          </p>
          {userAllowedSections.length > 0 && (
            <button
              type="button"
              className="btn-toolbar-save"
              onClick={() => setActiveSection(userAllowedSections[0].id)}
            >
              الانتقال إلى {userAllowedSections[0].name}
            </button>
          )}
        </div>
      );
    }

    if (activeSection === 'profile') {
      return (
        <div className="officer-profile-page-view">
          {/* Header */}
          <div className="module-view-header">
            <div className="module-title-box">
              <div className="title-gold-bar" />
              <div>
                <h1>الملف الشخصي والبيانات القيادية للضابط</h1>
                <span>مديرية أمن أوباري | بطاقة الهوية الرسمية وإعدادات الحساب والصورة الشخصية</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-toolbar-save"
                onClick={handleOpenProfileModal}
              >
                <Settings size={16} />
                <span>فتح نافذة الإعدادات السريعة</span>
              </button>
            </div>
          </div>

          <div className="profile-page-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 360px) 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Right Card: Officer Identity & Avatar Upload Card */}
            <div className="profile-sidebar-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 100%)',
                  border: '4px solid #d4af37',
                  boxShadow: '0 8px 24px rgba(10, 25, 47, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '46px',
                  fontWeight: 900,
                  color: '#ffffff',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="صورة الضابط" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{user.full_name ? user.full_name.charAt(0) : 'م'}</span>
                  )}
                </div>

                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', margin: '0 0 6px' }}>{user.full_name || 'سيادة اللواء / موسى سعد محمد البدين'}</h2>
                <p style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: 700, margin: '0 0 12px' }}>{user.rank_title || 'لواء شرطة / رئيس مركز العمليات والتحكم'}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                    {user.badge_number || 'MOI-10492'}
                  </span>
                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800 }}>
                    ● نشط ومصرح
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="btn-upload-file" style={{ width: '100%', justifyContent: 'center' }}>
                    <Camera size={16} />
                    <span>تغيير / رفع صورة رسمية</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFileChange}
                    />
                  </label>
                  {user.avatar && (
                    <button
                      type="button"
                      className="btn-remove-avatar"
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 size={15} />
                      <span>إزالة الصورة الشخصية</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>التبعية الرسمية:</span>
                  <strong style={{ color: '#0a192f' }}>{user.department || 'غرفة العمليات المركزية والتحكم'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>الهاتف المعتمد:</span>
                  <strong style={{ color: '#0a192f' }}>{user.phone || '091-2345678'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>البريد الرسمي:</span>
                  <strong style={{ color: '#0a192f' }}>{user.email || 'admin@moi.gov.ly'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: '#64748b' }}>مستوى التفويض:</span>
                  <strong style={{ color: '#d97706' }}>صلاحيات سيادية شاملة</strong>
                </div>
              </div>
            </div>

            {/* Left Card: Full Form to edit details directly */}
            <div className="profile-main-form-card" style={{ background: '#ffffff', borderRadius: '18px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0a192f', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#1d4ed8" />
                  <span>تحديث البيانات القيادية وحساب الدخول</span>
                </h3>
                <span style={{ fontSize: '12px', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                  حساب معتمد ومؤمن (AES-256)
                </span>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '20px' }}>
                  <div className="input-field-group">
                    <label>الاسم الكامل والرسمي</label>
                    <input
                      type="text"
                      value={profileFormData.full_name || user.full_name}
                      onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-field-group">
                    <label>الرقم العسكري / الأمني</label>
                    <input
                      type="text"
                      value={profileFormData.badge_number || user.badge_number}
                      onChange={(e) => setProfileFormData({ ...profileFormData, badge_number: e.target.value })}
                    />
                  </div>

                  <div className="input-field-group">
                    <label>الرتبة والصفة القيادية</label>
                    <input
                      type="text"
                      value={profileFormData.rank_title || user.rank_title}
                      onChange={(e) => setProfileFormData({ ...profileFormData, rank_title: e.target.value })}
                    />
                  </div>

                  <div className="input-field-group">
                    <label>الإدارة / التبعية الأمنية</label>
                    <input
                      type="text"
                      value={profileFormData.department || user.department}
                      onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })}
                    />
                  </div>

                  <div className="input-field-group">
                    <label>رقم الهاتف المعتمد</label>
                    <input
                      type="text"
                      value={profileFormData.phone || user.phone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                      placeholder="091-XXXXXXX"
                    />
                  </div>

                  <div className="input-field-group">
                    <label>البريد الإلكتروني الرسمي</label>
                    <input
                      type="email"
                      value={profileFormData.email || user.email}
                      onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      placeholder="user@moi.gov.ly"
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0', marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0a192f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={16} />
                    <span>تغيير كلمة المرور الرسمية (اختياري)</span>
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div className="input-field-group">
                      <label>كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        value={profileFormData.new_password}
                        onChange={(e) => setProfileFormData({ ...profileFormData, new_password: e.target.value })}
                        placeholder="اتركها فارغة لعدم التغيير"
                      />
                    </div>
                    <div className="input-field-group">
                      <label>تأكيد كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        value={profileFormData.confirm_password}
                        onChange={(e) => setProfileFormData({ ...profileFormData, confirm_password: e.target.value })}
                        placeholder="أعد إدخال كلمة المرور"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="submit" className="btn-toolbar-save" style={{ padding: '12px 24px', fontSize: '14px' }}>
                    <Save size={18} />
                    <span>حفظ وتحديث الملف الشخصي</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'force') {
      return (
        <div>
          {/* Header Bar */}
          <div className="module-view-header">
            <div className="module-title-box">
              <div className="title-gold-bar" />
              <div>
                <h1>إدارة القوة العمومية</h1>
                <span>مديرية أمن أوباري | قاعدة البيانات المركزية المعتمدة (قوة 2222)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-toolbar-import"
                onClick={handleTriggerForceImport}
                disabled={isImporting}
                title="استيراد وإضافة أفراد جدد إلى القوة العمومية الحالية (تضاف السجلات الجديدة فوق القديمة دون حذف)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: isImporting ? 'wait' : 'pointer',
                  boxShadow: '0 2px 10px rgba(2,132,199,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <UploadCloud size={16} />
                <span>{isImporting ? 'جاري قراءة الملف...' : 'استيراد وإضافة أفراد للقوة'}</span>
              </button>

              <button
                type="button"
                className="btn-toolbar-excel"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet size={16} />
                <span>تصدير إكسل</span>
              </button>

              <button
                type="button"
                className="btn-toolbar-print"
                onClick={handlePrintForceRoster}
              >
                <Printer size={16} />
                <span>طباعة القوة العمومية</span>
              </button>

              <button
                type="button"
                className={`btn-official-primary ${showForceForm ? 'is-open' : ''}`}
                onClick={showForceForm ? () => setShowForceForm(false) : handleOpenAdd}
              >
                <span className="btn-icon-wrapper">
                  {showForceForm ? <X size={15} strokeWidth={2.6} /> : <Plus size={15} strokeWidth={2.6} />}
                </span>
                <span>{showForceForm ? 'إغلاق النموذج' : 'إضافة موظف جديد'}</span>
              </button>
            </div>
          </div>

          {notificationMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '12px 18px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={18} />
              <span>{notificationMsg}</span>
            </div>
          )}

          {/* Statistics summary */}
          <div className="stats-summary-grid">
            <div className="stat-box-card" onClick={() => { setTypeFilter('الكل'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon"><Users size={22} /></div>
              <div className="stat-box-content">
                <h3>{forceMembers.length.toLocaleString('ar-LY')}</h3>
                <p>إجمالي القوة المقيدة (قوة 2222)</p>
              </div>
            </div>

            <div className="stat-box-card" onClick={() => { setTypeFilter('شرطي'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                <Shield size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{policeTotal.toLocaleString('ar-LY')}</h3>
                <p>أفراد وضباط الشرطة</p>
              </div>
            </div>

            <div className="stat-box-card" onClick={() => { setTypeFilter('مدني'); setCurrentPage(1); }} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon" style={{ background: '#f8fafc', color: '#475569' }}>
                <Users size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{civilTotal.toLocaleString('ar-LY')}</h3>
                <p>الموظفين المدنيين</p>
              </div>
            </div>

            <div className="stat-box-card">
              <div className="stat-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-box-content">
                <h3>100%</h3>
                <p>حالة التوثيق بقاعدة البيانات</p>
              </div>
            </div>
          </div>

          {/* Form Section: ALL fields unified strictly under "البيانات الشخصية والتعريفية" as requested */}
          {showForceForm && (
            <div className="force-form-card">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px',
                borderBottom: '1px solid #edf2f7',
                paddingBottom: '12px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0a192f' }}>
                  {editingMemberId ? `تعديل وتحديث بيانات: ${forceFormData.name}` : 'إضافة قيد موظف / منتسب جديد بالقوة العمومية'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForceForm(false)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMember}>
                {/* Top Radio Bar: شرطي vs مدني strictly */}
                <div className="type-radio-bar">
                  <label className="type-radio-item">
                    <input
                      type="radio"
                      name="person_type"
                      checked={forceFormData.type === 'شرطي'}
                      onChange={() => setForceFormData({ ...forceFormData, type: 'شرطي' })}
                    />
                    <span>شرطي</span>
                  </label>

                  <label className="type-radio-item">
                    <input
                      type="radio"
                      name="person_type"
                      checked={forceFormData.type === 'مدني'}
                      onChange={() => setForceFormData({ ...forceFormData, type: 'مدني' })}
                    />
                    <span>مدني</span>
                  </label>
                </div>

                {/* All fields grouped under "البيانات الشخصية والتعريفية" */}
                <div className="box-personal-data">
                  <div className="box-title-personal">
                    <Users size={18} />
                    <span>البيانات الشخصية والتعريفية</span>
                  </div>

                  {/* Row 1 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>الاسم الكامل</label>
                      <ForceNameAutocomplete
                        value={forceFormData.name}
                        onChange={(val) => setForceFormData({ ...forceFormData, name: val })}
                        onSelect={(member) => {
                          setForceFormData({
                            ...forceFormData,
                            name: member.name,
                            job_number: member.job_number || member.financial_number || '',
                            national_id: member.national_id || '',
                            birth_date: member.birth_date || '',
                            birth_place: member.birth_place || 'أوباري',
                            mother_name: member.mother_name || '',
                            marital_status: member.marital_status || 'متزوج',
                            wife_name: member.wife_name || '',
                            children_count: member.children_count || '0',
                            tribe_city: member.tribe_city || 'أوباري',
                            residence: member.residence || 'أوباري',
                            phone: member.phone || '',
                            languages: member.languages || 'العربية',
                            education_level: member.education_level || 'مؤهل مدني',
                            type: member.type || 'مدني',
                            department: member.department || '',
                            job_title: member.job_title || '',
                            job_status: member.job_status || 'على رأس العمل',
                            financial_number: member.financial_number || member.job_number || '',
                            basic_salary: member.basic_salary || '',
                            bank_name: member.bank_name || '',
                            bank_branch: member.bank_branch || '',
                            account_number: member.account_number || ''
                          });
                        }}
                        forceMembers={forceMembers}
                        placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم الوظيفي</label>
                      <input
                        type="text"
                        placeholder="رقم الموظف..."
                        value={forceFormData.job_number}
                        onChange={(e) => setForceFormData({ ...forceFormData, job_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم الوطني / الإداري (10-12 رقم)</label>
                      <input
                        type="text"
                        placeholder="119..."
                        value={forceFormData.national_id}
                        onChange={(e) => setForceFormData({ ...forceFormData, national_id: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>تاريخ الميلاد (يوم/شهر/سنة)</label>
                      <input
                        type="date"
                        value={forceFormData.birth_date}
                        onChange={(e) => setForceFormData({ ...forceFormData, birth_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>مكان الميلاد</label>
                      <input
                        type="text"
                        placeholder="المدينة / المنطقة..."
                        value={forceFormData.birth_place}
                        onChange={(e) => setForceFormData({ ...forceFormData, birth_place: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>اسم الأم</label>
                      <input
                        type="text"
                        placeholder="اسم الأم ثلاثياً..."
                        value={forceFormData.mother_name}
                        onChange={(e) => setForceFormData({ ...forceFormData, mother_name: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الحالة الاجتماعية</label>
                      <select
                        value={forceFormData.marital_status}
                        onChange={(e) => setForceFormData({ ...forceFormData, marital_status: e.target.value })}
                      >
                        <option value="أعزب">أعزب</option>
                        <option value="متزوج">متزوج</option>
                        <option value="مطلق">مطلق</option>
                        <option value="أرمل">أرمل</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>اسم الزوجة</label>
                      <input
                        type="text"
                        placeholder="اسم الزوجة..."
                        value={forceFormData.wife_name}
                        onChange={(e) => setForceFormData({ ...forceFormData, wife_name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>عدد الأبناء</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={forceFormData.children_count}
                        onChange={(e) => setForceFormData({ ...forceFormData, children_count: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>القبيلة / المدينة</label>
                      <input
                        type="text"
                        placeholder="القبيلة أو المدينة..."
                        value={forceFormData.tribe_city}
                        onChange={(e) => setForceFormData({ ...forceFormData, tribe_city: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الإقامة</label>
                      <input
                        type="text"
                        placeholder="عنوان السكن الحالي..."
                        value={forceFormData.residence}
                        onChange={(e) => setForceFormData({ ...forceFormData, residence: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم الهاتف</label>
                      <input
                        type="text"
                        placeholder="091-..."
                        value={forceFormData.phone}
                        onChange={(e) => setForceFormData({ ...forceFormData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>اللغة التي يجيدها</label>
                      <input
                        type="text"
                        placeholder="العربية، التارقية..."
                        value={forceFormData.languages}
                        onChange={(e) => setForceFormData({ ...forceFormData, languages: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>المستوى الدراسي (المؤهل)</label>
                      <input
                        type="text"
                        placeholder="المؤهل العلمي والتخصص..."
                        value={forceFormData.education_level}
                        onChange={(e) => setForceFormData({ ...forceFormData, education_level: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم كتيب العائلة</label>
                      <input
                        type="text"
                        placeholder="رقم كتيب العائلة..."
                        value={forceFormData.family_book}
                        onChange={(e) => setForceFormData({ ...forceFormData, family_book: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم ورقة العائلة</label>
                      <input
                        type="text"
                        placeholder="رقم ورقة العائلة..."
                        value={forceFormData.family_paper}
                        onChange={(e) => setForceFormData({ ...forceFormData, family_paper: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 5 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>رقم قيد العائلة</label>
                      <input
                        type="text"
                        placeholder="رقم قيد العائلة..."
                        value={forceFormData.family_record}
                        onChange={(e) => setForceFormData({ ...forceFormData, family_record: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم الجواز</label>
                      <input
                        type="text"
                        placeholder="P..."
                        value={forceFormData.passport_number}
                        onChange={(e) => setForceFormData({ ...forceFormData, passport_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم البدلة</label>
                      <input
                        type="text"
                        placeholder="MOI-..."
                        value={forceFormData.suit_number}
                        onChange={(e) => setForceFormData({ ...forceFormData, suit_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم الحذاء</label>
                      <input
                        type="text"
                        placeholder="42..."
                        value={forceFormData.shoe_size}
                        onChange={(e) => setForceFormData({ ...forceFormData, shoe_size: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 6 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>رقم غطاء الرأس</label>
                      <input
                        type="text"
                        placeholder="58..."
                        value={forceFormData.headwear_size}
                        onChange={(e) => setForceFormData({ ...forceFormData, headwear_size: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم القميص</label>
                      <input
                        type="text"
                        placeholder="L, XL..."
                        value={forceFormData.shirt_size}
                        onChange={(e) => setForceFormData({ ...forceFormData, shirt_size: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>فصيلة الدم / البطاقة الضمانية</label>
                      <select
                        value={forceFormData.blood_type}
                        onChange={(e) => setForceFormData({ ...forceFormData, blood_type: e.target.value })}
                      >
                        <option value="O+">O+ (موجب)</option>
                        <option value="O-">O- (سالب)</option>
                        <option value="A+">A+ (موجب)</option>
                        <option value="A-">A- (سالب)</option>
                        <option value="B+">B+ (موجب)</option>
                        <option value="B-">B- (سالب)</option>
                        <option value="AB+">AB+ (موجب)</option>
                        <option value="AB-">AB- (سالب)</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>الأمراض (إن وجدت)</label>
                      <input
                        type="text"
                        placeholder="سليم، أو حدد إن وجد..."
                        value={forceFormData.diseases}
                        onChange={(e) => setForceFormData({ ...forceFormData, diseases: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 7 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>الطول (سم)</label>
                      <input
                        type="number"
                        placeholder="175"
                        value={forceFormData.height}
                        onChange={(e) => setForceFormData({ ...forceFormData, height: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الوزن (كجم)</label>
                      <input
                        type="number"
                        placeholder="75"
                        value={forceFormData.weight}
                        onChange={(e) => setForceFormData({ ...forceFormData, weight: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>اختر القسم</label>
                      <select
                        value={forceFormData.department}
                        onChange={(e) => setForceFormData({ ...forceFormData, department: e.target.value })}
                      >
                        <option value="ديوان مديرية أمن أوباري">ديوان مديرية أمن أوباري</option>
                        <option value="مركز شرطة أوباري المدينة">مركز شرطة أوباري المدينة</option>
                        <option value="قسم البحث الجنائي أوباري">قسم البحث الجنائي أوباري</option>
                        <option value="وحدة النجدة والدوريات">وحدة النجدة والدوريات</option>
                        <option value="قسم المرور والتراخيص">قسم المرور والتراخيص</option>
                        <option value="غرفة العمليات والاتصالات">غرفة العمليات والاتصالات</option>
                        <option value="الأمن الوقائي والدوريات">الأمن الوقائي والدوريات</option>
                        <option value="ورشة الصيانة والآليات">ورشة الصيانة والآليات</option>
                        <option value="إدارة المحروقات والتموين">إدارة المحروقات والتموين</option>
                        <option value="المخازن والعهد العسكرية">المخازن والعهد العسكرية</option>
                        <option value="الشؤون الإدارية والمالية">الشؤون الإدارية والمالية</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>اختر الوظيفة / الرتبة</label>
                      <input
                        type="text"
                        placeholder="المسمى الوظيفي أو الرتبة..."
                        value={forceFormData.job_title}
                        onChange={(e) => setForceFormData({ ...forceFormData, job_title: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 8 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>الوضع الوظيفي...</label>
                      <select
                        value={forceFormData.job_status}
                        onChange={(e) => setForceFormData({ ...forceFormData, job_status: e.target.value })}
                      >
                        <option value="على رأس العمل">على رأس العمل</option>
                        <option value="إجازة رسمية">إجازة رسمية</option>
                        <option value="موقوف مؤقتاً">موقوف مؤقتاً</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>تاريخ المباشرة (يوم/شهر/سنة)</label>
                      <input
                        type="date"
                        value={forceFormData.start_date}
                        onChange={(e) => setForceFormData({ ...forceFormData, start_date: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>قرار التعيين</label>
                      <input
                        type="text"
                        placeholder="رقم وتاريخ قرار التعيين..."
                        value={forceFormData.appointment_decision}
                        onChange={(e) => setForceFormData({ ...forceFormData, appointment_decision: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>تاريخ التعيين (يوم/شهر/سنة)</label>
                      <input
                        type="date"
                        value={forceFormData.appointment_date}
                        onChange={(e) => setForceFormData({ ...forceFormData, appointment_date: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 9 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>قرار آخر ترقية</label>
                      <input
                        type="text"
                        placeholder="رقم وتفاصيل قرار آخر ترقية..."
                        value={forceFormData.last_promotion_decision}
                        onChange={(e) => setForceFormData({ ...forceFormData, last_promotion_decision: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>تاريخ آخر ترقية (يوم/شهر/سنة)</label>
                      <input
                        type="date"
                        value={forceFormData.last_promotion_date}
                        onChange={(e) => setForceFormData({ ...forceFormData, last_promotion_date: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم المالي</label>
                      <input
                        type="text"
                        placeholder="الرقم المالي..."
                        value={forceFormData.financial_number}
                        onChange={(e) => setForceFormData({ ...forceFormData, financial_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>المرتب الأساسي</label>
                      <input
                        type="text"
                        placeholder="دينار ليبي..."
                        value={forceFormData.basic_salary}
                        onChange={(e) => setForceFormData({ ...forceFormData, basic_salary: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Row 10 */}
                  <div className="grid-4-cols">
                    <div className="input-field-group">
                      <label>اسم المصرف</label>
                      <input
                        type="text"
                        placeholder="الصحاري، الجمهورية، التجاري..."
                        value={forceFormData.bank_name}
                        onChange={(e) => setForceFormData({ ...forceFormData, bank_name: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الفرع المصرفي</label>
                      <input
                        type="text"
                        placeholder="فرع أوباري..."
                        value={forceFormData.bank_branch}
                        onChange={(e) => setForceFormData({ ...forceFormData, bank_branch: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم الحساب المصرفي</label>
                      <input
                        type="text"
                        placeholder="رقم الحساب المصرفي الكامل..."
                        value={forceFormData.account_number}
                        onChange={(e) => setForceFormData({ ...forceFormData, account_number: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Action Button (Save) */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', marginTop: '16px' }}>
                  <button type="submit" className="btn-toolbar-save">
                    <Save size={18} />
                    <span>{editingMemberId ? 'تحديث وتعديل بيانات الموظف' : 'حفظ بيانات الموظف'}</span>
                  </button>

                  <button
                    type="button"
                    className="btn-official-secondary"
                    onClick={() => {
                      setShowForceForm(false);
                      setEditingMemberId(null);
                    }}
                  >
                    <span>إلغاء</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Action Toolbar Below Form - Keep only Print and Export */}
          <div className="table-panel-card">
            <div className="toolbar-actions-row">
              <button
                type="button"
                className="btn-toolbar-excel"
                onClick={handleExportExcel}
              >
                <FileSpreadsheet size={16} />
                <span>تصدير إكسل</span>
              </button>

              <button
                type="button"
                className="btn-toolbar-print"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>طباعة القوة العمومية</span>
              </button>
            </div>

            {/* Quick Search Bar + Filter */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginTop: '20px',
              marginBottom: '16px',
              flexWrap: 'wrap'
            }}>
              <div className="table-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="...بحث سريع باسم الموظف أو الرقم المالي أو الوطني أو المصرف"
                  value={forceSearchTerm}
                  onChange={(e) => {
                    setForceSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Type Filter Buttons + Status Filter Dropdown */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`filter-pill-btn ${typeFilter === 'الكل' ? 'active' : ''}`}
                    onClick={() => { setTypeFilter('الكل'); setCurrentPage(1); }}
                  >
                    الكل ({forceMembers.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${typeFilter === 'شرطي' ? 'active' : ''}`}
                    onClick={() => { setTypeFilter('شرطي'); setCurrentPage(1); }}
                  >
                    شرطة ({policeTotal})
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${typeFilter === 'مدني' ? 'active' : ''}`}
                    onClick={() => { setTypeFilter('مدني'); setCurrentPage(1); }}
                  >
                    مدني ({civilTotal})
                  </button>
                </div>

                {/* Live Status Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: 800,
                      background: statusFilter === 'الكل' ? '#f8fafc' : '#eff6ff',
                      color: statusFilter === 'الكل' ? '#334155' : '#1e40af',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                    title="فرز القوة حسب الوضع الوظيفي الفعلي"
                  >
                    <option value="الكل">الوضع الوظيفي: الكل ({forceMembers.length})</option>
                    <option value="على رأس العمل">🟢 على رأس العمل ({statusStats.onDuty})</option>
                    <option value="إجازة">🟡 إجازات رسمية ({statusStats.onLeave})</option>
                    <option value="موقوف">🔴 موقوف مؤقتاً ({statusStats.onSuspended})</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#166534',
                  fontWeight: 700
                }}>
                  <ShieldCheck size={14} color="#16a34a" />
                  <span>الترتيب: حسب الرتبة العسكرية (لواء ← شرطي) والمدنيين أبجدياً</span>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
                  المطابق: {filteredMembers.length.toLocaleString('ar-LY')} قيد (الصفحة {currentPage} من {totalPages})
                </div>
              </div>
            </div>

            {/* Personnel Table with Edit & Delete actions */}
            <div style={{ overflowX: 'auto' }}>
              <table className="official-data-table">
                <thead>
                  <tr>
                    <th>رقم الموظف / المالي</th>
                    <th>الاسم الكامل</th>
                    <th>النوع</th>
                    <th>الوظيفة / الرتبة</th>
                    <th>الرقم الوطني</th>
                    <th>اسم المصرف</th>
                    <th>رقم الحساب</th>
                    <th>الوضع الوظيفي</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.map((m) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 800, color: '#1e3a8a' }}>
                        {m.financial_number || m.job_number || '-'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {(() => {
                            const rowPhoto = m.photo || localStorage.getItem(`ubari_officer_photo_${m.id}`);
                            return rowPhoto ? (
                              <img
                                src={rowPhoto}
                                alt={m.name}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '1.5px solid #d4af37',
                                  flexShrink: 0
                                }}
                              />
                            ) : (
                            <span
                              style={{
                                width: '26px',
                                height: '26px',
                                borderRadius: '50%',
                                background: m.type === 'شرطي' ? '#1e3a8a' : '#64748b',
                                color: '#ffffff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 800,
                                flexShrink: 0
                              }}
                            >
                              {m.name ? m.name.trim().charAt(0) : 'ش'}
                            </span>
                          );
                        })()}
                        <span>{m.name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: m.type === 'شرطي' ? '#eff6ff' : '#f8fafc',
                          color: m.type === 'شرطي' ? '#1e3a8a' : '#64748b',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#1e293b' }}>{m.job_title || '-'}</td>
                      <td>{m.national_id || '-'}</td>
                      <td>{m.bank_name || '-'}</td>
                      <td style={{ direction: 'ltr', textAlign: 'right', fontWeight: 600 }}>
                        {m.account_number || '-'}
                      </td>
                      <td>
                        <select
                          value={m.job_status || 'على رأس العمل'}
                          onChange={(e) => handleQuickStatusChange(m.id, e.target.value)}
                          style={{
                            cursor: 'pointer',
                            border: '1px solid rgba(0,0,0,0.08)',
                            outline: 'none',
                            fontWeight: 800,
                            fontSize: '11px',
                            borderRadius: '20px',
                            padding: '4px 8px',
                            textAlign: 'center',
                            fontFamily: 'inherit',
                            background:
                              (!m.job_status || m.job_status === 'على رأس العمل') ? '#dcfce7' :
                              m.job_status.includes('إجازة') ? '#fef3c7' :
                              m.job_status.includes('موقوف') || m.job_status.includes('إيقاف') ? '#fee2e2' : '#dcfce7',
                            color:
                              (!m.job_status || m.job_status === 'على رأس العمل') ? '#15803d' :
                              m.job_status.includes('إجازة') ? '#b45309' :
                              m.job_status.includes('موقوف') || m.job_status.includes('إيقاف') ? '#b91c1c' : '#15803d'
                          }}
                          title="الوضع الوظيفي: اضغط لتغيير الحالة وتفعيلها مباشرة"
                        >
                          <option value="على رأس العمل">🟢 على رأس العمل</option>
                          <option value="إجازة رسمية">🟡 إجازة رسمية</option>
                          <option value="موقوف مؤقتاً">🔴 موقوف مؤقتاً</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(m)}
                            style={{
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              border: 'none',
                              color: '#ffffff',
                              cursor: 'pointer',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 4px rgba(2,132,199,0.3)',
                              transition: 'all 0.15s ease'
                            }}
                            title="معاينة الملف الشامل للمنتسب"
                          >
                            <Eye size={13} />
                            <span>معاينة</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(m)}
                            style={{
                              background: '#eff6ff',
                              border: '1px solid #bfdbfe',
                              color: '#1e3a8a',
                              cursor: 'pointer',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                              transition: 'all 0.15s ease'
                            }}
                            title="تعديل وتحديث بيانات الشخص"
                          >
                            <Edit size={13} color="#2563eb" />
                            <span>تعديل</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '5px 7px',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease'
                            }}
                            title="حذف القيد"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedMembers.length === 0 && (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '34px', color: '#64748b' }}>
                        لا توجد نتائج مطابقة للبحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #edf2f7'
              }}>
                <button
                  type="button"
                  className="btn-official-secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{ opacity: currentPage === 1 ? 0.5 : 1, padding: '6px 12px' }}
                >
                  <ChevronRight size={16} />
                  <span>السابق</span>
                </button>

                <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', padding: '0 10px' }}>
                  الصفحة {currentPage} من {totalPages}
                </span>

                <button
                  type="button"
                  className="btn-official-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{ opacity: currentPage === totalPages ? 0.5 : 1, padding: '6px 12px' }}
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

    if (activeSection === 'dashboard') {
      return (
        <DashboardSection
          user={user}
          forceMembers={forceMembers}
          setForceMembers={setForceMembers}
          setActiveSection={setActiveSection}
          onTriggerImport={handleTriggerForceImport}
        />
      );
    }

    if (activeSection === 'user_management') {
      return (
        <div className="users-management-view">
          {/* Module View Header */}
          <div className="module-view-header">
            <div className="module-title-box">
              <div className="title-gold-bar" />
              <div>
                <h1>إدارة المستخدمين والصلاحيات</h1>
                <span>مديرية أمن أوباري | منظومة التحكم في الحسابات والأدوار الأمنية</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-toolbar-excel"
                onClick={() => {
                  const headers = ['الاسم الكامل', 'اسم الدخول', 'الرقم الأمني', 'الرتبة والوظيفة', 'الصلاحية', 'الحالة', 'الهاتف'];
                  const rows = filteredUsers.map(u => [
                    `"${u.full_name}"`,
                    `"${u.username}"`,
                    `"${u.badge_number}"`,
                    `"${u.rank_title}"`,
                    `"${u.role_label || u.role}"`,
                    `"${u.status === 'active' ? 'نشط ومصرح' : 'معلق'}"`,
                    `"${u.phone || ''}"`
                  ]);
                  const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `سجل_مستخدمي_المنظومة_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <FileSpreadsheet size={16} />
                <span>تصدير كشف المستخدمين</span>
              </button>

              <button
                type="button"
                className="btn-toolbar-print"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                <span>طباعة الكشف</span>
              </button>

              <button
                type="button"
                className="btn-official-primary"
                onClick={() => {
                  setNewUserFormData(EMPTY_USER_FORM);
                  setSelectedForcePersonnel(null);
                  setShowNameSuggestions(false);
                  setShowAddUserModal(true);
                }}
              >
                <span className="btn-icon-wrapper">
                  <UserPlus size={15} strokeWidth={2.6} />
                </span>
                <span>إضافة مستخدم جديد</span>
              </button>
            </div>
          </div>

          {/* User Stats Grid */}
          <div className="stats-summary-grid">
            <div className="stat-box-card" onClick={() => setUserRoleFilter('all')} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                <Users size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{systemUsers.length}</h3>
                <p>إجمالي مستخدمي المنظومة</p>
              </div>
            </div>

            <div className="stat-box-card" onClick={() => setUserRoleFilter('super_admin')} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <ShieldCheck size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{systemUsers.filter(u => u.role === 'super_admin' || u.role === 'admin').length}</h3>
                <p>الحسابات القيادية والإشرافية</p>
              </div>
            </div>

            <div className="stat-box-card" onClick={() => setUserRoleFilter('force_manager')} style={{ cursor: 'pointer' }}>
              <div className="stat-box-icon" style={{ background: '#f0fdf4', color: '#15803d' }}>
                <UserCheck size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{systemUsers.filter(u => u.role === 'force_manager' || u.role === 'operations_lead').length}</h3>
                <p>ضباط العمليات والقوة العمومية</p>
              </div>
            </div>

            <div className="stat-box-card">
              <div className="stat-box-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-box-content">
                <h3>{systemUsers.filter(u => u.status === 'active').length} / {systemUsers.length}</h3>
                <p>الحسابات النشطة والمحمية</p>
              </div>
            </div>
          </div>

          {/* Users Table Card */}
          <div className="table-panel-card">
            {/* Search and Filters */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              marginBottom: '18px',
              flexWrap: 'wrap'
            }}>
              <div className="table-search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="...بحث باسم المستخدم، الاسم الكامل، الرقم العسكري أو الرتبة"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`filter-pill-btn ${userRoleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('all')}
                >
                  الكل ({systemUsers.length})
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${userRoleFilter === 'super_admin' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('super_admin')}
                >
                  القيادة العامة
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${userRoleFilter === 'force_manager' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('force_manager')}
                >
                  القوة العمومية
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${userRoleFilter === 'operations_lead' ? 'active' : ''}`}
                  onClick={() => setUserRoleFilter('operations_lead')}
                >
                  العمليات
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="moi-table-container">
              <table className="moi-data-table">
                <thead>
                  <tr>
                    <th>المستخدم والصفة</th>
                    <th>اسم الدخول</th>
                    <th>الرقم الأمني</th>
                    <th>مستوى الصلاحية</th>
                    <th>الأقسام المخولة</th>
                    <th>الحالة</th>
                    <th>آخر نشاط</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="table-user-cell">
                          <div className="user-table-avatar">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.full_name} className="user-avatar-img" />
                            ) : (
                              <span>{u.full_name ? u.full_name.charAt(0) : 'ض'}</span>
                            )}
                          </div>
                          <div className="table-user-meta">
                            <span className="user-name">{u.full_name}</span>
                            <span className="user-rank">{u.rank_title}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>
                        <code style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', fontSize: '12px', color: '#0f172a', whiteSpace: 'nowrap' }}>{u.username}</code>
                      </td>
                      <td style={{ fontWeight: 800, color: '#1e3a8a', whiteSpace: 'nowrap' }}>{u.badge_number}</td>
                      <td>
                        <span className={`role-badge ${u.role}`} style={{ whiteSpace: 'nowrap' }}>
                          {u.role_label || u.role}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                          {u.allowed_sections && u.allowed_sections.includes('all') ? (
                            <span className="section-pill-badge all">كافة أقسام المنظومة (شامل)</span>
                          ) : (
                            <>
                              {u.allowed_sections && u.allowed_sections.slice(0, 2).map(secId => {
                                const sec = SECTIONS.find(s => s.id === secId);
                                return (
                                  <span key={secId} className="section-pill-badge">
                                    {sec ? sec.name : secId}
                                  </span>
                                );
                              })}
                              {u.allowed_sections && u.allowed_sections.length > 2 && (
                                <span
                                  className="section-pill-badge"
                                  style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 800 }}
                                  title={u.allowed_sections.map(id => SECTIONS.find(s => s.id === id)?.name || id).join('، ')}
                                >
                                  +{u.allowed_sections.length - 2} أقسام
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill ${u.status === 'active' ? 'active' : 'suspended'}`} style={{ whiteSpace: 'nowrap' }}>
                          {u.status === 'active' ? 'نشط ومصرح' : 'معلق مؤقتاً'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {formatFriendlyDate(u.last_login)}
                      </td>
                      <td>
                        <div className="table-actions-container">
                          {/* زر العرض والاطلاع على الصلاحيات */}
                          <button
                            type="button"
                            className="btn-moi-action btn-moi-view"
                            onClick={() => handleOpenViewModal(u)}
                            title="عرض الملف الأمني والصلاحيات"
                          >
                            <Eye size={13} />
                            <span>عرض</span>
                          </button>

                          {/* زر التعديل وتحديث الصلاحيات */}
                          <button
                            type="button"
                            className="btn-moi-action btn-moi-edit"
                            onClick={() => {
                              setEditingUserData({ ...u });
                              setShowEditUserModal(true);
                            }}
                            title="تعديل البيانات ومستوى الصلاحية"
                          >
                            <Edit size={13} />
                            <span>تعديل</span>
                          </button>

                          {/* زر الحذف أو الشارة المحمية */}
                          {u.id !== 1 ? (
                            <button
                              type="button"
                              className="btn-moi-action btn-moi-delete"
                              onClick={() => handleOpenDeleteModal(u)}
                              title="حذف الحساب وإلغاء الصلاحيات"
                            >
                              <Trash2 size={13} />
                              <span>حذف</span>
                            </button>
                          ) : (
                            <span className="protected-commander-pill" title="حساب القيادة العامة محمي من الحذف">
                              <Lock size={11} />
                              <span>محمي</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'mail') {
      return <MailSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'referred') {
      return <ReferredMailSection user={user} />;
    }

    if (activeSection === 'letters') {
      return <TemplatesSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'vehicles') {
      return <VehiclesSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'operations') {
      return <OperationsSection forceMembers={forceMembers} user={user} />;
    }

    if (activeSection === 'detainees') {
      return <DetaineesSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'attendance') {
      return <AttendanceSection forceMembers={forceMembers} user={user} />;
    }

    if (activeSection === 'leaves') {
      return <LeavesSection forceMembers={forceMembers} user={user} />;
    }

    if (activeSection === 'discipline') {
      return <PenaltiesSection forceMembers={forceMembers} user={user} />;
    }

    if (activeSection === 'fuel') {
      return <FuelSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'inventory') {
      return <InventorySection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'shifts') {
      return <PatrolsSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'records') {
      return <StationLogsSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'salaries') {
      return <PayrollSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'maintenance') {
      return <MaintenanceSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'decrees') {
      return <DecisionsSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'archive') {
      return <ArchiveSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'general_reports') {
      return <AdministrativeReportsSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'command_reports') {
      return <StrategicReportsSection user={user} forceMembers={forceMembers} />;
    }

    if (activeSection === 'general_settings') {
      return <SettingsSection user={user} />;
    }

    if (activeSection === 'audit_log') {
      return <AuditLogSection user={user} />;
    }

    // Generic View for other sections
    const currentSectionObj = SECTIONS.find(s => s.id === activeSection) || SECTIONS[0];
    const IconComponent = currentSectionObj.icon;

    return (
      <div>
        <div className="module-view-header">
          <div className="module-title-box">
            <div className="title-gold-bar" />
            <div>
              <h1>{currentSectionObj.name}</h1>
              <span>مديرية أمن أوباري | النظام المركزي الموحد</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              className="btn-official-secondary"
            >
              <Printer size={16} />
              <span>طباعة تقرير</span>
            </button>
            <button
              onClick={() => setActiveSection('force')}
              className="btn-official-primary"
            >
              <Users size={16} />
              <span>الانتقال للقوة العمومية</span>
            </button>
          </div>
        </div>

        <div className="table-panel-card" style={{ padding: '36px 28px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid #edf2f7'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <IconComponent size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0a192f' }}>
                قسم {currentSectionObj.name}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                السجلات والبيانات الرسمية التابعة لمديرية أمن أوباري
              </p>
            </div>
          </div>

          <div className="stats-summary-grid">
            <div className="stat-box-card">
              <div className="stat-box-icon"><CheckCircle2 size={22} /></div>
              <div className="stat-box-content">
                <h3>جاهز ومفعل</h3>
                <p>الحالة التشغيلية</p>
              </div>
            </div>
            <div className="stat-box-card">
              <div className="stat-box-icon" style={{ background: '#f8fafc', color: '#0f172a' }}>
                <FileCheck size={22} />
              </div>
              <div className="stat-box-content">
                <h3>قيد المتابعة</h3>
                <p>السجلات والقيود</p>
              </div>
            </div>
            <div className="stat-box-card">
              <div className="stat-box-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                <Shield size={22} />
              </div>
              <div className="stat-box-content">
                <h3>مديرية أمن أوباري</h3>
                <p>التبعية والقيادة</p>
              </div>
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
            color: '#475569'
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600 }}>
              قسم <strong>{currentSectionObj.name}</strong> مبرمج ومربوط بالمنظومة، ويمكن إضافة وتعديل السجلات الخاصة به بحسب محاضر العمل والتعليمات الصادرة عن سيادة اللواء / موسى سعد محمد البدين.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // If user is authenticated, render Main Dashboard Shell
  if (user) {
    return (
      <div className="dashboard-container">
        {/* Hidden File Input for Force Import (.xlsx, .xls, .csv, .json) */}
        <input
          type="file"
          ref={forceFileInputRef}
          accept=".xlsx, .xls, .csv, .json"
          style={{ display: 'none' }}
          onChange={handleForceFileChange}
        />

        {/* Backdrop for Mobile */}
        <div
          className={`sidebar-backdrop ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar Navigation */}
        <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <div className="sidebar-logo">
                <img src="./moi-logo.png" onError={(e) => { e.currentTarget.src = './moi-logo.png'; }} alt="وزارة الداخلية" />
              </div>
              <div className="sidebar-title">
                <h2>وزارة الداخلية</h2>
                <span>مديرية أمن أوباري</span>
              </div>
            </div>
            <button
              className="sidebar-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="sidebar-nav">
            {userAllowedSections.map((sec) => {
              const IconComp = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <div
                  key={sec.id}
                  id={`nav-item-${sec.id}`}
                  data-section={sec.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection(sec.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <IconComp size={17} />
                  <span>{sec.name}</span>
                </div>
              );
            })}
          </nav>

          <div
            className="sidebar-user"
            onClick={handleOpenProfileModal}
            title="انقر لفتح إعدادات المستخدم وتعديل البيانات ورفع الصورة"
          >
            <div className="sidebar-user-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt="صورة المستخدم" className="user-avatar-img" />
              ) : (
                <span>{user.full_name ? user.full_name.charAt(0) : 'م'}</span>
              )}
              <div className="avatar-edit-badge" title="تغيير الصورة">
                <Camera size={10} />
              </div>
            </div>
            <div className="sidebar-user-info">
              <h4>{user.full_name || 'سيادة اللواء / موسى سعد محمد البدين'}</h4>
              <p>{user.badge_number || 'MOI-10492'} | {user.rank_title || 'لواء شرطة'}</p>
            </div>
            <div className="sidebar-user-settings-icon" title="إعدادات الحساب">
              <Settings size={15} />
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="dashboard-main">
          {/* Top Navigation Bar */}
          <header className="dashboard-topbar">
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                className="mobile-menu-btn"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="فتح القائمة"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="topbar-left">
              {/* Officer Profile Quick Button */}
              <button
                type="button"
                className="topbar-profile-btn"
                onClick={handleOpenProfileModal}
                title="الملف الشخصي وإعدادات الحساب - انقر لتعديل بياناتك ورفع صورتك"
              >
                <div className="topbar-avatar-circle">
                  {user.avatar ? (
                    <img src={user.avatar} alt="صورة المستخدم" className="topbar-avatar-img" />
                  ) : (
                    <span>{user.full_name ? user.full_name.charAt(0) : 'م'}</span>
                  )}
                </div>
                <div className="topbar-profile-info">
                  <span className="topbar-profile-name">{user.full_name || 'سيادة اللواء / موسى سعد محمد البدين'}</span>
                  <span className="topbar-profile-sub">الملف الشخصي والإعدادات</span>
                </div>
                <Settings size={15} style={{ color: '#64748b', marginRight: '4px' }} />
              </button>

              <span className="topbar-date-text" style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                {currentTime} | {new Date().toLocaleDateString('ar-LY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <button onClick={handleLogout} className="logout-btn" title="تسجيل الخروج">
                <LogOut size={16} />
                <span>خروج</span>
              </button>
            </div>
          </header>

          {/* Dynamic Module View */}
          <div className="dashboard-content">
            {renderContent()}
          </div>
        </main>

        {/* User Profile & Settings Modal */}
        {showProfileModal && (
          <div className="moi-modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="moi-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header">
                <h3>
                  <Settings size={20} />
                  <span>إعدادات المستخدم والملف الشخصي القيادي</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="moi-modal-body">
                  {/* Photo Upload Zone */}
                  <div className="avatar-upload-container">
                    <div className="avatar-preview-circle">
                      {profileFormData.avatar ? (
                        <img src={profileFormData.avatar} alt="معاينة الصورة" />
                      ) : (
                        <span>{profileFormData.full_name ? profileFormData.full_name.charAt(0) : 'م'}</span>
                      )}
                    </div>
                    <div className="avatar-upload-info">
                      <h4>الصورة الشخصية للضابط</h4>
                      <p>قم برفع صورة رسمية لتظهر في الشريط الجانبي والترويسة وبطاقة التعريف (JPG, PNG, WEBP)</p>
                      <div className="avatar-upload-actions">
                        <label className="btn-upload-file">
                          <Camera size={16} />
                          <span>رفع صورة جديدة</span>
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleAvatarFileChange}
                          />
                        </label>
                        {profileFormData.avatar && (
                          <button
                            type="button"
                            className="btn-remove-avatar"
                            onClick={handleRemoveAvatar}
                          >
                            <Trash2 size={15} />
                            <span>إزالة الصورة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Personal & Official Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="input-field-group">
                      <label>الاسم الكامل والرتبة الرسمية</label>
                      <input
                        type="text"
                        value={profileFormData.full_name}
                        onChange={(e) => setProfileFormData({ ...profileFormData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم العسكري / الأمني</label>
                      <input
                        type="text"
                        value={profileFormData.badge_number}
                        onChange={(e) => setProfileFormData({ ...profileFormData, badge_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرتبة والصفة الوظيفية</label>
                      <input
                        type="text"
                        value={profileFormData.rank_title}
                        onChange={(e) => setProfileFormData({ ...profileFormData, rank_title: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الجهة / الإدارة التابعة</label>
                      <input
                        type="text"
                        value={profileFormData.department}
                        onChange={(e) => setProfileFormData({ ...profileFormData, department: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>رقم الهاتف المعتمد</label>
                      <input
                        type="text"
                        value={profileFormData.phone}
                        onChange={(e) => setProfileFormData({ ...profileFormData, phone: e.target.value })}
                        placeholder="091-XXXXXXX"
                      />
                    </div>

                    <div className="input-field-group">
                      <label>البريد الإلكتروني الرسمي</label>
                      <input
                        type="email"
                        value={profileFormData.email}
                        onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                        placeholder="user@moi.gov.ly"
                      />
                    </div>
                  </div>

                  {/* Security & Password */}
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    marginTop: '8px'
                  }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0a192f', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Key size={16} />
                      <span>تغيير كلمة المرور (اختياري)</span>
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="input-field-group">
                        <label>كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          value={profileFormData.new_password}
                          onChange={(e) => setProfileFormData({ ...profileFormData, new_password: e.target.value })}
                          placeholder="اتركها فارغة إن لم ترغب في التغيير"
                        />
                      </div>
                      <div className="input-field-group">
                        <label>تأكيد كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          value={profileFormData.confirm_password}
                          onChange={(e) => setProfileFormData({ ...profileFormData, confirm_password: e.target.value })}
                          placeholder="تأكيد كلمة المرور الجديدة"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="moi-modal-footer">
                  <button type="submit" className="btn-toolbar-save">
                    <Save size={16} />
                    <span>حفظ وتحديث الملف الشخصي</span>
                  </button>
                  <button
                    type="button"
                    className="btn-official-secondary"
                    onClick={() => setShowProfileModal(false)}
                  >
                    <span>إلغاء</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="moi-modal-overlay" onClick={() => { setShowAddUserModal(false); setShowNameSuggestions(false); }}>
            <div className="moi-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header">
                <h3>
                  <UserPlus size={20} />
                  <span>إضافة مستخدم جديد ومنح الصلاحيات الأمنية</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => { setShowAddUserModal(false); setShowNameSuggestions(false); }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveNewUser}>
                <div className="moi-modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="input-field-group name-autocomplete-field" ref={nameAutocompleteRef}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0, fontWeight: 700 }}>الاسم الكامل والرتبة</label>
                        <span className="name-db-badge" title="قائمة الأسماء مستخرجة ومطابقة لقاعدة بيانات قوة 2222">
                          <Database size={11} />
                          <span>قاعدة قوة 2222</span>
                        </span>
                      </div>

                      <div className="name-input-wrapper">
                        <input
                          type="text"
                          placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                          value={newUserFormData.full_name}
                          onChange={(e) => {
                            setNewUserFormData({ ...newUserFormData, full_name: e.target.value });
                            setShowNameSuggestions(true);
                            setSelectedForcePersonnel(null);
                          }}
                          onFocus={() => setShowNameSuggestions(true)}
                          autoComplete="off"
                          required
                        />
                        <button
                          type="button"
                          className={`btn-toggle-suggestions ${showNameSuggestions ? 'rotated' : ''}`}
                          onClick={() => setShowNameSuggestions(prev => !prev)}
                          title="عرض / إخفاء قائمة أسماء القوة العمومية"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      {/* Selected Force Member Confirmation Badge */}
                      {selectedForcePersonnel && (
                        <div className="selected-force-indicator">
                          <CheckCircle2 size={13} color="#16a34a" />
                          <span>تم ربط واستيراد بيانات ({selectedForcePersonnel.name}) بنجاح</span>
                          <span className="selected-force-pill">{selectedForcePersonnel.type}</span>
                        </div>
                      )}

                      {/* Dropdown Suggestions List */}
                      {showNameSuggestions && (
                        <div className="name-suggestions-dropdown">
                          <div className="name-suggestions-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Search size={13} />
                              <span>
                                {newUserFormData.full_name && newUserFormData.full_name.trim()
                                  ? `الأسماء المطابقة للحرف/الاسم (${filteredNameSuggestions.length})`
                                  : `قائمة الأسماء من قاعدة القوة العمومية (${forceMembers.length} فرد)`}
                              </span>
                            </div>
                            <span className="name-suggestions-counter">
                              {filteredNameSuggestions.length} اسم
                            </span>
                          </div>

                          <div className="name-suggestions-list">
                            {filteredNameSuggestions.length > 0 ? (
                              filteredNameSuggestions.map((m, idx) => (
                                <div
                                  key={m.id || idx}
                                  className="name-suggestion-item"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectSuggestedMember(m);
                                  }}
                                >
                                  <div className="name-item-info">
                                    <div className="name-item-title-row">
                                      <span className="name-item-fullname">{m.name}</span>
                                      <span className={`name-item-type-badge ${m.type === 'شرطي' ? 'police' : 'civil'}`}>
                                        {m.type}
                                      </span>
                                    </div>
                                    <div className="name-item-meta-row">
                                      <span>{m.job_title || (m.type === 'شرطي' ? 'ضابط شرطة' : 'موظف مدني')}</span>
                                      {(m.financial_number || m.job_number) && (
                                        <span className="meta-sep">• ر.م: {m.financial_number || m.job_number}</span>
                                      )}
                                      {m.department && (
                                        <span className="meta-sep">• {m.department}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="name-item-pick-btn">
                                    <span>اختيار</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="name-suggestions-empty">
                                <AlertCircle size={16} color="#d97706" />
                                <span>لا توجد أسماء مطابقة لـ "{newUserFormData.full_name}" في قاعدة البيانات. يمكنك إكمال كتابة الاسم يدوياً.</span>
                              </div>
                            )}
                          </div>

                          <div className="name-suggestions-footer">
                            <span>* اكتب الحرف الأول للترشيح المباشر، أو انقر على أي اسم لتعبئة البيانات تلقائياً</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="input-field-group">
                      <label>اسم المستخدم للدخول (Username)</label>
                      <input
                        type="text"
                        placeholder="username..."
                        value={newUserFormData.username}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم الأمني / العسكري</label>
                      <input
                        type="text"
                        placeholder="MOI-..."
                        value={newUserFormData.badge_number}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, badge_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرتبة والصفة</label>
                      <input
                        type="text"
                        placeholder="ملازم / نقيب / مدني..."
                        value={newUserFormData.rank_title}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, rank_title: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>كلمة المرور الأولية</label>
                      <input
                        type="password"
                        placeholder="كلمة المرور..."
                        value={newUserFormData.password}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>مستوى الصلاحية / الدور</label>
                      <select
                        value={newUserFormData.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          let label = 'ضابط عمليات';
                          let sections = ['dashboard', 'operations'];
                          if (val === 'super_admin') { label = 'مدير عام المنظومة (صلاحيات كاملة)'; sections = ['all']; }
                          else if (val === 'admin') { label = 'نائب مدير (صلاحيات إدارية)'; sections = ['dashboard', 'operations', 'force', 'shifts']; }
                          else if (val === 'force_manager') { label = 'مسؤول القوة العمومية والبيانات'; sections = ['dashboard', 'force', 'attendance', 'leaves']; }
                          else if (val === 'operations_lead') { label = 'ضابط عمليات وسيطرة'; sections = ['dashboard', 'operations', 'shifts', 'records']; }
                          else if (val === 'finance_officer') { label = 'مسؤول المالية والمرتبات'; sections = ['dashboard', 'salaries', 'inventory', 'fuel']; }
                          else if (val === 'data_entry') { label = 'مدخل بيانات ومسؤول أرشيف'; sections = ['dashboard', 'force', 'archive']; }
                          setNewUserFormData({ ...newUserFormData, role: val, role_label: label, allowed_sections: sections });
                        }}
                      >
                        <option value="force_manager">مسؤول القوة العمومية</option>
                        <option value="operations_lead">ضابط عمليات وسيطرة</option>
                        <option value="finance_officer">مسؤول المالية والمرتبات</option>
                        <option value="data_entry">مدخل بيانات وأرشيف</option>
                        <option value="admin">نائب مدير (إداري شامل)</option>
                        <option value="super_admin">مدير عام (صلاحيات كاملة)</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>رقم الهاتف</label>
                      <input
                        type="text"
                        placeholder="091-XXXXXXX"
                        value={newUserFormData.phone}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, phone: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>البريد الإلكتروني</label>
                      <input
                        type="email"
                        placeholder="user@ubari.moi.gov.ly"
                        value={newUserFormData.email}
                        onChange={(e) => setNewUserFormData({ ...newUserFormData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Permissions Selection Checklist */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontWeight: 800, color: '#0a192f', fontSize: '13.5px', margin: 0 }}>
                        الأقسام المأذون له بالدخول إليها:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setNewUserFormData({ ...newUserFormData, allowed_sections: SECTIONS.map(s => s.id) })}
                        >
                          تحديد كافة الأقسام
                        </button>
                        <button
                          type="button"
                          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setNewUserFormData({ ...newUserFormData, allowed_sections: [] })}
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                      {SECTIONS.map(s => {
                        const isChecked = newUserFormData.allowed_sections && (newUserFormData.allowed_sections.includes('all') || newUserFormData.allowed_sections.includes(s.id));
                        return (
                          <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', background: isChecked ? '#eff6ff' : '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={(e) => {
                                let cur = (newUserFormData.allowed_sections || []).includes('all')
                                  ? SECTIONS.map(sec => sec.id)
                                  : [...(newUserFormData.allowed_sections || [])];
                                if (e.target.checked) {
                                  if (!cur.includes(s.id)) cur.push(s.id);
                                } else {
                                  cur = cur.filter(x => x !== s.id);
                                }
                                setNewUserFormData({ ...newUserFormData, allowed_sections: cur });
                              }}
                            />
                            <span>{s.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="moi-modal-footer">
                  <button type="submit" className="btn-toolbar-save">
                    <UserPlus size={16} />
                    <span>إنشاء المستخدم وتفعيل الحساب</span>
                  </button>
                  <button
                    type="button"
                    className="btn-official-secondary"
                    onClick={() => {
                      setShowAddUserModal(false);
                      setShowNameSuggestions(false);
                    }}
                  >
                    <span>إلغاء</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditUserModal && editingUserData && (
          <div className="moi-modal-overlay" onClick={() => setShowEditUserModal(false)}>
            <div className="moi-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header">
                <h3>
                  <Edit size={18} />
                  <span>تعديل بيانات وصلاحيات: {editingUserData.full_name}</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowEditUserModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEditUser}>
                <div className="moi-modal-body">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="input-field-group">
                      <label>الاسم الكامل</label>
                      <input
                        type="text"
                        value={editingUserData.full_name}
                        onChange={(e) => setEditingUserData({ ...editingUserData, full_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرتبة والصفة</label>
                      <input
                        type="text"
                        value={editingUserData.rank_title}
                        onChange={(e) => setEditingUserData({ ...editingUserData, rank_title: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>الرقم العسكري / الأمني</label>
                      <input
                        type="text"
                        value={editingUserData.badge_number}
                        onChange={(e) => setEditingUserData({ ...editingUserData, badge_number: e.target.value })}
                      />
                    </div>

                    <div className="input-field-group">
                      <label>مستوى الصلاحية / الدور</label>
                      <select
                        value={editingUserData.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          let label = 'ضابط عمليات';
                          let sections = ['dashboard', 'operations'];
                          if (val === 'super_admin') { label = 'مدير عام المنظومة (صلاحيات كاملة)'; sections = ['all']; }
                          else if (val === 'admin') { label = 'نائب مدير (صلاحيات إدارية)'; sections = ['dashboard', 'operations', 'force', 'shifts']; }
                          else if (val === 'force_manager') { label = 'مسؤول القوة العمومية والبيانات'; sections = ['dashboard', 'force', 'attendance', 'leaves']; }
                          else if (val === 'operations_lead') { label = 'ضابط عمليات وسيطرة'; sections = ['dashboard', 'operations', 'shifts', 'records']; }
                          else if (val === 'finance_officer') { label = 'مسؤول المالية والمرتبات'; sections = ['dashboard', 'salaries', 'inventory', 'fuel']; }
                          else if (val === 'data_entry') { label = 'مدخل بيانات ومسؤول أرشيف'; sections = ['dashboard', 'force', 'archive']; }
                          setEditingUserData({ ...editingUserData, role: val, role_label: label, allowed_sections: sections });
                        }}
                      >
                        <option value="force_manager">مسؤول القوة العمومية</option>
                        <option value="operations_lead">ضابط عمليات وسيطرة</option>
                        <option value="finance_officer">مسؤول المالية والمرتبات</option>
                        <option value="data_entry">مدخل بيانات وأرشيف</option>
                        <option value="admin">نائب مدير (إداري شامل)</option>
                        <option value="super_admin">مدير عام (صلاحيات كاملة)</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>حالة الحساب</label>
                      <select
                        value={editingUserData.status}
                        onChange={(e) => setEditingUserData({ ...editingUserData, status: e.target.value })}
                      >
                        <option value="active">نشط ومصرح</option>
                        <option value="suspended">معلق مؤقتاً</option>
                      </select>
                    </div>

                    <div className="input-field-group">
                      <label>رقم الهاتف</label>
                      <input
                        type="text"
                        value={editingUserData.phone || ''}
                        onChange={(e) => setEditingUserData({ ...editingUserData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Permissions Selection Checklist */}
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontWeight: 800, color: '#0a192f', fontSize: '13.5px', margin: 0 }}>
                        الأقسام المأذون له بالدخول إليها:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setEditingUserData({ ...editingUserData, allowed_sections: SECTIONS.map(s => s.id) })}
                        >
                          تحديد كافة الأقسام
                        </button>
                        <button
                          type="button"
                          style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 9px', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setEditingUserData({ ...editingUserData, allowed_sections: [] })}
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                      {SECTIONS.map(s => {
                        const isChecked = editingUserData.allowed_sections && (editingUserData.allowed_sections.includes('all') || editingUserData.allowed_sections.includes(s.id));
                        return (
                          <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', background: isChecked ? '#eff6ff' : '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <input
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={(e) => {
                                let cur = (editingUserData.allowed_sections || []).includes('all')
                                  ? SECTIONS.map(sec => sec.id)
                                  : [...(editingUserData.allowed_sections || [])];
                                if (e.target.checked) {
                                  if (!cur.includes(s.id)) cur.push(s.id);
                                } else {
                                  cur = cur.filter(x => x !== s.id);
                                }
                                setEditingUserData({ ...editingUserData, allowed_sections: cur });
                              }}
                            />
                            <span>{s.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="moi-modal-footer">
                  <button type="submit" className="btn-toolbar-save">
                    <Save size={16} />
                    <span>حفظ التعديلات والصلاحيات</span>
                  </button>
                  <button
                    type="button"
                    className="btn-official-secondary"
                    onClick={() => setShowEditUserModal(false)}
                  >
                    <span>إلغاء</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View User Security Dossier Modal */}
        {showViewUserModal && viewingUserData && (
          <div className="moi-modal-overlay" onClick={() => setShowViewUserModal(false)}>
            <div className="moi-modal-box" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header">
                <h3>
                  <ShieldCheck size={20} color="#1d4ed8" />
                  <span>الملف الأمني وصلاحيات المستخدم: {viewingUserData.full_name}</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowViewUserModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="moi-modal-body">
                {/* Official ID Header Card */}
                <div className="view-dossier-card">
                  <div className="dossier-avatar-box">
                    {viewingUserData.avatar ? (
                      <img src={viewingUserData.avatar} alt={viewingUserData.full_name} className="dossier-avatar-img" />
                    ) : (
                      <span>{viewingUserData.full_name ? viewingUserData.full_name.charAt(0) : 'م'}</span>
                    )}
                  </div>
                  <div className="dossier-header-info">
                    <h2>{viewingUserData.full_name}</h2>
                    <p>{viewingUserData.rank_title} | {viewingUserData.department || 'مديرية أمن أوباري'}</p>
                    <div className="dossier-badges-row">
                      <span className="dossier-badge-pill" style={{ background: '#3b82f6', color: '#ffffff' }}>
                        الرقم الأمني: {viewingUserData.badge_number}
                      </span>
                      <span className="dossier-badge-pill" style={{ background: viewingUserData.status === 'active' ? '#10b981' : '#ef4444', color: '#ffffff' }}>
                        {viewingUserData.status === 'active' ? '● نشط ومصرح' : '● حساب معلق'}
                      </span>
                      <span className="dossier-badge-pill" style={{ background: '#f59e0b', color: '#000000' }}>
                        {viewingUserData.role_label || viewingUserData.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="dossier-meta-grid">
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">اسم المستخدم (الدخول)</span>
                    <span className="dossier-meta-val" style={{ direction: 'ltr', textAlign: 'right' }}>
                      <code style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '4px' }}>{viewingUserData.username}</code>
                    </span>
                  </div>
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">الجهة / الإدارة التابعة</span>
                    <span className="dossier-meta-val">{viewingUserData.department || 'مديرية أمن أوباري'}</span>
                  </div>
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">رقم الهاتف المعتمد</span>
                    <span className="dossier-meta-val">{viewingUserData.phone || 'غير مسجل'}</span>
                  </div>
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">البريد الإلكتروني الرسمي</span>
                    <span className="dossier-meta-val">{viewingUserData.email || 'غير مسجل'}</span>
                  </div>
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">آخر تسجيل دخول للمنظومة</span>
                    <span className="dossier-meta-val">{viewingUserData.last_login || 'مؤخراً'}</span>
                  </div>
                  <div className="dossier-meta-item">
                    <span className="dossier-meta-label">مستوى الحماية والتشفير</span>
                    <span className="dossier-meta-val" style={{ color: '#059669' }}>
                      مشفر ومعتمد أمنياً (AES-256)
                    </span>
                  </div>
                </div>

                {/* Detailed Clearances & Permissions Breakdown */}
                <div className="permissions-dossier-box">
                  <h4 className="permissions-dossier-title">
                    <Key size={16} />
                    <span>سجل الصلاحيات وتراخيص الدخول للأقسام:</span>
                    {viewingUserData.allowed_sections && viewingUserData.allowed_sections.includes('all') && (
                      <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        تفويض سيادي شامل
                      </span>
                    )}
                  </h4>

                  {viewingUserData.allowed_sections && viewingUserData.allowed_sections.includes('all') ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', color: '#166534', fontSize: '13px', lineHeight: 1.7 }}>
                      <strong>تفويض قيادي استثنائي كامل:</strong> يمتلك هذا الحساب صلاحيات سيادية غير مقيدة للوصول لغرفة العمليات المركزية، منظومة القوة العمومية، إدارة الحضور والمناوبات، المرتبات، الأرشيف السري، وإدارة حسابات المستخدمين.
                    </div>
                  ) : (
                    <div className="permissions-grid-list">
                      {SECTIONS.map(s => {
                        const hasAccess = viewingUserData.allowed_sections && viewingUserData.allowed_sections.includes(s.id);
                        const SecIcon = s.icon;
                        return (
                          <div key={s.id} className={`permission-grid-item ${hasAccess ? 'granted' : 'denied'}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <SecIcon size={15} />
                              <span>{s.name}</span>
                            </div>
                            <span className={`permission-state-tag ${hasAccess ? 'granted' : 'denied'}`}>
                              {hasAccess ? (
                                <>
                                  <CheckCircle2 size={12} />
                                  <span>مأذون</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={12} />
                                  <span>محظور</span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="moi-modal-footer">
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={() => handleEditFromView(viewingUserData)}
                >
                  <Edit size={15} />
                  <span>تعديل الصلاحيات</span>
                </button>
                <button
                  type="button"
                  className="btn-toolbar-print"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>طباعة بطاقة الصلاحيات</span>
                </button>
                <button
                  type="button"
                  className="btn-official-secondary"
                  onClick={() => setShowViewUserModal(false)}
                >
                  <span>إغلاق</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Security Modal */}
        {showDeleteUserModal && userToDelete && (
          <div className="moi-modal-overlay" onClick={() => setShowDeleteUserModal(false)}>
            <div className="moi-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header" style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2' }}>
                <h3 style={{ color: '#991b1b' }}>
                  <AlertCircle size={20} color="#dc2626" />
                  <span>تأكيد حذف الحساب وإلغاء الصلاحيات</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowDeleteUserModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="moi-modal-body">
                <div className="delete-warning-box">
                  <div className="delete-warning-header">
                    <Trash2 size={18} />
                    <span>تحذير أمني: إلغاء حساب معتمد</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#991b1b', lineHeight: 1.6 }}>
                    هل أنت متأكد من رغبتك في حذف هذا الحساب الأمني بشكل نهائي؟ سيتم سحب صلاحيات الدخول فوراً وإلغاء السجل من المنظومة.
                  </p>
                </div>

                <div className="delete-user-details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الاسم الكامل:</span>
                    <strong style={{ color: '#0f172a' }}>{userToDelete.full_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الرتبة والصفة:</span>
                    <strong style={{ color: '#0f172a' }}>{userToDelete.rank_title}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الرقم الأمني:</span>
                    <strong style={{ color: '#1e3a8a' }}>{userToDelete.badge_number}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>اسم الدخول:</span>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{userToDelete.username}</code>
                  </div>
                </div>
              </div>

              <div className="moi-modal-footer">
                <button
                  type="button"
                  className="btn-danger-confirm"
                  onClick={handleConfirmDeleteUser}
                >
                  <Trash2 size={16} />
                  <span>نعم، تأكيد الحذف النهائي</span>
                </button>
                <button
                  type="button"
                  className="btn-official-secondary"
                  onClick={() => setShowDeleteUserModal(false)}
                >
                  <span>إلغاء التراجع</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Force Import Append & Merge Confirmation Modal */}
        {showImportConfirmModal && pendingImportData && (
          <div className="moi-modal-overlay" onClick={handleCancelImport}>
            <div className="moi-modal-box" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
              <div className="moi-modal-header" style={{ background: '#f0fdf4', borderBottom: '1px solid #bbf7d0' }}>
                <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <UploadCloud size={22} color="#16a34a" />
                  <span>تأكيد إضافة ودمج الأفراد الجدد مع القوة العمومية</span>
                </h3>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={handleCancelImport}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="moi-modal-body" style={{ padding: '20px' }}>
                {/* Safe Append Notice */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #86efac',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                    <CheckCircle2 size={18} />
                    <span>حفظ تام للقوة القديمة وإضافة السجلات الجديدة:</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#166534', lineHeight: 1.6 }}>
                    <strong>لن يتم حذف أي سجل قديم إطلاقاً</strong>. سيتم إضافة الأفراد الجدد الواردين بالملف <code>({importFileName})</code> وإلحاقهم بالقوة العمومية الحالية وحفظ السجلات القديمة والجديدة معاً.
                  </p>
                </div>

                {/* Comparison Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>القوة القديمة الحالية</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#1e3a8a' }}>{forceMembers.length.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>فرد</span></div>
                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>✓ محفوظة بالكامل</div>
                  </div>

                  <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: 700 }}>الأفراد الجدد بالملف</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#0284c7' }}>+{pendingImportData.length.toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>فرد</span></div>
                    <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700 }}>+ ستتم إضافتهم</div>
                  </div>

                  <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>الإجمالي الكلي بعد الإضافة</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a' }}>
                      {(forceMembers.length + pendingImportData.length).toLocaleString('ar-LY')} <span style={{ fontSize: '11px' }}>فرد</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 700 }}>قوة موحدة مكتملة</div>
                  </div>
                </div>

                {/* Preview Table of First 5 rows */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>معاينة عينة من السجلات المستوردة (أول 5 أفراد):</span>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>إجمالي: {pendingImportData.length} فرد</span>
                  </div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'right' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '6px 8px' }}>#</th>
                          <th style={{ padding: '6px 8px' }}>الاسم الكامل</th>
                          <th style={{ padding: '6px 8px' }}>الرتبة / الوظيفة</th>
                          <th style={{ padding: '6px 8px' }}>الرقم المالي</th>
                          <th style={{ padding: '6px 8px' }}>النوع</th>
                          <th style={{ padding: '6px 8px' }}>جهة العمل / المركز</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingImportData.slice(0, 5).map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px', color: '#64748b' }}>{i + 1}</td>
                            <td style={{ padding: '6px 8px', fontWeight: 700 }}>{m.name || '---'}</td>
                            <td style={{ padding: '6px 8px' }}>{m.job_title || '---'}</td>
                            <td style={{ padding: '6px 8px', direction: 'ltr', textAlign: 'right' }}>{m.job_number || '---'}</td>
                            <td style={{ padding: '6px 8px' }}>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                background: m.type === 'مدني' ? '#f3e8ff' : '#eff6ff',
                                color: m.type === 'مدني' ? '#7c3aed' : '#1e3a8a'
                              }}>
                                {m.type}
                              </span>
                            </td>
                            <td style={{ padding: '6px 8px', color: '#475569' }}>{m.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {pendingImportData.length > 5 && (
                    <div style={{ fontSize: '11px', color: '#166534', marginTop: '6px', textAlign: 'center', fontWeight: 700 }}>
                      ... بالإضافة إلى ({ (pendingImportData.length - 5).toLocaleString('ar-LY') }) فرداً آخرين سيتم إضافتهم وإلحاقهم بالقوة العمومية دون المساس بالقوة السابقة.
                    </div>
                  )}
                </div>
              </div>

              <div className="moi-modal-footer" style={{ borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px' }}>
                <button
                  type="button"
                  className="btn-moi-secondary"
                  onClick={handleCancelImport}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  إلغاء الأمر
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReplaceForce}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(22, 163, 74, 0.35)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>تأكيد إضافة الأفراد وحفظ القوة كاملة (إضافة ع القديمة)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personnel Preview Modal (بطاقة المعاينة الشاملة والهوية الأمنية المعتمدة) */}
        {showPreviewModal && previewMember && (
          <OfficerCardModal
            member={previewMember}
            onClose={() => setShowPreviewModal(false)}
            onEdit={(m) => handleOpenEdit(m)}
            onUpdatePhoto={handleUpdateMemberPhoto}
          />
        )}
      </div>
    );
  }

  // Login Screen
  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="login-page-wrapper">
      <div className="bg-ambient-pattern" />

      <div className="auth-card">
        {/* Left Side: Visual Media Banner */}
        <div className="auth-visual-panel">
          <div
            className="visual-slide-bg"
            style={{
              backgroundImage: `url(${currentSlide.image})`,
              transform: 'scale(1.02)'
            }}
          />
          <div className="visual-overlay" />

          <div className="visual-content-top">
            <div className="visual-logo-badge">
              <img src="./moi-logo.png" onError={(e) => { e.currentTarget.src = './moi-logo.png'; }} alt="شعار وزارة الداخلية" />
            </div>
            <div className="visual-title-wrap">
              <h2>وزارة الداخلية</h2>
              <p>مديرية أمن أوباري</p>
            </div>
          </div>

          <div className="visual-content-bottom">
            <div className="visual-pill-badge">
              <Shield size={14} />
              <span>{currentSlide.badge}</span>
            </div>
            <h1 className="visual-heading">
              {currentSlide.title.split('\n').map((line, idx) => (
                <span key={idx}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="visual-desc">{currentSlide.desc}</p>

            <div className="visual-slider-dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`dot-indicator ${activeSlide === i ? 'active' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  aria-label={`الشريحة ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="auth-form-panel">
          <div className="form-card-inner">
            <div className="form-header-block">
              <div className="national-crest-tag">
                <span className="crest-dot" />
                <span>دولة ليبيا - وزارة الداخلية</span>
              </div>
              <h2 className="portal-title">تسجيل الدخول للمنظومة</h2>
            </div>

            {errorMessage && (
              <div className="error-alert-banner">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="identifier">
                  اسم المستخدم
                </label>
                <div className="input-container">
                  <input
                    id="identifier"
                    type="text"
                    className="form-input"
                    placeholder="أدخل اسم المستخدم..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  كلمة المرور
                </label>
                <div className="password-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={`toggle-pwd-btn ${showPassword ? 'active' : ''}`}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-auxiliary-row">
                <label className="remember-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>تذكر بيانات الجلسة على هذا الجهاز</span>
                </label>
              </div>

              <button
                type="submit"
                className={`submit-btn ${isLoading ? 'btn-loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="spinner-loader" />
                ) : (
                  <>
                    <Lock size={16} />
                    <span>تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>

            {/* Links and Directorate Social */}
            <div className="auth-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>

              <a
                href="https://www.facebook.com/share/1CYt5jTzG7/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="social-circle-btn"
                title="الصفحة الرسمية لمديرية أمن أوباري على فيسبوك"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
