// Утилиты для безопасной работы с DOM

/**
 * Безопасно блокирует скролл страницы
 */
export const disableScroll = () => {
  if (process.client && document?.body) {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = '0px'
  }
}

/**
 * Безопасно разблокирует скролл страницы
 */
export const enableScroll = () => {
  if (process.client && document?.body) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

/**
 * Безопасно добавляет обработчик событий
 */
export const addEventListener = (event, handler) => {
  if (process.client && document) {
    document.addEventListener(event, handler)
  }
}

/**
 * Безопасно удаляет обработчик событий
 */
export const removeEventListener = (event, handler) => {
  if (process.client && document) {
    document.removeEventListener(event, handler)
  }
}

/**
 * Проверяет, доступен ли DOM
 */
export const isClient = () => {
  return process.client && typeof document !== 'undefined'
} 