import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard/ProductCard';
import SearchBar from '../components/SearchBar/SearchBar';
import ProductModal from '../components/ProductModal/ProductModal';
import { getProducts, getCategories } from '../utils/api';
import { StaticImage } from '../utils/assets';
import './CatalogPage.css';

const shuffleArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const GENDER_LABELS = {
  male: 'Мужской',
  female: 'Женский',
  unisex: 'Унисекс',
  kids: 'Детский',
  other: 'Другое'
};

const normalizeArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const CatalogPage = ({ tg, isWebApp }) => {
  // Проверка на мобильное устройство и автоматический редирект
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                      window.innerWidth <= 768;
      
      if (isMobile && !isWebApp) {
        window.location.href = 'https://averon.vercel.app/';
        return;
      }
    }
  }, [isWebApp]);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [allGenders, setAllGenders] = useState([]);
  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    stockLocation: 'all',
    sort: 'none',
    selectedCategories: [],
    selectedBrands: [],
    selectedSizes: [],
    selectedGenders: []
  });
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(false);
  const [listExpanded, setListExpanded] = useState({ brands: false, sizes: false, categories: false });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories().catch(() => [])
      ]);

      const randomized = shuffleArray(productsData || []);
      setProducts(randomized);

      let cats = Array.from(
        new Set(
          (categoriesData || [])
            .map((c) => (typeof c === 'string' ? c : c?.name))
            .filter((c) => c && String(c).trim().length > 0)
            .filter((c) => !/^все$/i.test(String(c)))
            .filter((c) => !/^general$/i.test(String(c)))
        )
      ).sort((a, b) => String(a).localeCompare(String(b), 'ru'));

      if (!cats || cats.length === 0) {
        const fromProducts = Array.from(new Set(
          (productsData || [])
            .flatMap((p) => (Array.isArray(p.categories) ? p.categories : []))
            .filter((c) => c && String(c).trim().length > 0)
            .filter((c) => !/^general$/i.test(String(c)))
        ));
        cats = fromProducts.sort((a, b) => String(a).localeCompare(String(b), 'ru'));
      }

      setAllCategories(cats);

      // Извлекаем уникальные бренды
      const brands = Array.from(new Set(
        (productsData || [])
          .map(p => p.brand)
          .filter(b => b && String(b).trim().length > 0)
      )).sort((a, b) => String(a).localeCompare(String(b), 'ru'));
      setAllBrands(brands);

      // Извлекаем уникальные размеры
      const sizes = Array.from(new Set(
        (productsData || [])
          .flatMap(p => normalizeArrayField(p.sizes))
          .filter(s => s && String(s).trim().length > 0)
      )).sort((a, b) => {
        // Сортируем размеры: сначала числовые, затем буквенные
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
        if (!isNaN(aNum)) return -1;
        if (!isNaN(bNum)) return 1;
        return String(a).localeCompare(String(b), 'ru');
      });
      setAllSizes(sizes);

      const genders = Array.from(new Set(
        (productsData || [])
          .map(p => p.gender)
          .filter(Boolean)
          .map(g => String(g).toLowerCase())
          .filter(g => g !== 'all')
          .filter(g => g !== 'other')
      ))
        .filter(g => g in GENDER_LABELS)
        .sort((a, b) => GENDER_LABELS[a].localeCompare(GENDER_LABELS[b], 'ru'));

      setAllGenders(genders);

    } catch (err) {
      setError('Не удалось загрузить каталог');
    } finally {
      setLoading(false);
    }
  }, []);

  const filterProducts = useCallback(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.tags && product.tags.some(tag => 
          tag.toLowerCase().includes(query)
        ))
      );
    }

    if (filters.priceFrom && !isNaN(filters.priceFrom)) {
      filtered = filtered.filter(product => product.price >= parseInt(filters.priceFrom, 10));
    }
    if (filters.priceTo && !isNaN(filters.priceTo)) {
      filtered = filtered.filter(product => product.price <= parseInt(filters.priceTo, 10));
    }

    if (filters.stockLocation !== 'all') {
      switch (filters.stockLocation) {
        case 'rf':
          filtered = filtered.filter(product => (product.stock_rf || 0) > 0);
          break;
        case 'china':
          filtered = filtered.filter(product => (product.stock_china || 0) > 0);
          break;
        case 'both':
          filtered = filtered.filter(product => 
            (product.stock_rf || 0) > 0 && (product.stock_china || 0) > 0
          );
          break;
        default:
          break;
      }
    }

    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      const wanted = new Set(filters.selectedCategories.map(c => String(c).toLowerCase()));
      filtered = filtered.filter(product => {
        const productCats = Array.isArray(product.categories) ? product.categories : [];
        if (productCats.length === 0) return false;
        return productCats.some(cat => wanted.has(String(cat).toLowerCase()));
      });
    }

    // Фильтрация по брендам
    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.brand) return false;
        return filters.selectedBrands.includes(product.brand);
      });
    }

    // Фильтрация по размерам
    if (filters.selectedSizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes) return false;
        const productSizes = normalizeArrayField(product.sizes).map(size => String(size));
        if (productSizes.length === 0) return false;
        return productSizes.some(size => filters.selectedSizes.includes(String(size)));
      });
    }

    // Фильтрация по полу
    if (filters.selectedGenders.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.gender) return false;
        return filters.selectedGenders.includes(product.gender);
      });
    }

    if (filters.sort === 'priceAsc') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filters.sort === 'priceDesc') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filters]);

  useEffect(() => {
    loadData();
  }, [loadData, isWebApp]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(min-width: 1024px)');

    const handleChange = (event) => {
      const matches = event.matches ?? mq.matches;
      setIsDesktopView(matches);
      if (matches) {
        setMobileFiltersOpen(false);
      }
    };

    handleChange(mq);

    if (mq.addEventListener) {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    }

    mq.addListener(handleChange);
    return () => mq.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleScroll = () => {
      const threshold = isDesktopView ? 96 : 140;
      setIsStickyHeader(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktopView]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleFilterItem = useCallback((filterKey, item) => {
    setFilters(prev => {
      const nextSet = new Set(prev[filterKey]);
      if (nextSet.has(item)) {
        nextSet.delete(item);
      } else {
        nextSet.add(item);
      }
      return { ...prev, [filterKey]: Array.from(nextSet) };
    });
  }, []);

  const toggleListExpansion = useCallback((key) => {
    setListExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleMobileFilters = () => {
    if (isDesktopView) return;
    setMobileFiltersOpen(prev => !prev);
  };

  const resetFilters = () => {
    setFilters({
      priceFrom: '',
      priceTo: '',
      stockLocation: 'all',
      sort: 'none',
      selectedCategories: [],
      selectedBrands: [],
      selectedSizes: [],
      selectedGenders: []
    });
    setShowCategoryDropdown(false);
    setListExpanded({ brands: false, sizes: false, categories: false });
  };
  const visibleBrands = listExpanded.brands ? allBrands : allBrands.slice(0, 5);
  const visibleSizes = listExpanded.sizes ? allSizes : allSizes.slice(0, 5);
  const visibleCategories = listExpanded.categories ? allCategories : allCategories.slice(0, 5);


  const handleProductClick = (product) => {
    setSelectedProduct(product);
    
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleRefresh = () => {
    loadData();
  };

  useEffect(() => {
    if (!filteredProducts || filteredProducts.length === 0) return;

    const idle = (cb) => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        return window.requestIdleCallback(cb, { timeout: 1500 });
      }
      return setTimeout(() => cb({ timeRemaining: () => 0 }), 150);
    };

    const cancelIdle = (id) => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && typeof id === 'number') {
        window.cancelIdleCallback(id);
      } else if (typeof id === 'number') {
        clearTimeout(id);
      }
    };

    const preloadImage = (url) => {
      return new Promise((resolve) => {
        try {
          const img = new Image();
          try { img.decoding = 'async'; } catch (_) {}
          img.onload = img.onerror = () => resolve();
          img.src = url;
        } catch (_) {
          resolve();
        }
      });
    };

    const urls = new Set();
    const MAX_PRODUCTS = 24;
    const PHOTOS_PER_PRODUCT = 3;

    filteredProducts.slice(0, MAX_PRODUCTS).forEach((p) => {
      if (Array.isArray(p.photos)) {
        p.photos.slice(0, PHOTOS_PER_PRODUCT).forEach((u) => {
          if (typeof u === 'string' && u) urls.add(u);
        });
      }
    });

    const list = Array.from(urls);
    if (list.length === 0) return;

    let isCancelled = false;
    let cursor = 0;
    const CONCURRENCY = 4;

    const runWorker = async () => {
      while (!isCancelled && cursor < list.length) {
        const i = cursor++;
        const url = list[i];
        await preloadImage(url);
      }
    };

    const startPreload = () => {
      const workers = new Array(CONCURRENCY).fill(0).map(() => runWorker());
      Promise.all(workers).catch(() => {});
    };

    const idleId = idle(startPreload);

    return () => {
      isCancelled = true;
      cancelIdle(idleId);
    };
  }, [filteredProducts]);

  if (loading) {
    return (
      <div className="catalog-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка каталога...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={handleRefresh}>
            🔄 Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`catalog-page ${isStickyHeader ? 'catalog-page--sticky' : ''}`}>
      <header className="catalog-header" role="banner">
        <div className={`catalog-header-inner ${isStickyHeader ? 'compact' : ''}`}>
          <div className="header-logo">
            <h1 className="header-title">AVERON SHOP</h1>
          </div>
          <div className="header-search">
            <SearchBar
              onSearch={handleSearch}
              value={searchQuery}
              placeholder="Поиск товаров..."
              variant="desktop"
            />
          </div>
        </div>
      </header>

      {!isDesktopView && (
        <div className="mobile-alert" role="note" aria-live="polite">
          <span>Эта версия оптимизирована для компьютеров. Для смартфонов откройте </span>
          <a href="https://averon.vercel.app/" target="_blank" rel="noopener noreferrer">мобильный каталог</a>.
        </div>
      )}

      <div className="catalog-mobile-controls">
          <SearchBar 
            onSearch={handleSearch}
            value={searchQuery}
            placeholder="Поиск товаров..."
          variant="mobile"
          />
        <button className="filter-button" onClick={toggleMobileFilters}>
            <StaticImage src="icon-filter.png" alt="Фильтр" className="filter-icon" />
          </button>
        </div>
        
      {!isDesktopView && mobileFiltersOpen && (
        <div className="filters-panel" role="region" aria-label="Управление фильтрами" data-variant="mobile">
            <div className="filter-group compact-row">
              <label>Цена</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="От"
                  value={filters.priceFrom}
                  onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                  className="price-input"
                />
                <span>—</span>
                <input
                  type="number"
                  placeholder="До"
                  value={filters.priceTo}
                  onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                  className="price-input"
                />
              </div>
            </div>

            <div className="filter-group compact-row">
              <label>Сортировка</label>
              <div className="sort-options">
                <label className="radio-option">
                  <input
                    type="radio"
                  name="sort-mobile"
                    value="none"
                    checked={filters.sort === 'none'}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  />
                  <span>Без сортировки</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                  name="sort-mobile"
                    value="priceAsc"
                    checked={filters.sort === 'priceAsc'}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  />
                  <span>Сначала дешевле</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                  name="sort-mobile"
                    value="priceDesc"
                    checked={filters.sort === 'priceDesc'}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                  />
                  <span>Сначала дороже</span>
                </label>
              </div>
            </div>

            <div className="filter-group compact-row categories-group">
              <label>Категории</label>
              <div className="categories-control">
                <button
                  type="button"
                  className="category-filter-toggle"
                  onClick={() => setShowCategoryDropdown(v => !v)}
                  aria-expanded={showCategoryDropdown}
                >
                  {filters.selectedCategories.length > 0
                    ? `Выбрано: ${filters.selectedCategories.length}`
                    : 'Выбрать категории'}
                </button>
                {showCategoryDropdown && (
                <div className="categories-dropdown" role="listbox" aria-label="Список категорий">
                    {allCategories.length === 0 ? (
                      <div className="categories-empty">Категории недоступны</div>
                    ) : (
                      allCategories.map((cat) => {
                        const selected = filters.selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                          role="option"
                          aria-selected={selected}
                            className={`chip-option ${selected ? 'selected' : ''}`}
                            onClick={() => toggleFilterItem('selectedCategories', cat)}
                          >
                            {cat}
                          </button>
                        );
                      })
                    )}
                    <div className="categories-actions">
                      <button
                        type="button"
                        className="reset-filters-btn"
                        onClick={() => setFilters(prev => ({ ...prev, selectedCategories: [] }))}
                      >
                      Сбросить
                      </button>
                      <button
                        type="button"
                        className="apply-filters-btn"
                        onClick={() => setShowCategoryDropdown(false)}
                      >
                        Готово
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {allBrands.length > 0 && (
              <div className="filter-group compact-row">
                <div className="filter-label-with-toggle">
                  <label>Бренды</label>
                  {allBrands.length > 5 && (
                    <button
                      type="button"
                      className="toggle-list-button"
                      onClick={() => toggleListExpansion('brands')}
                    >
                      {listExpanded.brands ? 'Скрыть' : `Показать ещё ${allBrands.length - 5}`}
                    </button>
                  )}
                </div>
                <div className={`chip-list ${listExpanded.brands ? 'expanded' : ''}`} data-collapsible>
                  {visibleBrands.map((brand) => {
                    const selected = filters.selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        className={`chip-option ${selected ? 'selected' : ''}`}
                        aria-pressed={selected}
                        onClick={() => toggleFilterItem('selectedBrands', brand)}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {allSizes.length > 0 && (
              <div className="filter-group compact-row">
                <div className="filter-label-with-toggle">
                  <label>Размеры</label>
                  {allSizes.length > 5 && (
                    <button
                      type="button"
                      className="toggle-list-button"
                      onClick={() => toggleListExpansion('sizes')}
                    >
                      {listExpanded.sizes ? 'Скрыть' : `Показать ещё ${allSizes.length - 5}`}
                    </button>
                  )}
                </div>
                <div className={`chip-list compact ${listExpanded.sizes ? 'expanded' : ''}`} data-collapsible>
                  {visibleSizes.map((size) => {
                    const value = String(size);
                    const selected = filters.selectedSizes.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`chip-option size ${selected ? 'selected' : ''}`}
                        aria-pressed={selected}
                        onClick={() => toggleFilterItem('selectedSizes', value)}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="filter-group compact-row">
              <label>Пол</label>
              <div className="gender-options">
                {allGenders.map((gender) => {
                  const label = GENDER_LABELS[gender] || gender;
                  const selected = filters.selectedGenders.includes(gender);
                  return (
                    <button
                      key={gender}
                      type="button"
                      className={`chip-option ${selected ? 'selected' : ''}`}
                      aria-pressed={selected}
                      onClick={() => toggleFilterItem('selectedGenders', gender)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="filter-group compact-row">
              <label>Наличие</label>
              <div className="stock-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stockLocation-mobile"
                    value="all"
                    checked={filters.stockLocation === 'all'}
                    onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                  />
                  <span>Все</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stockLocation-mobile"
                    value="rf"
                    checked={filters.stockLocation === 'rf'}
                    onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                  />
                  <span>РФ</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stockLocation-mobile"
                    value="china"
                    checked={filters.stockLocation === 'china'}
                    onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                  />
                  <span>Китай</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="stockLocation-mobile"
                    value="both"
                    checked={filters.stockLocation === 'both'}
                    onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                  />
                  <span>Оба склада</span>
                </label>
              </div>
            </div>

            <div className="filter-actions">
            <button className="reset-filters-btn" onClick={resetFilters} type="button">
                Сбросить
              </button>
            <button className="apply-filters-btn" onClick={() => setMobileFiltersOpen(false)} type="button">
                Применить
              </button>
            </div>
            <button
              className="reset-filters-btn reset-filters-btn--full"
              onClick={resetFilters}
              type="button"
            >
              Сбросить все
            </button>
          </div>
        )}

      <div className="catalog-layout">
        {isDesktopView && (
          <aside className="filters-sidebar-desktop" aria-label="Фильтры каталога">
            <div className="filters-panel sidebar-panel" data-variant="desktop">
              <div className="filters-scroll-area">
                <div className="filter-group compact-row">
                  <label>Цена</label>
                  <div className="price-range">
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.priceFrom}
                      onChange={(e) => handleFilterChange('priceFrom', e.target.value)}
                      className="price-input"
                    />
                    <span>—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.priceTo}
                      onChange={(e) => handleFilterChange('priceTo', e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="filter-group compact-row">
                  <label>Сортировка</label>
                  <div className="sort-options column">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="sort-desktop"
                        value="none"
                        checked={filters.sort === 'none'}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                      />
                      <span>Без сортировки</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="sort-desktop"
                        value="priceAsc"
                        checked={filters.sort === 'priceAsc'}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                      />
                      <span>Сначала дешевле</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="sort-desktop"
                        value="priceDesc"
                        checked={filters.sort === 'priceDesc'}
                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                      />
                      <span>Сначала дороже</span>
                    </label>
                  </div>
                </div>

                <div className="filter-group compact-row categories-group">
                  <div className="filter-label-with-toggle">
                    <label>Категории</label>
                    {allCategories.length > 5 && (
                      <button
                        type="button"
                        className="toggle-list-button"
                        onClick={() => toggleListExpansion('categories')}
                      >
                        {listExpanded.categories ? 'Скрыть' : `Показать ещё ${allCategories.length - 5}`}
                      </button>
                    )}
                  </div>
                  <div className="categories-list">
                    {visibleCategories.length === 0 ? (
                      <div className="categories-empty">Категории недоступны</div>
                    ) : (
                      visibleCategories.map((cat) => {
                        const selected = filters.selectedCategories.includes(cat);
                        return (
                          <button
                            key={cat}
                            type="button"
                            className={`chip-option ${selected ? 'selected' : ''}`}
                            aria-pressed={selected}
                            onClick={() => toggleFilterItem('selectedCategories', cat)}
                          >
                            {cat}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <div className="categories-actions sidebar" aria-hidden="true" />
                </div>

                {allBrands.length > 0 && (
                  <div className="filter-group compact-row">
                    <div className="filter-label-with-toggle">
                      <label>Бренды</label>
                      {allBrands.length > 5 && (
                        <button
                          type="button"
                          className="toggle-list-button"
                          onClick={() => toggleListExpansion('brands')}
                        >
                          {listExpanded.brands ? 'Скрыть' : `Показать ещё ${allBrands.length - 5}`}
                        </button>
                      )}
                    </div>
                    <div className={`chip-list ${listExpanded.brands ? 'expanded' : ''}`}>
                      {visibleBrands.map((brand) => {
                        const selected = filters.selectedBrands.includes(brand);
                        return (
                          <button
                            key={brand}
                            type="button"
                            className={`chip-option ${selected ? 'selected' : ''}`}
                            aria-pressed={selected}
                            onClick={() => toggleFilterItem('selectedBrands', brand)}
                          >
                            {brand}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {allSizes.length > 0 && (
                  <div className="filter-group compact-row">
                    <div className="filter-label-with-toggle">
                      <label>Размеры</label>
                      {allSizes.length > 5 && (
                        <button
                          type="button"
                          className="toggle-list-button"
                          onClick={() => toggleListExpansion('sizes')}
                        >
                          {listExpanded.sizes ? 'Скрыть' : `Показать ещё ${allSizes.length - 5}`}
                        </button>
                      )}
                    </div>
                    <div className={`chip-list compact ${listExpanded.sizes ? 'expanded' : ''}`}>
                      {visibleSizes.map((size) => {
                        const value = String(size);
                        const selected = filters.selectedSizes.includes(value);
                        return (
                          <button
                            key={value}
                            type="button"
                            className={`chip-option size ${selected ? 'selected' : ''}`}
                            aria-pressed={selected}
                            onClick={() => toggleFilterItem('selectedSizes', value)}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="filter-group compact-row">
                  <label>Пол</label>
                  <div className="gender-options">
                    {allGenders.map((gender) => {
                      const label = GENDER_LABELS[gender] || gender;
                      const selected = filters.selectedGenders.includes(gender);
                      return (
                        <button
                          key={gender}
                          type="button"
                          className={`chip-option ${selected ? 'selected' : ''}`}
                          aria-pressed={selected}
                          onClick={() => toggleFilterItem('selectedGenders', gender)}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="filter-group compact-row">
                  <label>Наличие</label>
                  <div className="stock-options column">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="stockLocation-desktop"
                        value="all"
                        checked={filters.stockLocation === 'all'}
                        onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                      />
                      <span>Все</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="stockLocation-desktop"
                        value="rf"
                        checked={filters.stockLocation === 'rf'}
                        onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                      />
                      <span>РФ</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="stockLocation-desktop"
                        value="china"
                        checked={filters.stockLocation === 'china'}
                        onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                      />
                      <span>Китай</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="stockLocation-desktop"
                        value="both"
                        checked={filters.stockLocation === 'both'}
                        onChange={(e) => handleFilterChange('stockLocation', e.target.value)}
                      />
                      <span>Оба склада</span>
                    </label>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="reset-filters-btn reset-filters-btn--full"
                onClick={resetFilters}
              >
                Сбросить все
              </button>
            </div>
          </aside>
        )}

        <section className="catalog-content" aria-live="polite">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>Товары не найдены</h3>
              <p>
                {searchQuery
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'В каталоге пока нет товаров'
                }
              </p>
              {searchQuery && (
                <button
                  className="clear-filters-button"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  Очистить поиск
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => handleProductClick(product)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleCloseModal}
          tg={tg}
        />
      )}
    </div>
  );
};

export default CatalogPage;