import { BookAlert, Clock, ScrollText } from "lucide-react"
import { useTranslation } from "react-i18next"

export const DisabledQuizCard = () => {
    const { t } = useTranslation()
    return (
        <div className="test-card duration-500 hover:shadow-xl bg-white border border-slate-200 rounded-[2rem] p-4 sm:p-6 flex flex-col">

            <div className="flex items-center mb-4">
                <div className="text-slate-300 mr-3">
                    <BookAlert size={16} />
                </div>
                <span className="mt-1 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider status-badge-pending">
                    {t("quizCard.available")}
                </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                Объектно-ориентированное программирование
            </h3>

            <p className="text-slate-500 text-sm mb-6 grow">
                Проверка знаний принципов SOLID, паттернов проектирования и наследования.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                    <Clock size={15} /> 60 {t("quizCard.time")}
                </div>

                <div className="flex items-center gap-1.5">
                    <ScrollText size={15} /> 15 {t("quizCard.questions")}
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">{t("quizCard.availableFrom")}</p>
                    <p className="text-sm font-bold text-slate-700">20.05.2025</p>
                </div>

                <button
                    disabled
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
                    {t("quizCard.closed")}
                </button>
            </div>

        </div>
    )
}