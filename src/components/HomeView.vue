<script setup lang="ts">
import { ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import LanguageSwitcher from "@/components/LanguageSwitcher.vue"
import ResultsList from "@/components/ResultsList.vue"
import SearchInput from "@/components/SearchInput.vue"
import type { SearchResult } from "@/types/search"
import {
    exportToCSV,
    exportToJSON,
    exportToXLSX,
    exportToXML,
} from "@/utils/export"

const { t, locale } = useI18n()

const results = ref<SearchResult[]>([])
const selectedIds = ref<Set<string>>(new Set())
const isLoading = ref(false)
const error = ref<string | null>(null)

// Clear results when language changes
watch(locale, () => {
    results.value = []
    selectedIds.value.clear()
    error.value = null
})

const handleSearch = async (query: string) => {
    isLoading.value = true
    error.value = null
    selectedIds.value.clear()

    try {
        const response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
        )

        if (!response.ok) {
            throw new Error(`${t("search.error")} ${response.statusText}`)
        }

        const data = await response.json()
        results.value = data.results || []
    } catch (err) {
        error.value = err instanceof Error ? err.message : t("search.error")
        results.value = []
    } finally {
        isLoading.value = false
    }
}

const handleToggle = (id: string) => {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
    } else {
        selectedIds.value.add(id)
    }
    // Force reactivity
    selectedIds.value = new Set(selectedIds.value)
}

const handleToggleAll = () => {
    if (selectedIds.value.size === results.value.length) {
        selectedIds.value.clear()
    } else {
        selectedIds.value = new Set(results.value.map((r) => r.id))
    }
}

const handleExport = (format: "json" | "csv" | "xlsx" | "xml") => {
    const selectedResults = results.value.filter((r) =>
        selectedIds.value.has(r.id),
    )

    if (format === "json") {
        exportToJSON(selectedResults)
    } else if (format === "csv") {
        exportToCSV(selectedResults)
    } else if (format === "xlsx") {
        exportToXLSX(selectedResults)
    } else {
        exportToXML(selectedResults)
    }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="container mx-auto max-w-6xl">
      <!-- Header with Language Switcher -->
      <div class="flex justify-end mb-6">
        <LanguageSwitcher />
      </div>
      
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">
          {{ t("header.title") }}
        </h1>
        <p class="text-lg text-gray-600">
          {{ t("header.subtitle") }}
        </p>
      </div>

      <!-- Search Input -->
      <div class="mb-8">
        <SearchInput @search="handleSearch" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">{{ t("search.loading") }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-2xl mx-auto">
        <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-800">
          <p class="font-semibold">{{ t("search.error") }}</p>
          <p>{{ error }}</p>
        </div>
      </div>

      <!-- Results -->
      <div v-else>
        <ResultsList
          :results="results"
          :selected-ids="selectedIds"
          @toggle="handleToggle"
          @toggle-all="handleToggleAll"
          @export="handleExport"
        />
      </div>
    </div>
  </div>
</template>

