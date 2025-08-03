<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px] scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[29px] md:text-[36px] font-alice font-bold text-orange-400 mb-2 leading-tight">
          {{ editingTour ? 'Редактировать тур' : 'Добавить новый тур' }}
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
        <!-- Название тура -->
        <div>
          <label class="block text-[16px] md:text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Название тура:
          </label>
          <input
            v-model="formData.title"
            type="text"
            required
            placeholder="Введите название тура"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[20px] md:text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
            @input="generateSlug"
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
            placeholder="Введите описание тура"
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

        <!-- Скрытое поле для slug -->
        <input
          v-model="formData.slug"
          type="hidden"
        />

        <!-- Кнопка добавления -->
        <div class="pt-4">
          <button
            type="button"
            @click="handleSubmit"
            :disabled="loading"
            class="w-full bg-orange-400 text-white font-alice font-bold text-[20px] md:text-[34px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? (editingTour ? 'Сохранение...' : 'Добавление...') : (editingTour ? 'Сохранить изменения' : 'Добавить тур') }}
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
import { ref, watch, onUnmounted } from 'vue'
import { processImageUrl } from '../../utils/googleDriveUtils.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  editingTour: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

const supabase = useSupabaseClient()
const loading = ref(false)
const error = ref('')
const success = ref('')

const formData = ref({
  title: '',
  description: '',
  date_from: '',
  date_to: '',
  image_url: '',
  slug: ''
})

// Функция для генерации slug из русского текста
const generateSlug = () => {
  if (!formData.value.title) {
    formData.value.slug = ''
    return
  }

  // Русско-английская транслитерация
  const transliterationMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
    'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  }

  let slug = formData.value.title

  // Транслитерация
  for (const [russian, english] of Object.entries(transliterationMap)) {
    slug = slug.replace(new RegExp(russian, 'g'), english)
  }

  // Заменяем все символы кроме букв и цифр на дефисы
  slug = slug.replace(/[^a-zA-Z0-9\s]/g, '')
  
  // Заменяем пробелы на дефисы
  slug = slug.replace(/\s+/g, '-')
  
  // Убираем множественные дефисы
  slug = slug.replace(/-+/g, '-')
  
  // Убираем дефисы в начале и конце
  slug = slug.replace(/^-+|-+$/g, '')
  
  // Приводим к нижнему регистру
  slug = slug.toLowerCase()

  formData.value.slug = slug
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.description || !formData.value.date_from || !formData.value.date_to || !formData.value.image_url) {
    error.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    let result

                        if (props.editingTour) {
                  // Редактируем существующий тур
                  const { data: existingTour, error: fetchError } = await supabase
                    .from('tours')
                    .select('*')
                    .eq('id', props.editingTour.id)
                    .single()

                  if (fetchError) {
                    error.value = 'Ошибка получения тура: ' + fetchError.message
                    return
                  }
                  
                  // Проверяем, изменились ли данные
                  const hasChanges = 
                    existingTour.title !== formData.value.title ||
                    existingTour.description !== formData.value.description ||
                    existingTour.date_from !== formData.value.date_from ||
                    existingTour.date_to !== formData.value.date_to ||
                    existingTour.image_url !== formData.value.image_url ||
                    existingTour.slug !== formData.value.slug
                  
                  if (!hasChanges) {
                    success.value = 'Данные не изменились'
                    result = existingTour
                    return
                  }
                  
                  // Обрабатываем URL изображения
                  const processedImageUrl = processImageUrl(formData.value.image_url)
                  
                  // Обновляем тур
                  const updateData = {
                    title: formData.value.title,
                    description: formData.value.description,
                    date_from: formData.value.date_from,
                    date_to: formData.value.date_to,
                    image_url: processedImageUrl,
                    slug: formData.value.slug
                  }
                  
                  const { data, error: updateError } = await supabase
                    .from('tours')
                    .update(updateData)
                    .eq('id', props.editingTour.id)
                    .select('*')
                
                  if (updateError) {
                    error.value = 'Ошибка обновления тура: ' + updateError.message
                  } else if (!data || data.length === 0) {
                    // Проверяем, существует ли тур после обновления
                    const { data: checkData, error: checkError } = await supabase
                      .from('tours')
                      .select('*')
                      .eq('id', props.editingTour.id)
                      .single()
                    
                    if (checkError) {
                      error.value = 'Ошибка проверки тура: ' + checkError.message
                    } else if (checkData) {
                      success.value = 'Тур успешно обновлен!'
                      result = checkData
                    } else {
                      error.value = 'Ошибка обновления тура: запись не найдена'
                    }
                  } else {
                    success.value = 'Тур успешно обновлен!'
                    result = data[0]
                  }
    } else {
      // Обрабатываем URL изображения
      const processedImageUrl = processImageUrl(formData.value.image_url)
      
      // Добавляем новый тур
      const { data, error: insertError } = await supabase
        .from('tours')
        .insert([{
          title: formData.value.title,
          description: formData.value.description,
          date_from: formData.value.date_from,
          date_to: formData.value.date_to,
          image_url: processedImageUrl,
          slug: formData.value.slug
        }])
        .select()

      if (insertError) {
        error.value = 'Ошибка добавления тура: ' + insertError.message
      } else {
        result = data[0]
        
        // Автоматически создаем запись в tour_details для нового тура
        try {
          const { error: detailsError } = await supabase
            .from('tour_details')
            .insert([{
              tour_id: result.id,
              about_tour: formData.value.description, // Используем описание как начальный текст
              why_special: 'Особенности этого тура будут добавлены позже.',
              about_tour_img: null,
              why_special_img: null
            }])

          if (detailsError) {
            console.warn('Предупреждение: Не удалось создать детали тура:', detailsError.message)
            // Не прерываем процесс, так как тур уже создан
          }
        } catch (detailsErr) {
          console.warn('Предупреждение: Ошибка при создании деталей тура:', detailsErr)
          // Не прерываем процесс, так как тур уже создан
        }
        
        success.value = 'Тур успешно добавлен!'
      }
    }

    if (result) {
      emit('success', result)
      
      // Закрываем попап сразу
      emit('close')
    }
  } catch (err) {
    error.value = props.editingTour ? 'Ошибка обновления тура. Попробуйте еще раз.' : 'Ошибка добавления тура. Попробуйте еще раз.'
    console.error(props.editingTour ? 'Update tour error:' : 'Add tour error:', err)
  } finally {
    loading.value = false
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

// Следим за состоянием открытия формы
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    disableScroll()
    document.addEventListener('keydown', handleEscape)
    
    // Если редактируем тур, заполняем форму
    if (props.editingTour) {
      formData.value = {
        title: props.editingTour.title,
        description: props.editingTour.description,
        date_from: props.editingTour.date_from,
        date_to: props.editingTour.date_to,
        image_url: props.editingTour.image_url,
        slug: props.editingTour.slug
      }
    } else {
      // Если добавляем новый тур, очищаем форму
      formData.value = {
        title: '',
        description: '',
        date_from: '',
        date_to: '',
        image_url: '',
        slug: ''
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

const handleClose = () => {
  if (!loading.value) {
    emit('close')
  }
}
</script> 