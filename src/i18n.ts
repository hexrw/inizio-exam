import { ref, computed } from "vue"
import en from "./locales/en"
import cs from "./locales/cs"

type Locale = "en" | "cs"

const messages = { en, cs }

export const locale = ref<Locale>("cs")

function getNestedValue(obj: any, path: string): string {
    return path.split(".").reduce((o, key) => o?.[key], obj) || path
}

export function t(key: string, params?: Record<string, string | number>): string {
    let translation = getNestedValue(messages[locale.value], key)
    
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            translation = translation.replace(`{${key}}`, String(value))
        })
    }
    
    return translation
}

export function useI18n() {
    return {
        locale,
        t: (key: string, params?: Record<string, string | number>) => computed(() => t(key, params)),
    }
}