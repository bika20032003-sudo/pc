import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  Shield,
  Users,
  Radio,
  Package,
  Mail,
  BarChart3,
  Camera,
  Settings,
  Sparkles
} from 'lucide-react';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import { MOI_LOGO_BASE64 } from '../utils/logoBase64';

// 6 Official Directorate Operational Divisions
export const SECTION_DIVISIONS = [
  {
    id: 'command',
    title: 'القيادة والعمليات المركزية',
    icon: Shield,
    color: '#1e3a8a',
    itemIds: ['dashboard', 'profile', 'operations']
  },
  {
    id: 'hr_force',
    title: 'شؤون القوة والذاتية',
    icon: Users,
    color: '#047857',
    itemIds: ['force', 'attendance', 'leaves', 'salaries']
  },
  {
    id: 'field_ops',
    title: 'الانتشار الميداني والسيطرة',
    icon: Radio,
    color: '#b91c1c',
    itemIds: ['vehicles', 'shifts', 'records', 'detainees', 'discipline', 'decrees']
  },
  {
    id: 'logistics',
    title: 'الدعم اللوجستي والإمداد',
    icon: Package,
    color: '#d97706',
    itemIds: ['maintenance', 'fuel', 'inventory']
  },
  {
    id: 'comms',
    title: 'البريد والتوثيق الرسمي',
    icon: Mail,
    color: '#4f46e5',
    itemIds: ['mail', 'referred', 'letters', 'archive']
  },
  {
    id: 'governance',
    title: 'الإدارة والتقارير والرقابة',
    icon: BarChart3,
    color: '#7c3aed',
    itemIds: ['general_reports', 'command_reports', 'user_management', 'general_settings', 'audit_log']
  }
];

export default function SidebarNav({
  sections = [],
  activeSection,
  onSelectSection,
  user = {},
  isMobileOpen = false,
  onCloseMobile,
  onOpenProfileModal
}) {
  const [navSearch, setNavSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Sections lookup map
  const sectionsMap = useMemo(() => {
    const map = new Map();
    sections.forEach((s) => map.set(s.id, s));
    return map;
  }, [sections]);

  // Filtered Divisions & Items
  const filteredDivisions = useMemo(() => {
    const q = normalizeArabicText(navSearch.trim());

    return SECTION_DIVISIONS.map((div) => {
      const allowedItems = div.itemIds
        .map((id) => sectionsMap.get(id))
        .filter(Boolean)
        .filter((sec) => !q || normalizeArabicText(sec.name).includes(q));

      return {
        ...div,
        items: allowedItems
      };
    }).filter((div) => div.items.length > 0);
  }, [sectionsMap, navSearch]);

  return (
    <>
      {/* Backdrop for Mobile */}
      <div
        className={`sidebar-backdrop ${isMobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        {/* Libyan Sovereign Banner Ribbon */}
        <div className="moi-libyan-ribbon" />

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <img
                src="./moi-logo.png"
                onError={(e) => {
                  e.currentTarget.src = MOI_LOGO_BASE64;
                }}
                alt="وزارة الداخلية"
              />
            </div>
            <div className="sidebar-title">
              <h2>وزارة الداخلية</h2>
              <span>مديرية أمن أوباري</span>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Nav Search Input */}
        <div className="sidebar-search-box">
          <Search size={14} className="sidebar-search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="بحث سريع في الوحدات..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            aria-label="تصفية الأقسام"
          />
          {navSearch && (
            <button
              type="button"
              className="sidebar-search-clear"
              onClick={() => setNavSearch('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Categorized Navigation */}
        <nav className="sidebar-nav" aria-label="أقسام المنظومة">
          {filteredDivisions.length === 0 ? (
            <div className="sidebar-empty-search">
              <span>لا توجد أقسام مطابقة للبحث</span>
            </div>
          ) : (
            filteredDivisions.map((div) => {
              const isCollapsed = Boolean(collapsedGroups[div.id]) && !navSearch;
              const hasActiveChild = div.items.some((item) => item.id === activeSection);
              const GroupIcon = div.icon;

              return (
                <div key={div.id} className="nav-group-wrapper">
                  <div
                    className={`nav-group-header ${hasActiveChild ? 'has-active' : ''}`}
                    onClick={() => toggleGroup(div.id)}
                    title="انقر لتوسيع / طي المجموعة"
                  >
                    <div className="nav-group-title-box">
                      <GroupIcon size={14} style={{ color: div.color }} />
                      <span className="nav-group-title-text">{div.title}</span>
                    </div>
                    <div className="nav-group-meta">
                      <span className="nav-group-count">{div.items.length}</span>
                      <ChevronDown
                        size={14}
                        className={`nav-group-arrow ${isCollapsed ? 'collapsed' : ''}`}
                      />
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="nav-group-items">
                      {div.items.map((sec) => {
                        const IconComp = sec.icon;
                        const isActive = activeSection === sec.id;
                        return (
                          <div
                            key={sec.id}
                            id={`nav-item-${sec.id}`}
                            data-section={sec.id}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => {
                              onSelectSection(sec.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                          >
                            <IconComp size={16} />
                            <span className="nav-item-label">{sec.name}</span>
                            {isActive && <div className="nav-item-active-marker" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div
          className="sidebar-user"
          onClick={onOpenProfileModal}
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
            <p>
              {user.badge_number || 'MOI-10492'} | {user.rank_title || 'لواء شرطة'}
            </p>
          </div>
          <div className="sidebar-user-settings-icon" title="إعدادات الحساب">
            <Settings size={15} />
          </div>
        </div>
      </aside>
    </>
  );
}
