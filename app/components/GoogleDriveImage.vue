<template>
  <ClientOnly>
    <img
      v-if="isClient && finalImageUrl"
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

const isClient = ref(false)
const errorCount = ref(0)
const maxErrors = 3 // Максимальное количество попыток загрузки

// Проверяем, что мы на клиенте
if (typeof window !== 'undefined') {
  isClient.value = true
}

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
      // Используем thumbnail ссылку по умолчанию - она более надежна
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  
  // Если это уже thumbnail ссылка, оставляем как есть
  if (url.includes('drive.google.com/thumbnail')) {
    return url
  }
  
  // Если это прямая ссылка на Google Drive, конвертируем в thumbnail
  if (url.includes('drive.google.com/uc?export=view')) {
    const fileId = url.match(/id=([a-zA-Z0-9_-]+)/)?.[1]
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  
  return url
}

// Проверяем, является ли URL валидным
const isValidUrl = (url) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Используем imageUrl или src, приоритет у imageUrl
const finalImageUrl = computed(() => {
  const url = props.imageUrl || props.src || ''
  const convertedUrl = convertGoogleDriveUrl(url)
  return isValidUrl(convertedUrl) ? convertedUrl : ''
})

const emit = defineEmits(['load', 'error'])

const handleImageError = (event) => {
  errorCount.value++
  
  // Показываем предупреждение только при первой попытке
  if (errorCount.value === 1) {
    console.debug('Попытка загрузки изображения не удалась:', event.target.src)
  }
  
  // Если это Google Drive ссылка, пробуем альтернативные URL
  const currentSrc = event.target.src
  if (currentSrc.includes('drive.google.com') && errorCount.value < maxErrors) {
    const fileId = currentSrc.match(/id=([a-zA-Z0-9_-]+)/)?.[1]
    if (fileId) {
      // Пробуем разные варианты Google Drive URL
      const fallbackUrls = [
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`,
        `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
        `https://drive.google.com/uc?id=${fileId}&export=download`,
        `https://drive.google.com/uc?id=${fileId}&export=view&confirm=t`
      ]
      
      // Пробуем следующий URL из списка
      const currentIndex = fallbackUrls.findIndex(url => url === currentSrc)
      const nextUrl = fallbackUrls[currentIndex + 1] || fallbackUrls[0]
      
      if (nextUrl !== currentSrc) {
        event.target.src = nextUrl
        return
      }
    }
  }
  
  // Если все варианты не работают или превышен лимит попыток, показываем placeholder
  event.target.style.display = 'none'
  const placeholder = document.createElement('div')
  placeholder.className = 'bg-gray-300 flex items-center justify-center text-gray-500'
  placeholder.style.cssText = event.target.className + '; min-height: 200px;'
  placeholder.innerHTML = '<span>Изображение недоступно</span>'
  event.target.parentNode.insertBefore(placeholder, event.target)
  
  emit('error', event)
}

const handleImageLoad = (event) => {
  // Сбрасываем счетчик ошибок при успешной загрузке
  errorCount.value = 0
  emit('load', event)
}
</script> 