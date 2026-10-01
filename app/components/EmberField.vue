<script setup lang="ts">
/**
 * Угли над огнём — canvas-эффект. Частицы поднимаются от точки (ox, oy) в долях размера холста.
 * Рисует, только пока блок виден; при prefers-reduced-motion не запускается.
 */
const props = withDefaults(defineProps<{ ox?: number, oy?: number, count?: number, spread?: number }>(), {
  ox: 0.5,
  oy: 0.78,
  count: 70,
  spread: 220
})

const canvas = ref<HTMLCanvasElement | null>(null)
let rafId = 0
let io: IntersectionObserver | null = null
let onResize: (() => void) | null = null

onMounted(() => {
  const c = canvas.value
  if (!c || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
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

  interface P { x: number, y: number, r: number, vx: number, vy: number, life: number, max: number, la: number, ph: number }
  function spawn(): P {
    return {
      x: W * props.ox + (Math.random() - 0.5) * props.spread,
      y: H * props.oy + Math.random() * 24,
      r: 0.8 + Math.random() * 2.4,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.35 + Math.random() * 0.95),
      life: 0,
      max: 150 + Math.random() * 220,
      la: 0.5 + Math.random() * 0.5,
      ph: Math.random() * 6.28
    }
  }

  const ps: P[] = Array.from({ length: props.count }, () => {
    const p = spawn()
    p.life = Math.random() * p.max
    return p
  })

  function frame() {
    ctx!.clearRect(0, 0, W, H)
    ctx!.globalCompositeOperation = 'lighter'
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i]!
      p.life++
      p.ph += 0.05
      p.x += p.vx + Math.sin(p.ph) * 0.35
      p.y += p.vy
      const t = p.life / p.max
      if (t >= 1 || p.y < -10) {
        ps[i] = spawn()
        continue
      }
      const a = (t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85) * p.la
      const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
      g.addColorStop(0, `rgba(255,214,120,${a.toFixed(3)})`)
      g.addColorStop(0.4, `rgba(240,140,50,${(a * 0.45).toFixed(3)})`)
      g.addColorStop(1, 'rgba(240,120,40,0)')
      ctx!.fillStyle = g
      ctx!.beginPath()
      ctx!.arc(p.x, p.y, p.r * 4, 0, 6.283)
      ctx!.fill()
    }
    rafId = requestAnimationFrame(frame)
  }

  size()
  onResize = size
  window.addEventListener('resize', onResize)
  io = new IntersectionObserver(([e]) => {
    cancelAnimationFrame(rafId)
    if (e?.isIntersecting) rafId = requestAnimationFrame(frame)
  })
  io.observe(c)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  io?.disconnect()
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <canvas ref="canvas" class="ember-field" aria-hidden="true" />
</template>

<style scoped>
.ember-field {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
