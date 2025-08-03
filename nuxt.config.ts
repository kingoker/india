// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', // временно отключено
  '@nuxtjs/supabase', '@nuxt/image-edge', '@nuxt/image'],
  image: {
    domains: [
      'images.unsplash.com',
      'wnfudwbexanzlzarfwtf.supabase.co'
    ]
  },

  tailwindcss: {
    viewer: false,
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  imports: {
    dirs: ['composables'],
  },

  ssr: false,

  vite: {
    server: {
      allowedHosts: ['india.kingdesignn.ru']
    }
  },

  nitro: {
    preset: 'node',
  },

  supabase: {
    redirect: false,
    // redirectOptions: {
    //   login: '/login',
    //   callback: '/',
    //   include: [],
    //   exclude: ['*'],
    //   saveRedirectToCookie: false,
    // }
  },

  runtimeConfig: {
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    public: {
      telegramChatIds: process.env.TELEGRAM_CHAT_IDS?.split(',') || []
    }
  },

  // Отладочная информация
  hooks: {
    'build:before': () => {
      console.log('Environment variables:', {
        TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ? 'SET' : 'NOT SET',
        TELEGRAM_CHAT_IDS: process.env.TELEGRAM_CHAT_IDS ? 'SET' : 'NOT SET'
      })
    }
  }
})