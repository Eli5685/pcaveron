/**
 * API утилиты для работы с каталогом товаров через Supabase
 */
import { api } from './supabase';
import { getCachedTelegramPhotoUrl } from './telegramPhotos';

// === Функции для работы с товарами ===

/**
 * Обработка Telegram file_id для получения URL изображений
 * @param {Array} photos - Массив file_id или URL
 * @returns {Promise<Array>} Массив URL для отображения
 */
const processTelegramPhotos = async (photos) => {
  if (!Array.isArray(photos)) {
    return [];
  }
  
  const processedPhotos = [];
  
  for (const photo of photos) {
    if (typeof photo === 'string') {
      // Если это Telegram file_id (AgACAgI...)
      if (photo.startsWith('AgACA')) {
        try {
          const url = await getCachedTelegramPhotoUrl(photo);
          if (url && !url.includes('placeholder')) {
            processedPhotos.push(url);
          } else {
            // Если не удалось получить URL, используем placeholder
            processedPhotos.push(`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop`);
          }
        } catch (error) {
          console.error('Ошибка получения Telegram фото:', error);
          processedPhotos.push(`https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop`);
        }
      }
      // Если это обычный URL
      else if (photo.startsWith('http')) {
        processedPhotos.push(photo);
      }
      // Fallback для других случаев
      else {
        processedPhotos.push(`https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop`);
      }
    }
  }
  
  // Если нет фотографий, возвращаем случайную картинку
  return processedPhotos.length > 0 ? processedPhotos : [`https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop`];
};

/**
 * Получить все товары
 * @param {string} category - Фильтр по категории (опционально)
 * @returns {Promise<Array>} Список товаров
 */
export const getProducts = async (category = null) => {
  try {
    let products;
    
    if (category && category !== 'Все') {
      products = await api.getProductsByCategory(category);
    } else {
      products = await api.getProducts();
    }
    
    
    
    // Обрабатываем Telegram file_id для изображений
    const processedProducts = await Promise.all(
      products.map(async (product) => ({
        ...product,
        photos: await processTelegramPhotos(product.photos || [])
      }))
    );
    
    return processedProducts;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Ошибка получения товаров из Supabase:', error);
      console.log('🔄 Используем fallback mock данные');
    }
    
    // Fallback: возвращаем mock данные для разработки
    return getMockProducts();
  }
};

/**
 * Получить товар по ID
 * @param {number} productId - ID товара
 * @returns {Promise<Object>} Товар
 */
export const getProduct = async (productId) => {
  try {
    const product = await api.getProduct(productId);
    
    if (product) {
      // Обрабатываем фотографии
      return {
        ...product,
        photos: await processTelegramPhotos(product.photos || [])
      };
    }
    
    return null;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('❌ Ошибка получения товара из Supabase:', error);
      console.log('🔄 Используем fallback mock данные');
    }
    // Fallback к mock данным
    const mockProducts = getMockProducts();
    return mockProducts.find(p => p.id === parseInt(productId));
  }
};

/**
 * Поиск товаров
 * @param {string} query - Поисковый запрос
 * @param {string} category - Фильтр по категории (опционально)
 * @returns {Promise<Array>} Результаты поиска
 */
export const searchProducts = async (query, category = null) => {
  try {
    const results = await api.searchProducts(query);
    
    // Дополнительная фильтрация по категории если нужно
    if (category && category !== 'Все') {
      return results.filter(product => product.category === category);
    }
    
    return results;
  } catch (error) {
    
    // Fallback: локальный поиск по mock данным
    const allProducts = getMockProducts();
    return allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }
};

/**
 * Получить список категорий
 * @returns {Promise<Array>} Список категорий
 */
export const getCategories = async () => {
  try {
    const categories = await api.getCategories();
    return ['Все', ...categories];
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    
    // Fallback: возвращаем базовые категории
    return ['Все', 'general', 'electronics', 'accessories'];
  }
};

// === Mock данные для разработки ===

const getMockProducts = () => [
  {
    id: 1,
    name: "Беспроводные наушники TWS Pro 3",
    price: 4500,
    description: "Высококачественные беспроводные наушники с активным шумоподавлением. Время работы до 30 часов с кейсом. Быстрая зарядка и защита от влаги IPX7.",
    photos: [
      "https://via.placeholder.com/400x400/007acc/ffffff?text=TWS+Pro+3"
    ],
    avito_link: "https://avito.ru/example1",
    stock_rf: 5,
    stock_china: 12,
    category: "electronics",
    tags: ["наушники", "беспроводные", "tws"],
    brand: "Generic",
    colors: ["Черный", "Белый"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Премиальный кабель быстрой зарядки 6A, 120 Вт (1.8 метра)",
    price: 899,
    description: "Сверхбыстрый кабель зарядки с поддержкой мощности до 120Вт. Совместим с большинством современных устройств. Прочная нейлоновая оплетка.",
    photos: [
      "https://via.placeholder.com/400x400/007acc/ffffff?text=Кабель+120W"
    ],
    avito_link: "https://avito.ru/example2",
    stock_rf: 15,
    stock_china: 25,
    category: "accessories",
    tags: ["кабель", "зарядка", "120w"],
    brand: "Generic",
    colors: ["Черный"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Премиальный кабель быстрой зарядки 6A, 120 Вт (1 метр)",
    price: 799,
    description: "Компактный кабель быстрой зарядки 120Вт длиной 1 метр. Идеален для повседневного использования. Высокое качество материалов.",
    photos: [
      "https://via.placeholder.com/400x400/007acc/ffffff?text=Кабель+120W+1м"
    ],
    avito_link: "https://avito.ru/example3",
    stock_rf: 10,
    stock_china: 30,
    category: "accessories",
    tags: ["кабель", "зарядка", "120w"],
    brand: "Generic",
    colors: ["Черный"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: "Премиальный кабель быстрой зарядки 6A, 120 Вт (2 метра)",
    price: 999,
    description: "Удлиненный кабель быстрой зарядки 120Вт длиной 2 метра. Больше свободы во время зарядки. Усиленные коннекторы.",
    photos: [
      "https://via.placeholder.com/400x400/007acc/ffffff?text=Кабель+120W+2м"
    ],
    avito_link: "https://avito.ru/example4",
    stock_rf: 8,
    stock_china: 20,
    category: "accessories",
    tags: ["кабель", "зарядка", "120w"],
    brand: "Generic",
    colors: ["Черный"],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// === Telegram Web App утилиты ===

/**
 * Проверить, запущено ли приложение в Telegram
 * @returns {boolean}
 */
export const isTelegramWebApp = () => {
  return typeof window !== 'undefined' && window.Telegram?.WebApp;
};

/**
 * Получить данные пользователя Telegram
 * @returns {Object|null}
 */
export const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initDataUnsafe?.user || null;
  }
  return null;
};

/**
 * Показать главную кнопку Telegram
 * @param {string} text - Текст кнопки
 * @param {Function} callback - Функция обратного вызова
 */
export const showMainButton = (text, callback) => {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram.WebApp.MainButton;
    mainButton.text = text;
    mainButton.show();
    mainButton.onClick(callback);
  }
};

/**
 * Скрыть главную кнопку Telegram
 */
export const hideMainButton = () => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.MainButton.hide();
  }
};

/**
 * Закрыть Mini App
 */
export const closeMiniApp = () => {
  if (isTelegramWebApp()) {
    window.Telegram.WebApp.close();
  }
};