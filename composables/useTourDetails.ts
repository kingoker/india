import { ref } from 'vue'
import type { TourDetails, TourInfo, TourDay, TourImage, TourWithDetails } from '../types/database'

// Автоматический импорт useSupabaseClient из Nuxt

export function useTourDetails() {
  const tourDetails = ref<TourDetails | null>(null)
  const tourInfo = ref<TourInfo[]>([])
  const tourDays = ref<TourDay[]>([])
  const tourImages = ref<TourImage[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  const fetchTourDetails = async (tourId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const supabase = useSupabaseClient()
      
      // Загружаем основную информацию о туре
      const { data: detailsData, error: detailsError } = await supabase
        .from('tour_details')
        .select('*')
        .eq('tour_id', tourId)
        .single()
      
      if (detailsError && detailsError.code !== 'PGRST116') {
        throw detailsError
      }
      
      console.log('Tour details loaded:', detailsData)
      tourDetails.value = detailsData
      
      // Загружаем дополнительную информацию о туре
      const { data: infoData, error: infoError } = await supabase
        .from('tour_info')
        .select('*')
        .eq('tour_id', tourId)
        .order('sort_order', { ascending: true })
      
      if (infoError) {
        throw infoError
      }
      
      tourInfo.value = infoData || []
      
      // Загружаем дни тура
      const { data: daysData, error: daysError } = await supabase
        .from('tour_days')
        .select('*')
        .eq('tour_id', tourId)
        .order('day_number', { ascending: true })
      
      if (daysError) {
        throw daysError
      }
      
      tourDays.value = daysData || []
      
      // Загружаем изображения тура
      const { data: imagesData, error: imagesError } = await supabase
        .from('tour_images')
        .select('*')
        .eq('tour_id', tourId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      if (imagesError) {
        throw imagesError
      }
      
      tourImages.value = imagesData || []
      
    } catch (err) {
      console.error('Ошибка загрузки детальной информации о туре:', err)
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных'
    } finally {
      loading.value = false
    }
  }

  const createTourDetails = async (data: {
    tour_id: string
    about_tour: string
    why_special: string
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_details')
        .insert([data])
        .select()
        .single()

      if (error) {
        throw error
      }

      tourDetails.value = result
      return result
    } catch (err) {
      console.error('Ошибка создания информации о туре:', err)
      throw err
    }
  }

  const updateTourDetails = async (id: string, data: {
    about_tour?: string
    why_special?: string
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_details')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      tourDetails.value = result
      return result
    } catch (err) {
      console.error('Ошибка обновления информации о туре:', err)
      throw err
    }
  }

  const createTourInfo = async (data: {
    tour_id: string
    title: string
    description: string
    image_url?: string
    sort_order?: number
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_info')
        .insert([data])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(data.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка создания информации о туре:', err)
      throw err
    }
  }

  const updateTourInfo = async (id: string, data: {
    title?: string
    description?: string
    image_url?: string
    sort_order?: number
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_info')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка обновления информации о туре:', err)
      throw err
    }
  }

  const deleteTourInfo = async (id: string) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_info')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка удаления информации о туре:', err)
      throw err
    }
  }

  const createTourDay = async (data: {
    tour_id: string
    title: string
    description: string
    image_url?: string
    day_number: number
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_days')
        .insert([data])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(data.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка создания дня тура:', err)
      throw err
    }
  }

  const updateTourDay = async (id: string, data: {
    title?: string
    description?: string
    image_url?: string
    day_number?: number
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_days')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка обновления дня тура:', err)
      throw err
    }
  }

  const deleteTourDay = async (id: string) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_days')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка удаления дня тура:', err)
      throw err
    }
  }

  const createTourImage = async (data: {
    tour_id: string
    image_url: string
    title?: string
    description?: string
    sort_order?: number
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_images')
        .insert([data])
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(data.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка создания изображения тура:', err)
      throw err
    }
  }

  const updateTourImage = async (id: string, data: {
    image_url?: string
    title?: string
    description?: string
    sort_order?: number
    is_active?: boolean
  }) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_images')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка обновления изображения тура:', err)
      throw err
    }
  }

  const deleteTourImage = async (id: string) => {
    try {
      const supabase = useSupabaseClient()
      const { data: result, error } = await supabase
        .from('tour_images')
        .delete()
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Обновляем список
      await fetchTourDetails(result.tour_id)
      return result
    } catch (err) {
      console.error('Ошибка удаления изображения тура:', err)
      throw err
    }
  }

  return {
    tourDetails,
    tourInfo,
    tourDays,
    tourImages,
    loading,
    error,
    fetchTourDetails,
    createTourDetails,
    updateTourDetails,
    createTourInfo,
    updateTourInfo,
    deleteTourInfo,
    createTourDay,
    updateTourDay,
    deleteTourDay,
    createTourImage,
    updateTourImage,
    deleteTourImage
  }
} 