'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useAuth as useAuthHook, type UseAuthReturn } from '@/hooks/use-auth'

const AuthContext = createContext<UseAuthReturn | null>(null)

/**
 * Auth Provider - Wraps the app to provide auth state to all components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuthHook()
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth(): UseAuthReturn {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }

    return context
}
