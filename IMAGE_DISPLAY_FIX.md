# Исправление отображения изображений

## ✅ Проблема

Изображения не отображались на сайте из-за:
- Неправильного Google Drive URL (thumbnail API не работает для всех файлов)
- SSR проблем с изображениями
- Отсутствия fallback для случаев ошибки загрузки

## 🔧 Решение

### 1. Исправление Google Drive URL

**До:**
```javascript
return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
```

**После:**
```javascript
return `https://drive.google.com/uc?export=view&id=${fileId}`
```

### 2. Добавление fallback для ошибок загрузки

```javascript
const handleImageError = (event) => {
  console.warn('Ошибка загрузки изображения:', event.target.src)
  
  // Если это Google Drive ссылка, пробуем альтернативный URL
  const currentSrc = event.target.src
  if (currentSrc.includes('drive.google.com/uc?export=view')) {
    const fileId = currentSrc.match(/id=([a-zA-Z0-9_-]+)/)?.[1]
    if (fileId) {
      // Пробуем thumbnail URL как fallback
      event.target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
      return
    }
  }
  
  emit('error', event)
}
```

### 3. Убрали SSR для изображений

```vue
<template>
  <ClientOnly>
    <img
      v-if="isClient && finalImageUrl"
      :src="finalImageUrl"
      :alt="alt"
      :class="imageClass"
      loading="lazy"
      decoding="async"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    <template #fallback>
      <div :class="imageClass" class="bg-gray-200 animate-pulse" style="min-height: 200px;"></div>
    </template>
  </ClientOnly>
</template>
```

### 4. Добавили проверку на клиентскую сторону

```javascript
const isClient = ref(false)

// Проверяем, что мы на клиенте
if (typeof window !== 'undefined') {
  isClient.value = true
}
```

## 📊 Результаты

### До исправления:
- ❌ Изображения не отображались
- ❌ Ошибки загрузки Google Drive изображений
- ❌ SSR проблемы с изображениями
- ❌ Нет fallback для ошибок

### После исправления:
- ✅ **Изображения отображаются** корректно
- ✅ **Правильный Google Drive URL** - `uc?export=view`
- ✅ **Fallback для ошибок** - автоматический переход на thumbnail
- ✅ **Убрали SSR** для изображений
- ✅ **Проверка на клиенте** перед рендерингом

## 🔄 Логика работы

1. **Проверка на клиенте** - изображение рендерится только на клиенте
2. **Преобразование Google Drive URL** - из ссылки для просмотра в прямую ссылку
3. **Fallback при ошибке** - если прямая ссылка не работает, пробуем thumbnail
4. **Ленивая загрузка** - изображения загружаются только при необходимости

## 📁 Измененный файл

- `app/components/GoogleDriveImage.vue` - исправлено отображение изображений

Теперь все изображения должны отображаться корректно! 🖼️ 