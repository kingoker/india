<template>
  <header class="fixed top-0 left-0 w-full z-50 px-2 sm:px-4" style="background: transparent;">
    <div
      class="relative left-1/2 -translate-x-1/2 top-0 flex flex-row items-center gap-2 sm:gap-4 md:gap-[60px] px-1 sm:px-2 md:px-[30px] rounded-full border-2 border-orange-400 bg-white mt-5 shadow-md max-w-full md:max-w-[684px] w-full min-w-0"
      style="height:70px; min-height:70px; max-height:70px;"
    >
      <!-- Логотип -->
      <div class="flex items-center h-full">
        <NuxtLink to="/">
          <img src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//main%20logo.svg" alt="Логотип" class="h-[64px] w-[64px] object-contain" />
        </NuxtLink>
      </div>
      <!-- Навигация -->
      <nav class="flex flex-row gap-8 flex-1 justify-center">
        <NuxtLink
          to="/tours"
          :class="[
            'font-alice transition-colors duration-200',
            'text-2xl',
            route.path === '/tours' ? 'text-orange-400' : 'text-gray-400',
            'hover:text-black',
            'px-1 sm:px-2'
          ]"
        >
          Туры
        </NuxtLink>
        <NuxtLink
          to="/yagya"
          :class="[
            'font-alice transition-colors duration-200',
            'text-2xl',
            route.path === '/yagya' ? 'text-orange-400' : 'text-gray-400',
            'hover:text-black',
            'px-1 sm:px-2'
          ]"
        >
          Ягья
        </NuxtLink>
      </nav>
      <!-- Контакты -->
      <div class="flex items-center gap-2">
        <NuxtLink to="https://t.me/+79639621514" target="_blank" rel="noopener noreferrer">
          <span class="flex items-center gap-2 px-2 py-1 rounded-full bg-[#ff9900] text-white text-base font-alice hover:bg-[#e68a00] transition-colors duration-200" style="height:48px;">
            <span class="flex items-center justify-center w-[32px] h-[32px] rounded-full border-2 border-[#ff9900] bg-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="#ff9900" viewBox="0 0 24 24" class="w-6 h-6">
                <path d="M21.75 3.75 11.25 12l-3-2.25 13.5-6-19.5 7.5 4.875 1.462L21.75 3.75l-4.875 16.5-7.5-5.25" />
              </svg>
            </span>
            <span class="whitespace-nowrap">+79639621514</span>
          </span>
        </NuxtLink>
        <NuxtLink to="https://t.me/vzglyad_sverhy" target="_blank" rel="noopener noreferrer">
          <span class="flex items-center justify-center w-[32px] h-[32px] rounded-full border-2 border-[#ff9900] bg-white hover:bg-gray-50 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#ff9900" viewBox="0 0 24 24" class="w-6 h-6">
              <path d="M21.75 3.75 11.25 12l-3-2.25 13.5-6-19.5 7.5 4.875 1.462L21.75 3.75l-4.875 16.5-7.5-5.25" />
            </svg>
          </span>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup>
const route = useRoute()
</script> 