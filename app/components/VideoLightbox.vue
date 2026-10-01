<script setup lang="ts">
/** Лайтбокс видеоотзыва: YouTube-iframe или прямой mp4. */
const { activeVideo, closeVideo } = useReviews()

const ytSrc = computed(() => {
  const v = activeVideo.value
  if (!v || v.type !== 'youtube') return ''
  // Поддержка как id, так и полной ссылки
  const id = v.src.includes('http')
    ? (v.src.match(/(?:v=|be\/|embed\/)([\w-]{11})/)?.[1] || '')
    : v.src
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && activeVideo.value) closeVideo()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(activeVideo, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <div class="vbox" :class="{ open: !!activeVideo }" @click.self="closeVideo">
    <div class="vbox-inner" role="dialog" aria-modal="true" aria-label="Видеоотзыв">
      <button class="vbox-close" aria-label="Закрыть" @click="closeVideo">
        <AppIcon name="close" :sw="2" />
      </button>
      <div v-if="activeVideo" class="vbox-frame">
        <iframe
          v-if="activeVideo.type === 'youtube'"
          :src="ytSrc"
          title="Видеоотзыв"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        />
        <video
          v-else
          :src="activeVideo.src"
          :poster="activeVideo.poster"
          controls
          autoplay
          playsinline
        />
      </div>
    </div>
  </div>
</template>
