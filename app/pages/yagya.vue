<script setup>
import { ref, computed, watch } from 'vue'
import { useYagya } from '../../composables/useYagya'
import { useYagyaInfo } from '../../composables/useYagyaInfo.js'
import { useBookingSubmit } from '../../composables/useBookingSubmit.js'
import { useAdminCheck } from '../../composables/useAdminCheck'
import BookingForm from '../components/BookingForm.vue'
import AddYagyaInfoPopup from '../components/AddYagyaInfoPopup.vue'
import AddCategoryPopup from '../components/AddCategoryPopup.vue'
import AddYagyaPopup from '../components/AddYagyaPopup.vue'
import GoogleDriveImage from '../components/GoogleDriveImage.vue'

const activeFilter = ref('all')
const openedPopup = ref(null)
const bookingForm = ref({
  isOpen: false,
  itemId: '',
  itemTitle: '',
  itemType: 'yagya'
})

// Состояние для попапа добавления информации о ягья
const isAddYagyaInfoPopupOpen = ref(false)

// Состояние для попапа добавления категорий
const isAddCategoryPopupOpen = ref(false)
const editingCategory = ref(null)

// Состояние для попапа добавления ягья
const isAddYagyaPopupOpen = ref(false)
const editingYagya = ref(null)

// Проверяем, является ли пользователь администратором
const { isAdmin, initAdminCheck } = useAdminCheck()

// Используем composable для работы с данными ягьи
const { yagya, categories, loading, error, fetchYagya, getYagyaByCategory, getCategories, formatYagyaDate, formatYagyaTime } = useYagya()

// Используем composable для работы с информацией о ягья
const { yagyaInfo, loading: infoLoading, error: infoError, fetchYagyaInfo } = useYagyaInfo()

// Используем composable для отправки заявок
const { submitBooking, loading: submitLoading, error: submitError } = useBookingSubmit()

// Загружаем данные один раз при монтировании
fetchYagya()
fetchYagyaInfo()

// Инициализируем проверку администратора
onMounted(async () => {
  await initAdminCheck()
})





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
  bookingForm.value = {
    isOpen: true,
    itemId: yagyaId,
    itemTitle: yagyaTitle,
    itemType: 'yagya'
  }
}

const closeBookingForm = () => {
  bookingForm.value.isOpen = false
}

const handleBookingSubmit = async (bookingData) => {
  try {
    // Отправляем заявку через composable
    await submitBooking(bookingData)
    
    // Показываем уведомление об успехе
    alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.')
  } catch (error) {
    console.error('Ошибка при отправке заявки:', error)
    alert('Произошла ошибка при отправке заявки. Попробуйте еще раз.')
  }
}

// Функции для работы с попапом добавления информации о ягья
const openAddYagyaInfoPopup = () => {
  isAddYagyaInfoPopupOpen.value = true
}

const closeAddYagyaInfoPopup = () => {
  isAddYagyaInfoPopupOpen.value = false
}

const handleYagyaInfoAdded = async (newInfo) => {
  // Принудительно обновляем список информации о ягья
  await fetchYagyaInfo()
  await nextTick()
}

// Состояние для редактирования
const editingYagyaInfo = ref(null)
const isEditYagyaInfoPopupOpen = ref(false)

// Функции для работы с категориями
const openAddCategoryPopup = () => {
  isAddCategoryPopupOpen.value = true
}

const closeAddCategoryPopup = () => {
  isAddCategoryPopupOpen.value = false
  editingCategory.value = null
}

const openEditCategoryPopup = (category) => {
  editingCategory.value = category
  isAddCategoryPopupOpen.value = true
}

const handleCategoryAdded = async (newCategory) => {
  console.log('Категория добавлена:', newCategory)
  // Принудительно обновляем список категорий
  await fetchYagya({}, true) // force = true для принудительного обновления из БД
  await getCategories()
  await nextTick()
}

const confirmDeleteCategory = (category) => {
  if (confirm(`Вы уверены, что хотите удалить категорию "${category.name}"? Это действие нельзя отменить.`)) {
    deleteCategory(category.id)
  }
}

const deleteCategory = async (categoryId) => {
  try {
    const supabase = useSupabaseClient()
    
    // Проверяем, что категория существует
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (checkError) {
      console.error('Ошибка проверки категории:', checkError)
      alert('Ошибка проверки категории: ' + checkError.message)
      return
    }

    // Удаляем только саму категорию
    const { data, error: deleteCategoryError, count } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .select()

    if (deleteCategoryError) {
      console.error('Ошибка удаления категории:', deleteCategoryError)
      alert('Ошибка удаления категории: ' + deleteCategoryError.message)
    } else if (!data || data.length === 0) {
      console.error('Категория не была удалена - нет данных в ответе')
      alert('Ошибка удаления категории: запись не найдена или не удалена')
    } else {
      console.log('Категория удалена с ID:', categoryId)
      // Принудительно обновляем список категорий
      await fetchYagya({}, true) // force = true для принудительного обновления из БД
      await getCategories()
      await nextTick()
    }
  } catch (err) {
    console.error('Delete category error:', err)
    alert('Ошибка удаления категории: ' + err.message)
  }
}

// Функции для работы с ягья
const openAddYagyaPopup = () => {
  isAddYagyaPopupOpen.value = true
}

const closeAddYagyaPopup = () => {
  isAddYagyaPopupOpen.value = false
  editingYagya.value = null
}

const openEditYagyaPopup = (yagya) => {
  editingYagya.value = yagya
  isAddYagyaPopupOpen.value = true
}

const handleYagyaAdded = async (newYagya) => {
  console.log('Ягья добавлена:', newYagya)
  // Принудительно обновляем список ягья
  await fetchYagya({}, true) // force = true для принудительного обновления из БД
  
  // Также обновляем категории
  await getCategories()
  
  // Небольшая задержка для обновления UI
  await nextTick()
}

const confirmDeleteYagya = (yagya) => {
  if (confirm(`Вы уверены, что хотите удалить "${yagya.title}"? Это действие нельзя отменить.`)) {
    deleteYagya(yagya.id)
  }
}

const deleteYagya = async (yagyaId) => {
  try {
    const supabase = useSupabaseClient()
    
    // Сначала удаляем связи с категориями
    const { error: linksError } = await supabase
      .from('yagya_categories')
      .delete()
      .eq('yagya_id', yagyaId)

    if (linksError) {
      alert('Ошибка удаления связей с категориями: ' + linksError.message)
      return
    }

    // Затем удаляем саму ягья
    const { error } = await supabase
      .from('yagya')
      .delete()
      .eq('id', yagyaId)

    if (error) {
      alert('Ошибка удаления ягья: ' + error.message)
    } else {
      console.log('Ягья удалена с ID:', yagyaId)
      // Принудительно обновляем список ягья
      await fetchYagya({}, true) // force = true для принудительного обновления из БД
      await getCategories()
      await nextTick()
    }
  } catch (err) {
    alert('Ошибка удаления ягья')
  }
}

// Функции для редактирования и удаления
const openEditYagyaInfoPopup = (info) => {
  editingYagyaInfo.value = info
  isEditYagyaInfoPopupOpen.value = true
}

const closeEditYagyaInfoPopup = () => {
  isEditYagyaInfoPopupOpen.value = false
  editingYagyaInfo.value = null
}

const handleYagyaInfoEdited = async (editedInfo) => {
  // Принудительно обновляем список информации о ягья
  await fetchYagyaInfo()
  await nextTick()
}

const confirmDeleteYagyaInfo = (info) => {
  if (confirm(`Вы уверены, что хотите удалить "${info.title}"? Это действие нельзя отменить.`)) {
    deleteYagyaInfo(info.id)
  }
}

const deleteYagyaInfo = async (infoId) => {
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase
      .from('yagya_info')
      .delete()
      .eq('id', infoId)

    if (error) {
      alert('Ошибка удаления информации: ' + error.message)
    } else {
      // Принудительно обновляем список информации о ягья
      await fetchYagyaInfo()
      await nextTick()
    }
  } catch (err) {
    alert('Ошибка удаления информации')
  }
}

  // Группируем ягьи по категориям динамически
  const yagyaByCategory = computed(() => {
    const grouped = {}
    
    if (!yagya.value || yagya.value.length === 0) {
      return grouped
    }
    
    yagya.value.forEach(item => {
      if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
        // Ягьи с категориями
        item.categories.forEach(category => {
          if (!grouped[category.slug]) {
            grouped[category.slug] = []
          }
          grouped[category.slug].push(item)
        })
      } else {
        // Ягьи без категорий
        if (!grouped['no-category']) {
          grouped['no-category'] = []
        }
        grouped['no-category'].push(item)
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
      <GoogleDriveImage
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
        <h2 class="text-[24px] md:text-[36px] font-alice font-bold text-orange-400 uppercase mb-8 text-center md:text-left">
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
            class="inline-flex items-center gap-2 px-[30px] py-[15px] bg-white border-2 border-orange-400 text-orange-400 font-montserrat font-semibold text-[22px] rounded-full hover:bg-orange-400 hover:text-white transition-all duration-200 shadow-md hover:shadow-lg group relative"
          >
            <!-- Админ кнопки внутри основной кнопки -->
            <div v-if="isAdmin" class="flex gap-1 mr-2">
              <button
                @click.stop="openEditYagyaInfoPopup(info)"
                class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              </button>
              <button
                @click.stop="confirmDeleteYagyaInfo(info)"
                class="bg-red-500 hover:bg-red-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
            
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
          
          <!-- Кнопка добавления для администраторов -->
          <button 
            v-if="isAdmin"
            @click="openAddYagyaInfoPopup"
            class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
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
        <h2 class="text-[24px] md:text-[36px] font-alice font-bold text-orange-400 uppercase mb-8 text-center md:text-left">
          Фокус ягьи
        </h2>

                            <ClientOnly>
                              <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-12">
                                <button 
                                  @click="activeFilter = 'all'"
                                  :class="[
                                    'px-[15px] md:px-[30px] py-[8px] md:py-[15px] font-montserrat font-semibold text-[14px] md:text-[22px] rounded-full transition-all duration-200 shadow-md hover:shadow-lg',
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
                                    'inline-flex items-center gap-2 px-[15px] md:px-[30px] py-[8px] md:py-[15px] font-montserrat font-semibold text-[14px] md:text-[22px] rounded-full transition-all duration-200 shadow-md hover:shadow-lg',
                                    activeFilter === category.slug 
                                      ? 'bg-orange-400 text-white border-2 border-orange-400' 
                                      : 'bg-white text-orange-400 border-2 border-orange-400 hover:bg-orange-400 hover:text-white'
                                  ]"
                                >
                                  <!-- Админ кнопки в одном ряду с текстом -->
                                  <div v-if="isAdmin" class="flex gap-1">
                                    <button
                                      @click.stop="openEditCategoryPopup(category)"
                                      class="bg-blue-500 hover:bg-blue-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                                    >
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                      </svg>
                                    </button>
                                    <button
                                      @click.stop="confirmDeleteCategory(category)"
                                      class="bg-red-500 hover:bg-red-600 text-white w-[36px] h-[36px] rounded-full transition-colors duration-200 flex items-center justify-center shadow-lg"
                                    >
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  
                                  {{ category.name }} <span class="text-gray-400 text-[14px] md:text-[16px]">({{ yagyaByCategory[category.slug]?.length || 0 }})</span>
                                </button>
                                
                                <!-- Кнопки добавления для администраторов -->
                                <div v-if="isAdmin" class="flex gap-2">
                                  <!-- Кнопка добавления категории -->
                                  <button 
                                    @click="openAddCategoryPopup"
                                    class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg"
                                  >
                                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                  </button>
                                  
                                  <!-- Кнопка добавления ягья -->
                                  <button 
                                    @click="openAddYagyaPopup"
                                    class="inline-flex items-center justify-center px-[30px] py-[15px] bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-md hover:shadow-lg font-montserrat font-semibold text-[22px]"
                                  >
                                    Добавить ягья
                                  </button>
                                </div>
                              </div>
                            </ClientOnly>

        <!-- Карточки ягья -->
        <ClientOnly>
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
                  class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 group w-full min-h-[600px] max-w-[calc(100vw-32px)] p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end block" 
                  style="box-shadow: 8px 8px 0 0 #ff9900;"
                >
                  <!-- Админ кнопки -->
                  <div v-if="isAdmin" class="absolute top-4 left-4 z-30 flex gap-2 pointer-events-auto">
                    <button
                      @click="openEditYagyaPopup(item)"
                      class="bg-blue-500 hover:bg-blue-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Изменить
                    </button>
                    <button
                      @click="confirmDeleteYagya(item)"
                      class="bg-red-500 hover:bg-red-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Удалить
                    </button>
                  </div>

                  <GoogleDriveImage 
                    :src="item.image_url || 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg'" 
                    :alt="item.title"
                    class="absolute inset-0 w-full h-full object-cover object-center z-0"
                    draggable="false"
                  />
                  <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/95 to-transparent z-10"></div>
                  <div class="relative z-20 flex flex-col gap-1 h-full justify-end">
                    <div class="relative z-20 flex flex-col gap-1">
                      <h4 class="text-white font-montserrat font-bold text-[34px] leading-[0.8]">
                        {{ item.title }}
                      </h4>
                      <p class="text-white font-montserrat font-light text-[20px] opacity-90 leading-[1.1]">
                        {{ item.description }}
                      </p>
                      <div class="flex flex-row gap-4 mt-2">
                        <span class="text-white text-[16px] font-montserrat font-bold underline">
                          {{ formatYagyaDate(item.date_from, item.date_to) }}
                        </span>
                        <span class="text-white text-[16px] font-montserrat font-bold underline">
                          {{ formatYagyaTime(item.time) }} Мск
                        </span>
                      </div>
                      <button 
                        @click="() => openBookingForm(item.id, item.title)"
                        class="w-full mt-4 px-[30px] py-[15px] bg-white/30 border border-white rounded-full text-white text-[14.5px] md:text-[29px] font-montserrat font-bold transition-colors duration-200 hover:bg-white/50 tracking-wide"
                      >
                        ЗАБРОНИРОВАТЬ МЕСТО
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Ягьи без категорий -->
            <div v-if="yagyaByCategory['no-category'] && yagyaByCategory['no-category'].length > 0" class="mb-12">
              <div class="mb-8">
                <h3 class="text-[24px] font-alice font-bold text-orange-400 uppercase mb-4 text-center md:text-left">
                  ДРУГИЕ ЯГЬИ <span class="text-sm text-gray-500">({{ yagyaByCategory['no-category']?.length || 0 }})</span>
                </h3>
                <div class="relative">
                  <div class="w-full h-[2px] bg-orange-400"></div>
                  <div class="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              
              <!-- Yagya Cards без категорий -->
              <div class="flex flex-wrap gap-[50px] justify-center md:justify-start">
                <div 
                  v-for="item in yagyaByCategory['no-category']" 
                  :key="item.id"
                  class="relative rounded-[32px] overflow-hidden bg-white transition-all duration-300 group w-full min-h-[600px] max-w-[calc(100vw-32px)] p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end block" 
                  style="box-shadow: 8px 8px 0 0 #ff9900;"
                >
                  <!-- Админ кнопки -->
                  <div v-if="isAdmin" class="absolute top-4 left-4 z-30 flex gap-2 pointer-events-auto">
                    <button
                      @click="openEditYagyaPopup(item)"
                      class="bg-blue-500 hover:bg-blue-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Изменить
                    </button>
                    <button
                      @click="confirmDeleteYagya(item)"
                      class="bg-red-500 hover:bg-red-600 text-white font-montserrat font-bold text-[12px] px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1 shadow-lg"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Удалить
                    </button>
                  </div>

                  <GoogleDriveImage 
                    :src="item.image_url || 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg'" 
                    :alt="item.title"
                    class="absolute inset-0 w-full h-full object-cover object-center z-0"
                    draggable="false"
                  />
                  <div class="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/95 to-transparent z-10"></div>
                  <div class="relative z-20 flex flex-col gap-1 h-full justify-end">
                    <div class="relative z-20 flex flex-col gap-1">
                      <h4 class="text-white font-montserrat font-bold text-[34px] leading-[0.8]">
                        {{ item.title }}
                      </h4>
                      <p class="text-white font-montserrat font-light text-[20px] opacity-90 leading-[1.1]">
                        {{ item.description }}
                      </p>
                      <div class="flex flex-row gap-4 mt-2">
                        <span class="text-white text-[16px] font-montserrat font-bold underline">
                          {{ formatYagyaDate(item.date_from, item.date_to) }}
                        </span>
                        <span class="text-white text-[16px] font-montserrat font-bold underline">
                          {{ formatYagyaTime(item.time) }} Мск
                        </span>
                      </div>
                      <button 
                        @click="() => openBookingForm(item.id, item.title)"
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
        </ClientOnly>
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

    <!-- Попап добавления/редактирования информации о ягья -->
    <AddYagyaInfoPopup
      :is-open="isAddYagyaInfoPopupOpen || isEditYagyaInfoPopupOpen"
      :editing-info="editingYagyaInfo"
      @close="closeAddYagyaInfoPopup(); closeEditYagyaInfoPopup()"
      @success="handleYagyaInfoAdded; handleYagyaInfoEdited"
    />

    <!-- Попап добавления/редактирования категорий -->
    <AddCategoryPopup
      :is-open="isAddCategoryPopupOpen"
      :editing-category="editingCategory"
      @close="closeAddCategoryPopup"
      @success="handleCategoryAdded"
    />

    <!-- Попап добавления/редактирования ягья -->
    <AddYagyaPopup
      :is-open="isAddYagyaPopupOpen"
      :editing-yagya="editingYagya"
      @close="closeAddYagyaPopup"
      @success="handleYagyaAdded"
    />
  </div>
</template> 