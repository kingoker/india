import { ref, onMounted } from 'vue'

export function useTours() {
  const tours = ref([])
  const loading = ref(true)
  const error = ref<any>(null)

  const fetchTours = async () => {
    console.log('Загружаем туры...')
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
      console.log('Загружено туров:', data?.length)
      console.log('Данные туров:', data)
      tours.value = data || []
    }
    loading.value = false
  }

  onMounted(fetchTours)

  return { tours, loading, error, fetchTours }
} 