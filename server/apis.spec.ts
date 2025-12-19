import { beforeEach, describe, expect, it, vi } from "vitest"
import {
    searchGitHub,
    searchHackerNews,
    searchOpenLibrary,
    searchWikipedia,
} from "./apis"

// Acceptable for mocking purposes
declare var global: any

// Mock fetch globally
global.fetch = vi.fn()

describe("API functions", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("searchWikipedia", () => {
        it("should return search results from Wikipedia", async () => {
            const mockSearchResponse = {
                query: {
                    search: [
                        {
                            pageid: 123,
                            title: "JavaScript",
                            snippet: "A programming language",
                        },
                    ],
                },
            }

            const mockExtractResponse = {
                query: {
                    pages: {
                        "123": {
                            extract:
                                "JavaScript is a high-level programming language.",
                        },
                    },
                },
            }

            ;(global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockSearchResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockExtractResponse,
                })

            const results = await searchWikipedia("JavaScript")

            expect(results).toHaveLength(1)
            expect(results[0].source).toBe("wikipedia")
            expect(results[0].title).toBe("JavaScript")
            expect(results[0].snippet).toContain("JavaScript is a high-level")
            expect(results[0].url).toContain("wikipedia.org")
            expect(results[0].metadata).toHaveProperty("pageid", 123)
        })

        it("should handle empty search results", async () => {
            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ query: {} }),
            })

            const results = await searchWikipedia("nonexistentquery12345")
            expect(results).toHaveLength(0)
        })

        it("should handle API errors gracefully", async () => {
            ;(global.fetch as any).mockRejectedValueOnce(
                new Error("Network error"),
            )

            const results = await searchWikipedia("test")
            expect(results).toHaveLength(0)
        })

        it("should process all returned results", async () => {
            const mockSearchResponse = {
                query: {
                    search: Array.from({ length: 10 }, (_, i) => ({
                        pageid: i,
                        title: `Item ${i}`,
                        snippet: `Snippet ${i}`,
                    })),
                },
            }

            const mockExtractResponse = {
                query: {
                    pages: Object.fromEntries(
                        Array.from({ length: 10 }, (_, i) => [
                            i.toString(),
                            { extract: `Extract ${i}` },
                        ]),
                    ),
                },
            }

            ;(global.fetch as any)
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockSearchResponse,
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockExtractResponse,
                })

            const results = await searchWikipedia("test")
            expect(results.length).toBeGreaterThan(0)
            expect(results.length).toBeLessThanOrEqual(10)
        })
    })

    describe("searchHackerNews", () => {
        it("should return search results from HackerNews", async () => {
            const mockResponse = {
                hits: [
                    {
                        objectID: "hn123",
                        title: "Great Article",
                        story_text: "This is a great article",
                        url: "https://example.com",
                        points: 100,
                        num_comments: 50,
                        author: "testuser",
                        created_at: "2023-01-01T00:00:00Z",
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            })

            const results = await searchHackerNews("article")

            expect(results).toHaveLength(1)
            expect(results[0].source).toBe("hackernews")
            expect(results[0].title).toBe("Great Article")
            expect(results[0].snippet).toBe("This is a great article")
            expect(results[0].metadata).toBeDefined()
            expect(results[0].metadata?.points).toBe(100)
            expect(results[0].metadata?.numComments).toBe(50)
        })

        it("should handle missing story text", async () => {
            const mockResponse = {
                hits: [
                    {
                        objectID: "hn456",
                        title: "Link Post",
                        url: "https://example.com",
                        points: 50,
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            })

            const results = await searchHackerNews("link")
            expect(results[0].snippet).toBe("No description available")
        })

        it("should handle API errors gracefully", async () => {
            ;(global.fetch as any).mockRejectedValueOnce(
                new Error("Network error"),
            )

            const results = await searchHackerNews("test")
            expect(results).toHaveLength(0)
        })
    })

    describe("searchOpenLibrary", () => {
        it("should return search results from OpenLibrary", async () => {
            const mockResponse = {
                docs: [
                    {
                        key: "/works/OL12345W",
                        title: "The Great Book",
                        author_name: ["John Doe", "Jane Smith"],
                        first_publish_year: 2020,
                        subject: ["Programming", "Technology", "Education"],
                        edition_count: 5,
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            })

            const results = await searchOpenLibrary("programming")

            expect(results).toHaveLength(1)
            expect(results[0].source).toBe("openlibrary")
            expect(results[0].title).toBe("The Great Book")
            expect(results[0].snippet).toContain("John Doe, Jane Smith")
            expect(results[0].snippet).toContain("2020")
            expect(results[0].url).toContain("openlibrary.org")
            expect(results[0].metadata).toBeDefined()
            expect(results[0].metadata?.editionCount).toBe(5)
        })

        it("should handle missing author information", async () => {
            const mockResponse = {
                docs: [
                    {
                        key: "/works/OL67890W",
                        title: "Anonymous Book",
                        first_publish_year: 2021,
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            })

            const results = await searchOpenLibrary("book")
            expect(results[0].snippet).toContain("Unknown")
        })

        it("should handle API errors gracefully", async () => {
            ;(global.fetch as any).mockRejectedValueOnce(
                new Error("Network error"),
            )

            const results = await searchOpenLibrary("test")
            expect(results).toHaveLength(0)
        })
    })

    describe("searchGitHub", () => {
        it("should return search results from GitHub", async () => {
            const mockResponse = {
                items: [
                    {
                        id: 12345,
                        name: "awesome-repo",
                        full_name: "user/awesome-repo",
                        description: "An awesome repository",
                        html_url: "https://github.com/user/awesome-repo",
                        stargazers_count: 1000,
                        forks_count: 200,
                        language: "JavaScript",
                        updated_at: "2023-12-01T00:00:00Z",
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            })

            const results = await searchGitHub("awesome")

            expect(results).toHaveLength(1)
            expect(results[0].source).toBe("github")
            expect(results[0].title).toBe("user/awesome-repo")
            expect(results[0].snippet).toBe("An awesome repository")
            expect(results[0].metadata).toBeDefined()
            expect(results[0].metadata?.stars).toBe(1000)
            expect(results[0].metadata?.language).toBe("JavaScript")
        })

        it("should handle rate limit errors", async () => {
            ;(global.fetch as any).mockResolvedValueOnce({
                ok: false,
                status: 403,
            })

            const results = await searchGitHub("test")
            expect(results).toHaveLength(0)
        })

        it("should handle missing description", async () => {
            const mockResponse = {
                items: [
                    {
                        id: 67890,
                        name: "no-desc-repo",
                        full_name: "user/no-desc-repo",
                        html_url: "https://github.com/user/no-desc-repo",
                        stargazers_count: 10,
                    },
                ],
            }

            ;(global.fetch as any).mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse,
            })

            const results = await searchGitHub("repo")
            expect(results[0].snippet).toBe("No description available")
        })

        it("should handle API errors gracefully", async () => {
            ;(global.fetch as any).mockRejectedValueOnce(
                new Error("Network error"),
            )

            const results = await searchGitHub("test")
            expect(results).toHaveLength(0)
        })
    })
})
