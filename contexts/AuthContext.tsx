/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import { UserType, Role, getRoleDefaultRoute } from "@/types/User"
import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAuthToken,
  getUserProfile
} from "@/api/auth"

interface AuthContextType {
  user: UserType | null
  token: string | null
  isLoading: boolean
  isLoggingOut: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, passwordConfirmation: string, phone: string) => Promise<void>
  logout: () => void
  hasRole: (role: Role) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to decode JWT and get expiration time
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded.exp ? decoded.exp * 1000 : null // Convert to milliseconds
  } catch {
    return null
  }
}

function formatUserData(data: any): UserType | null {
  if (!data) return null;
  const userObj = data.user || data;
  if (!userObj || Object.keys(userObj).length === 0) return null;

  return {
    ...userObj,
    name: userObj.name,
    role: userObj.role,
    permission_level: userObj.verification_permission_level ?? userObj.permission_level,
    organization_name: data.organization?.name,
    organization_code: data.organization?.code,
    region_name: data.region?.name,
    level: data.region?.level
  } as UserType;
}

function setAuthCookies(token: string, user: UserType) {
  if (typeof document !== 'undefined') {
    document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `level=${user.level || 'NATIONAL'}; path=/; max-age=604800; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  if (typeof document !== 'undefined') {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    document.cookie = 'level=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Refresh token function
  const refreshToken = useCallback(async (currentToken: string) => {
    try {
      const result = await refreshAuthToken(currentToken)

      if (!result.error && result.token) {
        setToken(result.token)
        localStorage.setItem("token", result.token)

        // Update user data if provided
        if (result.data) {
          const formattedUser = formatUserData(result.data);
          if (formattedUser) {
            setUser(formattedUser)
            localStorage.setItem("user", JSON.stringify(formattedUser))
            setAuthCookies(result.token, formattedUser)
          }
        } else {
          // If profile data is cached/stored in state, update cookies with result.token
          const cachedUser = localStorage.getItem("user");
          if (cachedUser) {
            setAuthCookies(result.token, JSON.parse(cachedUser));
          }
        }

        return result.token
      }
      return null
    } catch {
      return null
    }
  }, [])

  // Schedule token refresh
  const scheduleRefresh = useCallback((authToken: string) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const expiry = getTokenExpiry(authToken)
    if (!expiry) return

    // Calculate time until refresh (1 minute before expiry)
    const now = Date.now()
    const refreshTime = expiry - now - 60000 // 1 minute before expiry

    if (refreshTime > 0) {
      refreshTimeoutRef.current = setTimeout(async () => {
        const newToken = await refreshToken(authToken)
        if (newToken) {
          scheduleRefresh(newToken)
        }
      }, refreshTime)
    } else if (expiry > now) {
      // Token will expire in less than 1 minute, refresh immediately
      refreshToken(authToken).then((newToken) => {
        if (newToken) {
          scheduleRefresh(newToken)
        }
      })
    }
  }, [refreshToken])

  // Fetch profile from API to validate token and get fresh user data
  async function fetchProfile(storedToken: string): Promise<UserType | null> {
    try {
      const res = await getUserProfile(storedToken)

      // Only clear token on auth errors (401, 403)
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        return null
      }

      // For other errors, use cached user data
      if (!res.ok) {
        const cachedUser = localStorage.getItem("user")
        return cachedUser ? JSON.parse(cachedUser) : null
      }

      const result = await res.json()

      if (result.error) {
        // If API returns error but not auth issue, use cached data
        const cachedUser = localStorage.getItem("user")
        return cachedUser ? JSON.parse(cachedUser) : null
      }

      // Handle different response structures
      return formatUserData(result.data) || formatUserData(result);
    } catch {
      // Network error - use cached user data
      const cachedUser = localStorage.getItem("user")
      return cachedUser ? JSON.parse(cachedUser) : null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token")

      if (storedToken) {
        // Check if token is expired
        const expiry = getTokenExpiry(storedToken)
        if (expiry && expiry < Date.now()) {
          // Token expired, clear it
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          clearAuthCookies()
          setIsLoading(false)
          return
        }

        setToken(storedToken)

        // Fetch fresh profile data
        const userData = await fetchProfile(storedToken)
        if (userData) {
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          setAuthCookies(storedToken, userData)
          // Schedule token refresh
          scheduleRefresh(storedToken)
        } else {
          // Token invalid
          setToken(null)
          clearAuthCookies()
        }
      }

      setIsLoading(false)
    }

    initAuth()

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleRefresh])

  async function login(email: string, password: string) {
    const result = await loginUser(email, password)

    if (result.error) {
      throw new Error(result.message || "Login gagal")
    }

    // Update struktur dari respon: token di root, detail properties user ada di result.data.user
    const authToken = result.token
    const formattedUser = formatUserData(result.data) || formatUserData(result)

    if (!formattedUser) {
      throw new Error("Invalid user data from server")
    }

    setToken(authToken)
    setUser(formattedUser)
    localStorage.setItem("token", authToken)
    localStorage.setItem("user", JSON.stringify(formattedUser))
    setAuthCookies(authToken, formattedUser)

    // Schedule token refresh
    scheduleRefresh(authToken)

    // Redirect berdasarkan role
    const redirectPath = getRoleDefaultRoute(formattedUser)
    router.push(redirectPath)
  }

  async function register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    phone: string
  ) {
    const result = await registerUser({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      phone_number: phone,
    })

    if (result.error) {
      throw new Error(result.message || "Registrasi gagal")
    }

    // Update struktur objek phone dan properti user
    const authToken = result.token || result.authorization?.token || result.data?.authorization?.token;
    const formattedUser = formatUserData(result.data) || formatUserData(result) || formatUserData({ user: result.user });

    if (!authToken || !formattedUser) {
      throw new Error("Invalid response from server")
    }

    setToken(authToken)
    setUser(formattedUser)
    localStorage.setItem("token", authToken)
    localStorage.setItem("user", JSON.stringify(formattedUser))
    setAuthCookies(authToken, formattedUser)

    // Schedule token refresh
    scheduleRefresh(authToken)

    // Redirect berdasarkan role
    const redirectPath = getRoleDefaultRoute(formattedUser)
    router.push(redirectPath)
  }

  async function logout() {
    setIsLoggingOut(true)

    // Call logout API to invalidate token on backend
    if (token) {
      try {
        await logoutUser(token)
      } catch {
        // Continue with local logout even if API fails
      }
    }

    // Clear refresh timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }

    setToken(null)
    setUser(null)
    setIsLoggingOut(false)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    clearAuthCookies()
    router.push("/v2")
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
    register,
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
