export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { message, chatIds } = body
    
    if (!message || !chatIds) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: message and chatIds'
      })
    }
    
    const config = useRuntimeConfig()
    const botToken = config.telegramBotToken
    
    if (!botToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Telegram bot token not configured'
      })
    }
    
    // Отправляем сообщение во все указанные чаты
    const chatIdsArray = Array.isArray(chatIds) ? chatIds : [chatIds]
    const results = []
    
    for (const chatId of chatIdsArray) {
      try {
        const response = await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          body: {
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          }
        })
        
        results.push({
          chatId,
          success: true,
          result: response
        })
      } catch (error) {
        console.error(`Ошибка отправки в чат ${chatId}:`, error)
        results.push({
          chatId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return {
      success: true,
      results
    }
    
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send Telegram message'
    })
  }
}) 