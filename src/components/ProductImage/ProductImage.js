import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../../utils/assets';
import './ProductImage.css';

const ProductImage = ({ src, alt, loading = false, placeholder = 'Фото товара' }) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Fallback изображения для надежности
  const fallbackImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop',
    getAssetUrl('placeholder-product.svg') // Локальный fallback
  ];

  const getRandomFallback = () => {
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  };

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    if (!fallbackUsed && src && !src.includes('unsplash')) {
      // Первая ошибка - пробуем fallback
      setFallbackUsed(true);
      setImageError(false);
    } else {
      // Ошибка с fallback - показываем placeholder
      setImageError(true);
    }
  };

  // Reset states when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
      setFallbackUsed(false);
    } else {
      setImageError(true);
      setFallbackUsed(false);
    }
  }, [src]);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '200px',
    overflow: 'hidden',
    background: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center',
    transition: 'opacity 0.15s ease',
    display: 'block'
  };

  const placeholderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    height: '100%',
    fontSize: '12px',
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#fafafa'
  };

  // Определяем какое изображение использовать
  const getImageSrc = () => {
    if (!src) return null;
    if (fallbackUsed || (imageError && src && !src.includes('unsplash'))) {
      return getRandomFallback();
    }
    return src;
  };

  const currentSrc = getImageSrc();

  // Показываем загрузку только если это проп forceLoading
  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <div className="product-image-spinner"></div>
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  // Показываем placeholder если нет src или окончательная ошибка
  if (!currentSrc || (imageError && fallbackUsed)) {
    return (
      <div style={containerStyle}>
        <div style={placeholderStyle}>
          <div style={{fontSize: '32px', marginBottom: '8px'}}>📷</div>
          <div>{placeholder}</div>
        </div>
      </div>
    );
  }

  // Отображаем изображение
  return (
    <div style={containerStyle}>
      <img
        src={currentSrc}
        alt={alt || placeholder}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          ...imageStyle,
          opacity: 1 // Всегда показываем сразу
        }}
        decoding="async"
        loading="lazy"
      />
    </div>
  );
};

export default ProductImage;
