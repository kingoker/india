<script setup lang="ts">
const config = useRuntimeConfig()
const { openQuiz } = useQuiz()

useSeoMeta({
  title: 'О нас',
  description: 'Татьяна и Александра — практикующие в ведической традиции. Читаем вашу карту и ведём по ней — от первого вопроса до поездки к истокам.'
})

/* ---------- Данные страницы ---------- */

/** Планеты в домах учебной карты (русские сокращения принятые в джйотиш) */
const CHART_PLANETS = [
  { house: 1, x: 200, y: 96, t: 'Ча' },
  { house: 2, x: 110, y: 44, t: 'Ма' },
  { house: 4, x: 92, y: 200, t: 'Су Бу' },
  { house: 7, x: 200, y: 316, t: 'Гу' },
  { house: 9, x: 350, y: 286, t: 'Ке' },
  { house: 10, x: 308, y: 200, t: 'Шу' },
  { house: 11, x: 350, y: 112, t: 'Са' },
  { house: 3, x: 50, y: 118, t: 'Ра' }
]
const HOUSE_NUMS = [
  { n: 1, x: 200, y: 52 }, { n: 2, x: 110, y: 28 }, { n: 3, x: 28, y: 110 },
  { n: 4, x: 52, y: 200 }, { n: 5, x: 28, y: 290 }, { n: 6, x: 110, y: 372 },
  { n: 7, x: 200, y: 348 }, { n: 8, x: 290, y: 372 }, { n: 9, x: 372, y: 290 },
  { n: 10, x: 348, y: 200 }, { n: 11, x: 372, y: 110 }, { n: 12, x: 290, y: 28 }
]

/** Слова, с которых всё начинается — объясняют, чем мы занимаемся */
const WORDS = [
  { w: 'Джйотиш', d: 'ведическая астрология, «наука о свете»' },
  { w: 'Кундали', d: 'ваша натальная карта' },
  { w: 'Ягья', d: 'огненный обряд' },
  { w: 'Тиртха', d: 'место силы' },
  { w: 'Аюрведа', d: 'знание о жизни' }
]

const STEPS = [
  {
    n: '1',
    title: 'Разбор карты',
    text: 'Видите свою природу, сильные стороны и периоды жизни. Появляются точки опоры и ясный вопрос, с которым стоит работать.',
    cta: 'Записаться на разбор',
    action: 'quiz'
  },
  {
    n: '2',
    title: 'Ягьи и практики',
    text: 'Огненные обряды под ваш запрос — деньги, здоровье, отношения, защита. Практики подбираются по карте, а не наугад.',
    cta: 'Выбрать ягью',
    to: '/yagyi'
  },
  {
    n: '3',
    title: 'Поездка в Индию',
    text: 'Едем вместе в места силы и к наставникам, где практика становится живым опытом, а не прочитанной книгой.',
    cta: 'Смотреть туры',
    to: '/tury'
  }
]

const GUIDES = [
  {
    key: 'tatyana',
    name: 'Татьяна Карпенкова',
    first: 'Татьяна',
    last: 'Карпенкова',
    img: '/images/expert-1.webp',
    tags: ['Кундалини-йога', 'Аюрведа', 'Астрология'],
    bio: 'Мягко веду в практику: через тело, ритм и осознанную еду помогаю прийти к внутренней тишине. А через астрологию — увидеть свою природу и найти точки опоры.'
  },
  {
    key: 'alexandra',
    name: 'Александра Андреева',
    first: 'Александра',
    last: 'Андреева',
    img: '/images/expert-2.webp',
    tags: ['Смрити-медитация', 'Интегральный психолог', 'Джйотиш'],
    bio: 'Помогаю трансформировать сознание — работаю с подсознательными причинами, чтобы перемены были устойчивыми, а не на время.',
    docs: true
  }
]

/** Звёзды неба: фиксированный генератор — одинаково на сервере и клиенте */
const STARS = (() => {
  let s = 7
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  return Array.from({ length: 64 }, () => ({
    x: +(rnd() * 100).toFixed(2),
    y: +(rnd() * 100).toFixed(2),
    r: +(0.8 + rnd() * 1.6).toFixed(1),
    d: +(rnd() * 6).toFixed(2),
    t: +(2.6 + rnd() * 3.6).toFixed(1)
  }))
})()

/* ---------- Движение ---------- */

const root = ref<HTMLElement | null>(null)
const hero = ref<HTMLElement | null>(null)
const path = ref<HTMLElement | null>(null)

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
}

const cleanups: Array<() => void> = []

onMounted(() => {
  const el = root.value
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  el.classList.add('ab-js')

  // 1. Появление блоков при входе в вид
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      e.target.classList.add('on')
      io.unobserve(e.target)
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' })
  el.querySelectorAll('[data-ab]').forEach(n => io.observe(n))
  cleanups.push(() => io.disconnect())

  // 2. Линия пути прорисовывается вместе со скроллом
  const pathEl = path.value
  let ticking = false
  function updatePath() {
    ticking = false
    if (!pathEl) return
    const r = pathEl.getBoundingClientRect()
    const vh = window.innerHeight
    const p = Math.min(1, Math.max(0, (vh * 0.78 - r.top) / (r.height * 0.92)))
    pathEl.style.setProperty('--p', p.toFixed(3))
    pathEl.querySelectorAll('.ab-step').forEach((s, i) => {
      s.classList.toggle('lit', p > 0.08 + i * 0.36)
    })
  }
  function onScroll() {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(updatePath)
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  updatePath()
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })

  // 3. Мягкий параллакс сцены от курсора (только мышь)
  const h = hero.value
  if (h && window.matchMedia('(pointer: fine)').matches) {
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0
    let inView = true
    const loop = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      h.style.setProperty('--mx', cx.toFixed(3))
      h.style.setProperty('--my', cy.toFixed(3))
      raf = inView ? requestAnimationFrame(loop) : 0
    }
    const onMove = (e: PointerEvent) => {
      const r = h.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }
    const vis = new IntersectionObserver(([e]) => {
      inView = !!e?.isIntersecting
      if (inView && !raf) raf = requestAnimationFrame(loop)
    })
    vis.observe(h)
    h.addEventListener('pointermove', onMove)
    h.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(loop)
    cleanups.push(() => {
      cancelAnimationFrame(raf)
      vis.disconnect()
      h.removeEventListener('pointermove', onMove)
      h.removeEventListener('pointerleave', onLeave)
    })
  }
})

onBeforeUnmount(() => cleanups.forEach(fn => fn()))
</script>

<template>
  <div ref="root" class="inner about">
    <InnerTop />

    <!-- ===================== HERO ===================== -->
    <header ref="hero" class="ab-hero">
      <div class="ab-sky" aria-hidden="true">
        <span
          v-for="(s, i) in STARS"
          :key="i"
          class="ab-star"
          :style="{ left: s.x + '%', top: s.y + '%', width: s.r + 'px', height: s.r + 'px', animationDelay: s.d + 's', animationDuration: s.t + 's' }"
        />
      </div>
      <div class="ab-hero-glow" aria-hidden="true" />

      <div class="ab-in ab-hero-grid">
        <div class="ab-hero-copy">
          <h1 class="ab-h1">
            <span class="ab-line"><span>Читаем вашу карту.</span></span>
            <span class="ab-line"><span>Ведём по ней.</span></span>
          </h1>
          <p class="ab-sub">
            «Взгляд сверху» — это Татьяна и Александра. Разбираем натальную карту по ведической астрологии, а затем помогаем пройти путь: ягьи под ваш запрос и поездки к местам силы в Индии.
          </p>
          <ul class="ab-offer" aria-label="Чем мы занимаемся">
            <li><AppIcon name="spark" /> Разбор карты</li>
            <li><AppIcon name="flame" /> Ягьи</li>
            <li><AppIcon name="globe" /> Туры в Индию</li>
          </ul>
          <div class="ab-cta">
            <button type="button" class="ab-btn" @click="openQuiz()">
              <span>Записаться на разбор карты</span>
              <AppIcon name="arrow" :sw="2" />
            </button>
            <button type="button" class="ab-ghost" @click="scrollToId('put')">
              Как это устроено
            </button>
          </div>
        </div>

        <div class="ab-stage" aria-hidden="false">
          <!-- кольца зодиака -->
          <svg class="ab-ring ab-ring-a" viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="200" cy="200" r="196" stroke-width=".8" />
            <circle cx="200" cy="200" r="186" stroke-width="2" stroke-dasharray=".6 8" stroke-linecap="round" />
            <g stroke-width="1">
              <line v-for="i in 12" :key="i" x1="200" y1="4" x2="200" y2="20" :transform="`rotate(${(i - 1) * 30} 200 200)`" />
            </g>
            <g fill="currentColor" stroke="none">
              <circle v-for="i in 12" :key="'d' + i" cx="200" cy="30" r="2.6" :transform="`rotate(${(i - 1) * 30 + 15} 200 200)`" />
            </g>
          </svg>
          <svg class="ab-ring ab-ring-b" viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="200" cy="200" r="172" stroke-width=".7" stroke-dasharray="3 7" />
            <circle cx="200" cy="200" r="164" stroke-width=".6" />
          </svg>

          <!-- ведическая карта (северо-индийский стиль) -->
          <svg class="ab-chart" viewBox="0 0 400 400" role="img" aria-label="Ведическая натальная карта, рисуется на ваших глазах">
            <defs>
              <radialGradient id="abLagna" cx="50%" cy="60%" r="60%">
                <stop offset="0" stop-color="#FFD98A" stop-opacity=".95" />
                <stop offset="1" stop-color="#E39A1E" stop-opacity=".12" />
              </radialGradient>
            </defs>
            <path class="ab-lagna" d="M200 20 L290 110 L200 200 L110 110 Z" fill="url(#abLagna)" />
            <g class="ab-lines" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <path pathLength="1" style="--i:0" d="M20 20 H380 V380 H20 Z" />
              <path pathLength="1" style="--i:1" d="M20 20 L380 380" />
              <path pathLength="1" style="--i:2" d="M380 20 L20 380" />
              <path pathLength="1" style="--i:3" d="M200 20 L380 200 L200 380 L20 200 Z" />
            </g>
            <g class="ab-hn">
              <text v-for="h in HOUSE_NUMS" :key="h.n" :x="h.x" :y="h.y" text-anchor="middle" dominant-baseline="middle">{{ h.n }}</text>
            </g>
            <g class="ab-pl">
              <text
                v-for="(p, i) in CHART_PLANETS"
                :key="p.house"
                :x="p.x"
                :y="p.y"
                text-anchor="middle"
                dominant-baseline="middle"
                :style="{ '--k': i }"
              >{{ p.t }}</text>
            </g>
          </svg>

          <!-- проводники на карте -->
          <figure class="ab-face ab-face-l">
            <div class="ab-arch">
              <img src="/images/expert-1.webp" alt="Татьяна Карпенкова" width="400" height="500" fetchpriority="high">
            </div>
            <figcaption>Татьяна</figcaption>
          </figure>
          <figure class="ab-face ab-face-r">
            <div class="ab-arch">
              <img src="/images/expert-2.webp" alt="Александра Андреева" width="400" height="500" fetchpriority="high">
            </div>
            <figcaption>Александра</figcaption>
          </figure>
        </div>
      </div>

      <!-- бегущая строка: слова, с которых всё начинается -->
      <div class="ab-words" aria-label="Слова, с которых всё начинается">
        <div class="ab-track">
          <ul v-for="n in 2" :key="n" :aria-hidden="n === 2 ? 'true' : undefined">
            <li v-for="x in WORDS" :key="x.w">
              <strong>{{ x.w }}</strong> — {{ x.d }}
              <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 0l2 6-2 6-2-6z" fill="currentColor" /></svg>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <!-- ===================== ПУТЬ ===================== -->
    <section id="put" class="ab-sec ab-paper">
      <div class="ab-in">
        <div class="ab-head" data-ab>
          <h2>Путь от вопроса до Индии</h2>
          <p>Каждый шаг вытекает из предыдущего: карта подсказывает, какая практика вам нужна, а практика — куда ехать.</p>
        </div>

        <ol ref="path" class="ab-path">
          <li class="ab-rail" aria-hidden="true">
            <i /><b />
          </li>
          <li v-for="(s, i) in STEPS" :key="s.n" class="ab-step" :style="{ '--s': i }" data-ab>
            <span class="ab-num">{{ s.n }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
            <button v-if="s.action === 'quiz'" type="button" class="ab-link" @click="openQuiz()">
              {{ s.cta }} <AppIcon name="arrow" :sw="2" />
            </button>
            <NuxtLink v-else :to="s.to!" class="ab-link">
              {{ s.cta }} <AppIcon name="arrow" :sw="2" />
            </NuxtLink>
          </li>
        </ol>
      </div>
    </section>

    <!-- ===================== ПРОВОДНИКИ ===================== -->
    <section class="ab-sec ab-teal">
      <div class="ab-in">
        <div class="ab-head ab-head-light" data-ab>
          <h2>Кто вас ведёт</h2>
          <p>Мы прошли свой путь в ведической традиции и в самой Индии — рядом с живым огнём и наставниками. Теперь идём этим путём вместе с вами.</p>
        </div>

        <article v-for="(g, i) in GUIDES" :key="g.key" class="ab-guide" :class="{ rev: i % 2 === 1 }">
          <div class="ab-gfig" data-ab>
            <span class="ab-gmand" aria-hidden="true" data-par="0.07"><AppOrnament name="mandala" /></span>
            <div class="ab-garch">
              <img :src="g.img" :alt="g.name" loading="lazy" width="400" height="500">
            </div>
          </div>
          <div class="ab-gtxt">
            <h3 class="ab-gname" data-ab :aria-label="g.name">
              <span class="ab-line" aria-hidden="true"><span>{{ g.first }}</span></span>
              <span class="ab-line" aria-hidden="true"><span>{{ g.last }}</span></span>
            </h3>
            <ul class="ab-tags" data-ab>
              <li v-for="t in g.tags" :key="t">
                {{ t }}
              </li>
            </ul>
            <p class="ab-bio" data-ab>
              {{ g.bio }}
            </p>
            <button v-if="g.docs" type="button" class="ab-link ab-link-light" data-ab @click="scrollToId('dokumenty')">
              Посмотреть дипломы <AppIcon name="arrow" :sw="2" />
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- ===================== ДИПЛОМЫ ===================== -->
    <section id="dokumenty" class="ab-sec ab-paper ab-docs">
      <div class="ab-in">
        <CertificateShowcase />
      </div>
    </section>

    <!-- ===================== ФИНАЛ ===================== -->
    <section class="ab-sec ab-fire">
      <EmberField :ox="0.5" :oy="0.86" :count="64" :spread="360" />
      <span class="ab-fmand" aria-hidden="true"><AppOrnament name="mandala" /></span>
      <div class="ab-in ab-final">
        <h2 data-ab>
          Начните с одного вопроса
        </h2>
        <p data-ab>
          Ответьте на несколько вопросов — подскажем, что подходит вам сейчас: разбор карты, ягья или поездка.
        </p>
        <button type="button" class="ab-btn" data-ab @click="openQuiz()">
          <span>Пройти опрос</span>
          <AppIcon name="arrow" :sw="2" />
        </button>

        <div class="contacts ab-contacts" data-ab>
          <a :href="config.public.telegramContact" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13 1.8 11.5c-1-.3-1-.9.2-1.4L20.7 3c.8-.3 1.5.2 1.2 1.3Z" /></svg>
            Telegram-канал</a>
          <span class="contact-insta">
            <a :href="config.public.instagramUrl" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
              Instagram</a>
            <MetaNote />
          </span>
        </div>
      </div>
    </section>
  </div>
</template>
