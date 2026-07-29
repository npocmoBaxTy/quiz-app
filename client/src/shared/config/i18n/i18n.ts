import i18n, { type Resource } from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en/common.json'
import ru from './locales/ru/common.json'
import uz from './locales/uz/common.json'

const savedLang = localStorage.getItem('lang') || 'ru'

const resources: Resource = {
    en: { common: en },
    ru: { common: ru },
    uz: { common: uz }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLang,
        fallbackLng: "ru",
        defaultNS: "common",
        interpolation: {
            escapeValue: false
        }
    })

export default i18n