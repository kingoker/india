<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ editingImage ? 'Редактировать изображение' : 'Добавить изображение' }}
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
        <!-- URL изображения -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *URL изображения:
          </label>
          <input
            v-model="form.image_url"
            type="url"
            required
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

        <!-- Активность -->
        <div class="flex items-center ml-[30px]">
          <input
            v-model="form.is_active"
            type="checkbox"
            id="is_active"
            class="w-6 h-6 text-orange-400 border-2 border-orange-400 rounded focus:ring-orange-400"
          />
          <label for="is_active" class="ml-3 text-[16px] md:text-[24px] font-alice font-semibold text-orange-400">
            Изображение активно
          </label>
        </div>

        <!-- Предварительный просмотр -->
        <div v-if="form.image_url" class="border-2 border-orange-400 rounded-[40px] p-6 mx-[30px]">
          <h3 class="text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-4">Предварительный просмотр:</h3>
          <img
            :src="form.image_url"
            alt="Предварительный просмотр"
            class="w-full max-h-64 object-cover rounded-[30px]"
            @error="previewError = true"
            @load="previewError = false"
          />
          <div v-if="previewError" class="text-red-500 text-[16px] font-montserrat mt-3">
            Не удалось загрузить изображение. Проверьте URL.
          </div>
        </div>

        <!-- Кнопка добавления -->
        <div class="pt-4">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="loading"
            class="w-full bg-orange-400 text-white font-alice font-bold text-[20px] md:text-[34px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Сохранение...' : (editingImage ? 'Сохранить изменения' : 'Добавить изображение') }}
          </button>
        </div>

        <!-- Сообщения об ошибках и успехе -->
        <div v-if="error" class="text-red-500 text-center font-montserrat text-[16px]">
          {{ error }}
        </div>

        <div v-if="success" class="text-green-500 text-center font-montserrat text-[16px]">
          {{ success }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { disableScroll, enableScroll, addEventListener, removeEventListener } from '../../utils/domUtils'
import { ref, watch, onUnmounted } from 'vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingImage: {
    type: Object,
    default: null
  },
  tourId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'added', 'edited'])

const loading = ref(false)
const previewError = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  image_url: '',
  sort_order: 0,
  is_active: true
})





// Обработчик клавиши Escape
const handleEscape = (event) => {
  if (event.key === 'Escape' && !loading.value) {
    emit('close')
  }
}

// Сброс формы при открытии
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    disableScroll()
    addEventListener('keydown', handleEscape)
    
    if (props.editingImage) {
      // Редактирование существующего изображения
      form.value = {
        image_url: props.editingImage.image_url || '',
        sort_order: props.editingImage.sort_order || 0,
        is_active: props.editingImage.is_active !== false
      }
    } else {
      // Добавление нового изображения
      form.value = {
        image_url: '',
        sort_order: 0,
        is_active: true
      }
    }
    previewError.value = false
    error.value = ''
    success.value = ''
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
  if (!form.value.image_url.trim()) {
    error.value = 'Пожалуйста, введите URL изображения'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const supabase = useSupabaseClient()
    
    // Обрабатываем URL изображения
    const processedImageUrl = processImageUrl(form.value.image_url)
    
    if (props.editingImage) {
      // Обновление существующего изображения
      const { data, error: updateError } = await supabase
        .from('tour_images')
        .update({
          image_url: processedImageUrl,
          sort_order: form.value.sort_order,
          is_active: form.value.is_active
        })
        .eq('id', props.editingImage.id)
        .select()
        .single()

      if (updateError) throw updateError

      success.value = 'Изображение успешно обновлено!'
      emit('edited', data)
      
      // Закрываем попап через небольшую задержку
      setTimeout(() => {
        emit('close')
      }, 1000)
    } else {
      // Создание нового изображения
      const { data, error: insertError } = await supabase
        .from('tour_images')
        .insert([{
          tour_id: props.tourId,
          image_url: processedImageUrl,
          sort_order: form.value.sort_order,
          is_active: form.value.is_active
        }])
        .select()
        .single()

      if (insertError) throw insertError

      success.value = 'Изображение успешно добавлено!'
      emit('added', data)
      
      // Закрываем попап через небольшую задержку
      setTimeout(() => {
        emit('close')
      }, 1000)
    }
  } catch (err) {
    console.error('Ошибка при сохранении изображения:', err)
    error.value = props.editingImage ? 'Ошибка обновления изображения. Попробуйте еще раз.' : 'Ошибка добавления изображения. Попробуйте еще раз.'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}
</script> 