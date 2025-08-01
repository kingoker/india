// Простой composable для проверки админ-статуса
export const useAdminCheck = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Глобальное состояние для админ-статуса
  const isAdmin = useState('admin-status', () => false)
  
  // Проверяем статус админа
  const checkAdminStatus = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (currentUser && currentUser.email === 'zolotojznak@gmail.com') {
        isAdmin.value = true
        return true
      } else {
        isAdmin.value = false
        return false
      }
    } catch (err) {
      console.error('Admin check error:', err)
      isAdmin.value = false
      return false
    }
  }
  
  // Инициализация при загрузке
  const initAdminCheck = async () => {
    await checkAdminStatus()
  }
  
  return {
    isAdmin,
    checkAdminStatus,
    initAdminCheck
  }
} 