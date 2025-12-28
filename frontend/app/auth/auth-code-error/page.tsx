export default function AuthErrorPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
                <p className="text-gray-400">The verification link is invalid or has expired.</p>
                <a href="/login" className="mt-4 inline-block text-blue-500 hover:underline">Try Again</a>
            </div>
        </div>
    )
}
