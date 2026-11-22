import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Automatically clean URL address bar from temporary parameters like nocache
if (typeof window !== 'undefined' && window.location.search) {
  const params = new URLSearchParams(window.location.search);
  if (params.has('nocache')) {
    params.delete('nocache');
    const newSearch = params.toString();
    const cleanUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
    window.history.replaceState(null, '', cleanUrl);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
