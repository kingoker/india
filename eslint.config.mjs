// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

export default withNuxt(
  betterTailwindcss.configs['correctness-error'],
  {
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    },
    rules: {
      // Проект использует собственный слой утилит в main.css
      // (.btn, .card, .eyebrow, .container-x и т.д.) — плагин Tailwind
      // принимает их за опечатки. Отключаем проверку неизвестных классов.
      'better-tailwindcss/no-unknown-classes': 'off',
      // Многоатрибутные теги в шаблонах допустимы для читабельности.
      'vue/max-attributes-per-line': 'off'
    }
  }
)
