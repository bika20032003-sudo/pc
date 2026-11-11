import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  FileText,
  Printer,
  Search,
  User,
  Users,
  Building2,
  Calendar,
  Send,
  Eye,
  Trash2,
  Check,
  ChevronDown,
  X,
  Plus,
  Edit,
  Shield,
  Download,
  Share2,
  RefreshCw,
  Sparkles,
  FileCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignLeft,
  AlignJustify,
  Save,
  Columns,
  Layers,
  Type,
  Stamp,
  Copy
} from 'lucide-react';
import ForceNameAutocomplete from './ForceNameAutocomplete';
import { printDocumentInIframe } from '../utils/printHelper';

// Sample pre-seeded employees matching reference image 4 + directorate officers
const SAMPLE_EMPLOYEES = [
  {
    id: 'emp-1',
    name: 'عبدالرحمن المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163450',
    national_id: '119940251120',
    department: 'الشؤون الإدارية والمالية',
    hire_date: '2016-04-12',
    salary: '1,850'
  },
  {
    id: 'emp-2',
    name: 'مريم المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163451',
    national_id: '219960251121',
    department: 'قسم السجلات والمحفوظات',
    hire_date: '2018-09-01',
    salary: '1,720'
  },
  {
    id: 'emp-3',
    name: 'أبوبكر المهدي إبراهيم يونس',
    role: 'موظف',
    job_number: '8163452',
    national_id: '119920251122',
    department: 'إدارة شؤون المرور والتراخيص',
    hire_date: '2014-02-15',
    salary: '1,950'
  },
  {
    id: 'emp-4',
    name: 'عبدالصمد موسى محمد الشيخ الانصارى',
    role: 'ضابط شرطة',
    job_number: '8163155',
    national_id: '119900342512',
    department: 'قسم العمليات والسيطرة',
    hire_date: '2012-06-20',
    salary: '2,400'
  },
  {
    id: 'emp-5',
    name: 'محمد إبراهيم عثمان التيندي',
    role: 'شرطي',
    job_number: '8163210',
    national_id: '119950456123',
    department: 'مركز شرطة أوباري المدينة',
    hire_date: '2017-08-10',
    salary: '1,650'
  }
];

// All 11 Template Types exactly matching Image 3 dropdown
export const TEMPLATE_TYPES = [
  { id: 'whomitmayconcern', name: 'إفادة لمن يهمه الأمر', icon: '📄', subject: 'إفادة لمن يهمه الأمر بخصوص العمل بالمديرية' },
  { id: 'work_resumption', name: 'إفادة مباشرة عمل', icon: '💼', subject: 'إفادة مباشرة عمل رسمي' },
  { id: 'work_continuation', name: 'إفادة استمرار بالعمل', icon: '⏱️', subject: 'إفادة استمرار بالعمل على رأس العمل' },
  { id: 'experience_cert', name: 'شهادة خبرة', icon: '🎖️', subject: 'شهادة خبرة وكفاءة وظيفية' },
  { id: 'clearance', name: 'إخلاء طرف', icon: '✅', subject: 'شهادة إخلاء طرف من العهد والمسؤوليات' },
  { id: 'internal_assignment', name: 'قرار تكليف داخلي', icon: '📜', subject: 'قرار تكليف ومهام عمل داخلية' },
  { id: 'secondment', name: 'قرار ندب', icon: '🔄', subject: 'قرار ندب لصالح جهة رسمية' },
  { id: 'referral_letter', name: 'رسالة إحالة', icon: '📤', subject: 'إحالة ملف ومستندات وظيفية' },
  { id: 'salary_cert', name: 'شهادة راتب', icon: '💳', subject: 'شهادة بيان مفردات مرتب شهري' },
  { id: 'clinic_referral', name: 'نموذج عيادة (إحالة طبية)', icon: '🏥', subject: 'إحالة للكشف الطبي والعلاج بالعيادة' },
  { id: 'free_letter', name: 'مراسلة حرة (مستند فارغ ومحرر نصوص)', icon: '📝', subject: 'مراسلة رسمية صادرة' }
];

// Normalize Arabic text for accurate search matching
const normalizeArabicText = (text) => {
  if (!text) return '';
  return String(text)
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[إأآاٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .toLowerCase();
};

export default function TemplatesSection({ user, forceMembers = [] }) {
  // 1. Form Inputs State (Matching Photo 1, 2, 3, 4)
  const [employeeSearch, setEmployeeSearch] = useState('عبدالرحمن المهدي إبراهيم يونس');
  const [selectedEmployee, setSelectedEmployee] = useState(SAMPLE_EMPLOYEES[0]);
  const [selectedTemplateType, setSelectedTemplateType] = useState('free_letter'); // 'مراسلة حرة (مستند فارغ ومحرر نصوص)'
  const [referenceNumber, setReferenceNumber] = useState('14'); // Value shown in image 1 or 15/2026 in image 2
  
  // Autocomplete UI dropdown state (Photo 4)
  const [showEmployeeSuggestions, setShowEmployeeSuggestions] = useState(false);
  const employeeInputRef = useRef(null);
  const suggestionsBoxRef = useRef(null);

  // 2. Active Generated Document State for Preview & Print
  const [activeDocument, setActiveDocument] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);
  const [isEditingBody, setIsEditingBody] = useState(true);
  const [editorViewMode, setEditorViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [activeEditorTab, setActiveEditorTab] = useState('body'); // 'body' | 'meta' | 'signature_cc'
  const [newCcEntity, setNewCcEntity] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // 3. Saved Templates History Archive
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const saved = localStorage.getItem('ubari_generated_templates');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 1,
        code_no: '2026-T01',
        record_number: '14',
        reference: '14/2026',
        template_type_id: 'free_letter',
        template_name: 'مراسلة حرة (مستند فارغ ومحرر نصوص)',
        employee_name: 'عبدالرحمن المهدي إبراهيم يونس',
        employee_role: 'موظف',
        employee_job_no: '8163450',
        date: new Date().toLocaleDateString('ar-LY'),
        subject: 'مراسلة حرة بخصوص متابعة الأعمال الإدارية المنوطة بالقسم',
        recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
        body_text: 'نحيل إليكم هذا الكتاب للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة العامة المنظمة لمديرية أمن أوباري.',
        signer_name: 'لواء / موسى سعد محمد',
        signer_title: 'مدير مديرية أمن أوباري',
        editor: 'عبدالصمد',
        printer: 'عبدالصمد',
        created_at: new Date().toISOString()
      }
    ];
  });

  const [archiveSearch, setArchiveSearch] = useState('');

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        employeeInputRef.current &&
        !employeeInputRef.current.contains(e.target) &&
        suggestionsBoxRef.current &&
        !suggestionsBoxRef.current.contains(e.target)
      ) {
        setShowEmployeeSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered employees for autocomplete suggestions (Combining SAMPLE_EMPLOYEES and forceMembers)
  const employeeSuggestions = useMemo(() => {
    const term = normalizeArabicText(employeeSearch);
    if (!term) return SAMPLE_EMPLOYEES;

    const fromSample = SAMPLE_EMPLOYEES.filter(emp =>
      normalizeArabicText(emp.name).includes(term) ||
      (emp.job_number && emp.job_number.includes(term))
    );

    const fromForce = forceMembers
      .filter(m => m.name && normalizeArabicText(m.name).includes(term))
      .slice(0, 15)
      .map(m => ({
        id: `force-${m.id}`,
        name: m.name,
        role: m.type === 'شرطي' ? 'شرطي' : 'موظف مدني',
        job_number: m.job_number || m.financial_number || '-',
        national_id: m.national_id || '-',
        department: m.job_title || 'مديرية أمن أوباري',
        hire_date: m.birth_date || '2020-01-01',
        salary: '1,750'
      }));

    // Combine and deduplicate by name
    const combined = [...fromSample];
    fromForce.forEach(f => {
      if (!combined.some(c => c.name === f.name)) {
        combined.push(f);
      }
    });

    return combined.slice(0, 25);
  }, [employeeSearch, forceMembers]);

  // Generate body text according to template type and employee
  const generateTemplateContent = (typeId, emp, ref) => {
    const empName = emp?.name || employeeSearch || 'السيد الموظف';
    const jobNo = emp?.job_number || '8163450';
    const nationalId = emp?.national_id || '119940251120';
    const dept = emp?.department || 'مديرية أمن أوباري';
    const today = new Date().toLocaleDateString('ar-LY');

    switch (typeId) {
      case 'whomitmayconcern':
        return {
          subject: `إفادة لمن يهمه الأمر / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تفيد مديرية أمن أوباري بأن السيد / ${empName}، الرقم الوطني: (${nationalId})، والرقم المالي والوظيفي: (${jobNo})، يعمل لدينا بالمديرية بصفة (${emp?.role || 'موظف'}) لدى (${dept})، ولا يزال مستمراً في أداء مهامه الوظيفية والنظامية حتى تاريخ إصدار هذه الإفادة.\n\nوقد أُعطيت له هذه الإفادة بناءً على طلبه الشخصي لتقديمها إلى من يهمه الأمر دون أدنى مسؤولية على مديرية أمن أوباري تجاه حقوق الغير أو أي التزامات مالية.`
        };

      case 'work_resumption':
        return {
          subject: `إفادة مباشرة عمل رسمي / ${empName}`,
          recipient: 'إلى السيد / رئيس قسم الشؤون الإدارية والمالية',
          body: `تفيد مديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، المقيد بقسم (${dept})، قد باشر عمله اليومي والفعلي بالمديرية اعتباراً من تاريخ اليوم ${today}م، وذلك بعد انتهاء فترة الإجازة / التكليف الممنوحة له قانوناً، وهو الآن يمارس اختصاصاته الوظيفية كالمعتاد.`
        };

      case 'work_continuation':
        return {
          subject: `إفادة استمرار بالعمل على رأس العمل / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تشهد مديرية أمن أوباري بأن الموظف / ${empName}، حامل الرقم الوطني: (${nationalId}) والرقم المالي: (${jobNo})، هو أحد منتسبي المديرية التابعين لـ (${dept})، ولا يزال مستمراً في وظيفته الرسمية ومقيداً ضمن القوة العاملة على رأس العمل ولم ينقطع عن أداء واجباته الوظيفية.`
        };

      case 'experience_cert':
        return {
          subject: `شهادة خبرة وكفاءة مهنية / ${empName}`,
          recipient: 'إلى من يهمه الأمر المحترمين ،،،',
          body: `تشهد مديرية أمن أوباري بأن السيد / ${empName} قد عمل بالمديرية بصفة (${emp?.role || 'موظف رسمي'}) ومارس مهامه لدى (${dept}) بكل تفانٍ وإخلاص، وكان طيلة فترة عمله مثالاً للانضباط العالي والالتزام الأخلاقي وحسن السيرة والسلوك وتنفيذ التعليمات والأوامر الصادرة إليه بكفاءة واقتدار.`
        };

      case 'clearance':
        return {
          subject: `شهادة إخلاء طرف رسمية / ${empName}`,
          recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
          body: `تشهد مديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، قد أتم إجراءات إخلاء طرفه بالكامل من كافة العهد الإدارية والمالية والأسلحة والآليات المسلمة إليه لدى كافة أقسام ومخازن ومكاتب مديرية أمن أوباري، وليس في ذمته أي التزامات وظيفية أو عينية حتى تاريخ إصدار هذا المستند.`
        };

      case 'internal_assignment':
        return {
          subject: `قرار تكليف داخلي رقم (${ref || '15/2026'}) بشأن تكليف موظف`,
          recipient: 'إلى كافة الأقسام والمراكز والوحدات التابعة للمديرية',
          body: `بناءً على مقتضيات المصلحة الأمنية العامة وحسن سير العمل بمديرية أمن أوباري:\n\nمادة (1): يُكلف السيد / ${empName}، الرقم المالي (${jobNo})، بالعمل في (${dept}) اعتباراً من تاريخ صدور هذا القرار.\n\nمادة (2): على كافة الأقسام والإدارات ذات العلاقة وضع هذا القرار موضع التنفيذ والعمل بموجبه من تاريخ صدوره.`
        };

      case 'secondment':
        return {
          subject: `قرار ندب وظيفي رقم (${ref || '15/2026'})`,
          recipient: 'إلى السيد / وكيل وزارة الداخلية المحترم',
          body: `بناءً على مقتضيات المصلحة العامة، يُندب السيد / ${empName}، الرقم المالي: (${jobNo})، من عمله بمديرية أمن أوباري للعمل لدى الجهة الطالبة، على أن تسري بحقه كافة القوانين واللوائح المنظمة للندب الوظيفي بوزارة الداخلية.`
        };

      case 'referral_letter':
        return {
          subject: `إحالة مستندات ومعاملة رسمية تخص / ${empName}`,
          recipient: 'إلى السيد / مدير الإدارة العامة للتفتيش والمتابعة',
          body: `نحيل إليكم طيه ملف ومعاملة السيد / ${empName}، الرقم المالي: (${jobNo})، للتفضل بالاطلاع وإجراء ما يلزم من اختصاص وفق الضوابط والتعليمات المنظمة والمعمول بها لدينا.`
        };

      case 'salary_cert':
        return {
          subject: `شهادة بيان مرتب شهري تخص / ${empName}`,
          recipient: 'إلى إدارة المصرف المحترمين ،،،',
          body: `تشهد الشؤون المالية والمرتبات بمديرية أمن أوباري بأن السيد / ${empName}، الرقم المالي: (${jobNo})، يتقاضى مرتباً شهرياً إجمالياً قدره (${emp?.salary || '1,850'}) د.ل، وبعد خصم الاستقطاعات القانونية يبلغ صافي المرتب الشهري المحال إلى حسابه المصرفي مبلغاً وقدره (${parseInt(emp?.salary?.replace(/,/g, '') || 1850) - 150}) د.ل، وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى مصرفكم.`
        };

      case 'clinic_referral':
        return {
          subject: `إحالة طبية وعلاجية للكشف بالعيادة / ${empName}`,
          recipient: 'إلى السادة / إدارة الخدمات الطبية والعيادة المعتمدة المحترمين',
          body: `يرجى التفضل بقبول السيد / ${empName}، الرقم المالي: (${jobNo})، التابع لمديرية أمن أوباري، وتوقيع الكشف الطبي والفحوصات اللازمة عليه وموافاتنا بتقريركم الطبي حول حالته الصحية وما يتقرر له من علاج أو راحة طبية وفق الأصول الطبية المعتمدة.`
        };

      case 'free_letter':
      default:
        return {
          subject: 'مراسلة حرة بخصوص متابعة الإجراءات الإدارية والأمنية',
          recipient: 'إلى السيد / مدير إدارة الشؤون الإدارية والمالية',
          body: `نحيل إليكم هذا الكتاب بخصوص الموظف / ${empName} (الرقم المالي: ${jobNo}) للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة المنظمة لمديرية أمن أوباري.`
        };
    }
  };

  // Helper to get next unique dynamic code that increments with every new report
  const getNextReportCode = (list = savedTemplates) => {
    let maxNum = 0;
    if (Array.isArray(list)) {
      list.forEach(item => {
        if (item && item.code_no) {
          const match = String(item.code_no).match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      });
    }
    const savedCounter = parseInt(localStorage.getItem('ubari_report_code_counter') || '0', 10);
    const nextSeq = Math.max(maxNum, savedCounter) + 1;
    localStorage.setItem('ubari_report_code_counter', String(nextSeq));
    return `2026-T${String(nextSeq).padStart(2, '0')}`;
  };

  // Handler: "إنشاء وطباعة النموذج" button (Photo 1 & 2)
  const handleCreateTemplate = () => {
    if (!employeeSearch.trim()) {
      alert('يرجى إدخال أو اختيار اسم الموظف أولاً');
      return;
    }

    const tplInfo = TEMPLATE_TYPES.find(t => t.id === selectedTemplateType) || TEMPLATE_TYPES[0];
    const content = generateTemplateContent(selectedTemplateType, selectedEmployee, referenceNumber);
    const codeNo = getNextReportCode(savedTemplates);
    const dateFormatted = new Date().toLocaleDateString('ar-LY');

    const cleanRef = referenceNumber.trim();
    const recordNum = cleanRef || String(savedTemplates.length + 14);
    const refFormatted = cleanRef
      ? (cleanRef.includes('/') ? cleanRef : `${cleanRef}/2026`)
      : `${recordNum}/2026`;

    const newDoc = {
      id: Date.now(),
      code_no: codeNo,
      record_number: recordNum,
      reference: refFormatted,
      template_type_id: selectedTemplateType,
      template_name: tplInfo.name,
      employee_name: employeeSearch,
      employee_role: selectedEmployee?.role || 'موظف',
      employee_job_no: selectedEmployee?.job_number || '8163450',
      employee_national_id: selectedEmployee?.national_id || '119940251120',
      employee_dept: selectedEmployee?.department || 'الشؤون الإدارية والمالية',
      date: dateFormatted,

      // Header fields
      header_moi_ar: 'وزارة الداخليـــــــــــــــــــة',
      header_dir_ar: 'مديرية أمن أوبـــــــــــــــــاري',
      header_moi_en: 'Ministry of Interior',
      header_dir_en: 'Ubari Security Directorate',
      show_header_emblem: true,
      show_qr: true,

      // Subject & Pre-text
      subject: content.subject,
      reference_subline: 'إشارة إلى السجلات الرسمية وقواعد بيانات منتسبي مديرية أمن أوباري المنظمة للعمل',

      // Recipient & Greetings
      recipient: content.recipient,
      greeting_1: 'بعد التحيـــــة والســــلام ،،،',
      greeting_2: '',
      prayer_line: '',

      // Body text & Typography
      body_text: content.body,
      font_size: '16.5px',
      line_height: '2',
      text_align: 'right',
      font_weight: 'normal',

      // Signer & Stamp
      signer_name: 'لواء / موسى سعد محمد',
      signer_title: 'مدير مديرية أمن أوباري',
      show_stamp: false,
      stamp_text_1: 'وزارة الداخلية',
      stamp_text_2: 'مديرية أمن أوباري',
      stamp_text_3: '* مكتب المدير *',

      // CC List
      cc_list: [
        'السيد / وكيل وزارة الداخلية',
        'الملف الوظيفي والشخصي للمعني',
        'قسم الشؤون الإدارية والمالية',
        'قسم المحفوظات والسجلات بالمديرية',
        'الإدارة العامة للتفتيش والمتابعة',
        'وحدة المتابعة والتوثيق'
      ],

      // Footer
      editor: (user && user.full_name && user.full_name.includes('عبدالصمد')) ? 'عبدالصمد' : (user?.full_name || 'عبدالصمد'),
      printer: (user && user.full_name && user.full_name.includes('عبدالصمد')) ? 'عبدالصمد' : (user?.full_name || 'عبدالصمد'),
      phone: '0915938137',
      email: 'Info@ubari-security.ly',
      created_at: new Date().toISOString()
    };

    // Save to list
    const updatedList = [newDoc, ...savedTemplates];
    setSavedTemplates(updatedList);
    localStorage.setItem('ubari_generated_templates', JSON.stringify(updatedList));

    // Open active document modal in split view by default
    setActiveDocument(newDoc);
    setEditorViewMode('split');
    setShowDocModal(true);
    setNotificationMsg(`تم إنشاء نموذج «${tplInfo.name}» بنجاح وهو جاهز للمعاينة والتحرير`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Save current active document edits to localStorage archive
  const handleSaveDocEdits = () => {
    if (!activeDocument) return;
    const updatedList = savedTemplates.map(item =>
      item.id === activeDocument.id ? activeDocument : item
    );
    // If not in list yet, append
    if (!updatedList.some(item => item.id === activeDocument.id)) {
      updatedList.unshift(activeDocument);
    }
    setSavedTemplates(updatedList);
    localStorage.setItem('ubari_generated_templates', JSON.stringify(updatedList));
    setNotificationMsg('✅ تم حفظ كافة التعديلات في سجل الأرشيف بنجاح');
    setTimeout(() => setNotificationMsg(''), 4000);
  };

  // Helper: Add CC Item
  const handleAddCcItem = () => {
    if (!newCcEntity.trim() || !activeDocument) return;
    const currentList = Array.isArray(activeDocument.cc_list) ? activeDocument.cc_list : [];
    setActiveDocument({
      ...activeDocument,
      cc_list: [...currentList, newCcEntity.trim()]
    });
    setNewCcEntity('');
  };

  // Helper: Remove CC Item
  const handleRemoveCcItem = (index) => {
    if (!activeDocument) return;
    const currentList = Array.isArray(activeDocument.cc_list) ? activeDocument.cc_list : [];
    setActiveDocument({
      ...activeDocument,
      cc_list: currentList.filter((_, idx) => idx !== index)
    });
  };

  // Helper: Insert variable token into body
  const insertVariableIntoBody = (val) => {
    if (!activeDocument) return;
    const current = activeDocument.body_text || '';
    setActiveDocument({
      ...activeDocument,
      body_text: current ? `${current} ${val}` : val
    });
  };

  // Helper: Insert phrase into body
  const insertPhraseIntoBody = (phrase) => {
    if (!activeDocument) return;
    const current = activeDocument.body_text || '';
    setActiveDocument({
      ...activeDocument,
      body_text: current ? `${current}\n\n${phrase}` : phrase
    });
  };

  // Generate QR Code dynamically
  useEffect(() => {
    if (activeDocument) {
      const qrPayload = `دولة ليبيا - وزارة الداخلية\nمديرية أمن أوباري\nالنوع: ${activeDocument.template_name}\nالمعني: ${activeDocument.employee_name}\nالرقم الإشاري: ${activeDocument.reference}\nالكود: ${activeDocument.code_no}\nالتاريخ: ${activeDocument.date}\nتحقق: https://moi.gov.ly/verify?cert=${activeDocument.code_no}`;
      QRCode.toDataURL(qrPayload, {
        width: 140,
        margin: 1,
        color: { dark: '#0a192f', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('QR code error:', err));
    }
  }, [activeDocument]);

  // Direct Browser Print Trigger
  const handlePrintDocument = () => {
    const el = document.getElementById('official-template-to-print');
    if (el) {
      printDocumentInIframe(el.outerHTML, activeDocument?.template_name || 'وثيقة رسمية');
    } else {
      window.print();
    }
  };

  // Delete from archive
  const handleDeleteTemplate = (id, name) => {
    if (window.confirm(`هل أنت متأكد من حذف المستند الخاص بـ "${name}"؟`)) {
      const updated = savedTemplates.filter(t => t.id !== id);
      setSavedTemplates(updated);
      localStorage.setItem('ubari_generated_templates', JSON.stringify(updated));
      if (activeDocument && activeDocument.id === id) {
        setShowDocModal(false);
      }
    }
  };

  // Filtered archive list
  const filteredArchive = useMemo(() => {
    if (!archiveSearch.trim()) return savedTemplates;
    const term = normalizeArabicText(archiveSearch);
    return savedTemplates.filter(doc =>
      normalizeArabicText(doc.employee_name).includes(term) ||
      normalizeArabicText(doc.template_name).includes(term) ||
      (doc.reference && doc.reference.includes(term)) ||
      (doc.code_no && doc.code_no.toLowerCase().includes(term.toLowerCase()))
    );
  }, [savedTemplates, archiveSearch]);

  return (
    <div className="templates-section-wrapper">
      {/* Floating Notification */}
      {notificationMsg && (
        <div className="moi-success-notification">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN CARD: EXACT REPLICA OF USER PHOTOS 1, 2, 3, 4                         */}
      {/* ========================================================================= */}
      <div className="templates-official-card">
        {/* Header with Title and Orange Vertical Bar (Photo 1) */}
        <div className="templates-card-header">
          <div className="templates-title-block">
            <span className="orange-vertical-bar" />
            <h3 className="templates-title-text">النماذج والرسائل الإدارية</h3>
          </div>
        </div>

        {/* The 3 Inputs Row (Photo 1 & Photo 2) */}
        <div className="templates-inputs-row">
          {/* Input 1: Exact Force Name Autocomplete Dropdown (Matching User Photo) */}
          <div className="template-field-wrap">
            <ForceNameAutocomplete
              value={employeeSearch}
              onChange={(val) => {
                setEmployeeSearch(val);
                if (!val) setSelectedEmployee(null);
              }}
              onSelect={(member) => {
                setSelectedEmployee(member);
                setEmployeeSearch(member.name);
              }}
              forceMembers={forceMembers}
              placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
            />
          </div>

          {/* Input 2: Template Type Dropdown (Center) - Photo 3 */}
          <div className="template-field-wrap">
            <div className="field-select-box">
              <select
                className="template-dropdown-select"
                value={selectedTemplateType}
                onChange={(e) => setSelectedTemplateType(e.target.value)}
              >
                {TEMPLATE_TYPES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-arrow-icon" />
            </div>
          </div>

          {/* Input 3: Reference Number (Left) - Photo 2 */}
          <div className="template-field-wrap">
            <div className="field-input-box">
              <input
                type="text"
                className="template-text-input ref-number-input"
                placeholder="الرقم الإشاري (اختياري) مثال: 15/2026"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Button: [ إنشاء وطباعة النموذج 🖨️ ] (Photo 1 & Photo 2) */}
        <div className="templates-actions-row">
          <button
            type="button"
            className="btn-create-template-print"
            onClick={handleCreateTemplate}
          >
            <Printer size={16} />
            <span>إنشاء وطباعة النموذج</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ARCHIVE TABLE: HISTORY OF GENERATED TEMPLATES & RECENT DOCUMENTS           */}
      {/* ========================================================================= */}
      <div className="templates-archive-card">
        <div className="archive-card-header">
          <div className="archive-title-group">
            <h4>سجل النماذج والرسائل المنشأة ({filteredArchive.length})</h4>
            <span>الأرشيف الإداري للمستندات والإفادات والقرارات الصادرة</span>
          </div>

          <div className="archive-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="بحث بالاسم، نوع النموذج، أو الرقم الإشاري..."
              value={archiveSearch}
              onChange={(e) => setArchiveSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="archive-table-wrapper">
          <table className="templates-official-table">
            <thead>
              <tr>
                <th>الكود</th>
                <th>نوع النموذج</th>
                <th>اسم المعني / الموظف</th>
                <th>الرقم الإشاري</th>
                <th>التاريخ</th>
                <th>المحرر</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchive.length > 0 ? (
                filteredArchive.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="code-pill-blue">{item.code_no}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#0a192f' }}>
                      {item.template_name}
                    </td>
                    <td style={{ fontWeight: 700, color: '#1e3a8a' }}>
                      {item.employee_name}
                    </td>
                    <td>
                      <span className="ref-pill-slate">{item.reference || '—'}</span>
                    </td>
                    <td>{item.date}</td>
                    <td>{item.editor || 'عبدالصمد'}</td>
                    <td>
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="btn-action-preview"
                          onClick={() => {
                            setActiveDocument(item);
                            setEditorViewMode('split');
                            setShowDocModal(true);
                          }}
                          title="معاينة وتحرير وطباعة A4"
                        >
                          <Eye size={13} />
                          <span>معاينة وطباعة</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action-delete"
                          onClick={() => handleDeleteTemplate(item.id, item.employee_name)}
                          title="حذف المستند"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    لا توجد نماذج محفوظة حالياً، يمكنك إنشاء نموذج جديد من النموذج أعلاه.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: FULL RICH TEXT EDITOR & CUSTOMIZABLE FORM + LIVE A4 PREVIEW         */}
      {/* ========================================================================= */}
      {showDocModal && activeDocument && (
        <div className="moi-modal-overlay" onClick={() => setShowDocModal(false)}>
          <div
            className={`moi-modal-box letter-modal-box ${editorViewMode === 'split' ? 'split-wide-modal' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: editorViewMode === 'split' ? '96vw' : '900px', width: '96vw' }}
          >
            {/* Modal Top Header Bar with Mode Switchers and Actions */}
            <div className="moi-modal-header letter-modal-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 800, color: '#0f172a' }}>
                  {activeDocument.template_name || 'نموذج رسمي'}
                </h3>
                <span className="code-pill-blue" style={{ fontSize: '12px' }}>
                  {activeDocument.code_no}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* 1. Mode Switcher (Split vs Editor vs Preview) */}
                <div className="editor-mode-toggle-group">
                  <button
                    type="button"
                    className={`btn-mode-toggle ${editorViewMode === 'split' ? 'active' : ''}`}
                    onClick={() => setEditorViewMode('split')}
                    title="العرض المزدوج: محرر ونموذج كامل + معاينة حية في نفس الوقت"
                  >
                    <Columns size={14} />
                    <span>العرض المزدوج (محرر + معاينة)</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-mode-toggle ${editorViewMode === 'editor' ? 'active' : ''}`}
                    onClick={() => setEditorViewMode('editor')}
                    title="المحرر ونموذج التعديل الشامل فقط"
                  >
                    <Edit size={14} />
                    <span>محرر البيانات الكامل</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-mode-toggle ${editorViewMode === 'preview' ? 'active' : ''}`}
                    onClick={() => setEditorViewMode('preview')}
                    title="معاينة الوثيقة الرسمية A4 فقط"
                  >
                    <Eye size={14} />
                    <span>ورقة A4 للطباعة</span>
                  </button>
                </div>

                {/* 2. Save Changes in Archive Button */}
                <button
                  type="button"
                  className="btn-save-doc-edits"
                  onClick={handleSaveDocEdits}
                  title="حفظ كافة التعديلات في سجل الأرشيف"
                >
                  <Save size={15} />
                  <span>حفظ التعديلات</span>
                </button>

                {/* 3. Direct Browser A4 Print */}
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={handlePrintDocument}
                  style={{ padding: '6px 18px', fontSize: '13px' }}
                >
                  <Printer size={15} />
                  <span>طباعة فورية (A4)</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowDocModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className={`letter-modal-body-wrapper ${editorViewMode}`}>
              {/* PANEL 1: FULL RICH EDITOR & COMPLETE FORM CONTROLS */}
              {(editorViewMode === 'split' || editorViewMode === 'editor') && (
                <div className="full-document-editor-panel">
                  {/* Editor Sub-Tabs */}
                  <div className="editor-subtabs-bar">
                    <button
                      type="button"
                      className={`subtab-btn ${activeEditorTab === 'body' ? 'active' : ''}`}
                      onClick={() => setActiveEditorTab('body')}
                    >
                      <Type size={15} />
                      <span>1. صلب المستند ومحرر النصوص</span>
                    </button>

                    <button
                      type="button"
                      className={`subtab-btn ${activeEditorTab === 'meta' ? 'active' : ''}`}
                      onClick={() => setActiveEditorTab('meta')}
                    >
                      <Building2 size={15} />
                      <span>2. الترويسة والأرقام الإشارية</span>
                    </button>

                    <button
                      type="button"
                      className={`subtab-btn ${activeEditorTab === 'signature_cc' ? 'active' : ''}`}
                      onClick={() => setActiveEditorTab('signature_cc')}
                    >
                      <Shield size={15} />
                      <span>3. التوقيع والختم والتوزيع</span>
                    </button>
                  </div>

                  {/* SUBTAB 1: RICH TEXT BODY EDITOR */}
                  {activeEditorTab === 'body' && (
                    <div className="editor-tab-pane">
                      {/* Formatting Toolbar */}
                      <div className="rich-editor-toolbar">
                        <div className="toolbar-group">
                          <button
                            type="button"
                            className={`btn-format ${activeDocument.font_weight === 'bold' ? 'active' : ''}`}
                            onClick={() =>
                              setActiveDocument({
                                ...activeDocument,
                                font_weight: activeDocument.font_weight === 'bold' ? 'normal' : 'bold'
                              })
                            }
                            title="خط عريض غامق (Bold)"
                          >
                            <Bold size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn-format ${activeDocument.font_style === 'italic' ? 'active' : ''}`}
                            onClick={() =>
                              setActiveDocument({
                                ...activeDocument,
                                font_style: activeDocument.font_style === 'italic' ? 'normal' : 'italic'
                              })
                            }
                            title="خط مائل (Italic)"
                          >
                            <Italic size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn-format ${activeDocument.text_decoration === 'underline' ? 'active' : ''}`}
                            onClick={() =>
                              setActiveDocument({
                                ...activeDocument,
                                text_decoration: activeDocument.text_decoration === 'underline' ? 'none' : 'underline'
                              })
                            }
                            title="تسطير تحته خط (Underline)"
                          >
                            <Underline size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn-format ${activeDocument.text_align === 'right' ? 'active' : ''}`}
                            onClick={() => setActiveDocument({ ...activeDocument, text_align: 'right' })}
                            title="محاذاة لليمين"
                          >
                            <AlignRight size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn-format ${activeDocument.text_align === 'center' ? 'active' : ''}`}
                            onClick={() => setActiveDocument({ ...activeDocument, text_align: 'center' })}
                            title="محاذاة في الوسط"
                          >
                            <AlignCenter size={15} />
                          </button>

                          <button
                            type="button"
                            className={`btn-format ${activeDocument.text_align === 'justify' ? 'active' : ''}`}
                            onClick={() => setActiveDocument({ ...activeDocument, text_align: 'justify' })}
                            title="ضبط الكشيدة (Justify)"
                          >
                            <AlignJustify size={15} />
                          </button>
                        </div>

                        <div className="toolbar-group">
                                                  <div className="toolbar-group">
                          <label className="toolbar-lbl">نوع الخط:</label>
                          <select
                            className="toolbar-select font-family-select"
                            value={activeDocument.font_family || "'Cairo', sans-serif"}
                            onChange={(e) => setActiveDocument({ ...activeDocument, font_family: e.target.value })}
                            style={{ minWidth: '130px', fontWeight: 'bold' }}
                          >
                            <option value="'Cairo', sans-serif">خط كايرو الرسمي (Cairo)</option>
                            <option value="'Amiri', serif">خط الأميري النسخي (Amiri)</option>
                            <option value="'Scheherazade New', serif">خط شهرزاد الفاخر (Scheherazade)</option>
                            <option value="'Tajawal', sans-serif">خط تجوال الحديث (Tajawal)</option>
                            <option value="'Almarai', sans-serif">خط المراعي المعاصر (Almarai)</option>
                            <option value="'Noto Naskh Arabic', serif">خط نوتو نسخ (Noto Naskh)</option>
                            <option value="'Traditional Arabic', serif">خط عربي تقليدي (Traditional)</option>
                          </select>
                        </div>

<label className="toolbar-lbl">حجم الخط:</label>
                          <select
                            className="toolbar-select"
                            value={activeDocument.font_size || '16.5px'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, font_size: e.target.value })}
                          >
                            <option value="14px">14px (صغير)</option>
                            <option value="16.5px">16.5px (قياسي رسمي)</option>
                            <option value="18px">18px (متوسط)</option>
                            <option value="20px">20px (كبير)</option>
                            <option value="22px">22px (عريض جداً)</option>
                          </select>
                        </div>

                        <div className="toolbar-group">
                          <label className="toolbar-lbl">تباعد الأسطر:</label>
                          <select
                            className="toolbar-select"
                            value={activeDocument.line_height || '2'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, line_height: e.target.value })}
                          >
                            <option value="1.6">1.6 (متقارب)</option>
                            <option value="1.8">1.8 (متوسط)</option>
                            <option value="2">2.0 (رسمي معتمد)</option>
                            <option value="2.3">2.3 (متباعد وواضح)</option>
                          </select>
                        </div>

                        <div className="toolbar-group">
                          <label className="toolbar-lbl">اللون:</label>
                          <select
                            className="toolbar-select"
                            value={activeDocument.text_color || '#000000'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, text_color: e.target.value })}
                          >
                            <option value="#000000">أسود رسمي</option>
                            <option value="#1e3a8a">أزرق كحلي</option>
                            <option value="#334155">رمادي داكن</option>
                            <option value="#991b1b">عنابي ملكي</option>
                          </select>
                        </div>
                      </div>

                      {/* Quick Variable Insertion Chips */}
                      <div className="variables-quick-chips">
                        <span className="chips-title">إدراج بيانات الموظف بنقرة:</span>
                        <button
                          type="button"
                          className="quick-chip-btn"
                          onClick={() => insertVariableIntoBody(activeDocument.employee_name)}
                        >
                          👤 {activeDocument.employee_name}
                        </button>

                        <button
                          type="button"
                          className="quick-chip-btn"
                          onClick={() => insertVariableIntoBody(`الرقم المالي: (${activeDocument.employee_job_no})`)}
                        >
                          🔢 الرقم المالي ({activeDocument.employee_job_no})
                        </button>

                        <button
                          type="button"
                          className="quick-chip-btn"
                          onClick={() => insertVariableIntoBody(`الرقم الوطني: (${activeDocument.employee_national_id})`)}
                        >
                          🆔 الرقم الوطني
                        </button>

                        <button
                          type="button"
                          className="quick-chip-btn"
                          onClick={() => insertVariableIntoBody(activeDocument.date)}
                        >
                          📅 تاريخ اليوم ({activeDocument.date})
                        </button>

                        <button
                          type="button"
                          className="quick-chip-btn"
                          onClick={() => insertVariableIntoBody(activeDocument.employee_dept || 'الشؤون الإدارية والمالية')}
                        >
                          🏢 الإدارة / التبعية
                        </button>
                      </div>

                      {/* Main Rich Textarea for Document Body */}
                      <div className="editor-input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                            متن وصياغة نص الكتاب / النموذج:
                          </label>
                          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {activeDocument.body_text?.length || 0} حرف | {activeDocument.body_text?.split(/\s+/).filter(Boolean).length || 0} كلمة
                          </span>
                        </div>
                        <textarea
                          rows={8}
                          className="rich-body-textarea"
                          value={activeDocument.body_text || ''}
                          onChange={(e) => setActiveDocument({ ...activeDocument, body_text: e.target.value })}
                          placeholder="اكتب أو عدّل نص المستند وصياغته بحرية كاملة..."
                        />
                      </div>

                      {/* Quick Official Phrases Accordion */}
                      <div className="quick-phrases-bar">
                        <span className="chips-title">عبارات وصيغ قانونية جاهزة:</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoBody('تفيد مديرية أمن أوباري بأن المذكور أعلاه لا يزال مستمراً في أداء مهامه الوظيفية والنظامية على رأس العمل حتى تاريخه.')}
                          >
                            + استمرار بالعمل
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoBody('نحيل إليكم هذا الكتاب للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة المنظمة لمديرية أمن أوباري.')}
                          >
                            + إحالة للعلم والاختصاص
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoBody('تشهد المديرية بأن المعني قد أتم إخلاء طرفه بالكامل من كافة العهد والمسؤوليات وليس بذمته أي التزامات وظيفية.')}
                          >
                            + إخلاء طرف
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoBody('بناءً على مقتضيات المصلحة العامة وحسن سير العمل بمديرية أمن أوباري، يُكلف المعني بالمهام الموكلة إليه اعتباراً من تاريخه.')}
                          >
                            + تكليف ومأمورية
                          </button>
                        </div>
                      </div>

                      {/* Formal Greeting Editing */}
                      <div style={{ marginTop: '16px' }}>
                        <div>
                          <label className="editor-control-lbl">عبارة التحية الرسمية:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.greeting_1 || 'بعد التحيـــــة والســــلام ،،،'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, greeting_1: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: HEADER & META DATA */}
                  {activeEditorTab === 'meta' && (
                    <div className="editor-tab-pane">
                      <div className="grid-2-controls">
                        <div>
                          <label className="editor-control-lbl">عنوان الوزارة (عربي):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.header_moi_ar || 'وزارة الداخليـــــــــــــــــــة'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, header_moi_ar: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">عنوان المديرية (عربي):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.header_dir_ar || 'مديرية أمن أوبـــــــــــــــــاري'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, header_dir_ar: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid-2-controls" style={{ marginTop: '12px' }}>
                        <div>
                          <label className="editor-control-lbl">Ministry Header (EN):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.header_moi_en || 'Ministry of Interior'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, header_moi_en: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">Directorate Header (EN):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.header_dir_en || 'Ubari Security Directorate'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, header_dir_en: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid-4-controls" style={{ marginTop: '14px' }}>
                        <div>
                          <label className="editor-control-lbl">الرقم الإشاري:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            dir="ltr"
                            value={activeDocument.reference || '14/2026'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, reference: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">رقم القيـد:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.record_number || '14'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, record_number: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">الموافق (التاريخ):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            dir="ltr"
                            value={activeDocument.date}
                            onChange={(e) => setActiveDocument({ ...activeDocument, date: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">كود الوثيقة (Code No):</label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <input
                              type="text"
                              className="editor-text-input"
                              dir="ltr"
                              value={activeDocument.code_no || ''}
                              onChange={(e) => setActiveDocument({ ...activeDocument, code_no: e.target.value })}
                            />
                            <button
                              type="button"
                              className="btn-refresh-code-sm"
                              onClick={() => {
                                const fresh = getNextReportCode();
                                setActiveDocument({ ...activeDocument, code_no: fresh });
                              }}
                              title="توليد وتحديث كود تقرير جديد تلقائياً"
                            >
                              <RefreshCw size={13} />
                              <span>تحديث</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <label className="editor-control-lbl">المخاطب الرئيسي (إلى السيد / ...):</label>
                        <input
                          type="text"
                          className="editor-text-input"
                          value={activeDocument.recipient || ''}
                          onChange={(e) => setActiveDocument({ ...activeDocument, recipient: e.target.value })}
                          placeholder="مثال: إلى السيد / مدير إدارة الشؤون الإدارية والمالية المحترم"
                        />
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <label className="editor-control-lbl">بخصوص (موضوع الكتاب):</label>
                        <input
                          type="text"
                          className="editor-text-input"
                          value={activeDocument.subject || ''}
                          onChange={(e) => setActiveDocument({ ...activeDocument, subject: e.target.value })}
                          placeholder="موضوع النموذج..."
                        />
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <label className="editor-control-lbl">سطر الإشارة الرسمية:</label>
                        <input
                          type="text"
                          className="editor-text-input"
                          value={activeDocument.reference_subline || 'إشارة إلى السجلات الرسمية وقواعد بيانات منتسبي مديرية أمن أوباري المنظمة للعمل'}
                          onChange={(e) => setActiveDocument({ ...activeDocument, reference_subline: e.target.value })}
                        />
                      </div>

                      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          id="toggle-qr"
                          checked={activeDocument.show_qr !== false}
                          onChange={(e) => setActiveDocument({ ...activeDocument, show_qr: e.target.checked })}
                        />
                        <label htmlFor="toggle-qr" style={{ fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                          تفعيل وإظهار رمز الاستجابة السريعة (QR Code) الأمني للتحقق الرقمي
                        </label>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: SIGNATURE, STAMP, CC LIST & FOOTER */}
                  {activeEditorTab === 'signature_cc' && (
                    <div className="editor-tab-pane">
                      <div className="grid-2-controls">
                        <div>
                          <label className="editor-control-lbl">اسم الضابط الموقع المعتمد:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.signer_name || 'لواء / موسى سعد محمد'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, signer_name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">الرتبة والصفة القيادية:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.signer_title || 'مدير مديرية أمن أوباري'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, signer_title: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Official Stamp Configuration */}
                      <div className="stamp-config-box" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Stamp size={16} />
                            <span>إعدادات موضع التوقيع والختم الدائري الرسمي</span>
                          </span>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={Boolean(activeDocument.show_stamp)}
                              onChange={(e) => setActiveDocument({ ...activeDocument, show_stamp: e.target.checked })}
                            />
                            <span>إظهار الختم</span>
                          </label>
                        </div>

                        {/* Controls for Position on page & Stamp layout */}
                        <div className="grid-3-controls" style={{ marginBottom: '12px' }}>
                          <div>
                            <label className="editor-control-lbl">موضع التوقيع والختم في الصفحة:</label>
                            <select
                              className="editor-text-input"
                              value={activeDocument.sig_position || 'left'}
                              onChange={(e) => setActiveDocument({ ...activeDocument, sig_position: e.target.value })}
                            >
                              <option value="left">👈 أقصى اليسار (الوضع الرسمي المعتمد)</option>
                              <option value="center">وسط الصفحة</option>
                              <option value="right">👉 أقصى اليمين</option>
                            </select>
                          </div>

                          <div>
                            <label className="editor-control-lbl">تموضع الختم مع الاسم:</label>
                            <select
                              className="editor-text-input"
                              value={activeDocument.stamp_layout || 'stacked'}
                              onChange={(e) => setActiveDocument({ ...activeDocument, stamp_layout: e.target.value })}
                            >
                              <option value="stacked">تحت الاسم والصفة مباشرة (على اليسار)</option>
                              <option value="side">بجانب الاسم (إلى يسار التوقيع)</option>
                            </select>
                          </div>

                          <div>
                            <label className="editor-control-lbl">لون حبر الختم:</label>
                            <select
                              className="editor-text-input"
                              value={activeDocument.stamp_color || '#1e3a8a'}
                              onChange={(e) => setActiveDocument({ ...activeDocument, stamp_color: e.target.value })}
                            >
                              <option value="#1e3a8a">أزرق كحلي أمني معتمد</option>
                              <option value="#1d4ed8">أزرق ملكي واضح</option>
                              <option value="#0f172a">أسود كلاسيكي رسمي</option>
                            </select>
                          </div>
                        </div>

                        {activeDocument.show_stamp !== false && (
                          <div className="grid-3-controls">
                            <div>
                              <label className="editor-control-lbl">سطر الختم 1:</label>
                              <input
                                type="text"
                                className="editor-text-input"
                                value={activeDocument.stamp_text_1 || 'وزارة الداخلية'}
                                onChange={(e) => setActiveDocument({ ...activeDocument, stamp_text_1: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="editor-control-lbl">سطر الختم 2:</label>
                              <input
                                type="text"
                                className="editor-text-input"
                                value={activeDocument.stamp_text_2 || 'مديرية أمن أوباري'}
                                onChange={(e) => setActiveDocument({ ...activeDocument, stamp_text_2: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="editor-control-lbl">سطر الختم 3:</label>
                              <input
                                type="text"
                                className="editor-text-input"
                                value={activeDocument.stamp_text_3 || '* مكتب المدير *'}
                                onChange={(e) => setActiveDocument({ ...activeDocument, stamp_text_3: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CC Distribution List (صورة منه إلى) */}
                      <div className="cc-manager-box" style={{ marginTop: '16px' }}>
                        <label style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                          جهات التوزيع (صورة منه إلى :-):
                        </label>

                        <div className="cc-items-editable-list">
                          {(activeDocument.cc_list || []).map((cc, idx) => (
                            <div key={idx} className="cc-editable-row">
                              <span className="cc-bullet-index">-</span>
                              <input
                                type="text"
                                className="editor-text-input cc-input"
                                value={cc}
                                onChange={(e) => {
                                  const updated = [...activeDocument.cc_list];
                                  updated[idx] = e.target.value;
                                  setActiveDocument({ ...activeDocument, cc_list: updated });
                                }}
                              />
                              <button
                                type="button"
                                className="btn-remove-cc"
                                onClick={() => handleRemoveCcItem(idx)}
                                title="حذف هذا البند"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="add-cc-input-row" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <input
                            type="text"
                            className="editor-text-input"
                            placeholder="اكتب جهة جديدة لإضافتها إلى التوزيع..."
                            value={newCcEntity}
                            onChange={(e) => setNewCcEntity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCcItem();
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="btn-add-cc"
                            onClick={handleAddCcItem}
                            style={{
                              padding: '8px 16px',
                              background: '#1e3a8a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            + إضافة للتوزيع
                          </button>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="grid-4-controls" style={{ marginTop: '18px' }}>
                        <div>
                          <label className="editor-control-lbl">المحرر:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.editor || 'عبدالصمد'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, editor: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">الطباعة:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={activeDocument.printer || 'عبدالصمد'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, printer: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">Phone:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            dir="ltr"
                            value={activeDocument.phone || '0915938137'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, phone: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="editor-control-lbl">Email:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            dir="ltr"
                            value={activeDocument.email || 'Info@ubari-security.ly'}
                            onChange={(e) => setActiveDocument({ ...activeDocument, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PANEL 2: LIVE A4 PRINTABLE DOCUMENT SHEET */}
              {/* PANEL 2: LIVE A4 PRINTABLE DOCUMENT SHEET (Always in DOM for print) */}
              <div className={`letter-modal-preview-pane ${editorViewMode === 'preview' ? 'full-preview' : ''} ${editorViewMode === 'editor' ? 'hide-on-screen-only' : ''}`}>
                <OfficialTemplateA4Sheet doc={activeDocument} qrUrl={qrCodeDataUrl} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: OFFICIAL A4 TEMPLATE DOCUMENT SHEET (Print-ready)
// =========================================================================
function OfficialTemplateA4Sheet({ doc, qrUrl }) {
  if (!doc) return null;

  return (
    <div className="official-a4-letter-sheet" id="official-template-to-print">
      {/* Top Header Block matching Directorate Standard */}
      <header className="a4-letter-header">
        <div className="header-lang-right">
          <h2 className="title-moi-ar">{doc.header_moi_ar || 'وزارة الداخليـــــــــــــــــــة'}</h2>
          <h3 className="title-dir-ar">{doc.header_dir_ar || 'مديرية أمن أوبـــــــــــــــــاري'}</h3>
        </div>

        {doc.show_header_emblem !== false && (
          <div className="header-emblem-center">
            <img src="./moi-logo.png" onError={(e) => { e.currentTarget.src = './moi-logo.png'; }} alt="شعار مديرية أمن أوباري" className="emblem-img" />
          </div>
        )}

        <div className="header-lang-left">
          <h2 className="title-moi-en">{doc.header_moi_en || 'Ministry of Interior'}</h2>
          <h3 className="title-dir-en">{doc.header_dir_en || 'Ubari Security Directorate'}</h3>
        </div>
      </header>

      {/* Metadata Table (Right) and QR Code (Left) */}
      <div className="a4-metadata-qr-row">
        {/* Table on the right (1st child in RTL): الترتيب: الإشاري -> القيد -> التاريخ -> الكود */}
        <div className="official-meta-table-box">
          <div className="meta-row">
            <div className="meta-cell ref-cell">
              <span className="meta-lbl">الإشاري:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{doc.reference || '14/2026'}</span>
            </div>
            <div className="meta-cell record-cell">
              <span className="meta-lbl">القيـــــد:</span>
              <span className="meta-val" style={{ unicodeBidi: 'plaintext' }}>{doc.record_number || '14'}</span>
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-cell date-cell">
              <span className="meta-lbl">الموافق:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{doc.date}</span>
            </div>
            <div className="meta-cell code-cell">
              <span className="meta-lbl">:Code No</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{doc.code_no || '2026-T01'}</span>
            </div>
          </div>
        </div>

        {/* QR Code on the left (2nd child in RTL) */}
        {doc.show_qr !== false && (
          <div className="qr-code-box">
            {qrUrl ? (
              <img src={qrUrl} alt="رمز التحقق الأمني QR" className="qr-img" />
            ) : (
              <div className="qr-placeholder" />
            )}
          </div>
        )}
      </div>

      {/* Framed Subject Box */}
      <div className="a4-subject-bordered-box">
        <span className="subject-title-lbl">بخصوص /</span>
        <span className="subject-title-content">{doc.subject}</span>
      </div>

      {/* Reference Sub-line */}
      {doc.reference_subline && (
        <div className="a4-reference-subline">
          <span>{doc.reference_subline}</span>
        </div>
      )}

      {/* Recipient Headline */}
      <div className="a4-recipient-headline">
        <h3>{doc.recipient}</h3>
      </div>

      {/* Formal Greetings */}
      <div className="a4-greetings-section">
        <p className="greeting-line-1">{doc.greeting_1 || 'بعد التحيـــــة والســــلام ،،،'}</p>
      </div>

      {/* Document Body Content */}
      <div className="a4-body-content">
        <div
          className="body-main-clause"
          style={{
            whiteSpace: 'pre-line',
            fontFamily: doc.font_family || "'Cairo', sans-serif",
            fontSize: doc.font_size || '16.5px',
            lineHeight: doc.line_height || '2',
            textAlign: doc.text_align || 'right',
            fontWeight: doc.font_weight || 'normal',
            fontStyle: doc.font_style || 'normal',
            textDecoration: doc.text_decoration || 'none',
            color: doc.text_color || '#000000'
          }}
        >
          {doc.body_text}
        </div>
      </div>

      {/* Signature Block (Positioned strictly on the LEFT) */}
      <div className={`a4-signature-block pos-${doc.sig_position || 'left'}`}>
        <div className={`sig-inner ${doc.stamp_layout === 'side' ? 'layout-side' : 'layout-stacked'}`}>
          <div className="sig-text-side">
            <h4 className="sig-officer-name">{doc.signer_name || 'لواء / موسى سعد محمد'}</h4>
            <h5 className="sig-officer-rank">{doc.signer_title || 'مدير مديرية أمن أوباري'}</h5>
          </div>
        </div>
      </div>

      {/* CC Distribution List (Two Columns) */}
      {Array.isArray(doc.cc_list) && doc.cc_list.length > 0 && (
        <div className="a4-cc-distribution-block">
          <div className="cc-header">صورة منه إلى :-</div>
          <div className="cc-grid-2cols">
            <ul className="cc-col">
              {doc.cc_list.slice(0, Math.ceil(doc.cc_list.length / 2)).map((item, i) => (
                <li key={i}>- {item}</li>
              ))}
            </ul>
            <ul className="cc-col">
              {doc.cc_list.slice(Math.ceil(doc.cc_list.length / 2)).map((item, i) => (
                <li key={i}>- {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Footer Line & Details */}
      <footer className="a4-letter-footer">
        <div className="footer-solid-divider" />
        <div className="footer-details-row">
          <div className="footer-cell editor-cell">
            <span>المحرر: {doc.editor || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell print-cell">
            <span style={{ marginLeft: '4px' }}>🖨️</span>
            <span>الطباعة: {doc.printer || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell phone-cell">
            <span>Phone: {doc.phone || '0915938137'}</span>
          </div>
          <div className="footer-cell email-cell">
            <span>Email: {doc.email || 'Info@ubari-security.ly'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
