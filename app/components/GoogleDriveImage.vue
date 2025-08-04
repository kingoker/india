<template>
  <ClientOnly>
    <img
      :src="finalImageUrl"
      :alt="alt"
      :class="imageClass"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <template #fallback>
      <div :class="imageClass" class="bg-gray-200 animate-pulse" style="min-height: 200px;"></div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: false
  },
  src: {
    type: String,
    required: false
  },
  alt: {
    type: String,
    default: 'Изображение'
  },
  imageClass: {
    type: String,
    default: ''
  }
})

// Функция для преобразования Google Drive ссылок
const convertGoogleDriveUrl = (url) => {
  if (!url) return ''
  
  // Проверяем, является ли это Google Drive ссылкой
  if (url.includes('drive.google.com/file/d/')) {
    // Извлекаем ID файла из URL
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match) {
      const fileId = match[1]
      // Возвращаем URL для получения изображения
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  
  return url
}

// Используем imageUrl или src, приоритет у imageUrl
const finalImageUrl = computed(() => {
  const url = props.imageUrl || props.src || ''
  return convertGoogleDriveUrl(url)
})

const emit = defineEmits(['load', 'error'])

const handleImageError = (event) => {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  emit('error', event)
}

const handleImageLoad = (event) => {
  emit('load', event)
}
</script> 