<script setup lang="ts">
/**
 * Строка «альманаха огня» в каталоге ягий: слева дата ближайшего обряда крупно,
 * дальше — название, назначение, тема и запись. Вся строка — одна кнопка.
 */
const props = defineProps<{
  glyph: string
  theme: string
  title: string
  deity: string
  purpose: string
  date: string
  price: string
}>()
defineEmits<{ select: [] }>()

// «5 окт» → число крупно, месяц подписью
const day = computed(() => props.date.split(' ')[0] || props.date)
const month = computed(() => props.date.split(' ').slice(1).join(' '))
</script>

<template>
  <button type="button" class="yg-entry" :data-theme="glyph" @click="$emit('select')">
    <span class="yg-entry-date">
      <small class="sr-only">Ближайшая дата:</small>
      <b>{{ day }}</b>
      <small>{{ month }}</small>
    </span>
    <span class="yg-entry-main">
      <span class="yg-entry-name">{{ title }}</span>
      <span class="yg-entry-deity">Божество: {{ deity }}</span>
    </span>
    <span class="yg-entry-purpose">{{ purpose }}</span>
    <span class="yg-entry-theme"><AppIcon :name="glyph" :sw="1.6" />{{ theme }}</span>
    <span class="yg-entry-end">
      <span class="yg-entry-price">{{ price }}</span>
      <span class="yg-entry-go">Записаться</span>
    </span>
  </button>
</template>
