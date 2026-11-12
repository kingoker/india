<script setup lang="ts">
/**
 * Окно «Подробнее» о туре: обложка, маршрут, описание, программа и условия.
 * Полный текст живёт здесь, чтобы карточки в каталоге оставались короткими.
 */
import type { Tour } from '~/composables/useCatalog'

const props = defineProps<{ tour: Tour | null }>()
const emit = defineEmits<{ close: [], select: [] }>()

const { TOUR_STATUS } = useCatalog()
// Держим последний тур, чтобы содержимое не пропадало во время анимации закрытия
const shown = ref<Tour | null>(props.tour)
watch(() => props.tour, (t) => {
  if (t) shown.value = t
})
const status = computed(() => (shown.value ? TOUR_STATUS[shown.value.status] : null))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.tour) emit('close')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

// Из окна сразу открывается запись — не снимаем блокировку прокрутки, если опросник уже открыт
const { open: quizOpen } = useQuiz()
watch(() => props.tour, (t) => {
  if (import.meta.client) document.body.style.overflow = t || quizOpen.value ? 'hidden' : ''
}, { immediate: true })

// Фокус уходит в окно при открытии, чтобы с клавиатуры не листать каталог под ним
const closeBtn = ref<HTMLButtonElement | null>(null)
watch(() => props.tour?.id, (id) => {
  if (id) nextTick(() => closeBtn.value?.focus({ preventScroll: true }))
})
</script>

<template>
  <div class="backdrop" :class="{ open: !!tour }" @click.self="emit('close')">
    <div
      v-if="shown && status"
      class="modal tsh"
      role="dialog"
      aria-modal="true"
      :aria-label="shown.n"
      data-lenis-prevent
    >
      <button ref="closeBtn" class="close tsh-close" aria-label="Закрыть" @click="emit('close')">
        <AppIcon name="close" :sw="2" />
      </button>

      <div class="tsh-scroll">
        <div class="tsh-cover">
          <img :src="shown.img" :style="{ objectPosition: shown.pos }" alt="">
          <span class="tsh-cover-tint" aria-hidden="true" />
          <span class="tr-tour-status" :data-status="shown.status">{{ status.label }}</span>
        </div>

        <div class="tsh-body">
          <h2 class="tsh-title">
            {{ shown.n }}
          </h2>
          <p class="tsh-sub">
            {{ shown.sub }}<template v-if="shown.d">
              , {{ shown.d }}
            </template>
          </p>

          <ol class="tsh-route" aria-label="Маршрут">
            <li v-for="s in shown.route" :key="s">
              {{ s }}
            </li>
          </ol>

          <!-- Фото из поездки: листаются по горизонтали, появляются, когда добавлены в данные -->
          <ul v-if="shown.gallery?.length" class="tsh-gallery" aria-label="Фото из поездки">
            <li v-for="src in shown.gallery" :key="src">
              <img :src="src" alt="" loading="lazy">
            </li>
          </ul>

          <p v-for="(a, i) in shown.about" :key="i" class="tsh-p">
            {{ a }}
          </p>

          <p class="tsh-focus">
            <AppIcon name="spark" />{{ shown.focus }}
          </p>

          <div v-for="(b, i) in shown.program" :key="i" class="tsh-prog">
            <h3>{{ b.t || 'В программе' }}</h3>
            <ul>
              <li v-for="it in b.items" :key="it">
                {{ it }}
              </li>
            </ul>
          </div>

          <p v-if="shown.note" class="tsh-note">
            {{ shown.note }}
          </p>
        </div>
      </div>

      <div class="tsh-foot">
        <div class="tr-tour-price">
          <small>стоимость</small>
          <b>{{ shown.pr }}</b>
          <span v-if="shown.prNote" class="tsh-prnote">{{ shown.prNote }}</span>
        </div>
        <button class="yg-btn yg-btn-fire tr-book" @click="emit('select')">
          {{ status.cta }}<AppIcon name="arrow" :sw="2" />
        </button>
      </div>
    </div>
  </div>
</template>
