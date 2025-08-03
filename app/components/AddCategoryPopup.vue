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
        {{ props.editingCategory ? 'Редактировать категорию' : 'Добавить категорию' }}
      </h2>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Название категории -->
        <div>
          <label class="block text-[24px] font-alice font-medium text-gray-700 mb-0">
            Название категории *
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            placeholder="Введите название категории"
            class="w-full px-[30px] py-[10px] border-2 border-gray-300 rounded-[60px] text-[34px] font-alice focus:border-orange-400 focus:outline-none transition-colors duration-200 placeholder:text-gray-400/30"
          />
        </div>

        <!-- Slug (автоматически генерируется) -->
        <div>
          <label class="block text-[24px] font-alice font-medium text-gray-700 mb-0">
            Slug (автоматически)
          </label>
          <input
            v-model="formData.slug"
            type="text"
            readonly
            placeholder="slug-будет-сгенерирован"
            class="w-full px-[30px] py-[10px] border-2 border-gray-300 rounded-[60px] text-[34px] font-alice bg-gray-100 cursor-not-allowed"
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
          {{ loading ? (props.editingCategory ? 'Сохранение...' : 'Добавление...') : (props.editingCategory ? 'Сохранить изменения' : 'Добавить категорию') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingCategory: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const formData = ref({
  name: '',
  slug: ''
})

const loading = ref(false)
const error = ref('')
const success = ref('')

// Функция для генерации slug из названия
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (char) => {
      const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }
      return map[char] || char
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Сброс формы при открытии попапа
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    if (props.editingCategory) {
      // Заполняем форму данными для редактирования
      formData.value = {
        name: props.editingCategory.name,
        slug: props.editingCategory.slug
      }
    } else {
      // Сбрасываем форму для добавления
      formData.value = {
        name: '',
        slug: ''
      }
    }
    error.value = ''
    success.value = ''
  }
})

// Генерируем slug при изменении названия
watch(() => formData.value.name, (newName) => {
  if (newName && !props.editingCategory) {
    formData.value.slug = generateSlug(newName)
  }
})

const handleSubmit = async () => {
  if (!formData.value.name) {
    error.value = 'Пожалуйста, заполните название категории'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const supabase = useSupabaseClient()
    let result

    if (props.editingCategory) {
      // Редактируем существующую категорию
      const { data, error: updateError } = await supabase
        .from('categories')
        .update({
          name: formData.value.name,
          slug: formData.value.slug
        })
        .eq('id', props.editingCategory.id)
        .select()

      if (updateError) {
        error.value = 'Ошибка обновления категории: ' + updateError.message
      } else {
        success.value = 'Категория успешно обновлена!'
        result = data[0]
      }
    } else {
      // Добавляем новую категорию
      const { data, error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: formData.value.name,
          slug: formData.value.slug
        }])
        .select()

      if (insertError) {
        error.value = 'Ошибка добавления категории: ' + insertError.message
      } else {
        success.value = 'Категория успешно добавлена!'
        result = data[0]
      }
    }

    if (result) {
      emit('success', result)
      emit('close')
    }
  } catch (err) {
    error.value = props.editingCategory ? 'Ошибка обновления категории. Попробуйте еще раз.' : 'Ошибка добавления категории. Попробуйте еще раз.'
    console.error(props.editingCategory ? 'Update category error:' : 'Add category error:', err)
  } finally {
    loading.value = false
  }
}
</script> 