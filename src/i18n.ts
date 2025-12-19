import { createI18n } from "vue-i18n"
import cs from "./locales/cs"
import en from "./locales/en"

const supportedLocales = ["en", "cs"]

const retrieveLocale = (): string => {
    const savedLocale = localStorage.getItem("locale")
    if (savedLocale && supportedLocales.includes(savedLocale)) {
        return savedLocale
    }
    return "cs" // Default to Czech
}

const i18n = createI18n({
    legacy: false,
    locale: retrieveLocale(), // Default to Czech
    fallbackLocale: "en",
    messages: {
        en,
        cs,
    },
})

export { i18n }
export default i18n