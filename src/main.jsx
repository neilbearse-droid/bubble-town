import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.jsx';
import './index.css';

// Inside the native iOS shell, run native-only setup (status bar, splash).
// Kept out of the web bundle's main path via dynamic import.
if (Capacitor.isNativePlatform()) {
  import('./lib/native.js').then((m) => m.initNative()).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
