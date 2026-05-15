import { useRef, useEffect, useState, useMemo, useCallback } from 'react';

const BannerCarousel = ({
  images = [],
  interval = 3500,
  transitionMs = 600
}) => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  const slides = useMemo(() => {
    if (!images || images.length === 0) return [];
    return [images[images.length - 1], ...images, images[0]];
  }, [images]);

  const totalSlides = slides.length;
  const realCount = images.length;

  const [index, setIndex] = useState(1);
  const indexRef = useRef(index);
  indexRef.current = index;

  const [width, setWidth] = useState(0);

  const isTransitioningRef = useRef(false);
  const skipTransitionRef = useRef(false);
  const timeoutRef = useRef(null);
  const isInteractingRef = useRef(false);
  const dragging = useRef(false);

  const startX = useRef(0);
  const startTranslate = useRef(0);
  const currentTranslate = useRef(0);

  const moveTo = useCallback((idx, withTransition = true) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = withTransition ? `transform ${transitionMs}ms ease` : 'none';
    isTransitioningRef.current = withTransition;
    const x = -idx * width;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
    currentTranslate.current = x;
  }, [width, transitionMs]);

  const startTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!isInteractingRef.current && !dragging.current) {
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => prev + 1);
      }, interval);
    }
  }, [interval]);

  const stopTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 0;
      setWidth(w);
      if (trackRef.current) {
        trackRef.current.style.width = `${totalSlides * w}px`;
        moveTo(indexRef.current, false);
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [totalSlides, moveTo]);

  useEffect(() => {
    if (width === 0 || totalSlides === 0) return;
    if (skipTransitionRef.current) {
      moveTo(index, false);
      skipTransitionRef.current = false;
    } else {
      moveTo(index, true);
    }
    startTimer();
    return stopTimer;
  }, [index, width, totalSlides, startTimer, stopTimer, moveTo]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onTransitionEnd = () => {
      isTransitioningRef.current = false;
      if (indexRef.current === totalSlides - 1) {
        skipTransitionRef.current = true;
        setIndex(1);
      } else if (indexRef.current === 0) {
        skipTransitionRef.current = true;
        setIndex(totalSlides - 2);
      }
    };
    track.addEventListener('transitionend', onTransitionEnd);
    return () => track.removeEventListener('transitionend', onTransitionEnd);
  }, [totalSlides]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

    const onStart = (e) => {
      if (isTransitioningRef.current) return;
      stopTimer();
      dragging.current = true;
      isInteractingRef.current = true;
      startX.current = getClientX(e);
      startTranslate.current = currentTranslate.current;
      track.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!dragging.current) return;
      const x = getClientX(e);
      const dx = x - startX.current;
      const newTranslate = startTranslate.current + dx;
      track.style.transform = `translate3d(${newTranslate}px, 0, 0)`;
      currentTranslate.current = newTranslate;
    };

    const onEnd = (e) => {
      if (!dragging.current) return;
      dragging.current = false;
      isInteractingRef.current = false;
      const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const dx = x - startX.current;
      const threshold = Math.max(40, width * 0.15);
      if (dx < -threshold) {
        setIndex((prev) => prev + 1);
      } else if (dx > threshold) {
        setIndex((prev) => prev - 1);
      } else {
        moveTo(indexRef.current, true);
        startTimer();
      }
    };

    container.addEventListener('touchstart', onStart, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onEnd);
    container.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    return () => {
      container.removeEventListener('touchstart', onStart);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('mousedown', onStart);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
    };
  }, [width, totalSlides, startTimer, stopTimer, moveTo]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onEnter = () => { isInteractingRef.current = true; stopTimer(); };
    const onLeave = () => { isInteractingRef.current = false; startTimer(); };
    const onVisibilityChange = () => { if (document.hidden) stopTimer(); else startTimer(); };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stopTimer();
    };
  }, [startTimer, stopTimer]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full relative group">
      <div
        ref={containerRef}
        className="w-full overflow-hidden rounded-2xl shadow-lg touch-pan-y"
        role="region"
        aria-roledescription="carousel"
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{
            width: width > 0 ? `${totalSlides * width}px` : 'auto',
            transform: `translate3d(${-index * width}px, 0, 0)`,
          }}
        >
          {slides.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative"
              style={{ width: width > 0 ? `${width}px` : '100%' }}
              aria-hidden={i !== index}
            >
              <img
                src={src}
                alt={`Banner ${((i + images.length - 1) % images.length) + 1}`}
                className="w-full h-full object-cover min-h-[150px] md:min-h-[300px] block select-none"
                loading="lazy"
                draggable="false"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {images.map((_, i) => {
          const realIndex = (index - 1 + realCount) % realCount;
          return (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i + 1); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                realIndex === i ? 'bg-white w-4' : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Ir al banner ${i + 1}`}
              aria-current={realIndex === i ? 'true' : 'false'}
            />
          );
        })}
      </div>
    </div>
  );
};

export default BannerCarousel;