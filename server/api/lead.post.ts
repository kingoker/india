import { createClient } from '@supabase/supabase-js'

/**
 * Приём заявок (ТЗ §6, MVP):
 *  1. Валидация обязательных полей.
 *  2. Сохранение в таблицу leads (Supabase).
 *  3. Мгновенное уведомление организаторам в Telegram.
 *
 * Форма считается отправленной, если ушло хотя бы одно из двух
 * (запись в БД или сообщение в Telegram). Ошибки логируются, но
 * пользователю возвращается понятный результат.
 */

interface LeadBody {
  type?: string
  subject?: string
  service?: string
  name?: string
  contact?: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  forWhom?: string
  intention?: string
  message?: string
  consent?: boolean
  consentVersion?: string
}

const TYPE_LABELS: Record<string, string> = {
  consultation: 'Консультация',
  yagya: 'Участие в ягье',
  tour: 'Бронь тура',
  course: 'Запись на курс',
  waitlist: 'Лист ожидания',
  general: 'Заявка'
}

function esc(s = ''): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<LeadBody>(event)

  // --- Валидация ---
  const name = (body.name || '').trim()
  const contact = (body.contact || '').trim()
  if (!name || !contact) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите имя и контакт' })
  }

  // Согласие на обработку ПД обязательно (152-ФЗ, ст. 9)
  if (body.consent !== true) {
    throw createError({ statusCode: 400, statusMessage: 'Нужно согласие на обработку персональных данных' })
  }

  const type = body.type || 'general'
  const typeLabel = TYPE_LABELS[type] || 'Заявка'
  const createdAt = new Date().toISOString()

  const record = {
    type,
    subject: body.subject || null,
    service: body.service || null,
    name,
    contact,
    birth_date: body.birthDate || null,
    birth_time: body.birthTime || null,
    birth_place: body.birthPlace || null,
    for_whom: body.forWhom || null,
    intention: body.intention || null,
    message: body.message || null,
    consent_at: createdAt,
    consent_version: body.consentVersion || null,
    created_at: createdAt
  }

  let savedToDb = false
  let sentToTelegram = false

  // --- Сохранение в Supabase ---
  try {
    const url = config.public.supabaseUrl as string
    const key = (config.supabaseServiceKey || config.public.supabaseKey) as string
    if (url && key) {
      const supabase = createClient(url, key, {
        db: { schema: config.public.supabaseSchema as string },
        auth: { persistSession: false }
      })
      const { error } = await supabase.from('leads').insert(record)
      if (error) console.error('[lead] supabase insert error:', error.message)
      else savedToDb = true
    }
  } catch (e) {
    console.error('[lead] supabase exception:', e)
  }

  // --- Уведомление в Telegram ---
  try {
    const token = config.telegramBotToken as string
    const chatIds = (config.public.telegramChatIds as string[]) || []
    if (token && chatIds.length) {
      const lines = [
        `<b>Новая заявка · ${esc(typeLabel)}</b>`,
        body.service ? `Услуга: ${esc(body.service)}` : '',
        body.subject ? `Тема: ${esc(body.subject)}` : '',
        `Имя: ${esc(name)}`,
        `Контакт: ${esc(contact)}`,
        body.birthDate ? `Рождение: ${esc(body.birthDate)} ${esc(body.birthTime)} ${esc(body.birthPlace)}` : '',
        body.forWhom ? `За кого: ${esc(body.forWhom)}` : '',
        body.intention ? `Намерение: ${esc(body.intention)}` : '',
        body.message ? `Сообщение: ${esc(body.message)}` : '',
        `Согласие на обработку ПД: да (ред. ${esc(body.consentVersion || '—')})`,
        `Время: ${new Date(createdAt).toLocaleString('ru-RU')}`
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
    console.error('[lead] telegram exception:', e)
  }

  if (!savedToDb && !sentToTelegram) {
    // Ничего не настроено или всё упало — в dev это ок, но сообщим об этом в лог.
    console.warn('[lead] заявка не сохранена и не отправлена (проверьте SUPABASE_* и TELEGRAM_*):', record)
    // В MVP всё равно не роняем UX жёстко, если это dev без настроек:
    if (process.env.NODE_ENV === 'production') {
      throw createError({ statusCode: 502, statusMessage: 'Не удалось принять заявку' })
    }
  }

  return { ok: true, savedToDb, sentToTelegram }
})
