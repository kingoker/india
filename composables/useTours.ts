import { ref, onMounted } from 'vue'

export function useTours() {
  const tours = ref<any[]>([])
  const loading = ref(true)
  const error = ref<any>(null)
  const lastFetch = ref<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5 минут

  const fetchTours = async (force = false) => {
    console.log('Загружаем туры...')
    // Проверяем кэш
    const now = Date.now()
    if (!force && tours.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      console.log('Используем кэшированные туры')
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
      console.log('Туры загружены:', data?.length || 0)
      tours.value = Array.isArray(data) ? data : []
      lastFetch.value = now
    }
    loading.value = false
  }

  // Загружаем туры сразу при создании composable
  fetchTours()

  return { tours, loading, error, fetchTours }
} 