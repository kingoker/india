<script setup lang="ts">
const { TURY, TOUR_FILTERS, plural } = useCatalog()
const { openQuiz } = useQuiz()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: 'Туры в Индию',
  description: 'Паломнические туры в Индию: храмы, живой огонь и практика вживую небольшой группой, с наставниками на всём пути.'
})

const validCats = TOUR_FILTERS.map(f => f.cat)
const q = ref('')
const cat = ref('all')

// Фильтр живёт в адресе (?region=), чтобы им можно было поделиться
function syncFromQuery() {
  const t = String(route.query.region || '')
  cat.value = validCats.includes(t) ? t : 'all'
}
syncFromQuery()
watch(() => route.query.region, syncFromQuery)

function setCat(c: string) {
  cat.value = c
  router.replace({ query: c === 'all' ? {} : { region: c } })
}

const items = computed(() => {
  const query = q.value.trim().toLowerCase()
  return TURY.filter((o) => {
    const okCat = cat.value === 'all' || o.cat === cat.value
    const okQ = !query || (`${o.n} ${o.p} ${o.cl} ${o.route.join(' ')}`).toLowerCase().includes(query)
    return okCat && okQ
  })
})

const countText = computed(() => `${items.value.length} ${plural(items.value.length, 'тур', 'тура', 'туров')}`)

const counts = computed(() => {
  const m: Record<string, number> = { all: TURY.length }
  for (const t of TURY) m[t.cat] = (m[t.cat] || 0) + 1
  return m
})

// Что получает путешественник — коротко и по делу
const FACTS = [
  { icon: 'flame', t: 'Участвуете сами', d: 'Ягьи, пуджи и медитации у живого огня — не со стороны, а внутри обряда.' },
  { icon: 'user', t: 'Наставники рядом', d: 'Эксперты объясняют, что и зачем происходит, и ведут вас весь путь.' },
  { icon: 'globe', t: 'Небольшая группа', d: 'Без туристических толп: храмы, дорога и жильё организованы за вас.' }
]

// Маршрут на первом экране: узлы лежат на кривой в системе 1200×520
const PINS = [
  { name: 'Мадурай', x: 70, y: 430, at: 0 },
  { name: 'Тируваннамалай', x: 400, y: 345, at: 0.3 },
  { name: 'Варанаси', x: 760, y: 215, at: 0.64 },
  { name: 'Ришикеш', x: 1110, y: 85, at: 1 }
]

// Индикатор активного региона
const chipRefs = ref<HTMLElement[]>([])
const ind = reactive({ x: 0, w: 0, ready: false })
function moveIndicator() {
  const el = chipRefs.value[validCats.indexOf(cat.value)]
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

function toCatalog() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="yg tr">
    <!-- ======== Первый экран: что это за поездка ======== -->
    <header class="tr-hero">
      <InnerTop overlay />
      <div class="tr-hero-bg" data-par="0.1" aria-hidden="true">
        <img src="/images/tour.jpg" alt="">
      </div>
      <div class="tr-hero-scrim" aria-hidden="true" />
      <div class="tr-sun" aria-hidden="true" />
      <EmberField :ox="0.74" :oy="0.62" :count="38" :spread="320" />

      <div class="wrap tr-hero-in">
        <h1 class="tr-h1" aria-label="Паломнические туры в Индию">
          <span class="tr-line" aria-hidden="true"><span style="--i: 0">Паломнические</span></span>
          <span class="tr-line" aria-hidden="true"><span style="--i: 1">туры в Индию</span></span>
        </h1>
        <p class="tr-def">
          Вы едете не смотреть храмы, а участвовать: сидеть у живого огня, проводить пуджи и практиковать рядом с наставниками.
          Для тех, кто давно хочет в Индию, но не хочет ехать один.
        </p>
        <div class="tr-cta">
          <button class="yg-btn yg-btn-fire" @click="openQuiz()">
            <AppIcon name="spark" />Подобрать тур
          </button>
          <button class="yg-btn yg-btn-ghost" @click="toCatalog">
            Смотреть маршруты<AppIcon name="arrow" :sw="2" />
          </button>
        </div>
      </div>

      <!-- Золотой маршрут через всю страну: рисуется на загрузке -->
      <div class="tr-map" aria-hidden="true">
        <svg viewBox="0 0 1200 520">
          <defs>
            <linearGradient id="trg" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="#F3D98E" stop-opacity=".25" />
              <stop offset=".5" stop-color="#F3D98E" />
              <stop offset="1" stop-color="#FFF3CF" />
            </linearGradient>
          </defs>
          <path
            id="tr-path"
            class="tr-path-glow"
            pathLength="1"
            d="M70 430 C 190 430, 280 352, 400 345 S 640 262, 760 215 S 990 110, 1110 85"
          />
          <path
            class="tr-path"
            pathLength="1"
            d="M70 430 C 190 430, 280 352, 400 345 S 640 262, 760 215 S 990 110, 1110 85"
          />
          <circle class="tr-walker" r="7">
            <animateMotion dur="9s" begin="5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
              <mpath href="#tr-path" />
            </animateMotion>
          </circle>
        </svg>
        <span
          v-for="(p, i) in PINS"
          :key="p.name"
          class="tr-pin"
          :class="{ end: i === PINS.length - 1 }"
          :style="{ 'left': `${p.x / 12}%`, 'top': `${p.y / 5.2}%`, '--d': `${1.5 + p.at * 3.3}s` }"
        >
          <i /><em>{{ p.name }}</em>
        </span>
      </div>

      <ul class="tr-facts wrap">
        <li v-for="f in FACTS" :key="f.t">
          <span class="tr-fact-ic"><AppIcon :name="f.icon" :sw="1.6" /></span>
          <span><b>{{ f.t }}</b>{{ f.d }}</span>
        </li>
      </ul>
      <div class="yg-hero-fade" aria-hidden="true" />
    </header>

    <!-- ======== Каталог маршрутов ======== -->
    <section id="catalog" class="yg-catalog" aria-labelledby="tours-title">
      <div class="wrap">
        <div class="yg-cat-head">
          <h2 id="tours-title" class="yg-h2" data-reveal>
            Выберите маршрут
          </h2>
          <p data-reveal>
            Каждый тур — отдельная дорога по местам силы. Выберите регион или найдите город, который давно хотите увидеть.
          </p>
        </div>

        <div class="yg-bar">
          <div class="yg-chips" role="tablist" aria-label="Регион">
            <span
              class="yg-ind"
              :class="{ ready: ind.ready }"
              :style="{ width: ind.w + 'px', transform: `translateX(${ind.x}px)` }"
              aria-hidden="true"
            />
            <button
              v-for="f in TOUR_FILTERS"
              :key="f.cat"
              :ref="(el) => { if (el) chipRefs[validCats.indexOf(f.cat)] = el as HTMLElement }"
              role="tab"
              class="yg-chip"
              :class="{ on: cat === f.cat }"
              :aria-selected="cat === f.cat"
              @click="setCat(f.cat)"
            >
              {{ f.label }}
              <sup>{{ counts[f.cat] }}</sup>
            </button>
          </div>
          <div class="yg-search">
            <AppIcon name="search" :sw="1.8" />
            <input v-model="q" type="text" placeholder="Город или программа" aria-label="Поиск туров">
          </div>
        </div>

        <p class="yg-count" aria-live="polite">
          {{ countText }}
        </p>

        <TransitionGroup v-if="items.length" name="tr-list" tag="div" class="tr-list">
          <TourCard
            v-for="(t, i) in items"
            :key="t.n"
            :index="i"
            :title="t.n"
            :region="t.cl"
            :purpose="t.p"
            :days="t.d"
            :price="t.pr"
            :route="t.route"
            :img="t.img"
            :pos="t.pos"
            @select="openQuiz()"
          />
        </TransitionGroup>
        <div v-else class="yg-empty">
          Ничего не нашли. Измените запрос или выберите «Все».
        </div>
      </div>
    </section>

    <!-- ======== Финал ======== -->
    <section class="yg-final" aria-labelledby="tr-final-title">
      <img class="yg-final-fire" src="/images/fire.png" alt="" aria-hidden="true">
      <EmberField :ox="0.5" :oy="0.95" :count="46" :spread="180" />
      <div class="wrap yg-final-in" data-reveal>
        <h2 id="tr-final-title">
          Не знаете, какой тур вам подойдёт?
        </h2>
        <p>Ответьте на три вопроса — подскажем маршрут и ближайший выезд.</p>
        <button class="yg-btn yg-btn-fire" @click="openQuiz()">
          <AppIcon name="spark" />Пройти опрос
        </button>
      </div>
    </section>
  </div>
</template>
