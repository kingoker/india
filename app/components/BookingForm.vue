<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  itemId: {
    type: String,
    required: true
  },
  itemTitle: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    validator: (value) => ['yagya', 'tour'].includes(value)
  },
  isOpen: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  name: '',
  phone: '',
  comments: ''
})

const loading = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.name.trim()) {
    errors.value.name = 'Имя обязательно для заполнения'
  }
  
  if (!formData.value.phone.trim()) {
    errors.value.phone = 'Телефон обязателен для заполнения'
  } else if (!/^\+\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,4}$/.test(formData.value.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Неверный формат телефона'
  }
  
  return Object.keys(errors.value).length === 0
}

const formatPhone = (value) => {
  // Убираем все кроме цифр и плюса
  const cleanValue = value.replace(/[^\d+]/g, '')
  
  // Если нет плюса в начале, добавляем
  if (!cleanValue.startsWith('+')) {
    return '+' + cleanValue
  }
  
  return cleanValue
}

const handlePhoneInput = (event) => {
  const target = event.target
  formData.value.phone = formatPhone(target.value)
}

const handleSubmit = () => {
  if (!validateForm()) return
  
  loading.value = true
  
  const submitData = {
    name: formData.value.name.trim(),
    phone: formData.value.phone.trim(),
    comments: formData.value.comments.trim() || undefined
  }

  // Добавляем соответствующий ID в зависимости от типа
  if (props.itemType === 'yagya') {
    submitData.yagya_id = props.itemId
  } else if (props.itemType === 'tour') {
    submitData.tour_id = props.itemId
  }

  emit('submit', submitData)
  
  // Очищаем форму
  formData.value = {
    name: '',
    phone: '',
    comments: ''
  }
  
  emit('close')
  loading.value = false
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

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose"></div>
    
    <!-- Модальное окно -->
    <div class="relative bg-white rounded-[32px] p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto lg:min-w-[783px]" @click.stop>
      <!-- Заголовок -->
      <div class="mb-6 pr-20">
        <h3 class="text-[28px] md:text-[56px] font-alice font-bold text-orange-400 mb-2 leading-tight md:leading-normal">
          Забронировать Место
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
      
      <!-- Информация о выбранном элементе -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <p class="text-sm text-gray-600 mb-1">Выбранный {{ itemType === 'yagya' ? 'ягья' : 'тур' }}:</p>
        <p class="text-[16px] font-montserrat font-semibold text-gray-800">{{ itemTitle }}</p>
      </div>
      
      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Имя -->
        <div>
          <label class="block text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Имя:
          </label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="Как к вам обращаться?"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
            :class="{ 'border-red-500': errors.name }"
            :disabled="loading"
          />
          <p v-if="errors.name" class="mt-1 text-sm text-red-500">{{ errors.name }}</p>
        </div>
        
        <!-- Телефон -->
        <div>
          <label class="block text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            *Телефон:
          </label>
          <input
            v-model="formData.phone"
            type="tel"
            placeholder="+7 999 123 45 67"
            @input="handlePhoneInput"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 placeholder:text-gray-400/30 text-black"
            :class="{ 'border-red-500': errors.phone }"
            :disabled="loading"
          />
          <p v-if="errors.phone" class="mt-1 text-sm text-red-500">{{ errors.phone }}</p>
        </div>
        
        <!-- Комментарии -->
        <div>
          <label class="block text-[24px] font-alice font-semibold text-orange-400 mb-0 ml-[30px]">
            Комментарии:
          </label>
          <textarea
            v-model="formData.comments"
            placeholder="Ваши пожелания?"
            rows="3"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] text-[34px] font-alice focus:outline-none focus:border-orange-500 transition-colors duration-200 resize-none placeholder:text-gray-400/30 text-black"
            :disabled="loading"
          ></textarea>
        </div>
        
        <!-- Кнопка отправки -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full px-8 py-4 bg-orange-400 text-white text-[20px] font-montserrat font-bold rounded-full hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Отправка...</span>
          <span v-else>ЗАБРОНИРОВАТЬ МЕСТО</span>
        </button>
      </form>
    </div>
  </div>
</template> 