import type { CacheEntry } from "./types"

const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// In-memory cache for CloudFlare Workers
const cache = new Map<string, CacheEntry>()

export function getCachedResults(query: string): CacheEntry | null {
    const normalizedQuery = query.toLowerCase().trim()
    const cached = cache.get(normalizedQuery)

    if (!cached) {
        return null
    }

    // Check if cache is still valid
    const now = Date.now()
    if (now - cached.timestamp > CACHE_DURATION_MS) {
        cache.delete(normalizedQuery)
        return null
    }

    return cached
}

export function setCachedResults(query: string, entry: CacheEntry): void {
    const normalizedQuery = query.toLowerCase().trim()
    cache.set(normalizedQuery, entry)

    // Clean old entries (simple cleanup on write)
    if (cache.size > 100) {
        cleanOldEntries()
    }
}

function cleanOldEntries(): void {
    const now = Date.now()
    const entriesToDelete: string[] = []

    for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_DURATION_MS) {
            entriesToDelete.push(key)
        }
    }

    for (const key of entriesToDelete) {
        cache.delete(key)
    }
}
