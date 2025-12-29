import { User as SupabaseUser } from '@supabase/supabase-js'

export interface Profile {
    id: string
    is_pro: boolean
    created_at?: string
    updated_at?: string
}

export interface AppUser extends SupabaseUser {
    is_pro: boolean
}

export type AuthState = {
    user: AppUser | null
    loading: boolean
    error: Error | null
}
