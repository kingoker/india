<template>
  <Header />
  <div class="bg-backgroundMain">
    <NuxtPage />
  </div>
  <Footer />
  
  <!-- Админ попап -->
  <AdminLoginPopup
    :is-open="isAdminPopupOpen"
    @close="closeAdminPopup"
    @success="handleAdminSuccess"
  />
  
  <!-- Кнопка выхода для админов -->
  <LogoutButton />
</template>

<script setup>
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/700.css'
import '@fontsource/alice'
import { useAdminCheck } from '../composables/useAdminCheck'
import { useAdminAuth } from '../composables/useAdminAuth'

const route = useRoute()
const { isAdminPopupOpen, closeAdminPopup, openAdminPopup } = useAdminAuth()
const { checkAdminStatus } = useAdminCheck()

// Обработчик успешного входа админа
const handleAdminSuccess = async (user) => {
  // Обновляем статус админа
  await checkAdminStatus()
}

// Проверяем параметр admin при загрузке страницы
watch(() => route.query, (newQuery) => {
  if (newQuery.admin) {
    openAdminPopup()
    // Удаляем параметр admin из URL
    navigateTo({
      path: route.path,
      query: { ...newQuery, admin: undefined }
    })
  }
}, { immediate: true })

// Также проверяем при загрузке компонента
onMounted(async () => {
  if (route.query.admin) {
    openAdminPopup()
  }
  
  // Дополнительная проверка через window.location
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('admin')) {
    openAdminPopup()
    // Удаляем параметр из URL
    urlParams.delete('admin')
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, '', newUrl)
  }
})
</script>


<style scoped>

</style>
