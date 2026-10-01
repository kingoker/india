/**
 * Состояние блока отзывов:
 *  1. Форма «Оставить отзыв» — уходит в /api/review, публикуется ПОСЛЕ модерации.
 *  2. Лайтбокс для видеоотзывов (YouTube или прямой файл).
 * Оба стейта глобальные, модалки монтируются один раз в app.vue.
 */
import type { ReviewVideo } from './useCatalog'

export function useReviews() {
  // --- Форма отзыва ---
  const formOpen = useState('rev-form-open', () => false)
  const rating = useState('rev-rating', () => 0)
  const text = useState('rev-text', () => '')
  const author = useState('rev-author', () => '')
  const contact = useState('rev-contact', () => '')
  const videoUrl = useState('rev-video', () => '')
  const consent = useState('rev-consent', () => false)
  const submitting = useState('rev-submitting', () => false)
  const submitted = useState('rev-submitted', () => false)
  const errorMsg = useState<string | null>('rev-error', () => null)

  function resetForm() {
    rating.value = 0
    text.value = ''
    author.value = ''
    contact.value = ''
    videoUrl.value = ''
    consent.value = false
    submitting.value = false
    submitted.value = false
    errorMsg.value = null
  }

  function openForm() {
    resetForm()
    formOpen.value = true
  }

  function closeForm() {
    formOpen.value = false
  }

  async function submit() {
    if (rating.value < 1) {
      errorMsg.value = 'Поставьте оценку звёздами'
      return
    }
    if (text.value.trim().length < 10) {
      errorMsg.value = 'Напишите пару слов об опыте (хотя бы 10 символов)'
      return
    }
    if (!consent.value) {
      errorMsg.value = 'Отметьте согласие на обработку персональных данных'
      return
    }
    submitting.value = true
    errorMsg.value = null
    try {
      await $fetch('/api/review', {
        method: 'POST',
        body: {
          rating: rating.value,
          text: text.value.trim(),
          name: author.value.trim(),
          contact: contact.value.trim(),
          videoUrl: videoUrl.value.trim(),
          consent: true,
          consentVersion: LEGAL_VERSION
        }
      })
      submitted.value = true
    } catch {
      errorMsg.value = 'Не удалось отправить. Попробуйте ещё раз или напишите в Telegram.'
    } finally {
      submitting.value = false
    }
  }

  // --- Лайтбокс видеоотзыва ---
  const activeVideo = useState<ReviewVideo | null>('rev-active-video', () => null)

  function playVideo(v: ReviewVideo) {
    activeVideo.value = v
  }

  function closeVideo() {
    activeVideo.value = null
  }

  return {
    formOpen,
    rating,
    text,
    author,
    contact,
    videoUrl,
    consent,
    submitting,
    submitted,
    errorMsg,
    openForm,
    closeForm,
    submit,
    activeVideo,
    playVideo,
    closeVideo
  }
}
