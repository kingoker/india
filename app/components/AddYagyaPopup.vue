<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ props.editingYagya ? 'Редактировать ягья' : 'Добавить ягья' }}
        </h3>
        <div class="w-full h-[2px] bg-orange-400"></div>
      </div>
      
      <!-- Кнопка закрытия -->
      <button 
        @click="handleClose"
        class="absolute top-6 right-6 w-16 h-16 flex items-center justify-center rounded-full border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white transition-colors duration-200"
        :disabled="loading"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Название -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Название:
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            placeholder="Введите название ягья"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Описание -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Описание:
          </label>
          <textarea
            v-model="formData.description"
            required
            rows="4"
            placeholder="Введите описание ягья"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[10px] md:rounded-[40px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black resize-none"
          ></textarea>
        </div>

        <!-- Даты -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              *Дата начала:
            </label>
            <input
              v-model="formData.date_from"
              type="date"
              required
              class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 text-black"
            />
          </div>

          <div>
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              *Дата окончания:
            </label>
            <input
              v-model="formData.date_to"
              type="date"
              required
              class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 text-black"
            />
          </div>
        </div>

        <!-- Время -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Время:
          </label>
          <input
            v-model="formData.time"
            type="time"
            required
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 text-black"
          />
        </div>

        <!-- URL изображения -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *URL изображения:
          </label>
          <input
            v-model="formData.image_url"
            type="url"
            required
            placeholder="https://example.com/image.jpg"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Категории -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Категории:
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            <label 
              v-for="category in availableCategories" 
              :key="category.id"
              class="flex items-center space-x-3 p-3 border-2 border-orange-400 rounded-[20px] cursor-pointer hover:border-orange-500 transition-colors duration-200"
              :class="{ 'border-orange-500 bg-orange-50': selectedCategories.includes(category.id) }"
            >
              <input
                type="checkbox"
                :value="category.id"
                v-model="selectedCategories"
                class="w-5 h-5 text-orange-400 border-orange-400 rounded focus:ring-orange-400 focus:ring-2"
              />
              <div class="flex items-center space-x-2">
                <div 
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <span class="text-[18px] font-alice text-gray-700">{{ category.name }}</span>
              </div>
            </label>
          </div>
          <p v-if="selectedCategories.length === 0" class="text-red-500 text-[16px] font-montserrat mt-2 ml-[30px]">
            Выберите хотя бы одну категорию
          </p>
        </div>

        <!-- Сообщения об ошибках и успехе -->
        <div v-if="error" class="text-red-500 text-center font-montserrat text-[16px]">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-500 text-center font-montserrat text-[16px]">
          {{ success }}
        </div>

        <!-- Кнопка добавления -->
        <div class="pt-4">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="loading"
            class="w-full bg-orange-400 text-white font-alice font-bold text-[20px] md:text-[34px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? (props.editingYagya ? 'Сохранение...' : 'Добавление...') : (props.editingYagya ? 'Сохранить изменения' : 'Добавить ягья') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingYagya: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formData = ref({
  title: '',
  description: '',
  date_from: '',
  date_to: '',
  time: '',
  image_url: ''
})

const selectedCategories = ref([])
const availableCategories = ref([])
const loading = ref(false)
const error = ref('')
const success = ref('')

// Загружаем доступные категории
const fetchCategories = async () => {
  try {
    const supabase = useSupabaseClient()
    const { data, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    if (categoriesError) {
      console.error('Ошибка загрузки категорий:', categoriesError)
      return
    }
    
    availableCategories.value = data || []
  } catch (err) {
    console.error('Ошибка загрузки категорий:', err)
  }
}

// Функция для блокировки скролла
const disableScroll = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = '0px'
}

// Функция для разблокировки скролла
const enableScroll = () => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// Обработчик клавиши Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && !loading.value) {
    emit('close')
  }
}

// Сброс формы при открытии попапа
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    disableScroll()
    document.addEventListener('keydown', handleEscape)
    
    // Загружаем категории при открытии попапа
    fetchCategories()
    
    if (props.editingYagya) {
      // Заполняем форму данными для редактирования
      formData.value = {
        title: props.editingYagya.title,
        description: props.editingYagya.description,
        date_from: props.editingYagya.date_from,
        date_to: props.editingYagya.date_to,
        time: props.editingYagya.time,
        image_url: props.editingYagya.image_url
      }
      // Загружаем выбранные категории для редактирования
      selectedCategories.value = props.editingYagya && props.editingYagya.categories ? props.editingYagya.categories.map(cat => cat.id) : []
    } else {
      // Сбрасываем форму для добавления
      formData.value = {
        title: '',
        description: '',
        date_from: '',
        date_to: '',
        time: '',
        image_url: ''
      }
      selectedCategories.value = []
    }
    error.value = ''
    success.value = ''
  } else {
    enableScroll()
    document.removeEventListener('keydown', handleEscape)
  }
}, { immediate: true })

// Очистка при размонтировании
onUnmounted(() => {
  enableScroll()
  document.removeEventListener('keydown', handleEscape)
})

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.description || !formData.value.date_from || !formData.value.date_to || !formData.value.time || !formData.value.image_url) {
    error.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  if (selectedCategories.value.length === 0) {
    error.value = 'Пожалуйста, выберите хотя бы одну категорию'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const supabase = useSupabaseClient()
    let result

    // Обрабатываем URL изображения
    const processedImageUrl = processImageUrl(formData.value.image_url)

    if (props.editingYagya) {
      // Редактируем существующую ягья
      const { data, error: updateError } = await supabase
        .from('yagya')
        .update({
          title: formData.value.title,
          description: formData.value.description,
          date_from: formData.value.date_from,
          date_to: formData.value.date_to,
          time: formData.value.time,
          image_url: processedImageUrl
        })
        .eq('id', props.editingYagya.id)
        .select()

      if (updateError) {
        error.value = 'Ошибка обновления ягья: ' + updateError.message
        return
      }

      // Обновляем связи с категориями
      // Сначала удаляем все существующие связи
      await supabase
        .from('yagya_categories')
        .delete()
        .eq('yagya_id', props.editingYagya.id)

      // Затем добавляем новые связи
      const categoryLinks = selectedCategories.value.map(categoryId => ({
        yagya_id: props.editingYagya.id,
        category_id: categoryId
      }))

      const { error: linksError } = await supabase
        .from('yagya_categories')
        .insert(categoryLinks)

      if (linksError) {
        error.value = 'Ошибка обновления категорий: ' + linksError.message
        return
      }

      success.value = 'Ягья успешно обновлена!'
      result = data[0]
    } else {
      // Добавляем новую ягья
      const { data, error: insertError } = await supabase
        .from('yagya')
        .insert([{
          title: formData.value.title,
          description: formData.value.description,
          date_from: formData.value.date_from,
          date_to: formData.value.date_to,
          time: formData.value.time,
          image_url: processedImageUrl
        }])
        .select()

      if (insertError) {
        error.value = 'Ошибка добавления ягья: ' + insertError.message
        return
      }

      // Добавляем связи с категориями
      const newYagyaId = data[0].id
      const categoryLinks = selectedCategories.value.map(categoryId => ({
        yagya_id: newYagyaId,
        category_id: categoryId
      }))

      const { error: linksError } = await supabase
        .from('yagya_categories')
        .insert(categoryLinks)

      if (linksError) {
        error.value = 'Ошибка добавления категорий: ' + linksError.message
        return
      }

      success.value = 'Ягья успешно добавлена!'
      result = data[0]
    }

    if (result) {
      emit('success', result)
      emit('close')
    }
  } catch (err) {
    error.value = props.editingYagya ? 'Ошибка обновления ягья. Попробуйте еще раз.' : 'Ошибка добавления ягья. Попробуйте еще раз.'
    console.error(props.editingYagya ? 'Update yagya error:' : 'Add yagya error:', err)
  } finally {
    loading.value = false
  }
}
</script> 