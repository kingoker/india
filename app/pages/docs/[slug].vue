<script setup lang="ts">
const route = useRoute()
const doc = getLegalDoc(String(route.params.slug))

if (!doc) {
  throw createError({ statusCode: 404, statusMessage: 'Документ не найден', fatal: true })
}

const op = useOperator()
const others = getLegalDocs().filter(d => d.slug !== doc.slug)

useSeoMeta({
  title: doc.title,
  description: fillOperator(doc.intro, op).slice(0, 160)
})
</script>

<template>
  <section v-if="doc" class="inner">
    <InnerTop />
    <div class="wrap">
      <article class="legal">
        <header class="pagehead">
          <h1>{{ doc.title }}</h1>
          <p class="legal-date">
            Редакция от {{ LEGAL_VERSION_LABEL }}
          </p>
        </header>

        <p class="legal-intro">
          <LegalText :text="doc.intro" />
        </p>

        <section v-for="(s, i) in doc.sections" :key="s.h" class="legal-sec">
          <h2><span class="n">{{ i + 1 }}.</span> {{ s.h }}</h2>
          <p v-for="(t, j) in s.p" :key="`p${j}`">
            <LegalText :text="t" />
          </p>
          <ul v-if="s.items">
            <li v-for="(it, k) in s.items" :key="k">
              <LegalText :text="it" />
            </li>
          </ul>
          <p v-for="(t, j) in s.after" :key="`a${j}`">
            <LegalText :text="t" />
          </p>
        </section>

        <nav class="legal-more" aria-label="Другие документы">
          <NuxtLink v-for="d in others" :key="d.slug" :to="`/docs/${d.slug}`">
            {{ d.short }}
          </NuxtLink>
        </nav>
      </article>
    </div>
  </section>
</template>
