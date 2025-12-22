export default {
    search: {
        placeholder: "Enter keyword...",
        button: "Search",
        searching: "Searching...",
        noResults: "No results yet",
        noResultsHint: "Enter a keyword and click Search",
        loading: "Loading results...",
        error: "Error:",
        autocompleteHint: "Press Tab or → to complete",
        resultsCount: "{selected} / {total}",
    },
    results: {
        selectAll: "Select all",
        exportJson: "Export JSON",
        exportCsv: "Export CSV",
        exportXlsx: "Export XLSX",
        exportXml: "Export XML",
        openLink: "Open link",
        score: "Score",
    },
    sources: {
        wikipedia: "Wikipedia",
        hackernews: "Hacker News",
        openlibrary: "Open Library",
        github: "GitHub",
    },
    header: {
        title: "Search Aggregator",
        subtitle: "Search across Wikipedia, Hacker News, Open Library and GitHub",
    },
    csv: {
        source: "Source",
        title: "Title",
        description: "Description",
        score: "Score",
        url: "URL",
    },
} as const
