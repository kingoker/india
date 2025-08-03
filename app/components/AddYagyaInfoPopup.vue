<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-[32px] p-8 w-full max-w-[783px] max-h-[90vh] overflow-y-auto relative">
      <!-- Крестик для закрытия -->
      <button
        @click="$emit('close')"
        class="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Заголовок -->
      <h2 class="text-[36px] font-alice font-bold text-orange-400 mb-8 text-center">
        {{ props.editingInfo ? 'Редактировать информацию' : 'Добавить информацию о ягья' }}
      </h2>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Заголовок -->
        <div>
          <label class="block text-[24px] font-alice font-medium text-gray-700 mb-0">
            Заголовок *
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            placeholder="Введите заголовок"
            class="w-full px-[30px] py-[10px] border-2 border-gray-300 rounded-[60px] text-[34px] font-alice focus:border-orange-400 focus:outline-none transition-colors duration-200 placeholder:text-gray-400/30"
          />
        </div>

        <!-- Текст -->
        <div>
          <label class="block text-[24px] font-alice font-medium text-gray-700 mb-0">
            Текст *
          </label>
          <textarea
            v-model="formData.text"
            required
            rows="6"
            placeholder="Введите текст"
            class="w-full px-[30px] py-[10px] border-2 border-gray-300 rounded-[40px] text-[34px] font-alice focus:border-orange-400 focus:outline-none transition-colors duration-200 placeholder:text-gray-400/30 resize-none leading-[1.2]"
          ></textarea>
        </div>

        <!-- URL изображения -->
        <div>
          <label class="block text-[24px] font-alice font-medium text-gray-700 mb-0">
            URL изображения *
          </label>
          <input
            v-model="formData.image_url"
            type="url"
            required
            placeholder="https://example.com/image.jpg"
            class="w-full px-[30px] py-[10px] border-2 border-gray-300 rounded-[60px] text-[34px] font-alice focus:border-orange-400 focus:outline-none transition-colors duration-200 placeholder:text-gray-400/30"
          />
        </div>

        <!-- Сообщения об ошибках и успехе -->
        <div v-if="error" class="text-red-500 text-center text-lg font-montserrat">
          {{ error }}
        </div>
        <div v-if="success" class="text-green-500 text-center text-lg font-montserrat">
          {{ success }}
        </div>

        <!-- Кнопка отправки -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-[30px] py-[15px] bg-orange-400 text-white font-montserrat font-bold text-[22px] rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? (props.editingInfo ? 'Сохранение...' : 'Добавление...') : (props.editingInfo ? 'Сохранить изменения' : 'Добавить информацию') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formData = ref({
  title: '',
  text: '',
  image_url: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Сброс формы при открытии попапа
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    if (props.editingInfo) {
      // Заполняем форму данными для редактирования
      formData.value = {
        title: props.editingInfo.title,
        text: props.editingInfo.text,
        image_url: props.editingInfo.image_url
      }
    } else {
      // Сбрасываем форму для добавления
      formData.value = {
        title: '',
        text: '',
        image_url: ''
      }
    }
    error.value = ''
    success.value = ''
  }
})

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.text || !formData.value.image_url) {
    error.value = 'Пожалуйста, заполните все обязательные поля'
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

    if (props.editingInfo) {
      // Редактируем существующую информацию
      const { data, error: updateError } = await supabase
        .from('yagya_info')
        .update({
          title: formData.value.title,
          text: formData.value.text,
          image_url: processedImageUrl
        })
        .eq('id', props.editingInfo.id)
        .select()

      if (updateError) {
        error.value = 'Ошибка обновления информации: ' + updateError.message
      } else {
        success.value = 'Информация успешно обновлена!'
        result = data[0]
      }
    } else {
      // Добавляем новую информацию
      const { data, error: insertError } = await supabase
        .from('yagya_info')
        .insert([{
          title: formData.value.title,
          text: formData.value.text,
          image_url: processedImageUrl
        }])
        .select()

      if (insertError) {
        error.value = 'Ошибка добавления информации: ' + insertError.message
      } else {
        success.value = 'Информация успешно добавлена!'
        result = data[0]
      }
    }

    if (result) {
      emit('success', result)
      emit('close')
      // Перезагружаем страницу для отображения изменений
      window.location.reload()
    }
  } catch (err) {
    error.value = props.editingInfo ? 'Ошибка обновления информации. Попробуйте еще раз.' : 'Ошибка добавления информации. Попробуйте еще раз.'
    console.error(props.editingInfo ? 'Update yagya info error:' : 'Add yagya info error:', err)
  } finally {
    loading.value = false
  }
}
</script> 