<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'ru'
  }
})

const title = 'Ягья · INDIA'
const description = 'Ведические огненные ритуалы (Ягья), практики, курс и туры в Индию. Глубинные изменения через практику огня.'

useSeoMeta({
  title,
  titleTemplate: (t?: string) => (t && t !== title ? `${t} · Ягья · INDIA` : title),
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const nav: NavigationMenuItem[] = [
  { label: 'Главная', to: '/' },
  { label: 'Курс', to: '/kurs' },
  { label: 'Практики', to: '/praktiki' },
  { label: 'Ягья', to: '/yagya' },
  { label: 'Туры', to: '/tury' }
]
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide"
        >
          <span class="text-primary text-2xl">ॐ</span>
          <span>Ягья<span class="text-muted"> · INDIA</span></span>
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="nav"
        variant="link"
      />

      <template #right>
        <UColorModeButton />
        <UButton
          to="https://t.me/vzglyad_sverhy"
          target="_blank"
          icon="i-simple-icons-telegram"
          color="primary"
          variant="soft"
          aria-label="Telegram"
        />
        <UButton
          label="Оставить заявку"
          color="primary"
          class="hidden sm:inline-flex"
          to="/#zayavka"
        />
      </template>

      <template #body>
        <UNavigationMenu
          :items="nav"
          orientation="vertical"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Ягья · INDIA
        </p>
      </template>

      <template #right>
        <UButton
          to="https://t.me/vzglyad_sverhy"
          target="_blank"
          icon="i-simple-icons-telegram"
          color="neutral"
          variant="ghost"
          aria-label="Telegram"
        />
        <UButton
          to="https://www.instagram.com/ll_tuo_sole/"
          target="_blank"
          icon="i-simple-icons-instagram"
          color="neutral"
          variant="ghost"
          aria-label="Instagram"
        />
      </template>
    </UFooter>
  </UApp>
</template>
