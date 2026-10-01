<script setup lang="ts">
/** Отметка согласия на обработку персональных данных — не отмечена по умолчанию (ст. 9 152-ФЗ). */
defineProps<{ id: string, publish?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label :for="id" class="consent">
    <input :id="id" v-model="model" type="checkbox">
    <span>
      Даю <NuxtLink to="/docs/consent" target="_blank">согласие на обработку персональных данных</NuxtLink><template v-if="publish"> и публикацию отзыва с подписью</template>. Подробности — в <NuxtLink to="/docs/privacy" target="_blank">политике</NuxtLink>.
    </span>
  </label>
</template>
