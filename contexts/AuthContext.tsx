/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import { UserType } from "@/types/User"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { API_URL } from "@/lib/config"

interface AuthContextType {
  user: UserType | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) setToken(storedToken)
  }, [])

  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("token", data.token)
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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
