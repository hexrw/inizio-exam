# Multi-Source Search Aggregator

A full-stack search application that aggregates results from multiple public APIs (Wikipedia, Hacker News, Open Library, and GitHub), normalizes them with a custom scoring algorithm, and allows users to select and export results in JSON or CSV format.

## 🚀 Tech Stack

**Frontend:**
- Vue 3 (Composition API with TypeScript)
- UnoCSS (Tailwind-compatible utility-first CSS)
- Vue Router
- Vite

**Backend:**
- Hono (Web framework)
- CloudFlare Workers (Serverless runtime)
- TypeScript

**Testing:**
- Vitest

## Features

### Core Functionality
- ✅ Single keyword search across 4 public APIs
- ✅ Real-time search results aggregation
- ✅ Unified result display with source badges
- ✅ Custom scoring algorithm for relevance ranking
- ✅ Result selection with checkboxes
- ✅ Export to JSON and CSV formats
- ✅ In-memory caching (5 minutes)
- ✅ Unit tests for normalization and export validation

### API Integrations

1. **Wikipedia Search API**
   - Searches articles and retrieves extracts
   - Fetches page summaries for better snippets

2. **Hacker News Algolia API**
   - Full-text search through stories
   - Includes points, comments, and author information

3. **Open Library Search API**
   - Book search with author and publication details
   - Edition count for popularity metrics

4. **GitHub Search API**
   - Repository search sorted by stars
   - Includes star count, forks, and language information

## Scoring Algorithm

Each search result receives a score from **0-100** based on three factors:

### 1. Title Relevance (0-40 points)
- **Exact match**: 40 points
- **Starts with query**: 35 points
- **Contains query**: 20 points
- **Partial word matches**: Up to 15 points (proportional)

### 2. Content Quality (0-20 points)
- **Optimal snippet** (100-500 chars): 20 points
- **Short snippet** (50-100 chars): 10 points
- **Other lengths**: 5 points

### 3. Source-Specific Metrics (0-40 points)

#### Wikipedia
- Based on search ranking position
- First result: 40 points
- Each position down: -5 points (minimum 5)

#### Hacker News
- Based on story points
- Formula: `5 + (points / 100) × 35`
- 0 points → 5, 100+ points → 40 (capped)

#### GitHub
- Based on repository stars
- Formula: `5 + (stars / 1000) × 35`
- 0 stars → 5, 1000+ stars → 40 (capped)

#### Open Library
- Based on number of editions
- Formula: `10 + (editions × 3)`
- 1 edition → 10, 10+ editions → 40 (capped)

**Final Score**: Sum of all factors, capped at 100. Results are sorted by score descending.

## Development

### Prerequisites
- Node.js 20.19+ or 22.12+
- Bun (recommended) or npm

### Installation

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run tests
bun test

# Run tests with UI
bun test:ui
```

### Building

```bash
# Type check and build
bun run build

# Preview production build locally
bun run preview
```

### Deployment

```bash
# Deploy to CloudFlare Workers
bun run deploy
```

## Testing

Full unit test coverage bootstraped with Claude Sonnet 4.5

Run tests with:
```bash
bun run test          # Run once
bun run test:watch    # Watch mode
bun run test:ui       # Interactive UI
```

## 📦 Caching Strategy

- **Duration**: 5 minutes
- **Storage**: In-memory Map (suitable for CloudFlare Workers)
- **Cleanup**: Auto-cleanup when cache exceeds 100 entries
- **Key**: Normalized lowercase query string

## 🌐 API Endpoints

### `GET /api/search?q={query}`

Searches all integrated APIs and returns aggregated results.

**Query Parameters:**
- `q` (required): Search keyword

**Response:**
```json
{
  "query": "javascript",
  "results": [
    {
      "id": "wikipedia-12345",
      "source": "wikipedia",
      "title": "JavaScript",
      "snippet": "JavaScript is a programming language...",
      "score": 95.5,
      "url": "https://en.wikipedia.org/wiki/JavaScript",
      "metadata": { }
    }
  ],
  "timestamp": 1702742400000,
  "cached": false
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1702742400000
}
```

## Rate Limiting & Error Handling

- GitHub API has rate limits; responses gracefully handle 403 errors
- All API calls include try-catch blocks
- Failed API calls don't break the entire search (returns empty array)
- Frontend displays error messages in Czech
