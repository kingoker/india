import { ref } from 'vue'

export const useBookingSubmit = () => {
  const loading = ref(false)
  const error = ref(null)

  const submitBooking = async (bookingData) => {
    loading.value = true
    error.value = null

    try {
      const supabase = useSupabaseClient()
      
      // Проверяем, что все обязательные поля заполнены
      if (!bookingData.name || !bookingData.phone) {
        throw new Error('Не все обязательные поля заполнены')
      }

      // Проверяем, что указан хотя бы один ID (yagya_id или tour_id)
      if (!bookingData.yagya_id && !bookingData.tour_id) {
        throw new Error('Не указан ID ягьи или тура')
      }

      // Валидируем UUID формат
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (bookingData.yagya_id && !uuidRegex.test(bookingData.yagya_id)) {
        throw new Error('Неверный формат ID ягьи')
      }
      
      if (bookingData.tour_id && !uuidRegex.test(bookingData.tour_id)) {
        throw new Error('Неверный формат ID тура')
      }

      // Валидируем телефон
      if (!bookingData.phone.startsWith('+')) {
        throw new Error('Телефон должен начинаться с +')
      }

      const insertData = {
        name: bookingData.name.trim(),
        phone: bookingData.phone.trim(),
        comments: bookingData.comments?.trim() || null,
        status: 'pending'
      }

      // Добавляем соответствующий ID
      if (bookingData.yagya_id) {
        insertData.yagya_id = bookingData.yagya_id
      } else if (bookingData.tour_id) {
        insertData.tour_id = bookingData.tour_id
      }

      const { data, error: supabaseError } = await supabase
        .from('bookings')
        .insert([insertData])
        .select()
        .single()

      if (supabaseError) {
        throw new Error(supabaseError.message)
      }

      return data

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    submitBooking
  }
} 