import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  if (!categories || categories.length <= 1) {
    return null;
  }

  return (
    <div className="category-filter">
      <div className="category-scroll">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            <span className="category-icon">
              {getCategoryIcon(category)}
            </span>
            <span className="category-text">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Функция для получения иконки категории
const getCategoryIcon = (category) => {
  const icons = {
    'Все': '🛍️',
    'general': '📦',
    'electronics': '📱',
    'clothing': '👕',
    'accessories': '🎧',
    'home': '🏠',
    'beauty': '💄',
    'sport': '⚽',
    'books': '📚',
    'toys': '🧸',
    'auto': '🚗',
    'tools': '🔧'
  };

  return icons[category] || icons[category.toLowerCase()] || '📦';
};

export default CategoryFilter;