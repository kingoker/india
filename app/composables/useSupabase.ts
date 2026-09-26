import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Единый клиент Supabase (self-hosted).
 * anon key публичный — доступ к данным ограничивается политиками RLS в БД.
 */
export function useSupabase(): SupabaseClient {
  if (client) return client

  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const key = config.public.supabaseKey as string

  if (!url || !key) {
    throw new Error('Supabase не настроен: проверьте SUPABASE_URL / SUPABASE_KEY в .env')
  }

  client = createClient(url, key, {
    auth: {
      persistSession: import.meta.client,
      autoRefreshToken: import.meta.client
    }
  })

  return client
}
