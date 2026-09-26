# Ягья · INDIA

Сайт ведического бренда: огненные ритуалы (Ягья), практики, курс и туры в Индию.
Новая версия проекта (старт с нуля).

## Стек

- **Nuxt 4** (Vue 3) + TypeScript
- **Nuxt UI 4** + **Tailwind CSS 4**
- **GSAP** + **Lenis** — анимации и плавный скролл
- **Supabase** (self-hosted на VPS) — БД, авторизация, storage

## Разделы

Главная · Курс · Практики · **Ягья** (флагман) · Туры

## Запуск

```bash
npm install
cp .env.example .env   # заполнить SUPABASE_URL / SUPABASE_KEY
npm run dev            # http://localhost:3000
```

## Окружение (`.env`)

| Переменная | Назначение |
|---|---|
| `SUPABASE_URL` | URL Supabase API (self-hosted, порт 8000) |
| `SUPABASE_KEY` | anon key |
| `TELEGRAM_BOT_TOKEN` | токен бота для заявок |
| `TELEGRAM_CHAT_IDS` | id чатов для уведомлений |

> ⚠️ Перед публикацией: закрыть порт Postgres 5432 файрволом и поднять HTTPS для Supabase API.
