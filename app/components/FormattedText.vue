<template>
  <div 
    class="formatted-text"
    :class="textClass"
    v-html="sanitizedHtml"
  ></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  html: {
    type: String,
    default: ''
  },
  textClass: {
    type: String,
    default: ''
  }
})

// Простая санитизация HTML для безопасности
const sanitizedHtml = computed(() => {
  if (!props.html) return ''
  
  // Разрешаем только безопасные HTML теги
  const allowedTags = [
    'b', 'strong', 'i', 'em', 'u', 'ins', 's', 'strike', 'del',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'div', 'span',
    'ul', 'ol', 'li',
    'blockquote', 'q',
    'code', 'pre',
    'mark', 'small', 'sub', 'sup'
  ]
  
  const allowedAttributes = [
    'class', 'style', 'id', 'title'
  ]
  
  // Простая очистка от нежелательных тегов
  let cleanHtml = props.html
  
  // Удаляем script теги
  cleanHtml = cleanHtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Удаляем style теги
  cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Удаляем iframe теги
  cleanHtml = cleanHtml.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Удаляем object теги
  cleanHtml = cleanHtml.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
  
  // Удаляем embed теги
  cleanHtml = cleanHtml.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
  
  // Удаляем on* атрибуты (события)
  cleanHtml = cleanHtml.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Удаляем javascript: в href
  cleanHtml = cleanHtml.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
  
  // Удаляем все цветовые атрибуты
  cleanHtml = cleanHtml.replace(/\s*color\s*=\s*["'][^"']*["']/gi, '')
  cleanHtml = cleanHtml.replace(/\s*foreColor\s*=\s*["'][^"']*["']/gi, '')
  
  // Удаляем color из style атрибутов
  cleanHtml = cleanHtml.replace(/style\s*=\s*["'][^"']*color\s*:\s*[^;]*;?[^"']*["']/gi, (match) => {
    // Удаляем только color из style, оставляя остальные стили
    return match.replace(/color\s*:\s*[^;]*;?\s*/gi, '')
  })
  
  // Удаляем пустые style атрибуты
  cleanHtml = cleanHtml.replace(/\s*style\s*=\s*["']\s*["']/gi, '')
  
  return cleanHtml
})
</script>

<style scoped>
.formatted-text {
  line-height: 1.4;
}

.formatted-text :deep(b),
.formatted-text :deep(strong) {
  font-weight: bold;
}

.formatted-text :deep(i),
.formatted-text :deep(em) {
  font-style: italic;
}

.formatted-text :deep(u),
.formatted-text :deep(ins) {
  text-decoration: underline;
}

.formatted-text :deep(s),
.formatted-text :deep(strike),
.formatted-text :deep(del) {
  text-decoration: line-through;
}

.formatted-text :deep(ul),
.formatted-text :deep(ol) {
  margin: 0.5em 0;
  padding-left: 2em;
}

.formatted-text :deep(li) {
  margin: 0.25em 0;
}

.formatted-text :deep(h1),
.formatted-text :deep(h2),
.formatted-text :deep(h3),
.formatted-text :deep(h4),
.formatted-text :deep(h5),
.formatted-text :deep(h6) {
  margin: 0.5em 0;
  font-weight: bold;
}

.formatted-text :deep(h1) { font-size: 1.5em; }
.formatted-text :deep(h2) { font-size: 1.3em; }
.formatted-text :deep(h3) { font-size: 1.1em; }

.formatted-text :deep(blockquote) {
  margin: 1em 0;
  padding: 0.5em 1em;
  border-left: 3px solid #ccc;
  background-color: #f9f9f9;
}

.formatted-text :deep(code) {
  background-color: #f4f4f4;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.formatted-text :deep(pre) {
  background-color: #f4f4f4;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  font-family: monospace;
}

.formatted-text :deep(mark) {
  background-color: #ffeb3b;
  padding: 0.1em 0.2em;
}

.formatted-text :deep(small) {
  font-size: 0.8em;
}

.formatted-text :deep(sub) {
  vertical-align: sub;
  font-size: 0.8em;
}

.formatted-text :deep(sup) {
  vertical-align: super;
  font-size: 0.8em;
}
</style> 