// Простой composable для админ-попапа
export const useAdminAuth = () => {
  // Используем useState для глобального состояния попапа
  const isAdminPopupOpen = useState('admin-popup-open', () => false)

  // Открыть попап админ-входа
  const openAdminPopup = () => {
    isAdminPopupOpen.value = true
  }

  // Закрыть попап админ-входа
  const closeAdminPopup = () => {
    isAdminPopupOpen.value = false
  }

  return {
    isAdminPopupOpen,
    openAdminPopup,
    closeAdminPopup
  }
} 