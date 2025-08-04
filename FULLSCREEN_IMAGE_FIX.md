# Исправление деформации изображений в fullscreen

## ✅ Проблема

При открытии изображений на весь экран со страницы тура происходила деформация картинок из-за:
- Фиксированных размеров `width="900" height="900"`
- Неправильных CSS классов для адаптивности
- Отсутствия поддержки клавиши Escape

## 🔧 Решение

### 1. Исправление CSS классов для изображения

**До:**
```vue
<GoogleDriveImage 
  :src="tourImages[fullscreenImage].image_url" 
  class="max-w-full max-h-full rounded-[60px] shadow-2xl" 
  width="900" 
  height="900" 
  :alt="tourImages[fullscreenImage].title || `Фото ${fullscreenImage+1}`" 
/>
```

**После:**
```vue
<GoogleDriveImage 
  :src="tourImages[fullscreenImage].image_url" 
  class="max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain rounded-[20px] shadow-2xl" 
  :alt="tourImages[fullscreenImage].title || `Фото ${fullscreenImage+1}`" 
/>
```

### 2. Улучшение UX

- **Убрал фиксированные размеры** - теперь изображение адаптируется под экран
- **Добавил `object-contain`** - изображение сохраняет пропорции
- **Использовал `max-w-[95vw] max-h-[95vh]`** - изображение занимает 95% экрана с отступами
- **Добавил `w-auto h-auto`** - автоматическое определение размеров

### 3. Добавление поддержки клавиши Escape

```javascript
function openImage(idx) { 
  if (idx >= 0 && idx < galleryImages.value.length) {
    fullscreenImage.value = idx 
    // Добавляем обработчик клавиши Escape
    document.addEventListener('keydown', handleEscapeKey)
  }
}

function closeImage() { 
  fullscreenImage.value = null 
  // Удаляем обработчик клавиши Escape
  document.removeEventListener('keydown', handleEscapeKey)
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeImage()
  }
}
```

### 4. Очистка обработчиков

```javascript
// Очистка обработчиков при размонтировании компонента
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
```

## 📊 Результаты

### До исправления:
- ❌ Деформация изображений
- ❌ Фиксированные размеры не подходят для разных экранов
- ❌ Нет поддержки клавиши Escape
- ❌ Плохой UX

### После исправления:
- ✅ **Изображения сохраняют пропорции** - `object-contain`
- ✅ **Адаптивность под любой экран** - `max-w-[95vw] max-h-[95vh]`
- ✅ **Поддержка клавиши Escape** для закрытия
- ✅ **Правильная очистка обработчиков** при размонтировании
- ✅ **Улучшенный UX** с hover эффектами на кнопке закрытия

## 🎯 Дополнительные улучшения

- **Кнопка закрытия** теперь имеет hover эффект
- **Закругление углов** уменьшено с 60px до 20px для лучшего вида
- **Отступы от краев экрана** 5% для лучшего восприятия
- **Автоматическое определение размеров** изображения

## 📁 Измененный файл

- `app/pages/tours/[slug].vue` - исправлено отображение fullscreen изображений

Теперь изображения в fullscreen режиме отображаются корректно без деформации! 🖼️ 