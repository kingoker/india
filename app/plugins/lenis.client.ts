import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

export default defineNuxtPlugin(() => {
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return {
    provide: { lenis }
  }
})
