import { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const showBanner = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setDeferredPrompt(e);
      triggerVisible();
    };

    const triggerVisible = () => {
      setVisible(true);
      setIsAnimating(true);
      
      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        handleClose();
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', showBanner);

    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      triggerVisible();
    }

    return () => window.removeEventListener('beforeinstallprompt', showBanner);
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    // Esperamos a que termine la animación de salida (300ms)
    setTimeout(() => setVisible(false), 300);
  };

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;
    if (!promptEvent) return;
    
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      window.deferredPrompt = null;
      setDeferredPrompt(null);
    }
    handleClose();
  };

  if (!visible) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md 
      transition-all duration-500 ease-out transform
      ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
    >
      <div className="bg-white/80 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-2xl p-4 flex items-center justify-between gap-4">
        {/* Icono decorativo moderno */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="ArrowDownTrayIcon" />
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Instalar App</h3>
            <p className="text-xs text-gray-500">Acceso rápido desde tu inicio</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleClose}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1"
          >
            Ahora no
          </button>
          <button 
            onClick={handleInstall}
            className="bg-gray-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-md"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;