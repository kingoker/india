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

      // Отправляем уведомление в Telegram
      try {
        const config = useRuntimeConfig()
        
        // Определяем тип заявки и название
        const itemType = bookingData.yagya_id ? 'yagya' : 'tour'
        const itemId = bookingData.yagya_id || bookingData.tour_id
        const itemTitle = bookingData.itemTitle || 'Без названия'
        
        // Получаем название тура/ягьи из базы данных
        let itemName = itemTitle
        try {
          const supabase = useSupabaseClient()
          
          if (itemType === 'tour') {
            const { data: tourData } = await supabase
              .from('tours')
              .select('title')
              .eq('id', itemId)
              .single()
            
            if (tourData && tourData.title) {
              itemName = tourData.title
            }
          } else {
            const { data: yagyaData } = await supabase
              .from('yagya')
              .select('title')
              .eq('id', itemId)
              .single()
            
            if (yagyaData && yagyaData.title) {
              itemName = yagyaData.title
            }
          }
        } catch (error) {
          console.error('Ошибка получения названия:', error)
          // Используем itemTitle как fallback
        }
        
        // Форматируем сообщение
        const emoji = itemType === 'tour' ? '🏛️' : '🔥'
        const typeText = itemType === 'tour' ? 'ТУР' : 'ЯГЬЯ'
        
        let message = `${emoji} *НОВАЯ ЗАЯВКА НА ${typeText}*\n\n`
        message += `👤 *Имя:* ${bookingData.name.trim()}\n`
        message += `📞 *Телефон:* ${bookingData.phone.trim()}\n`
        message += `📋 *Название:* ${itemName}\n`
        
        if (bookingData.comments && bookingData.comments.trim()) {
          message += `💬 *Комментарий:* ${bookingData.comments.trim()}\n`
        }
        
        message += `\n⏰ *Время:* ${new Date().toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })}`
        
        // Отправляем сообщение
        await $fetch('/api/telegram/send', {
          method: 'POST',
          body: {
            message,
            chatIds: config.public.telegramChatIds
          }
        })
      } catch (telegramError) {
        console.error('Ошибка отправки в Telegram:', telegramError)
        // Не прерываем процесс, так как заявка уже сохранена в БД
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