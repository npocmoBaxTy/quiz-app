import { useTranslation } from "react-i18next"
import { GraduationCap, FileUser, MoveRight } from "lucide-react"
import { NavLink } from "react-router-dom"

export const Main = () => {
    const { t } = useTranslation("common")
    return (
        <main className="page__main-wrapper">
            <div className="main__title w-full text-center md:py-10 py-5 lg:py-10">
                <h1 className="text-4xl md:text-8xl mb-2 md:mb-5 font-extrabold">
                    {t("navigation.welcome")}
                </h1>
                <span className="text-md md:text-lg font-medium text-(--text-muted)">
                    {t("navigation.span")}
                </span>
            </div>

            <div className="main__links pb-5">
                <div className="grid md:grid-cols-2 gap-6 px-4 lg:px-32">
                    {/* Student */}
                    <NavLink to="/user/login" className="role-card duration-300 hover:scale-105 group relative bg-white rounded-[2.5rem] p-10 border border-slate-200 overflow-hidden">
                        <div className="relative z-10 ">
                            <div className="w-16 h-16 bg-(--main-blue) rounded-2xl flex items-center justify-center text-white text-2xl mb-8 group-hover:scale-110 transition-transform">
                                <GraduationCap />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("studentCard.student")}</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {t("studentCard.info")}
                            </p>
                            <div className="inline-flex items-center gap-2 font-bold text-blue-600 group-hover:gap-4 transition-all">
                                {t("studentCard.sign")} <MoveRight />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full group-hover:scale-150 transition-transform opacity-50"></div>
                    </NavLink>

                    {/* Teacher */}
                    <NavLink to="/user/login" className="role-card group duration-300 hover:scale-105 relative bg-white rounded-[2.5rem] p-10 border border-slate-200 overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-(--hover-bg) rounded-2xl flex items-center justify-center text-(--text-main) text-2xl mb-8 group-hover:scale-110 transition-transform">
                                <FileUser />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t("teacherCard.teacher")}</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                {t("teacherCard.info")}
                            </p>
                            <div className="inline-flex items-center gap-2 font-bold text-slate-900 group-hover:gap-4 transition-all">
                                {t("teacherCard.sign")} <MoveRight />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-slate-100 rounded-full group-hover:scale-150 transition-transform opacity-50"></div>
                    </NavLink>
                </div>
            </div>
        </main>
    )
}