import { createClient } from '@supabase/supabase-js'

/**
 * Приём отзывов с сайта:
 *  1. Валидация (оценка + текст).
 *  2. Сохранение в reviews со статусом на модерации (is_active=false, status='pending').
 *  3. Уведомление организаторам в Telegram — чтобы одобрить/скрыть.
 *
 * Отзыв НЕ публикуется автоматически: публичное чтение отдаёт только is_active=true.
 */

interface ReviewBody {
  rating?: number
  text?: string
  name?: string
  contact?: string
  videoUrl?: string
  consent?: boolean
  consentVersion?: string
}

function esc(s = ''): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<ReviewBody>(event)

  // --- Валидация ---
  const rating = Math.round(Number(body.rating) || 0)
  const text = (body.text || '').trim()
  if (rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, statusMessage: 'Поставьте оценку от 1 до 5' })
  }
  if (text.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Отзыв слишком короткий' })
  }

  // Согласие на обработку ПД и публикацию отзыва обязательно (152-ФЗ, ст. 9, 10.1)
  if (body.consent !== true) {
    throw createError({ statusCode: 400, statusMessage: 'Нужно согласие на обработку персональных данных' })
  }

  const name = (body.name || '').trim() || 'Аноним'
  const contact = (body.contact || '').trim() || null
  const videoUrl = (body.videoUrl || '').trim() || null
  const createdAt = new Date().toISOString()

  const record = {
    name,
    text,
    rating,
    contact,
    video_url: videoUrl,
    source: 'site',
    status: 'pending',
    is_active: false, // публикуется только после модерации
    consent_at: createdAt,
    consent_version: body.consentVersion || null,
    created_at: createdAt
  }

  let savedToDb = false
  let sentToTelegram = false

  // --- Сохранение в Supabase (на модерацию) ---
  try {
    const url = config.public.supabaseUrl as string
    const key = (config.supabaseServiceKey || config.public.supabaseKey) as string
    if (url && key) {
      const supabase = createClient(url, key, {
        db: { schema: config.public.supabaseSchema as string },
        auth: { persistSession: false }
      })
      const { error } = await supabase.from('reviews').insert(record)
      if (error) console.error('[review] supabase insert error:', error.message)
      else savedToDb = true
    }
  } catch (e) {
    console.error('[review] supabase exception:', e)
  }

  // --- Уведомление в Telegram ---
  try {
    const token = config.telegramBotToken as string
    const chatIds = (config.public.telegramChatIds as string[]) || []
    if (token && chatIds.length) {
      const lines = [
        `<b>Новый отзыв · на модерации</b>`,
        `Оценка: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`,
        `Подпись: ${esc(name)}`,
        contact ? `Контакт: ${esc(contact)}` : '',
        videoUrl ? `Видео: ${esc(videoUrl)}` : '',
        '',
        esc(text),
        '',
        `Время: ${new Date(createdAt).toLocaleString('ru-RU')}`,
        'Одобрите в админке (is_active=true), чтобы опубликовать.'
      ].filter(Boolean).join('\n')

      const results = await Promise.allSettled(
        chatIds.map(chatId =>
          $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            body: { chat_id: chatId.trim(), text: lines, parse_mode: 'HTML', disable_web_page_preview: true }
          })
        )
      )
      sentToTelegram = results.some(r => r.status === 'fulfilled')
    }
  } catch (e) {
    console.error('[review] telegram exception:', e)
  }

  if (!savedToDb && !sentToTelegram) {
    console.warn('[review] отзыв не сохранён и не отправлен (проверьте SUPABASE_* и TELEGRAM_*):', record)
    if (process.env.NODE_ENV === 'production') {
      throw createError({ statusCode: 502, statusMessage: 'Не удалось принять отзыв' })
    }
  }

  return { ok: true, savedToDb, sentToTelegram }
})
