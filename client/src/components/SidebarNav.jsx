import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Users,
  Car,
  Radio,
  Mail,
  Share2,
  Send,
  Camera,
  Settings,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { normalizeArabicText } from '../utils/arabicUtils.js';
import OfficialLogo from './OfficialLogo';

// Official Directorate Operational Divisions
export const SECTION_DIVISIONS = [
  {
    id: 'command',
    title: 'القيادة والعمليات المركزية',
    icon: Shield,
    color: '#1e3a8a',
    itemIds: ['dashboard', 'operations']
  },
  {
    id: 'hr_force',
    title: 'شؤون القوة والذاتية',
    icon: Users,
    color: '#047857',
    itemIds: ['force', 'leaves']
  },
  {
    id: 'field_ops',
    title: 'الانتشار الميداني والآليات',
    icon: Car,
    color: '#b91c1c',
    itemIds: ['vehicles']
  },
  {
    id: 'comms',
    title: 'البريد والتوثيق الرسمي',
    icon: Mail,
    color: '#4f46e5',
    itemIds: ['mail', 'referred', 'letters']
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

      <aside
        className={`dashboard-sidebar ${isMobileOpen ? 'sidebar-open' : ''} ${
          isSidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
        style={isSidebarCollapsed ? { width: '84px', minWidth: '84px' } : undefined}
      >
        {/* Libyan Sovereign Banner Ribbon */}
        <div className="moi-libyan-ribbon" />

        {/* Sidebar Header with New Sovereign Logo */}
        <div className="sidebar-header" style={{ padding: isSidebarCollapsed ? '16px 8px' : '20px 18px' }}>
          <div className="sidebar-brand" style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: '100%' }}>
            <div className="sidebar-logo" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <OfficialLogo size={isSidebarCollapsed ? 36 : 42} />
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-title">
                <h2>وزارة الداخلية</h2>
                <span>مديرية أمن أوباري</span>
              </div>
            )}
          </div>

          <button
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapse Toggle Button (Matching Reference Design: << Collapse) */}
        <div style={{ padding: isSidebarCollapsed ? '8px 6px' : '6px 16px', display: 'flex', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}>
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: isSidebarCollapsed ? '40px' : 'auto',
              justifyContent: 'center'
            }}
            title={isSidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight size={14} />
            ) : (
              <>
                <ChevronsLeft size={14} />
                <span>طي القائمة</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Nav Search Input (Only when expanded) */}
        {!isSidebarCollapsed && (
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
        )}

        {/* Category Label (MENU) */}
        {!isSidebarCollapsed && (
          <div style={{ padding: '12px 18px 4px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '1px' }}>
            القوائم والعمليات (MENU)
          </div>
        )}

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
                  {!isSidebarCollapsed && (
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
                  )}

                  {(!isCollapsed || isSidebarCollapsed) && (
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
                            style={{
                              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                              padding: isSidebarCollapsed ? '10px' : '9px 12px',
                              borderRadius: '12px'
                            }}
                            title={sec.name}
                            onClick={() => {
                              onSelectSection(sec.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                          >
                            <IconComp size={18} />
                            {!isSidebarCollapsed && <span className="nav-item-label">{sec.name}</span>}
                            {isActive && !isSidebarCollapsed && <div className="nav-item-active-marker" />}
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

        {/* User Card in Sidebar Footer (Matching Profile Card with Avatar & Chevron) */}
        <div
          className="sidebar-user"
          onClick={onOpenProfileModal}
          style={{
            padding: isSidebarCollapsed ? '12px 6px' : '14px 16px',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            borderRadius: '16px',
            margin: '8px'
          }}
          title="الملف الشخصي وإعدادات الحساب"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-user-avatar" style={{ width: '38px', height: '38px', borderRadius: '50%' }}>
              {user.avatar ? (
                <img src={user.avatar} alt="صورة المستخدم" className="user-avatar-img" />
              ) : (
                <span>{user.full_name ? user.full_name.charAt(0) : 'م'}</span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="sidebar-user-info">
                <h4>{user.full_name || 'سيادة اللواء / موسى سعد'}</h4>
                <p>مدير أمن أوباري</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && (
            <div style={{ color: '#94a3b8' }}>
              <ChevronLeft size={16} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
