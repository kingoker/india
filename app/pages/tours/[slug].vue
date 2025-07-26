<template>
  <div class="bg-backgroundMain min-h-screen">
    <!-- Баннер -->
    <section class="relative w-full min-h-[500px] flex items-end justify-center overflow-hidden mb-12">
      <img
        :src="tour?.image_url || defaultImage"
        :alt="tour?.title"
        class="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable="false"
      />
      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
      <div class="relative z-20 pb-12 flex flex-col items-center w-full">
        <h1 class="text-white text-3xl md:text-[56px] md:leading-[68px] font-montserrat font-bold text-center max-w-3xl px-4">
          {{ tour?.title || 'Загрузка...' }}
        </h1>
        <button
          @click.stop="openBookingForm"
          :disabled="loading || !tour?.id"
          class="bg-white/30 border border-white rounded-full text-white text-[22px] font-montserrat font-normal px-[30px] py-[15px] transition-colors duration-200 hover:bg-white/50 tracking-wide mx-auto mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Загрузка...' : 'ЗАБРОНИРОВАТЬ МЕСТО' }}
        </button>
      </div>
    </section>

    <!-- Фильтры/Теги -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="flex items-center gap-3 justify-center flex-wrap">
        <button
          v-for="(btn, idx) in infoButtons"
          :key="btn.label"
          @click="openedPopup = idx"
          :class="[
            'flex items-center rounded-full px-[30px] py-[15px] font-montserrat font-semibold text-[22px] border border-orange-400 transition-colors duration-200 group',
            idx === openedPopup ? 'bg-orange-400 text-white' : 'bg-white text-orange-400',
            'hover:bg-orange-400 hover:text-white'
          ]"
          style="outline: none;"
        >
          {{ btn.label }}
          <svg
            class="ml-[10px] w-7 h-7 transition-colors duration-200 group-hover:fill-white"
            :fill="idx === openedPopup ? '#fff' : '#f59e42'"
            viewBox="0 0 28 29"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M27.4989 4.07572C27.5407 2.69564 26.4558 1.54297 25.0757 1.50115L2.58605 0.819642C1.20597 0.777822 0.0532921 1.86269 0.0114715 3.24277C-0.030349 4.62285 1.05452 5.77553 2.4346 5.81735L22.4254 6.42313L21.8196 26.414C21.7778 27.794 22.8627 28.9467 24.2428 28.9885C25.6228 29.0303 26.7755 27.9455 26.8173 26.5654L27.4989 4.07572ZM8 20L9.71341 21.8205L26.7134 5.8205L25 4L23.2866 2.1795L6.28659 18.1795L8 20Z"/>
          </svg>
        </button>
        <tourInfoPopup
          v-if="openedPopup !== null"
          :title="infoButtons[openedPopup].popup.title"
          :text="infoButtons[openedPopup].popup.text"
          :image="infoButtons[openedPopup].popup.image"
          @close="openedPopup = null"
        />
      </div>
    </section>

    <!-- Основной контент -->
    <section class="px-4 md:px-[100px] mb-16">
      <div class="grid grid-cols-1 gap-12 max-w-[1290px] mx-auto">
        <!-- Блок 'О ТУРЕ' -->
        <div class="flex flex-col lg:flex-row items-stretch gap-[30px]">
          <div class="flex-1 flex flex-col">
            <h2 class="font-alice font-normal text-[36px] text-orange-400 mb-6 uppercase flex items-center gap-3">
              🪐 О ТУРЕ
            </h2>
            <p class="text-gray-700 font-montserrat font-normal text-[30px] leading-[1.2] mb-8">
              {{ tour?.description || 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.' }}
            </p>
          </div>
          <img
            src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop"
            alt="О туре"
            class="w-full min-h-[333px] h-full object-cover rounded-[60px] max-w-full lg:max-w-[555px]"
            style="box-shadow: 8px 8px 0 0 #FF9500;"
          />
        </div>

        <!-- Блок 'ПОЧЕМУ ЭТО ОСОБЕННЫЙ ТУР?' -->
        <div class="flex flex-col lg:flex-row items-stretch gap-[30px] mb-[100px]">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
            alt="Особенности"
            class="w-full min-h-[333px] h-full object-cover rounded-[60px] order-1 lg:order-none mb-6 lg:mb-0 max-w-full lg:max-w-[555px]"
            style="box-shadow: 8px 8px 0 0 #FF9500;"
          />
          <div class="flex-1 flex flex-col">
            <h2 class="font-alice font-normal text-[36px] text-orange-400 mb-6 uppercase flex items-center gap-3">
              ✨ ПОЧЕМУ ЭТО ОСОБЕННЫЙ ТУР?
            </h2>
            <ul class="space-y-4 font-montserrat font-normal text-[30px] leading-[1.2] text-gray-700">
              <li class="flex items-start gap-3">
                <span class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Посещение храмов планет и Накшатр для гармонизации жизни</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Выполнение пудж для здоровья, процветания и снятия кармических блоков</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Йога у океана и медитации в священных местах</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></span>
                <span>Посещение Ауровиля и Пондичерри</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Секция ПРОГРАММА ТУРА и ГАЛЕРЕЯ рядом -->
        <div class="flex flex-col lg:flex-row gap-[30px]">
          <!-- Программа тура (аккордеон) -->
          <div class="flex-1 min-w-0">
            <h2 class="font-alice font-normal text-[36px] text-orange-400 mb-6 uppercase">ПРОГРАММА ТУРА</h2>
            <div class="flex flex-col gap-[10px]">
              <div v-for="(item, idx) in program" :key="item.title">
                <button
                  @click="openIndex = openIndex === idx ? null : idx"
                  class="w-full flex items-center px-6 py-4 border-2 border-orange-400 rounded-[60px] font-montserrat font-medium text-[28px] text-left transition relative z-10 border-b-2 pl-[88px]"
                  :class="[
                    openIndex === idx ? 'bg-white' : 'bg-[#FFFCF5]',
                    openIndex === idx ? '' : '[box-shadow:0_4px_4px_0_rgba(0,0,0,0.25)]'
                  ]"
                  type="button"
                >
                  <span class="absolute left-[3px] top-[3px] pointer-events-none" :style="{height: 'calc(100% - 6px)'}">
                    <svg :height="'100%'" :width="'100%'" viewBox="0 0 34 34" fill="none">
                      <circle cx="17" cy="17" r="16" stroke="#FF9500" stroke-width="1"/>
                      <path v-if="openIndex === idx" d="M10 20L17 13L24 20" stroke="#FF9500" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                      <path v-else d="M10 14L17 21L24 14" stroke="#FF9500" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span class="font-montserrat font-medium text-[28px] text-black flex items-center">{{ item.title }}</span>
                </button>
                <Collapse :when="openIndex === idx">
                  <div
                    class="border-2 border-orange-400 rounded-b-[60px] bg-white px-8 pt-16 py-8 flex flex-row gap-8 items-center -mt-10 relative z-0 border-t-0"
                  >
                    <svg v-if="item.icon === 'plane'" class="w-28 h-28 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 64 64">
                      <path d="M8 56L56 8M8 8l48 48" stroke="#FF9500" stroke-width="3"/>
                    </svg>
                    <span class="font-montserrat text-[28px] text-black leading-[1.2]">
                      {{ item.content }}
                    </span>
                  </div>
                </Collapse>
              </div>
            </div>
          </div>
          <!-- Галерея -->
          <div class="flex-1 min-w-0">
            <div class="grid grid-cols-2 gap-0">
              <img v-for="(src, idx) in galleryImages" :key="idx" :src="src" :alt="`Фото ${idx+1}`"
                class="w-full aspect-square object-cover rounded-[60px] cursor-pointer"
                style="box-shadow: 8px 8px 0 0 #ff9900;"
                width="600" height="600"
                @click="openImage(idx)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Кнопка бронирования внизу -->
    <section class="px-4 md:px-[100px] pb-[50px] text-center relative">
      <div class="inline-block relative">
        <button
          @click.stop="openBookingForm"
          :disabled="loading || !tour?.id"
          class="relative z-10 border-4 border-orange-400 rounded-full font-montserrat font-bold text-[27px] text-orange-400 uppercase tracking-wide shadow-none outline-none select-none transition-all duration-200 px-[30px] py-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
          @mouseover="hoveredBtn = true"
          @mouseleave="hoveredBtn = false"
          :style="hoveredBtn ? 'box-shadow: none; background: #fff;' : 'box-shadow: 8px 8px 0 0 #ff9900; background: #FFFCF5;'"
        >
          {{ loading ? 'Загрузка...' : 'ЗАБРОНИРОВАТЬ МЕСТО' }}
        </button>
      </div>
    </section>
    <div v-if="fullscreenImage !== null" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 cursor-zoom-out" @click="closeImage">
      <img v-if="fullscreenImage !== null" :src="galleryImages[fullscreenImage]" class="max-w-full max-h-full rounded-[60px] shadow-2xl" width="900" height="900" :alt="`Фото ${fullscreenImage+1}`" />
      <button class="absolute top-6 right-6 text-white text-4xl font-bold bg-black/50 rounded-full w-14 h-14 flex items-center justify-center" @click.stop="closeImage">&times;</button>
    </div>
    
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

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import tourInfoPopup from '~/components/tourInfoPopup.vue'
import { Collapse } from 'vue-collapsed'
import { useBookingSubmit } from '../../../composables/useBookingSubmit.js'
import BookingForm from '../../components/BookingForm.vue'

const route = useRoute()
const tour = ref(null)
const loading = ref(true)
const error = ref(null)
const defaultImage = 'https://cdn.tripzaza.com/ru/destinations/wp-content/uploads/2017/04/India-1-Taj-Mahal-e1492124232509.jpg'

// Используем composable для отправки заявок
const { submitBooking, loading: submitLoading, error: submitError } = useBookingSubmit()

// Состояние формы бронирования
const bookingForm = ref({
  isOpen: false,
  itemId: '',
  itemTitle: '',
  itemType: 'tour'
})

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

onMounted(async () => {
  try {
    // Загружаем тур напрямую из Supabase по slug
    const supabase = useSupabaseClient()
    const { data, error: fetchError } = await supabase
      .from('tours')
      .select('*')
      .eq('slug', route.params.slug)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    tour.value = data
    
    // Проверяем, что у тура есть валидный ID
    if (!tour.value || !tour.value.id) {
      // Если тур не найден в БД, создаем fallback объект
      tour.value = {
        id: '550e8400-e29b-41d4-a716-446655440001', // Валидный UUID
        title: 'Духовное паломничество по храмам Наваграха',
        description: 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.',
        slug: route.params.slug,
        image_url: defaultImage,
        date_from: '2024-03-01',
        date_to: '2024-03-10'
      }
    }
  } catch (err) {
    error.value = err
    console.error('Ошибка загрузки тура:', err)
    
    // Если тур не найден, создаем fallback
    if (err.code === 'PGRST116') { // No rows returned
      tour.value = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Духовное паломничество по храмам Наваграха',
        description: 'Духовное паломничество по храмам Наваграха — это особый тур для очищения, получения высшей поддержки и трансформации судьбы. Индия — это место, где исполняются желания и происходят чудесные изменения в жизни.',
        slug: route.params.slug,
        image_url: defaultImage,
        date_from: '2024-03-01',
        date_to: '2024-03-10'
      }
      error.value = null // Очищаем ошибку
    }
  } finally {
    loading.value = false
  }
})

const infoButtons = [
  {
    label: 'Тёплый океан и Солнце',
    popup: {
      title: 'Тёплый океан и Солнце',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм спящего Вишну',
    popup: {
      title: 'Храм спящего Вишну',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храмы Наваграха',
    popup: {
      title: 'Храмы Наваграха',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм Марса',
    popup: {
      title: 'Храм Марса',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм всех Накшатр',
    popup: {
      title: 'Храм всех Накшатр',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
  {
    label: 'Храм Ретро Планет',
    popup: {
      title: 'Храм Ретро Планет',
      text: 'Описание для этого пункта...',
      image: ''
    }
  },
]

const openedPopup = ref(null)

const program = [
  {
    title: 'Прилёт',
    icon: 'plane',
    content: 'Прилет в Ченнай, переезд в Махабалипурам. Размещение в отеле. Прогулка по уникальным памятникам и пуджа в храме спящего Вишну, который исполняет желания. Отдых на океане.'
  },
  { title: 'Пробуждение', icon: 'check', content: '' },
  { title: 'Танец', icon: 'check', content: '' },
  { title: 'Планеты', icon: 'check', content: '' },
  { title: 'Накшатры', icon: 'check', content: '' },
  { title: 'Изобилие', icon: 'check', content: '' },
  { title: 'Энергия', icon: 'check', content: '' },
  { title: 'Исцеление', icon: 'check', content: '' },
  { title: 'Защита', icon: 'check', content: '' },
  { title: 'Мать', icon: 'check', content: '' },
  { title: 'Возвращение', icon: 'check', content: '' },
]
const openIndex = ref(0)

const galleryImages = [
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop",
  "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=600&fit=crop"
]
const fullscreenImage = ref(null)
function openImage(idx) { fullscreenImage.value = idx }
function closeImage() { fullscreenImage.value = null }
const hoveredBtn = ref(false)

// Функции для работы с формой бронирования
const openBookingForm = () => {
  if (tour.value && tour.value.id) {
    bookingForm.value = {
      isOpen: true,
      itemId: tour.value.id,
      itemTitle: tour.value.title,
      itemType: 'tour'
    }
  } else {
    // Если тур не загружен, не открываем форму
    alert('Данные тура загружаются. Попробуйте еще раз через несколько секунд.')
  }
}

const closeBookingForm = () => {
  bookingForm.value.isOpen = false
}

const handleBookingSubmit = async (bookingData) => {
  try {
    await submitBooking(bookingData)
    
    // Показываем уведомление об успехе
    alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Ошибка при отправке заявки:', error)
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.')
  }
}
</script>

<style scoped>
/* Удаляю transition-стили для аккордеона, Collapse сам анимирует высоту */
button[aria-expanded] {
  position: relative;
  z-index: 10;
}
</style> 