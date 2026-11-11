import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Building2, Briefcase, Shield, Search, Plus, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import initialDepartments from '../data/departments_data.json';
import initialJobs from '../data/jobs_data.json';

export default function SettingsSection({ user = {} }) {
  const [activeTab, setActiveTab] = useState('departments');
  const [searchTerm, setSearchTerm] = useState('');

  // Departments State
  const [departments, setDepartments] = useState(() => {
    const saved = localStorage.getItem('ubari_departments');
    return saved ? JSON.parse(saved) : initialDepartments;
  });

  // Jobs State
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem('ubari_jobs');
    return saved ? JSON.parse(saved) : initialJobs;
  });

  // System identity state
  const [sysIdentity, setSysIdentity] = useState(() => {
    const saved = localStorage.getItem('ubari_sys_identity');
    return saved ? JSON.parse(saved) : {
      directorate_name: 'مديرية أمن أوباري',
      ministry_name: 'وزارة الداخلية - دولة ليبيا',
      commander_name: 'سيادة اللواء / موسى سعد محمد البدين',
      commander_title: 'مدير أمن أوباري',
      hotline: '071-552100',
      radio_freq: '148.850 MHz (غرفة السيطرة)'
    };
  });

  // Modal states
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');

  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ubari_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('ubari_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('ubari_sys_identity', JSON.stringify(sysIdentity));
  }, [sysIdentity]);

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter(d => {
      return !searchTerm ||
        d.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.HeadName && d.HeadName.toLowerCase().includes(searchTerm.toLowerCase()));
    });
  }, [departments, searchTerm]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      return !searchTerm || j.JobTitleName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [jobs, searchTerm]);

  // Add Department
  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    const newDept = {
      DepartmentID: Date.now(),
      DepartmentName: newDeptName,
      HeadName: newDeptHead || 'غير محدد'
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptHead('');
    setIsAddDeptOpen(false);
  };

  // Add Job
  const handleAddJob = (e) => {
    e.preventDefault();
    if (!newJobTitle) return;
    const newJ = {
      JobTitleID: Date.now(),
      JobTitleName: newJobTitle
    };
    setJobs([...jobs, newJ]);
    setNewJobTitle('');
    setIsAddJobOpen(false);
  };

  return (
    <div className="section-container" style={{ padding: '24px', direction: 'rtl' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={28} color="#1e3a8a" />
            الإعدادات العامة والتهيئة الإدارية
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            مديرية أمن أوباري | إدارة الأقسام والمراكز (31 قسماً)، الرتب والمسميات الوظيفية، والهوية الرسمية للمنظومة
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('departments')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'departments' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'departments' ? '#ffffff' : '#475569'
            }}
          >
            🏢 الأقسام والمراكز ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'jobs' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'jobs' ? '#ffffff' : '#475569'
            }}
          >
            👔 المسميات والرتب الوظيفية ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
              background: activeTab === 'identity' ? '#1e3a8a' : '#f1f5f9',
              color: activeTab === 'identity' ? '#ffffff' : '#475569'
            }}
          >
            🛡️ الهوية السيادية والترويسة
          </button>
        </div>

        {activeTab !== 'identity' && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="بحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 36px 8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {activeTab === 'departments' ? (
              <button
                onClick={() => setIsAddDeptOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> إضافة قسم
              </button>
            ) : (
              <button
                onClick={() => setIsAddJobOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#1e3a8a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> إضافة مسمى
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: Departments */}
      {activeTab === 'departments' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '14px 16px', width: '60px' }}>ر.م</th>
                <th style={{ padding: '14px 16px' }}>اسم القسم / المركز التابع للمديرية</th>
                <th style={{ padding: '14px 16px' }}>رئيس القسم / المكلف بالإشراف</th>
                <th style={{ padding: '14px 16px', width: '140px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredDepartments.map((dept, idx) => (
                <tr key={dept.DepartmentID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Building2 size={15} color="#1e3a8a" /> {dept.DepartmentName}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontWeight: 700 }}>
                    {dept.HeadName || 'غير محدد'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#15803d',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} /> مفعل بالهيكل
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Jobs */}
      {activeTab === 'jobs' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                <th style={{ padding: '14px 16px', width: '60px' }}>ر.م</th>
                <th style={{ padding: '14px 16px' }}>المسمى الوظيفي / الرتبة</th>
                <th style={{ padding: '14px 16px', width: '140px' }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job, idx) => (
                <tr key={job.JobTitleID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0a192f' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={15} color="#1e3a8a" /> {job.JobTitleName}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: '#15803d'
                    }}>
                      معتمد رسمياً
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: System Identity */}
      {activeTab === 'identity' && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '20px' }}>بيانات الترويسة والقيادة الأمنية للمديرية</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم المديرية الرسمي</label>
              <input
                type="text"
                value={sysIdentity.directorate_name}
                onChange={(e) => setSysIdentity({ ...sysIdentity, directorate_name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الوزارة التابعة</label>
              <input
                type="text"
                value={sysIdentity.ministry_name}
                onChange={(e) => setSysIdentity({ ...sysIdentity, ministry_name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم السيد مدير الأمن</label>
              <input
                type="text"
                value={sysIdentity.commander_name}
                onChange={(e) => setSysIdentity({ ...sysIdentity, commander_name: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>الصفة الرسمية</label>
              <input
                type="text"
                value={sysIdentity.commander_title}
                onChange={(e) => setSysIdentity({ ...sysIdentity, commander_title: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>هاتف الطوارئ والسيطرة</label>
              <input
                type="text"
                value={sysIdentity.hotline}
                onChange={(e) => setSysIdentity({ ...sysIdentity, hotline: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>تردد اللاسلكي المركزي</label>
              <input
                type="text"
                value={sysIdentity.radio_freq}
                onChange={(e) => setSysIdentity({ ...sysIdentity, radio_freq: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => alert('تم حفظ الإعدادات الرسمية للمديرية بنجاح')}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
            >
              حفظ التعديلات
            </button>
          </div>
        </div>
      )}

      {/* Add Dept Modal */}
      {isAddDeptOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>إضافة قسم أو مركز شرطة جديد</h3>
            <form onSubmit={handleAddDept}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم القسم / المركز</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مركز شرطة تين ديري"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>اسم رئيس القسم / المكلف</label>
                <input
                  type="text"
                  placeholder="مثال: رائد / علي محمد"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  حفظ القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddJobOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '450px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0a192f', marginBottom: '16px' }}>إضافة مسمى وظيفي جديد</h3>
            <form onSubmit={handleAddJob}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>المسمى الوظيفي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فني أجهزة اتصالات لاسلكية"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontWeight: 700 }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 800 }}
                >
                  حفظ المسمى
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

