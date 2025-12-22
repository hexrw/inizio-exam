<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useI18n, locale } from "../i18n"

const emit = defineEmits<{
    search: [query: string]
}>()

const { t } = useI18n()

const query = ref("")
const isLoading = ref(false)
const suggestion = ref("")
const inputRef = ref<HTMLInputElement>()
let dictionary: string[] = []

const techTerms = [
    "javascript",
    "typescript",
    "python",
    "react",
    "vue",
    "angular",
    "node",
    "docker",
    "kubernetes",
    "github",
    "gitlab",
    "database",
    "algorithm",
    "framework",
    "library",
    "component",
    "function",
    "programming",
    "software",
    "development",
    "frontend",
    "backend",
    "fullstack",
    "api",
    "rest",
    "graphql",
    "mongodb",
    "postgresql",
    "machine",
    "learning",
    "artificial",
    "intelligence",
    "neural",
    "network",
    "security",
    "authentication",
    "authorization",
    "cloud",
    "serverless",
    "microservices",
    "architecture",
    "design",
    "pattern",
    "data",
    "science",
    "analytics",
    "visualization",
    "testing",
    "deployment",
]

// Czech common words
const czechWords = [
    "javascript",
    "programování",
    "vývoj",
    "software",
    "aplikace",
    "web",
    "databáze",
    "systém",
    "projekt",
    "technologie",
    "framework",
    "knihovna",
    "algoritmus",
    "funkce",
    "komponenta",
    "rozhraní",
    "bezpečnost",
    "cloud",
    "server",
    "klient",
    "testování",
    "nasazení",
    "dokumentace",
    "konfigurace",
    "javascript",
    "typescript",
    "python",
    "java",
    "kotlin",
    "swift",
    "historie",
    "věda",
    "umění",
    "literatura",
    "filosofie",
    "matematika",
    "fyzika",
    "chemie",
    "biologie",
    "geografie",
    "ekonomie",
    "politika",
    "společnost",
    "kultura",
    "vzdělání",
    "zdraví",
    "technologie",
    "inovace",
]

// Common English words (smaller subset for better performance)
const commonEnglishWords = [
    "computer",
    "science",
    "technology",
    "internet",
    "website",
    "application",
    "program",
    "system",
    "process",
    "method",
    "object",
    "class",
    "interface",
    "module",
    "package",
    "import",
    "export",
    "function",
    "variable",
    "constant",
    "array",
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "error",
    "exception",
    "handler",
    "async",
    "await",
    "promise",
    "callback",
    "event",
    "listener",
    "component",
    "props",
    "state",
    "render",
    "mount",
    "update",
    "lifecycle",
    "hook",
    "effect",
    "context",
    "provider",
    "consumer",
    "router",
    "route",
    "navigation",
    "history",
    "location",
    "params",
    "query",
    "search",
    "filter",
    "sort",
    "map",
    "reduce",
    "foreach",
    "find",
    "includes",
    "slice",
    "splice",
    "push",
    "pop",
    "shift",
    "unshift",
    "concat",
    "join",
    "split",
    "replace",
    "match",
    "test",
    "trim",
    "substring",
    "length",
    "index",
    "key",
    "value",
    "pair",
    "item",
    "element",
    "node",
    "tree",
    "graph",
    "list",
    "queue",
    "stack",
    "heap",
    "hash",
    "table",
    "dictionary",
    "collection",
    "iterator",
    "generator",
    "closure",
    "scope",
    "binding",
    "reference",
    "pointer",
    "memory",
    "cache",
    "buffer",
    "stream",
    "pipe",
    "channel",
    "thread",
    "process",
    "fork",
    "spawn",
    "execute",
    "compile",
    "build",
    "deploy",
    "release",
    "version",
    "update",
    "upgrade",
    "migration",
    "rollback",
    "backup",
    "restore",
    "export",
    "import",
    "download",
    "upload",
    "transfer",
    "protocol",
    "request",
    "response",
    "header",
    "body",
    "payload",
    "parameter",
    "argument",
    "option",
    "config",
    "setting",
    "preference",
    "default",
    "custom",
    "override",
    "extend",
    "inherit",
    "implement",
    "abstract",
    "concrete",
    "generic",
    "specific",
    "public",
    "private",
    "protected",
    "static",
    "dynamic",
    "virtual",
    "final",
    "readonly",
    "mutable",
    "immutable",
    "singleton",
    "factory",
    "builder",
    "observer",
    "strategy",
    "adapter",
]

const loadDictionary = () => {
    if (locale.value === "cs") {
        // Czech mode: prioritize Czech words + tech terms + common English
        dictionary = [...czechWords, ...techTerms, ...commonEnglishWords]
    } else {
        // English mode: tech terms + common English words
        dictionary = [...techTerms, ...commonEnglishWords]
    }
    console.log(
        `Dictionary loaded for ${locale.value}:`,
        dictionary.length,
        "words",
    )
}

onMounted(() => {
    loadDictionary()
})

// Reload dictionary when locale changes
watch(locale, () => {
    loadDictionary()
    suggestion.value = "" // Clear suggestions when switching language
    query.value = "" // Clear input when switching language
})

const handleInput = () => {
    if (!dictionary.length || !query.value) {
        suggestion.value = ""
        return
    }

    // Get the last word being typed
    const queryWords = query.value.split(" ")
    const lastWord = queryWords[queryWords.length - 1]?.toLowerCase() || ""

    if (lastWord && lastWord.length > 0) {
        // Find first word that starts with the typed text
        const match = dictionary.find(
            (word) =>
                word.toLowerCase().startsWith(lastWord) &&
                word.length > lastWord.length,
        )

        if (match) {
            // Calculate the full suggestion including already typed text
            const beforeLastWord = queryWords.slice(0, -1).join(" ")
            const suggestionText = beforeLastWord
                ? `${beforeLastWord} ${match}`
                : match
            suggestion.value = suggestionText
            console.log("Suggestion:", lastWord, "→", match)
            return
        }
    }

    suggestion.value = ""
}

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
        handleSearch()
    } else if (event.key === "Tab" && suggestion.value) {
        event.preventDefault()
        query.value = suggestion.value + " "
        suggestion.value = ""
    } else if (
        event.key === "ArrowRight" &&
        suggestion.value &&
        inputRef.value
    ) {
        // Accept suggestion with right arrow if cursor is at end
        const cursorPos = inputRef.value.selectionStart || 0
        if (cursorPos === query.value.length) {
            event.preventDefault()
            query.value = suggestion.value + " "
            suggestion.value = ""
        }
    }
}

const handleSearch = () => {
    if (!query.value.trim()) return

    isLoading.value = true
    suggestion.value = ""
    emit("search", query.value.trim())
    setTimeout(() => {
        isLoading.value = false
    }, 500)
}

// Compute the suggestion display (only the part that's not yet typed)
const suggestionDisplay = computed(() => {
    if (!suggestion.value || !query.value) return ""
    if (suggestion.value.startsWith(query.value)) {
        return suggestion.value.slice(query.value.length)
    }
    return ""
})

defineExpose({ isLoading })
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="flex gap-3">
      <div class="relative flex-1">
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          :placeholder="t('search.placeholder').value"
          class="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors relative z-10 bg-transparent"
          :disabled="isLoading"
          @input="handleInput"
          @keydown="handleKeydown"
          autocomplete="off"
          spellcheck="false"
        />
        <!-- Suggestion shadow text -->
        <div 
          v-if="suggestionDisplay"
          class="absolute inset-0 px-4 py-3 text-lg pointer-events-none flex items-center text-gray-400 rounded-lg"
          aria-hidden="true"
        >
          <span class="invisible">{{ query }}</span>{{ suggestionDisplay }}
        </div>
        <!-- Hint text -->
        <div 
          v-if="suggestionDisplay" 
          class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded pointer-events-none"
        >
          Tab
        </div>
      </div>
      <button
        @click="handleSearch"
        :disabled="isLoading || !query.trim()"
        class="px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {{ isLoading ? t('search.searching').value : t('search.button').value }}
      </button>
    </div>
    <div v-if="suggestionDisplay" class="text-xs text-gray-500 mt-2 text-center">
      {{ t('search.autocompleteHint').value }}
    </div>
  </div>
</template>
