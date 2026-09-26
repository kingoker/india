<script setup lang="ts">
useSeoMeta({
  title: 'Практика огня для глубинных изменений'
})
</script>

<template>
  <div>
    <UPageHero
      title="Практика огня: Ягья для глубинных изменений"
      description="Ведические огненные ритуалы, проводимые браминами в Индии. Очищение кармы, защита, мудрость и исполнение благих намерений — через древнюю практику огня."
      :links="[
        { label: 'Смотреть Ягьи', to: '/yagya', trailingIcon: 'i-lucide-arrow-right', size: 'xl', color: 'primary' },
        { label: 'Что такое Ягья?', to: '/yagya#about', size: 'xl', color: 'neutral', variant: 'subtle' }
      ]"
    />

    <UPageSection
      title="Направления"
      description="Четыре пути практики — выбери своё."
      :features="[
        { icon: 'i-lucide-flame', title: 'Ягья', description: 'Огненные ритуалы по божествам и целям: предки, мудрость, защита, устранение препятствий.', to: '/yagya' },
        { icon: 'i-lucide-graduation-cap', title: 'Курс', description: 'Обучающая программа по ведическим практикам и философии.', to: '/kurs' },
        { icon: 'i-lucide-flower', title: 'Практики', description: 'Медитации, мантры и духовные практики на каждый день.', to: '/praktiki' },
        { icon: 'i-lucide-plane', title: 'Туры', description: 'Путешествия к местам силы в Индию с сопровождением.', to: '/tury' }
      ]"
    />

    <UPageSection id="zayavka">
      <UPageCTA
        title="Оставьте заявку"
        description="Напишите нам — подберём Ягью или практику под вашу цель. Ответим в Telegram."
        variant="subtle"
        :links="[
          { label: 'Написать в Telegram', to: 'https://t.me/vzglyad_sverhy', target: '_blank', icon: 'i-simple-icons-telegram', color: 'primary' }
        ]"
      />
    </UPageSection>
  </div>
</template>
