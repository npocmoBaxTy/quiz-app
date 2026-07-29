import { useContext } from "react"
import { FormContext } from "./FormContext"

export function useFormCtx() {
  const ctx = useContext(FormContext)

  if (!ctx) {
    throw new Error("FormContext not found")
  }

  return ctx
}