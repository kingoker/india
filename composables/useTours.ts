import { ref, onMounted } from 'vue'

export function useTours() {
  const tours = ref([])
  const loading = ref(true)
  const error = ref(null)

  const fetchTours = async () => {
    loading.value = true
    const supabase = useSupabaseClient()
    const { data, error: err } = await supabase
      .from('tours')
      .select('*')
      .order('date_from', { ascending: true })
    if (err) {
      error.value = err
    } else {
      tours.value = data
    }
    loading.value = false
  }

  onMounted(fetchTours)

  return { tours, loading, error, fetchTours }
} 