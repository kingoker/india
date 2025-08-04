<template>
  <img
    :src="imageUrl"
    :alt="alt"
    :class="imageClass"
    loading="lazy"
    decoding="async"
    @error="handleImageError"
    @load="handleImageLoad"
  />
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  imageUrl: {
    type: String,
    required: true
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

const emit = defineEmits(['load', 'error'])

const handleImageError = (event) => {
  emit('error', event)
}

const handleImageLoad = (event) => {
  emit('load', event)
}
</script> 