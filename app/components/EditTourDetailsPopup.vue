<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ props.isImageEdit 
            ? (props.section === 'about' ? 'Редактировать изображение "О туре"' : 'Редактировать изображение "Почему особенный"')
            : (props.section === 'about' ? 'Редактировать описание тура' : 'Редактировать особенности тура')
          }}
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
        <!-- О туре -->
        <div v-if="props.section === 'about'">
          <!-- Текстовое поле - только если НЕ редактируем изображение -->
          <div v-if="!props.isImageEdit">
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              О туре:
            </label>
            <RichTextEditor
              v-model="form.about_tour"
              placeholder="Введите описание тура"
            />
          </div>
          
          <!-- Поле изображения - только если редактируем изображение или создаем новую запись -->
          <div v-if="props.isImageEdit || !props.editingDetails?.id">
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              Изображение для "О туре":
            </label>
            <input
              v-model="form.about_tour_img"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
            />
          </div>
        </div>

        <!-- Почему особенный -->
        <div v-if="props.section === 'special'">
          <!-- Текстовое поле - только если НЕ редактируем изображение -->
          <div v-if="!props.isImageEdit">
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              Почему этот тур особенный:
            </label>
            <RichTextEditor
              v-model="form.why_special"
              placeholder="Введите описание особенностей тура"
            />
          </div>
          
          <!-- Поле изображения - только если редактируем изображение или создаем новую запись -->
          <div v-if="props.isImageEdit || !props.editingDetails?.id">
            <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
              Изображение для "Почему особенный":
            </label>
            <input
              v-model="form.why_special_img"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
            />
          </div>
        </div>

        <!-- Кнопка сохранения -->
        <div class="pt-4">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isLoading"
            class="w-full bg-orange-400 text-white font-alice font-bold text-[20px] md:text-[34px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useTourDetails } from '../../composables/useTourDetails'
import RichTextEditor from './RichTextEditor.vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingDetails: {
    type: Object,
    default: null
  },
  tourId: {
    type: String,
    required: true
  },
  section: {
    type: String,
    default: 'about'
  },
  isImageEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'edited'])

const isLoading = ref(false)
const form = ref({
  about_tour: '',
  why_special: '',
  about_tour_img: '',
  why_special_img: ''
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
    
    // Инициализируем форму в зависимости от секции и типа редактирования
    if (props.editingDetails) {
      if (props.section === 'about') {
        if (props.isImageEdit) {
          // Редактируем только изображение
          form.value = {
            about_tour_img: props.editingDetails.about_tour_img || ''
          }
        } else {
          // Редактируем только текст
          form.value = {
            about_tour: props.editingDetails.about_tour || ''
          }
          // Добавляем поле изображения только при создании новой записи
          if (!props.editingDetails.id) {
            form.value.about_tour_img = props.editingDetails.about_tour_img || ''
          }
        }
      } else if (props.section === 'special') {
        if (props.isImageEdit) {
          // Редактируем только изображение
          form.value = {
            why_special_img: props.editingDetails.why_special_img || ''
          }
        } else {
          // Редактируем только текст
          form.value = {
            why_special: props.editingDetails.why_special || ''
          }
          // Добавляем поле изображения только при создании новой записи
          if (!props.editingDetails.id) {
            form.value.why_special_img = props.editingDetails.why_special_img || ''
          }
        }
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
  if (isLoading.value) return

  isLoading.value = true

  try {
    const { createTourDetails, updateTourDetails } = useTourDetails()

    // Подготавливаем данные для сохранения в зависимости от секции
    let updateData = {}
    
    if (props.section === 'about') {
      if (props.isImageEdit) {
        // Редактируем только изображение
        updateData = {
          about_tour_img: form.value.about_tour_img ? processImageUrl(form.value.about_tour_img) : null
        }
      } else {
        // Редактируем только текст
        updateData = {
          about_tour: form.value.about_tour
        }
        // Добавляем поле изображения только при создании новой записи
        if (!props.editingDetails?.id) {
          updateData.about_tour_img = form.value.about_tour_img ? processImageUrl(form.value.about_tour_img) : null
        }
      }
    } else if (props.section === 'special') {
      if (props.isImageEdit) {
        // Редактируем только изображение
        updateData = {
          why_special_img: form.value.why_special_img ? processImageUrl(form.value.why_special_img) : null
        }
      } else {
        // Редактируем только текст
        updateData = {
          why_special: form.value.why_special
        }
        // Добавляем поле изображения только при создании новой записи
        if (!props.editingDetails?.id) {
          updateData.why_special_img = form.value.why_special_img ? processImageUrl(form.value.why_special_img) : null
        }
      }
    }

    if (props.editingDetails && props.editingDetails.id) {
      // Обновление существующей записи
      await updateTourDetails(props.editingDetails.id, updateData)
    } else {
      // Создание новой записи
      await createTourDetails({
        tour_id: props.tourId,
        ...updateData
      })
    }

    emit('edited')
    emit('close')
  } catch (error) {
    console.error('Ошибка при сохранении информации о туре:', error)
    alert('Произошла ошибка при сохранении. Попробуйте еще раз.')
  } finally {
    isLoading.value = false
  }
}
</script> 