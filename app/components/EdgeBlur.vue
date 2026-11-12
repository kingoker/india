<script setup lang="ts">
/**
 * Прогрессивное размытие у нижнего края экрана: контент «растворяется», уходя под край.
 * Шесть слоёв backdrop-filter, размытие удваивается от слоя к слою, каждый виден в своей полосе.
 * Без подкраски — секции чередуют бумажный и ночной фон. У самого низа страницы гаснет,
 * чтобы последние строки подвала читались.
 */
const atEnd = ref(false)
let raf = 0

function check() {
  raf = 0
  const doc = document.documentElement
  atEnd.value = window.innerHeight + window.scrollY >= doc.scrollHeight - 24
}
function onScroll() {
  if (!raf) raf = requestAnimationFrame(check)
}

onMounted(() => {
  check()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="edge-blur" :class="{ 'at-end': atEnd }" aria-hidden="true">
    <i v-for="n in 6" :key="n" />
  </div>
</template>
