<script setup lang="ts">
const { YAGYI, YAGYA_FILTERS, plural } = useCatalog()
const { openQuiz } = useQuiz()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: 'Ягьи',
  description: 'Ягья — древний огненный ритуал. Жрецы в Индии проводят его под ваш запрос в благоприятное для вас время.'
})

const validCats = YAGYA_FILTERS.map(f => f.cat)
const q = ref('')
const cat = ref('all')

// Инициализация и синхронизация фильтра с ?theme=
function syncFromQuery() {
  const t = String(route.query.theme || '')
  cat.value = validCats.includes(t) ? t : 'all'
}
syncFromQuery()
watch(() => route.query.theme, syncFromQuery)

function setCat(c: string) {
  cat.value = c
  router.replace({ query: c === 'all' ? {} : { theme: c } })
}

const items = computed(() => {
  const query = q.value.trim().toLowerCase()
  return YAGYI.filter((o) => {
    const okCat = cat.value === 'all' || o.cat === cat.value
    const okQ = !query || (`${o.n} ${o.god} ${o.p} ${o.cl}`).toLowerCase().includes(query)
    return okCat && okQ
  })
})

const countText = computed(() => `${items.value.length} ${plural(items.value.length, 'ягья', 'ягьи', 'ягий')}`)

// Счётчики на кнопках тем
const counts = computed(() => {
  const m: Record<string, number> = { all: YAGYI.length }
  for (const y of YAGYI) m[y.cat] = (m[y.cat] || 0) + 1
  return m
})

// Бегущая строка божеств (дважды — для бесшовной петли)
const gods = [...new Set(YAGYI.map(y => y.god))]

// Ягья — слово по буквам для анимации входа
const word = ['Я', 'г', 'ь', 'я']

const STEPS = [
  { t: 'Вы называете запрос', d: 'Выбираете тему в каталоге или проходите короткий опрос — подскажем, какая ягья подходит.' },
  { t: 'Жрецы проводят ритуал', d: 'В Индии, у живого огня, в благоприятное для вас время — по традиции, с мантрами и подношениями.' },
  { t: 'Эксперт на связи', d: 'Оставляете заявку, эксперт подтверждает дату и отвечает на ваши вопросы.' }
]

// Скользящий индикатор активной темы
const chipRefs = ref<HTMLElement[]>([])
const ind = reactive({ x: 0, w: 0, ready: false })
function moveIndicator() {
  const i = validCats.indexOf(cat.value)
  const el = chipRefs.value[i]
  if (!el) return
  ind.x = el.offsetLeft
  ind.w = el.offsetWidth
  ind.ready = true
}
onMounted(() => {
  moveIndicator()
  window.addEventListener('resize', moveIndicator)
  document.fonts?.ready.then(moveIndicator)
})
onBeforeUnmount(() => window.removeEventListener('resize', moveIndicator))
watch(cat, () => nextTick(moveIndicator))

// Линия между шагами прорисовывается, когда блок попадает в видимую область
const threadWrap = ref<HTMLElement | null>(null)
onMounted(() => {
  const n = threadWrap.value
  if (!n) return
  const io = new IntersectionObserver(([e]) => {
    if (!e?.isIntersecting) return
    n.classList.add('is-in')
    io.disconnect()
  }, { threshold: 0.35 })
  io.observe(n)
  onBeforeUnmount(() => io.disconnect())
})

function toCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="yg">
    <!-- ======== Первый экран: словарная статья ======== -->
    <header class="yg-hero">
      <InnerTop overlay />
      <img class="yg-hero-bg" src="/images/hero.jpg" alt="" aria-hidden="true">
      <div class="yg-hero-scrim" aria-hidden="true" />
      <div class="yg-yantra" data-par="0.05" aria-hidden="true">
        <AppOrnament name="mandala" />
      </div>
      <img class="yg-fire" src="/images/fire.png" alt="" aria-hidden="true">
      <EmberField :ox="0.5" :oy="0.8" :count="90" :spread="260" />

      <div class="yg-hero-in">
        <p class="yg-ety">
          <span class="yg-sa" lang="sa">यज्ञ</span>
          <span class="yg-ety-tx">yajña, санскрит — «служение огню, жертвоприношение»</span>
        </p>

        <h1 class="yg-word" aria-label="Ягья">
          <span
            v-for="(l, i) in word"
            :key="i"
            class="yg-letter"
            :style="{ '--i': i }"
            aria-hidden="true"
          >{{ l }}</span>
        </h1>

        <p class="yg-def">
          Древний обряд: жрец у живого огня читает мантры и подносит дары божеству.
          Обращаются к ягье, когда нужны деньги, здоровье, защита, любовь или ясность.
          Вы называете запрос — ритуал проводят в Индии в благоприятное для вас время.
        </p>

        <div class="yg-cta-row">
          <button class="yg-btn yg-btn-fire" @click="openQuiz()">
            <AppIcon name="spark" />Подобрать ягью
          </button>
          <button class="yg-btn yg-btn-ghost" @click="toCatalog">
            Смотреть каталог<AppIcon name="arrow" :sw="2" />
          </button>
        </div>
      </div>

      <div class="yg-marquee" aria-hidden="true">
        <div class="yg-marquee-track">
          <template v-for="n in 2" :key="n">
            <span v-for="g in gods" :key="g + n" class="yg-god">{{ g }}<i /></span>
          </template>
        </div>
      </div>
      <div class="yg-hero-fade" aria-hidden="true" />
    </header>

    <!-- ======== Как это работает ======== -->
    <section class="yg-how wrap" aria-labelledby="how-title">
      <h2 id="how-title" class="yg-h2" data-reveal>
        Как это работает
      </h2>
      <div ref="threadWrap" class="yg-thread-wrap">
        <svg class="yg-thread" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M0 20 C 150 -6, 260 46, 400 20 S 650 -6, 800 20 S 940 40, 1000 20" />
        </svg>
        <ol class="yg-steps" data-reveal-stagger>
          <li v-for="(s, i) in STEPS" :key="s.t" class="yg-step">
            <span class="yg-step-n">{{ i + 1 }}</span>
            <h3>{{ s.t }}</h3>
            <p>{{ s.d }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ======== Каталог ======== -->
    <section id="catalog" class="yg-catalog" aria-labelledby="cat-title">
      <div class="wrap">
        <div class="yg-cat-head">
          <h2 id="cat-title" class="yg-h2" data-reveal>
            Выберите, с чем нужна помощь
          </h2>
          <p data-reveal>
            Каждая ягья обращена к своему божеству и своей теме. Выберите тему — покажем подходящие обряды.
          </p>
        </div>

        <div class="yg-bar">
          <div class="yg-chips" role="tablist" aria-label="Тема ягьи">
            <span
              class="yg-ind"
              :class="{ ready: ind.ready }"
              :style="{ width: ind.w + 'px', transform: `translateX(${ind.x}px)` }"
              aria-hidden="true"
            />
            <button
              v-for="f in YAGYA_FILTERS"
              :key="f.cat"
              :ref="(el) => { if (el) chipRefs[validCats.indexOf(f.cat)] = el as HTMLElement }"
              role="tab"
              class="yg-chip"
              :class="{ on: cat === f.cat }"
              :aria-selected="cat === f.cat"
              @click="setCat(f.cat)"
            >
              <AppIcon v-if="f.cat !== 'all'" :name="f.cat" :sw="1.8" />
              {{ f.label }}
              <sup>{{ counts[f.cat] }}</sup>
            </button>
          </div>
          <div class="yg-search">
            <AppIcon name="search" :sw="1.8" />
            <input v-model="q" type="text" placeholder="Название, божество или цель" aria-label="Поиск ягий">
          </div>
        </div>

        <p class="yg-count" aria-live="polite">
          {{ countText }}
        </p>

        <TransitionGroup v-if="items.length" name="yg-list" tag="div" class="yg-grid">
          <YagyaCard
            v-for="(y, i) in items"
            :key="y.n"
            :index="i"
            :glyph="y.cat"
            :theme="y.cl"
            :title="y.n"
            :deity="y.god"
            :purpose="y.p"
            :date="y.d"
            :price="y.pr"
            @select="openQuiz(y.cat)"
          />
        </TransitionGroup>
        <div v-else class="yg-empty">
          Ничего не нашли. Измените запрос или выберите «Все».
        </div>
      </div>
    </section>

    <!-- ======== Финал: не знаете, что выбрать ======== -->
    <section class="yg-final" aria-labelledby="final-title">
      <img class="yg-final-fire" src="/images/fire.png" alt="" aria-hidden="true">
      <EmberField :ox="0.5" :oy="0.95" :count="46" :spread="180" />
      <div class="wrap yg-final-in" data-reveal>
        <h2 id="final-title">
          Не знаете, какая ягья вам нужна?
        </h2>
        <p>Ответьте на три вопроса — подберём ритуал и ближайшую дату.</p>
        <button class="yg-btn yg-btn-fire" @click="openQuiz()">
          <AppIcon name="spark" />Пройти опрос
        </button>
      </div>
    </section>
  </div>
</template>
