import { useEffect } from 'react';

let modalCount = 0;

export const useBackGuard = (isOpen, onClose) => {
  useEffect(() => {
    if (!isOpen) return;

    modalCount += 1;

    if (modalCount === 1) {
      window.history.pushState({ modal: true }, '');
    }

    const handlePopState = () => {
      window.history.pushState({ modal: true }, '');
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      modalCount = Math.max(0, modalCount - 1);
    };
  }, [isOpen, onClose]);
};