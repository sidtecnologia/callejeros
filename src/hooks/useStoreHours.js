import { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const normalizeTime = (value, fallback = '00:00') => {
  if (typeof value !== 'string') return fallback;

  const match = value.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!match) return fallback;

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return fallback;
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const timeToMinutes = (value) => {
  const normalized = normalizeTime(value);
  const [hour, minute] = normalized.split(':').map(Number);
  return hour * 60 + minute;
};

const normalizeShift = (shift) => ({
  open: normalizeTime(shift?.open, '00:00'),
  close: normalizeTime(shift?.close, '00:00'),
});

const normalizeSchedule = (shifts) => {
  const empty = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };

  if (!shifts) return empty;

  if (Array.isArray(shifts)) {
    const legacy = shifts
      .filter(Boolean)
      .map(normalizeShift);

    return {
      mon: legacy,
      tue: legacy,
      wed: legacy,
      thu: legacy,
      fri: legacy,
      sat: legacy,
      sun: legacy,
    };
  }

  if (typeof shifts !== 'object') return empty;

  return DAYS.reduce((result, day) => {
    const dayShifts = Array.isArray(shifts[day]) ? shifts[day] : [];

    result[day] = dayShifts
      .filter(Boolean)
      .map(normalizeShift);

    return result;
  }, empty);
};

const getZonedDateParts = (date, timezone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone || 'America/Bogota',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = formatter.formatToParts(date);

  const values = {};

  parts.forEach((part) => {
    if (part.type === 'weekday') values.weekday = part.value;
    if (part.type === 'hour') values.hour = Number(part.value);
    if (part.type === 'minute') values.minute = Number(part.value);
  });

  const weekdayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    dayIndex: weekdayMap[values.weekday] ?? 0,
    currentMinutes: (values.hour || 0) * 60 + (values.minute || 0),
  };
};

const shiftIsOpen = (shift, currentMinutes) => {
  const openMinutes = timeToMinutes(shift.open);
  const closeMinutes = timeToMinutes(shift.close);

  if (openMinutes === closeMinutes) {
    return false;
  }

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
};

export const getStoreStatus = (businessConfig, date = new Date()) => {
  const schedule = normalizeSchedule(businessConfig?.schedule?.shifts);
  const timezone = businessConfig?.schedule?.timezone || 'America/Bogota';

  const { dayIndex, currentMinutes } = getZonedDateParts(date, timezone);

  const currentDay = DAYS[dayIndex];
  const previousDay = DAYS[(dayIndex + 6) % 7];

  const currentDayShifts = schedule[currentDay] || [];
  const previousDayShifts = schedule[previousDay] || [];

  const currentDayOpen = currentDayShifts.some((shift) =>
    shiftIsOpen(shift, currentMinutes)
  );

  if (currentDayOpen) {
    return {
      isOpen: true,
      reason: 'open',
      currentDay,
      currentMinutes,
    };
  }

  const previousDayOvernight = previousDayShifts.some((shift) => {
    const openMinutes = timeToMinutes(shift.open);
    const closeMinutes = timeToMinutes(shift.close);

    return (
      closeMinutes < openMinutes &&
      currentMinutes < closeMinutes
    );
  });

  if (previousDayOvernight) {
    return {
      isOpen: true,
      reason: 'open',
      currentDay,
      currentMinutes,
    };
  }

  const hasSchedule = DAYS.some((day) => schedule[day]?.length > 0);

  if (!hasSchedule) {
    return {
      isOpen: false,
      reason: 'no_schedule',
      currentDay,
      currentMinutes,
    };
  }

  const currentDayHasShifts = currentDayShifts.length > 0;

  return {
    isOpen: false,
    reason: currentDayHasShifts ? 'between_shifts' : 'closed',
    currentDay,
    currentMinutes,
  };
};

export const useStoreHours = () => {
  const { businessConfig } = useShop();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      const status = getStoreStatus(businessConfig, new Date());
      setIsOpen(status.isOpen);
    };

    checkStatus();

    const interval = setInterval(checkStatus, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [businessConfig]);

  return isOpen;
};