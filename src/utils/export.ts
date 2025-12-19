import * as XLSX from "xlsx"
import i18n from "@/i18n"
import type { SearchResult } from "@/types/search"

const { t } = i18n.global

export function exportToJSON(results: SearchResult[]): void {
    const data = {
        exportDate: new Date().toISOString(),
        count: results.length,
        results: results.map((r) => ({
            source: r.source,
            title: r.title,
            snippet: r.snippet,
            score: r.score,
            url: r.url,
            metadata: r.metadata,
        })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    })
    downloadBlob(blob, `search-results-${Date.now()}.json`)
}

export function exportToCSV(results: SearchResult[]): void {
    const headers = [
        t("csv.source"),
        t("csv.title"),
        t("csv.description"),
        t("csv.score"),
        t("csv.url"),
    ]
    const rows = results.map((r) => [
        r.source,
        escapeCsvField(r.title),
        escapeCsvField(r.snippet),
        r.score.toString(),
        r.url,
    ])

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n",
    )

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    downloadBlob(blob, `search-results-${Date.now()}.csv`)
}

function escapeCsvField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`
    }
    return field
}

export function exportToXLSX(results: SearchResult[]): void {
    const worksheet = XLSX.utils.json_to_sheet(
        results.map((r) => ({
            [t("csv.source")]: r.source,
            [t("csv.title")]: r.title,
            [t("csv.description")]: r.snippet,
            [t("csv.score")]: r.score,
            [t("csv.url")]: r.url,
        })),
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Search Results")

    XLSX.writeFile(workbook, `search-results-${Date.now()}.xlsx`)
}

export function exportToXML(results: SearchResult[]): void {
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<searchResults exportDate="${new Date().toISOString()}" count="${results.length}">
${results
    .map(
        (r) => `  <result>
    <source>${escapeXml(r.source)}</source>
    <title>${escapeXml(r.title)}</title>
    <snippet>${escapeXml(r.snippet)}</snippet>
    <score>${r.score}</score>
    <url>${escapeXml(r.url)}</url>
  </result>`,
    )
    .join("\n")}
</searchResults>`

    const blob = new Blob([xmlContent], {
        type: "application/xml;charset=utf-8;",
    })
    downloadBlob(blob, `search-results-${Date.now()}.xml`)
}

function escapeXml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}

function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
