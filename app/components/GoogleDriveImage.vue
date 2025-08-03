<template>
  <img
    :src="currentSrc"
    :alt="alt"
    :class="imgClass"
    @error="handleImageError"
    @load="handleImageLoad"
    v-bind="$attrs"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { isGoogleDriveUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  imgClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['error', 'load'])

const currentSrc = ref(props.src)
const errorCount = ref(0)

// Массив альтернативных URL для Google Drive
const getGoogleDriveAlternatives = (fileId) => [
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
  `https://drive.google.com/uc?id=${fileId}&export=view`,
  `https://drive.google.com/uc?id=${fileId}&export=download`
]

// Извлекаем fileId из Google Drive URL
const extractFileId = (url) => {
  // Поддерживаем разные форматы Google Drive ссылок
  const patterns = [
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view\?usp=drive_link/,
    /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/,
    /https:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /https:\/\/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}

// Получаем альтернативные URL для Google Drive
const getAlternatives = computed(() => {
  if (isGoogleDriveUrl(props.src)) {
    const fileId = extractFileId(props.src)
    if (fileId) {
      return getGoogleDriveAlternatives(fileId)
    }
  }
  return []
})

// Получаем рабочий URL для Google Drive
const getWorkingUrl = computed(() => {
  if (isGoogleDriveUrl(props.src)) {
    const fileId = extractFileId(props.src)
    if (fileId) {
      // Сразу используем рабочий thumbnail URL
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  return props.src
})

const handleImageError = () => {
  const alternatives = getAlternatives.value
  
  if (alternatives.length > 0 && errorCount.value < alternatives.length) {
    // Пробуем следующий альтернативный URL
    currentSrc.value = alternatives[errorCount.value]
    errorCount.value++
  } else {
    // Все альтернативы исчерпаны или это не Google Drive
    emit('error', new Error('Не удалось загрузить изображение'))
  }
}

const handleImageLoad = () => {
  emit('load')
}

// Следим за изменением src
watch(() => props.src, (newSrc) => {
  // Сразу используем рабочий URL для Google Drive
  currentSrc.value = getWorkingUrl.value
  errorCount.value = 0
}, { immediate: true })
</script> 