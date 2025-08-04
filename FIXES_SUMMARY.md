# Сводка исправлений ошибок

## ✅ Исправленные проблемы

### 1. Ошибка с несуществующими полями БД
**Проблема**: `column tours.price does not exist` и `column tours.duration does not exist`

**Решение**: Убрал несуществующие поля из запросов к таблице `tours`

**Измененные файлы**:
- `composables/useTours.ts` - убрал `price, duration` из селекта
- `server/api/preload-data.get.ts` - убрал `price, duration` из селекта

**Используемые поля** (согласно структуре БД):
- `id, title, description, date_from, date_to, image_url, slug`

### 2. Ошибка с компонентом GoogleDriveImage
**Проблема**: `Missing required prop: 'imageUrl'` - компонент ожидал `imageUrl`, а получал `src`

**Решение**: Добавил поддержку обоих вариантов пропсов

**Изменения в `app/components/GoogleDriveImage.vue`**:
- Добавил поддержку пропса `src` (опциональный)
- Сделал `imageUrl` опциональным
- Добавил computed `finalImageUrl` для выбора между `imageUrl` и `src`
- Обернул в `ClientOnly` для предотвращения hydration mismatch

### 3. Hydration mismatch ошибки
**Проблема**: Несоответствие между серверным и клиентским рендерингом

**Решение**: Убрал `ClientOnly` из skeleton компонентов, оставил только в `GoogleDriveImage`

**Измененные файлы**:
- `app/components/GoogleDriveImage.vue` - добавлен `ClientOnly` с правильным fallback
- `app/components/TourCardSkeleton.vue` - убран `ClientOnly`, возвращен к простому виду
- `app/components/YagyaCardSkeleton.vue` - убран `ClientOnly`, возвращен к простому виду

## 🔧 Технические детали

### ClientOnly компонент
```vue
<ClientOnly>
  <!-- Контент, который рендерится только на клиенте -->
  <template #fallback>
    <!-- Fallback для сервера -->
  </template>
</ClientOnly>
```

### Поддержка разных пропсов
```javascript
const props = defineProps({
  imageUrl: { type: String, required: false },
  src: { type: String, required: false }
})

const finalImageUrl = computed(() => {
  return props.imageUrl || props.src || ''
})
```

## 📊 Результаты

- ✅ **Убраны ошибки БД** - запросы используют только существующие поля
- ✅ **Исправлен компонент изображений** - поддерживает оба варианта пропсов
- ✅ **Устранены hydration ошибки** - skeleton компоненты рендерятся одинаково на сервере и клиенте
- ✅ **Сервер работает стабильно** - HTTP 200 OK

## 🎯 Рекомендации

1. **Всегда проверяйте структуру БД** перед написанием запросов
2. **Используйте ClientOnly** для компонентов с анимациями или DOM-манипуляциями
3. **Поддерживайте обратную совместимость** пропсов в компонентах
4. **Тестируйте на сервере и клиенте** для выявления hydration проблем

Все ошибки исправлены! 🚀 