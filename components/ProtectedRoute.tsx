'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Role, getRoleDefaultRoute, getRoleAllowedRoutes } from '@/types/User'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles?: Role[]
}

export default function ProtectedRoute({
    children,
    allowedRoles
}: ProtectedRouteProps) {
    const { user, token, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (isLoading) return

        // Redirect ke login jika tidak ada token
        if (!token) {
            router.push('/')
            return
        }

        // Check akses berdasarkan role
        if (user && allowedRoles && !allowedRoles.includes(user.role as Role)) {
            // Redirect ke halaman default role user
            const defaultRoute = getRoleDefaultRoute(user.role as Role)
            router.push(defaultRoute)
            return
        }
    }, [user, token, isLoading, allowedRoles, router])

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    // Tidak ada token
    if (!token) {
        return null
    }

    // Role tidak diizinkan
    if (user && allowedRoles && !allowedRoles.includes(user.role as Role)) {
        return null
    }

    return <>{children}</>
}

// Hook untuk check akses route
export function useRouteProtection() {
    const { user, token } = useAuth()

    const canAccessRoute = (path: string): boolean => {
        if (!user || !token) return false
        const allowedRoutes = getRoleAllowedRoutes(user.role as Role)
        return allowedRoutes.some(route => path.startsWith(route))
    }

    return { canAccessRoute, user, token }
}
