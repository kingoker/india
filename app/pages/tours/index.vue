<script setup>
import { useTours } from '../../../composables/useTours'
import { ref, computed } from 'vue'

const { tours, loading, error } = useTours()
const defaultImage = 'https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2017/04/India-1-Taj-Mahal-e1492124232509.jpg'
const hovered = ref(null)

function formatTourDates(dateFrom, dateTo) {
  if (!dateFrom || !dateTo) return ''
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  return `${from.getDate()} ${months[from.getMonth()]} – ${to.getDate()} ${months[to.getMonth()]}`
}

const sortedTours = computed(() => {
  return [...tours.value].sort((a, b) => new Date(a.date_from) - new Date(b.date_from))
})

// Удаляем неиспользуемые функции бронирования
</script>

<template>
  <section class="relative w-full min-h-[500px] flex items-end justify-center overflow-hidden mb-12">
    <!-- Баннер -->
    <img
      src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//tours%20banner.png"
      alt="Туры баннер"
      class="absolute inset-0 w-full h-full object-cover object-center z-0"
      draggable="false"
    />
    <!-- Заголовок -->
    <div class="relative z-20 pb-12 flex flex-col items-center w-full">
      <h1 class="text-white text-3xl md:text-[56px] md:leading-[68px] font-montserrat font-bold text-center max-w-3xl">
        Туры, в которых ты —<br />главный смысл
      </h1>
    </div>
  </section>

  <section class="flex justify-center px-2 sm:px-4 md:px-[50px] mb-16">
    <div v-if="loading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error.message }}</div>
    <div v-else class="flex flex-wrap gap-y-[50px] gap-x-[50px] justify-center w-full max-w-[1290px] mx-auto">
      <!-- Отладочная информация -->
      <div v-if="sortedTours.length === 0" class="w-full text-center text-gray-500">
        Нет доступных туров
      </div>
      
      <NuxtLink
        :to="`/tours/${tour.slug || tour.id}`"
        v-for="tour in sortedTours"
        :key="tour.id"
        class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 group w-full min-h-[600px] max-w-[calc(100vw-32px)] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end block"
        :style="hovered === tour.id ? '' : 'box-shadow: 8px 8px 0 0 #ff9900;'"
      >
        <img
          :src="tour.image_url || defaultImage"
          :alt="tour.title"
          class="absolute inset-0 w-full h-full object-cover object-center z-0"
          draggable="false"
        />
        <span class="absolute top-4 right-4 z-20 transition-all duration-300 opacity-60 group-hover:opacity-100">
          <img src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//arrow.svg" alt="arrow" width="55" height="55" draggable="false" />
        </span>
        <div class="absolute bottom-0 left-0 w-full h-3/5 bg-gradient-to-t from-black/95 to-transparent z-10"></div>
        <div class="relative z-20 flex flex-col gap-1">
          <h2 class="text-white font-montserrat font-bold text-[34px] leading-[0.8]">{{ tour.title }}</h2>
          <p class="text-white font-montserrat font-light text-[20px] opacity-90 leading-[1.1]">{{ tour.description }}</p>
          <span class="inline-block self-start mt-2 px-[15px] py-[10px] rounded-full border border-white text-white text-[16px] font-montserrat font-light bg-white/50 backdrop-blur-md">
            {{ formatTourDates(tour.date_from, tour.date_to) }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template> 