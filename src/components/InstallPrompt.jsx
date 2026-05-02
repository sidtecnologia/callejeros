import { useEffect, useState, useRef } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    const initPrompt = () => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt);
        
        
        setTimeout(() => {
          setVisible(true);
          setTimeout(() => setIsAnimating(true), 50);

        
          closeTimer.current = setTimeout(() => {
            handleClose();
          }, 5000);
        }, 3000);
      }
    };

  
    window.addEventListener('deferredPromptReady', initPrompt);
    
 
    if (window.deferredPrompt) initPrompt();

    return () => {
      window.removeEventListener('deferredPromptReady', initPrompt);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setVisible(false), 500);
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
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-md transition-all duration-500 ease-out transform ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
      <div className="bg-white border border-gray-100 shadow-xl rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
            <i className="fa-solid fa-download"></i>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Instalar App</h3>
            <p className="text-xs text-gray-500">Acceso rápido desde tu inicio</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleClose} className="text-xs font-medium text-gray-400 px-2">Ahora no</button>
          <button onClick={handleInstall} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl">Instalar</button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;