<template>
    <footer class="w-full bg-[#3A1F06] py-8 px-4 md:px-0">
      <div class="max-w-[1290px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <!-- Логотип -->
        <div class="flex-shrink-0 flex items-center justify-center w-[140px] h-[140px]">
          <img src="https://wnfudwbexanzlzarfwtf.supabase.co/storage/v1/object/public/assets//main%20logo.svg" alt="Логотип" class="w-[64px] h-[64px] object-contain" />
        </div>
        <!-- Навигация -->
        <nav class="flex flex-row gap-8 md:gap-12 items-center justify-center flex-1">
          <NuxtLink to="/tours" class="font-alice text-[24px] font-bold text-orange-400 hover:text-orange-300 transition">Туры</NuxtLink>
          <NuxtLink to="/yagya" class="font-alice text-[24px] font-bold text-[#FFF8E7] hover:text-orange-300 transition">Ягьи</NuxtLink>
        </nav>
        <!-- Соцсети -->
        <div class="flex flex-row gap-6 items-center justify-center">
          <a href="https://instagram.com" target="_blank" class="w-12 h-12 rounded-full bg-[#FFF8E7] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#3A1F06" viewBox="0 0 24 24" class="w-7 h-7"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.782 2.295 7.148 2.233 8.414 2.175 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.363 3.678 1.344c-.98.98-1.213 2.092-1.272 3.373C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.613.059 1.281.292 2.393 1.272 3.373.98.98 2.092 1.213 3.373 1.272C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.281-.059 2.393-.292 3.373-1.272.98-.98 1.213-2.092 1.272-3.373.059-1.281.072-1.69.072-7.613 0-5.923-.013-6.332-.072-7.613-.059-1.281-.292-2.393-1.272-3.373-.98-.98-2.092-1.213-3.373-1.272C15.668.013 15.259 0 12 0z"/><path d="M12 5.838A6.162 6.162 0 0 0 5.838 12 6.162 6.162 0 0 0 12 18.162 6.162 6.162 0 0 0 18.162 12 6.162 6.162 0 0 0 12 5.838zm0 10.324A4.162 4.162 0 1 1 16.162 12 4.162 4.162 0 0 1 12 16.162z"/><circle cx="18.406" cy="5.594" r="1.44"/></svg>
          </a>
          <a href="https://youtube.com" target="_blank" class="w-12 h-12 rounded-full bg-[#FFF8E7] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#3A1F06" viewBox="0 0 24 24" class="w-7 h-7"><path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.425 3.5 12 3.5 12 3.5s-7.425 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.147 0 12 0 12s0 3.853.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.575 20.5 12 20.5 12 20.5s7.425 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.853 24 12 24 12s0-3.853-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://t.me" target="_blank" class="w-12 h-12 rounded-full bg-[#FFF8E7] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="#3A1F06" viewBox="0 0 24 24" class="w-7 h-7"><path d="M21.75 3.75 11.25 12l-3-2.25 13.5-6-19.5 7.5 4.875 1.462L21.75 3.75l-4.875 16.5-7.5-5.25"/></svg>
          </a>
        </div>
      </div>
    </footer>
  </template> 