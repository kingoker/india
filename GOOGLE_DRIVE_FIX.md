# Исправление отображения Google Drive изображений

## ✅ Проблема

Google Drive ссылки в формате:
```
https://drive.google.com/file/d/14DSJPaIWS6y48AOhjsgGy9wO4TZJ2j_p/view?usp=drive_link
```

Не отображаются как изображения, потому что это ссылки для просмотра файла, а не прямые ссылки на изображение.

## 🔧 Решение

Добавлена функция `convertGoogleDriveUrl` в компонент `GoogleDriveImage.vue`, которая:

1. **Определяет Google Drive ссылки** по наличию `drive.google.com/file/d/`
2. **Извлекает ID файла** с помощью регулярного выражения
3. **Преобразует в правильный URL** для получения изображения

## 📝 Код исправления

```javascript
// Функция для преобразования Google Drive ссылок
const convertGoogleDriveUrl = (url) => {
  if (!url) return ''
  
  // Проверяем, является ли это Google Drive ссылкой
  if (url.includes('drive.google.com/file/d/')) {
    // Извлекаем ID файла из URL
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
    if (match) {
      const fileId = match[1]
      // Возвращаем URL для получения изображения
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    }
  }
  
  return url
}
```

## 🔄 Преобразование ссылок

### До исправления:
```
https://drive.google.com/file/d/14DSJPaIWS6y48AOhjsgGy9wO4TZJ2j_p/view?usp=drive_link
```

### После исправления:
```
https://drive.google.com/thumbnail?id=14DSJPaIWS6y48AOhjsgGy9wO4TZJ2j_p&sz=w1000
```

## 📊 Результат

- ✅ **Изображения отображаются** корректно
- ✅ **Автоматическое преобразование** Google Drive ссылок
- ✅ **Обратная совместимость** с обычными ссылками
- ✅ **Логирование ошибок** для отладки

## 🎯 Дополнительные возможности

Можно настроить размер изображения, изменив параметр `sz`:
- `sz=w1000` - ширина 1000px
- `sz=w800` - ширина 800px
- `sz=w1200` - ширина 1200px

## 📁 Измененный файл

- `app/components/GoogleDriveImage.vue` - добавлена функция преобразования Google Drive ссылок

Теперь все Google Drive изображения должны отображаться корректно! 🖼️ 