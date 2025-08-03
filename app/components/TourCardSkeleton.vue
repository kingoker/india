<template>
  <div class="relative rounded-[32px] overflow-hidden bg-white animate-pulse w-full min-h-[600px] max-w-[calc(100vw-32px)] mx-auto p-3 sm:p-4 md:p-6 lg:p-8 md:min-w-[400px] md:max-w-[500px] md:min-h-[595px] md:max-h-[595px] lg:min-w-[595px] lg:max-w-[595px] lg:min-h-[595px] lg:max-h-[595px] flex flex-col justify-end block"
       style="box-shadow: 8px 8px 0 0 #ff9900;">
    
    <!-- Скелетон изображения -->
    <div class="absolute inset-0 bg-gray-300 z-0"></div>
    
    <!-- Скелетон градиента -->
    <div class="absolute bottom-0 left-0 w-full h-3/5 bg-gradient-to-t from-gray-400/95 to-transparent z-10"></div>
    
    <!-- Скелетон контента -->
    <div class="relative z-20 flex flex-col gap-3 h-full justify-end">
      <div class="h-8 bg-gray-400 rounded w-3/4"></div>
      <div class="h-6 bg-gray-400 rounded w-full"></div>
      <div class="h-6 bg-gray-400 rounded w-2/3"></div>
      <div class="h-10 bg-gray-400 rounded-full w-1/2 mt-2"></div>
    </div>
  </div>
</template>

<script setup>
// Компонент скелетона для карточек туров
</script> 