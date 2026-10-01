<script setup lang="ts">
const config = useRuntimeConfig()

const title = 'Взгляд сверху — ведическая астрология и Индия'
const description = 'Читаем вашу карту и ведём по ней — от разбора до огненных ягий и поездки в места силы Индии.'

useSeoMeta({
  title,
  titleTemplate: (t?: string) => (t && t !== title ? `${t} — Взгляд сверху` : title),
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogImage: `${config.public.siteUrl}/images/hero.jpg`,
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image'
})

// canonical и og:url — только когда задан SITE_URL
if (config.public.siteUrl) {
  const route = useRoute()
  useHead({ link: [{ rel: 'canonical', href: computed(() => config.public.siteUrl + route.path) }] })
  useSeoMeta({ ogUrl: computed(() => config.public.siteUrl + route.path) })
}

// Яндекс.Метрика (подключается при заданном ID)
if (config.public.metrikaId) {
  useHead({
    script: [{
      key: 'ym',
      innerHTML: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${config.public.metrikaId},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true});`
    }]
  })
}
</script>

<template>
  <div>
    <a href="#main" class="sr-only focus:not-sr-only">К содержимому</a>
    <main id="main">
      <NuxtPage />
    </main>
    <SiteFooter />
    <SiteNav />
    <QuizModal />
    <ReviewModal />
    <VideoLightbox />
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.sr-only.focus\:not-sr-only:focus {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 100;
  width: auto;
  height: auto;
  margin: 0;
  padding: 10px 18px;
  clip: auto;
  background: var(--saffron);
  color: #fff;
  border-radius: 12px;
}
</style>
