<script setup lang="ts">
/** Глобальный опросник «С чего начать» — 3 шага + мини-форма контакта. */
const {
  open, step, intent, dur, name, contact, consent, submitting, submitted, errorMsg,
  INTENTS, DURATIONS, intentTitle, resultYagyas, canNext,
  close, next, back, submit
} = useQuiz()

const nextLabel = computed(() => (step.value === 1 ? 'Далее' : 'Показать путь'))

function goToYagyi() {
  close()
  navigateTo(intent.value ? `/yagyi?theme=${intent.value}` : '/yagyi')
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(open, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <div class="backdrop" :class="{ open }" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Опрос: с чего начать">
      <div class="m-head">
        <div class="prog">
          <span>Шаг {{ step }} из 3</span>
          <span class="bar"><i :style="{ width: `${step * 33.33}%` }" /></span>
        </div>
        <button class="close" aria-label="Закрыть" @click="close">
          <AppIcon name="close" :sw="2" />
        </button>
      </div>

      <div class="m-body">
        <!-- Шаг 1 -->
        <div v-if="step === 1" class="qstep">
          <div class="qtitle">
            Какой у вас запрос?
          </div>
          <p class="qhint">
            Выберите, что важно сейчас.
          </p>
          <div class="grid">
            <button
              v-for="it in INTENTS"
              :key="it.id"
              class="card"
              :class="{ sel: intent === it.id }"
              @click="intent = it.id"
            >
              <span class="tile"><AppIcon :name="it.id" /></span>
              <span class="t">{{ it.title }}</span>
              <span class="h">{{ it.hint }}</span>
            </button>
          </div>
        </div>

        <!-- Шаг 2 -->
        <div v-else-if="step === 2" class="qstep">
          <div class="qtitle">
            Насколько давно это с вами?
          </div>
          <p class="qhint">
            Поможет астрологу точнее прочитать карту.
          </p>
          <div class="opts">
            <button
              v-for="d in DURATIONS"
              :key="d.v"
              class="opt"
              :class="{ sel: dur === d.v }"
              @click="dur = d.v"
            >
              <span class="rd" />{{ d.label }}
            </button>
          </div>
        </div>

        <!-- Шаг 3 -->
        <div v-else class="qstep">
          <template v-if="!submitted">
            <div class="qtitle">
              Ваш путь
            </div>
            <div class="rlead">
              <div class="rq">
                Запрос: <b>{{ intentTitle }}</b>
              </div>
              <div class="rt">
                Начните с разбора карты
              </div>
              <div class="rdesc">
                Астролог найдёт причину в вашей карте и назначит точные ягьи и даты под запрос.
              </div>
            </div>
            <div class="rsub">
              Подходящие ягьи по вашей теме
            </div>
            <div v-for="y in resultYagyas" :key="y.n" class="row-item">
              <div class="ic">
                <AppIcon name="flame" />
              </div>
              <div class="bd">
                <div class="rn">
                  {{ y.n }}
                </div>
                <div class="mt">
                  {{ y.d }} · по вашему запросу
                </div>
              </div>
              <button class="mini" @click="goToYagyi">
                Записаться
              </button>
            </div>

            <div class="qfield" style="margin-top:16px">
              <label for="q-name">Как к вам обращаться</label>
              <input id="q-name" v-model="name" type="text" placeholder="Имя">
            </div>
            <div class="qfield">
              <label for="q-contact">Контакт для связи</label>
              <input id="q-contact" v-model="contact" type="text" placeholder="Telegram или телефон">
            </div>
            <ConsentField id="q-consent" v-model="consent" />
            <p v-if="errorMsg" class="qhint" style="color:var(--vermilion)">
              {{ errorMsg }}
            </p>
            <button
              class="btn-primary"
              style="width:100%;margin-top:6px;background:var(--saffron);color:#FBF7EC"
              :disabled="submitting"
              @click="submit"
            >
              <AppIcon name="spark" />{{ submitting ? 'Отправляем…' : 'Записаться на разбор' }}
            </button>
          </template>

          <div v-else class="qok">
            <div class="qtitle">
              Заявка принята 🙏
            </div>
            <p>Мы свяжемся с вами в ближайшее время и подберём дату разбора.</p>
            <button
              class="btn-primary"
              style="width:100%;margin-top:18px;background:var(--saffron);color:#FBF7EC"
              @click="close"
            >
              Хорошо
            </button>
          </div>
        </div>
      </div>

      <div v-if="step < 3" class="m-foot">
        <button v-if="step > 1" class="foot-btn back" aria-label="Назад" @click="back">
          <AppIcon name="back" :sw="2" />
        </button>
        <button class="foot-btn next" :disabled="!canNext" @click="next">
          {{ nextLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
