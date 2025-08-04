import { ref, onMounted } from 'vue'

export function useTours() {
  const tours = ref<any[]>([])
  const loading = ref(true)
  const error = ref<any>(null)
  const lastFetch = ref<number>(0)
  const CACHE_DURATION = 10 * 60 * 1000 // 10 минут для лучшего кэширования

  const fetchTours = async (force = false) => {
    // Проверяем кэш
    const now = Date.now()
    if (!force && tours.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }
    
    loading.value = true
    const supabase = useSupabaseClient()
    const { data, error: err } = await supabase
      .from('tours')
      .select('*')
      .order('date_from', { ascending: true })
    if (err) {
      console.error('Ошибка загрузки туров:', err)
      error.value = err
    } else {
      tours.value = Array.isArray(data) ? data : []
      lastFetch.value = now
    }
    loading.value = false
  }

  // Загружаем туры сразу при создании composable
  fetchTours()

  return { tours, loading, error, fetchTours }
} 