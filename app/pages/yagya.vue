<script setup lang="ts">
useSeoMeta({
  title: 'Ягья — огненные ритуалы'
})
</script>

<template>
  <div>
    <UPageHero
      id="about"
      title="Ягья"
      description="Ягья — древний ведический ритуал подношения огню (Агни). Через огонь мантры и подношения передаются божественным силам. Каталог ритуалов появится здесь — сейчас раздел в разработке."
      :links="[
        { label: 'На главную', to: '/', color: 'neutral', variant: 'subtle', icon: 'i-lucide-arrow-left' }
      ]"
    />

    <UPageSection
      title="Скоро: каталог Ягья"
      description="Амавасья · Гаятри · Ашта-нага · Ганеша · Сарасвати · Дурга и другие — с описанием, эффектами и возможностью оставить заявку."
    >
      <UAlert
        icon="i-lucide-hammer"
        color="primary"
        variant="soft"
        title="Раздел наполняется"
        description="Данные ритуалов будут подгружаться из базы (Supabase)."
      />
    </UPageSection>
  </div>
</template>
