import { ref } from 'vue'

export const useYagyaInfo = () => {
  const yagyaInfo = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchYagyaInfo = async () => {
    loading.value = true
    error.value = null
    
    try {
      const supabase = useSupabaseClient()
      const { data, error: supabaseError } = await supabase
        .from('yagya_info')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (supabaseError) {
        throw supabaseError
      }
      
      yagyaInfo.value = data || []
      console.log('Информация о ягья загружена:', yagyaInfo.value)
    } catch (err) {
      console.error('Ошибка загрузки информации о ягья:', err)
      error.value = err.message
      
      // Fallback на мок данные если нет подключения к БД
      yagyaInfo.value = [
        {
          id: '1',
          title: 'Подготовка к ягья',
          text: 'Подробная информация о том, как подготовиться к участию в ягье. Включает рекомендации по питанию, одежде, ментальной подготовке и другим важным аспектам.',
          image_url: 'https://turiya.global/wp-content/uploads/2024/01/photo_5253920793711203274_y-e1704805095100.jpg'
        },
        {
          id: '2',
          title: 'Что взять с собой',
          text: 'Список необходимых вещей для участия в ягье. Рекомендации по одежде, личным вещам, а также что категорически нельзя брать с собой.',
          image_url: 'https://turiya.global/wp-content/uploads/2024/01/photo_5253920793711203274_y-e1704805095100.jpg'
        },
        {
          id: '3',
          title: 'Правила поведения',
          text: 'Основные правила поведения во время ягьи. Как вести себя в священном пространстве, что можно и что нельзя делать во время ритуала.',
          image_url: 'https://turiya.global/wp-content/uploads/2024/01/photo_5253920793711203274_y-e1704805095100.jpg'
        },
        {
          id: '4',
          title: 'FAQ',
          text: 'Ответы на самые популярные вопросы о ягьях. Что такое ягья, как она работает, какие результаты можно ожидать и многое другое.',
          image_url: 'https://turiya.global/wp-content/uploads/2024/01/photo_5253920793711203274_y-e1704805095100.jpg'
        }
      ]
    } finally {
      loading.value = false
    }
  }

  return {
    yagyaInfo,
    loading,
    error,
    fetchYagyaInfo
  }
} 