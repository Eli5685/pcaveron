import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../utils/api';
import ProductModal from '../components/ProductModal/ProductModal';
import './ProductPage.css';

const ProductPage = ({ tg }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await getProduct(parseInt(id));
      setProduct(productData);
    } catch (err) {
      console.error('Ошибка загрузки товара:', err);
      setError('Товар не найден');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="product-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка товара...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-page">
        <div className="error-container">
          <div className="error-icon">📦</div>
          <h2>Товар не найден</h2>
          <p>Возможно, товар был удален или ссылка неверна</p>
          <button className="back-button" onClick={handleBack}>
            ← Вернуться к каталогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-page">
      {/* Используем ProductModal для отображения товара */}
      <ProductModal
        product={product}
        onClose={handleBack}
        tg={tg}
      />
    </div>
  );
};

export default ProductPage;