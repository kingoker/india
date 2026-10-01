<script setup lang="ts">
/** Модалка «Оставить отзыв». Публикуется после модерации, уведомление — в Telegram. */
const {
  formOpen, rating, text, author, contact, videoUrl, consent,
  submitting, submitted, errorMsg, closeForm, submit
} = useReviews()

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && formOpen.value) closeForm()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

watch(formOpen, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<template>
  <div class="backdrop" :class="{ open: formOpen }" @click.self="closeForm">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Оставить отзыв">
      <div class="m-head">
        <div class="prog">
          <span>Ваш отзыв</span>
        </div>
        <button class="close" aria-label="Закрыть" @click="closeForm">
          <AppIcon name="close" :sw="2" />
        </button>
      </div>

      <div class="m-body">
        <div class="qstep">
          <template v-if="!submitted">
            <div class="qtitle">
              Поделитесь опытом
            </div>
            <p class="qhint">
              Отзыв появится на сайте после короткой модерации.
            </p>

            <div class="qfield">
              <label>Ваша оценка</label>
              <AppStars v-model:value="rating" interactive :size="30" />
            </div>

            <div class="qfield">
              <label for="rev-text">Что было ценно</label>
              <textarea
                id="rev-text"
                v-model="text"
                rows="4"
                placeholder="Разбор, практика, поездка — что откликнулось и что изменилось."
              />
            </div>

            <div class="qfield">
              <label for="rev-name">Как подписать <span class="opt-tag">по желанию</span></label>
              <input id="rev-name" v-model="author" type="text" placeholder="Имя">
            </div>

            <div class="qfield">
              <label for="rev-video">Ссылка на видеоотзыв <span class="opt-tag">по желанию</span></label>
              <input id="rev-video" v-model="videoUrl" type="url" placeholder="YouTube или ссылка на видео">
            </div>

            <div class="qfield">
              <label for="rev-contact">Контакт для связи <span class="opt-tag">по желанию</span></label>
              <input id="rev-contact" v-model="contact" type="text" placeholder="Telegram или e-mail">
            </div>

            <ConsentField id="rev-consent" v-model="consent" publish />
            <p v-if="errorMsg" class="qhint" style="color:var(--vermilion)">
              {{ errorMsg }}
            </p>
            <button
              class="btn-primary"
              style="width:100%;margin-top:6px;background:var(--saffron);color:#FBF7EC"
              :disabled="submitting"
              @click="submit"
            >
              <AppIcon name="spark" />{{ submitting ? 'Отправляем…' : 'Отправить на модерацию' }}
            </button>
          </template>

          <div v-else class="qok">
            <div class="qtitle">
              Спасибо 🙏
            </div>
            <p>Отзыв получен и уйдёт на модерацию. После проверки он появится на сайте.</p>
            <button
              class="btn-primary"
              style="width:100%;margin-top:18px;background:var(--saffron);color:#FBF7EC"
              @click="closeForm"
            >
              Хорошо
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
