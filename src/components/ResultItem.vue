<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import type { SearchResult } from "@/types/search"

const { t } = useI18n()

const props = defineProps<{
    result: SearchResult
    selected: boolean
}>()

const emit = defineEmits<{
    toggle: [id: string]
}>()

const sourceLabel = computed(() => {
    return t(`sources.${props.result.source}`)
})

const sourceColor = computed(() => {
    const colors = {
        wikipedia: "bg-gray-100 text-gray-800",
        hackernews: "bg-orange-100 text-orange-800",
        openlibrary: "bg-green-100 text-green-800",
        github: "bg-purple-100 text-purple-800",
    }
    return colors[props.result.source]
})

const handleToggle = () => {
    emit("toggle", props.result.id)
}
</script>

<template>
  <div 
    class="border-2 rounded-lg p-4 transition-all cursor-pointer hover:shadow-md"
    :class="selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'"
    @click="handleToggle"
  >
    <div class="flex items-start gap-3">
      <input
        type="checkbox"
        :checked="selected"
        @click.stop="handleToggle"
        class="mt-1 w-5 h-5 cursor-pointer accent-blue-600"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 text-xs font-semibold rounded" :class="sourceColor">
            {{ sourceLabel }}
          </span>
          <span class="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded">
            {{ t('results.score') }}: {{ result.score.toFixed(1) }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {{ result.title }}
        </h3>
        <p class="text-sm text-gray-600 mb-3 line-clamp-3">
          {{ result.snippet }}
        </p>
        <a 
          :href="result.url" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
          @click.stop
        >
          {{ t('results.openLink') }}
          <span class="text-xs">↗</span>
        </a>
      </div>
    </div>
  </div>
</template>
