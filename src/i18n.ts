import { createI18n } from "vue-i18n"
import cs from "./locales/cs"
import en from "./locales/en"

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem("locale") || "cs", // Default to Czech
    fallbackLocale: "en",
    messages: {
        en,
        cs,
    },
})

export default i18n
