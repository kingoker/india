<template>
  <div v-if="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
    <div class="bg-white rounded-[60px] p-8 max-w-md w-full mx-4 relative">
      <!-- Кнопка закрытия -->
      <button
        @click="$emit('close')"
        class="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Заголовок -->
      <h2 class="font-alice font-normal text-[24px] md:text-[36px] text-orange-400 mb-6 text-center">
        Админ-аутентификация
      </h2>

      <!-- Форма -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block font-montserrat font-semibold text-[18px] md:text-[24px] text-gray-700 mb-2 ml-[30px]">
            Пароль
          </label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="new-password"
            class="w-full px-[30px] py-[10px] border-2 border-orange-400 rounded-[60px] font-montserrat text-[20px] md:text-[34px] text-black placeholder:text-gray-400/30 focus:outline-none focus:border-orange-500"
            placeholder="Введите пароль"
          />
        </div>

        <div class="text-center">
          <button
            type="submit"
            :disabled="loading"
            class="bg-orange-400 text-white font-montserrat font-bold text-[18px] md:text-[24px] px-8 py-4 rounded-[60px] hover:bg-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Обработка...' : 'Войти / Зарегистрировать' }}
          </button>
        </div>

        <div v-if="error" class="text-red-500 text-center font-montserrat text-[16px]">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { disableScroll, enableScroll, addEventListener, removeEventListener } from '~/utils/domUtils'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})



const emit = defineEmits(['close', 'success'])

const supabase = useSupabaseClient()
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleSubmit = async () => {
  if (!password.value) {
    error.value = 'Введите пароль'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Сначала пытаемся войти с существующим пользователем
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'zolotojznak@gmail.com',
      password: password.value
    })

    if (signInError) {
      // Если вход не удался, пробуем зарегистрировать нового пользователя
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'zolotojznak@gmail.com',
        password: password.value,
        options: {
          data: {
            role: 'admin'
          }
        }
      })

      if (signUpError) {
        error.value = 'Ошибка регистрации: ' + signUpError.message
      } else {
        // Успешная регистрация - теперь попробуем войти автоматически
        const { data: autoSignInData, error: autoSignInError } = await supabase.auth.signInWithPassword({
          email: 'zolotojznak@gmail.com',
          password: password.value
        })
        
        if (autoSignInError) {
          error.value = 'Регистрация успешна, но автоматический вход не удался. Попробуйте войти снова.'
        } else {
          emit('success', autoSignInData.user)
          password.value = ''
          emit('close')
        }
      }
    } else {
      // Успешный вход
      emit('success', signInData.user)
      password.value = ''
      emit('close')
    }
  } catch (err) {
    error.value = 'Ошибка аутентификации. Попробуйте еще раз.'
    console.error('Auth error:', err)
  } finally {
    loading.value = false
  }
}

// Обработка клавиши Escape
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Добавляем обработчик при открытии попапа
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    addEventListener('keydown', handleKeydown)
    // Блокируем скролл страницы
    disableScroll()
  } else {
    removeEventListener('keydown', handleKeydown)
    // Восстанавливаем скролл страницы
    enableScroll()
  }
})

// Очищаем обработчик при размонтировании
onUnmounted(() => {
  removeEventListener('keydown', handleKeydown)
  // Восстанавливаем скролл страницы
  enableScroll()
})
</script> 