import Lenis from 'lenis'

/**
 * Движение витрины — медленное и благоговейное:
 *  - Lenis: мягкий инерционный скролл.
 *  - reveal: [data-reveal] / [data-reveal-stagger] приходят из покоя при входе в вид.
 *  - parallax: декоративные мандалы [data-par] слегка дрейфуют при скролле.
 * Всё выключается при prefers-reduced-motion.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  // --- Lenis smooth scroll ---
  const lenis = new Lenis({ duration: 1.05, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  nuxtApp.hook('page:finish', () => lenis.scrollTo(0, { immediate: true }))

  // --- Reveal from rest (class-based, поддерживает stagger через CSS) ---
  document.documentElement.classList.add('reveal-ready')
  let observer: IntersectionObserver | null = null

  function ensureObserver() {
    if (observer) return observer
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-in')
        observer!.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    return observer
  }

  // --- Parallax декоративных слоёв ---
  let parEls: HTMLElement[] = []
  function collectParallax() {
    parEls = Array.from(document.querySelectorAll<HTMLElement>('[data-par]'))
  }
  function applyParallax(scroll: number) {
    const vh = window.innerHeight
    for (const el of parEls) {
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - vh / 2
      const speed = Number(el.dataset.par) || 0.06
      el.style.setProperty('--par', `${(-center * speed).toFixed(1)}px`)
    }
    void scroll
  }

  function scan() {
    const obs = ensureObserver()
    document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-seen]), [data-reveal-stagger]:not([data-seen])').forEach((el) => {
      el.dataset.seen = '1'
      obs.observe(el)
    })
    collectParallax()
    applyParallax(window.scrollY)
  }

  lenis.on('scroll', ({ scroll }: { scroll: number }) => applyParallax(scroll))

  nuxtApp.hook('page:finish', () => {
    nextTick().then(() => {
      setTimeout(scan, 30)
    })
  })
  onNuxtReady(() => scan())
})
