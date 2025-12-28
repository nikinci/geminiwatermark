'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) {
                toast.error('Login failed: ' + error.message)
            } else {
                toast.success('Magic link sent! Check your email.')
            }
        } catch (error) {
            toast.error('An error occurred.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="w-full max-w-md space-y-8 p-8 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Enter your email to sign in or create a new account.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Email Address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            className="bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Magic Link'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
