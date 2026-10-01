<script setup lang="ts">
/** Звёзды-рейтинг. Просмотр (value) или ввод (interactive → emit update). */
const props = withDefaults(defineProps<{
  value: number
  interactive?: boolean
  size?: number
}>(), { interactive: false, size: 20 })

const emit = defineEmits<{ 'update:value': [n: number] }>()

const hover = ref(0)
const stars = [1, 2, 3, 4, 5]

const shown = computed(() => (props.interactive && hover.value ? hover.value : props.value))
const label = computed(() => `${props.value} из 5`)

function pick(n: number) {
  if (props.interactive) emit('update:value', n)
}
</script>

<template>
  <div
    class="stars"
    :class="{ interactive }"
    :role="interactive ? 'radiogroup' : 'img'"
    :aria-label="interactive ? 'Оценка' : `Оценка ${label}`"
  >
    <component
      :is="interactive ? 'button' : 'span'"
      v-for="n in stars"
      :key="n"
      class="star"
      :class="{ on: n <= shown }"
      :type="interactive ? 'button' : undefined"
      :aria-label="interactive ? `${n} из 5` : undefined"
      :aria-checked="interactive ? (n === value) : undefined"
      :role="interactive ? 'radio' : undefined"
      @click="pick(n)"
      @mouseenter="interactive && (hover = n)"
      @mouseleave="interactive && (hover = 0)"
      @focus="interactive && (hover = n)"
      @blur="interactive && (hover = 0)"
    >
      <svg :width="size" :height="size" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3.1l2.65 5.98 6.5.57-4.92 4.3 1.47 6.37L12 17.9l-5.7 3.42 1.47-6.37-4.92-4.3 6.5-.57L12 3.1Z" />
      </svg>
    </component>
  </div>
</template>
