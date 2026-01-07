import { User as SupabaseUser } from '@supabase/supabase-js'

export interface Profile {
    id: string
    is_pro: boolean
    pro_expires_at?: string
    referral_code?: string
    referred_by?: string
    created_at?: string
    updated_at?: string
}

export interface AppUser extends SupabaseUser {
    is_pro: boolean
    referral_code?: string
}

export type AuthState = {
    user: AppUser | null
    loading: boolean
    error: Error | null
}
