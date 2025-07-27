<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" @click="$emit('close')">
    <div class="relative bg-white rounded-[32px] shadow-2xl max-w-[500px] md:max-w-[800px] w-full mx-2 p-6 md:p-10 flex flex-col max-h-[90vh] overflow-y-auto" @click.stop>
      <!-- Кнопка закрытия -->
      <button
        class="absolute top-6 right-6 w-16 h-16 flex items-center justify-center rounded-full transition-colors duration-200 group"
        @click="$emit('close')"
        aria-label="Закрыть"
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" class="circle-bg transition-colors duration-200" />
          <circle cx="32" cy="32" r="30" class="circle-outline transition-colors duration-200" fill="none" stroke="#FF9500" stroke-width="1" />
          <path d="M20 20L44 44" class="cross-line transition-colors duration-200" stroke-width="4" stroke-linecap="round"/>
          <path d="M44 20L20 44" class="cross-line transition-colors duration-200" stroke-width="4" stroke-linecap="round"/>
        </svg>
      </button>
      <!-- Заголовок -->
      <div class="flex items-end justify-between mb-2 mt-2">
        <h2 class="text-[29px] md:text-[56px] font-alice text-orange-400 font-normal text-left leading-[0.8] break-words">
          {{ title }}
        </h2>
        <div class="w-16 h-16 flex-shrink-0"></div>
      </div>
      <div class="h-1 w-full bg-orange-400 mb-4" style="opacity:0.3"></div>
      <div class="flex flex-col md:flex-row gap-4 md:gap-[10px] items-start">
        <img v-if="image" :src="image" alt="" class="w-full md:w-[365px] object-contain rounded-2xl mb-2 md:mb-0 flex-shrink-0" />
        <img v-else src="https://saletur.ru/galery/tfoto/big/061/49/614981.jpg" alt="Заглушка" class="w-full md:w-[365px] object-contain rounded-2xl mb-2 md:mb-0 flex-shrink-0" />
        <div class="text-black text-[24px] font-alice leading-tight break-words min-w-0">
          <slot>{{ text }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  title: String,
  text: String,
  image: String
})

const emit = defineEmits(['close'])

// Функция для блокировки скролла
const disableScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = '0px' // Компенсация для скроллбара
}

// Функция для разблокировки скролла
const enableScroll = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// Обработчик клавиши Escape
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Блокируем скролл при монтировании компонента
onMounted(() => {
  disableScroll()
  // Добавляем обработчик клавиши Escape
  document.addEventListener('keydown', handleEscape)
})

// Разблокируем скролл при размонтировании компонента
onUnmounted(() => {
  enableScroll()
  // Удаляем обработчик клавиши Escape
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
button[aria-label="Закрыть"] .circle-bg {
  fill: transparent;
}
button[aria-label="Закрыть"] .cross-line {
  stroke: #FF9500;
}
button[aria-label="Закрыть"]:hover .circle-bg {
  fill: #FF9500;
}
button[aria-label="Закрыть"]:hover .cross-line {
  stroke: #fff;
}

/* Кастомный скроллбар */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #f59e42;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #d97706;
}
</style> 