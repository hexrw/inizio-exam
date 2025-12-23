import { beforeEach, describe, expect, it, vi } from "vitest"
import { getCachedResults, setCachedResults } from "./cache"
import type { SearchResult } from "./types"

describe("Cache functionality", () => {
    const mockResults: SearchResult[] = [
        {
            id: "test-1",
            source: "wikipedia",
            title: "Test Article",
            snippet: "Test content",
            score: 85.5,
            url: "https://example.com",
            metadata: {},
        },
    ]

    beforeEach(() => {
        // Clear cache by using a unique query each time or wait for cache to expire
        vi.clearAllMocks()
    })

    describe("setCachedResults", () => {
        it("should store results in cache", () => {
            const query = `test query ${Date.now()}`
            const entry = {
                query,
                results: mockResults,
                timestamp: Date.now(),
            }

            setCachedResults(query, entry)
            const cached = getCachedResults(query)

            expect(cached).not.toBeNull()
            expect(cached?.results).toHaveLength(1)
            expect(cached?.results[0].title).toBe("Test Article")
        })

        it("should normalize query to lowercase", () => {
            const timestamp = Date.now()
            const query = `Test Query ${timestamp}`
            const entry = {
                query,
                results: mockResults,
                timestamp: Date.now(),
            }

            setCachedResults(query, entry)

            // Should retrieve with different casing
            const cached = getCachedResults(`test query ${timestamp}`)
            expect(cached).not.toBeNull()
        })

        it("should handle empty results", () => {
            const query = `empty query ${Date.now()}`
            const entry = {
                query,
                results: [],
                timestamp: Date.now(),
            }

            setCachedResults(query, entry)
            const cached = getCachedResults(query)

            expect(cached).not.toBeNull()
            expect(cached?.results).toHaveLength(0)
        })
    })

    describe("getCachedResults", () => {
        it("should return null for non-existent query", () => {
            const cached = getCachedResults(`non-existent-query-${Date.now()}`)
            expect(cached).toBeNull()
        })

        it("should return cached results for valid query", () => {
            const query = `valid query ${Date.now()}`
            const entry = {
                query,
                results: mockResults,
                timestamp: Date.now(),
            }

            setCachedResults(query, entry)
            const cached = getCachedResults(query)

            expect(cached).not.toBeNull()
            expect(cached?.results).toBe(mockResults)
        })

        it("should return null for expired cache entries", () => {
            const query = `expired query ${Date.now()}`
            const oldTimestamp = Date.now() - 6 * 60 * 1000 // 6 minutes ago (cache is 5 min)
            const entry = {
                query,
                results: mockResults,
                timestamp: oldTimestamp,
            }

            setCachedResults(query, entry)
            const cached = getCachedResults(query)

            expect(cached).toBeNull()
        })

        it("should return results within cache duration", () => {
            const query = `fresh query ${Date.now()}`
            const recentTimestamp = Date.now() - 2 * 60 * 1000 // 2 minutes ago
            const entry = {
                query,
                results: mockResults,
                timestamp: recentTimestamp,
            }

            setCachedResults(query, entry)
            const cached = getCachedResults(query)

            expect(cached).not.toBeNull()
            expect(cached?.results).toBe(mockResults)
        })

        it("should handle multiple queries independently", () => {
            const timestamp = Date.now()
            const query1 = `query one ${timestamp}`
            const query2 = `query two ${timestamp}`

            const entry1 = {
                query: query1,
                results: [{ ...mockResults[0], title: "Result 1" }],
                timestamp: Date.now(),
            }

            const entry2 = {
                query: query2,
                results: [{ ...mockResults[0], title: "Result 2" }],
                timestamp: Date.now(),
            }

            setCachedResults(query1, entry1)
            setCachedResults(query2, entry2)

            const cached1 = getCachedResults(query1)
            const cached2 = getCachedResults(query2)

            expect(cached1?.results[0].title).toBe("Result 1")
            expect(cached2?.results[0].title).toBe("Result 2")
        })
    })

    describe("Cache cleanup", () => {
        it("should handle many cache entries", () => {
            // Add many entries to trigger cleanup
            for (let i = 0; i < 110; i++) {
                const query = `query-${i}`
                const entry = {
                    query,
                    results: mockResults,
                    timestamp: Date.now(),
                }
                setCachedResults(query, entry)
            }

            // Recent entries should still be accessible
            const recent = getCachedResults("query-109")
            expect(recent).not.toBeNull()
        })
    })
})
