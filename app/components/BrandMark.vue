<script setup lang="ts">
/** Логотип «солнце» — знак бренда «Взгляд сверху». */
withDefaults(defineProps<{ size?: number }>(), { size: 34 })
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 40 40" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="20" cy="20" r="12.5" stroke-width="1.1" opacity=".5" />
    <circle cx="20" cy="20" r="7.6" stroke-width="1.5" />
    <circle cx="20" cy="20" r="2.5" fill="currentColor" stroke="none" />
    <g stroke-width="1.5" stroke-linecap="round">
      <path d="M20 2.5V6.4" />
      <path d="M20 33.6V37.5" />
      <path d="M2.5 20H6.4" />
      <path d="M33.6 20H37.5" />
    </g>
  </svg>
</template>
