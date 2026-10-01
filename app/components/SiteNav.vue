<script setup lang="ts">
/**
 * Глобальная навигация-островок: один плавающий бар.
 *  — мобилка (<861px): снизу экрана.
 *  — десктоп (≥861px): сверху по центру (см. main.css).
 */
const route = useRoute()
const { openQuiz } = useQuiz()

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
  <nav class="dock" aria-label="Основная навигация">
    <NuxtLink to="/" :class="{ active: isActive('/') }">
      <AppIcon name="home" />Главная
    </NuxtLink>
    <NuxtLink to="/yagyi" :class="{ active: isActive('/yagyi') }">
      <AppIcon name="leaf" />Ягьи
    </NuxtLink>
    <button class="spark" aria-label="Пройти опрос" @click="openQuiz()">
      <AppIcon name="spark" />
    </button>
    <NuxtLink to="/tury" :class="{ active: isActive('/tury') }">
      <AppIcon name="globe" />Туры
    </NuxtLink>
    <NuxtLink to="/o-nas" :class="{ active: isActive('/o-nas') }">
      <AppIcon name="user" />О нас
    </NuxtLink>
  </nav>
</template>
