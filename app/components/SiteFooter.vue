<script setup lang="ts">
/**
 * Подвал: документы по 152-ФЗ, реквизиты оператора, контакты и оговорка об услугах.
 * Реквизиты оформлены как выходные данные книги — название, точки-выноска, значение.
 */
const config = useRuntimeConfig()
const op = useOperator()
const docs = getLegalDocs()
const year = new Date().getFullYear()

const requisites = [
  { label: 'Исполнитель', value: op.name },
  { label: op.ogrnLabel, value: op.ogrn },
  { label: 'ИНН', value: op.inn },
  { label: 'Адрес', value: op.address },
  { label: 'E-mail', value: op.email }
]
</script>

<template>
  <footer class="foot">
    <div class="wrap">
      <AppOrnament name="divider" class="foot-div" />

      <div class="foot-grid">
        <div class="foot-brand">
          <NuxtLink to="/" class="foot-logo">
            <BrandMark :size="30" />
            <span>Взгляд сверху</span>
          </NuxtLink>
          <p>Ведическая астрология, ягьи и поездки в Индию — с двумя наставниками.</p>
          <ul class="foot-links">
            <li><a :href="config.public.telegramContact" target="_blank" rel="noopener">Telegram</a></li>
            <li class="foot-insta">
              <a :href="config.public.instagramUrl" target="_blank" rel="noopener">Instagram</a>
              <MetaNote />
            </li>
            <li><a :href="`mailto:${op.email}`">{{ op.email }}</a></li>
          </ul>
        </div>

        <nav class="foot-docs" aria-labelledby="foot-docs-h">
          <h2 id="foot-docs-h">
            Документы
          </h2>
          <ul>
            <li v-for="d in docs" :key="d.slug">
              <NuxtLink :to="`/docs/${d.slug}`">{{ d.short }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="foot-req">
          <h2>Сведения об исполнителе</h2>
          <dl class="leaders">
            <div v-for="r in requisites" :key="r.label">
              <dt>{{ r.label }}</dt>
              <dd :class="{ todo: isTodo(r.value) }">
                {{ r.value }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="foot-small">
        <p>
          Информация на сайте носит справочный характер и не является публичной офертой. Ягьи, астрологические разборы и практики — духовные услуги: они не заменяют помощь врача, юриста или финансового консультанта, а результат не гарантируется.
        </p>
        <p class="foot-copy">
          © {{ year }} {{ op.name }}
        </p>
      </div>
    </div>
  </footer>
</template>
