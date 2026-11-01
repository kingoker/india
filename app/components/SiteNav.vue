<script setup lang="ts">
/**
 * Глобальная навигация-островок: один плавающий бар.
 *  — мобилка (<861px): снизу экрана.
 *  — десктоп (≥861px): сверху по центру (см. main.css).
 */
const route = useRoute()
const { openQuiz } = useQuiz()

const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))

// Над тёмными блоками (hero страниц, огненные полосы) полупрозрачный бар теряется —
// пока такой блок под баром, делаем его плотным (класс .on-hero, см. main.css).
const DARK = '.home .hero, .yg-hero, .tr-hero, .ab-hero, .pg-fireband, .yg-final'
const onHero = ref(false)
const update = () => {
  onHero.value = [...document.querySelectorAll(DARK)].some((el) => {
    const r = el.getBoundingClientRect()
    return r.top < 90 && r.bottom > 120
  })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
watch(() => route.path, () => nextTick(update))
</script>

<template>
  <nav class="dock" :class="{ 'on-hero': onHero }" aria-label="Основная навигация">
    <NuxtLink to="/" :class="{ active: isActive('/') }">
      <AppIcon name="home" />Главная
    </NuxtLink>
    <NuxtLink to="/yagyi" :class="{ active: isActive('/yagyi') }">
      <AppIcon name="leaf" />Практики
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
