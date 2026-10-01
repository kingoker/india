<script setup lang="ts">
/** Инлайновые SVG-иконки витрины (24×24, stroke=currentColor). 1:1 из прототипа. */
const props = withDefaults(defineProps<{ name: string, sw?: number | string }>(), { sw: 1.7 })

const PATHS: Record<string, string> = {
  money: '<path d="M12 21V9M12 9c0-3-2-5-5-5 0 3 2 5 5 5Zm0 3c0-3 2-5 5-5 0 3-2 5-5 5Z"/>',
  health: '<path d="M4 13h3l2 4 4-10 2 6h5"/>',
  protect: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z"/>',
  love: '<path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/>',
  spirit: '<path d="M12 4c2.4 3.2 3.6 5.3 3.6 7.2a3.6 3.6 0 0 1-7.2 0C8.4 9.3 9.6 7.2 12 4Z"/>',
  work: '<circle cx="12" cy="8" r="3.4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  temple: '<path d="M4 21h16M6 21v-9l6-4 6 4v9M10 21v-5h4v5M12 4V2"/>',
  spark: '<path d="M12 3l1.9 5L19 10l-5.1 2L12 17l-1.9-5L5 10l5.1-2L12 3Z"/>',
  arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
  date: '<rect x="4" y="5" width="16" height="16" rx="3"/><path d="M4 9h16M8 3v4M16 3v4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h5v-5h2v5h5v-9"/>',
  leaf: '<path d="M12 3c3 3.4 4.7 6 4.7 8.6A4.7 4.7 0 0 1 12 16.3a4.7 4.7 0 0 1-4.7-4.7C7.3 9 9 6.4 12 3Z"/><path d="M6 20h12"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5"/>',
  flame: '<path d="M12 3c3 3.4 4.7 6 4.7 8.6A4.7 4.7 0 0 1 12 16.3"/>',
  telegram: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7Z"/>'
}

const inner = computed(() => PATHS[props.name] || '')
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="sw"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="inner"
  />
</template>
