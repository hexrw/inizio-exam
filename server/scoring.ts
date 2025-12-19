import type { SearchResult } from "./types"

/**
 * Scoring Algorithm:
 *
 * Each result gets a score from 0-100 based on multiple factors:
 *
 * 1. Title Relevance (0-40 points):
 *    - Exact match in title: 40 points
 *    - Partial match in title: 20 points
 *    - No match: 0 points
 *
 * 2. Content Length/Quality (0-20 points):
 *    - Good snippet length (100-500 chars): 20 points
 *    - Short snippet (50-100 chars): 10 points
 *    - Very short or very long: 5 points
 *
 * 3. Source-specific Metrics (0-40 points):
 *    - Wikipedia: Page views indicator (estimate from search ranking)
 *    - Hacker News: Points/score from HN
 *    - GitHub: Stars (normalized to 0-40)
 *    - Open Library: Number of editions
 *
 * Total: Sum of all factors, capped at 100
 */

export function calculateScore(result: SearchResult, query: string): number {
    let score = 0
    const normalizedQuery = query.toLowerCase()
    const normalizedTitle = result.title.toLowerCase()

    // 1. Title relevance (0-40 points)
    if (normalizedTitle.includes(normalizedQuery)) {
        if (normalizedTitle === normalizedQuery) {
            score += 40
        } else if (normalizedTitle.startsWith(normalizedQuery)) {
            score += 35
        } else {
            score += 20
        }
    } else {
        // Check for partial word matches
        const queryWords = normalizedQuery.split(/\s+/)
        const matchedWords = queryWords.filter((word) =>
            normalizedTitle.includes(word),
        )
        score += (matchedWords.length / queryWords.length) * 15
    }

    // 2. Content quality based on snippet length (0-20 points)
    const snippetLength = result.snippet.length
    if (snippetLength >= 100 && snippetLength <= 500) {
        score += 20
    } else if (snippetLength >= 50 && snippetLength < 100) {
        score += 10
    } else if (snippetLength > 0) {
        score += 5
    }

    // 3. Source-specific metrics (0-40 points)
    const sourceScore = getSourceSpecificScore(result)
    score += sourceScore

    // Cap at 100
    return Math.min(score, 100)
}

function getSourceSpecificScore(result: SearchResult): number {
    const metadata = result.metadata || {}

    switch (result.source) {
        case "wikipedia": {
            // Wikipedia: Use search index as proxy for relevance
            const wikiIndex = metadata.index as number | undefined
            if (wikiIndex !== undefined) {
                // First result gets 40, decreasing by 5 for each position
                return Math.max(40 - wikiIndex * 5, 5)
            }
            return 20
        }

        case "hackernews": {
            // Hacker News: Based on points
            const points = metadata.points as number | undefined
            if (points !== undefined) {
                // Normalize: 0 points = 5, 100+ points = 40
                return Math.min(5 + (points / 100) * 35, 40)
            }
            return 10
        }

        case "github": {
            // GitHub: Based on stars
            const stars = metadata.stars as number | undefined
            if (stars !== undefined) {
                // Normalize: 0 stars = 5, 1000+ stars = 40
                return Math.min(5 + (stars / 1000) * 35, 40)
            }
            return 10
        }

        case "openlibrary": {
            // Open Library: Based on number of editions
            const editions = metadata.editionCount as number | undefined
            if (editions !== undefined) {
                // Normalize: 1 edition = 10, 10+ editions = 40
                return Math.min(10 + editions * 3, 40)
            }
            return 15
        }

        default:
            return 10
    }
}

export function normalizeResults(
    results: SearchResult[],
    query: string,
): SearchResult[] {
    // Calculate scores for all results
    const scoredResults = results.map((result) => ({
        ...result,
        score: calculateScore(result, query),
    }))

    // Sort by score (highest first)
    return scoredResults.sort((a, b) => b.score - a.score)
}
