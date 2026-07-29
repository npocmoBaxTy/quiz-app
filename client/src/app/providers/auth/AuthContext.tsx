import { createContext } from "react"

type AuthState = {
    isLoading: boolean
    refreshAuth: () => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)


