import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  Shield,
  MapPin,
  Eye,
  Car,
  Fuel,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Printer,
  ExternalLink,
  Layers,
  Search,
  Copy,
  Navigation,
  Crosshair
} from 'lucide-react';
import { printDocumentInIframe } from '../utils/printHelper';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

// Ubari valley tactical locations & checkpoints with verified coordinates
const UBRI_LOCATIONS = [
  // ==================== نقاط التفتيش والبوابات الأمنية الرئيسية ====================
  {
    id: 1,
    name: "بوابة أوباري الشرقية (نقطة تفتيش رئيسية)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5850,
    lng: 12.8250,
    icon: 'gate',
    status: "تشديد وتدقيق أمني",
    color: "#dc2626",
    officers: 12,
    vehicles: 3,
    commander: "نقيب / مصطفى سالم",
    phone: "لاسلكي - قناة 2 (عمليات)",
    notes: "المدخل الرئيسي للمدينة من جهة سبها، تفتيش دقيق للمركبات وشاحنات النقل الثقيل"
  },
  {
    id: 2,
    name: "بوابة أوباري الغربية (مفرق جرمة وغات)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5720,
    lng: 12.7280,
    icon: 'gate',
    status: "تفتيش مستمر وتأمين",
    color: "#dc2626",
    officers: 10,
    vehicles: 2,
    commander: "ملازم أول / عبدالسلام المهدي",
    phone: "لاسلكي - قناة 2",
    notes: "تأمين مدخل ومخرج أوباري المتجه إلى بلديات الغريفة وغات والحدود الجنوبية الغربية"
  },
  {
    id: 3,
    name: "بوابة الحطية الأمنية",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5910,
    lng: 12.8950,
    icon: 'gate',
    status: "تمركز أمني نشط",
    color: "#dc2626",
    officers: 8,
    vehicles: 2,
    commander: "مساعد ضابط / عثمان مسعود",
    phone: "لاسلكي - قناة 4",
    notes: "نقطة ارتكاز وتفتيش متقدمة على المسار الرئيسي لوادي الحياة"
  },
  {
    id: 4,
    name: "بوابة الفجيج (مدخل الوادي الشرقي)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.6850,
    lng: 13.8200,
    icon: 'gate',
    status: "جاهزية واستيقاف",
    color: "#dc2626",
    officers: 14,
    vehicles: 4,
    commander: "نقيب / أبوبكر الشريف",
    phone: "لاسلكي - قناة 1",
    notes: "البوابة الإستراتيجية الفاصلة والرابطة لقطاع وادي الحياة، منظومة تدقيق أمني للمشتبهين"
  },
  {
    id: 5,
    name: "بوابة الأبيض الحدودية للقطاع",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.7650,
    lng: 14.0100,
    icon: 'gate',
    status: "مراقبة مشددة",
    color: "#dc2626",
    officers: 12,
    vehicles: 3,
    commander: "ملازم / علي أحمد التارقي",
    phone: "لاسلكي - قناة 1",
    notes: "تأمين الحدود الإدارية الشمالية الشرقية للمديرية مع قطاع سبها"
  },
  {
    id: 6,
    name: "بوابة الغريفة المركزية",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5350,
    lng: 13.0180,
    icon: 'gate',
    status: "استقرار وتفتيش",
    color: "#dc2626",
    officers: 8,
    vehicles: 2,
    commander: "رئيس عرفاء / محمد الهادي",
    phone: "071-523002",
    notes: "مدخل بلدية الغريفة وتأمين مسار الحركة الزراعية والتجارية"
  },
  {
    id: 7,
    name: "بوابة جرمة الأثرية (المثلث الغربي)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5290,
    lng: 13.0720,
    icon: 'gate',
    status: "تأمين سياحي وحيوي",
    color: "#dc2626",
    officers: 8,
    vehicles: 2,
    commander: "ملازم / بشير محمد",
    phone: "لاسلكي - قناة 3",
    notes: "تأمين محيط مدينة جرمة التاريخية ومسارات وادي الآجال"
  },
  {
    id: 8,
    name: "بوابة سوق الخميس (تمركز أمني وسط أوباري)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5880,
    lng: 12.7710,
    icon: 'gate',
    status: "دورية متمركزة",
    color: "#2563eb",
    officers: 8,
    vehicles: 2,
    commander: "مساعد ضابط / خليفة الصالحين",
    phone: "لاسلكي - قناة 3",
    notes: "تأمين المنطقة التجارية والمفترق الرئيسي للمدينة ومراقبة السيولة المرورية"
  },
  {
    id: 9,
    name: "بوابة بنت بية الشمالية",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.6520,
    lng: 13.6620,
    icon: 'gate',
    status: "تفتيش وتدقيق",
    color: "#dc2626",
    officers: 10,
    vehicles: 2,
    commander: "نقيب / مفتاح سالم",
    phone: "071-524110",
    notes: "تأمين مدخل بلدية بنت بية والقرى المجاورة"
  },
  {
    id: 10,
    name: "استيقاف مثلث قريقيرة الأمني",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5580,
    lng: 13.2200,
    icon: 'gate',
    status: "استيقاف فجائي نشط",
    color: "#d97706",
    officers: 6,
    vehicles: 2,
    commander: "دورية النجدة والإسناد",
    phone: "لاسلكي - قناة 2",
    notes: "استيقافات أمنية فجائية لمنع التهريب وضبط المركبات المعتمة وبدون لوحات"
  },
  {
    id: 11,
    name: "بوابة الديسة / تين كاشف (المدخل الجنوبي)",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5400,
    lng: 12.7450,
    icon: 'gate',
    status: "مراقبة المسارب الصحراوية",
    color: "#dc2626",
    officers: 8,
    vehicles: 3,
    commander: "ملازم أول / حسن بركة",
    phone: "لاسلكي - دوريات صحراوية",
    notes: "تأمين المسارات الصحراوية الجنوبية المحاذية لسلسلة جبال أوباري ومنع التسلل"
  },
  {
    id: 12,
    name: "نقطة تفتيش مطار أوباري المدني",
    type: "نقطة تفتيش",
    category: "gate",
    lat: 26.5680,
    lng: 12.8120,
    icon: 'gate',
    status: "حماية منشأة حيوية",
    color: "#1e3a8a",
    officers: 12,
    vehicles: 3,
    commander: "رائد / طارق عبدالكريم",
    phone: "071-522105",
    notes: "تأمين البوابة الخارجية والبوابات الفرعية المحيطة بحرم مطار أوباري المدني"
  },

  // ==================== القيادة ومراكز الشرطة ====================
  {
    id: 13,
    name: "مديرية أمن أوباري (القيادة المركزية والسيطرة)",
    type: "مركز قيادة",
    category: "police",
    lat: 26.5896,
    lng: 12.7745,
    icon: 'hq',
    status: "جاهزية تامة واستنفار",
    color: "#16a34a",
    officers: 48,
    vehicles: 12,
    commander: "سيادة اللواء / موسى سعد البدين (مدير الأمن)",
    phone: "071-522101",
    notes: "المقر العام للمديرية، غرفة العمليات المركزية والاتصالات اللاسلكية"
  },
  {
    id: 14,
    name: "مركز شرطة أوباري المدينة",
    type: "مركز شرطة",
    category: "police",
    lat: 26.5950,
    lng: 12.7800,
    icon: 'police',
    status: "دورية نشطة ومناوبة",
    color: "#2563eb",
    officers: 24,
    vehicles: 6,
    commander: "عقيد / إدريس علي",
    phone: "071-522114",
    notes: "استقبال البلاغات، التحقيق، والدوريات الراجلة والراكبة داخل الأحياء السكنية"
  },
  {
    id: 15,
    name: "قسم البحث الجنائي أوباري",
    type: "مركز شرطة",
    category: "police",
    lat: 26.5870,
    lng: 12.7760,
    icon: 'police',
    status: "تحريات وتحقيقات مستمرة",
    color: "#2563eb",
    officers: 20,
    vehicles: 5,
    commander: "مقدم / يوسف الطاهر",
    phone: "071-522120",
    notes: "التحري وجمع الاستدلالات ومكافحة الجرائم والظواهر الهدامة"
  },
  {
    id: 16,
    name: "وحدة النجدة والدوريات الصحراوية",
    type: "مركز شرطة",
    category: "police",
    lat: 26.5860,
    lng: 12.7810,
    icon: 'police',
    status: "استجابة سريعة",
    color: "#2563eb",
    officers: 26,
    vehicles: 8,
    commander: "رائد / خالد عمر",
    phone: "071-522133",
    notes: "الدوريات المسلحة الجوالة وتأمين الطرق الخارجية والاستجابة لنداءات الاستغاثة"
  },
  {
    id: 17,
    name: "مركز شرطة الغريفة",
    type: "مركز شرطة",
    category: "police",
    lat: 26.6341,
    lng: 12.8711,
    icon: 'police',
    status: "مستقر وجاهز",
    color: "#16a34a",
    officers: 18,
    vehicles: 4,
    commander: "رائد / مصطفى عمران",
    phone: "071-523002",
    notes: "تغطية النطاق الإداري لبلدية الغريفة والمناطق التابعة لها"
  },
  {
    id: 18,
    name: "مركز شرطة بنت بية",
    type: "مركز شرطة",
    category: "police",
    lat: 26.6500,
    lng: 13.0000,
    icon: 'police',
    status: "استقرار أمني",
    color: "#16a34a",
    officers: 16,
    vehicles: 3,
    commander: "مقدم / حسن سالم",
    phone: "071-524110",
    notes: "تأمين نطاق بلدية بنت بية والقرى المحيطة"
  },
  {
    id: 19,
    name: "قسم المرور والتراخيص أوباري",
    type: "مركز شرطة",
    category: "police",
    lat: 26.5910,
    lng: 12.7780,
    icon: 'police',
    status: "تنظيم سير ودوريات مرورية",
    color: "#2563eb",
    officers: 15,
    vehicles: 4,
    commander: "رائد / عبدالحميد محمد",
    phone: "071-522108",
    notes: "مراقبة السلامة المرورية وضبط التجاوزات على الطرق السريعة"
  },

  // ==================== محطات الوقود الخاضعة لمراقبة المديرية ====================
  { id: 20, name: "محطة وقود المديرية المركزية (711)", type: "محطة وقود", category: "fuel", lat: 26.5877, lng: 12.7793, icon: 'fuel', status: "مراقبة وتوزيع منتظم", color: "#d97706", quota: "40,000 لتر", committee: "ملازم / بشير مصطفى" },
  { id: 21, name: "محطة وقود مشروع أوباري (713)", type: "محطة وقود", category: "fuel", lat: 26.5945, lng: 12.7259, icon: 'fuel', status: "مراقبة وتأمين", color: "#d97706", quota: "30,000 لتر", committee: "مساعد ضابط / عثمان علي" },
  { id: 22, name: "محطة وقود الغريفة الرئيسية", type: "محطة وقود", category: "fuel", lat: 26.5258, lng: 13.0121, icon: 'fuel', status: "تزويد منتظم", color: "#16a34a", quota: "25,000 لتر", committee: "قسم النجدة" },
  { id: 23, name: "محطة وقود جرمة التاريخية", type: "محطة وقود", category: "fuel", lat: 26.5261, lng: 13.0643, icon: 'fuel', status: "مراقبة وتأمين", color: "#d97706", quota: "20,000 لتر", committee: "دورية جرمة" },
  { id: 24, name: "محطة وقود قريقيرة", type: "محطة وقود", category: "fuel", lat: 26.5536, lng: 13.2148, icon: 'fuel', status: "تزويد منتظم", color: "#16a34a", quota: "20,000 لتر", committee: "مركز الغريفة" },
  { id: 25, name: "محطة وقود الرميلة", type: "محطة وقود", category: "fuel", lat: 26.5543, lng: 13.4173, icon: 'fuel', status: "مراقبة", color: "#d97706", quota: "15,000 لتر", committee: "دورية الإسناد" },
  { id: 26, name: "محطة وقود قبرعون", type: "محطة وقود", category: "fuel", lat: 26.5757, lng: 13.4314, icon: 'fuel', status: "تزويد منتظم", color: "#16a34a", quota: "15,000 لتر", committee: "مركز بنت بية" },
  { id: 27, name: "محطة وقود التناحمة", type: "محطة وقود", category: "fuel", lat: 26.6314, lng: 13.6369, icon: 'fuel', status: "مراقبة", color: "#d97706", quota: "15,000 لتر", committee: "مركز بنت بية" },
  { id: 28, name: "محطة وقود بنت بية", type: "محطة وقود", category: "fuel", lat: 26.6471, lng: 13.6581, icon: 'fuel', status: "تزويد منتظم", color: "#16a34a", quota: "25,000 لتر", committee: "مركز بنت بية" },
  { id: 29, name: "محطة وقود الأبيض", type: "محطة وقود", category: "fuel", lat: 26.7622, lng: 14.0057, icon: 'fuel', status: "مراقبة تامة", color: "#d97706", quota: "20,000 لتر", committee: "دورية الأبيض" }
];

// Map Layer Configurations
const MAP_LAYERS = {
  'google-hybrid': {
    name: '🛰️ قوقل ماب (قمر صناعي هجين)',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    options: {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '© Google Maps Satellite | منظومة مديرية أمن أوباري'
    }
  },
  'google-roadmap': {
    name: '🗺️ قوقل ماب (شوارع وتضاريس)',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    options: {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 20,
      attribution: '© Google Maps Roadmap | وزارة الداخلية - دولة ليبيا'
    }
  },
  'carto-tactical': {
    name: '🛡️ خريطة العمليات التكتيكية',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '© وزارة الداخلية - مديرية أمن أوباري | منظومة العمليات'
    }
  }
};

export default function OperationsSection() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState('google-hybrid'); // 'google-hybrid', 'google-roadmap', 'carto-tactical'
  const [selectedFilter, setSelectedFilter] = useState('gate'); // default to 'gate' so checkpoints are prominent!
  const [selectedLocation, setSelectedLocation] = useState(UBRI_LOCATIONS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [liveLog, setLiveLog] = useState([
    { id: 1, time: '17:05', text: 'بوابة أوباري الشرقية: تفتيش دقيق للمركبات المتجهة نحو سبها، الحالة مستقرة وتنسيق مع دوريات النجدة.', tag: 'نقاط تفتيش' },
    { id: 2, time: '16:40', text: 'بوابة الفجيج: ضبط مركبة بدون لوحات معدنية وإحالتها لقسم المرور والتراخيص.', tag: 'ضبطيات' },
    { id: 3, time: '16:15', text: 'بوابة أوباري الغربية (مفرق جرمة): تمركز كامل للدورية المسلحة وتأمين حركة المواطنين.', tag: 'تأمين' },
    { id: 4, time: '15:50', text: 'محطة وقود 711 المركزية: استمرار التوزيع بإشراف لجنة الوقود بنظام الحصة المعتمدة.', tag: 'وقود' }
  ]);

  // Statistics
  const checkpointsCount = UBRI_LOCATIONS.filter(l => l.category === 'gate').length;
  const policeCount = UBRI_LOCATIONS.filter(l => l.category === 'police').length;
  const fuelCount = UBRI_LOCATIONS.filter(l => l.category === 'fuel').length;

  // Filtered Locations
  const filteredLocations = useMemo(() => {
    return UBRI_LOCATIONS.filter(loc => {
      const matchesCategory =
        selectedFilter === 'all' ||
        loc.category === selectedFilter;

      if (!matchesCategory) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        loc.name.toLowerCase().includes(q) ||
        loc.type.toLowerCase().includes(q) ||
        (loc.commander && loc.commander.toLowerCase().includes(q)) ||
        (loc.notes && loc.notes.toLowerCase().includes(q))
      );
    });
  }, [selectedFilter, searchTerm]);

  // Helper to open Google Maps directly for any location
  const handleOpenGoogleMaps = (loc) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper to open all checkpoints on Google Maps
  const handleOpenAllCheckpointsGoogleMaps = () => {
    // Opens Google Maps centered on Ubari checkpoints sector
    const url = `https://www.google.com/maps/search/checkpoints+ubari+libya/@26.5896,12.7745,11z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper to copy GPS coordinates
  const handleCopyCoords = (loc) => {
    const coordsStr = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
    navigator.clipboard.writeText(coordsStr).then(() => {
      setCopiedId(loc.id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Helper to fly to a location on the map
  const handleFlyToLocation = (loc) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.5896, 12.7745],
        zoom: 11,
        zoomControl: true
      });
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Remove existing tile layer if any
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    // Apply active tile layer (Google Satellite, Google Streets, or Carto)
    const layerCfg = MAP_LAYERS[activeLayer];
    const newTileLayer = L.tileLayer(layerCfg.url, layerCfg.options).addTo(map);
    currentTileLayerRef.current = newTileLayer;

    // Clear existing markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Render Markers with specialized styling
    filteredLocations.forEach(loc => {
      let iconBg = '#1e3a8a';
      let iconSymbol = '🛡️';
      let borderGlow = 'rgba(0,0,0,0.35)';

      if (loc.category === 'gate') {
        iconBg = '#dc2626';
        iconSymbol = '🚧';
        borderGlow = 'rgba(220, 38, 38, 0.6)';
      } else if (loc.icon === 'hq') {
        iconBg = '#1e3a8a';
        iconSymbol = '⭐';
        borderGlow = 'rgba(212, 175, 55, 0.8)';
      } else if (loc.category === 'police') {
        iconBg = '#0284c7';
        iconSymbol = '🚓';
        borderGlow = 'rgba(2, 132, 199, 0.5)';
      } else if (loc.category === 'fuel') {
        iconBg = '#d97706';
        iconSymbol = '⛽';
        borderGlow = 'rgba(217, 119, 6, 0.5)';
      }

      const isSelected = selectedLocation && selectedLocation.id === loc.id;
      const markerSize = isSelected ? 40 : 34;

      const iconHtml = `
        <div style="
          background: ${iconBg};
          color: white;
          width: ${markerSize}px;
          height: ${markerSize}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: ${isSelected ? '3.5px solid #d4af37' : '2.5px solid #ffffff'};
          box-shadow: 0 4px 14px ${borderGlow};
          font-size: ${isSelected ? '18px' : '15px'};
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: all 0.25s ease;
        ">
          ${iconSymbol}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'moi-map-marker',
        html: iconHtml,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      // Interactive Popup with Google Maps link
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
      marker.bindPopup(`
        <div style="direction: rtl; font-family: 'Cairo', Arial, sans-serif; min-width: 220px; padding: 6px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 16px;">${iconSymbol}</span>
            <div style="font-size: 13px; font-weight: 900; color: #1e3a8a;">${loc.name}</div>
          </div>
          
          <div style="font-size: 11px; color: #64748b; font-weight: 800; margin-bottom: 6px;">
            التصنيف: <span style="color: #0f172a;">${loc.type}</span>
          </div>

          <div style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; background: ${loc.color}20; color: ${loc.color}; border: 1px solid ${loc.color}; margin-bottom: 8px;">
            ● ${loc.status}
          </div>

          ${loc.commander ? `<div style="font-size: 11px; margin-bottom: 3px; color: #334155;">المسؤول: <strong>${loc.commander}</strong></div>` : ''}
          ${loc.officers ? `<div style="font-size: 11px; margin-bottom: 3px; color: #334155;">القوة الميدانية: <strong>${loc.officers} فرد • ${loc.vehicles} آلية</strong></div>` : ''}
          ${loc.quota ? `<div style="font-size: 11px; margin-bottom: 3px; color: #b45309;">الحصة: <strong>${loc.quota}</strong></div>` : ''}
          ${loc.phone ? `<div style="font-size: 10.5px; color: #64748b; margin-bottom: 8px;">الاتصال: <strong>${loc.phone}</strong></div>` : ''}

          <div style="display: flex; gap: 6px; margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;">
            <a
              href="${googleMapsUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                flex: 1;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                color: #ffffff;
                text-decoration: none;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 800;
              "
            >
              <span>فتح في Google Maps ↗</span>
            </a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedLocation(loc);
      });

      markersRef.current.push(marker);
    });

    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

  }, [activeLayer, filteredLocations, selectedLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleAddLiveNote = (e) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' });
    setLiveLog(prev => [
      { id: Date.now(), time: timeStr, text: quickNote, tag: 'إشارة لاسلكية' },
      ...prev
    ]);
    setQuickNote('');
  };

  const handlePrintOperationsBrief = () => {
    const checkpoints = UBRI_LOCATIONS.filter(l => l.category === 'gate');
    const content = `
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
              <div style="font-size: 11px; font-weight: 700; color: #64748b;">غرفة العمليات والسيطرة • كشف نقاط التفتيش والتمركزات</div>
            </td>
            <td style="text-align: center; vertical-align: middle; width: 70px;">
              <img src="${MOI_LOGO_BASE64}" alt="شعار الوزارة" style="width: 60px; height: 60px; object-fit: contain; margin: 0 auto; display: block;" />
            </td>
            <td style="text-align: left; direction: ltr; vertical-align: middle;">
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a;">Operations Control Center</div>
              <div style="font-size: 10px; font-weight: 700; color: #0f172a;">Ubari Checkpoints Roster</div>
              <div style="font-size: 9px; color: #64748b;">Google Maps Coordinates</div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 14px;">
          <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #0f172a; text-decoration: underline;">
            موقف نقاط التفتيش والبوابات الأمنية المعتمدة (Google Maps Verified)
          </h2>
          <div style="font-size: 11px; color: #64748b; font-weight: 700; margin-top: 3px;">
            تاريخ وساعة التقرير: ${new Date().toLocaleString('ar-LY')} • إجمالي البوابات: ${checkpoints.length} نقطة تفتيش
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; font-size: 10.5px; margin-bottom: 14px;">
          <thead>
            <tr style="background: #1e3a8a; color: #ffffff;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">ت</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">نقطة التفتيش / البوابة</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">إحداثيات قوقل ماب</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">الحالة الميدانية</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">القوة والعتاد</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">آمر النقطة والاتصال</th>
            </tr>
          </thead>
          <tbody>
            ${checkpoints.map((loc, idx) => `
              <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${idx + 1}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: 800;">${loc.name}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-family: monospace; direction: ltr; text-align: center;">${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; font-weight: 800; color: ${loc.color}; text-align: center;">● ${loc.status}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">${loc.officers} فرد / ${loc.vehicles} آلية</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${loc.commander || '---'} (${loc.phone || 'لاسلكي'})</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-right: 4px solid #1e3a8a; padding: 10px; border-radius: 6px; margin-bottom: 14px; font-size: 11px;">
          <strong style="color: #1e3a8a;">آخر الإشارات اللاسلكية الواردة من البوابات:</strong>
          <ul style="margin: 5px 0 0 16px; padding: 0;">
            ${liveLog.slice(0, 4).map(l => `<li><strong>[${l.time}]</strong> ${l.text}</li>`).join('')}
          </ul>
        </div>

        <table style="width: 100%; border-collapse: collapse; text-align: center; margin-top: 20px; font-size: 11px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">ضابط خفر العمليات والسيطرة</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">رائد / خليفة علي محمد</div>
            </td>
            <td style="width: 50%; vertical-align: top;">
              <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 30px;">يعتمد / مدير مديرية أمن أوباري</div>
              <div style="font-weight: 800; border-top: 1px dashed #94a3b8; padding-top: 4px;">لواء / موسى سعد البدين</div>
            </td>
          </tr>
        </table>
      </div>
    `;

    printDocumentInIframe(content, 'موقف نقاط التفتيش والسيطرة الميدانية');
  };

  return (
    <div className="operations-section-container" style={{ padding: '20px', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* Top Banner */}
      <div className="module-view-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4af37', boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)' }}>
            <Radio size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>
              غرفة العمليات والسيطرة • خريطة نقاط التفتيش (Google Maps)
            </h1>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 700 }}>
              ربط مباشر مع الأقمار الصناعية لـ Google Maps لرصد كافة نقاط التفتيش والبوابات الأمنية بمديرية أمن أوباري
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenAllCheckpointsGoogleMaps}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
            }}
            title="فتح خريطة كافة نقاط التفتيش في تطبيق Google Maps الرسمي"
          >
            <Navigation size={16} />
            <span>فتح كافة البوابات في Google Maps ↗</span>
          </button>

          <button
            onClick={handlePrintOperationsBrief}
            className="btn-official-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
          >
            <Printer size={16} />
            <span>طباعة موقف نقاط التفتيش (A4)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Map Area (Left) + Tactical Sidebar (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px' }}>
        
        {/* Left Map Panel */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Layer Switcher & Filter Bar */}
          <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedFilter('gate')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedFilter === 'gate' ? '#dc2626' : '#e2e8f0',
                  color: selectedFilter === 'gate' ? '#ffffff' : '#334155',
                  boxShadow: selectedFilter === 'gate' ? '0 2px 6px rgba(220, 38, 38, 0.3)' : 'none'
                }}
              >
                🚧 نقاط التفتيش والبوابات ({checkpointsCount})
              </button>

              <button
                onClick={() => setSelectedFilter('police')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedFilter === 'police' ? '#0284c7' : '#e2e8f0',
                  color: selectedFilter === 'police' ? '#ffffff' : '#334155'
                }}
              >
                🚓 مراكز الشرطة ({policeCount})
              </button>

              <button
                onClick={() => setSelectedFilter('fuel')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedFilter === 'fuel' ? '#d97706' : '#e2e8f0',
                  color: selectedFilter === 'fuel' ? '#ffffff' : '#334155'
                }}
              >
                ⛽ محطات الوقود ({fuelCount})
              </button>

              <button
                onClick={() => setSelectedFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: selectedFilter === 'all' ? '#1e3a8a' : '#e2e8f0',
                  color: selectedFilter === 'all' ? '#ffffff' : '#334155'
                }}
              >
                الكل ({UBRI_LOCATIONS.length})
              </button>
            </div>

            {/* Google Maps Layer Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <Layers size={14} color="#1e3a8a" />
              <select
                value={activeLayer}
                onChange={(e) => setActiveLayer(e.target.value)}
                style={{
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              >
                <option value="google-hybrid">🛰️ قوقل ماب (قمر صناعي هجين)</option>
                <option value="google-roadmap">🗺️ قوقل ماب (شوارع وتضاريس)</option>
                <option value="carto-tactical">🛡️ خريطة العمليات التكتيكية</option>
              </select>
            </div>
          </div>

          {/* Quick Search & Filter bar for checkpoints */}
          <div style={{ padding: '8px 16px', background: '#ffffff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="بحث سريع عن اسم نقطة التفتيش أو البوابة أو الآمر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '12.5px',
                fontFamily: 'inherit',
                color: '#0f172a'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#64748b', fontWeight: 800 }}
              >
                مسح
              </button>
            )}
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>
              المعروض: {filteredLocations.length} نقطة
            </span>
          </div>

          {/* Map Canvas */}
          <div
            ref={mapContainerRef}
            style={{ width: '100%', height: '560px', background: '#1e293b' }}
          />

          {/* Selected Location Details Banner below Map */}
          {selectedLocation && (
            <div style={{
              padding: '14px 18px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>
                    {selectedLocation.category === 'gate' ? '🚧' : selectedLocation.category === 'police' ? '🚓' : '⛽'}
                  </span>
                  <strong style={{ fontSize: '15px', color: '#1e3a8a' }}>{selectedLocation.name}</strong>
                  <span style={{
                    fontSize: '11px',
                    background: `${selectedLocation.color}20`,
                    color: selectedLocation.color,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    border: `1px solid ${selectedLocation.color}40`
                  }}>
                    ● {selectedLocation.status}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {selectedLocation.commander && <span>الآمر: <strong>{selectedLocation.commander}</strong></span>}
                  {selectedLocation.officers && <span>القوة: <strong>{selectedLocation.officers} فرد • {selectedLocation.vehicles} آليات</strong></span>}
                  {selectedLocation.phone && <span>الاتصال: <strong>{selectedLocation.phone}</strong></span>}
                  {selectedLocation.quota && <span>الحصة: <strong>{selectedLocation.quota}</strong></span>}
                </div>
              </div>

              {/* Action buttons for selected location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => handleCopyCoords(selectedLocation)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                  title="نسخ إحداثيات GPS لنقطة التفتيش"
                >
                  <Copy size={13} />
                  <span>{copiedId === selectedLocation.id ? 'تم النسخ!' : 'نسخ الإحداثيات'}</span>
                </button>

                <button
                  onClick={() => handleOpenGoogleMaps(selectedLocation)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  <ExternalLink size={13} />
                  <span>عرض في Google Maps ↗</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Tactical Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Checkpoints Quick Selector List */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #cbd5e1',
            padding: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
            maxHeight: '340px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 900, color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🚧</span>
                <span>نقاط التفتيش والبوابات الميدانية</span>
              </span>
              <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1e3a8a', padding: '2px 8px', borderRadius: '10px' }}>
                {UBRI_LOCATIONS.filter(l => l.category === 'gate').length} نقطة
              </span>
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {UBRI_LOCATIONS.filter(l => l.category === 'gate').map(gate => {
                const isSelected = selectedLocation && selectedLocation.id === gate.id;
                return (
                  <div
                    key={gate.id}
                    onClick={() => handleFlyToLocation(gate)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #1e3a8a' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <strong style={{ fontSize: '12px', color: isSelected ? '#1e3a8a' : '#0f172a' }}>
                        {gate.name}
                      </strong>
                      <span style={{ fontSize: '10px', color: gate.color, fontWeight: 800 }}>
                        ● {gate.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748b' }}>
                      <span>القوة: {gate.officers} فرد</span>
                      <span style={{ fontFamily: 'monospace' }}>{gate.lat.toFixed(3)}N, {gate.lng.toFixed(3)}E</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Radio Dispatch Box */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #cbd5e1', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 900, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📡</span>
              <span>تسجيل إشارة أو بلاغ من البوابات</span>
            </h3>

            <form onSubmit={handleAddLiveNote}>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="اكتب الإشارة الواردة من نقطة التفتيش أو الدورية..."
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', marginBottom: '8px' }}
              />
              <button
                type="submit"
                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e3a8a', color: '#ffffff', border: 'none', fontWeight: 800, fontSize: '12.5px', cursor: 'pointer' }}
              >
                ➕ بث الإشارة لسجل العمليات
              </button>
            </form>
          </div>

          {/* Live Incident & Radio Log */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1.5px solid #cbd5e1', padding: '16px', flex: 1, boxShadow: '0 4px 15px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 900, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
              📋 سجل الإشارات والموقف الحي للبوابات
            </h3>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {liveLog.map(log => (
                <div key={log.id} style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, background: '#eff6ff', color: '#1e3a8a', padding: '2px 6px', borderRadius: '4px' }}>
                      {log.tag}
                    </span>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>{log.time}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#1e293b', lineHeight: 1.5 }}>
                    {log.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
