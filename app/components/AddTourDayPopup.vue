<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ editingDay ? 'Редактировать день тура' : 'Добавить день тура' }}
        </h3>
        <div class="w-full h-[2px] bg-orange-400"></div>
      </div>
      
      <!-- Кнопка закрытия -->
      <button 
        @click="$emit('close')"
        class="absolute top-6 right-6 w-16 h-16 flex items-center justify-center rounded-full border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white transition-colors duration-200"
        :disabled="isLoading"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Название дня -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Название дня:
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Введите название дня"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Описание дня -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Описание дня:
          </label>
          <RichTextEditor
            v-model="form.description"
            placeholder="Введите описание дня"
          />
        </div>

        <!-- Номер дня -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Номер дня:
          </label>
          <input
            v-model.number="form.day_number"
            type="number"
            min="1"
            required
            placeholder="1"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Ссылка на изображение -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            Ссылка на изображение:
          </label>
          <input
            v-model="form.image_url"
            type="url"
            placeholder="https://example.com/image.jpg"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Кнопка сохранения -->
        <div class="pt-4">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isLoading"
            class="w-full bg-orange-400 text-white font-alice font-bold text-[20px] md:text-[34px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Сохранение...' : (editingDay ? 'Сохранить изменения' : 'Добавить день') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import RichTextEditor from './RichTextEditor.vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'
import { useTourDetails } from '../../composables/useTourDetails'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingDay: {
    type: Object,
    default: null
  },
  tourId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'added', 'edited'])

const isLoading = ref(false)
const form = ref({
  title: '',
  description: '',
  day_number: 1,
  image_url: ''
})

// Функция для блокировки скролла
const disableScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = '0px'
  }
}

// Функция для разблокировки скролла
const enableScroll = () => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

// Обработчик клавиши Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && !isLoading.value) {
    emit('close')
  }
}

// Следим за состоянием открытия формы
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    disableScroll()
    document.addEventListener('keydown', handleEscape)
    
    if (props.editingDay) {
      // Редактирование - заполняем форму данными
      form.value = {
        title: props.editingDay.title || '',
        description: props.editingDay.description || '',
        day_number: props.editingDay.day_number || 1,
        image_url: props.editingDay.image_url || ''
      }
    } else {
      // Добавление - очищаем форму
      form.value = {
        title: '',
        description: '',
        day_number: 1,
        image_url: ''
      }
    }
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

const handleSubmit = async () => {
  if (!form.value.title || !form.value.description || !form.value.day_number) {
    alert('Пожалуйста, заполните все обязательные поля')
    return
  }

  isLoading.value = true

  try {
    const { createTourDay, updateTourDay } = useTourDetails()

    // Обрабатываем URL изображения
    const processedImageUrl = form.value.image_url ? processImageUrl(form.value.image_url) : null

    if (props.editingDay) {
      // Редактирование
      await updateTourDay(props.editingDay.id, {
        title: form.value.title,
        description: form.value.description,
        day_number: form.value.day_number,
        image_url: processedImageUrl
      })
      emit('edited', props.editingDay.id)
    } else {
      // Добавление
      await createTourDay({
        tour_id: props.tourId,
        title: form.value.title,
        description: form.value.description,
        day_number: form.value.day_number,
        image_url: processedImageUrl
      })
      emit('added')
    }

    emit('close')
  } catch (error) {
    console.error('Ошибка при сохранении дня тура:', error)
    alert('Произошла ошибка при сохранении. Попробуйте еще раз.')
  } finally {
    isLoading.value = false
  }
}
</script> 