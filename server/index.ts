import { Hono } from "hono"
import { cors } from "hono/cors"
import {
    searchGitHub,
    searchHackerNews,
    searchOpenLibrary,
    searchWikipedia,
} from "./apis"
import { getCachedResults, setCachedResults } from "./cache"
import { normalizeResults } from "./scoring"
import type { SearchResult } from "./types"

const app = new Hono()

app.use("/api/*", cors())

app.get("/api/search", async (context) => {
    const query = context.req.query("q")

    if (!query || query.trim().length === 0) {
        return context.json({ error: 'Query parameter "q" is required' }, 400)
    }

    // Check cache first
    const cached = getCachedResults(query)
    if (cached) {
        return context.json({
            query: cached.query,
            results: cached.results,
            timestamp: cached.timestamp,
            cached: true,
        })
    }

    try {
        // Fetch from all APIs in parallel
        const [
            wikipediaResults,
            hackerNewsResults,
            openLibraryResults,
            githubResults,
        ] = await Promise.all([
            searchWikipedia(query),
            searchHackerNews(query),
            searchOpenLibrary(query),
            searchGitHub(query),
        ])

        // Combine all results
        const allResults: SearchResult[] = [
            ...wikipediaResults,
            ...hackerNewsResults,
            ...openLibraryResults,
            ...githubResults,
        ]

        // Normalize and score results
        const scoredResults = normalizeResults(allResults, query)

        // Cache the results
        const cacheEntry = {
            query,
            results: scoredResults,
            timestamp: Date.now(),
        }
        setCachedResults(query, cacheEntry)

        return context.json({
            query,
            results: scoredResults,
            timestamp: cacheEntry.timestamp,
            cached: false,
        })
    } catch (error) {
        console.error("Search error:", error)
        return context.json(
            {
                error: "An error occurred while searching",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            500,
        )
    }
})

app.get("/api/health", (context) => {
    return context.json({ status: "ok", timestamp: Date.now() })
})

export default app
