<script setup lang="ts">
import { locale } from "../i18n"

const toggleLocale = () => {
    locale.value = locale.value === "en" ? "cs" : "en"
}
</script>

<template>
  <button
    @click="toggleLocale"
    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors"
    :title="locale === 'en' ? 'Switch to Czech' : 'Přepnout na angličtinu'"
  >
    <span class="text-lg">🌐</span>
    <span class="font-semibold">{{ locale === 'en' ? 'EN' : 'CS' }}</span>
    <span class="text-xs text-gray-500">→ {{ locale === 'en' ? 'CS' : 'EN' }}</span>
  </button>
</template>
