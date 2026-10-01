<script setup lang="ts">
/**
 * Тур-«билет» в каталоге: арка с фото (параллакс внутри рамки), печать с длительностью,
 * маршрут по остановкам, который прорисовывается при появлении в видимой области.
 */
const props = defineProps<{
  title: string
  region: string
  purpose: string
  days: string
  price: string
  route: string[]
  img: string
  pos: string
  index?: number
}>()
defineEmits<{ select: [] }>()

const el = ref<HTMLElement | null>(null)

// «10 дней» → число и единица; «10 дней — описание» → просто описание
const dur = computed(() => {
  const [n, ...rest] = props.days.split(' ')
  return { n, unit: rest.join(' ') }
})
const lead = computed(() => {
  const t = props.purpose.replace(/^\d+\s+дн\S*\s+—\s+/, '')
  return t.charAt(0).toUpperCase() + t.slice(1)
})

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
  }, { threshold: 0.2 })
  io.observe(n)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <article ref="el" class="tr-tour" @pointermove="track">
    <span class="tr-tour-glow" aria-hidden="true" />

    <div class="tr-tour-media" data-par="0.07">
      <div class="tr-arch">
        <img :src="img" :style="{ objectPosition: pos }" alt="" loading="lazy">
        <span class="tr-arch-tint" aria-hidden="true" />
      </div>
      <span class="tr-seal" aria-label="Длительность">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" />
          <circle cx="50" cy="50" r="40" />
        </svg>
        <b>{{ dur.n }}</b>
        <small>{{ dur.unit }}</small>
      </span>
    </div>

    <div class="tr-tour-body">
      <span class="tr-tour-region">{{ region }}</span>
      <h3 class="tr-tour-name">
        {{ title }}
      </h3>
      <p class="tr-tour-lead">
        {{ lead }}
      </p>

      <ol class="tr-stops" aria-label="Маршрут">
        <li v-for="(s, i) in route" :key="s" :style="{ '--k': i }">
          <i aria-hidden="true" />{{ s }}
        </li>
      </ol>

      <div class="tr-tour-foot">
        <div class="tr-tour-price">
          <small>стоимость</small>
          <b>{{ price }}</b>
        </div>
        <button class="yg-btn yg-btn-fire tr-book" @click="$emit('select')">
          Забронировать место<AppIcon name="arrow" :sw="2" />
        </button>
      </div>
    </div>
  </article>
</template>
