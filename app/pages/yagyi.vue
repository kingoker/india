<script setup lang="ts">
const { YAGYI, PRAKTIKI, YAGYA_FILTERS, plural } = useCatalog()
const { openQuiz, openSignup } = useQuiz()
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: 'Практики и ягьи',
  description: 'Практики вы проходите сами с наставником онлайн: медитация, мантры, камни, йога. Ягьи за вас проводят жрецы в Индии. Подбираем по вашей ведической карте.'
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

// Каталог — «альманах огня»: ягьи идут по ближайшей дате («5 окт» → ключ сортировки)
const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
function dateKey(d: string) {
  const [n, m = ''] = d.split(' ')
  const mi = MONTHS.indexOf(m.slice(0, 3))
  return mi < 0 ? 9999 : mi * 100 + Number(n)
}

const items = computed(() => {
  const query = q.value.trim().toLowerCase()
  return YAGYI.filter((o) => {
    const okCat = cat.value === 'all' || o.cat === cat.value
    const okQ = !query || (`${o.n} ${o.god} ${o.p} ${o.cl}`).toLowerCase().includes(query)
    return okCat && okQ
  }).sort((a, b) => dateKey(a.d) - dateKey(b.d))
})

const countText = computed(() => `${items.value.length} ${plural(items.value.length, 'ягья', 'ягьи', 'ягий')}, по ближайшей дате`)
const practicesCount = `${PRAKTIKI.length} ${plural(PRAKTIKI.length, 'практика', 'практики', 'практик')}`
const yagyiCount = `${YAGYI.length} ${plural(YAGYI.length, 'ягья', 'ягьи', 'ягий')}`

// Счётчики на кнопках тем
const counts = computed(() => {
  const m: Record<string, number> = { all: YAGYI.length }
  for (const y of YAGYI) m[y.cat] = (m[y.cat] || 0) + 1
  return m
})

/**
 * Две «арки» первого экрана: одинаковые строки, чтобы разницу было видно с одного взгляда.
 * Порядок строк в обеих арках совпадает — так их можно читать поперёк.
 */
const GATES = [
  {
    key: 'practice',
    to: 'practices',
    who: 'Делаете сами',
    title: 'Практики',
    rows: [
      { k: 'Кто делает', v: 'Вы, а наставник ведёт и поправляет' },
      { k: 'Как проходит', v: 'Онлайн, из дома — от одной встречи до 40 дней' },
      { k: 'Когда выбирать', v: 'Хотите сами изменить состояние, привычки, отношение к ситуации' }
    ],
    cta: 'Смотреть практики',
    count: practicesCount
  },
  {
    key: 'yagya',
    to: 'catalog',
    who: 'Делают за вас',
    title: 'Ягьи',
    rows: [
      { k: 'Кто делает', v: 'Жрецы в Индии, вам ехать не нужно' },
      { k: 'Как проходит', v: 'Огненный обряд в храме, в благоприятный для вас день' },
      { k: 'Когда выбирать', v: 'Нужна сильная поддержка: деньги, здоровье, защита, отношения' }
    ],
    cta: 'Смотреть ягьи',
    count: yagyiCount
  }
]

const PRACTICE_STEPS = [
  'Оставляете заявку на практику',
  'Знакомимся и смотрим вашу карту',
  'Занимаетесь онлайн, наставник на связи'
]

const YAGYA_STEPS = [
  'Выбираете ягью под свой запрос',
  'Эксперт подтверждает благоприятный день',
  'Жрецы проводят обряд в Индии'
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
  // С плиток тем на главной (?theme=) приходят за ягьями — сразу к каталогу
  if (route.query.theme) document.getElementById('catalog')?.scrollIntoView({ block: 'start' })
  moveIndicator()
  window.addEventListener('resize', moveIndicator)
  document.fonts?.ready.then(moveIndicator)
})
onBeforeUnmount(() => window.removeEventListener('resize', moveIndicator))
watch(cat, () => nextTick(moveIndicator))

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="yg">
    <!-- ======== Первый экран: развилка «сами / за вас» ======== -->
    <header class="yg-hero pg-hero">
      <InnerTop overlay />
      <img class="yg-hero-bg" src="/images/hero.jpg" alt="" aria-hidden="true">
      <div class="yg-hero-scrim pg-scrim" aria-hidden="true" />

      <div class="pg-hero-in">
        <h1 class="pg-title">
          Практики и ягьи
        </h1>
        <p class="pg-lead">
          Два способа работать с тем, что показала ваша карта. Выберите, что ближе.
        </p>

        <div class="pg-gates">
          <section
            v-for="(g, i) in GATES"
            :key="g.key"
            class="pg-gate"
            :class="{ 'pg-gate-yagya': g.key === 'yagya' }"
            :style="{ '--i': i }"
            :aria-labelledby="`gate-${g.key}`"
          >
            <p class="pg-gate-who">
              {{ g.who }}
            </p>
            <h2 :id="`gate-${g.key}`" class="pg-gate-title">
              {{ g.title }}
            </h2>
            <dl class="pg-gate-rows">
              <div v-for="r in g.rows" :key="r.k">
                <dt>{{ r.k }}</dt>
                <dd>{{ r.v }}</dd>
              </div>
            </dl>
            <button type="button" class="pg-gate-btn" @click="scrollToId(g.to)">
              {{ g.cta }}
              <small>{{ g.count }}</small>
            </button>
          </section>
        </div>

        <p class="pg-unsure">
          Не знаете, что подходит?
          <button type="button" @click="openQuiz()">
            Ответьте на 3 вопроса
          </button>
          — подскажем, с чего начать.
        </p>
      </div>
      <div class="yg-hero-fade" aria-hidden="true" />
    </header>

    <!-- ======== Практики ======== -->
    <section id="practices" class="pg-sec pg-practices" aria-labelledby="pr-title">
      <div class="wrap">
        <div class="pg-head">
          <h2 id="pr-title" class="yg-h2">
            Практики
          </h2>
          <p>
            Вы занимаетесь сами, наставник подбирает практику по карте и ведёт вас до результата.
            Всё проходит онлайн.
          </p>
        </div>

        <ol class="pg-steps" aria-label="Как проходит практика">
          <li v-for="(s, i) in PRACTICE_STEPS" :key="s">
            <span class="pg-step-n">{{ i + 1 }}</span>{{ s }}
          </li>
        </ol>

        <ul class="pg-list">
          <li v-for="p in PRAKTIKI" :key="p.n" class="pg-row" :data-theme="p.cat">
            <span class="pg-row-ic" aria-hidden="true"><AppIcon :name="p.cat" :sw="1.6" /></span>
            <div class="pg-row-name">
              <h3>{{ p.n }}</h3>
              <p>Ведёт {{ p.who }}</p>
            </div>
            <p class="pg-row-what">
              {{ p.p }}
            </p>
            <dl class="pg-row-meta">
              <div>
                <dt>Формат</dt>
                <dd>{{ p.fmt }}</dd>
              </div>
              <div>
                <dt>Длительность</dt>
                <dd>{{ p.dur }}</dd>
              </div>
              <div>
                <dt>Стоимость</dt>
                <dd>{{ p.pr }}</dd>
              </div>
            </dl>
            <button type="button" class="pg-row-btn" @click="openSignup('practice', p.n)">
              Записаться<span class="sr-only">: {{ p.n }}</span>
            </button>
          </li>
        </ul>
      </div>
    </section>

    <!-- ======== Ягьи: объяснение на «огненной» полосе ======== -->
    <section class="pg-fireband" aria-labelledby="cat-title">
      <div class="wrap pg-fire-in">
        <div class="pg-head pg-head-light">
          <h2 id="cat-title" class="yg-h2">
            Ягьи
          </h2>
          <p>
            Ягья — древний огненный обряд. Жрец у живого огня читает мантры и подносит дары божеству.
            Его проводят в Индии за вас — вы только выбираете тему.
          </p>
        </div>
        <ol class="pg-steps pg-steps-light" aria-label="Как проходит ягья">
          <li v-for="(s, i) in YAGYA_STEPS" :key="s">
            <span class="pg-step-n">{{ i + 1 }}</span>{{ s }}
          </li>
        </ol>
      </div>
    </section>

    <!-- ======== Каталог ягий ======== -->
    <section id="catalog" class="yg-catalog pg-catalog" aria-label="Каталог ягий">
      <div class="wrap">
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

        <TransitionGroup v-if="items.length" name="yg-list" tag="div" class="yg-ledger">
          <YagyaCard
            v-for="y in items"
            :key="y.n"
            :glyph="y.cat"
            :theme="y.cl"
            :title="y.n"
            :deity="y.god"
            :purpose="y.p"
            :date="y.d"
            :price="y.pr"
            @select="openSignup('yagya', y.n)"
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
      <div class="wrap yg-final-in" data-reveal>
        <h2 id="final-title">
          Не знаете, с чего начать?
        </h2>
        <p>Ответьте на три вопроса о вашем запросе — подскажем, что подойдёт: практика, ягья или сначала разбор карты.</p>
        <button class="yg-btn yg-btn-fire" @click="openQuiz()">
          <AppIcon name="spark" />Пройти опрос
        </button>
      </div>
    </section>
  </div>
</template>
