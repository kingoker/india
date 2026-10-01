# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## О проекте

Сайт двух экспертов по ведической астрологии, ягьям и турам в Индию («Взгляд сверху»).
MVP = витрина, которая принимает заявки. Полное ТЗ — `ТЗ сайт «Ведическая астрология и Индия».md`.
Интерфейс и весь контент на русском (`htmlAttrs.lang: 'ru'`); пиши тексты, комментарии и
коммиты по-русски, как в существующем коде.

## Команды

```bash
npm run dev        # dev-сервер на http://localhost:3000 (или yagya-dev в .claude/launch.json)
npm run build      # прод-сборка
npm run preview    # предпросмотр собранного
npm run lint       # ESLint (@nuxt/eslint, стилистика: без trailing comma, 1tbs)
npm run typecheck  # vue-tsc / nuxt typecheck
```

Отдельного тест-раннера нет — проверка качества = `lint` + `typecheck`.
Для запуска dev-сервера используй preview-инструмент с `name: "yagya-dev"`, не `npm` напрямую.

## Стек и важные соглашения

- **Nuxt 4** (Vue 3, `<script setup>`) + TypeScript. Каталог приложения — `app/` (Nuxt 4 srcDir),
  поэтому `~/` указывает на `app/`.
- **Nuxt UI 4** + **Tailwind CSS 4**. Primary-цвет темы = `amber`, neutral = `stone`
  (`app/app.config.ts`). Тема только светлая, переключателя нет (`colorMode.preference: 'light'`).
- Tailwind токены и весь кастомный CSS — в `app/assets/css/main.css` (единый файл, портирован
  1:1 из `design-reference/prototype.html`). Дизайн-токены — не README-вские «Ночной Варанаси»,
  а тёплая бумажная палитра: `--paper`, `--ink`, `--marigold`, `--vermilion`, `--saffron`,
  `--gold-line`. Шрифты: Cormorant (заголовки) + Golos Text (текст), грузятся в `nuxt.config.ts`.
  README местами отстаёт от кода — при расхождении источник истины = сами файлы.

## Архитектура

### Контент: заглушки сейчас, Supabase потом
Данные витрины (ягьи, туры, фильтры) захардкожены в composables и отдаются как статика:
`useCatalog.ts`, `useReviews.ts`, `useQuiz.ts`. Форма данных (интерфейсы `Yagya`, `Tour`,
`Filter`) намеренно совпадает с будущей схемой БД — при переходе на Supabase меняется только
источник, не потребители. Старого `useSupabase`/`useContent` composable нет; клиент к БД
создаётся напрямую через `@supabase/supabase-js` в серверных эндпоинтах.

### Приём заявок и отзывов (сервер)
`server/api/lead.post.ts` и `server/api/review.post.ts` — единственная «живая» бизнес-логика:
1. валидация → 2. запись в Supabase → 3. уведомление организаторам в Telegram.
- Отправка считается успешной, если прошло **хотя бы одно** из двух (БД или Telegram).
  В dev без настроенных `SUPABASE_*`/`TELEGRAM_*` форма всё равно показывает «Спасибо»
  (ошибка только в проде). Это осознанное поведение — не «чини».
- Отзывы НЕ публикуются автоматически: пишутся с `is_active=false`/`status='pending'`,
  публичное чтение отдаёт только `is_active=true`.
- `server/routes/sitemap.xml.ts` — динамический sitemap.

### Юридический слой (152-ФЗ)
Подвал `SiteFooter.vue` и страницы `/docs/{privacy,consent,cookies,terms}` (`pages/docs/[slug].vue`)
строятся из `useLegal.ts` (тексты) и `useOperator.ts` (реквизиты из `OPERATOR_*` в `.env`; пока не
заполнены — на сайте видны красные заглушки `[ИНН]`). Обе формы (`QuizModal`, `ReviewModal`) требуют
неотмеченную по умолчанию галочку `ConsentField`; сервер отклоняет заявку без `consent: true` и пишет
`consent_at`/`consent_version` (миграция `0003_consent.sql` — применять ДО деплоя). Меняешь текст
документа — обнови `LEGAL_VERSION`. Ссылки на Instagram сопровождай пометкой о Meta (в подвале и «О нас»).

### Секреты и runtimeConfig
Все ключи через `runtimeConfig` (`nuxt.config.ts`): `telegramBotToken` и `supabaseServiceKey`
живут **только на сервере**; `supabaseUrl`/`supabaseKey` (anon) — в `public`. Запись заявок
в обход RLS идёт под `service_role`. Supabase — self-hosted на VPS (порт 8000).
Переменные окружения — см. `.env.example`.
⚠️ `.env` содержит реальные боевые ключи: тестовая заявка реально уходит организаторам в Telegram.

### База данных
⚠️ Supabase self-hosted = один проект на инстанс, БД делят несколько сайтов. Все объекты этого
проекта — только в схеме `yagya` (не `public`): в миграциях `yagya.<table>`, в клиенте
`db: { schema: SUPABASE_SCHEMA }`. Схему нужно добавить в `PGRST_DB_SCHEMAS` и перезапустить `rest`.
`supabase/migrations/` (`0001_init.sql` — services/yagyas/tours/tour_days/courses/articles/
reviews/leads + RLS; `0002_reviews_moderation.sql`). Миграции применяются вручную к Supabase
на VPS (SQL Editor в Studio или `psql`) — автоматического деплоя схемы нет.

### Анимация
`app/plugins/motion.client.ts` — единственный клиентский плагин: Lenis (инерционный скролл),
reveal по скроллу через классы (`[data-reveal]` / `[data-reveal-stagger]` → `.is-in`) и
параллакс декора (`[data-par]`). GSAP есть в зависимостях для hero-таймлайнов. Всё целиком
отключается при `prefers-reduced-motion` — любую новую анимацию добавляй с таким же gate.

### Страницы и компоненты
Страницы: `app/pages/{index,yagyi,tury,o-nas}.vue`. Переиспользуемые блоки витрины —
в `app/components/` (`SiteNav`, `CatalogCard`, `QuizModal`, `ReviewModal`, `AppOrnament`,
`AppStars`, `BrandMark` и др.). Макет-референс дизайна — `design-reference/`.
