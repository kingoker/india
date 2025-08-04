import { ref, onMounted } from 'vue'
import type { YagyaWithCategories, Category, YagyaFilters } from '../types/database'

export function useYagya() {
  const yagya = ref<YagyaWithCategories[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lastFetch = ref<number>(0)
  const CACHE_DURATION = 30 * 60 * 1000 // 30 минут

  // Кэширование в localStorage
  const YAGYA_CACHE_KEY = 'yagya_data_cache'
  const YAGYA_CACHE_TIMESTAMP_KEY = 'yagya_data_timestamp'
  const CATEGORIES_CACHE_KEY = 'yagya_categories_cache'
  const CATEGORIES_CACHE_TIMESTAMP_KEY = 'yagya_categories_timestamp'

  const getCachedData = (key: string, timestampKey: string) => {
    if (process.client) {
      try {
        const cached = localStorage.getItem(key)
        const timestamp = localStorage.getItem(timestampKey)
        
        if (cached && timestamp) {
          const age = Date.now() - parseInt(timestamp)
          if (age < CACHE_DURATION) {
            return JSON.parse(cached)
          }
        }
      } catch (e) {
        console.warn('Ошибка чтения кэша:', e)
      }
    }
    return null
  }

  const setCachedData = (key: string, timestampKey: string, data: any) => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(data))
        localStorage.setItem(timestampKey, Date.now().toString())
      } catch (e) {
        console.warn('Ошибка записи кэша:', e)
      }
    }
  }

  const fetchYagya = async (filters?: YagyaFilters, force = false) => {
    // Проверяем кэш в памяти
    const now = Date.now()
    if (!force && yagya.value.length > 0 && (now - lastFetch.value) < CACHE_DURATION) {
      return
    }

    // Проверяем localStorage кэш
    if (!force && process.client) {
      const cachedYagya = getCachedData(YAGYA_CACHE_KEY, YAGYA_CACHE_TIMESTAMP_KEY)
      const cachedCategories = getCachedData(CATEGORIES_CACHE_KEY, CATEGORIES_CACHE_TIMESTAMP_KEY)
      
      if (cachedYagya && cachedCategories) {
        yagya.value = cachedYagya
        categories.value = cachedCategories
        lastFetch.value = now
        loading.value = false
        return
      }
    }
    
    loading.value = true
    error.value = null
    try {
      const supabase = useSupabaseClient()
      
      // Загружаем категории с оптимизацией
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, description, color, icon, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
      
      if (categoriesError) {
        throw categoriesError
      }
      
      categories.value = categoriesData || []
      
      // Загружаем ягьи с оптимизацией
      let query = supabase
        .from('yagya')
        .select(`
          id, title, description, date_from, date_to, time, image_url, is_featured, created_at, updated_at,
          yagya_categories(
            category:categories(id, name, slug, color, icon)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100) // Ограничиваем количество записей
      
      // Применяем фильтры
      if (filters?.category_slug) {
        query = query.eq('yagya_categories.category.slug', filters.category_slug)
      }
      
      if (filters?.is_featured) {
        query = query.eq('is_featured', true)
      }
      
      const { data: yagyaData, error: yagyaError } = await query
      
      if (yagyaError) {
        throw yagyaError
      }
      
      // Преобразуем данные в нужный формат
      const transformedYagya: YagyaWithCategories[] = (yagyaData || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date_from: item.date_from,
        date_to: item.date_to,
        time: item.time,
        image_url: item.image_url,
        is_featured: item.is_featured,
        created_at: item.created_at,
        updated_at: item.updated_at,
        categories: item.yagya_categories?.filter((yc: any) => yc.category)?.map((yc: any) => yc.category) || []
      }))
      
      yagya.value = transformedYagya
      lastFetch.value = now
      
      // Кэшируем в localStorage
      setCachedData(YAGYA_CACHE_KEY, YAGYA_CACHE_TIMESTAMP_KEY, transformedYagya)
      setCachedData(CATEGORIES_CACHE_KEY, CATEGORIES_CACHE_TIMESTAMP_KEY, categoriesData)
      
    } catch (err) {
      console.error('Ошибка загрузки ягьи:', err)
      error.value = err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных'
      
      // Fallback на mock данные в случае ошибки
      const mockCategories: Category[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Семья',
          slug: 'family',
          description: 'Ягьи для гармонии в семье и отношений',
          color: '#f59e42',
          icon: 'family',
          sort_order: 1,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440102',
          name: 'Деньги',
          slug: 'money',
          description: 'Ягьи для финансового благополучия',
          color: '#10b981',
          icon: 'money',
          sort_order: 2,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440103',
          name: 'Карьера',
          slug: 'career',
          description: 'Ягьи для профессионального роста',
          color: '#3b82f6',
          icon: 'career',
          sort_order: 3,
          is_active: true,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ]

      const mockYagya: YagyaWithCategories[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Ягья на БЛАГОСОСТОЯНИЯ',
          description: 'РАБОТА • БИЗНЕС • КАРЬЕРА • ДЕНЬГИ 💰',
          date_from: '2025-04-29',
          date_to: '2025-04-30',
          time: '16:00:00',
          image_url: 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg',
          is_featured: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          categories: [mockCategories[0]!, mockCategories[1]!]
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Лунное Затмение Вступление в КОРИДОР ЗАТМЕНИЙ',
          description: 'Ягья для гармоничного прохождения 2х недель между затмениями',
          date_from: '2025-03-13',
          date_to: undefined,
          time: '16:00:00',
          image_url: 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg',
          is_featured: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          categories: [mockCategories[0]!]
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          title: 'Ягья на КАРЬЕРУ',
          description: 'РОСТ • ПРОДВИЖЕНИЕ • УСПЕХ • ПРИЗНАНИЕ 🚀',
          date_from: '2025-05-15',
          date_to: undefined,
          time: '18:00:00',
          image_url: 'https://saletur.ru/galery/tfoto/big/061/49/614981.jpg',
          is_featured: false,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          categories: [mockCategories[2]!]
        }
      ]
      
      categories.value = mockCategories
      yagya.value = mockYagya
    } finally {
      loading.value = false
    }
  }

  const getYagyaByCategory = (categorySlug: string) => {
    if (categorySlug === 'all') {
      return yagya.value
    }
    return yagya.value.filter(item => 
      item.categories && item.categories.length > 0 
        ? item.categories.some(cat => cat.slug === categorySlug)
        : false // Ягьи без категорий не показываются при фильтрации по категории
    )
  }

  const getCategories = () => {
    const activeCategories = categories.value.filter(cat => cat.is_active)
    
    // Подсчитываем количество ягья для каждой категории
    const categoriesWithCount = activeCategories.map(category => {
      const yagyaCount = yagya.value.filter(item => 
        item.categories && item.categories.length > 0 &&
        item.categories.some(cat => cat.id === category.id)
      ).length
      
      return {
        ...category,
        yagyaCount
      }
    })
    
    // Сортируем по количеству ягья (по убыванию)
    return categoriesWithCount.sort((a, b) => b.yagyaCount - a.yagyaCount)
  }

  const formatYagyaDate = (dateFrom: string, dateTo?: string) => {
    const fromDate = new Date(dateFrom)
    const fromFormatted = fromDate.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long' 
    })
    
    if (dateTo) {
      const toDate = new Date(dateTo)
      const toFormatted = toDate.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long' 
      })
      return `${fromFormatted} - ${toFormatted}`
    }
    
    return fromFormatted
  }

  const formatYagyaTime = (time: string) => {
    return time.slice(0, 5) // Возвращаем только часы и минуты (HH:MM)
  }

  // Загружаем данные сразу при создании composable
  fetchYagya()

  return { 
    yagya, 
    categories,
    loading, 
    error, 
    fetchYagya, 
    getYagyaByCategory,
    getCategories,
    formatYagyaDate,
    formatYagyaTime
  }
} 