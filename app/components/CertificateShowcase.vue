<script setup lang="ts">
/**
 * «Витрина документов»: тёмная панель с одним документом на паспарту,
 * список справа (на мобильном — лента), полноэкранный просмотр с зумом.
 * Данные — useCertificates (форма совпадает с будущей таблицей БД).
 */
const { certificates, certSrc } = useCertificates()
const total = certificates.length

const current = ref(0)
const active = computed(() => certificates[current.value]!)
const listEl = ref<HTMLElement | null>(null)

const reduceMotion = () => import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function go(i: number) {
  current.value = (i + total) % total
}
const next = () => go(current.value + 1)
const prev = () => go(current.value - 1)

// На мобильном список — горизонтальная лента: держим активный документ по центру
watch(current, async () => {
  await nextTick()
  const ul = listEl.value
  if (!ul || ul.scrollWidth <= ul.clientWidth) return
  const el = ul.children[current.value] as HTMLElement
  ul.scrollTo({ left: el.offsetLeft - (ul.clientWidth - el.offsetWidth) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' })
})

// --- Свайп (сцена и лайтбокс в режиме «вписано») ---
let sx = 0
let sy = 0
function swipeStart(e: TouchEvent) {
  if (e.touches.length !== 1) return
  sx = e.touches[0]!.clientX
  sy = e.touches[0]!.clientY
}
function swipeEnd(e: TouchEvent) {
  if (zoomed.value) return
  const t = e.changedTouches[0]
  if (!t) return
  const dx = t.clientX - sx
  const dy = t.clientY - sy
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)()
}

// --- Лайтбокс ---
const lbOpen = ref(false)
const zoomed = ref(false)
const viewEl = ref<HTMLElement | null>(null)
const dialogEl = ref<HTMLElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)
let opener: HTMLElement | null = null

/** Во сколько раз увеличиваем относительно натурального размера файла */
const ZOOM_PX = 1.6
const zoomWidth = computed(() => `${Math.round(active.value.width * ZOOM_PX)}px`)

function openLb() {
  opener = document.activeElement as HTMLElement | null
  zoomed.value = false
  lbOpen.value = true
}
function closeLb() {
  lbOpen.value = false
  zoomed.value = false
}

watch(lbOpen, async (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) {
    await nextTick()
    closeBtn.value?.focus()
  } else {
    opener?.focus()
  }
})
watch(current, () => {
  zoomed.value = false
  viewEl.value?.scrollTo(0, 0)
})

function toggleZoom(point?: { x: number, y: number }) {
  const view = viewEl.value
  const img = view?.querySelector('img')
  if (!view || !img) return
  if (zoomed.value) {
    zoomed.value = false
    return
  }
  const r = img.getBoundingClientRect()
  const rx = point ? (point.x - r.left) / r.width : 0.5
  const ry = point ? (point.y - r.top) / r.height : 0.5
  zoomed.value = true
  nextTick(() => {
    const big = view.querySelector('img')!
    view.scrollLeft = rx * big.offsetWidth - view.clientWidth / 2
    view.scrollTop = ry * big.offsetHeight - view.clientHeight / 2
  })
}

// Перетаскивание мышью в увеличенном виде (на тач работает родной скролл)
let drag: { x: number, y: number, sl: number, st: number } | null = null
let dragMoved = false
function onPointerDown(e: PointerEvent) {
  const view = viewEl.value
  if (!zoomed.value || !view || e.pointerType === 'touch') return
  drag = { x: e.clientX, y: e.clientY, sl: view.scrollLeft, st: view.scrollTop }
  dragMoved = false
  view.setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  const view = viewEl.value
  if (!drag || !view) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true
  view.scrollLeft = drag.sl - dx
  view.scrollTop = drag.st - dy
}
function onPointerUp() {
  drag = null
  setTimeout(() => (dragMoved = false), 0)
}
function onViewClick(e: MouseEvent) {
  if (dragMoved) return
  const onImg = (e.target as HTMLElement).tagName === 'IMG'
  if (zoomed.value || onImg) toggleZoom({ x: e.clientX, y: e.clientY })
}

function onKey(e: KeyboardEvent) {
  if (!lbOpen.value) return
  if (e.key === 'Escape') closeLb()
  else if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === '+' || e.key === '=' || e.key === '-') toggleZoom()
  else if (e.key === 'Tab' && dialogEl.value) {
    // Фокус не уходит за пределы окна
    const items = [...dialogEl.value.querySelectorAll<HTMLElement>('button')]
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
}

function onStageKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') next()
  else if (e.key === 'ArrowLeft') prev()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="certs" aria-labelledby="certs-title">
    <header class="certs-head" data-reveal>
      <h2 id="certs-title">
        Дипломы и сертификаты
      </h2>
      <p>Документы Александры об обучении. Выберите любой и рассмотрите печать и подпись вблизи.</p>
    </header>

    <div class="certs-board" data-reveal>
      <div class="certs-main">
        <div
          class="certs-stage"
          role="group"
          aria-roledescription="галерея"
          aria-label="Документы об обучении"
          tabindex="0"
          @keydown="onStageKey"
          @touchstart.passive="swipeStart"
          @touchend.passive="swipeEnd"
        >
          <button
            type="button"
            class="stage-open"
            aria-haspopup="dialog"
            :aria-label="`Открыть на весь экран: ${active.title}`"
            @click="openLb"
          >
            <span class="mat">
              <span class="mat-in">
                <img
                  v-for="(c, i) in certificates"
                  :key="c.id"
                  class="mat-img"
                  :class="{ on: i === current }"
                  :src="certSrc(c)"
                  :alt="i === current ? c.alt : ''"
                  :width="c.width"
                  :height="c.height"
                  :loading="i === 0 ? 'eager' : 'lazy'"
                  decoding="async"
                >
              </span>
            </span>
            <span class="stage-zoom" aria-hidden="true">
              <AppIcon name="search" :sw="2" /> Рассмотреть
            </span>
          </button>
        </div>

        <div class="certs-cap">
          <div class="cap-nav">
            <button type="button" class="cap-btn" aria-label="Предыдущий документ" @click="prev">
              <AppIcon name="back" :sw="2" />
            </button>
            <span class="cap-count" aria-live="polite">{{ current + 1 }} из {{ total }}</span>
            <button type="button" class="cap-btn cap-btn-next" aria-label="Следующий документ" @click="next">
              <AppIcon name="back" :sw="2" />
            </button>
          </div>
          <div class="cap-body" aria-live="polite">
            <h3 :key="active.id">
              {{ active.title }}
            </h3>
            <p class="cap-issuer">
              {{ active.issuer }}
            </p>
            <p class="cap-note">
              {{ active.note }}
            </p>
            <div v-if="active.year || active.hours" class="cap-chips">
              <span v-if="active.year">{{ active.year }} год</span>
              <span v-if="active.hours">{{ active.hours }}</span>
            </div>
          </div>
        </div>
      </div>

      <ul ref="listEl" class="certs-list" aria-label="Все документы">
        <li v-for="(c, i) in certificates" :key="c.id">
          <button
            type="button"
            class="cert-item"
            :class="{ on: i === current }"
            :aria-current="i === current ? 'true' : undefined"
            @click="go(i)"
          >
            <span class="cert-thumb">
              <img :src="certSrc(c)" alt="" loading="lazy" decoding="async" :width="c.width" :height="c.height">
            </span>
            <span class="cert-txt">
              <span class="cert-title">{{ c.title }}</span>
              <span v-if="c.year || c.hours" class="cert-meta">
                <span v-if="c.year">{{ c.year }}</span>
                <span v-if="c.hours">{{ c.hours }}</span>
              </span>
            </span>
          </button>
        </li>
      </ul>
    </div>

    <Teleport to="body">
      <div v-if="lbOpen" class="clb" data-lenis-prevent @click.self="closeLb">
        <div ref="dialogEl" class="clb-dialog" role="dialog" aria-modal="true" aria-label="Просмотр документа">
          <div class="clb-top">
            <div class="clb-title">
              <strong>{{ active.title }}</strong>
              <span>{{ active.issuer }}</span>
            </div>
            <div class="clb-tools">
              <button type="button" class="clb-btn" :aria-pressed="zoomed" @click="toggleZoom()">
                <AppIcon name="search" :sw="2" />
                <span>{{ zoomed ? 'Уменьшить' : 'Увеличить' }}</span>
              </button>
              <button ref="closeBtn" type="button" class="clb-btn clb-close" aria-label="Закрыть" @click="closeLb">
                <AppIcon name="close" :sw="2" />
              </button>
            </div>
          </div>

          <div
            ref="viewEl"
            class="clb-view"
            :class="{ zoomed }"
            @click="onViewClick"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @touchstart.passive="swipeStart"
            @touchend.passive="swipeEnd"
          >
            <img
              :key="active.id"
              class="clb-img"
              :src="certSrc(active)"
              :alt="active.alt"
              :style="zoomed ? { width: zoomWidth } : undefined"
              draggable="false"
            >
          </div>

          <button type="button" class="clb-arrow clb-prev" aria-label="Предыдущий документ" @click="prev">
            <AppIcon name="back" :sw="2" />
          </button>
          <button type="button" class="clb-arrow clb-next" aria-label="Следующий документ" @click="next">
            <AppIcon name="back" :sw="2" />
          </button>

          <div class="clb-rail">
            <button
              v-for="(c, i) in certificates"
              :key="c.id"
              type="button"
              class="clb-thumb"
              :class="{ on: i === current }"
              :aria-label="c.title"
              :aria-current="i === current ? 'true' : undefined"
              @click="go(i)"
            >
              <img :src="certSrc(c)" alt="" loading="lazy" decoding="async">
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
