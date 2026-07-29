import { Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router-dom"

export const FinishedQuizCard = () => {
    const { t } = useTranslation()
    return (
        <div className="test-card duration-500 hover:shadow-xl w-full bg-white/60 border border-slate-200 rounded-[2rem] p-4 sm:p-6 flex flex-col">

            <div className="flex items-center gap-2 mb-4">
                <div className="flex justify-center items-center w-6 h-6 rounded-full bg-(--success-green) text-white">
                    <Check size={15} />
                </div>

                <span className="mt-1 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-closed">
                    {t("quizCard.finished")}
                </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-400 mb-2 line-through line-clamp-2">
                Высшая математика
            </h3>

            <p className="text-slate-400 text-sm mb-6 grow">
                Интегральное исчисление и дифференциальные уравнения.
            </p>

            <div className="bg-blue-50 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                <div>
                    <p className="text-[10px] uppercase font-bold text-blue-600">{t("quizCard.result")}</p>
                    <p className="text-lg sm:text-xl font-black text-blue-900">85/100</p>
                </div>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Check size={18} />
                </div>
            </div>

            <NavLink
                to="/"
                className="block text-center mt-6 w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-white transition-all">
                {t("quizCard.mistakes")}
            </NavLink>

        </div>
    )
}