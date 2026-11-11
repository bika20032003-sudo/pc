import React, { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Mail,
  Send,
  Inbox,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  FileCheck,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Building2,
  User,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Download,
  Share2,
  Paperclip,
  Check,
  Shield,
  Phone,
  RefreshCw,
  Save,
  Bold,
  Italic,
  Underline,
  AlignRight,
  AlignCenter,
  AlignJustify,
  Type,
  Sparkles
} from 'lucide-react';
import ForceNameAutocomplete from './ForceNameAutocomplete';
import initialReferredMail from '../data/referred_mail_data.json';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';
import { createOfficialLetterHtml } from '../utils/officialLetterTemplate';

// Default initial Outgoing Mail matching Image 1 & Image 3
const INITIAL_OUTGOING_MAIL = [
  {
    id: 1,
    code_no: '2026-002',
    record_number: '1',
    reference: '12/2026',
    reply_to_reference: '1.2/2026',
    reply_date: '10/10/2026',
    recipient: 'آمر المنطقة العسكرية الجنوبية',
    recipient_title: 'إلى السيد / آمر المنطقة العسكرية الجنوبية',
    date: '11/10/2026',
    subject: 'التنسيق الأمني وتسيير الدوريات بالمنطقة الجنوبية وتأمين مداخل مدينة أوباري',
    delivery_method: 'إلكتروني (منظومة/إيميل)',
    sender_employee: 'عبدالصمد',
    editor_employee: 'عبدالصمد',
    print_employee: 'عبدالصمد',
    status: 'delivered', // 'delivered' = تم التسليم (مغلق), 'pending' = قيد الإرسال, 'action_required'
    attachment_name: 'مذكرة_تنسيق_رسمية.pdf',
    letter_body: 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
    cc_list: [
      'السيد / وكيل وزارة الداخلية',
      'معالي / وزير الداخلية',
      'آمر المنطقة العسكرية الجنوبية',
      'المساعد للشؤون الأمنية',
      'الغرفة الأمنية المشتركة',
      'الإدارة العامة للتفتيش والمتابعة'
    ],
    signer_name: 'لواء / موسى سعد محمد',
    signer_title: 'مدير مديرية أمن أوباري',
    phone: '0915938137',
    email: 'Info@ubari-security.ly',
    created_at: '2026-10-11T10:30:00'
  },
  {
    id: 2,
    code_no: '2026-001',
    record_number: '150',
    reference: '10/2026',
    reply_to_reference: '',
    reply_date: '',
    recipient: 'مدير الإدارة العامة للتفتيش والمتابعة',
    recipient_title: 'إلى السيد / مدير الإدارة العامة للتفتيش والمتابعة',
    date: '08/10/2026',
    subject: 'إحالة التقرير الشهري لضبطيات الدوريات ومراكز الشرطة بالمديرية',
    delivery_method: 'يدوي / ورقي',
    sender_employee: 'عبدالصمد',
    editor_employee: 'عبدالصمد',
    print_employee: 'عبدالصمد',
    status: 'delivered',
    attachment_name: 'تقرير_شهري_أكتوبر.pdf',
    letter_body: 'نحيل إليكم طيه كشف التقرير الأمني الدوري لمديرية أمن أوباري، المتضمن كافة المحاضر والضبطيات ومناوبات الأجهزة الأمنية لشهر أكتوبر 2026م للتفضل بالاطلاع.',
    cc_list: [
      'السيد / وكيل وزارة الداخلية',
      'المساعد للشؤون الأمنية'
    ],
    signer_name: 'لواء / موسى سعد محمد',
    signer_title: 'مدير مديرية أمن أوباري',
    phone: '0915938137',
    email: 'Info@ubari-security.ly',
    created_at: '2026-10-08T09:15:00'
  }
];

// Default initial Incoming Mail matching Image 2
const INITIAL_INCOMING_MAIL = [
  {
    id: 1,
    incoming_reference: '1.2/2026',
    linked_reference: '12/2026',
    source_entity: 'آمر المنطقة العسكرية الجنوبية',
    date: '10/10/2026',
    time: '11:45',
    subject: 'طلب تنسيق مشترك بخصوص تأمين النقاط والمراكز الحيوية',
    receive_method: 'مناولة باليد (مراسل)',
    receiver_employee: 'عبدالصمد',
    status: 'replied', // 'in_progress' = تحت الإجراء, 'replied' = تم الرد والمتابعة, 'archived'
    attachment_name: 'كتاب_عسكري_وارد_1_2.pdf',
    created_at: '2026-10-10T11:45:00'
  },
  {
    id: 2,
    incoming_reference: '77/م.و/2026',
    linked_reference: '',
    source_entity: 'مكتب وكيل وزارة الداخلية للشؤون الفنية',
    date: '05/10/2026',
    time: '09:30',
    subject: 'تعليمات عاجلة بشأن جاهزية الاتصالات اللاسلكية والغرف المشتركة',
    receive_method: 'بريد إلكتروني رسمي',
    receiver_employee: 'عبدالصمد',
    status: 'in_progress',
    attachment_name: 'تعليمات_وكيل_الوزارة.pdf',
    created_at: '2026-10-05T09:30:00'
  }
];

// Security entities quick suggestions list
const ENTITY_SUGGESTIONS = [
  'السيد / آمر المنطقة العسكرية الجنوبية',
  'معالي / وزير الداخلية',
  'السيد / وكيل وزارة الداخلية',
  'المساعد للشؤون الأمنية - مديرية أمن أوباري',
  'الغرفة الأمنية المشتركة بالجنوب',
  'الإدارة العامة للتفتيش والمتابعة',
  'مركز شرطة أوباري المدينة',
  'مركز شرطة بنت بيه',
  'مركز شرطة الغريفة',
  'إدارة شؤون المرور والتراخيص أوباري',
  'غرفة السيطرة والاتصالات اللاسلكية',
  'فرع البحث الجنائي أوباري',
  'مصلحة الجوازات والجنسية أوباري'
];

export default function MailSection({ user, forceMembers = [] }) {
  // Navigation Tabs: 'outgoing', 'incoming', 'all_logs', 'letter_designer'
  const [activeTab, setActiveTab] = useState('outgoing');

  // Outgoing Mail State
  const [outgoingList, setOutgoingList] = useState(() => {
    const saved = localStorage.getItem('ubari_outgoing_mail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_OUTGOING_MAIL;
  });

  // Referred Mail State (مديرية أمن أوباري)
  const [referredList, setReferredList] = useState(() => {
    const saved = localStorage.getItem('ubari_referred_mail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return Array.isArray(initialReferredMail) ? initialReferredMail : [];
  });

  // Incoming Mail State
  const [incomingList, setIncomingList] = useState(() => {
    const saved = localStorage.getItem('ubari_incoming_mail');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_INCOMING_MAIL;
  });

  // Outgoing Form State matching Image 1
  const [outgoingForm, setOutgoingForm] = useState({
    code_no: '2026-003',
    record_number: '151',
    reference: '13/2026',
    reply_to_reference: '',
    reply_date: '',
    recipient: '',
    date: new Date().toLocaleDateString('en-GB'), // e.g. 12/10/2026
    subject: '',
    delivery_method: 'إلكتروني (منظومة/إيميل)',
    sender_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
    status: 'delivered', // تم التسليم (مغلق)
    attachment_name: ''
  });

  // Incoming Form State matching Image 2
  const [incomingForm, setIncomingForm] = useState({
    incoming_reference: '',
    linked_reference: '',
    source_entity: '',
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
    subject: '',
    receive_method: 'مناولة باليد (مراسل)',
    receiver_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
    status: 'in_progress', // تحت الإجراء
    attachment_name: ''
  });

  // Active Letter for Preview & Print matching Image 3
  const [previewLetter, setPreviewLetter] = useState({
    ...INITIAL_OUTGOING_MAIL[0],
    font_family: "'Cairo', sans-serif",
    font_size: '16px',
    line_height: '1.9',
    text_align: 'right',
    font_weight: 'normal',
    font_style: 'normal',
    text_decoration: 'none',
    text_color: '#000000',
    greeting: 'بعد التحيـــــة والســــلام ،،،',
    show_stamp: true,
    show_signature: true,
    show_qr: true
  });
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [previewIncomingItem, setPreviewIncomingItem] = useState(null);
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  // Letter Designer View State
  const [designerEditorViewMode, setDesignerEditorViewMode] = useState('split'); // 'split', 'editor', 'preview'
  const [activeDesignerSubtab, setActiveDesignerSubtab] = useState('body'); // 'body', 'meta', 'signature_cc'
  const [newCcEntity, setNewCcEntity] = useState('');

  // Register Print Modal State (Print all outgoing or incoming register)
  const [showRegisterPrintModal, setShowRegisterPrintModal] = useState(false);
  const [registerPrintType, setRegisterPrintType] = useState('outgoing'); // 'outgoing' or 'incoming'

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Recipient autocomplete suggestions visibility
  const [showRecipientSuggestions, setShowRecipientSuggestions] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);

  // Generate QR code whenever preview letter changes
  useEffect(() => {
    if (previewLetter) {
      const qrPayload = `وزارة الداخلية - مديرية أمن أوباري\nرمز القيد: ${previewLetter.record_number}\nالكود: ${previewLetter.code_no}\nالإشاري: ${previewLetter.reference}\nالموافق: ${previewLetter.date}\nالموضوع: ${previewLetter.subject}\nالمحرر: ${previewLetter.editor_employee || 'عبدالصمد'}\nتحقق: https://moi.gov.ly/verify?code=${previewLetter.code_no}`;
      QRCode.toDataURL(qrPayload, {
        width: 145,
        margin: 1,
        color: { dark: '#0a192f', light: '#ffffff' }
      })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('QR code generation error:', err));
    }
  }, [previewLetter]);

  // Save Outgoing Mail Handler (Image 1)
  const handleSaveOutgoing = (e) => {
    if (e) e.preventDefault();
    if (!outgoingForm.subject || !outgoingForm.recipient) {
      alert('يرجى كتابة الموضوع والجهة الموجه إليها بدقة');
      return;
    }

    const nextId = outgoingList.length > 0 ? Math.max(...outgoingList.map(o => o.id)) + 1 : 1;
    const newRecord = {
      ...outgoingForm,
      id: nextId,
      recipient_title: outgoingForm.recipient.startsWith('إلى') ? outgoingForm.recipient : `إلى السيد / ${outgoingForm.recipient}`,
      editor_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      print_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      signer_name: 'لواء / موسى سعد محمد',
      signer_title: 'مدير مديرية أمن أوباري',
      letter_body: outgoingForm.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
      cc_list: [
        'السيد / وكيل وزارة الداخلية',
        'معالي / وزير الداخلية',
        'آمر المنطقة العسكرية الجنوبية',
        'المساعد للشؤون الأمنية',
        'الغرفة الأمنية المشتركة',
        'الإدارة العامة للتفتيش والمتابعة'
      ],
      phone: '0915938137',
      email: 'Info@ubari-security.ly',
      created_at: new Date().toISOString()
    };

    const updatedList = [newRecord, ...outgoingList];
    setOutgoingList(updatedList);
    localStorage.setItem('ubari_outgoing_mail', JSON.stringify(updatedList));

    // Prepare next auto-increment codes
    const nextCodeNum = parseInt(outgoingForm.code_no.split('-')[1] || '1', 10) + 1;
    const nextRecordNum = parseInt(outgoingForm.record_number || '151', 10) + 1;

    setOutgoingForm({
      code_no: `2026-${String(nextCodeNum).padStart(3, '0')}`,
      record_number: String(nextRecordNum),
      reference: `${nextRecordNum}/2026`,
      reply_to_reference: '',
      reply_date: '',
      recipient: '',
      date: new Date().toLocaleDateString('en-GB'),
      subject: '',
      delivery_method: 'إلكتروني (منظومة/إيميل)',
      sender_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      status: 'delivered',
      attachment_name: ''
    });

    setNotificationMsg(`تم تقييد وحفظ البريد الصادر برقم قيد (${newRecord.record_number}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);

    // Prompt user to preview the generated official letter
    setPreviewLetter(newRecord);
  };

  // Save Incoming Mail Handler (Image 2)
  const handleSaveIncoming = (e) => {
    if (e) e.preventDefault();
    if (!incomingForm.incoming_reference || !incomingForm.subject || !incomingForm.source_entity) {
      alert('يرجى إدخال الرقم الإشاري، الجهة الوارد منها، وموضوع البريد');
      return;
    }

    const nextId = incomingList.length > 0 ? Math.max(...incomingList.map(i => i.id)) + 1 : 1;
    const newRecord = {
      ...incomingForm,
      id: nextId,
      created_at: new Date().toISOString()
    };

    const updatedList = [newRecord, ...incomingList];
    setIncomingList(updatedList);
    localStorage.setItem('ubari_incoming_mail', JSON.stringify(updatedList));

    setIncomingForm({
      incoming_reference: '',
      linked_reference: '',
      source_entity: '',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }),
      subject: '',
      receive_method: 'مناولة باليد (مراسل)',
      receiver_employee: (user && user.full_name) ? (user.full_name.includes('عبدالصمد') ? 'عبدالصمد' : user.full_name) : 'عبدالصمد',
      status: 'in_progress',
      attachment_name: ''
    });

    setNotificationMsg(`تم توثيق وتقييد البريد الوارد برقم إشاري (${newRecord.incoming_reference}) بنجاح`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // Delete Mail Item
  const handleDeleteOutgoing = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل الصادر من المنظومة؟')) {
      const updated = outgoingList.filter(o => o.id !== id);
      setOutgoingList(updated);
      localStorage.setItem('ubari_outgoing_mail', JSON.stringify(updated));
    }
  };

  const handleDeleteIncoming = (id) => {
    if (confirm('هل أنت متأكد من حذف هذا السجل الوارد؟')) {
      const updated = incomingList.filter(i => i.id !== id);
      setIncomingList(updated);
      localStorage.setItem('ubari_incoming_mail', JSON.stringify(updated));
    }
  };

  // Save Letter Edits to Outgoing List & LocalStorage
  const handleSaveLetterEdits = () => {
    if (!previewLetter) return;
    const existingIndex = outgoingList.findIndex(o => o.id === previewLetter.id);
    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...outgoingList];
      updatedList[existingIndex] = { ...previewLetter, updated_at: new Date().toISOString() };
    } else {
      updatedList = [{ ...previewLetter, updated_at: new Date().toISOString() }, ...outgoingList];
    }
    setOutgoingList(updatedList);
    localStorage.setItem('ubari_outgoing_mail', JSON.stringify(updatedList));
    setNotificationMsg(`تم حفظ وتحديث بيانات الرسالة الرسمية برقم (${previewLetter.reference || previewLetter.code_no}) بنجاح في السجل والذاكرة`);
    setTimeout(() => setNotificationMsg(''), 4500);
  };

  // معاينة قيد البريد الوارد الرسمي
  const handlePreviewIncoming = (item) => {
    setPreviewIncomingItem(item);
    setShowIncomingModal(true);
  };

  // طباعة إفادة استلام وقيد بريد وارد رسمي معتمد
  const handlePrintIncoming = (item) => {
    const today = new Date().toLocaleDateString('ar-LY');
    const html = `
      <div style="font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20px 26px; max-width: 740px; margin: 0 auto; color: #0f172a;">
        <!-- الشريط الرسمي بألوان العلم الليبي -->
        <div style="height: 5px; width: 100%; display: flex; border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
          <div style="flex: 1; background: #e11d48;"></div>
          <div style="flex: 2; background: #000000;"></div>
          <div style="flex: 1; background: #16a34a;"></div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 2.5px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 16px;">
          <tr>
            <td style="text-align: right; vertical-align: middle; width: 40%;">
              <div style="font-size: 14.5px; font-weight: 900; color: #1e3a8a;">دولة ليبيــــا • وزارة الداخليــــة</div>
              <div style="font-size: 16px; font-weight: 900; color: #0f172a;">مديرية أمن أوباري</div>
              <div style="font-size: 11px; font-weight: 700; color: #475569;">قسم الشؤون الإدارية • محفوظات وسجل البريد الوارد</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 20%;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار وزارة الداخلية" style="width: 72px; height: 72px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle; width: 40%;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">State of Libya • Ministry of Interior</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Security Directorate</div>
              <div style="font-size: 9px; color: #64748b;">Incoming Mail Receipt Voucher</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 16px;">
          <div style="display: inline-block; background: #1e3a8a; color: #ffffff; padding: 5px 22px; border-radius: 6px; font-size: 16px; font-weight: 900;">
            إفادة قيد واستلام بريد وارد رسمي
          </div>
          <div style="font-size: 11.5px; color: #64748b; margin-top: 4px; font-weight: 800;">
            رقم القيد المركزي: <span style="color: #1e3a8a; font-family: monospace;">INC-${item.id}-${new Date().getFullYear()}</span>
            &nbsp;|&nbsp; تاريخ الاستخراج: ${today}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #cbd5e1; font-size: 12.5px; margin-bottom: 18px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; width: 24%; font-weight: 800;">الرقم الإشاري الوارد:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; font-family: monospace; color: #1e3a8a;">${item.incoming_reference || '---'}</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; width: 24%; font-weight: 800;">المراسلة المرتبطة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; font-family: monospace;">${item.linked_reference || 'غير مرتبطة'}</td>
          </tr>
          <tr>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">الجهة الوارد منها:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #0f172a;" colspan="3">${item.source_entity}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">موضوع المراسلة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: #1e3a8a;" colspan="3">${item.subject}</td>
          </tr>
          <tr>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">تاريخ وساعة الورود:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800;">${item.date} ${item.time || ''}</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">طريقة الاستلام:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 800; color: #0284c7;">${item.receive_method || 'يدوي'}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">الموظف المستلم:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900;">${item.receiver_employee || user?.full_name || 'عبدالصمد'}</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; color: #475569; font-weight: 800;">حالة المعاملة:</td>
            <td style="padding: 9px 12px; border: 1px solid #cbd5e1; font-weight: 900; color: ${item.status === 'replied' ? '#16a34a' : '#d97706'};">
              ${item.status === 'replied' ? 'تم الرد والإجراء' : 'تحت الإجراء والمتابعة'}
            </td>
          </tr>
        </table>

        <!-- إحالة وتوجيه مدير الأمن -->
        <div style="border: 1.5px dashed #1e3a8a; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px; background: #f8fafc;">
          <div style="font-weight: 900; color: #1e3a8a; font-size: 13px; margin-bottom: 6px;">
            توجيه وتأشيرة السيد مدير أمن أوباري:
          </div>
          <div style="font-size: 12px; line-height: 1.8; color: #334155;">
            تحال المراسلة أعلاه إلى: <strong>قسم الشؤون الإدارية / جهة الاختصاص</strong> للاطلاع واتخاذ ما يلزم من إجراءات وتدابير أمنية وفق صحيح القانون والتعليمات المنظمة.
          </div>
        </div>

        <!-- التوقيعات والختم -->
        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 30px;">
          <tr>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12.5px; color: #1e3a8a; margin-bottom: 40px;">مسؤول البريد والمحفوظات</div>
              <div style="font-weight: 800; font-size: 12px; border-top: 1px dashed #94a3b8; padding-top: 5px;">${item.receiver_employee || 'عبدالصمد'}</div>
            </td>
            <td style="width: 34%; vertical-align: middle;">
              <div style="width: 70px; height: 70px; border-radius: 50%; border: 2px dashed #1e3a8a; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 7.5px; font-weight: 900; color: #1e3a8a; margin: 0 auto; line-height: 1.25;">
                <span>وزارة الداخلية</span>
                <span style="font-size: 8px; font-weight: 900;">مديرية أمن أوباري</span>
                <span style="color: #b91c1c; font-size: 6.5px;">سجل الوارد</span>
              </div>
            </td>
            <td style="width: 33%; vertical-align: top;">
              <div style="font-weight: 800; font-size: 12.5px; color: #1e3a8a; margin-bottom: 40px;">يعتمد مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; font-size: 12px; border-top: 1px dashed #94a3b8; padding-top: 5px; color: #1e3a8a;">لواء / موسى سعد محمد</div>
            </td>
          </tr>
        </table>
      </div>
    `;
    printDocumentInIframe(html, `إفادة_بريد_وارد_${item.incoming_reference || item.id}`);
  };

  // Insert Quick Phrase into Letter Body
  const insertPhraseIntoLetterBody = (phrase) => {
    setPreviewLetter(prev => {
      const current = prev.letter_body || '';
      const separator = current && !current.endsWith('\n') ? '\n\n' : '';
      return {
        ...prev,
        letter_body: current + separator + phrase
      };
    });
  };

  // Add Dynamic CC item
  const handleAddCcItem = () => {
    const trimmed = newCcEntity.trim();
    if (!trimmed) return;
    const currentList = Array.isArray(previewLetter.cc_list) ? previewLetter.cc_list : [];
    setPreviewLetter(prev => ({
      ...prev,
      cc_list: [...currentList, trimmed]
    }));
    setNewCcEntity('');
  };

  // Remove Dynamic CC item
  const handleRemoveCcItem = (indexToRemove) => {
    const currentList = Array.isArray(previewLetter.cc_list) ? previewLetter.cc_list : [];
    setPreviewLetter(prev => ({
      ...prev,
      cc_list: currentList.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Open Letter Preview Modal matching Image 3
  const handleOpenLetterPreview = (letterItem) => {
    setPreviewLetter({
      font_family: "'Cairo', sans-serif",
      font_size: '16px',
      line_height: '1.9',
      text_align: 'right',
      font_weight: 'normal',
      font_style: 'normal',
      text_decoration: 'none',
      text_color: '#000000',
      greeting: 'بعد التحيـــــة والســــلام ،،،',
      show_stamp: true,
      show_signature: true,
      show_qr: true,
      ...letterItem
    });
    setShowLetterModal(true);
  };

  // Switch to Designer tab with specific letter loaded
  const handleOpenInDesigner = (letterItem) => {
    setPreviewLetter({
      font_family: "'Cairo', sans-serif",
      font_size: '16px',
      line_height: '1.9',
      text_align: 'right',
      font_weight: 'normal',
      font_style: 'normal',
      text_decoration: 'none',
      text_color: '#000000',
      greeting: 'بعد التحيـــــة والســــلام ،،،',
      show_stamp: true,
      show_signature: true,
      show_qr: true,
      ...letterItem
    });
    setActiveTab('letter_designer');
    if (showLetterModal) setShowLetterModal(false);
  };

  // Print Letter function using isolated Iframe printer to prevent blank pages
  const handlePrintOfficialLetter = () => {
    const el = document.getElementById('official-letter-to-print');
    if (el) {
      printDocumentInIframe(el.outerHTML, `رسالة_رسمية_${previewLetter?.code_no || 'صادر'}`);
    } else {
      window.print();
    }
  };

  // Filtered Outgoing List
  const filteredOutgoing = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return outgoingList.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;
      return (
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.recipient && item.recipient.toLowerCase().includes(term)) ||
        (item.reference && item.reference.toLowerCase().includes(term)) ||
        (item.code_no && item.code_no.toLowerCase().includes(term)) ||
        (item.record_number && String(item.record_number).includes(term))
      );
    });
  }, [outgoingList, searchTerm, statusFilter]);

  // Filtered Incoming List
  const filteredIncoming = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return incomingList.filter(item => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;
      return (
        (item.subject && item.subject.toLowerCase().includes(term)) ||
        (item.source_entity && item.source_entity.toLowerCase().includes(term)) ||
        (item.incoming_reference && item.incoming_reference.toLowerCase().includes(term)) ||
        (item.linked_reference && item.linked_reference.toLowerCase().includes(term))
      );
    });
  }, [incomingList, searchTerm, statusFilter]);

  return (
    <div className="mail-section-container">
      {/* Top Banner & Sub-Tabs Navigation */}
      <div className="mail-header-tabs-bar">
        <div className="mail-title-badge-area">
          <div className="mail-gold-indicator" />
          <div className="mail-title-group">
            <h1>إدارة البريد والمراسلات الرسمية</h1>
            <span>مديرية أمن أوباري | التوثيق الرقمي للصادر والوارد وتصميم الرسائل الرسمية المعتمدة</span>
          </div>
        </div>

        <div className="mail-nav-tabs">
          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'outgoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('outgoing')}
          >
            <Send size={16} />
            <span>سجل البريد الصادر</span>
            <span className="tab-count-pill">{outgoingList.length}</span>
          </button>

          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            <Inbox size={16} />
            <span>سجل البريد الوارد</span>
            <span className="tab-count-pill">{incomingList.length}</span>
          </button>

          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'letter_designer' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('letter_designer');
              if (outgoingList.length > 0) setPreviewLetter(outgoingList[0]);
            }}
          >
            <FileText size={16} />
            <span>محرر ومصمم الرسائل الرسمية</span>
          </button>

          <button
            type="button"
            className={`mail-tab-btn ${activeTab === 'referred' ? 'active' : ''}`}
            onClick={() => setActiveTab('referred')}
          >
            <Share2 size={16} />
            <span>البريد المحال وتأشيرات مدير الأمن</span>
            <span className="tab-count-pill">{referredList.length}</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notificationMsg && (
        <div className="moi-success-notification">
          <CheckCircle2 size={18} color="#16a34a" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OUTGOING MAIL TAB (Exact match to Image 1)                            */}
      {/* ========================================================================= */}
      {activeTab === 'outgoing' && (
        <div className="mail-tab-content-wrapper">
          {/* Outgoing Form Card matching Image 1 */}
          <div className="mail-official-card">
            {/* Header row with title and print all button */}
            <div className="mail-card-header-row">
              <div className="mail-section-title-with-bar">
                <span className="orange-vertical-bar" />
                <div className="section-title-text">
                  <h3>سجل البريد الصادر</h3>
                  <div className="official-feather-badge">📯</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-print-full-register"
                onClick={() => {
                  setRegisterPrintType('outgoing');
                  setShowRegisterPrintModal(true);
                }}
              >
                <Printer size={15} />
                <span>طباعة كل السجل الصادر</span>
              </button>
            </div>

            {/* Form matching Image 1 grid */}
            <form onSubmit={handleSaveOutgoing} className="official-mail-form">
              {/* Row 1: Code No, رقم القيد, الرقم الإشاري, رد على */}
              <div className="form-fields-grid-4">
                {/* 1. Code No */}
                <div className="mail-input-group">
                  <label>الكود (Code No):</label>
                  <input
                    type="text"
                    className="mail-input input-blue-border"
                    placeholder="مثال: 001-2026"
                    value={outgoingForm.code_no}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, code_no: e.target.value })}
                    required
                  />
                </div>

                {/* 2. رقم القيد */}
                <div className="mail-input-group">
                  <label>رقم القيد:</label>
                  <input
                    type="text"
                    className="mail-input input-red-border"
                    placeholder="مثال: 150"
                    value={outgoingForm.record_number}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, record_number: e.target.value })}
                    required
                  />
                </div>

                {/* 3. الرقم الإشاري */}
                <div className="mail-input-group">
                  <label>الرقم الإشاري:</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="مثال: 12/2026"
                    value={outgoingForm.reference}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, reference: e.target.value })}
                    required
                  />
                </div>

                {/* 4. رد على (إشاري الوارد) */}
                <div className="mail-input-group">
                  <label>رد على (إشاري الوارد):</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="اختياري: يُترك فارغاً إن لم يكن رداً..."
                    value={outgoingForm.reply_to_reference}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, reply_to_reference: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: الجهة الموجه إليها, الموافق (التاريخ) */}
              <div className="form-fields-grid-2" style={{ marginTop: '16px' }}>
                {/* الجهة الموجه إليها مع بحث ذكي */}
                <div className="mail-input-group position-relative">
                  <label>الجهة الموجه إليها:</label>
                  <input
                    type="text"
                    className="mail-input input-smart-search"
                    placeholder="الجهة الموجه إليها (بحث ذكي...)"
                    value={outgoingForm.recipient}
                    onChange={(e) => {
                      setOutgoingForm({ ...outgoingForm, recipient: e.target.value });
                      setShowRecipientSuggestions(true);
                    }}
                    onFocus={() => setShowRecipientSuggestions(true)}
                    required
                  />
                  {showRecipientSuggestions && (
                    <div className="smart-entity-suggestions">
                      <div className="suggestions-header">الجهات الأمنية والقيادية المقترحة:</div>
                      {ENTITY_SUGGESTIONS.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-row"
                          onClick={() => {
                            setOutgoingForm({ ...outgoingForm, recipient: item });
                            setShowRecipientSuggestions(false);
                          }}
                        >
                          <Building2 size={13} color="#1e3a8a" />
                          <span>{item}</span>
                        </div>
                      ))}
                      <div className="suggestions-footer" onClick={() => setShowRecipientSuggestions(false)}>إغلاق القائمة ✕</div>
                    </div>
                  )}
                </div>

                {/* الموافق (التاريخ) */}
                <div className="mail-input-group">
                  <label>الموافق (التاريخ):</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي"
                      value={outgoingForm.date}
                      onChange={(e) => setOutgoingForm({ ...outgoingForm, date: e.target.value })}
                      required
                    />
                    <Calendar size={16} className="date-icon-inside" />
                  </div>
                </div>
              </div>

              {/* Row 3: بخصوص (الموضوع) */}
              <div className="mail-input-group" style={{ marginTop: '16px' }}>
                <label>بخصوص (الموضوع):</label>
                <input
                  type="text"
                  className="mail-input mail-subject-input"
                  placeholder="اكتب الموضوع بدقة..."
                  value={outgoingForm.subject}
                  onChange={(e) => setOutgoingForm({ ...outgoingForm, subject: e.target.value })}
                  required
                />
              </div>

              {/* Row 4: طريقة الإرسال, الموظف المرسل, حالة التسليم, اختيار ملف */}
              <div className="form-fields-grid-4" style={{ marginTop: '16px', alignItems: 'flex-end' }}>
                {/* طريقة الإرسال */}
                <div className="mail-input-group">
                  <label>طريقة الإرسال:</label>
                  <select
                    className="mail-select"
                    value={outgoingForm.delivery_method}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, delivery_method: e.target.value })}
                  >
                    <option value="إلكتروني (منظومة/إيميل)">إلكتروني (منظومة/إيميل)</option>
                    <option value="يدوي / ورقي">يدوي / ورقي بموجب كشف</option>
                    <option value="بريد رسمي مسجل">بريد رسمي مسجل</option>
                    <option value="برقية لاسلكية / فاكس">برقية لاسلكية / فاكس</option>
                  </select>
                </div>

                {/* الموظف المرسل */}
                <div className="mail-input-group">
                  <label>الموظف المرسل:</label>
                  <ForceNameAutocomplete
                    value={outgoingForm.sender_employee}
                    onChange={(val) => setOutgoingForm({ ...outgoingForm, sender_employee: val })}
                    onSelect={(m) => setOutgoingForm({ ...outgoingForm, sender_employee: m.name })}
                    forceMembers={forceMembers}
                    placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                    required
                  />
                </div>

                {/* حالة التسليم */}
                <div className="mail-input-group">
                  <label>حالة التسليم:</label>
                  <select
                    className="mail-select status-select-green"
                    value={outgoingForm.status}
                    onChange={(e) => setOutgoingForm({ ...outgoingForm, status: e.target.value })}
                  >
                    <option value="delivered">✅ تم التسليم (مغلق)</option>
                    <option value="pending">⏳ قيد الإرسال والمتابعة</option>
                    <option value="action_required">⚡ محال لاتخاذ إجراء</option>
                  </select>
                </div>

                {/* اختيار ملف */}
                <div className="mail-input-group">
                  <label>المرفقات والملفات:</label>
                  <div className="file-attachment-box">
                    <label className="btn-choose-file">
                      <span>اختيار ملف</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setOutgoingForm({ ...outgoingForm, attachment_name: e.target.files[0].name });
                          }
                        }}
                      />
                    </label>
                    <span className="file-chosen-status">
                      {outgoingForm.attachment_name || 'لم يتم اختيار أي ملف'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="mail-form-submit-row" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn-save-record">
                  <Send size={16} />
                  <span>حفظ وتقييد السجل</span>
                </button>

                <button
                  type="button"
                  className="btn-create-official-letter"
                  onClick={() => {
                    const tempLetter = {
                      ...outgoingForm,
                      id: Date.now(),
                      recipient_title: outgoingForm.recipient.startsWith('إلى') ? outgoingForm.recipient : `إلى السيد / ${outgoingForm.recipient || 'آمر المنطقة العسكرية الجنوبية'}`,
                      editor_employee: outgoingForm.sender_employee || 'عبدالصمد',
                      print_employee: outgoingForm.sender_employee || 'عبدالصمد',
                      signer_name: 'لواء / موسى سعد محمد',
                      signer_title: 'مدير مديرية أمن أوباري',
                      letter_body: outgoingForm.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.',
                      cc_list: [
                        'السيد / وكيل وزارة الداخلية',
                        'معالي / وزير الداخلية',
                        'آمر المنطقة العسكرية الجنوبية',
                        'المساعد للشؤون الأمنية',
                        'الغرفة الأمنية المشتركة',
                        'الإدارة العامة للتفتيش والمتابعة'
                      ],
                      phone: '0915938137',
                      email: 'Info@ubari-security.ly'
                    };
                    handleOpenLetterPreview(tempLetter);
                  }}
                >
                  <FileText size={16} />
                  <span>معاينة وطباعة الرسالة الرسمية الصادرة (النموذج المعتمد)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Outgoing Mail Registry Table */}
          <div className="mail-table-card">
            <div className="mail-table-header-bar">
              <div className="table-title-area">
                <h4>جدول قيود البريد الصادر المعتمد ({filteredOutgoing.length})</h4>
                <span>سجل المراسلات الصادرة عن مديرية أمن أوباري</span>
              </div>

              <div className="table-search-filters">
                <div className="search-input-wrapper">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="بحث برقم القيد، الإشاري، الجهة، أو الموضوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select-mini"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">كافة الحالات</option>
                  <option value="delivered">تم التسليم (مغلق)</option>
                  <option value="pending">قيد الإرسال</option>
                </select>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="mail-official-table">
                <thead>
                  <tr>
                    <th>الكود</th>
                    <th>رقم القيد</th>
                    <th>الرقم الإشاري</th>
                    <th>الجهة الموجه إليها</th>
                    <th>الموضوع</th>
                    <th>الموافق</th>
                    <th>طريقة الإرسال</th>
                    <th>المحرر</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOutgoing.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code-badge-blue">{item.code_no}</span>
                      </td>
                      <td>
                        <span className="record-badge-red">{item.record_number}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#0a192f' }}>{item.reference}</td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.recipient}</td>
                      <td className="subject-cell" title={item.subject}>{item.subject}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className="method-pill">{item.delivery_method}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.sender_employee || 'عبدالصمد'}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'delivered' ? 'active' : 'suspended'}`}>
                          {item.status === 'delivered' ? 'تم التسليم (مغلق)' : 'قيد المتابعة'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            className="btn-action-preview"
                            title="معاينة وطباعة الرسالة الرسمية"
                            onClick={() => handleOpenLetterPreview(item)}
                          >
                            <Printer size={13} />
                            <span>الرسالة</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-edit"
                            title="تحرير وتصميم الرسالة"
                            onClick={() => handleOpenInDesigner(item)}
                          >
                            <Edit size={13} />
                            <span>تصميم</span>
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            title="حذف القيد"
                            onClick={() => handleDeleteOutgoing(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOutgoing.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        لا توجد سجلات بريد صادر مطابقة لمعايير البحث الحالية
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. INCOMING MAIL TAB (Exact match to Image 2)                            */}
      {/* ========================================================================= */}
      {activeTab === 'incoming' && (
        <div className="mail-tab-content-wrapper">
          {/* Incoming Form Card matching Image 2 */}
          <div className="mail-official-card">
            {/* Header row with title and print all button */}
            <div className="mail-card-header-row">
              <div className="mail-section-title-with-bar">
                <span className="orange-vertical-bar" />
                <div className="section-title-text">
                  <h3>سجل البريد الوارد</h3>
                  <div className="official-feather-badge">📥</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-print-full-register"
                onClick={() => {
                  setRegisterPrintType('incoming');
                  setShowRegisterPrintModal(true);
                }}
              >
                <Printer size={15} />
                <span>طباعة كل السجل الوارد</span>
              </button>
            </div>

            {/* Form matching Image 2 grid */}
            <form onSubmit={handleSaveIncoming} className="official-mail-form">
              {/* Row 1: رقم إشاري, الرقم الإشاري للرسالة المرتبطة (للردود), الجهة الوارد منها, التاريخ / الموافق */}
              <div className="form-fields-grid-4">
                {/* 1. رقم إشاري */}
                <div className="mail-input-group">
                  <label>رقم إشاري:</label>
                  <input
                    type="text"
                    className="mail-input input-blue-border"
                    placeholder="أدخل الرقم..."
                    value={incomingForm.incoming_reference}
                    onChange={(e) => setIncomingForm({ ...incomingForm, incoming_reference: e.target.value })}
                    required
                  />
                </div>

                {/* 2. الرقم الإشاري للرسالة المرتبطة (للردود) */}
                <div className="mail-input-group">
                  <label>الرقم الإشاري للرسالة المرتبطة (للردود):</label>
                  <input
                    type="text"
                    className="mail-input"
                    placeholder="الرقم الإشاري للرسالة المرتبطة (للردود)"
                    value={incomingForm.linked_reference}
                    onChange={(e) => setIncomingForm({ ...incomingForm, linked_reference: e.target.value })}
                  />
                </div>

                {/* 3. الجهة الوارد منها (بحث ذكي...) */}
                <div className="mail-input-group position-relative">
                  <label>الجهة الوارد منها (بحث ذكي...):</label>
                  <input
                    type="text"
                    className="mail-input input-smart-search input-blue-border"
                    placeholder="الجهة الوارد منها (بحث ذكي...)"
                    value={incomingForm.source_entity}
                    onChange={(e) => {
                      setIncomingForm({ ...incomingForm, source_entity: e.target.value });
                      setShowSourceSuggestions(true);
                    }}
                    onFocus={() => setShowSourceSuggestions(true)}
                    required
                  />
                  {showSourceSuggestions && (
                    <div className="smart-entity-suggestions">
                      <div className="suggestions-header">الجهات الرسمية المقترحة:</div>
                      {ENTITY_SUGGESTIONS.map((item, idx) => (
                        <div
                          key={idx}
                          className="suggestion-row"
                          onClick={() => {
                            setIncomingForm({ ...incomingForm, source_entity: item.replace('إلى السيد / ', '').replace('إلى ', '') });
                            setShowSourceSuggestions(false);
                          }}
                        >
                          <Building2 size={13} color="#1e3a8a" />
                          <span>{item.replace('إلى السيد / ', '').replace('إلى ', '')}</span>
                        </div>
                      ))}
                      <div className="suggestions-footer" onClick={() => setShowSourceSuggestions(false)}>إغلاق القائمة ✕</div>
                    </div>
                  )}
                </div>

                {/* 4. التاريخ / الموافق */}
                <div className="mail-input-group">
                  <label>الموافق (التاريخ):</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي"
                      value={incomingForm.date}
                      onChange={(e) => setIncomingForm({ ...incomingForm, date: e.target.value })}
                      required
                    />
                    <Calendar size={16} className="date-icon-inside" />
                  </div>
                </div>
              </div>

              {/* Row 2: الموضوع */}
              <div className="mail-input-group" style={{ marginTop: '16px' }}>
                <label>الموضوع:</label>
                <input
                  type="text"
                  className="mail-input mail-subject-input"
                  placeholder="الموضوع"
                  value={incomingForm.subject}
                  onChange={(e) => setIncomingForm({ ...incomingForm, subject: e.target.value })}
                  required
                />
              </div>

              {/* Row 3: طريقة الاستلام, اسم الموظف المستلم, التاريخ والوقت, حالة الإجراء */}
              <div className="form-fields-grid-4" style={{ marginTop: '16px', alignItems: 'flex-end' }}>
                {/* طريقة الاستلام */}
                <div className="mail-input-group">
                  <label>طريقة الاستلام:</label>
                  <select
                    className="mail-select"
                    value={incomingForm.receive_method}
                    onChange={(e) => setIncomingForm({ ...incomingForm, receive_method: e.target.value })}
                  >
                    <option value="مناولة باليد (مراسل)">مناولة باليد (مراسل)</option>
                    <option value="بريد إلكتروني رسمي">بريد إلكتروني رسمي</option>
                    <option value="برقية لاسلكية / فاكس">برقية لاسلكية / فاكس</option>
                    <option value="بريد رسمي مسجل">بريد رسمي مسجل</option>
                  </select>
                </div>

                {/* اسم الموظف المستلم */}
                <div className="mail-input-group">
                  <label>اسم الموظف المستلم:</label>
                  <ForceNameAutocomplete
                    value={incomingForm.receiver_employee}
                    onChange={(val) => setIncomingForm({ ...incomingForm, receiver_employee: val })}
                    onSelect={(m) => setIncomingForm({ ...incomingForm, receiver_employee: m.name })}
                    forceMembers={forceMembers}
                    placeholder="اكتب أول حرف لعرض الأسماء المطابقة..."
                    required
                  />
                </div>

                {/* التاريخ والوقت */}
                <div className="mail-input-group">
                  <label>التاريخ والوقت:</label>
                  <div className="date-input-wrap">
                    <input
                      type="text"
                      className="mail-input"
                      placeholder="فنس/رهش/موي --:--"
                      value={`${incomingForm.date} ${incomingForm.time}`}
                      onChange={(e) => {
                        const parts = e.target.value.split(' ');
                        setIncomingForm({ ...incomingForm, date: parts[0] || incomingForm.date, time: parts[1] || incomingForm.time });
                      }}
                    />
                    <Clock size={16} className="date-icon-inside" />
                  </div>
                </div>

                {/* حالة الإجراء */}
                <div className="mail-input-group">
                  <label>حالة الإجراء:</label>
                  <select
                    className="mail-select status-select-amber"
                    value={incomingForm.status}
                    onChange={(e) => setIncomingForm({ ...incomingForm, status: e.target.value })}
                  >
                    <option value="in_progress">⏳ تحت الإجراء</option>
                    <option value="replied">✅ تم الرد والمتابعة</option>
                    <option value="referred">↗️ محال لسيادة اللواء</option>
                    <option value="archived">📁 محفوظ بالأرشيف</option>
                  </select>
                </div>
              </div>

              {/* Row 4: المرفقات */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                <div className="file-attachment-box" style={{ maxWidth: '380px' }}>
                  <label className="btn-choose-file">
                    <span>اختيار ملف</span>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setIncomingForm({ ...incomingForm, attachment_name: e.target.files[0].name });
                        }
                      }}
                    />
                  </label>
                  <span className="file-chosen-status">
                    {incomingForm.attachment_name || 'لم يتم اختيار أي ملف'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mail-form-submit-row" style={{ marginTop: '22px' }}>
                <button type="submit" className="btn-save-record">
                  <Inbox size={16} />
                  <span>حفظ وتقييد</span>
                </button>
              </div>
            </form>
          </div>

          {/* Incoming Mail Registry Table */}
          <div className="mail-table-card">
            <div className="mail-table-header-bar">
              <div className="table-title-area">
                <h4>جدول قيود البريد الوارد المعتمد ({filteredIncoming.length})</h4>
                <span>سجل المراسلات الواردة إلى مديرية أمن أوباري</span>
              </div>

              <div className="table-search-filters">
                <div className="search-input-wrapper">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="بحث برقم الإشاري، الجهة، أو الموضوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="mail-official-table">
                <thead>
                  <tr>
                    <th>الرقم الإشاري</th>
                    <th>الرسالة المرتبطة</th>
                    <th>الجهة الوارد منها</th>
                    <th>الموضوع</th>
                    <th>تاريخ الاستلام</th>
                    <th>طريقة الاستلام</th>
                    <th>المستلم</th>
                    <th>حالة الإجراء</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncoming.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="code-badge-blue">{item.incoming_reference}</span>
                      </td>
                      <td style={{ color: item.linked_reference ? '#1e3a8a' : '#94a3b8' }}>
                        {item.linked_reference || '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a' }}>{item.source_entity}</td>
                      <td className="subject-cell" title={item.subject}>{item.subject}</td>
                      <td>{item.date} {item.time}</td>
                      <td>
                        <span className="method-pill">{item.receive_method}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.receiver_employee || 'عبدالصمد'}</td>
                      <td>
                        <span className={`status-pill ${item.status === 'replied' ? 'active' : 'suspended'}`}>
                          {item.status === 'replied' ? 'تم الرد' : 'تحت الإجراء'}
                        </span>
                      </td>
                      <td>
                        <div className="table-action-buttons">
                          <button
                            type="button"
                            className="btn-action-preview"
                            title="معاينة تفاصيل البريد الوارد"
                            onClick={() => handlePreviewIncoming(item)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #1e3a8a', background: '#eff6ff', color: '#1e3a8a', cursor: 'pointer' }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-print"
                            title="طباعة إفادة قيد بريد وارد رسمي"
                            onClick={() => handlePrintIncoming(item)}
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #16a34a', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-delete"
                            title="حذف القيد"
                            onClick={() => handleDeleteIncoming(item.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredIncoming.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        لا توجد سجلات بريد وارد مطابقة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5 REFERRED MAIL & DIRECTOR ENDORSEMENTS TAB                              */}
      {/* ========================================================================= */}
      {activeTab === 'referred' && (
        <div className="mail-tab-content-wrapper">
          <div className="mail-table-card">
            <div className="mail-table-header-bar">
              <div className="table-header-title">
                <Share2 size={18} color="#1e3a8a" />
                <h3>سجل البريد المُحال وتأشيرات مدير الأمن</h3>
                <span className="table-records-count">({referredList.length} مراسلة محالة)</span>
              </div>
            </div>

            <div className="table-responsive-wrapper">
              <table className="moi-official-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ر.م</th>
                    <th style={{ width: '100px' }}>رقم الكتاب</th>
                    <th>الموضوع</th>
                    <th style={{ width: '150px' }}>الجهة المحال إليها</th>
                    <th style={{ width: '130px' }}>تاريخ الإحالة</th>
                    <th>تأشيرة وتوجيه مدير الأمن</th>
                    <th style={{ width: '120px' }}>الحالة</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {referredList.map((item, idx) => (
                    <tr key={item.ReferralID || idx}>
                      <td style={{ color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontWeight: 800, color: '#1e3a8a', fontFamily: 'monospace' }}>
                        {item.MailNumber || 'بدون رقم'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#0a192f', maxWidth: '300px' }}>
                        {item.Subject || 'بدون موضوع'}
                      </td>
                      <td style={{ fontWeight: 800, color: '#2563eb' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={14} /> {item.TargetDept}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '12px' }}>
                        {item.ReferralDate ? item.ReferralDate.slice(0, 10) : '---'}
                      </td>
                      <td style={{ color: '#b45309', fontWeight: 800, background: '#fffbeb', borderRadius: '6px' }}>
                        ✍️ {item.DirectorNotes || 'للإجراء'}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: '#fef3c7',
                          color: '#b45309'
                        }}>
                          {item.Status || 'تحت الإجراء'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date().toLocaleDateString('ar-LY', { year: 'numeric', month: 'long', day: 'numeric' });
                            const html = `
                              <div style="font-family: 'Cairo', sans-serif; direction: rtl; padding: 25px; color: #0a192f;">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
                                  <div style="text-align: right;">
                                    <h3 style="margin: 0; font-size: 15px; font-weight: 800;">دولة ليبيا - وزارة الداخلية</h3>
                                    <h2 style="margin: 3px 0; font-size: 18px; font-weight: 900; color: #1e3a8a;">مديرية أمن أوباري</h2>
                                    <h4 style="margin: 0; font-size: 13px; color: #475569;">مكتب مدير الأمن | قسم الإحالات والمتابعة</h4>
                                  </div>
                                  <div style="text-align: center;">
                                    <div style="font-size: 22px; font-weight: 900; color: #1e3a8a;">بطاقة إحالة بريد وتأشيرة قيادية</div>
                                    <div style="font-size: 13px; color: #64748b; margin-top: 4px;">إحالة رسمية عاجلة</div>
                                  </div>
                                  <div style="text-align: left; font-size: 13px;">
                                    <div><strong>رقم الإحالة:</strong> REF-UBR-${item.ReferralID}</div>
                                    <div><strong>تاريخ الطباعة:</strong> ${today}</div>
                                  </div>
                                </div>

                                <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin-bottom: 25px; font-size: 14px; line-height: 2;">
                                  <div><strong>رقم الكتاب الأصلي:</strong> ${item.MailNumber || 'بدون رقم'}</div>
                                  <div><strong>الموضوع:</strong> ${item.Subject || '---'}</div>
                                  <div><strong>المحال إليه:</strong> <span style="font-weight: 800; color: #1e3a8a;">${item.TargetDept}</span></div>
                                  <div><strong>تاريخ الإحالة:</strong> ${item.ReferralDate ? item.ReferralDate.slice(0, 10) : '---'}</div>
                                  <div><strong>حالة الإجراء:</strong> ${item.Status || 'تحت الإجراء'}</div>
                                </div>

                                <div style="background: #fffbeb; border: 2px dashed #d97706; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
                                  <h4 style="margin: 0 0 10px; color: #b45309; font-size: 16px;">تأشيرة وتوجيهات السيد مدير أمن أوباري:</h4>
                                  <div style="font-size: 18px; font-weight: 900; color: #0a192f; line-height: 1.8;">
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
                          }}
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
                          <Printer size={13} /> طباعة
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICIAL LETTER DESIGNER & PREVIEW TAB (Full Rich Text & Typography)    */}
      {/* ========================================================================= */}
      {activeTab === 'letter_designer' && (
        <div className="letter-designer-view-wrapper">
          {/* Top Designer Toolbar */}
          <div className="designer-top-toolbar">
            <div className="designer-toolbar-info">
              <FileCheck size={20} color="#1e3a8a" />
              <div>
                <h4>محرر ومصمم الرسائل الرسمية المعتمدة</h4>
                <span>تحكم كامل في نصوص الرسالة، نوع الخط، الصياغة، الترويسة، التوقيع وجهات التوزيع</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Select Letter to Edit */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>الرسالة الحالية:</label>
                <select
                  className="toolbar-select"
                  value={previewLetter?.id || ''}
                  onChange={(e) => {
                    const selected = outgoingList.find(o => o.id === Number(e.target.value));
                    if (selected) {
                      setPreviewLetter({
                        font_family: "'Cairo', sans-serif",
                        font_size: '16px',
                        line_height: '1.9',
                        text_align: 'right',
                        font_weight: 'normal',
                        font_style: 'normal',
                        text_decoration: 'none',
                        text_color: '#000000',
                        greeting: 'بعد التحيـــــة والســــلام ،،،',
                        show_stamp: true,
                        show_signature: true,
                        show_qr: true,
                        ...selected
                      });
                    }
                  }}
                  style={{ minWidth: '170px' }}
                >
                  {outgoingList.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.reference ? `إشاري: ${item.reference}` : item.code_no} - {item.recipient}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="designer-mode-switch">
                <button
                  type="button"
                  className={`btn-mode-toggle ${designerEditorViewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setDesignerEditorViewMode('split')}
                  title="تحرير ومعاينة جنباً إلى جنب"
                >
                  <Eye size={14} />
                  <span>شاشة مزدوجة</span>
                </button>
                <button
                  type="button"
                  className={`btn-mode-toggle ${designerEditorViewMode === 'editor' ? 'active' : ''}`}
                  onClick={() => setDesignerEditorViewMode('editor')}
                  title="محرر كامل للنصوص والبيانات"
                >
                  <Edit size={14} />
                  <span>محرر النصوص</span>
                </button>
                <button
                  type="button"
                  className={`btn-mode-toggle ${designerEditorViewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setDesignerEditorViewMode('preview')}
                  title="معاينة الورقة الرسمية A4 للطباعة"
                >
                  <FileText size={14} />
                  <span>معاينة A4</span>
                </button>
              </div>

              {/* Action Buttons: Save & Print */}
              <div className="designer-actions" style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-save-doc-edits"
                  onClick={handleSaveLetterEdits}
                  title="حفظ كافة التعديلات في سجل البريد الصادر والذاكرة"
                >
                  <Save size={15} />
                  <span>حفظ التعديلات في السجل</span>
                </button>

                <button
                  type="button"
                  className="btn-toolbar-print"
                  onClick={handlePrintOfficialLetter}
                  title="طباعة الرسالة الرسمية ورقياً أو تصديرها كـ PDF"
                >
                  <Printer size={15} />
                  <span>طباعة الرسالة الرسمية (A4)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Body Layout: Split, Editor or Preview */}
          <div className={`letter-modal-body-wrapper ${designerEditorViewMode}`}>
            {/* 1. Left/Main Pane: The Rich Editor Panel */}
            {(designerEditorViewMode === 'split' || designerEditorViewMode === 'editor') && (
              <div className="full-document-editor-panel">
                {/* Subtabs bar */}
                <div className="editor-subtabs-bar">
                  <button
                    type="button"
                    className={`subtab-btn ${activeDesignerSubtab === 'body' ? 'active' : ''}`}
                    onClick={() => setActiveDesignerSubtab('body')}
                  >
                    <Type size={15} />
                    <span>نص الرسالة والتنسيق ونوع الخط</span>
                  </button>
                  <button
                    type="button"
                    className={`subtab-btn ${activeDesignerSubtab === 'meta' ? 'active' : ''}`}
                    onClick={() => setActiveDesignerSubtab('meta')}
                  >
                    <Building2 size={15} />
                    <span>الترويسة والمرجع والمخاطب</span>
                  </button>
                  <button
                    type="button"
                    className={`subtab-btn ${activeDesignerSubtab === 'signature_cc' ? 'active' : ''}`}
                    onClick={() => setActiveDesignerSubtab('signature_cc')}
                  >
                    <Shield size={15} />
                    <span>التوقيع والختم وجهات التوزيع (CC)</span>
                  </button>
                </div>

                <div className="editor-tab-pane">
                  {/* SUBTAB 1: BODY & TYPOGRAPHY */}
                  {activeDesignerSubtab === 'body' && (
                    <div>
                      {/* Rich Typography Toolbar */}
                      <div className="rich-editor-toolbar">
                        {/* Text Style: Bold, Italic, Underline */}
                        <div className="toolbar-group">
                          <button
                            type="button"
                            className={`btn-format ${(previewLetter.font_weight === 'bold' || previewLetter.font_weight === '800') ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({
                              ...prev,
                              font_weight: (prev.font_weight === 'bold' || prev.font_weight === '800') ? 'normal' : 'bold'
                            }))}
                            title="خط عريض (Bold)"
                          >
                            <Bold size={15} />
                          </button>
                          <button
                            type="button"
                            className={`btn-format ${previewLetter.font_style === 'italic' ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({
                              ...prev,
                              font_style: prev.font_style === 'italic' ? 'normal' : 'italic'
                            }))}
                            title="خط مائل (Italic)"
                          >
                            <Italic size={15} />
                          </button>
                          <button
                            type="button"
                            className={`btn-format ${previewLetter.text_decoration === 'underline' ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({
                              ...prev,
                              text_decoration: prev.text_decoration === 'underline' ? 'none' : 'underline'
                            }))}
                            title="تسطير تحته خط (Underline)"
                          >
                            <Underline size={15} />
                          </button>
                        </div>

                        {/* Alignment: Right, Center, Justify */}
                        <div className="toolbar-group">
                          <button
                            type="button"
                            className={`btn-format ${(previewLetter.text_align === 'right' || !previewLetter.text_align) ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({ ...prev, text_align: 'right' }))}
                            title="محاذاة لليمين"
                          >
                            <AlignRight size={15} />
                          </button>
                          <button
                            type="button"
                            className={`btn-format ${previewLetter.text_align === 'center' ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({ ...prev, text_align: 'center' }))}
                            title="محاذاة في الوسط"
                          >
                            <AlignCenter size={15} />
                          </button>
                          <button
                            type="button"
                            className={`btn-format ${previewLetter.text_align === 'justify' ? 'active' : ''}`}
                            onClick={() => setPreviewLetter(prev => ({ ...prev, text_align: 'justify' }))}
                            title="ضبط الكشيدة (Justify)"
                          >
                            <AlignJustify size={15} />
                          </button>
                        </div>

                        {/* Font Family Selector */}
                        <div className="toolbar-group">
                          <label className="toolbar-lbl">نوع الخط:</label>
                          <select
                            className="toolbar-select font-family-select"
                            value={previewLetter.font_family || "'Cairo', sans-serif"}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, font_family: e.target.value }))}
                            style={{ minWidth: '145px', fontWeight: 'bold' }}
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

                        {/* Font Size Selector */}
                        <div className="toolbar-group">
                          <label className="toolbar-lbl">حجم الخط:</label>
                          <select
                            className="toolbar-select"
                            value={previewLetter.font_size || '16px'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, font_size: e.target.value }))}
                          >
                            <option value="14px">14px (صغير)</option>
                            <option value="16px">16px (قياسي رسمي)</option>
                            <option value="17px">17px (متوسط واضح)</option>
                            <option value="18px">18px (متوسط)</option>
                            <option value="20px">20px (كبير)</option>
                            <option value="22px">22px (عريض جداً)</option>
                          </select>
                        </div>

                        {/* Line Height Selector */}
                        <div className="toolbar-group">
                          <label className="toolbar-lbl">تباعد الأسطر:</label>
                          <select
                            className="toolbar-select"
                            value={previewLetter.line_height || '1.9'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, line_height: e.target.value }))}
                          >
                            <option value="1.6">1.6 (متقارب)</option>
                            <option value="1.8">1.8 (متوسط)</option>
                            <option value="1.9">1.9 (رسمي معتمد)</option>
                            <option value="2.1">2.1 (متباعد وواضح)</option>
                            <option value="2.4">2.4 (عريض التباعد)</option>
                          </select>
                        </div>

                        {/* Text Color Selector */}
                        <div className="toolbar-group">
                          <label className="toolbar-lbl">اللون:</label>
                          <select
                            className="toolbar-select"
                            value={previewLetter.text_color || '#000000'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, text_color: e.target.value }))}
                          >
                            <option value="#000000">أسود داكن (#000000)</option>
                            <option value="#0a192f">كحلي سيادي (#0a192f)</option>
                            <option value="#1e3a8a">أزرق ملكي (#1e3a8a)</option>
                            <option value="#1e293b">رمادي غامق (#1e293b)</option>
                          </select>
                        </div>
                      </div>

                      {/* Salutation (التحية الرسمية) */}
                      <div className="editor-input-group" style={{ marginBottom: '10px' }}>
                        <label className="editor-control-lbl">التحية والافتتاحية الرسمية:</label>
                        <input
                          type="text"
                          className="editor-text-input"
                          value={previewLetter.greeting !== undefined ? previewLetter.greeting : 'بعد التحيـــــة والســــلام ،،،'}
                          onChange={(e) => setPreviewLetter(prev => ({ ...prev, greeting: e.target.value }))}
                          placeholder="مثال: بعد التحيـــــة والســــلام ،،،"
                        />
                      </div>

                      {/* Quick Official Phrases Chips */}
                      <div className="quick-phrases-bar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                          <Sparkles size={14} color="#1d4ed8" />
                          <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1e40af' }}>
                            صيغ رسمية جاهزة للرسائل والمراسلات (انقر للإدراج السريع):
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoLetterBody('إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.')}
                          >
                            + من حيث الاختصاص واتخاذ اللازم
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoLetterBody('يرجى التكرم بالإيعاز للمختصين طرفكم بموافاتنا بتقرير أمني مفصل وعاجل بالخصوص.')}
                          >
                            + الإيعاز بالموافاة بتقرير مفصل
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoLetterBody('نحيل إليكم طيه الأوراق والمحاضر المتعلقة بالموضوع المذكور أعلاه للتفضل بالاطلاع والإجراء.')}
                          >
                            + نحيل إليكم طيه الأوراق والمحاضر
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoLetterBody('بناءً على تعليمات وتوجيهات السيد اللواء مدير مديرية أمن أوباري بالخصوص.')}
                          >
                            + بناءً على تعليمات السيد اللواء مدير الأمن
                          </button>
                          <button
                            type="button"
                            className="phrase-chip"
                            onClick={() => insertPhraseIntoLetterBody('شاكرين لكم حسن تعاونكم الدائم معنا لما فيه خدمة الوطن والصالح الأمني العام.')}
                          >
                            + شاكرين حسن تعاونكم الدائم
                          </button>
                        </div>
                      </div>

                      {/* Main Letter Body Editor */}
                      <div className="editor-input-group">
                        <label className="editor-control-lbl">متن ونص الرسالة الرسمية:</label>
                        <textarea
                          rows={8}
                          className="rich-body-textarea"
                          style={{
                            fontFamily: previewLetter.font_family || "'Cairo', sans-serif",
                            fontSize: previewLetter.font_size || '16px',
                            lineHeight: previewLetter.line_height || '1.9',
                            textAlign: previewLetter.text_align || 'right',
                            fontWeight: previewLetter.font_weight || 'normal',
                            fontStyle: previewLetter.font_style || 'normal',
                            textDecoration: previewLetter.text_decoration || 'none',
                            color: previewLetter.text_color || '#000000'
                          }}
                          value={previewLetter.letter_body || ''}
                          onChange={(e) => setPreviewLetter(prev => ({ ...prev, letter_body: e.target.value }))}
                          placeholder="اكتب هنا نص الرسالة والتوجيهات الأمنية الرسمية..."
                        />
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 2: METADATA & RECIPIENT */}
                  {activeDesignerSubtab === 'meta' && (
                    <div>
                      <div className="grid-2-controls" style={{ marginBottom: '12px' }}>
                        <div>
                          <label className="editor-control-lbl">المخاطب الرئيسي (الجهة أو الشخص):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.recipient_title || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, recipient_title: e.target.value }))}
                            placeholder="إلى السيد / آمر المنطقة العسكرية الجنوبية"
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">الموضوع (بخصوص):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.subject || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="موضوع الرسالة"
                          />
                        </div>
                      </div>

                      <div className="grid-4-controls" style={{ marginBottom: '12px' }}>
                        <div>
                          <label className="editor-control-lbl">الرقم الإشاري:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.reference || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, reference: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">رقم القيد:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.record_number || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, record_number: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">التاريخ (الموافق):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.date || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">كود الرسالة (Code No):</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.code_no || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, code_no: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid-2-controls" style={{ marginBottom: '12px' }}>
                        <div>
                          <label className="editor-control-lbl">إشارة إلى مراسلتكم رقم:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.reply_to_reference || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, reply_to_reference: e.target.value }))}
                            placeholder="مثال: 1.2/2026"
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">بتاريخ:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.reply_date || ''}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, reply_date: e.target.value }))}
                            placeholder="مثال: 10/10/2026"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: SIGNER, STAMP & CC DISTRIBUTION LIST */}
                  {activeDesignerSubtab === 'signature_cc' && (
                    <div>
                      {/* Signer rank & name */}
                      <div className="grid-2-controls" style={{ marginBottom: '14px' }}>
                        <div>
                          <label className="editor-control-lbl">اسم المسؤول الموقّع:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.signer_name || 'لواء / موسى سعد محمد'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, signer_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">صفة ورتبة الموقّع:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.signer_title || 'مدير مديرية أمن أوباري'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, signer_title: e.target.value }))}
                          />
                        </div>
                      </div>

                      {/* Official Stamp & Signature Toggles */}
                      <div style={{ display: 'flex', gap: '20px', padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          <input
                            type="checkbox"
                            checked={previewLetter.show_stamp !== false}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, show_stamp: e.target.checked }))}
                          />
                          <span>إظهار ختم المديرية الرسمي</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          <input
                            type="checkbox"
                            checked={previewLetter.show_signature !== false}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, show_signature: e.target.checked }))}
                          />
                          <span>إظهار التوقيع الرسمي</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          <input
                            type="checkbox"
                            checked={previewLetter.show_qr !== false}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, show_qr: e.target.checked }))}
                          />
                          <span>إظهار باركود التحقق الأمني (QR)</span>
                        </label>
                      </div>

                      {/* Dynamic CC List Management */}
                      <div style={{ marginBottom: '16px' }}>
                        <label className="editor-control-lbl" style={{ marginBottom: '8px' }}>
                          جهات التوزيع والإحاطة (صورة منه إلى :-):
                        </label>
                        
                        {/* List of current CC entities */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          {(Array.isArray(previewLetter.cc_list) ? previewLetter.cc_list : []).map((ccItem, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#1e293b'
                              }}
                            >
                              <span>{ccItem}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCcItem(idx)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '0 2px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="حذف هذه الجهة"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Add New CC Entity Form */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="editor-text-input"
                            placeholder="أدخل اسم الجهة أو المسؤول (مثال: السيد / مدير إدارة البحث الجنائي)..."
                            value={newCcEntity}
                            onChange={(e) => setNewCcEntity(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCcItem();
                              }
                            }}
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={handleAddCcItem}
                            className="btn-toolbar-save"
                            style={{ padding: '7px 16px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
                          >
                            <Plus size={14} />
                            <span>إضافة جهة</span>
                          </button>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="grid-4-controls">
                        <div>
                          <label className="editor-control-lbl">المحرر:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.editor_employee || 'عبدالصمد'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, editor_employee: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">الطباعة:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.print_employee || 'عبدالصمد'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, print_employee: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">رقم الهاتف:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.phone || '0915938137'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="editor-control-lbl">البريد الإلكتروني:</label>
                          <input
                            type="text"
                            className="editor-text-input"
                            value={previewLetter.email || 'Info@ubari-security.ly'}
                            onChange={(e) => setPreviewLetter(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Right Pane: Official Letter Sheet Preview (Always in DOM for print) */}
            <div
              className={`letter-modal-preview-pane ${designerEditorViewMode === 'editor' ? 'hide-on-screen-only' : ''}`}
              style={{
                display: designerEditorViewMode === 'editor' ? 'none' : 'flex',
                justifyContent: 'center',
                overflowY: 'auto',
                background: '#cbd5e1',
                padding: '16px',
                borderRadius: '12px'
              }}
            >
              <OfficialLetterSheet letter={previewLetter} qrUrl={qrCodeDataUrl} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: PREVIEW & PRINT OFFICIAL LETTER (Image 3)                       */}
      {/* ========================================================================= */}
      {showLetterModal && previewLetter && (
        <div className="moi-modal-overlay" onClick={() => setShowLetterModal(false)}>
          <div className="moi-modal-box letter-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header letter-modal-topbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#1e3a8a" />
                <h3 style={{ margin: 0 }}>معاينة وطباعة الرسالة الرسمية الصادرة</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-action-edit"
                  style={{ padding: '6px 12px', fontSize: '13px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleOpenInDesigner(previewLetter)}
                >
                  <Edit size={14} />
                  <span>تعديل في المصمم</span>
                </button>
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={handleSaveLetterEdits}
                  style={{ padding: '6px 14px', fontSize: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={14} />
                  <span>حفظ التعديلات</span>
                </button>
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={handlePrintOfficialLetter}
                  style={{ padding: '6px 14px', fontSize: '13px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={15} />
                  <span>طباعة الرسالة فوراً</span>
                </button>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowLetterModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="letter-modal-body">
              <OfficialLetterSheet letter={previewLetter} qrUrl={qrCodeDataUrl} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW INCOMING MAIL (معاينة البريد الوارد) */}
      {showIncomingModal && previewIncomingItem && (
        <div className="moi-modal-overlay" onClick={() => setShowIncomingModal(false)}>
          <div className="moi-modal-box" style={{ maxWidth: '640px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={20} color="#1e3a8a" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                  معاينة قيد البريد الوارد الرسمي: {previewIncomingItem.incoming_reference}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="moi-modal-action-btn primary"
                  onClick={() => handlePrintIncoming(previewIncomingItem)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '7px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  <Printer size={15} />
                  <span>طباعة إفادة وارد 🖨️</span>
                </button>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowIncomingModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="moi-modal-body" style={{ padding: '20px' }}>
              <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الرقم الإشاري الوارد: </span>
                    <strong style={{ color: '#1e3a8a', fontFamily: 'monospace' }}>{previewIncomingItem.incoming_reference}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>المراسلة المرتبطة: </span>
                    <strong style={{ fontFamily: 'monospace' }}>{previewIncomingItem.linked_reference || 'غير مرتبطة'}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الجهة الوارد منها: </span>
                    <strong style={{ color: '#0f172a' }}>{previewIncomingItem.source_entity}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الموضوع: </span>
                    <strong style={{ color: '#1e3a8a' }}>{previewIncomingItem.subject}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>تاريخ وساعة الورود: </span>
                    <span>{previewIncomingItem.date} {previewIncomingItem.time || ''}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>طريقة الاستلام: </span>
                    <strong style={{ color: '#0284c7' }}>{previewIncomingItem.receive_method}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الموظف المستلم: </span>
                    <strong>{previewIncomingItem.receiver_employee || 'عبدالصمد'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>الحالة: </span>
                    <span style={{ fontWeight: 800, color: previewIncomingItem.status === 'replied' ? '#16a34a' : '#d97706' }}>
                      {previewIncomingItem.status === 'replied' ? 'تم الرد والإجراء' : 'تحت الإجراء والمتابعة'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ border: '1.5px dashed #1e3a8a', borderRadius: '10px', padding: '12px 14px', background: '#eff6ff', marginBottom: '16px', fontSize: '12px', color: '#1e3a8a', lineHeight: 1.6 }}>
                <strong>تأشيرة الإحالة الإدارية:</strong> تحال أصول المراسلة إلى قسم الشؤون الإدارية والأمنية للأرشفة ومتابعة الردود الرسمية وفق الأصول.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handlePrintIncoming(previewIncomingItem)}
                  style={{ padding: '9px 18px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Printer size={15} />
                  <span>طباعة رسمية A4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowIncomingModal(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', background: '#e2e8f0', color: '#334155', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: PRINT FULL REGISTER (طباعة كل السجل)                             */}
      {/* ========================================================================= */}
      {showRegisterPrintModal && (
        <div className="moi-modal-overlay" onClick={() => setShowRegisterPrintModal(false)}>
          <div className="moi-modal-box register-print-box" onClick={(e) => e.stopPropagation()}>
            <div className="moi-modal-header">
              <h3>
                <Printer size={18} />
                <span>
                  {registerPrintType === 'outgoing' ? 'طباعة كشف سجل البريد الصادر الكامل' : 'طباعة كشف سجل البريد الوارد الكامل'}
                </span>
              </h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-toolbar-save"
                  onClick={() => {
                    const el = document.getElementById('printable-official-register-content');
                    if (el) {
                      printDocumentInIframe(el.outerHTML, 'كشف_سجل_البريد_الرسمي');
                    } else {
                      window.print();
                    }
                  }}
                >
                  <Printer size={15} />
                  <span>طباعة الكشف</span>
                </button>
                <button
                  type="button"
                  className="moi-modal-close-btn"
                  onClick={() => setShowRegisterPrintModal(false)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="register-print-document" id="printable-register-area">
              <div className="register-header-official">
                <div className="header-side-right">
                  <h3>دولة ليبيا</h3>
                  <h4>وزارة الداخلية</h4>
                  <p>مديرية أمن أوباري</p>
                </div>
                <div className="header-logo-center">
                  <img src={MOI_LOGO_BASE64} alt="شعار وزارة الداخلية" style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
                </div>
                <div className="header-side-left">
                  <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-LY')}</p>
                  <p>القائم بالطباعة: {user?.full_name || 'عبدالصمد'}</p>
                  <p>الحالة: سجل رسمي معتمد</p>
                </div>
              </div>

              <div className="register-title-banner">
                <h2>{registerPrintType === 'outgoing' ? 'كشف سجل البريد الصادر الرسمي' : 'كشف سجل البريد الوارد الرسمي'}</h2>
                <p>القيود المسجلة بمديرية أمن أوباري لعام 2026م</p>
              </div>

              <table className="register-print-table">
                <thead>
                  {registerPrintType === 'outgoing' ? (
                    <tr>
                      <th>#</th>
                      <th>الكود</th>
                      <th>رقم القيد</th>
                      <th>الرقم الإشاري</th>
                      <th>الجهة الموجه إليها</th>
                      <th>الموضوع</th>
                      <th>الموافق</th>
                      <th>طريقة الإرسال</th>
                      <th>المحرر</th>
                      <th>الحالة</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>#</th>
                      <th>الرقم الإشاري</th>
                      <th>المرتبطة</th>
                      <th>الجهة الوارد منها</th>
                      <th>الموضوع</th>
                      <th>تاريخ الاستلام</th>
                      <th>طريقة الاستلام</th>
                      <th>المستلم</th>
                      <th>الحالة</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(registerPrintType === 'outgoing' ? outgoingList : incomingList).map((row, idx) => (
                    <tr key={row.id}>
                      <td>{idx + 1}</td>
                      {registerPrintType === 'outgoing' ? (
                        <>
                          <td>{row.code_no}</td>
                          <td>{row.record_number}</td>
                          <td>{row.reference}</td>
                          <td>{row.recipient}</td>
                          <td>{row.subject}</td>
                          <td>{row.date}</td>
                          <td>{row.delivery_method}</td>
                          <td>{row.sender_employee}</td>
                          <td>{row.status === 'delivered' ? 'تم التسليم' : 'قيد المتابعة'}</td>
                        </>
                      ) : (
                        <>
                          <td>{row.incoming_reference}</td>
                          <td>{row.linked_reference || '—'}</td>
                          <td>{row.source_entity}</td>
                          <td>{row.subject}</td>
                          <td>{row.date} {row.time}</td>
                          <td>{row.receive_method}</td>
                          <td>{row.receiver_employee}</td>
                          <td>{row.status === 'replied' ? 'تم الرد' : 'تحت الإجراء'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="register-footer-signatures">
                <div className="sig-block">
                  <p>المحرر والموثق</p>
                  <span>{user?.full_name || 'عبدالصمد موسى محمد الشيخ'}</span>
                </div>
                <div className="sig-block">
                  <p>رئيس قسم المحفوظات والبريد</p>
                  <span>رائد شرطة / عمر مصطفى الفاسي</span>
                </div>
                <div className="sig-block">
                  <p>يعتمد مدير مديرية أمن أوباري</p>
                  <span>لواء / موسى سعد محمد البدين</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// SUB-COMPONENT: OFFICIAL LETTER SHEET (Exact Replica of Image 3 with Typography)
// =========================================================================
function OfficialLetterSheet({ letter, qrUrl }) {
  if (!letter) return null;

  const ccItems = Array.isArray(letter.cc_list) && letter.cc_list.length > 0
    ? letter.cc_list
    : [
        'السيد / وكيل وزارة الداخلية',
        'معالي / وزير الداخلية',
        'آمر المنطقة العسكرية الجنوبية',
        'المساعد للشؤون الأمنية',
        'الغرفة الأمنية المشتركة',
        'الإدارة العامة للتفتيش والمتابعة'
      ];
  const half = Math.ceil(ccItems.length / 2);
  const col1 = ccItems.slice(0, half);
  const col2 = ccItems.slice(half);

  return (
    <div className="official-a4-letter-sheet" id="official-letter-to-print">
      {/* الشريط الوطني الليبي المعتمد (4 ألوان) */}
      <div style={{ height: '5px', width: '100%', display: 'flex', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ flex: 1, background: '#e11d48' }}></div>
        <div style={{ flex: 2, background: '#000000' }}></div>
        <div style={{ flex: 1, background: '#16a34a' }}></div>
      </div>

      {/* Top Header Block matching Image 3 */}
      <header className="a4-letter-header">
        <div className="header-lang-right">
          <h2 className="title-moi-ar">وزارة الداخليـــــــــــــــــــة</h2>
          <h3 className="title-dir-ar">مديرية أمن أوبـــــــــــــــــاري</h3>
        </div>

        <div className="header-emblem-center">
          <img src={MOI_LOGO_BASE64} alt="شعار مديرية أمن أوباري" className="emblem-img" style={{ width: '68px', height: '68px', objectFit: 'contain' }} />
        </div>

        <div className="header-lang-left">
          <h2 className="title-moi-en">Ministry of Interior</h2>
          <h3 className="title-dir-en">Ubari Security Directorate</h3>
        </div>
      </header>

      {/* QR Code and Metadata Table Row matching Image 3 */}
      <div className="a4-metadata-qr-row">
        {/* Table on the right (1st child in RTL) */}
        <div className="official-meta-table-box">
          <div className="meta-row">
            <div className="meta-cell ref-cell">
              <span className="meta-lbl">الإشاري:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.reference || '12/2026'}</span>
            </div>
            <div className="meta-cell record-cell">
              <span className="meta-lbl">القيـــــد:</span>
              <span className="meta-val" style={{ unicodeBidi: 'plaintext' }}>{letter.record_number || '1'}</span>
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-cell date-cell">
              <span className="meta-lbl">الموافق:</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.date || '11/10/2026'}</span>
            </div>
            <div className="meta-cell code-cell">
              <span className="meta-lbl">:Code No</span>
              <span className="meta-val" dir="ltr" style={{ unicodeBidi: 'plaintext' }}>{letter.code_no || '2026-002'}</span>
            </div>
          </div>
        </div>

        {/* QR Code on the left (2nd child in RTL) */}
        <div className="qr-code-box">
          {letter.show_qr !== false && qrUrl ? (
            <img src={qrUrl} alt="رمز التحقق الأمني QR" className="qr-img" />
          ) : (
            <div className="qr-placeholder" />
          )}
        </div>
      </div>

      {/* Subject Box matching Image 3 */}
      <div className="a4-subject-bordered-box">
        <span className="subject-title-lbl">بخصوص /</span>
        <span className="subject-title-content">
          {letter.subject || '....................................................................................................'}
        </span>
      </div>

      {/* Reference Sub-line matching Image 3 */}
      <div className="a4-reference-subline">
        {letter.reply_to_reference ? (
          <span>
            إشارة إلى مراسلتكم رقم : {letter.reply_to_reference} بتاريخ {letter.reply_date || '10/10/2026'}م
          </span>
        ) : (
          <span>
            إشارة إلى مراسلتكم رقم : 1.2/2026 بتاريخ 10/10/2026م
          </span>
        )}
      </div>

      {/* Recipient Headline matching Image 3 */}
      <div className="a4-recipient-headline">
        <h3>{letter.recipient_title || `إلى السيد / ${letter.recipient || 'آمر المنطقة العسكرية الجنوبية'}`}</h3>
      </div>

      {/* Formal Greetings */}
      <div className="a4-greetings-section">
        <p className="greeting-line-1">{letter.greeting || 'بعد التحيـــــة والســــلام ،،،'}</p>
      </div>

      {/* Letter Body Text with Live Typography */}
      <div className="a4-body-content">
        <p
          className="body-main-clause"
          style={{
            whiteSpace: 'pre-line',
            fontFamily: letter.font_family || "'Cairo', sans-serif",
            fontSize: letter.font_size || '16px',
            lineHeight: letter.line_height || '1.9',
            textAlign: letter.text_align || 'right',
            fontWeight: letter.font_weight || 'normal',
            fontStyle: letter.font_style || 'normal',
            textDecoration: letter.text_decoration || 'none',
            color: letter.text_color || '#000000'
          }}
        >
          {letter.letter_body || 'إليكم من حيث الاختصاص للتفضل بالعلم واتخاذ ما يلزم من إجراءات وفق ما تقتضيه المصلحة الأمنية العامة.'}
        </p>
      </div>

      {/* Signature & Stamp Block (Positioned on the LEFT in Libyan correspondence) */}
      <div className="a4-signature-block pos-left">
        <div className="sig-inner layout-stacked">
          {letter.show_signature !== false && (
            <div className="sig-text-side">
              <h4 className="sig-officer-name">{letter.signer_name || 'لواء / موسى سعد محمد'}</h4>
              <h5 className="sig-officer-rank">{letter.signer_title || 'مدير مديرية أمن أوباري'}</h5>
            </div>
          )}
          {letter.show_stamp !== false && (
            <div className="official-stamp-seal-circle">
              <div className="stamp-inner-text">
                <span>وزارة الداخلية</span>
                <span>مديرية أمن أوباري</span>
                <span style={{ fontSize: '8px', color: '#b91c1c' }}>معتمد رسمي</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CC List matching Image 3 (2 columns) */}
      <div className="a4-cc-distribution-block">
        <div className="cc-header">صورة منه إلى :-</div>
        <div className="cc-grid-2cols">
          <ul className="cc-col">
            {col1.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
          <ul className="cc-col">
            {col2.map((item, idx) => (
              <li key={idx}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Footer Line & Contact Info matching Image 3 */}
      <footer className="a4-letter-footer">
        <div className="footer-solid-divider" />
        <div className="footer-details-row">
          <div className="footer-cell editor-cell">
            <span>المحرر: {letter.editor_employee || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell print-cell">
            <span style={{ marginLeft: '4px' }}>🖨️</span>
            <span>الطباعة: {letter.print_employee || 'عبدالصمد'}</span>
          </div>
          <div className="footer-cell phone-cell">
            <span>Phone: {letter.phone || '0915938137'}</span>
          </div>
          <div className="footer-cell email-cell">
            <span>Email: {letter.email || 'Info@ubari-security.ly'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
