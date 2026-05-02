import { createClient } from '@/utils/supabase/client'

// Singleton browser client — imported throughout the app as:
//   import { supabase } from '@/lib/supabase'
export const supabase = createClient()
