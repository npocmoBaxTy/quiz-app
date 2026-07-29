import { useState, type ReactNode } from "react"
import { C } from "@/features/auth/constants"
import { Eye, EyeOff } from "lucide-react"

interface InputProps {
    textChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    type: string | "text"
    children?: ReactNode
    label?: string
    value?: string
    err?: boolean
    pass?: boolean
    showPassHandler?: () => void
    className?: string
}

export const FieldInput = ({ placeholder, className, textChange, pass, type, children, label, value, err = false }: InputProps) => {

    const [newType, setNewType] = useState<string>(type)
    function showPass() {
        if (newType == "password" && pass) {
            setNewType("text")
        } else {
            setNewType("password")
        }
    }

    return (
        <>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 5, marginLeft: 5 }}>
                {label}
            </label>
            <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${!err ? C.border : C.danger}`, borderRadius: 11, background: C.surface, transition: "border-color .15s", overflow: "hidden" }} className="px-4">
                {children}
                <input type={type === "password" ? newType : type} value={value} placeholder={placeholder || "placeholder"} onChange={textChange} style={{ flex: 1, border: "none", background: "transparent", outline: "none", padding: "10px 11px", fontSize: 13, color: C.text, minWidth: 0 }} className={className} />
                {
                    pass &&
                    <button onClick={showPass}>
                        {newType == "password" ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                }
            </div>
        </>
    )
}