import React, { useState, useEffect, useMemo } from 'react';
import { showMainButton, hideMainButton, isTelegramWebApp } from '../../utils/api';
import { StaticImage } from '../../utils/assets';
import SwipeCarousel from '../SwipeCarousel/SwipeCarousel';
import RubleIcon from '../RubleIcon/RubleIcon';
import './ProductModal.css';

const ProductModal = ({ product, onClose, tg }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Нормализация массивов характеристик из БД (jsonb/строка)
  const normalizeToStringArray = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === 'string' ? v.trim() : ''))
        .filter((v) => v.length > 0);
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return [];
  };

  const colors = normalizeToStringArray(product?.colors);
  const sizes = normalizeToStringArray(product?.sizes);

  const getGenderLabel = (gender) => {
    if (!gender) return '';
    const map = {
      male: 'Мужской',
      female: 'Женский',
      unisex: 'Унисекс',
      kids: 'Детский',
      other: 'Другое'
    };
    const key = String(gender).toLowerCase();
    return map[key] || gender;
  };

  const primaryLink = useMemo(() => {
    if (product.avito_link) return product.avito_link;
    if (product.ozon_link) return product.ozon_link;
    if (product.wb_link) return product.wb_link;
    return 'https://t.me/Griffith_br';
  }, [product]);

  useEffect(() => {
    // Показываем кнопку "Заказать" в Telegram (ведёт на приоритетную ссылку)
    if (isTelegramWebApp() && tg) {
      showMainButton('Заказать товар', () => {
        window.open(primaryLink, '_blank');
      });
    }

    // Блокируем прокрутку фона
    document.body.style.overflow = 'hidden';

    return () => {
      hideMainButton();
      document.body.style.overflow = 'auto';
    };
  }, [product, tg, primaryLink]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getOriginalPrice = (currentPrice) => {
    // Рассчитываем оригинальную цену как +17.5% от текущей
    return Math.round(currentPrice * 1.175);
  };

  const getPhotos = () => {
    if (product.photos && Array.isArray(product.photos)) {
      return product.photos;
    }
    return ['placeholder-product.svg'];
  };

  const photos = getPhotos();

  const stockRf = product.stock_rf || 0;
  const stockChina = product.stock_china || 0;

  const hasStock = () => (stockRf > 0) || (stockChina > 0);

  // Функция для проверки наличия характеристик
  const hasCharacteristics = () => {
    return (product.brand && product.brand.trim()) ||
           (product.material && product.material.trim()) ||
           (product.gender && String(product.gender).trim()) ||
           (colors.length > 0) ||
           (sizes.length > 0);
  };

  const stockInfoLabel = `Наличие: РФ ${stockRf}, Китай ${stockChina}`;

  // Ссылка на менеджера с предзаполненным текстом (для direct_purchase)
  const managerUsername = 'Griffith_br';
  const managerBaseUrl = `https://t.me/${managerUsername}`;
  const directMessage = `Здравствуйте! Пишу по поводу товара: ${product.name}. Хотел бы уточнить наличие, доставку (Почта России / СДЭК / 5Post и другие способы доставки) и оплату.`;
  const managerDeepLink = `${managerBaseUrl}?text=${encodeURIComponent(directMessage)}`;

  return (
    <>
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        {/* Кнопка закрытия */}
        <button className="close-button" onClick={onClose}>
          ✕
        </button>

        {/* Галерея фотографий */}
        <div className="photo-gallery">
          <SwipeCarousel
            images={photos}
            initialIndex={currentPhotoIndex}
            onIndexChange={(i) => setCurrentPhotoIndex(i)}
            fillParentHeight={true}
            alt={product.name}
            showArrows={true}
            showIndicators={true}
            onImageClick={() => setIsFullscreen(true)}
          />
        </div>

        {/* Информация о товаре */}
        <div className="product-info-modal">
          <div className="product-header">
            <h2 className="product-name">{product.name}</h2>
            <div className="product-price">
              <div className="price-original-modal">
                {formatPrice(getOriginalPrice(product.price))}
                <RubleIcon size={14} className="price-ruble-icon" />
              </div>
              <div className="price-current-modal">
                {formatPrice(product.price)}
                <RubleIcon size={20} className="price-ruble-icon" />
              </div>
            </div>
          </div>

          {/* Статус наличия */}
          <div className={`stock-info-modal ${hasStock() ? 'available' : 'unavailable'}`} aria-label={stockInfoLabel}>
            {hasStock() ? (
              <div className="stock-chips">
                <span className={`chip ${stockRf > 0 ? 'ok' : 'zero'}`} title={`РФ: ${stockRf}`}>
                  <span className="dot rf" /> РФ {stockRf}
                </span>
                <span className={`chip ${stockChina > 0 ? 'ok' : 'zero'}`} title={`Китай: ${stockChina}`}>
                  <span className="dot cn" /> Китай {stockChina}
                </span>
              </div>
            ) : (
              <span className="chip none">Нет в наличии</span>
            )}
          </div>

          {/* Описание */}
          <div className="product-description">
            <h3>Описание товара:</h3>
            <div className="description-container">
              <div className={`description-text ${isDescriptionExpanded ? 'expanded' : 'collapsed'}`}>
                <p>{product.description || 'Описание товара отсутствует'}</p>
              </div>
              {product.description && product.description.length > 80 && (
                <button 
                  className="expand-text-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Toggle expand:', !isDescriptionExpanded);
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                  onTouchStart={(e) => {
                    // Улучшенная обработка для iOS Safari
                    e.stopPropagation();
                  }}
                  type="button"
                  tabIndex="0"
                  aria-label={isDescriptionExpanded ? 'Свернуть описание' : 'Показать полное описание'}
                >
                  {isDescriptionExpanded ? 'Свернуть' : 'Показать полностью'}
                </button>
              )}
            </div>
          </div>

          {/* Категории товара */}
          {(Array.isArray(product.categories) && product.categories.length > 0) ? (
            <div className="product-categories">
              <h3>Категории:</h3>
              <div className={`categories-chips ${!showAllCategories ? 'collapsed' : ''}`}>
                {(() => {
                  const list = product.categories;
                  const visible = showAllCategories ? list : list.slice(0, 3);
                  return visible.map((cat, idx) => (
                    <span key={idx} className="category-chip">{cat}</span>
                  ));
                })()}
              </div>
              {(() => {
                const count = Array.isArray(product.categories) ? product.categories.length : 0;
                return count > 3 ? (
                  <button
                    className="expand-text-btn"
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllCategories(!showAllCategories); }}
                  >
                    {showAllCategories ? 'Свернуть' : `Показать все (${count})`}
                  </button>
                ) : null;
              })()}
            </div>
          ) : null}

          {/* Характеристики - показываем только если есть данные */}
          {hasCharacteristics() && (
            <div className="product-specs">
              <h3>Характеристики:</h3>
              
              {product.brand && product.brand.trim() && (
                <div className="spec-item">
                  <span className="spec-label">Бренд:</span>
                  <span className="spec-value">{product.brand}</span>
                </div>
              )}
              
              {product.material && product.material.trim() && (
                <div className="spec-item">
                  <span className="spec-label">Материал:</span>
                  <span className="spec-value">{product.material}</span>
                </div>
              )}
              
              {product.gender && String(product.gender).trim() && (
                <div className="spec-item">
                  <span className="spec-label">Пол:</span>
                  <span className="spec-value">{getGenderLabel(product.gender)}</span>
                </div>
              )}
              
              {colors.length > 0 && (
                <div className="spec-item">
                  <span className="spec-label">Цвета:</span>
                  <div className="spec-colors">
                    {colors.map((color, index) => (
                      <span key={index} className="color-tag">{color}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {sizes.length > 0 && (
                <div className="spec-item">
                  <span className="spec-label">Размеры:</span>
                  <div className="spec-sizes">
                    {sizes.map((size, index) => (
                      <span key={index} className="size-tag">{size}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Кнопки маркетплейсов или менеджер */}
          <div className={`order-section ${(product.avito_link && product.ozon_link) ? 'two-cols' : ''}`}>
            {product.direct_purchase ? (
              <>
                <div className="direct-purchase-note">
                  Этот товар отправляем Почтой России, СДЭК, 5Post и другие службы доставки. Нажмите кнопку ниже, чтобы уточнить детали доставки и оплаты.
                </div>
                <a
                  href={managerDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="order-button-manager tg"
                  aria-label="Написать менеджеру в Telegram"
                >
                  <svg className="tg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" aria-hidden="true">
                    <path fill="#2AABEE" d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0z"/>
                    <path fill="#fff" d="M179.3 76.9c2.2-1.4 4.5 1.1 3.8 3.8l-21.9 92.1c-.7 2.9-3.9 4.1-6.2 2.3l-33.9-24.8-16.4 15.8c-1.8 1.7-4.7.9-5.4-1.5l-6-19.8-21.7-7.2c-2.9-1-3-5 .1-6.1l107.6-54.6zM97.5 152.1l3.3-24.1 68.3-61.8-79.9 52.1-26.2-8.7 34.5 42.5z"/>
                  </svg>
                  Написать менеджеру в Telegram
                </a>
              </>
            ) : (
              <>
                {product.avito_link && (
                  <a
                    href={product.avito_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-button-avito"
                    aria-label="Купить на Avito"
                  >
                    <StaticImage src="Avito_logo.svg" alt="Avito" className="avito-logo" />
                  </a>
                )}
                {product.ozon_link && (
                  <a
                    href={product.ozon_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-button-ozon"
                    aria-label="Купить на Ozon"
                  >
                    <svg className="ozon-logo" xmlns="http://www.w3.org/2000/svg" width="120" height="26" viewBox="0 0 483.969 105.938" aria-hidden="true">
                      <path fill="#0069ff" fillRule="evenodd" d="M58.18.289a52.956 52.956 0 1 0 47.134 47.28A52.89 52.89 0 0 0 58.18.289zm-1.716 80.689A28.247 28.247 0 1 1 80.716 56.65a28.236 28.236 0 0 1-24.252 24.328zm77.174-78.594a12.356 12.356 0 0 0-12.06 14.908c1.162 5.822 6.6 9.8 12.524 9.8h34.378l-53.5 70.8a3.529 3.529 0 0 0 2.8 5.659h83.92c5.92 0 11.362-3.977 12.524-9.8a12.357 12.357 0 0 0-12.055-14.91h-41.887l53.459-70.745a3.562 3.562 0 0 0-2.829-5.712h-77.274zm335.339.285a12.542 12.542 0 0 0-9.639 12.4v41.138L392.679 3.161a3.545 3.545 0 0 0-5.749 2.786v84.941a12.541 12.541 0 0 0 9.639 12.4 12.341 12.341 0 0 0 14.993-12.07V49.724l66.66 53.047a3.544 3.544 0 0 0 5.747-2.785V14.735a12.341 12.341 0 0 0-14.992-12.066zM295.415 24.727c28.195 0 49.262 14.9 49.262 28.228s-21.067 28.228-49.262 28.228-49.262-14.9-49.262-28.228 21.067-28.228 49.262-28.228m0-24.707c-40.811 0-73.894 23.7-73.894 52.935s33.083 52.935 73.894 52.935 73.893-23.7 73.893-52.935S336.225.02 295.415.02z"/>
                    </svg>
                  </a>
                )}
                {product.wb_link && (
                  <a
                    href={product.wb_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-button-wb"
                    aria-label="Купить на Wildberries"
                  >
                    <svg className="wb-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 216 58" aria-hidden="true">
                      <path fill="currentColor" d="M201.056 24.85c0-1.35 1.841-2.439 4.253-2.439 2.516 0 5.084 1.194 6.821 3.14l3.139-3.84c-2.983-2.648-6.018-4.023-9.804-4.023-4.721 0-9.596 2.18-9.596 7.162 0 6.125 5.29 6.566 9.596 6.93 2.412.18 4.539.363 4.539 1.946 0 1.712-2.438 2.49-4.591 2.49-2.49 0-5.187-1.063-7.158-3.425l-3.346 3.556c2.671 3.27 6.536 4.697 10.322 4.697 4.747 0 9.96-2.258 9.96-7.422 0-5.84-5.343-6.41-9.441-6.825-2.568-.26-4.694-.493-4.694-1.947Zm-23.861 1.454c.856-2.154 2.697-3.4 5.42-3.4 2.749 0 4.383 1.323 5.084 3.4h-10.504Zm5.68-8.616c-6.484 0-11.698 5.06-11.698 11.704 0 6.254 4.617 11.652 11.412 11.652 4.098 0 7.418-1.973 9.778-5.346l-3.579-3.036c-1.271 1.946-3.553 3.088-6.277 3.088-2.775 0-5.654-2.076-5.887-5.139h16.936v-1.816c-.052-6.41-4.409-11.107-10.685-11.107Zm-66.345 0c-6.484 0-11.697 5.06-11.697 11.704 0 6.254 4.617 11.652 11.412 11.652 4.098 0 7.418-1.973 9.778-5.346l-3.579-3.036c-1.271 1.946-3.553 3.088-6.277 3.088-2.775 0-5.654-2.076-5.887-5.139h16.936v-1.816c-.026-6.41-4.409-11.107-10.686-11.107Zm46.815 22.551h5.187V18.492h-5.187V40.24Zm2.593-32.335c-2.1 0-3.89 1.765-3.89 3.97 0 2.18 1.738 3.79 3.994 3.79 2.205 0 3.813-1.557 3.813-3.711-.026-2.206-1.79-4.049-3.917-4.049ZM90.75 17.662c-2.438 0-4.642.727-6.51 1.998V8.164h-5.187v21.228c0 6.461 5.265 11.652 11.671 11.652 6.458 0 11.749-5.164 11.749-11.704-.026-6.514-5.213-11.678-11.723-11.678Zm-26.973.363c-5.784.597-10.505 5.58-10.505 11.523 0 6.28 5.37 11.548 11.646 11.548 6.25 0 11.645-5.268 11.645-11.548 0-2.673-.96-5.139-2.516-7.085L62.532 8.19h-6.718l7.963 9.835ZM23.576 30.871l-4.747-12.379H15.2l-4.773 12.379-4.772-12.379H0l8.351 21.8h3.631l5.006-12.976 5.058 12.975h3.63l8.326-21.799h-5.628l-4.798 12.379Zm111.55-7.422v-4.957h-5.187V40.24h5.187v-9.186c0-4.464 4.773-7.189 9.519-7.189v-5.372h-.519c-4.02 0-6.925 1.454-9 4.957Zm16.47 0v-4.957h-5.187V40.24h5.187v-9.186c0-4.464 4.772-7.189 9.518-7.189v-5.372h-.518c-3.995 0-6.899 1.454-9 4.957ZM45.414 40.239H50.6V8.19h-5.187v32.05Zm19.53-4.386c-3.58 0-6.484-2.88-6.484-6.461 0-3.607 2.904-6.488 6.458-6.488 3.605 0 6.536 2.88 6.536 6.488 0 3.581-2.931 6.461-6.51 6.461Zm25.78 0a6.471 6.471 0 0 1-6.484-6.487c0-3.555 2.775-6.462 6.51-6.462s6.51 2.907 6.51 6.436c0 3.685-2.957 6.513-6.536 6.513Zm-54.31 4.386h5.187V18.492h-5.187V40.24Zm2.542-32.335c-2.101 0-3.865 1.765-3.865 3.997 0 2.258 1.842 3.789 3.865 3.789 2.256 0 3.968-1.869 3.968-3.893-.026-2.05-1.816-3.893-3.968-3.893Zm71.894 18.4c.882-2.154 2.698-3.4 5.395-3.4 2.775 0 4.461 1.323 5.161 3.4H110.85Z"/>
                    </svg>
                  </a>
                )}
                {!(product.avito_link || product.ozon_link || product.wb_link) && (
                  <a
                    href={managerBaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="order-button-manager"
                  >
                    Написать менеджеру
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {isFullscreen && (
      <div className="fullscreen-photo-overlay" onClick={() => setIsFullscreen(false)}>
        <button
          className="fullscreen-close"
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          aria-label="Закрыть изображение"
        >
          ✕
        </button>
        <img
          src={photos[currentPhotoIndex]}
          alt={product.name}
          className="fullscreen-photo"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    )}
    </>
  );
};

export default ProductModal;