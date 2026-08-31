import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { analytics } from './services/analytics'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

analytics.init();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('Service worker registrado:', reg);
      })
      .catch(err => {
        console.warn('Error registrando service worker:', err);
      });
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  window.dispatchEvent(new Event('deferredPromptReady'));
});