import { useContext } from "react"
import { AuthContext } from "./AuthContext"

export function useAuthCtx() {
    const actx = useContext(AuthContext)

    if (!actx) {
        throw new Error("FormContext not found")
    }

    return actx
}