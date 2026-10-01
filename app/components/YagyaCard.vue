<script setup lang="ts">
/** Карточка ягьи в каталоге: свой оттенок темы, подсветка за курсором, вход по появлению в видимой области. */
defineProps<{
  glyph: string
  theme: string
  title: string
  deity: string
  purpose: string
  date: string
  price: string
  index?: number
}>()
defineEmits<{ select: [] }>()

const el = ref<HTMLElement | null>(null)

function track(e: PointerEvent) {
  const n = el.value
  if (!n) return
  const r = n.getBoundingClientRect()
  n.style.setProperty('--mx', `${e.clientX - r.left}px`)
  n.style.setProperty('--my', `${e.clientY - r.top}px`)
}

onMounted(() => {
  const n = el.value
  if (!n) return
  const io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    n.classList.add('in')
    io.disconnect()
  }, { threshold: 0.15 })
  io.observe(n)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <button
    ref="el"
    class="yg-card"
    :data-theme="glyph"
    :style="{ '--i': (index || 0) % 3 }"
    @pointermove="track"
    @click="$emit('select')"
  >
    <span class="yg-card-glow" aria-hidden="true" />
    <span class="yg-card-top">
      <span class="yg-card-sigil">
        <svg class="yg-card-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="38" />
        </svg>
        <AppIcon :name="glyph" :sw="1.5" />
      </span>
      <span class="yg-card-date">
        <small>ближайшая</small>
        <b>{{ date }}</b>
      </span>
    </span>
    <span class="yg-card-body">
      <span class="yg-card-theme">{{ theme }}</span>
      <span class="yg-card-name">{{ title }}</span>
      <span class="yg-card-deity">Божество: {{ deity }}</span>
      <span class="yg-card-purpose">{{ purpose }}</span>
    </span>
    <span class="yg-card-foot">
      <span class="yg-card-price">{{ price }}</span>
      <span class="yg-card-go">Записаться<AppIcon name="arrow" :sw="2" /></span>
    </span>
  </button>
</template>
