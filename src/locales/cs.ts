export default {
    search: {
        placeholder: "Zadejte klíčové slovo...",
        button: "Hledat",
        searching: "Hledám...",
        noResults: "Zatím žádné výsledky",
        noResultsHint: "Zadejte klíčové slovo a klikněte na Hledat",
        loading: "Načítám výsledky...",
        error: "Chyba:",
        autocompleteHint: "Stiskněte Tab nebo → pro dokončení",
        resultsCount: "{selected} / {total}",
    },
    results: {
        selectAll: "Vybrat vše",
        exportJson: "Export JSON",
        exportCsv: "Export CSV",
        exportXlsx: "Export XLSX",
        exportXml: "Export XML",
        openLink: "Otevřít odkaz",
        score: "Skóre",
    },
    sources: {
        wikipedia: "Wikipedia",
        hackernews: "Hacker News",
        openlibrary: "Open Library",
        github: "GitHub",
    },
    header: {
        title: "Vyhledávač",
        subtitle: "Vyhledávejte napříč Wikipedia, Hacker News, Open Library a GitHub",
    },
    csv: {
        source: "Zdroj",
        title: "Název",
        description: "Popis",
        score: "Skóre",
        url: "URL",
    },
} as const
