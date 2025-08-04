import { ref } from 'vue'

export function useCache() {
  const cache = ref(new Map())
  const cacheTimestamps = ref(new Map())
  const CACHE_DURATION = 30 * 60 * 1000 // 30 минут

  const getCachedData = (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(key)
        const timestamp = localStorage.getItem(`${key}_timestamp`)
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp)
          if (age < CACHE_DURATION) {
            return JSON.parse(cached)
          }
        }
      } catch (e) {
        console.warn('Ошибка чтения кэша:', e)
      }
    }
    return null
  }

  const setCachedData = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        localStorage.setItem(`${key}_timestamp`, Date.now().toString())
      } catch (e) {
        console.warn('Ошибка записи кэша:', e)
      }
    }
  }

  const clearCache = (key?: string) => {
    if (typeof window !== 'undefined') {
      try {
        if (key) {
          localStorage.removeItem(key)
          localStorage.removeItem(`${key}_timestamp`)
        } else {
          // Очищаем все кэши приложения
          const keys = Object.keys(localStorage)
          keys.forEach(k => {
            if (k.includes('yagya_') || k.includes('tours_')) {
              localStorage.removeItem(k)
            }
          })
        }
      } catch (e) {
        console.warn('Ошибка очистки кэша:', e)
      }
    }
  }

  const isCacheValid = (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const timestamp = localStorage.getItem(`${key}_timestamp`)
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp)
          return age < CACHE_DURATION
        }
      } catch (e) {
        console.warn('Ошибка проверки кэша:', e)
      }
    }
    return false
  }

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isCacheValid
  }
} 