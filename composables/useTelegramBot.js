export function useTelegramBot() {
  const config = useRuntimeConfig()
  
  const sendTelegramNotification = async (bookingData) => {
    try {
      const message = formatBookingMessage(bookingData)
      
      const response = await $fetch('/api/telegram/send', {
        method: 'POST',
        body: {
          message,
          chatIds: config.public.telegramChatIds
        }
      })
      
      return response
    } catch (error) {
      console.error('Ошибка отправки уведомления в Telegram:', error)
      throw error
    }
  }
  
  const formatBookingMessage = (bookingData) => {
    const emoji = bookingData.itemType === 'tour' ? '🏛️' : '🔥'
    const typeText = bookingData.itemType === 'tour' ? 'ТУР' : 'ЯГЬЯ'
    
    let message = `${emoji} *НОВАЯ ЗАЯВКА НА ${typeText}*\n\n`
    message += `👤 *Имя:* ${bookingData.name}\n`
    message += `📞 *Телефон:* ${bookingData.phone}\n`
    message += `📋 *Название:* ${bookingData.itemTitle}\n`
    message += `🆔 *ID:* ${bookingData.itemId}\n`
    
    if (bookingData.comments && bookingData.comments.trim()) {
      message += `💬 *Комментарий:* ${bookingData.comments}\n`
    }
    
    message += `\n⏰ *Время:* ${new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })}`
    
    return message
  }
  
  return {
    sendTelegramNotification
  }
} 