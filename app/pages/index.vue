<script setup lang="ts">
import type { ThemeKey } from '~/composables/useCatalog'

const { openQuiz } = useQuiz()
const { THEME_TILES, REVIEWS, YAGYI, TURY } = useCatalog()

// «Огонь под ваш запрос»: выбранная тема → её ритуалы и фото огня
const theme = ref<ThemeKey>('money')
const THEME_IMG: Record<ThemeKey, string> = {
  money: '/images/y1.jpg',
  health: '/images/y2.jpg',
  protect: '/images/y3.jpg',
  love: '/images/y1.jpg',
  spirit: '/images/y3.jpg',
  work: '/images/y2.jpg'
}
const FIRE_IMGS = ['/images/y1.jpg', '/images/y2.jpg', '/images/y3.jpg']
const rituals = computed(() => YAGYI.filter(y => y.cat === theme.value))
const activeTile = computed(() => THEME_TILES.find(t => t.key === theme.value))

// На устройствах с мышью тема переключается наведением, на touch — нажатием
function hoverTheme(e: PointerEvent, key: ThemeKey) {
  if (e.pointerType === 'mouse') theme.value = key
}
// Стрелки ↑/↓ по списку тем (роль tablist)
function onThemeKey(e: KeyboardEvent) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  e.preventDefault()
  const keys = THEME_TILES.map(t => t.key)
  const i = keys.indexOf(theme.value)
  const next = keys[(i + (e.key === 'ArrowDown' ? 1 : keys.length - 1)) % keys.length]!
  theme.value = next
  ;(e.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-theme="${next}"]`)?.focus()
}

// Длительность тура «10 дней» → число крупно + подпись
function tourDays(d: string) {
  const [n, ...rest] = d.split(' ')
  return { n, unit: rest.join(' ') }
}
const { openForm: openReviewForm, playVideo } = useReviews()
const { FAQ } = useFaq()
const config = useRuntimeConfig()

useSeoMeta({
  title: 'Взгляд сверху — ведическая астрология и Индия',
  description: 'Огонь, открывающий путь. Читаем вашу карту и ведём по ней — от разбора до ягий и поездки в места силы Индии.'
})

// Разметка FAQPage — те же вопросы, что видны на странице
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ.map(f => ({
        '@type': 'Question',
        'name': f.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': f.a.join(' ') }
      }))
    })
  }]
})

// Путь «Как мы ведём» — запуск анимации-проезда при входе в вид
const pathEl = ref<HTMLElement | null>(null)
onMounted(() => {
  const el = pathEl.value
  if (!el) return
  // При reduced-motion не «взводим» анимацию — путь показан статично целиком
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.classList.add('anim-armed')
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        el.classList.add('is-traveled')
        io.disconnect()
        break
      }
    }
  }, { threshold: 0.3 })
  io.observe(el)
})

// Угли над огнём — лёгкий canvas-эффект (отключается при reduced-motion)
const embers = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let onResize: (() => void) | null = null

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const c = embers.value
  if (reduce || !c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  let W = 0
  let H = 0

  function size() {
    const r = c!.getBoundingClientRect()
    W = r.width
    H = r.height
    c!.width = W * dpr
    c!.height = H * dpr
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  interface P { x: number, y: number, r: number, vy: number, vx: number, a: number, la: number, life: number, max: number }
  function spawn(): P {
    return {
      x: W * 0.5 + (Math.random() - 0.5) * 130,
      y: H * 0.42 + Math.random() * 30,
      r: 1 + Math.random() * 2.6,
      vy: -(0.28 + Math.random() * 0.6),
      vx: (Math.random() - 0.5) * 0.4,
      a: 0,
      la: 0.55 + Math.random() * 0.45,
      life: 0,
      max: 160 + Math.random() * 160
    }
  }

  const particles: P[] = []
  for (let i = 0; i < 44; i++) {
    const p = spawn()
    p.life = Math.random() * p.max
    particles.push(p)
  }

  // Мерцающие звёзды в верхней части неба (нормированные координаты)
  interface Star { nx: number, ny: number, r: number, a: number, ph: number, sp: number, big: boolean }
  const stars: Star[] = []
  for (let i = 0; i < 52; i++) {
    const r = 0.6 + Math.random() * 1.5
    stars.push({
      nx: Math.random(),
      ny: 0.02 + Math.random() * 0.42,
      r,
      a: 0.4 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
      sp: 0.012 + Math.random() * 0.03,
      big: r > 1.55
    })
  }

  function drawStars() {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]!
      s.ph += s.sp
      const tw = 0.32 + 0.68 * Math.abs(Math.sin(s.ph))
      const a = s.a * tw
      const x = s.nx * W
      const y = s.ny * H
      ctx!.beginPath()
      ctx!.fillStyle = 'rgba(255,244,214,' + a.toFixed(3) + ')'
      ctx!.arc(x, y, s.r, 0, 6.283)
      ctx!.fill()
      // Искра-крестик у ярких звёзд на пике мерцания
      if (s.big && tw > 0.62) {
        const g = (tw - 0.62) * 3 * s.r + s.r
        ctx!.strokeStyle = 'rgba(255,240,205,' + (a * 0.5).toFixed(3) + ')'
        ctx!.lineWidth = 0.7
        ctx!.beginPath()
        ctx!.moveTo(x - g, y)
        ctx!.lineTo(x + g, y)
        ctx!.moveTo(x, y - g)
        ctx!.lineTo(x, y + g)
        ctx!.stroke()
      }
    }
  }

  function frame() {
    ctx!.clearRect(0, 0, W, H)
    drawStars()
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]!
      p.life++
      p.x += p.vx
      p.y += p.vy
      p.vx += (Math.random() - 0.5) * 0.04
      const t = p.life / p.max
      p.a = t < 0.2 ? (t / 0.2) * p.la : (1 - t) * p.la
      if (p.life >= p.max || p.y < H * 0.03) {
        particles[i] = spawn()
        continue
      }
      ctx!.beginPath()
      ctx!.fillStyle = 'rgba(240,180,70,' + Math.max(0, p.a).toFixed(3) + ')'
      ctx!.arc(p.x, p.y, p.r, 0, 6.283)
      ctx!.fill()
    }
    rafId = requestAnimationFrame(frame)
  }

  size()
  onResize = size
  window.addEventListener('resize', onResize)
  rafId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="home">
    <!-- HERO -->
    <header class="hero">
      <img class="hero-bg" src="/images/hero.jpg" alt="" aria-hidden="true">
      <div class="hero-scrim" aria-hidden="true" />
      <img class="fire" src="/images/fire.png" alt="" aria-hidden="true">
      <canvas ref="embers" aria-hidden="true" />
      <div class="hero-haze" aria-hidden="true" />

      <div class="topbar">
        <div class="brand">
          <span class="mark"><BrandMark /></span>
          <span class="name">Взгляд сверху</span>
        </div>
        <nav class="topnav">
          <NuxtLink to="/yagyi">Ягьи</NuxtLink>
          <NuxtLink to="/tury">Туры</NuxtLink>
          <NuxtLink to="/o-nas">О нас</NuxtLink>
          <button class="enter" @click="openQuiz()">
            Подобрать путь
          </button>
        </nav>
        <a
          class="tg-link"
          :href="config.public.telegramContact"
          target="_blank"
          rel="noopener"
          aria-label="Написать в Telegram"
        >
          <span class="tg-ic"><AppIcon name="telegram" /></span>
          <span class="tg-tx">Telegram</span>
        </a>
      </div>

      <div class="hero-copy">
        <span class="kicker">Ведическая астрология и Индия</span>
        <h1>Огонь, <span class="keep">открывающий путь</span></h1>
        <p class="sub">
          Читаем вашу ведическую карту и ведём по ней — от первого разбора до огненных ягий и поездки к местам силы Индии.
        </p>
        <button class="btn-primary" @click="openQuiz()">
          <AppIcon name="spark" /><span>С чего начать?</span>
        </button>
      </div>
    </header>

    <main class="wrap">
      <!-- Ваш путь -->
      <section class="env-paper paper-dawn">
        <span class="deco-mandala tr" data-par="0.05" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <AppOrnament name="divider" class="sec-div" data-reveal />
        <h2 class="h2" data-reveal>
          Как мы ведём вас по карте
        </h2>
        <p class="lead" data-reveal>
          Три шага, а не каталог ритуалов: каждый следующий вырастает из предыдущего.
        </p>
        <div ref="pathEl" class="path" data-reveal>
          <span class="path-track" aria-hidden="true" />
          <span class="path-ember" aria-hidden="true" />
          <button type="button" class="stop" style="--d:0s" @click="openQuiz()">
            <div class="mrk">
              <b>1</b>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 3l9 9-9 9-9-9z" /><path d="M12 3v18M3 12h18" opacity=".45" /></svg>
            </div>
            <div class="txt">
              <h3>Диагностика</h3>
              <p>Читаем вашу ведическую карту и находим, что мешает — в здоровье, деньгах или отношениях.</p>
              <span class="chip">Онлайн · 60 мин · от 3 500 ₽</span>
            </div>
          </button>
          <NuxtLink to="/yagyi" class="stop" style="--d:.45s">
            <div class="mrk">
              <b>2</b>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.2 3.6 5 6.4 5 9a5 5 0 0 1-10 0c0-2.6 1.8-5.4 5-9Z" /><path d="M12 11c1.3 1.5 2 2.7 2 3.6a2 2 0 0 1-4 0c0-.9.7-2.1 2-3.6Z" /></svg>
            </div>
            <div class="txt">
              <h3>Ягьи и практики</h3>
              <p>Под найденные причины подбираем огненные ритуалы и практики и проводим их в благоприятные даты.</p>
              <span class="chip">Личный план с датами</span>
            </div>
          </NuxtLink>
          <NuxtLink to="/tury" class="stop dest" style="--d:.9s">
            <div class="mrk">
              <b>3</b>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M6 21v-9l6-4 6 4v9M12 4V2" /><path d="M10 21v-5h4v5" /></svg>
            </div>
            <div class="txt">
              <h3>Места силы</h3>
              <p>Когда будете готовы — едем к истокам: храмы Индии, живой огонь и практика вживую.</p>
              <span class="chip">Поездка с сопровождением</span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Проводники -->
      <section id="experts" class="env-paper paper-saffron">
        <span class="deco-mandala bl slow-rev" data-par="0.04" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <AppOrnament name="divider" class="sec-div" data-reveal />
        <h2 class="h2" data-reveal>
          Ваши проводники
        </h2>
        <p class="lead" data-reveal>
          Две практикующие в традиции джйотиша и аюрведы. Они читают карту, проводят ягьи и сопровождают в поездках.
        </p>
        <div class="guides" data-reveal-stagger>
          <div class="guide">
            <div class="portrait">
              <div class="arch">
                <img src="/images/expert-1.webp" alt="Татьяна Карпенкова">
              </div>
            </div>
            <div class="about">
              <div class="nm">
                Татьяна Карпенкова
              </div>
              <div class="tags">
                <span>Кундалини-йога</span><span>Аюрведа</span><span>Астрология</span>
              </div>
              <p class="bio">
                Мягко веду в практику: через тело, ритм и осознанную еду помогаю прийти к внутренней тишине. А через астрологию — увидеть свою природу и найти точки опоры.
              </p>
            </div>
          </div>
          <div class="guide">
            <div class="portrait">
              <div class="arch">
                <img src="/images/expert-2.webp" alt="Александра Андреева">
              </div>
            </div>
            <div class="about">
              <div class="nm">
                Александра Андреева
              </div>
              <div class="tags">
                <span>Смрити-медитация</span><span>Интегральный психолог</span><span>Джйотиш</span>
              </div>
              <p class="bio">
                Помогаю трансформировать сознание — работаю с подсознательными причинами, чтобы перемены были устойчивыми, а не на время.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Ягьи: тема слева → ритуалы справа -->
      <section class="altar env-paper paper-ember" aria-labelledby="altar-title">
        <span class="deco-mandala tr" data-par="0.05" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <div class="altar-head" data-reveal>
          <h2 id="altar-title" class="h2">
            Огонь под ваш запрос
          </h2>
          <p class="lead">
            Выберите, что сейчас важнее всего, — покажем ритуалы и ближайшие благоприятные даты.
          </p>
        </div>

        <div class="altar-grid" data-reveal>
          <div class="intents" role="tablist" aria-orientation="vertical" aria-label="Тема запроса" @keydown="onThemeKey">
            <button
              v-for="th in THEME_TILES"
              :id="`intent-${th.key}`"
              :key="th.key"
              type="button"
              role="tab"
              class="intent"
              :class="{ on: theme === th.key }"
              :data-theme="th.key"
              :aria-selected="theme === th.key"
              :aria-controls="'altar-panel'"
              :tabindex="theme === th.key ? 0 : -1"
              @click="theme = th.key"
              @pointerenter="hoverTheme($event, th.key)"
            >
              <span class="intent-ic" aria-hidden="true"><AppIcon :name="th.key" /></span>
              <span class="intent-name">{{ th.tn }}</span>
              <span class="intent-count">{{ th.tc }}</span>
            </button>
          </div>

          <div id="altar-panel" class="altar-panel" role="tabpanel" :aria-labelledby="`intent-${theme}`">
            <AppOrnament name="kolam" class="corner tl" />
            <div class="ap-photo">
              <img
                v-for="src in FIRE_IMGS"
                :key="src"
                :src="src"
                alt=""
                :class="{ on: THEME_IMG[theme] === src }"
              >
              <span class="ap-theme">{{ activeTile?.tn }}</span>
            </div>
            <ul class="ap-list">
              <li v-for="r in rituals" :key="r.n">
                <button type="button" class="ap-row" @click="openQuiz(r.cat)">
                  <span class="ap-main">
                    <span class="ap-name">{{ r.n }}</span>
                    <span class="ap-for">{{ r.p }}</span>
                  </span>
                  <span class="ap-meta">
                    <span class="ap-date">ближайшая {{ r.d }}</span>
                    <span class="ap-price">{{ r.pr }}</span>
                  </span>
                  <span class="ap-go" aria-hidden="true"><AppIcon name="arrow" :sw="2" /></span>
                </button>
              </li>
            </ul>
            <NuxtLink :to="`/yagyi?theme=${theme}`" class="seeall ap-all">
              Все ягьи темы «{{ activeTile?.tn }}»<AppIcon name="arrow" :sw="2" />
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Доверие / отзывы (данные — шаблонные, заменить на реальные) -->
      <section class="trust env-night">
        <span class="deco-mandala center" data-par="0.07" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <AppOrnament name="divider" class="sec-div" data-reveal />
        <h2 class="h2" data-reveal>
          Тем, кто уже прошёл этот путь
        </h2>
        <p class="lead" data-reveal>
          Разбор, ягьи и поездки — глазами людей, которые начинали с того же вопроса, что и вы.
        </p>

        <ul class="stats" aria-label="Коротко о практике" data-reveal-stagger>
          <li>
            <span class="num">7 лет</span>
            <span class="lbl">ведём практику</span>
          </li>
          <li>
            <span class="num">400+</span>
            <span class="lbl">разборов карт</span>
          </li>
          <li>
            <span class="num">6</span>
            <span class="lbl">поездок к местам силы</span>
          </li>
        </ul>

        <div class="reviews" data-reveal-stagger>
          <template v-for="(r, i) in REVIEWS" :key="i">
            <!-- Видеоотзыв -->
            <figure v-if="r.video" class="review review--video">
              <button
                class="vthumb"
                :style="r.video.poster ? { backgroundImage: `url(${r.video.poster})` } : undefined"
                :aria-label="`Смотреть видеоотзыв${r.video.title ? `: ${r.video.title}` : ''}`"
                @click="playVideo(r.video)"
              >
                <span class="vplay" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
                </span>
              </button>
              <figcaption>
                <AppStars :value="r.stars" :size="17" />
                <span v-if="r.tag" class="rtag">{{ r.video.title || r.tag }}</span>
              </figcaption>
            </figure>

            <!-- Текстовый отзыв -->
            <figure v-else class="review">
              <AppStars :value="r.stars" :size="17" />
              <blockquote>{{ r.text }}</blockquote>
              <figcaption>
                <span v-if="r.name" class="rn">{{ r.name }}</span>
                <span v-if="r.tag" class="rtag">{{ r.tag }}</span>
              </figcaption>
            </figure>
          </template>
        </div>

        <div class="rev-cta" data-reveal>
          <button class="rev-add" @click="openReviewForm">
            <AppIcon name="spark" />Оставить отзыв
          </button>
          <span class="rev-note">Текст или видео · публикуем после модерации</span>
        </div>
      </section>

      <!-- Туры: фото во весь экран, маршруты — табло внизу -->
      <section class="pilgrim env-teal" aria-labelledby="pilgrim-title">
        <div class="pil-head">
          <h2 id="pilgrim-title" class="h2" data-reveal>
            Паломничество в Индию
          </h2>
          <p class="lead" data-reveal>
            Храмы, живой огонь и практика вживую — небольшой группой и с наставниками на всём пути.
          </p>
          <div class="pil-cta" data-reveal>
            <NuxtLink to="/tury" class="btn-primary pil-btn">
              Смотреть программы
            </NuxtLink>
          </div>
        </div>

        <ul class="board" aria-label="Ближайшие маршруты" data-reveal-stagger>
          <li v-for="t in TURY" :key="t.n">
            <NuxtLink to="/tury" class="route">
              <span class="route-days">
                <b>{{ tourDays(t.d).n }}</b>
                <span>{{ tourDays(t.d).unit }}</span>
              </span>
              <span class="route-name">{{ t.n }}</span>
              <span class="route-area">{{ t.cl }}</span>
              <span class="route-price">{{ t.pr }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Вопросы и ответы -->
      <section id="faq" class="faq env-paper paper-saffron" aria-labelledby="faq-title">
        <span class="deco-mandala tr" data-par="0.05" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <div class="faq-grid">
          <div class="faq-side" data-reveal>
            <h2 id="faq-title" class="h2">
              Вопросы и ответы
            </h2>
            <p class="lead">
              Коротко о том, с чего начинается работа. Не нашли свой вопрос — напишите, ответим лично.
            </p>
            <a class="seeall" :href="config.public.telegramContact" target="_blank" rel="noopener">
              <AppIcon name="telegram" />Задать вопрос в Telegram
            </a>
          </div>

          <div class="faq-list">
            <details v-for="(item, i) in FAQ" :key="i" class="faq-item" :open="i === 0 || undefined">
              <summary>
                <span class="faq-dash" aria-hidden="true" />
                <span class="faq-q">{{ item.q }}</span>
              </summary>
              <div class="faq-a">
                <div>
                  <p v-for="(p, j) in item.a" :key="j">
                    {{ p }}
                  </p>
                </div>
              </div>
            </details>
          </div>
        </div>
      </section>

      <div class="cta-band env-fire">
        <span class="deco-mandala center" data-par="0.06" aria-hidden="true"><AppOrnament name="mandala" /></span>
        <h2 class="h2" data-reveal>
          Ближайшие ягьи — в начале октября
        </h2>
        <p data-reveal>
          Разбор карты за 60 минут покажет, какой ритуал ваш и в какую дату его проводить.
        </p>
        <button class="btn-primary" data-reveal @click="openQuiz()">
          <AppIcon name="spark" />Записаться на разбор
        </button>
      </div>
    </main>
  </div>
</template>
