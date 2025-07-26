// Интерфейсы для базы данных

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Yagya {
  id: string
  title: string
  description?: string
  date_from: string
  date_to?: string
  time: string
  image_url?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface YagyaCategory {
  id: string
  yagya_id: string
  category_id: string
  created_at: string
}

// Интерфейс для ягьи с категориями (JOIN результат)
export interface YagyaWithCategories extends Yagya {
  categories: Category[]
}

// Интерфейс для категории с количеством ягьи
export interface CategoryWithCount extends Category {
  yagya_count: number
}

// Интерфейсы для API запросов
export interface CreateYagyaRequest {
  title: string
  description?: string
  date_from: string
  date_to?: string
  time: string
  image_url?: string
  category_ids: string[]
}

export interface UpdateYagyaRequest extends Partial<CreateYagyaRequest> {
  id: string
}

export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string
}

// Интерфейсы для фильтрации
export interface YagyaFilters {
  category_slug?: string
  date_from?: string
  date_to?: string
  is_featured?: boolean
  search?: string
}

export interface CategoryFilters {
  is_active?: boolean
  search?: string
}

// Интерфейсы для заявок
export interface Booking {
  id: string
  yagya_id: string
  name: string
  phone: string
  comments?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  updated_at: string
}

export interface CreateBookingRequest {
  yagya_id: string
  name: string
  phone: string
  comments?: string
}

export interface BookingWithYagya extends Booking {
  yagya: Yagya
} 