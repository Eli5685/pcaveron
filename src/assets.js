/**
 * Utility для работы со статическими ресурсами
 * Решает проблемы с путями к файлам на разных платформах (Vercel, локальная разработка)
 */

/**
 * Получает правильный путь к статическому ресурсу
 * @param {string} path - путь к файлу относительно public/
 * @returns {string} полный путь к ресурсу
 */
export const getAssetUrl = (path) => {
  // Убираем начальный слэш если есть
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // В production на Vercel используем полный URL
  if (process.env.NODE_ENV === 'production') {
    return `${process.env.PUBLIC_URL || ''}/${cleanPath}`;
  }
  
  // В development используем стандартный путь
  return `/${cleanPath}`;
};

/**
 * Компонент Image с автоматическим определением пути
 */
export const StaticImage = ({ src, alt, className, ...props }) => {
  const imageSrc = src.startsWith('http') ? src : getAssetUrl(src);
  
  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className}
      onError={(e) => {
        console.warn(`Failed to load image: ${imageSrc}`);
        // Fallback к прямому пути
        if (!e.target.src.startsWith('/')) {
          e.target.src = `/${src.replace(/^\//, '')}`;
        }
      }}
      {...props} 
    />
  );
};

/**
 * Хук для получения URL статических ресурсов
 */
export const useAssetUrl = (path) => {
  return getAssetUrl(path);
};

export default { getAssetUrl, StaticImage, useAssetUrl };
