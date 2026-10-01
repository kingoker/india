<script setup lang="ts">
/**
 * Шапка внутренних страниц: бренд слева, Telegram справа — как на главной.
 * overlay — поверх тёмного hero (прозрачная, не липнет); по умолчанию — липкая светлая.
 */
withDefaults(defineProps<{ overlay?: boolean }>(), { overlay: false })
const config = useRuntimeConfig()
</script>

<template>
  <div class="inner-top" :class="{ 'inner-top--overlay': overlay }">
    <div class="inner-top-in" :class="overlay ? 'inner-top-pad' : 'wrap'">
      <NuxtLink to="/" class="brand" aria-label="Взгляд сверху — на главную" style="text-decoration:none">
        <span class="mark"><BrandMark :size="overlay ? 38 : 30" /></span>
        <span class="name">Взгляд сверху</span>
      </NuxtLink>
      <a
        class="tg-link"
        :href="config.public.telegramContact"
        target="_blank"
        rel="noopener"
        aria-label="Написать в Telegram"
      >
        <span class="tg-ic"><AppIcon name="telegram" /></span>
        <span class="tg-tx">Telegram</span>
      </a>
    </div>
  </div>
</template>
