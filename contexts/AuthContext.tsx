/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import { UserType, Role, getRoleDefaultRoute } from "@/types/User"
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react"
import { API_URL } from "@/lib/config"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: UserType | null
  token: string | null
  isLoading: boolean
  isLoggingOut: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Fetch profile from API to validate token and get fresh user data
  async function fetchProfile(storedToken: string) {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${storedToken}`
        },
      })

      if (!res.ok) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return null
      }

      const result = await res.json()

      if (result.error) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return null
      }

      return result.data.user
    } catch {
      return null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token")

      if (storedToken) {
        setToken(storedToken)

        // Fetch fresh profile data
        const userData = await fetchProfile(storedToken)
        if (userData) {
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        } else {
          // Token invalid
          setToken(null)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const result = await res.json()

    if (result.error) {
      throw new Error(result.message || "Login gagal")
    }

    const { authorization, user: userData } = result.data

    setToken(authorization.token)
    setUser(userData)
    localStorage.setItem("token", authorization.token)
    localStorage.setItem("user", JSON.stringify(userData))

    // Redirect berdasarkan role
    const redirectPath = getRoleDefaultRoute(userData.role as Role)
    router.push(redirectPath)
  }

  async function logout() {
    setIsLoggingOut(true)

    // Call logout API to invalidate token on backend
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        })
      } catch {
        // Continue with local logout even if API fails
      }
    }

    setToken(null)
    setUser(null)
    setIsLoggingOut(false)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const hasRole = useCallback((role: Role): boolean => {
    return user?.role === role
  }, [user])

  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    isLoggingOut,
    login,
    logout,
    hasRole
  }), [user, token, isLoading, isLoggingOut, hasRole])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

// helper for non-hook usage
export const getAccessToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const getStoredUser = (): UserType | null => {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("user")
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}
