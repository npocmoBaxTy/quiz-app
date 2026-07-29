import { useTranslation } from "react-i18next"

export const useLanguage = () => {
    const { i18n } = useTranslation()

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang)
        localStorage.setItem("lang", lang)
    }

    return {
        currentLanguage: i18n.language,
        changeLanguage
    }
}