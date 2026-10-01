<script setup lang="ts">
/** Абзац юридического текста: подставляет реквизиты, рисует ссылки и заметные заглушки. */
const props = defineProps<{ text: string }>()
const op = useOperator()
const parts = computed(() => richParts(props.text, op))
const isExternal = (href: string) => /^https?:/.test(href)
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <a v-if="part.href && isExternal(part.href)" :href="part.href" target="_blank" rel="noopener">{{ part.t }}</a>
    <NuxtLink v-else-if="part.href" :to="part.href">{{ part.t }}</NuxtLink>
    <span v-else-if="part.todo" class="todo">{{ part.t }}</span>
    <template v-else>
      {{ part.t }}
    </template>
  </template>
</template>
