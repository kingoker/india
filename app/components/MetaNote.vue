<script setup lang="ts">
/**
 * Значок «i» рядом со ссылкой на Instagram: по наведению, фокусу или нажатию
 * показывает обязательную пометку о Meta. Работает и на тач-экранах (нажатие).
 */
const uid = useId()
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const shift = ref(0)

async function show() {
  open.value = true
  shift.value = 0
  await nextTick()
  // Не даём подсказке выйти за край экрана
  const r = pop.value?.getBoundingClientRect()
  if (!r) return
  const pad = 12
  if (r.left < pad) shift.value = pad - r.left
  else if (r.right > window.innerWidth - pad) shift.value = window.innerWidth - pad - r.right
}
function hide() {
  open.value = false
}
function toggle() {
  if (open.value) hide()
  else show()
}
function onDocClick(e: Event) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) hide()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') hide()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <span ref="root" class="metainfo" @mouseenter="show" @mouseleave="hide">
    <button
      type="button"
      class="metainfo-btn"
      aria-label="Пометка об Instagram"
      :aria-expanded="open"
      :aria-describedby="`${uid}-tip`"
      @click="toggle"
      @focus="show"
      @blur="hide"
    >
      i
    </button>
    <span
      :id="`${uid}-tip`"
      ref="pop"
      role="tooltip"
      class="metainfo-pop"
      :class="{ on: open }"
      :style="{ '--shift': `${shift}px` }"
    >
      Instagram принадлежит компании Meta — она признана в России экстремистской организацией, её деятельность в РФ запрещена.
    </span>
  </span>
</template>
