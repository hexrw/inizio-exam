export interface SearchResult {
    id: string
    source: "wikipedia" | "hackernews" | "openlibrary" | "github"
    title: string
    snippet: string
    score: number
    url: string
    metadata?: Record<string, unknown>
}

export interface SearchResponse {
    query: string
    results: SearchResult[]
    timestamp: number
}
