/**
 * Утилиты для работы с Telegram Bot API для получения файлов
 */

// Примечание: В продакшене этот токен должен быть в переменных окружения
const BOT_TOKEN = process.env.REACT_APP_BOT_TOKEN || '';

/**
 * Получить URL фотографии по Telegram file_id
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<string|null>} URL фотографии или null
 */
export const getTelegramPhotoUrl = async (fileId) => {
  if (!BOT_TOKEN) {
    console.warn('⚠️ BOT_TOKEN не настроен, используем placeholder');
    return `https://via.placeholder.com/400x400/007acc/ffffff?text=Фото+товара`;
  }
  
  try {
    // Получаем информацию о файле
    const fileResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json();
    
    if (fileData.ok && fileData.result?.file_path) {
      // Формируем URL для загрузки файла
      const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
      return fileUrl;
    }
  } catch (error) {
    console.error('Ошибка получения Telegram фото:', error);
  }
  
  // Fallback placeholder
  return `https://via.placeholder.com/400x400/007acc/ffffff?text=Фото+товара`;
};

/**
 * Пакетное получение URL для массива file_id
 * @param {Array<string>} fileIds - Массив Telegram file_id
 * @returns {Promise<Array<string>>} Массив URL
 */
export const getTelegramPhotosUrls = async (fileIds) => {
  if (!Array.isArray(fileIds)) {
    return [];
  }
  
  const promises = fileIds.map(fileId => getTelegramPhotoUrl(fileId));
  const urls = await Promise.all(promises);
  
  return urls.filter(Boolean); // Убираем null значения
};

/**
 * Кэш для URL фотографий чтобы не делать лишние запросы
 */
const photoUrlCache = new Map();

/**
 * Получить URL с кэшированием
 * @param {string} fileId - Telegram file_id
 * @returns {Promise<string>} URL фотографии
 */
export const getCachedTelegramPhotoUrl = async (fileId) => {
  if (photoUrlCache.has(fileId)) {
    return photoUrlCache.get(fileId);
  }
  
  const url = await getTelegramPhotoUrl(fileId);
  if (url) {
    photoUrlCache.set(fileId, url);
  }
  
  return url;
};