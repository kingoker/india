/**
 * Глобальное состояние опросника «С чего начать».
 * 3 шага (запрос → срок → путь) + мини-форма контакта, лид уходит в /api/lead.
 * Данные вопросов и подбор ягий — 1:1 из design-reference/prototype.html.
 */
import type { ThemeKey } from './useCatalog'

export interface Intent { id: ThemeKey, title: string, hint: string }
export interface Duration { v: string, label: string }
export interface ResultYagya { n: string, d: string }

const INTENTS: Intent[] = [
  { id: 'health', title: 'Здоровье и силы', hint: 'Восстановление' },
  { id: 'money', title: 'Деньги и достаток', hint: 'Рост, стабильность' },
  { id: 'love', title: 'Любовь и семья', hint: 'Отношения, дети' },
  { id: 'protect', title: 'Защита и опора', hint: 'Снятие преград' },
  { id: 'spirit', title: 'Дух и осознанность', hint: 'Практика, покой' },
  { id: 'work', title: 'Дело и путь', hint: 'Карьера, призвание' }
]

const DURATIONS: Duration[] = [
  { v: 'new', label: 'Появилось недавно' },
  { v: 'long', label: 'Тянется уже давно' },
  { v: 'always', label: 'Сколько себя помню' }
]

const RESULT_YAGYAS: Record<ThemeKey, ResultYagya[]> = {
  health: [{ n: 'Дханвантари-ягья', d: '3 окт' }, { n: 'Мритьюнджая-хома', d: '9 окт' }],
  money: [{ n: 'Лакшми-ягья', d: '5 окт' }, { n: 'Кубера-хома', d: '11 окт' }],
  love: [{ n: 'Сваямвара Парвати', d: '1 окт' }, { n: 'Гуру-ягья', d: '12 окт' }],
  protect: [{ n: 'Хануман-хома', d: '29 сен' }, { n: 'Судершана-ягья', d: '7 окт' }],
  spirit: [{ n: 'Ганапати-хома', d: '28 сен' }, { n: 'Гаятри-ягья', d: '11 окт' }],
  work: [{ n: 'Сурья-ягья', d: '6 окт' }, { n: 'Гуру-Брихаспати', d: '12 окт' }]
}

export function useQuiz() {
  const open = useState('quiz-open', () => false)
  const step = useState('quiz-step', () => 1)
  const intent = useState<ThemeKey | null>('quiz-intent', () => null)
  const dur = useState<string | null>('quiz-dur', () => null)
  const name = useState('quiz-name', () => '')
  const contact = useState('quiz-contact', () => '')
  const consent = useState('quiz-consent', () => false)
  const submitting = useState('quiz-submitting', () => false)
  const submitted = useState('quiz-submitted', () => false)
  const errorMsg = useState<string | null>('quiz-error', () => null)

  const intentTitle = computed(() => INTENTS.find(i => i.id === intent.value)?.title || '—')
  const durationLabel = computed(() => DURATIONS.find(d => d.v === dur.value)?.label || '')
  const resultYagyas = computed<ResultYagya[]>(() => (intent.value ? RESULT_YAGYAS[intent.value] : []))
  const canNext = computed(() => (step.value === 1 ? !!intent.value : step.value === 2 ? !!dur.value : true))

  function reset() {
    step.value = 1
    intent.value = null
    dur.value = null
    name.value = ''
    contact.value = ''
    consent.value = false
    submitting.value = false
    submitted.value = false
    errorMsg.value = null
  }

  function openQuiz(preset?: ThemeKey) {
    reset()
    if (preset) intent.value = preset
    open.value = true
  }

  function close() {
    open.value = false
  }

  function next() {
    if (step.value < 3 && canNext.value) step.value += 1
  }

  function back() {
    if (step.value > 1) step.value -= 1
  }

  async function submit() {
    if (!name.value.trim() || !contact.value.trim()) {
      errorMsg.value = 'Укажите имя и контакт'
      return
    }
    if (!consent.value) {
      errorMsg.value = 'Отметьте согласие на обработку персональных данных'
      return
    }
    submitting.value = true
    errorMsg.value = null
    try {
      await $fetch('/api/lead', {
        method: 'POST',
        body: {
          type: 'consultation',
          subject: intentTitle.value,
          service: 'Разбор карты (опросник)',
          name: name.value.trim(),
          contact: contact.value.trim(),
          consent: true,
          consentVersion: LEGAL_VERSION,
          intention: intentTitle.value,
          message: `Запрос: ${intentTitle.value}. Срок: ${durationLabel.value}.`
        }
      })
      submitted.value = true
    } catch {
      errorMsg.value = 'Не удалось отправить. Попробуйте ещё раз или напишите в Telegram.'
    } finally {
      submitting.value = false
    }
  }

  return {
    open,
    step,
    intent,
    dur,
    name,
    contact,
    consent,
    submitting,
    submitted,
    errorMsg,
    INTENTS,
    DURATIONS,
    intentTitle,
    durationLabel,
    resultYagyas,
    canNext,
    openQuiz,
    close,
    reset,
    next,
    back,
    submit
  }
}
