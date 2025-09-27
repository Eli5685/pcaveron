import React, { useState, useEffect } from 'react';
import { StaticImage } from '../../utils/assets';
import './SearchBar.css';

const SearchBar = ({
  onSearch,
  value,
  placeholder = "Поиск товаров...",
  variant = 'mobile',
  className = '',
  autoFocus = false
}) => {
  const [searchValue, setSearchValue] = useState(value || '');

  useEffect(() => {
    setSearchValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const containerClass = [
    'search-bar-container',
    variant === 'desktop' ? 'search-bar-desktop' : 'search-bar-mobile',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-wrapper">
          <div className="search-icon">
            <StaticImage src="icon-search.png" alt="Поиск" className="search-icon-img" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="search-input"
            autoComplete="off"
            autoFocus={autoFocus}
            aria-label={placeholder}
          />

          {searchValue && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-button"
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;