<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { SearchResult } from "@/types/search"
import ResultItem from "./ResultItem.vue"

const { t } = useI18n()

const props = defineProps<{
    results: SearchResult[]
    selectedIds: Set<string>
}>()

const emit = defineEmits<{
    toggle: [id: string]
    toggleAll: []
    export: [format: "json" | "csv" | "xlsx" | "xml"]
}>()

const allSelected = computed(() => {
    return (
        props.results.length > 0 &&
        props.selectedIds.size === props.results.length
    )
})

const someSelected = computed(() => {
    return (
        props.selectedIds.size > 0 &&
        props.selectedIds.size < props.results.length
    )
})

const handleToggleAll = () => {
    emit("toggleAll")
}

const handleExport = (format: "json" | "csv" | "xlsx" | "xml") => {
    emit("export", format)
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Header with controls -->
    <div v-if="results.length > 0" class="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="someSelected"
            @change="handleToggleAll"
            class="w-5 h-5 cursor-pointer accent-blue-600"
          />
          <span class="font-medium text-gray-700">
            {{ t('results.selectAll') }} ({{ selectedIds.size }} / {{ results.length }})
          </span>
        </label>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="handleExport('json')"
          :disabled="selectedIds.size === 0"
          class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('results.exportJson') }}
        </button>
        <button
          @click="handleExport('csv')"
          :disabled="selectedIds.size === 0"
          class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('results.exportCsv') }}
        </button>
        <button
          @click="handleExport('xlsx')"
          :disabled="selectedIds.size === 0"
          class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('results.exportXlsx') }}
        </button>
        <button
          @click="handleExport('xml')"
          :disabled="selectedIds.size === 0"
          class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ t('results.exportXml') }}
        </button>
      </div>
    </div>

    <!-- Results list -->
    <div class="space-y-3">
      <ResultItem
        v-for="result in results"
        :key="result.id"
        :result="result"
        :selected="selectedIds.has(result.id)"
        @toggle="emit('toggle', $event)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="results.length === 0" class="text-center py-12 text-gray-500">
      <p class="text-lg">{{ t('search.noResults') }}</p>
      <p class="text-sm mt-2">{{ t('search.noResultsHint') }}</p>
    </div>
  </div>
</template>
