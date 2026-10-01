<script setup lang="ts">
/** Карточка каталога (.yc) — ягья или тур. */
defineProps<{
  glyph: string
  theme: string
  title: string
  deity?: string
  purpose: string
  date: string
  price: string
}>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button class="yc" @click="$emit('select')">
    <span class="tile"><AppIcon :name="glyph" /></span>
    <span class="bd">
      <span class="theme">{{ theme }}</span>
      <span class="nm">{{ title }}</span>
      <span v-if="deity" class="deity">Божество: {{ deity }}</span>
      <span class="purpose">{{ purpose }}</span>
      <span class="foot">
        <span class="date"><AppIcon name="date" />{{ date }}</span>
        <span class="price">{{ price }}</span>
      </span>
    </span>
  </button>
</template>
