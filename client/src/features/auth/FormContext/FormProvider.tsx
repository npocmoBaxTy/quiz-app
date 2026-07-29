import { useState, type ReactNode } from "react"
import { FormContext } from "./FormContext"
import { GraduationCap } from "lucide-react"
import { useTranslation } from "react-i18next"


export interface Ir {
    val: string,
    label: string,
    icon: ReactNode,
    desc: string

}

export function FormProvider({ children }: { children: ReactNode }) {

    const { t } = useTranslation()

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [step, setStep] = useState<number>(1)
    const [role, setRole] = useState<string>("student")
    const [groupId, setGroupId] = useState<string>("")
    const [rePassword, setRePassword] = useState<string>("")

    // Регистрация преподавателя/админа через публичную форму отключена —
    // такие аккаунты создаются вручную. Оставляем только студента.
    const ROLES: Ir[] = [
        {
            val: "student",
            label: t("auth.roleCards.student"),
            icon: <GraduationCap />,
            desc: t("auth.roleCards.studentDesc")
        },
    ]
    return (
        <FormContext.Provider
            value={{ email, password, setEmail, setPassword, name, setName, step, setStep, ROLES, role, setRole, groupId, setGroupId, rePassword, setRePassword }}
        >
            {children}
        </FormContext.Provider>
    )
}