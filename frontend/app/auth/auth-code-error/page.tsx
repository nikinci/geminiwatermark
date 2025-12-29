'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="text-center max-w-md px-4">
                <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
                <p className="text-gray-400 mb-6">
                    The verification link is invalid or has expired.
                </p>
                <Button asChild variant="outline">
                    <Link href="/login">Try Again</Link>
                </Button>
            </div>
        </div>
    )
}
