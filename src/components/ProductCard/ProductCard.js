import React, { memo } from 'react';
import ProductImage from '../ProductImage/ProductImage';
import SwipeCarousel from '../SwipeCarousel/SwipeCarousel';
import RubleIcon from '../RubleIcon/RubleIcon';
import './ProductCard.css';

const ProductCard = memo(({ product, onClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price);
  };

  const getOriginalPrice = (currentPrice) => {
    // Рассчитываем оригинальную цену как +17.5% от текущей
    return Math.round(currentPrice * 1.175);
  };

  const getPhotos = () => {
    if (product.photos && product.photos.length > 0) {
      return Array.isArray(product.photos) ? product.photos : [product.photos];
    }
    return [];
  };

  const hasStock = () => {
    return (product.stock_rf > 0) || (product.stock_china > 0);
  };

  const stockRf = product.stock_rf || 0;
  const stockChina = product.stock_china || 0;

  return (
    <div className={`product-card-compact ${!hasStock() ? 'out-of-stock' : ''}`} onClick={onClick}>
      <div className="product-image-container-compact">
        {getPhotos().length > 0 ? (
          <SwipeCarousel
            images={getPhotos()}
            showArrows={false}
            showIndicators={true}
            rounded={false}
            alt={product.name}
            fillParentHeight={true}
          />
        ) : (
          <ProductImage 
            src={null}
            alt={product.name}
            placeholder="Фото товара"
          />
        )}
      </div>

      <div className="product-info-compact">
        <h3 className="product-name-compact">{product.name}</h3>

        <div className="product-price-compact">
          <div className="price-current">
            {formatPrice(product.price)}
            <RubleIcon size={16} className="price-ruble-icon" />
          </div>
          <div className="price-original">
            {formatPrice(getOriginalPrice(product.price))}
            <RubleIcon size={14} className="price-ruble-icon" />
          </div>
        </div>

        <div className="product-stock-compact" aria-label={`Наличие: РФ ${stockRf}, Китай ${stockChina}`}>
          {stockRf > 0 || stockChina > 0 ? (
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
      </div>
    </div>
  );
});

export default ProductCard;
