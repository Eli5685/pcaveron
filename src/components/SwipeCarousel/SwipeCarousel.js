import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetUrl } from '../../utils/assets';
import './SwipeCarousel.css';

/**
 * SwipeCarousel
 * - Supports touch and mouse drag to swipe between images
 * - Smooth animations, inertia, and bounds
 * - Keyboard arrows navigation
 * - Optional controls and indicators
 */
const SwipeCarousel = ({
  images = [],
  initialIndex = 0,
  aspectRatio = 1,
  onIndexChange,
  className = '',
  showArrows = true,
  showIndicators = true,
  rounded = true,
  alt = 'photo',
  fillParentHeight = false,
  onImageClick
}) => {
  const [index, setIndex] = useState(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)));
  const [direction, setDirection] = useState(0);
  const [loadedMap, setLoadedMap] = useState({}); // { [index]: true }
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (typeof onIndexChange === 'function') onIndexChange(index);
  }, [index, onIndexChange]);

  const paginate = useCallback((newDirection) => {
    if (!images || images.length === 0) return;
    setDirection(newDirection);
    setIndex((prev) => {
      const next = (prev + newDirection + images.length) % images.length;
      return next;
    });
  }, [images]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === 'ArrowLeft') paginate(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paginate]);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 })
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 80;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  const currentSrc = images && images.length ? images[index] : null;

  // Track loading state per slide and preload neighbors
  useEffect(() => {
    if (!images || images.length === 0) return;

    const alreadyLoaded = !!loadedMap[index];
    setIsLoading(!alreadyLoaded);

    const preloadAt = (i) => {
      if (i < 0 || i >= images.length) return;
      const src = images[i];
      if (!src || loadedMap[i]) return;
      const img = new Image();
      img.onload = () => {
        setLoadedMap((prev) => ({ ...prev, [i]: true }));
      };
      img.onerror = () => {
        // Mark as loaded to avoid spinner hanging forever on broken image
        setLoadedMap((prev) => ({ ...prev, [i]: true }));
      };
      img.src = src;
    };

    // Preload current, previous and next
    preloadAt(index);
    preloadAt((index + 1) % images.length);
    preloadAt((index - 1 + images.length) % images.length);
  }, [index, images, loadedMap]);

  const wrapperStyle = fillParentHeight
    ? { height: '100%' }
    : { aspectRatio };

  return (
    <div
      className={`swipe-carousel ${rounded ? 'rounded' : ''} ${className}`}
      ref={containerRef}
      style={wrapperStyle}
    >
      <div className="swipe-carousel-inner">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={`${index}-${currentSrc}`}
            src={currentSrc || ''}
            alt={alt}
            className="swipe-carousel-image"
            onClick={onImageClick}
            style={onImageClick ? { cursor: 'zoom-in' } : undefined}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 500, damping: 40 }, opacity: { duration: 0.15 } }}
            drag="x"
            dragElastic={0.2}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            loading="lazy"
            decoding="async"
            onLoad={() => {
              setLoadedMap((prev) => ({ ...prev, [index]: true }));
              setIsLoading(false);
            }}
            onError={(e) => {
              e.currentTarget.src = getAssetUrl('placeholder-product.svg');
              setLoadedMap((prev) => ({ ...prev, [index]: true }));
              setIsLoading(false);
            }}
          />
        </AnimatePresence>

        {currentSrc && isLoading && (
          <div className="swipe-loading-overlay" aria-label="Загрузка изображения">
            <div className="swipe-spinner" />
          </div>
        )}

        {showArrows && images.length > 1 && (
          <>
            <button className="swipe-arrow left" onClick={() => paginate(-1)} aria-label="Предыдущее фото">‹</button>
            <button className="swipe-arrow right" onClick={() => paginate(1)} aria-label="Следующее фото">›</button>
          </>
        )}

        {showIndicators && images.length > 1 && (
          <div className="swipe-indicators">
            {images.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Перейти к фото ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeCarousel;

