import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  LayoutDashboard,
  Users,
  Car,
  Plane,
  Clock,
  Radio,
  User,
  Shield,
  ArrowRight,
  ExternalLink,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { normalizeArabicText } from '../utils/arabicUtils.js';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  sections = [],
  forceMembers = [],
  onSelectSection,
  onViewOfficer
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Global keydown handler for Escape & arrow keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Results
  const results = useMemo(() => {
    const q = normalizeArabicText(searchTerm.trim());

    // 1. Matching Sections
    const matchedSections = sections
      .filter((s) => !q || normalizeArabicText(s.name).includes(q))
      .map((s) => ({
        type: 'section',
        id: s.id,
        title: s.name,
        subtitle: 'قسم في المنظومة',
        icon: s.icon || LayoutDashboard,
        action: () => {
          onSelectSection(s.id);
          onClose();
        }
      }));

    // 2. Matching Force Members (Top 6 matches)
    let matchedMembers = [];
    if (q && q.length >= 2 && Array.isArray(forceMembers)) {
      matchedMembers = forceMembers
        .filter((m) => {
          const normName = normalizeArabicText(m.name || '');
          const normNat = normalizeArabicText(m.national_id || '');
          const normJob = normalizeArabicText(m.job_number || '');
          const normFin = normalizeArabicText(m.financial_number || '');
          return (
            normName.includes(q) ||
            normNat.includes(q) ||
            normJob.includes(q) ||
            normFin.includes(q)
          );
        })
        .slice(0, 6)
        .map((m) => ({
          type: 'member',
          id: m.id,
          title: m.name,
          subtitle: `${m.job_title || 'منتسب'} | رقم وطني: ${m.national_id || '---'} | ر.م: ${m.financial_number || m.job_number || '---'}`,
          icon: Users,
          memberData: m,
          action: () => {
            if (onViewOfficer) onViewOfficer(m);
            else onSelectSection('force');
            onClose();
          }
        }));
    }

    return [...matchedSections, ...matchedMembers];
  }, [searchTerm, sections, forceMembers, onSelectSection, onViewOfficer, onClose]);

  // Handle keyboard navigation in list
  const handleInputKeyDown = (e) => {
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        results[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="moi-palette-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="moi-palette-card" onClick={(e) => e.stopPropagation()}>
        {/* Ribbon Header */}
        <div className="moi-palette-ribbon" />

        {/* Input Bar */}
        <div className="moi-palette-search-bar">
          <Search size={20} className="moi-palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="moi-palette-input"
            placeholder="ابحث عن قسم، ضابط، رقم وطني، أو آلية... (اكتب للبحث السريع)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            aria-label="بحث سريع في المنظومة"
          />
          <div className="moi-palette-badge">
            <span>ESC للإغلاق</span>
          </div>
        </div>

        {/* Results List */}
        <div className="moi-palette-list" ref={listRef}>
          {results.length === 0 ? (
            <div className="moi-palette-empty">
              <Search size={32} className="text-slate-300 mb-2" />
              <p>لم يتم العثور على نتائج مطابقة لـ "{searchTerm}"</p>
              <span className="text-xs text-slate-400 mt-1">تأكد من كتابة الاسم أو الرقم بشكل صحيح</span>
            </div>
          ) : (
            results.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  className={`moi-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="moi-palette-item-icon">
                    <IconComp size={18} />
                  </div>
                  <div className="moi-palette-item-content">
                    <div className="moi-palette-item-title">{item.title}</div>
                    <div className="moi-palette-item-sub">{item.subtitle}</div>
                  </div>
                  <div className="moi-palette-item-action">
                    {item.type === 'member' ? (
                      <span className="badge-member-view">عرض البطاقة</span>
                    ) : (
                      <CornerDownLeft size={14} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="moi-palette-footer">
          <div className="palette-footer-hint">
            <kbd>↑</kbd> <kbd>↓</kbd> <span>للتنقل</span>
          </div>
          <div className="palette-footer-hint">
            <kbd>↵ Enter</kbd> <span>للاختيار</span>
          </div>
          <div className="palette-footer-hint">
            <kbd>Ctrl + K</kbd> <span>لفتح البحث في أي وقت</span>
          </div>
        </div>
      </div>
    </div>
  );
}
