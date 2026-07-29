import { useTranslation } from "react-i18next"
import { C } from './../constants'
import { Steps } from "../ui/Steps/Steps"
import { Divider } from "../ui/Divider"
import { NavLink } from "react-router-dom"
import { FormProvider } from "../FormContext/FormProvider"


export const RegisterForm = () => {
    const { t } = useTranslation()

    return (
        <FormProvider>
            <div className="user__registerform-wrapper bg-(--main-bg) flex w-full h-screen justify-center items-center">
                <div className="user__registerform--inner p-8 bg-white rounded-xl w-110 px-6 py-4">
                    <div className="inner__title mb-5">
                        <div style={{ fontWeight: 800, fontSize: 21, color: C.text, marginBottom: 5 }}>{t("auth.register.title")}</div>
                        <div style={{ fontSize: 13, color: C.muted, }}>{t("auth.register.subtitle")}</div>
                    </div>

                    {/* Steps */}
                    <Steps />
                    <Divider label={t("auth.labels.already")} />
                    <div className="flex justify-center mt-2" style={{ border: "1px solid" + C.border, padding: 5, borderRadius: 8, color: C.primary }}>
                        <NavLink to={'/user/login'} className={`text-[14px] border-[${C.border}] block`}>
                            {t("auth.login")}
                        </NavLink>
                    </div>
                </div>
            </div>
        </FormProvider>
    )
}