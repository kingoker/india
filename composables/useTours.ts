import { ref, onMounted } from 'vue'

export function useTours() {
  const tours = ref<any[]>([])
  const loading = ref(true)
  const error = ref<any>(null)
  const lastFetch = ref<number>(0)
  const CACHE_DURATION = 30 * 60 * 1000 // 30 минут для лучшего кэширования

  // Кэширование в localStorage
  const CACHE_KEY = 'yagya_tours_cache'
  const CACHE_TIMESTAMP_KEY = 'yagya_tours_timestamp'

  const getCachedData = () => {
    if (process.client) {
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
        
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

  const setCachedData = (data: any[]) => {
    if (process.client) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
      } catch (e) {
        console.warn('Ошибка записи кэша:', e)
      }
    }
  }

  const fetchTours = async (force = false) => {
    // Проверяем кэш в памяти
    const now = Date.now()
    if (!force && tours.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }

    // Проверяем localStorage кэш
    if (!force && process.client) {
      const cached = getCachedData()
      if (cached) {
        tours.value = cached
        lastFetch.value = now
        loading.value = false
        return
      }
    }
    
    loading.value = true
    error.value = null
    
    try {
      const supabase = useSupabaseClient()
      
      // Оптимизированный запрос с селектом только нужных полей
      const { data, error: err } = await supabase
        .from('tours')
        .select('id, title, description, date_from, date_to, image_url, slug, duration')
        .order('date_from', { ascending: true })
        .limit(50) // Ограничиваем количество записей
      
      if (err) {
        console.error('Ошибка загрузки туров:', err)
        error.value = err
      } else {
        const toursData = Array.isArray(data) ? data : []
        tours.value = toursData
        lastFetch.value = now
        
        // Кэшируем в localStorage
        setCachedData(toursData)
      }
    } catch (err) {
      console.error('Ошибка загрузки туров:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  // Загружаем туры сразу при создании composable
  fetchTours()

  return { tours, loading, error, fetchTours }
} 