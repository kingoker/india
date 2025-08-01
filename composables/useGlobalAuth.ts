import { ref, computed } from 'vue'

// Глобальное состояние авторизации
export const useGlobalAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Глобальное состояние авторизации
  const isAuthenticated = useState('global-auth', () => false)
  const isLoading = useState('auth-loading', () => false)

  // Проверяем, является ли пользователь администратором
  const isAdmin = computed(() => {
    return isAuthenticated.value && user.value && user.value.email === 'zolotojznak@gmail.com'
  })

  // Проверить статус авторизации
  const checkAuthStatus = async () => {
    try {
      isLoading.value = true
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser && currentUser.email === 'zolotojznak@gmail.com') {
        isAuthenticated.value = true
        return true
      } else {
        isAuthenticated.value = false
        return false
      }
    } catch (err: any) {
      console.error('Check auth status error:', err)
      isAuthenticated.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Вход в систему
  const signIn = async (password: string) => {
    try {
      isLoading.value = true
      
      // Сначала попробуем войти
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@admin.com',
        password: password
      })

      if (signInError) {
        // Если пользователь не существует, создаем его
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@admin.com',
          password: password,
          options: {
            data: {
              role: 'admin'
            }
          }
        })

        if (signUpError) {
          console.error('Sign up error:', signUpError)
          return { success: false, error: signUpError.message }
        }

        isAuthenticated.value = true
        return { success: true, data: signUpData }
      }

      isAuthenticated.value = true
      return { success: true, data: signInData }
    } catch (err: any) {
      console.error('Sign in error:', err)
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Выход из системы
  const signOut = async () => {
    try {
      isLoading.value = true
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      } else {
        isAuthenticated.value = false
      }
    } catch (err: any) {
      console.error('Sign out error:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Инициализация при загрузке приложения
  const initAuth = async () => {
    await checkAuthStatus()
  }

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    signIn,
    signOut,
    checkAuthStatus,
    initAuth
  }
} 