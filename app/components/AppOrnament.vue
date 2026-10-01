<script setup lang="ts">
/**
 * Декоративные орнаменты витрины — единый язык индийской сакральной геометрии.
 * Тонкая золотая линия (currentColor), fill:none. Чисто оформление — aria-hidden.
 *   mandala  — янтра водяным знаком (кольца, спицы, лепестки, шаткона, бинду)
 *   kolam    — угловой росчерк (ориентирован в левый-верх, поворот через CSS)
 *   divider  — горизонтальный разделитель-искра между секциями
 */
withDefaults(defineProps<{ name?: 'mandala' | 'kolam' | 'divider' }>(), {
  name: 'mandala'
})

const TWO_PI = Math.PI * 2
const pt = (r: number, a: number) => ({
  x: +(100 + Math.cos(a) * r).toFixed(2),
  y: +(100 + Math.sin(a) * r).toFixed(2)
})

// 12 спиц от внутреннего кольца к внешнему
const spokes = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * TWO_PI
    const p1 = pt(32, a)
    const p2 = pt(92, a)
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y }
  })
)

// 12 лепестков-точек между спицами
const petals = computed(() =>
  Array.from({ length: 12 }, (_, i) => {
    const a = ((i + 0.5) / 12) * TWO_PI
    return pt(70, a)
  })
)

// Шаткона — две пересекающиеся треугольные звезды
const shatkona = computed(() => {
  const up = [pt(46, -Math.PI / 2), pt(46, -Math.PI / 2 + TWO_PI / 3), pt(46, -Math.PI / 2 + 2 * TWO_PI / 3)]
  const dn = [pt(46, Math.PI / 2), pt(46, Math.PI / 2 + TWO_PI / 3), pt(46, Math.PI / 2 + 2 * TWO_PI / 3)]
  const path = (p: { x: number, y: number }[]) => `M${p[0]!.x} ${p[0]!.y}L${p[1]!.x} ${p[1]!.y}L${p[2]!.x} ${p[2]!.y}Z`
  return [path(up), path(dn)]
})
</script>

<template>
  <svg
    v-if="name === 'mandala'"
    class="orn orn-mandala"
    viewBox="0 0 200 200"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <circle cx="100" cy="100" r="96" stroke-width="0.8" />
    <circle cx="100" cy="100" r="88" stroke-width="2" stroke-dasharray="0.6 7" stroke-linecap="round" />
    <circle cx="100" cy="100" r="78" stroke-width="0.8" />
    <circle cx="100" cy="100" r="32" stroke-width="0.8" />
    <line
      v-for="(s, i) in spokes"
      :key="'s' + i"
      :x1="s.x1"
      :y1="s.y1"
      :x2="s.x2"
      :y2="s.y2"
      stroke-width="0.7"
    />
    <circle v-for="(p, i) in petals" :key="'p' + i" :cx="p.x" :cy="p.y" r="3.2" stroke-width="0.8" />
    <path v-for="(d, i) in shatkona" :key="'t' + i" :d="d" stroke-width="0.9" stroke-linejoin="round" />
    <circle cx="100" cy="100" r="5" fill="currentColor" stroke="none" />
  </svg>

  <svg
    v-else-if="name === 'kolam'"
    class="orn orn-kolam"
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    stroke-width="1.1"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M10 10c34 0 62 28 62 62" />
    <path d="M10 30c22 0 40 18 40 40" />
    <path d="M30 10c22 0 40 18 40 40" />
    <circle cx="14" cy="14" r="2.4" fill="currentColor" stroke="none" />
    <circle cx="10" cy="52" r="2" fill="currentColor" stroke="none" />
    <circle cx="52" cy="10" r="2" fill="currentColor" stroke="none" />
  </svg>

  <svg
    v-else
    class="orn orn-divider"
    viewBox="0 0 240 24"
    fill="none"
    stroke="currentColor"
    aria-hidden="true"
  >
    <line x1="8" y1="12" x2="98" y2="12" stroke-width="1" stroke-dasharray="1 9" stroke-linecap="round" opacity="0.7" />
    <line x1="142" y1="12" x2="232" y2="12" stroke-width="1" stroke-dasharray="1 9" stroke-linecap="round" opacity="0.7" />
    <path d="M120 3l4.5 9-4.5 9-4.5-9z" stroke-width="1.1" stroke-linejoin="round" />
    <path d="M120 8.5l1.9 3.5-1.9 3.5-1.9-3.5z" fill="currentColor" stroke="none" />
    <circle cx="104" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="136" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
</template>
