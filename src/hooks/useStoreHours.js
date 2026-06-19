import { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export const useStoreHours = () => {
  const { businessConfig } = useShop();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const { shifts, timezone } = businessConfig.schedule;

    const checkStatus = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });

      const parts = formatter.formatToParts(now);
      let hour = 0;
      let minute = 0;
      parts.forEach((part) => {
        if (part.type === 'hour') hour = parseInt(part.value, 10);
        if (part.type === 'minute') minute = parseInt(part.value, 10);
      });

      const current = hour * 60 + minute;

      const open = (shifts || []).some(({ open, close }) => {
        const [oh, om] = open.split(':').map(Number);
        const [ch, cm] = close.split(':').map(Number);
        const openMin = oh * 60 + om;
        const closeMin = ch * 60 + cm;
        if (closeMin <= openMin) {
          return current >= openMin || current < closeMin;
        }
        return current >= openMin && current < closeMin;
      });

      setIsOpen(open);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, [businessConfig.schedule]);

  return isOpen;
};