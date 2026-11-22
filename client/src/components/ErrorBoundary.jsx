import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('MOI Critical Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    try {
      if (typeof window !== 'undefined' && 'caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    } catch (e) {}
    // Clean reload without polluting the URL with query parameters
    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.href = cleanUrl;
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '30px',
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: '16px',
          margin: '20px',
          border: '1px solid #fee2e2',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <AlertTriangle size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0a192f', marginBottom: '8px' }}>
            نظام الحماية الأمنية الموحد | تم احتواء الخطأ البرمجي بنجاح
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', marginBottom: '18px', lineHeight: 1.6 }}>
            تم عزل الخطأ غير المتوقع لضمان استقرار المنظومة وحماية بيانات الجلسة وسجلات القوة العمومية. يمكنك متابعة العمل أو إعادة تحميل الصفحة فوراً.
          </p>
          {this.state.error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              maxWidth: '650px',
              width: '100%',
              textAlign: 'left',
              direction: 'ltr',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#991b1b',
              overflowX: 'auto',
              wordBreak: 'break-all'
            }}>
              <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
              <span>إعادة تحميل المنظومة</span>
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                background: '#f8fafc',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Home size={16} />
              <span>محاولة الاستئناف</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
