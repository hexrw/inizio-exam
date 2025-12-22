import { describe, it, expect, vi, beforeEach } from "vitest"
import worker from "./index"

// Mock the API functions
vi.mock("./apis", () => ({
    searchWikipedia: vi.fn().mockResolvedValue([
        {
            id: "wiki-1",
            source: "wikipedia",
            title: "Test Article",
            snippet: "Test content from Wikipedia",
            score: 0,
            url: "https://en.wikipedia.org/wiki/Test",
            metadata: { pageid: 123 },
        },
    ]),
    searchHackerNews: vi.fn().mockResolvedValue([
        {
            id: "hn-1",
            source: "hackernews",
            title: "Test HN Story",
            snippet: "Test story from Hacker News",
            score: 0,
            url: "https://news.ycombinator.com/item?id=123",
            metadata: { points: 100 },
        },
    ]),
    searchOpenLibrary: vi.fn().mockResolvedValue([]),
    searchGitHub: vi.fn().mockResolvedValue([]),
}))

describe("Worker Tests", () => {
    const mockEnv = {} as any
    const mockCtx = {
        waitUntil: vi.fn(),
        passThroughOnException: vi.fn(),
    } as any

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("exports a valid fetch handler", () => {
        expect(worker).toHaveProperty("fetch")
        expect(typeof worker.fetch).toBe("function")
    })

    it("responds with 400 for missing query parameter", async () => {
        const request = new Request("http://example.com/api/search")
        const response = await worker.fetch(request, mockEnv, mockCtx)
        
        expect(response.status).toBe(400)
        const data = await response.json() as any
        expect(data).toHaveProperty("error")
    })

    it("responds with search results for valid query", async () => {
        const request = new Request("http://example.com/api/search?q=test")
        const response = await worker.fetch(request, mockEnv, mockCtx)
        
        expect(response.status).toBe(200)
        const data = await response.json() as any
        expect(data).toHaveProperty("query", "test")
        expect(data).toHaveProperty("results")
        expect(data).toHaveProperty("timestamp")
        expect(Array.isArray(data.results)).toBe(true)
    })

    it("responds with health check", async () => {
        const request = new Request("http://example.com/api/health")
        const response = await worker.fetch(request, mockEnv, mockCtx)
        
        expect(response.status).toBe(200)
        const data = await response.json() as any
        expect(data).toHaveProperty("status", "ok")
        expect(data).toHaveProperty("timestamp")
    })

    it("handles empty query parameter", async () => {
        const request = new Request("http://example.com/api/search?q=")
        const response = await worker.fetch(request, mockEnv, mockCtx)
        
        expect(response.status).toBe(400)
        const data = await response.json() as any
        expect(data).toHaveProperty("error")
    })

    it("returns cached results on second request", async () => {
        // First request
        const request1 = new Request("http://example.com/api/search?q=cached")
        const response1 = await worker.fetch(request1, mockEnv, mockCtx)
        
        expect(response1.status).toBe(200)
        const data1 = await response1.json() as any
        expect(data1.cached).toBe(false)
        
        // Second request should be cached
        const request2 = new Request("http://example.com/api/search?q=cached")
        const response2 = await worker.fetch(request2, mockEnv, mockCtx)
        
        expect(response2.status).toBe(200)
        const data2 = await response2.json() as any
        expect(data2.cached).toBe(true)
        expect(data2.timestamp).toBe(data1.timestamp)
    })
})
