<script setup>
import { ref, computed, watch } from 'vue'
import { useYagya } from '../../composables/useYagya'
import { useYagyaInfo } from '../../composables/useYagyaInfo.js'
import { useBookingSubmit } from '../../composables/useBookingSubmit.js'
import BookingForm from '../components/BookingForm.vue'

const activeFilter = ref('all')
const openedPopup = ref(null)
const bookingForm = ref({
  isOpen: false,
  itemId: '',
  itemTitle: '',
  itemType: 'yagya'
})

// Используем composable для работы с данными ягьи
const { yagya, categories, loading, error, fetchYagya, getYagyaByCategory, getCategories, formatYagyaDate, formatYagyaTime } = useYagya()

// Используем composable для работы с информацией о ягья
const { yagyaInfo, loading: infoLoading, error: infoError, fetchYagyaInfo } = useYagyaInfo()

// Используем composable для отправки заявок
const { submitBooking, loading: submitLoading, error: submitError } = useBookingSubmit()

// Загружаем данные один раз при монтировании
fetchYagya()
fetchYagyaInfo()

// Отладка данных ягьи
watch(yagya, (newYagya) => {
  console.log('Данные ягьи загружены:', newYagya)
}, { immediate: true })

// Отладка информации о ягья
watch(yagyaInfo, (newInfo) => {
  console.log('Информация о ягья загружена:', newInfo)
}, { immediate: true })



// Вычисляем отфильтрованные данные
const filteredYagya = computed(() => {
  return getYagyaByCategory(activeFilter.value)
})

// Вычисляем отфильтрованные категории для отображения
const filteredCategories = computed(() => {
  if (activeFilter.value === 'all') {
    return activeCategories.value
  }
  return activeCategories.value.filter(cat => cat.slug === activeFilter.value)
})

// Обработчики формы бронирования
const openBookingForm = (yagyaId, yagyaTitle) => {
  console.log('Открываем форму бронирования:', { yagyaId, yagyaTitle })
  bookingForm.value = {
    isOpen: true,
    itemId: yagyaId,
    itemTitle: yagyaTitle,
    itemType: 'yagya'
  }
  console.log('Состояние формы после открытия:', bookingForm.value)
}

const closeBookingForm = () => {
  bookingForm.value.isOpen = false
}

const handleBookingSubmit = async (bookingData) => {
  try {
    console.log('Получены данные из формы:', bookingData)
    // Отправляем заявку через composable
    await submitBooking(bookingData)
    
    // Показываем уведомление об успехе
    alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Ошибка при отправке заявки:', error)
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.')
  }
}

  // Группируем ягьи по категориям динамически
  const yagyaByCategory = computed(() => {
    const grouped = {}
    
    if (!yagya.value || yagya.value.length === 0) {
      return grouped
    }
    
    yagya.value.forEach(item => {
      if (item.categories && Array.isArray(item.categories)) {
        item.categories.forEach(category => {
          if (!grouped[category.slug]) {
            grouped[category.slug] = []
          }
          grouped[category.slug].push(item)
        })
      }
    })
    
    return grouped
  })

  // Получаем активные категории
  const activeCategories = computed(() => {
    return getCategories()
  })

// Удаляем статический массив infoButtons, теперь используем динамические данные из yagyaInfo
</script>

<template>
  <div class="bg-[#FFFCF5] min-h-screen">
    <!-- Баннер -->
    <section class="relative w-full min-h-[500px] flex items-end justify-center overflow-hidden mb-12">
      <img
        src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//yagya%20banner.png"
        alt="Ягья баннер"
        class="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable="false"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
      <div class="relative z-20 pb-12 flex flex-col items-center w-full">
        <h1 class="text-white text-3xl md:text-[56px] md:leading-[68px] font-montserrat font-bold text-center max-w-3xl">
          Ягья — древний ритуал<br />для современной жизни
        </h1>
      </div>
    </section>

    <!-- Что важно знать перед ягья -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="max-w-[1290px] mx-auto">
        <h2 class="text-[36px] font-alice font-bold text-orange-400 uppercase mb-8 text-center md:text-left">
          Что важно знать перед ягья
        </h2>
        <!-- Loading State для информации -->
        <div v-if="infoLoading" class="text-center py-8">
          <div class="text-orange-400 text-xl font-montserrat">Загрузка информации...</div>
        </div>

        <!-- Error State для информации -->
        <div v-else-if="infoError" class="text-center py-8">
          <div class="text-red-500 text-xl font-montserrat">Ошибка загрузки информации</div>
          <div class="text-red-400 text-sm mt-2">{{ infoError }}</div>
        </div>

        <!-- Информационные кнопки -->
        <div v-else-if="yagyaInfo.length > 0" class="flex flex-wrap gap-4 justify-center md:justify-start">
          <button 
            v-for="(info, idx) in yagyaInfo"
            :key="info.id"
            @click="openedPopup = idx"
            class="inline-flex items-center gap-2 px-[30px] py-[15px] bg-white border-2 border-orange-400 text-orange-400 font-montserrat font-semibold text-[22px] rounded-full hover:bg-orange-400 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg group"
          >
            {{ info.title }}
            <svg
              class="w-7 h-7 transition-colors duration-200 group-hover:fill-white"
              fill="#f59e42"
              viewBox="0 0 28 29"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M27.4989 4.07572C27.5407 2.69564 26.4558 1.54297 25.0757 1.50115L2.58605 0.819642C1.20597 0.777822 0.0532921 1.86269 0.0114715 3.24277C-0.030349 4.62285 1.05452 5.77553 2.4346 5.81735L22.4254 6.42313L21.8196 26.414C21.7778 27.794 22.8627 28.9467 24.2428 28.9885C25.6228 29.0303 26.7755 27.9455 26.8173 26.5654L27.4989 4.07572ZM8 20L9.71341 21.8205L26.7134 5.8205L25 4L23.2866 2.1795L6.28659 18.1795L8 20Z"/>
            </svg>
          </button>
        </div>

        <!-- No Data State для информации -->
        <div v-else class="text-center py-8">
          <div class="text-orange-400 text-xl font-montserrat">Нет доступной информации</div>
        </div>

        <!-- Попап с информацией -->
        <tourInfoPopup
          v-if="openedPopup !== null && yagyaInfo[openedPopup]"
          :title="yagyaInfo[openedPopup].title"
          :text="yagyaInfo[openedPopup].text"
          :image="yagyaInfo[openedPopup].image_url"
          @close="openedPopup = null"
        />
      </div>
    </section>

    <!-- Фокус ягьи -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="max-w-[1290px] mx-auto">
        <h2 class="text-[36px] font-alice font-bold text-orange-400 uppercase mb-8 text-center md:text-left">
          Фокус ягьи
        </h2>

                            <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-12">
                      <button 
                        @click="activeFilter = 'all'"
                        :class="[
                          'px-[30px] py-[15px] font-montserrat font-semibold text-[22px] rounded-full transition-all duration-200 shadow-md hover:shadow-lg',
                          activeFilter === 'all' 
                            ? 'bg-orange-400 text-white border-2 border-orange-400' 
                            : 'bg-white text-orange-400 border-2 border-orange-400 hover:bg-orange-400 hover:text-white'
                        ]"
                      >
                        Все ягьи
                      </button>
                      <button 
                        v-for="category in activeCategories"
                        :key="category.id"
                        @click="activeFilter = category.slug"
                        :class="[
                          'px-[30px] py-[15px] font-montserrat font-semibold text-[22px] rounded-full transition-all duration-200 shadow-md hover:shadow-lg',
                          activeFilter === category.slug 
                            ? 'bg-orange-400 text-white border-2 border-orange-400' 
                            : 'bg-white text-orange-400 border-2 border-orange-400 hover:bg-orange-400 hover:text-white'
                        ]"
                      >
                        {{ category.name }}
                      </button>
                    </div>

        <!-- Карточки ягья -->
        <div class="max-w-[1290px] mx-auto">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <div class="text-orange-400 text-xl font-montserrat">Загрузка ягьи...</div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <div class="text-red-500 text-xl font-montserrat">Ошибка загрузки данных</div>
            <div class="text-red-400 text-sm mt-2">{{ error }}</div>
          </div>

          <!-- No Data State -->
          <div v-else-if="!loading && !error && yagya.length === 0" class="text-center py-12">
            <div class="text-orange-400 text-xl font-montserrat">Нет доступных ягьи</div>
            <div class="text-gray-500 text-sm mt-2">Попробуйте обновить страницу</div>
          </div>

          <!-- Data Display -->
          <div v-if="!loading && !error && yagya.length > 0">
            
            <!-- Dynamic Category Sections -->
            <div 
              v-for="category in filteredCategories" 
              :key="category.id"
              class="mb-12"
            >
              <div class="mb-8">
                <h3 class="text-[24px] font-alice font-bold text-orange-400 uppercase mb-4 text-center md:text-left">
                  {{ category.name.toUpperCase() }} <span class="text-sm text-gray-500">({{ yagyaByCategory[category.slug]?.length || 0 }})</span>
                </h3>
                <div class="relative">
                  <div class="w-full h-[2px] bg-orange-400"></div>
                  <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              
              <!-- Category Yagya Cards -->
              <div v-if="yagyaByCategory[category.slug] && yagyaByCategory[category.slug].length > 0" class="flex flex-wrap gap-[50px] justify-center md:justify-start">
                <div 
                  v-for="item in yagyaByCategory[category.slug]" 
                  :key="item.id"
                  class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 group w-full min-h-[600px] max-w-[calc(100vw-32px)] p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end" 
                  style="box-shadow: 8px 8px 0 0 #ff9900;"
                >
                  <img 
                    :src="item.image_url || 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg'" 
                    :alt="item.title"
                    class="absolute inset-0 w-full h-full object-cover object-center z-0"
                    draggable="false"
                  />
                  <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                  <div class="relative z-20 flex flex-col gap-2">
                    <h4 class="text-white font-montserrat font-bold text-[40px] leading-tight">
                      {{ item.title }}
                    </h4>
                    <p class="text-white font-montserrat font-light text-[24px] opacity-90 leading-[1.1]">
                      {{ item.description }}
                    </p>
                    <div class="flex flex-row gap-2 mt-2">
                      <span class="inline-block self-start px-[15px] py-[10px] rounded-full border border-white text-white text-[17px] font-montserrat font-light bg-white/50 backdrop-blur-md">
                        {{ formatYagyaDate(item.date_from, item.date_to) }}
                      </span>
                      <span class="inline-block self-start px-[15px] py-[10px] rounded-full border border-white text-white text-[17px] font-montserrat font-light bg-white/50 backdrop-blur-md">
                        {{ formatYagyaTime(item.time) }} Мск
                      </span>
                    </div>
                                          <button 
                        @click="() => { console.log('Клик по кнопке, item:', item); openBookingForm(item.id, item.title) }"
                        class="w-full mt-4 px-[30px] py-[15px] bg-white/30 border border-white rounded-full text-white text-[14.5px] md:text-[29px] font-montserrat font-bold transition-colors duration-200 hover:bg-white/50 tracking-wide"
                      >
                        ЗАБРОНИРОВАТЬ МЕСТО
                      </button>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
    
    <!-- Форма бронирования -->
    <BookingForm
      :item-id="bookingForm.itemId"
      :item-title="bookingForm.itemTitle"
      :item-type="bookingForm.itemType"
      :is-open="bookingForm.isOpen"
      :is-loading="submitLoading"
      @close="closeBookingForm"
      @submit="handleBookingSubmit"
    />
  </div>
</template> 