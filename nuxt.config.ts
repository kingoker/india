// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', // временно отключено
  '@nuxtjs/supabase'],


  tailwindcss: {
    viewer: false,
  },

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  imports: {
    dirs: ['composables'],
  },

  ssr: true,
  
  // Оптимизация для быстрой загрузки
  experimental: {
    payloadExtraction: false
  },

  vite: {
    server: {
      allowedHosts: ['india.kingdesignn.ru']
    },
    // Оптимизация сборки
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            supabase: ['@supabase/supabase-js']
          }
        }
      }
    },
    // Оптимизация CSS
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/variables.scss";'
        }
      }
    },
    // Оптимизация для быстрой загрузки
    optimizeDeps: {
      include: ['vue', 'vue-router', '@supabase/supabase-js']
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

  // Оптимизация производительности
  app: {
    head: {
      link: [
        // DNS prefetch для внешних ресурсов
        { rel: 'dns-prefetch', href: 'https://wnfudwbexanzlzarfwtf.supabase.co' },
        { rel: 'dns-prefetch', href: 'https://saletur.ru' },
        { rel: 'dns-prefetch', href: 'https://cdn.tripzaza.com' }
      ],
      meta: [
        // Оптимизация для мобильных устройств
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        // DNS prefetch для внешних ресурсов
        { 'http-equiv': 'x-dns-prefetch-control', content: 'on' }
      ]
    }
  },


})