'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppUser, Profile } from '@/types/supabase'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export interface UseAuthReturn {
    user: AppUser | null
    loading: boolean
    error: Error | null
    refreshUser: () => Promise<void>
    signOut: () => Promise<void>
}

/**
 * Centralized hook for Supabase authentication
 * Handles user state, profile fetching, and auth state changes
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const isFetchingRef = useRef(false) // Prevent parallel fetches
    const lastUserIdRef = useRef<string | null>(null) // Track last fetched user ID

    /**
     * Fetches user profile from database and merges with auth user
     */
    const fetchUserWithProfile = useCallback(async (authUser: User | null, forceRefresh = false): Promise<AppUser | null> => {
        console.log('🔍 useAuth: fetchUserWithProfile called with user:', authUser?.email ?? 'NULL', 'force:', forceRefresh)

        if (!authUser) {
            console.log('🔍 useAuth: No auth user, returning null')
            lastUserIdRef.current = null
            return null
        }

        // If same user and already fetched (and not forcing refresh), return cached user
        if (!forceRefresh && lastUserIdRef.current === authUser.id && user) {
            console.log('✅ useAuth: Using cached user (same ID)')
            return user
        }

        // Prevent parallel fetches using ref
        if (isFetchingRef.current) {
            console.log('⏸️ useAuth: Already fetching, skipping...')
            return user || ({ ...authUser, is_pro: false } as AppUser)
        }

        // Fetch profile from API route (server-side, no hang!)
        try {
            console.log('🔍 useAuth: Fetching profile from API route...')

            const response = await fetch('/api/profile', {
                credentials: 'include' // Include cookies
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ useAuth: Profile fetched from API - is_pro:', data.is_pro)

            const userWithProfile = { ...authUser, is_pro: data.is_pro } as AppUser
            lastUserIdRef.current = authUser.id
            isFetchingRef.current = false
            return userWithProfile
        } catch (err) {
            console.error('❌ useAuth: API route error:', err)
            const fallbackUser = { ...authUser, is_pro: false } as AppUser
            lastUserIdRef.current = authUser.id
            isFetchingRef.current = false
            return fallbackUser
        }
    }, [])

    /**
     * Refreshes the current user state
     */
    const refreshUser = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const supabase = createClient()
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                throw authError
            }

            const userWithProfile = await fetchUserWithProfile(authUser)
            setUser(userWithProfile)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to refresh user')
            setError(error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [fetchUserWithProfile])

    /**
     * Signs out the current user
     */
    const signOut = useCallback(async () => {
        try {
            const supabase = createClient()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to sign out')
            setError(error)
            throw error
        }
    }, [])

    /**
     * Handle auth state changes
     */
    const handleAuthStateChange = useCallback(
        async (event: AuthChangeEvent, session: Session | null) => {
            console.log('🔐 useAuth: Auth state changed:', event, 'user:', session?.user?.email ?? 'NULL')
            const userWithProfile = await fetchUserWithProfile(session?.user ?? null)
            console.log('🔐 useAuth: Setting user state:', userWithProfile?.email ?? 'NULL', 'is_pro:', userWithProfile?.is_pro)
            setUser(userWithProfile)
            setLoading(false)
        },
        [fetchUserWithProfile]
    )

    /**
     * Initialize auth state on mount
     */
    useEffect(() => {
        const supabase = createClient()

        // Get initial user state
        supabase.auth.getUser()
            .then(async ({ data: { user: authUser }, error: authError }) => {
                if (authError) {
                    console.error('❌ useAuth: Initial getUser error:', authError)
                    setError(authError)
                    setUser(null)
                    setLoading(false)
                    return
                }

                const userWithProfile = await fetchUserWithProfile(authUser)
                setUser(userWithProfile)
                setLoading(false)
            })
            .catch((err) => {
                console.error('❌ useAuth: Unexpected error in getUser:', err)
                setError(err instanceof Error ? err : new Error('Auth initialization failed'))
                setUser(null)
                setLoading(false)
            })

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

        return () => {
            subscription.unsubscribe()
        }
    }, [fetchUserWithProfile, handleAuthStateChange])

    return {
        user,
        loading,
        error,
        refreshUser,
        signOut,
    }
}
