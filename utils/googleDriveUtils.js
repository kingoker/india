/**
 * Преобразует Google Drive ссылку в прямую ссылку для отображения изображения
 * @param {string} url - Исходная ссылка
 * @returns {string} - Обработанная ссылка
 */
export function processGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') {
    return url
  }

  // Убираем пробелы в начале и конце
  url = url.trim()

  // Проверяем, является ли это Google Drive ссылкой
  const drivePattern = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view\?usp=drive_link/
  const match = url.match(drivePattern)

  if (match) {
    // Для Google Drive ссылок оставляем оригинальную ссылку
    // Компонент GoogleDriveImage будет обрабатывать отображение
    return url
  }

  // Если это не Google Drive ссылка, возвращаем как есть
  return url
}

/**
 * Проверяет, является ли ссылка Google Drive ссылкой
 * @param {string} url - Ссылка для проверки
 * @returns {boolean} - true если это Google Drive ссылка
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') {
    return false
  }

  const drivePatterns = [
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view\?usp=drive_link/,
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /https:\/\/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/
  ]
  
  return drivePatterns.some(pattern => pattern.test(url.trim()))
}

/**
 * Обрабатывает URL изображения с автоматическим преобразованием Google Drive ссылок
 * @param {string} url - Исходный URL
 * @returns {string} - Обработанный URL
 */
export function processImageUrl(url) {
  return processGoogleDriveUrl(url)
} 