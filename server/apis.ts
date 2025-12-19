import type { SearchResult } from "./types"

export async function searchWikipedia(query: string): Promise<SearchResult[]> {
    try {
        // Wikipedia requires a User-Agent header
        const headers = {
            "User-Agent": "SearchAggregator/1.0 (Educational Project)",
            Accept: "application/json",
        }

        // First, search for pages
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=5`
        const searchResponse = await fetch(searchUrl, { headers })
        const searchData = (await searchResponse.json()) as any

        if (!searchData.query?.search) {
            return []
        }

        // Get extracts for the results
        const pageIds = searchData.query.search
            .map((item: any) => item.pageid)
            .join("|")
        const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${pageIds}&format=json&origin=*`
        const extractResponse = await fetch(extractUrl, { headers })
        const extractData = (await extractResponse.json()) as any

        const results: SearchResult[] = []

        searchData.query.search.forEach((item: any, index: number) => {
            const page = extractData.query?.pages?.[item.pageid]
            const snippet =
                page?.extract || item.snippet.replace(/<[^>]*>/g, "")

            results.push({
                id: `wikipedia-${item.pageid}`,
                source: "wikipedia",
                title: item.title,
                snippet: snippet.substring(0, 300),
                score: 0, // Will be calculated later
                url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`,
                metadata: {
                    index,
                    pageid: item.pageid,
                },
            })
        })

        return results
    } catch (error) {
        console.error("Wikipedia search error:", error)
        return []
    }
}

export async function searchHackerNews(query: string): Promise<SearchResult[]> {
    try {
        const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=5`
        const response = await fetch(url)
        const data = (await response.json()) as any

        if (!data.hits) {
            return []
        }

        return data.hits.map((hit: any) => ({
            id: `hackernews-${hit.objectID}`,
            source: "hackernews" as const,
            title: hit.title || "No title",
            snippet:
                hit.story_text ||
                hit.comment_text ||
                "No description available",
            score: 0, // Will be calculated later
            url:
                hit.url ||
                `https://news.ycombinator.com/item?id=${hit.objectID}`,
            metadata: {
                points: hit.points || 0,
                numComments: hit.num_comments || 0,
                author: hit.author,
                createdAt: hit.created_at,
            },
        }))
    } catch (error) {
        console.error("HackerNews search error:", error)
        return []
    }
}

export async function searchOpenLibrary(
    query: string,
): Promise<SearchResult[]> {
    try {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
        const response = await fetch(url)
        const data = (await response.json()) as any

        if (!data.docs) {
            return []
        }

        return data.docs.slice(0, 5).map((doc: any, index: number) => {
            const authors = doc.author_name?.join(", ") || "Unknown"
            const year = doc.first_publish_year || "N/A"
            const snippet = `By ${authors} (${year}). ${doc.subject?.slice(0, 3).join(", ") || "No subjects listed"}`

            return {
                id: `openlibrary-${doc.key}`,
                source: "openlibrary" as const,
                title: doc.title || "No title",
                snippet: snippet.substring(0, 300),
                score: 0, // Will be calculated later
                url: `https://openlibrary.org${doc.key}`,
                metadata: {
                    editionCount: doc.edition_count || 1,
                    publishYear: doc.first_publish_year,
                    authors: doc.author_name,
                },
            }
        })
    } catch (error) {
        console.error("OpenLibrary search error:", error)
        return []
    }
}

export async function searchGitHub(query: string): Promise<SearchResult[]> {
    try {
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`
        const response = await fetch(url, {
            headers: {
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Search-Aggregator",
            },
        })

        // Check rate limit
        if (response.status === 403) {
            console.warn("GitHub API rate limit exceeded")
            return []
        }

        if (!response.ok) {
            console.error("GitHub API error:", response.status)
            return []
        }

        const data = (await response.json()) as any

        if (!data.items) {
            return []
        }

        return data.items.map((repo: any) => ({
            id: `github-${repo.id}`,
            source: "github" as const,
            title: repo.full_name || repo.name,
            snippet: repo.description || "No description available",
            score: 0, // Will be calculated later
            url: repo.html_url,
            metadata: {
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                language: repo.language,
                updatedAt: repo.updated_at,
            },
        }))
    } catch (error) {
        console.error("GitHub search error:", error)
        return []
    }
}
