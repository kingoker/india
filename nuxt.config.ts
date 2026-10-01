// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600&family=Golos+Text:wght@400;500;600&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Дизайн «Взгляд сверху» — тёплая «ночная» витрина, светлая тема без переключателя.
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    // Серверный (service_role) ключ — только на сервере, для записи заявок в обход RLS.
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    public: {
      // Публичный адрес сайта (https://домен, без слэша в конце) — canonical, og:url, sitemap, robots
      siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
      // Supabase (self-hosted VPS). anon key безопасно держать на клиенте.
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      // Схема проекта в общем self-hosted Supabase (один инстанс = один «проект»)
      supabaseSchema: process.env.SUPABASE_SCHEMA || 'yagya',
      telegramChatIds: process.env.TELEGRAM_CHAT_IDS?.split(',') || [],
      telegramContact: process.env.TELEGRAM_CONTACT || 'https://t.me/ll_tuo_sole',
      instagramUrl: process.env.INSTAGRAM_URL || 'https://www.instagram.com/ll_tuo_sole/',
      metrikaId: process.env.YANDEX_METRIKA_ID || '',
      // Реквизиты оператора персональных данных (подвал и юридические страницы)
      operator: {
        name: process.env.OPERATOR_NAME || '',
        inn: process.env.OPERATOR_INN || '',
        ogrnLabel: process.env.OPERATOR_OGRN_LABEL || 'ОГРНИП',
        ogrn: process.env.OPERATOR_OGRN || '',
        address: process.env.OPERATOR_ADDRESS || '',
        email: process.env.OPERATOR_EMAIL || '',
        // true — только если базы данных реально стоят на территории РФ
        dbInRu: process.env.OPERATOR_DB_IN_RU === 'true'
      }
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
