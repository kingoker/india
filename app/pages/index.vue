<template>
  <div class="flex items-center justify-center min-h-screen">
    <h1 class="text-3xl font-bold">Загрузка...</h1>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// Предзагружаем данные на сервере для ускорения
await $fetch('/api/preload-data')

// Перенаправляем на страницу туров при загрузке
onMounted(() => {
  navigateTo('/tours')
})
</script>
  