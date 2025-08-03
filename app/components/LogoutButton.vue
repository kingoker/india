<template>
  <div v-if="isAdmin" class="fixed bottom-6 right-6 z-[9999]">
    <button
      @click="handleLogout"
      :disabled="isLoading"
      class="bg-red-500 hover:bg-red-600 text-white font-montserrat font-bold text-[14px] px-4 py-2 rounded-full shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <svg v-if="!isLoading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
      </svg>
      <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      {{ isLoading ? 'Выход...' : 'Выход' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminCheck } from '../../composables/useAdminCheck'

const { isAdmin } = useAdminCheck()
const supabase = useSupabaseClient()
const isLoading = ref(false)

const handleLogout = async () => {
  try {
    isLoading.value = true
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      alert('Ошибка при выходе: ' + error.message)
    } else {
      // Обновляем статус админа
      const { checkAdminStatus } = useAdminCheck()
      await checkAdminStatus()
    }
  } catch (err) {
    console.error('Logout error:', err)
    alert('Ошибка при выходе')
  } finally {
    isLoading.value = false
  }
}
</script> 