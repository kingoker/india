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

export interface Tour {
  id: string
  title: string
  description?: string
  slug: string
  date_from: string
  date_to: string
  image_url?: string
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

// Интерфейсы для детальной информации о турах
export interface TourDetails {
  id: string
  tour_id: string
  about_tour: string
  why_special: string
  about_tour_img?: string
  why_special_img?: string
  created_at: string
  updated_at: string
}

export interface TourInfo {
  id: string
  tour_id: string
  title: string
  description: string
  image_url?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface TourDay {
  id: string
  tour_id: string
  title: string
  description: string
  image_url?: string
  day_number: number
  created_at: string
  updated_at: string
}

export interface TourImage {
  id: string
  tour_id: string
  image_url: string
  title?: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TourWithDetails extends Tour {
  tour_details?: TourDetails
  tour_info?: TourInfo[]
  tour_days?: TourDay[]
  tour_images?: TourImage[]
}

// Интерфейсы для API запросов
export interface CreateTourDetailsRequest {
  tour_id: string
  about_tour: string
  why_special: string
}

export interface UpdateTourDetailsRequest extends Partial<CreateTourDetailsRequest> {
  id: string
}

export interface CreateTourInfoRequest {
  tour_id: string
  title: string
  description: string
  image_url?: string
  sort_order?: number
}

export interface UpdateTourInfoRequest extends Partial<CreateTourInfoRequest> {
  id: string
}

export interface CreateTourDayRequest {
  tour_id: string
  title: string
  description: string
  image_url?: string
  day_number: number
}

export interface UpdateTourDayRequest extends Partial<CreateTourDayRequest> {
  id: string
} 