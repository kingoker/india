<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ editingInfo ? 'Редактировать информацию' : 'Добавить информацию' }}
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
        <!-- Заголовок -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Заголовок:
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Введите заголовок"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
          />
        </div>

        <!-- Описание -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Описание:
          </label>
          <RichTextEditor
            ref="richTextEditorRef"
            v-model="form.description"
            placeholder="Введите описание"
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

        <!-- Порядок сортировки -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            Порядок сортировки:
          </label>
          <input
            v-model.number="form.sort_order"
            type="number"
            min="0"
            placeholder="0"
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
            {{ isLoading ? 'Сохранение...' : (editingInfo ? 'Сохранить изменения' : 'Добавить информацию') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { disableScroll, enableScroll, addEventListener, removeEventListener } from '~/utils/domUtils'
import { ref, watch, computed, onUnmounted } from 'vue'
import RichTextEditor from './RichTextEditor.vue'
import { useTourDetails } from '../../composables/useTourDetails'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingInfo: {
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
const richTextEditorRef = ref(null)
const form = ref({
  title: '',
  description: '',
  image_url: '',
  sort_order: 0
})

// Функция для блокировки скролла
const disableScroll = () => {
  if (typeof document !== 'undefined') {
    disableScroll()
    disableScroll()
  }
}

// Функция для разблокировки скролла
const enableScroll = () => {
  if (typeof document !== 'undefined') {
    enableScroll()
    enableScroll()
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
    addEventListener('keydown', handleEscape)
    
    if (props.editingInfo) {
      // Редактирование - заполняем форму данными
      form.value = {
        title: props.editingInfo.title || '',
        description: props.editingInfo.description || '',
        image_url: props.editingInfo.image_url || '',
        sort_order: props.editingInfo.sort_order || 0
      }
    } else {
      // Добавление - очищаем форму
      form.value = {
        title: '',
        description: '',
        image_url: '',
        sort_order: 0
      }
    }
  } else {
    enableScroll()
    removeEventListener('keydown', handleEscape)
  }
}, { immediate: true })

// Очистка при размонтировании
onUnmounted(() => {
  enableScroll()
  removeEventListener('keydown', handleEscape)
})

const handleSubmit = async () => {
  if (isLoading.value) return

  isLoading.value = true

  try {
    const { createTourInfo, updateTourInfo } = useTourDetails()

    // Обрабатываем URL изображения
    const processedImageUrl = form.value.image_url ? processImageUrl(form.value.image_url) : null

    // Tiptap автоматически сохраняет стили в HTML
    // Никаких дополнительных действий не требуется

    if (props.editingInfo) {
      // Редактирование
      await updateTourInfo(props.editingInfo.id, {
        title: form.value.title,
        description: form.value.description,
        image_url: processedImageUrl,
        sort_order: form.value.sort_order
      })
      emit('edited', props.editingInfo.id)
    } else {
      // Добавление
      await createTourInfo({
        tour_id: props.tourId,
        title: form.value.title,
        description: form.value.description,
        image_url: processedImageUrl,
        sort_order: form.value.sort_order
      })
      emit('added')
    }

    emit('close')
  } catch (error) {
    console.error('Ошибка при сохранении информации о туре:', error)
    alert('Произошла ошибка при сохранении. Попробуйте еще раз.')
  } finally {
    isLoading.value = false
  }
}
</script> 