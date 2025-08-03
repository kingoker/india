<script setup>
import { useTours } from '../../../composables/useTours'
import { useAdminCheck } from '../../../composables/useAdminCheck'
import { ref, computed, onMounted } from 'vue'
import GoogleDriveImage from '../../components/GoogleDriveImage.vue'

const route = useRoute()
const { tours, loading, error, fetchTours } = useTours()
const { isAdmin, initAdminCheck } = useAdminCheck()
const user = useSupabaseUser()
const defaultImage = 'https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2017/04/India-1-Taj-Mahal-e1492124232509.jpg'
const hovered = ref(null)

// Состояние для попапов
const isAddTourPopupOpen = ref(false)
const isEditTourPopupOpen = ref(false)
const editingTour = ref(null)

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

// Инициализация при загрузке страницы
onMounted(async () => {
  // Инициализируем проверку админа
  await initAdminCheck()
})

// Функции для работы с попапом добавления тура
const openAddTourPopup = () => {
  isAddTourPopupOpen.value = true
}

const closeAddTourPopup = () => {
  isAddTourPopupOpen.value = false
}

const handleTourAdded = (newTour) => {
  // Обновляем список туров после добавления
  fetchTours()
}

const handleTourEdited = (editedTour) => {
  // Обновляем список туров после редактирования
  fetchTours()
}

const openEditTourPopup = (tour) => {
  editingTour.value = tour
  isEditTourPopupOpen.value = true
}

const closeEditTourPopup = () => {
  isEditTourPopupOpen.value = false
  editingTour.value = null
}

const confirmDeleteTour = (tour) => {
  if (confirm(`Вы уверены, что хотите удалить тур "${tour.title}"? Это действие нельзя отменить.`)) {
    deleteTour(tour.id)
  }
}

const deleteTour = async (tourId) => {
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase
      .from('tours')
      .delete()
      .eq('id', tourId)

    if (error) {
      alert('Ошибка удаления тура: ' + error.message)
    } else {
      // Обновляем список туров после удаления
      fetchTours()
    }
  } catch (err) {
    alert('Ошибка удаления тура')
  }
}

</script>

<template>
  <section class="relative w-full min-h-[500px] flex items-end justify-center overflow-hidden mb-12">
    <!-- Баннер -->
    <GoogleDriveImage
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
      
      <div
        v-for="tour in sortedTours"
        :key="tour.id"
        class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 group w-full min-h-[600px] max-w-[calc(100vw-32px)] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end block"
        :style="hovered === tour.id ? '' : 'box-shadow: 8px 8px 0 0 #ff9900;'"
      >
        <!-- Админ кнопки -->
        <div v-if="isAdmin" class="absolute top-4 left-4 z-30 flex gap-2 pointer-events-auto">
          <button
            @click="openEditTourPopup(tour)"
            class="bg-blue-500 hover:bg-blue-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Изменить
          </button>
          <button
            @click="confirmDeleteTour(tour)"
            class="bg-red-500 hover:bg-red-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Удалить
          </button>
        </div>

        <GoogleDriveImage
          :src="tour.image_url || defaultImage"
          :alt="tour.title"
          class="absolute inset-0 w-full h-full object-cover object-center z-0"
          draggable="false"
        />
        <span class="absolute top-4 right-4 z-20 transition-all duration-300 opacity-60 group-hover:opacity-100">
          <img src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//arrow.svg" alt="arrow" width="55" height="55" draggable="false" />
        </span>
        <div class="absolute bottom-0 left-0 w-full h-3/5 bg-gradient-to-t from-black/95 to-transparent z-10"></div>
        
        <NuxtLink
          :to="`/tours/${tour.slug || tour.id}`"
          class="relative z-20 flex flex-col gap-1 h-full justify-end"
        >
          <div class="relative z-20 flex flex-col gap-1">
            <h2 class="text-white font-montserrat font-bold text-[34px] leading-[0.8]">{{ tour.title }}</h2>
            <p class="text-white font-montserrat font-light text-[20px] opacity-90 leading-[1.1]">{{ tour.description }}</p>
            <span class="inline-block self-start mt-2 px-[15px] py-[10px] rounded-full border border-white text-white text-[16px] font-montserrat font-light bg-white/50 backdrop-blur-md">
              {{ formatTourDates(tour.date_from, tour.date_to) }}
            </span>
          </div>
        </NuxtLink>
      </div>
      
      <!-- Карточка добавления тура для админов -->
      <div
        v-if="isAdmin"
        @click="openAddTourPopup"
        class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 cursor-pointer w-full min-h-[600px] max-w-[calc(100vw-32px)] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-center items-center border-2 border-dashed border-orange-400 hover:border-orange-500 hover:bg-orange-50"
        style="box-shadow: 8px 8px 0 0 #ff9900;"
      >
        <div class="text-center">
          <div class="text-orange-400 text-6xl md:text-8xl font-bold mb-4">+</div>
          <h3 class="text-orange-400 font-montserrat font-bold text-[24px] md:text-[28px] mb-2">
            Добавить тур
          </h3>
          <p class="text-gray-600 font-montserrat text-[16px] md:text-[18px]">
            Нажмите, чтобы создать новый тур
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Попап добавления тура -->
  <AddTourPopup
    :is-open="isAddTourPopupOpen"
    @close="closeAddTourPopup"
    @success="handleTourAdded"
  />

  <!-- Попап редактирования тура -->
  <AddTourPopup
    :is-open="isEditTourPopupOpen"
    :editing-tour="editingTour"
    @close="closeEditTourPopup"
    @success="handleTourEdited"
  />
</template> 