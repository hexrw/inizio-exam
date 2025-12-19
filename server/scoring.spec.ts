import { describe, expect, it } from "vitest"
import { calculateScore, normalizeResults } from "./scoring"
import type { SearchResult } from "./types"

describe("calculateScore", () => {
    it("should give high score for exact title match", () => {
        const result: SearchResult = {
            id: "test-1",
            source: "wikipedia",
            title: "JavaScript",
            snippet: "JavaScript is a programming language",
            score: 0,
            url: "https://example.com",
            metadata: { index: 0 },
        }

        const score = calculateScore(result, "JavaScript")
        expect(score).toBeGreaterThan(60) // Should get high score for exact match
    })

    it("should give lower score for partial title match", () => {
        const result: SearchResult = {
            id: "test-2",
            source: "wikipedia",
            title: "JavaScript Framework",
            snippet: "A framework for JavaScript",
            score: 0,
            url: "https://example.com",
            metadata: { index: 1 },
        }

        const score = calculateScore(result, "JavaScript")
        const exactMatchScore = calculateScore(
            {
                ...result,
                title: "JavaScript",
            },
            "JavaScript",
        )

        expect(score).toBeGreaterThan(20)
        expect(score).toBeLessThan(exactMatchScore) // Should be less than exact match
    })

    it("should score based on snippet quality", () => {
        const goodSnippet: SearchResult = {
            id: "test-3",
            source: "wikipedia",
            title: "Test Title",
            snippet: "A".repeat(200), // Good length snippet
            score: 0,
            url: "https://example.com",
            metadata: {},
        }

        const shortSnippet: SearchResult = {
            id: "test-4",
            source: "wikipedia",
            title: "Test Title",
            snippet: "Short",
            score: 0,
            url: "https://example.com",
            metadata: {},
        }

        const goodScore = calculateScore(goodSnippet, "test")
        const shortScore = calculateScore(shortSnippet, "test")

        expect(goodScore).toBeGreaterThan(shortScore)
    })

    it("should score GitHub results based on stars", () => {
        const highStars: SearchResult = {
            id: "github-1",
            source: "github",
            title: "popular-repo",
            snippet: "Very popular repository",
            score: 0,
            url: "https://github.com/user/repo",
            metadata: { stars: 5000 },
        }

        const lowStars: SearchResult = {
            id: "github-2",
            source: "github",
            title: "small-repo",
            snippet: "Small repository",
            score: 0,
            url: "https://github.com/user/repo",
            metadata: { stars: 10 },
        }

        const highScore = calculateScore(highStars, "repo")
        const lowScore = calculateScore(lowStars, "repo")

        expect(highScore).toBeGreaterThan(lowScore)
    })

    it("should score HackerNews results based on points", () => {
        const highPoints: SearchResult = {
            id: "hn-1",
            source: "hackernews",
            title: "Popular Story",
            snippet: "A very popular story",
            score: 0,
            url: "https://news.ycombinator.com/item?id=123",
            metadata: { points: 500 },
        }

        const lowPoints: SearchResult = {
            id: "hn-2",
            source: "hackernews",
            title: "New Story",
            snippet: "A new story",
            score: 0,
            url: "https://news.ycombinator.com/item?id=124",
            metadata: { points: 5 },
        }

        const highScore = calculateScore(highPoints, "story")
        const lowScore = calculateScore(lowPoints, "story")

        expect(highScore).toBeGreaterThan(lowScore)
    })

    it("should cap score at 100", () => {
        const result: SearchResult = {
            id: "test-5",
            source: "github",
            title: "test",
            snippet: "A".repeat(200),
            score: 0,
            url: "https://example.com",
            metadata: { stars: 10000 },
        }

        const score = calculateScore(result, "test")
        expect(score).toBeLessThanOrEqual(100)
    })
})

describe("normalizeResults", () => {
    it("should calculate scores for all results", () => {
        const results: SearchResult[] = [
            {
                id: "test-1",
                source: "wikipedia",
                title: "JavaScript",
                snippet: "Programming language",
                score: 0,
                url: "https://example.com",
            },
            {
                id: "test-2",
                source: "github",
                title: "JS Framework",
                snippet: "A framework",
                score: 0,
                url: "https://example.com",
            },
        ]

        const normalized = normalizeResults(results, "JavaScript")

        expect(normalized).toHaveLength(2)
        expect(normalized[0].score).toBeGreaterThan(0)
        expect(normalized[1].score).toBeGreaterThan(0)
    })

    it("should sort results by score descending", () => {
        const results: SearchResult[] = [
            {
                id: "low",
                source: "wikipedia",
                title: "Unrelated",
                snippet: "x",
                score: 0,
                url: "https://example.com",
                metadata: { index: 10 },
            },
            {
                id: "high",
                source: "wikipedia",
                title: "JavaScript",
                snippet: "A".repeat(200),
                score: 0,
                url: "https://example.com",
                metadata: { index: 0 },
            },
        ]

        const normalized = normalizeResults(results, "JavaScript")

        expect(normalized[0].id).toBe("high")
        expect(normalized[1].id).toBe("low")
        expect(normalized[0].score).toBeGreaterThan(normalized[1].score)
    })
})
