<template>
  <div class="rich-text-editor">
    <!-- Панель инструментов -->
    <div class="toolbar bg-gray-100 rounded-t-[30px] p-2 flex flex-wrap gap-2 items-center">
      <!-- Жирный -->
      <button
        type="button"
        @click="execCommand('bold')"
        :class="['p-2 rounded hover:bg-gray-200 transition-colors', isActive('bold') ? 'bg-blue-200' : '']"
        title="Жирный"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 11.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      </button>

      <!-- Курсив -->
      <button
        type="button"
        @click="execCommand('italic')"
        :class="['p-2 rounded hover:bg-gray-200 transition-colors', isActive('italic') ? 'bg-blue-200' : '']"
        title="Курсив"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
        </svg>
      </button>

      <!-- Подчеркнутый -->
      <button
        type="button"
        @click="execCommand('underline')"
        :class="['p-2 rounded hover:bg-gray-200 transition-colors', isActive('underline') ? 'bg-blue-200' : '']"
        title="Подчеркнутый"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7-2v2h14v-2H5z"/>
        </svg>
      </button>

      <!-- Разделитель -->
      <div class="w-px h-6 bg-gray-300 mx-2"></div>

      <!-- Шрифт -->
      <div class="relative">
        <button
          type="button"
          @click="toggleFontDropdown"
          class="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-1 min-w-[100px]"
          title="Шрифт"
        >
          <span class="truncate">{{ currentFont }}</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        
        <!-- Выпадающее меню шрифтов -->
        <div v-if="showFontDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[120px]">
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="font in fonts"
              :key="font.value"
              @click="selectFont(font.value)"
              class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              :style="{ fontFamily: font.style }"
            >
              <span class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <span v-if="currentFont === font.label" class="w-2 h-2 bg-blue-500 rounded"></span>
              </span>
              {{ font.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Размер шрифта -->
      <div class="relative">
        <button
          type="button"
          @click="toggleSizeDropdown"
          class="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-1 min-w-[60px]"
          title="Размер шрифта"
        >
          <span>{{ currentFontSize }}px</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        
        <!-- Выпадающее меню размеров -->
        <div v-if="showSizeDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[80px]">
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="size in fontSizes"
              :key="size"
              @click="selectFontSize(size)"
              class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <span class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <span v-if="currentFontSize === size" class="w-2 h-2 bg-blue-500 rounded"></span>
              </span>
              {{ size }}px
            </button>
          </div>
        </div>
      </div>

      <!-- Межстрочный интервал -->
      <div class="relative">
        <button
          type="button"
          @click="toggleLineHeightDropdown"
          class="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-1 min-w-[70px]"
          title="Межстрочный интервал"
        >
          <span>{{ currentLineHeight }}</span>
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        
        <!-- Выпадающее меню межстрочного интервала -->
        <div v-if="showLineHeightDropdown" class="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[80px]">
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="height in lineHeights"
              :key="height"
              @click="selectLineHeight(height)"
              class="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
            >
              <span class="w-4 h-4 border border-gray-300 rounded flex items-center justify-center">
                <span v-if="currentLineHeight === height" class="w-2 h-2 bg-blue-500 rounded"></span>
              </span>
              {{ height }}
            </button>
          </div>
        </div>
      </div>

      <!-- Разделитель -->
      <div class="w-px h-6 bg-gray-300 mx-2"></div>

      <!-- Список -->
      <button
        type="button"
        @click="execCommand('insertUnorderedList')"
        :class="['p-2 rounded hover:bg-gray-200 transition-colors', isActive('insertUnorderedList') ? 'bg-blue-200' : '']"
        title="Маркированный список"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
        </svg>
      </button>

      <button
        type="button"
        @click="execCommand('insertOrderedList')"
        :class="['p-2 rounded hover:bg-gray-200 transition-colors', isActive('insertOrderedList') ? 'bg-blue-200' : '']"
        title="Нумерованный список"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M2 17h2v-2H2v2zm0-4h2v-2H2v2zm0-4h2V7H2v2zm4 4h14v-2H6v2zm0 4h14v-2H6v2zM6 7v2h14V7H6z"/>
        </svg>
      </button>
    </div>

    <!-- Область редактирования -->
    <div
      ref="editor"
      class="editor-area px-[30px] py-[10px] border-2 border-gray-300 rounded-b-[30px] text-black placeholder-gray-400 focus:border-orange-400 focus:outline-none min-h-[120px]"
      contenteditable="true"
      @input="onInput"
      @blur="onBlur"
      @focus="onFocus"
      @click="onEditorClick"
      :placeholder="placeholder"
      :style="editorStyle"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const editor = ref(null)

// Состояние выпадающих меню
const showFontDropdown = ref(false)
const showSizeDropdown = ref(false)
const showLineHeightDropdown = ref(false)

// Текущие значения стилей
const currentFont = ref('Alice')
const currentFontSize = ref(34)
const currentLineHeight = ref(1.4)

// Данные для выпадающих меню
const fonts = [
  { value: 'alice', label: 'Alice', style: 'Alice, serif' },
  { value: 'montserrat', label: 'Montserrat', style: 'Montserrat, sans-serif' }
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 34, 36, 40, 48, 56, 64, 72]
const lineHeights = [0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.5, 3.0]

// Вычисляемые стили для редактора
const editorStyle = computed(() => ({
  fontSize: `${currentFontSize.value}px`,
  lineHeight: currentLineHeight.value,
  fontFamily: currentFont.value === 'Alice' ? 'Alice, serif' : 'Montserrat, sans-serif'
}))

// Инициализация редактора
onMounted(() => {
  if (props.modelValue) {
    editor.value.innerHTML = props.modelValue
    // Восстанавливаем стили из HTML
    restoreStylesFromHTML()
    // Обновляем текущие значения из HTML
    updateCurrentValuesFromHTML()
  }
  
  // Добавляем обработчик кликов вне выпадающих меню
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Обработка кликов вне выпадающих меню
const handleClickOutside = (event) => {
  if (!event.target.closest('.rich-text-editor')) {
    showFontDropdown.value = false
    showSizeDropdown.value = false
    showLineHeightDropdown.value = false
  }
}

// Следим за изменениями modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.innerHTML !== newValue) {
    editor.value.innerHTML = newValue || ''
    // Восстанавливаем стили из HTML
    restoreStylesFromHTML()
    // Обновляем текущие значения из HTML
    updateCurrentValuesFromHTML()
  }
})

// Обработка ввода
const onInput = () => {
  const html = saveStylesToHTML(editor.value.innerHTML)
  emit('update:modelValue', html)
}

// Обработка потери фокуса
const onBlur = () => {
  const html = saveStylesToHTML(editor.value.innerHTML)
  emit('update:modelValue', html)
}

// Обработка получения фокуса
const onFocus = () => {
  // Можно добавить дополнительную логику при фокусе
}

// Обработка клика в редакторе
const onEditorClick = () => {
  // Закрываем все выпадающие меню при клике в редактор
  showFontDropdown.value = false
  showSizeDropdown.value = false
  showLineHeightDropdown.value = false
}

// Переключение выпадающих меню
const toggleFontDropdown = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showFontDropdown.value = !showFontDropdown.value
  showSizeDropdown.value = false
  showLineHeightDropdown.value = false
}

const toggleSizeDropdown = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showSizeDropdown.value = !showSizeDropdown.value
  showFontDropdown.value = false
  showLineHeightDropdown.value = false
}

const toggleLineHeightDropdown = (event) => {
  event.preventDefault()
  event.stopPropagation()
  showLineHeightDropdown.value = !showLineHeightDropdown.value
  showFontDropdown.value = false
  showSizeDropdown.value = false
}

// Выбор шрифта
const selectFont = (font) => {
  console.log('Selecting font:', font)
  currentFont.value = font === 'alice' ? 'Alice' : 'Montserrat'
  applyStyleToSelection('fontFamily', font === 'alice' ? 'Alice, serif' : 'Montserrat, sans-serif')
  showFontDropdown.value = false
}

// Выбор размера шрифта
const selectFontSize = (size) => {
  console.log('Selecting font size:', size)
  currentFontSize.value = size
  applyStyleToSelection('fontSize', `${size}px`)
  showSizeDropdown.value = false
}

// Выбор межстрочного интервала
const selectLineHeight = (height) => {
  console.log('Selecting line height:', height)
  currentLineHeight.value = height
  applyStyleToSelection('lineHeight', height)
  showLineHeightDropdown.value = false
}

// Сохранение стилей в HTML
const saveStylesToHTML = (html) => {
  if (!html) return html
  
  // Создаем временный элемент для парсинга HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  
  // Функция для обработки элементов
  const processElement = (element) => {
    // Обрабатываем все дочерние элементы
    Array.from(element.children).forEach(child => {
      processElement(child)
    })
    
    // Сохраняем стили в data-атрибутах
    if (element.style && element.style.cssText) {
      const styles = element.style
      
      if (styles.fontSize) {
        element.setAttribute('data-font-size', styles.fontSize)
      }
      if (styles.lineHeight) {
        element.setAttribute('data-line-height', styles.lineHeight)
      }
      if (styles.fontFamily) {
        const fontFamily = styles.fontFamily
        if (fontFamily.includes('Alice')) {
          element.setAttribute('data-font-family', 'alice')
        } else if (fontFamily.includes('Montserrat')) {
          element.setAttribute('data-font-family', 'montserrat')
        }
      }
    }
  }
  
  processElement(tempDiv)
  return tempDiv.innerHTML
}

// Восстановление стилей из HTML
const restoreStylesFromHTML = () => {
  if (!editor.value) return
  
  const processElement = (element) => {
    // Обрабатываем все дочерние элементы
    Array.from(element.children).forEach(child => {
      processElement(child)
    })
    
    // Восстанавливаем стили из data-атрибутов
    const fontSize = element.getAttribute('data-font-size')
    const lineHeight = element.getAttribute('data-line-height')
    const fontFamily = element.getAttribute('data-font-family')
    
    if (fontSize) {
      element.style.fontSize = fontSize
    }
    if (lineHeight) {
      element.style.lineHeight = lineHeight
    }
    if (fontFamily) {
      element.style.fontFamily = fontFamily === 'alice' ? 'Alice, serif' : 'Montserrat, sans-serif'
    }
  }
  
  processElement(editor.value)
}

// Обновление текущих значений из HTML
const updateCurrentValuesFromHTML = () => {
  if (!editor.value) return
  
  // Ищем элементы с примененными стилями
  const elementsWithStyles = editor.value.querySelectorAll('[style*="font-size"], [style*="font-family"], [style*="line-height"]')
  
  if (elementsWithStyles.length > 0) {
    // Берем первый элемент со стилями
    const element = elementsWithStyles[0]
    const styles = element.style
    
    // Обновляем размер шрифта
    if (styles.fontSize) {
      const fontSize = parseInt(styles.fontSize.replace('px', ''))
      if (fontSize && fontSizes.includes(fontSize)) {
        currentFontSize.value = fontSize
        console.log('Updated font size from HTML:', fontSize)
      }
    }
    
    // Обновляем шрифт
    if (styles.fontFamily) {
      const fontFamily = styles.fontFamily
      if (fontFamily.includes('Alice')) {
        currentFont.value = 'Alice'
        console.log('Updated font from HTML: Alice')
      } else if (fontFamily.includes('Montserrat')) {
        currentFont.value = 'Montserrat'
        console.log('Updated font from HTML: Montserrat')
      }
    }
    
    // Обновляем межстрочный интервал
    if (styles.lineHeight) {
      const lineHeight = parseFloat(styles.lineHeight)
      if (lineHeight && lineHeights.includes(lineHeight)) {
        currentLineHeight.value = lineHeight
        console.log('Updated line height from HTML:', lineHeight)
      }
    }
  } else {
    // Если нет элементов со стилями, проверяем data-атрибуты
    const elementsWithData = editor.value.querySelectorAll('[data-font-size], [data-font-family], [data-line-height]')
    
    if (elementsWithData.length > 0) {
      const element = elementsWithData[0]
      
      // Обновляем размер шрифта из data-атрибута
      const fontSizeAttr = element.getAttribute('data-font-size')
      if (fontSizeAttr) {
        const fontSize = parseInt(fontSizeAttr.replace('px', ''))
        if (fontSize && fontSizes.includes(fontSize)) {
          currentFontSize.value = fontSize
          console.log('Updated font size from data attribute:', fontSize)
        }
      }
      
      // Обновляем шрифт из data-атрибута
      const fontFamilyAttr = element.getAttribute('data-font-family')
      if (fontFamilyAttr) {
        if (fontFamilyAttr === 'alice') {
          currentFont.value = 'Alice'
          console.log('Updated font from data attribute: Alice')
        } else if (fontFamilyAttr === 'montserrat') {
          currentFont.value = 'Montserrat'
          console.log('Updated font from data attribute: Montserrat')
        }
      }
      
      // Обновляем межстрочный интервал из data-атрибута
      const lineHeightAttr = element.getAttribute('data-line-height')
      if (lineHeightAttr) {
        const lineHeight = parseFloat(lineHeightAttr)
        if (lineHeight && lineHeights.includes(lineHeight)) {
          currentLineHeight.value = lineHeight
          console.log('Updated line height from data attribute:', lineHeight)
        }
      }
    }
  }
}

// Применение стиля к выделенному тексту
const applyStyleToSelection = (property, value) => {
  console.log('Applying style:', property, value)
  if (!editor.value) {
    console.warn('Editor not found')
    return
  }
  
  editor.value.focus()
  
  // Ждем немного для стабилизации
  setTimeout(() => {
    const selection = window.getSelection()
    console.log('Selection:', selection)
    if (!selection || selection.rangeCount === 0) {
      console.warn('No selection found')
      return
    }
    
    const range = selection.getRangeAt(0)
    console.log('Range:', range)
    if (!range) {
      console.warn('No range found')
      return
    }
    
    if (range.collapsed) {
      console.log('Range is collapsed, applying to block')
      // Если нет выделения, применяем к текущему блоку
      const container = range.commonAncestorContainer
      const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
      
      if (element && element !== editor.value) {
        console.log('Applying to element:', element)
        element.style[property] = value
        // Добавляем data-атрибут для сохранения
        element.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
      }
    } else {
      console.log('Range has selection, applying to selection')
      
      // Проверяем, можно ли обернуть содержимое
      const canSurround = range.startContainer.nodeType === Node.TEXT_NODE && 
                         range.endContainer.nodeType === Node.TEXT_NODE &&
                         range.startContainer === range.endContainer
      
      if (canSurround) {
        // Если выделение находится в одном текстовом узле, оборачиваем его
        const span = document.createElement('span')
        span.style[property] = value
        // Добавляем data-атрибут для сохранения
        span.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
        
        try {
          range.surroundContents(span)
          console.log('Successfully wrapped content')
        } catch (e) {
          console.warn('Error wrapping content:', e)
          applyStyleToParent(property, value)
        }
      } else {
        // Если выделение сложное, применяем стили к каждому текстовому узлу
        console.log('Complex selection, applying to text nodes')
        applyStyleToTextNodes(range, property, value)
      }
    }
    
    // Сохраняем стили в HTML
    const html = saveStylesToHTML(editor.value.innerHTML)
    console.log('Saved HTML:', html)
    emit('update:modelValue', html)
  }, 10)
}

// Применение стиля к родительскому элементу
const applyStyleToParent = (property, value) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  const range = selection.getRangeAt(0)
  const container = range.commonAncestorContainer
  const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container
  
  if (element && element !== editor.value) {
    console.log('Applying to parent element:', element)
    element.style[property] = value
    element.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
  }
}

// Применение стиля к текстовым узлам в выделении
const applyStyleToTextNodes = (range, property, value) => {
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT
        }
        return NodeFilter.FILTER_REJECT
      }
    }
  )
  
  const textNodes = []
  let node
  while (node = walker.nextNode()) {
    textNodes.push(node)
  }
  
  textNodes.forEach(textNode => {
    if (textNode.parentElement && textNode.parentElement !== editor.value) {
      console.log('Applying to text node parent:', textNode.parentElement)
      textNode.parentElement.style[property] = value
      textNode.parentElement.setAttribute(`data-${property.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    }
  })
}

// Выполнение команд форматирования
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  editor.value.focus()
  
  // Сохраняем стили в HTML
  const html = saveStylesToHTML(editor.value.innerHTML)
  emit('update:modelValue', html)
}

// Проверка активного состояния кнопки
const isActive = (command) => {
  return document.queryCommandState(command)
}

// Метод для программной установки HTML
const setHTML = (html) => {
  if (editor.value) {
    editor.value.innerHTML = html
    // Восстанавливаем стили из HTML
    restoreStylesFromHTML()
    // Обновляем текущие значения из HTML
    updateCurrentValuesFromHTML()
    emit('update:modelValue', html)
  }
}

// Метод для получения HTML
const getHTML = () => {
  if (editor.value) {
    // Сохраняем стили в HTML перед возвратом
    return saveStylesToHTML(editor.value.innerHTML)
  }
  return ''
}

// Экспортируем методы для внешнего использования
defineExpose({
  setHTML,
  getHTML
})
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.editor-area {
  line-height: 1.4;
}

.editor-area:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}

.editor-area:focus {
  outline: none;
}

/* Стили для списков */
.editor-area ul, .editor-area ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

.editor-area li {
  margin: 0.25em 0;
}

/* Стили для заголовков */
.editor-area h1, .editor-area h2, .editor-area h3, .editor-area h4, .editor-area h5, .editor-area h6 {
  margin: 0.5em 0;
  font-weight: bold;
}

.editor-area h1 { font-size: 1.5em; }
.editor-area h2 { font-size: 1.3em; }
.editor-area h3 { font-size: 1.1em; }

/* Стили для выпадающих меню */
.toolbar button {
  user-select: none;
}

.toolbar button:focus {
  outline: none;
}

/* Анимация для выпадающих меню */
.toolbar .absolute {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 