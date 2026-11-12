<script setup lang="ts">
/**
 * Тур-«билет» в каталоге: арка с фото (параллакс внутри рамки), печать с длительностью,
 * маршрут по остановкам, который прорисовывается при появлении в видимой области.
 * На карточке — фото, название и маршрут; описание и программа открываются в окне «Подробнее».
 */
import type { Tour } from '~/composables/useCatalog'

const props = defineProps<{ tour: Tour, index?: number }>()
defineEmits<{ select: [], more: [] }>()

const { TOUR_STATUS } = useCatalog()
const status = computed(() => TOUR_STATUS[props.tour.status])

const el = ref<HTMLElement | null>(null)

// «10 дней» → число и единица; пусто — длительность ещё не утверждена, печать не ставим
const dur = computed(() => {
  const [n, ...rest] = props.tour.d.split(' ')
  return { n, unit: rest.join(' ') }
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
      <button class="tr-arch" :aria-label="`Подробнее: ${tour.n}`" @click="$emit('more')">
        <img :src="tour.img" :style="{ objectPosition: tour.pos }" alt="" loading="lazy">
        <span class="tr-arch-tint" aria-hidden="true" />
      </button>
      <span v-if="tour.d" class="tr-seal" :class="{ long: (dur.n?.length || 0) > 2 }" aria-label="Длительность">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" />
          <circle cx="50" cy="50" r="40" />
        </svg>
        <b>{{ dur.n }}</b>
        <small>{{ dur.unit }}</small>
      </span>
    </div>

    <div class="tr-tour-body">
      <span class="tr-tour-status" :data-status="tour.status">{{ status.label }}</span>
      <h3 class="tr-tour-name">
        {{ tour.n }}
      </h3>
      <p class="tr-tour-sub">
        {{ tour.sub }}
      </p>

      <ol class="tr-stops" aria-label="Маршрут">
        <li v-for="(s, i) in tour.route" :key="s" :style="{ '--k': i }">
          <i aria-hidden="true" />{{ s }}
        </li>
      </ol>

      <div class="tr-tour-foot">
        <div class="tr-tour-price">
          <small>стоимость</small>
          <b>{{ tour.pr }}</b>
        </div>
        <div class="tr-tour-acts">
          <button class="tr-more" @click="$emit('more')">
            Подробнее
          </button>
          <button class="yg-btn yg-btn-fire tr-book" @click="$emit('select')">
            {{ status.cta }}<AppIcon name="arrow" :sw="2" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
