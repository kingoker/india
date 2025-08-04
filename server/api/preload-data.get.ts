export default defineEventHandler(async (event) => {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const config = useRuntimeConfig()
    const supabase = createClient(config.supabaseUrl, config.supabaseKey)
    
    // Предзагружаем основные данные
    const [toursData, yagyaData, categoriesData] = await Promise.all([
      // Загружаем туры
      supabase
        .from('tours')
        .select('id, title, description, date_from, date_to, image_url, slug, price, duration')
        .order('date_from', { ascending: true })
        .limit(20),
      
      // Загружаем ягьи
      supabase
        .from('yagya')
        .select(`
          id, title, description, date_from, date_to, time, image_url, is_featured,
          yagya_categories(
            category:categories(id, name, slug, color, icon)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50),
      
      // Загружаем категории
      supabase
        .from('categories')
        .select('id, name, slug, description, color, icon, sort_order, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    ])
    
    return {
      success: true,
      tours: toursData.data || [],
      yagya: yagyaData.data || [],
      categories: categoriesData.data || []
    }
  } catch (error) {
    console.error('Ошибка предзагрузки данных:', error)
    return {
      success: false,
      error: 'Ошибка загрузки данных'
    }
  }
}) 