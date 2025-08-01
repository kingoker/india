# Yagya - Сайт туров и ягьи

Современный веб-сайт для бронирования туров и ягьи, построенный на Nuxt 3 с использованием Supabase.

## Возможности

- 🏛️ **Туры**: Просмотр и бронирование духовных туров
- 🔥 **Ягьи**: Динамические карточки ягьи с фильтрацией
- 📝 **Бронирование**: Универсальная форма бронирования для туров и ягьи
- 🔐 **Админ-панель**: Система входа через пароль для администраторов
- 📱 **Адаптивность**: Полная адаптация под мобильные устройства
- 🎨 **Современный дизайн**: Красивый UI с использованием Tailwind CSS

## Админ-функционал

Система админ-аутентификации с автоматической регистрацией:

1. **Доступ**: Добавьте `?admin` к любому URL сайта (например: `http://localhost:3000/yagya?admin`)
2. **Аутентификация**: Введите пароль в появившемся попапе
3. **Автоматическая регистрация**: Если пользователь `admin@admin.com` не существует, он будет создан автоматически
4. **Управление**: После входа доступны функции администрирования

### Управление турами

После входа в админ-панель на странице `/tours` появится карточка с плюсом для добавления новых туров:

- **Добавление туров**: Нажмите на карточку с плюсом для открытия формы добавления
- **Автоматическая генерация slug**: При вводе названия на русском языке slug генерируется автоматически
- **Валидация**: Все поля обязательны для заполнения
- **Обновление списка**: После добавления тур автоматически появляется в списке

### Настройка админ-доступа

См. файл `ADMIN_SETUP.md` для подробных инструкций по настройке.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
