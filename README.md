# Find My New Job API

A REST API that analyzes your CV and finds matching job opportunities from LinkedIn. Upload a PDF resume and get back a ranked list of relevant job posts, powered by Claude AI and Apify.

## How it works

1. **Upload your CV** (PDF) to the `/jobs/match` endpoint
2. **Text extraction** — Stirling PDF parses the document
3. **Query generation** — Claude reads your CV and generates optimized LinkedIn search queries
4. **Job scraping** — Apify fetches matching LinkedIn posts using those queries
5. **Ranking** — Claude scores each post against your profile and returns ranked results

## Requirements

- Node.js >= 22
- Docker (for Stirling PDF)
- [Anthropic API key](https://console.anthropic.com/)
- [Apify API token](https://console.apify.com/account/integrations)

## Getting started

**1. Clone and install dependencies**

```bash
npm install
```

**2. Set up environment variables**

```bash
cp .env.example .env
```

Fill in your credentials in `.env`:

```env
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=localhost

STIRLING_URL=http://localhost:8080

ANTHROPIC_API_KEY=your_anthropic_key_here

APIFY_API_TOKEN=your_apify_token_here
APIFY_MAX_POSTS=20
```

**3. Start Stirling PDF**

```bash
docker compose up -d
```

**4. Start the API**

```bash
# Development (with hot reload)
npm run dev

# Production
npm run build && npm start
```

The API will be available at `http://localhost:3000`.
Interactive API docs at `http://localhost:3000/docs`.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/cv` | Extract text from a CV PDF |
| `POST` | `/jobs/match` | Match CV to LinkedIn job posts |

### `POST /jobs/match`

Upload a CV PDF and receive a ranked list of matching job opportunities.

**Request:** `multipart/form-data` with a `file` field (PDF, max 10MB)

**Response:**
```json
{
  "ok": true,
  "data": {
    "jobs": [
      {
        "title": "Senior Software Engineer",
        "company": "Acme Corp",
        "description": "...",
        "url": "https://linkedin.com/posts/...",
        "matchScore": 92,
        "matchReason": "Strong alignment in TypeScript and Node.js experience"
      }
    ]
  }
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint source files |
| `npm run format` | Format source files |

## Tech stack

- **[Fastify](https://fastify.dev/)** — HTTP framework
- **[Claude (claude-sonnet-4-6)](https://www.anthropic.com/claude)** — Query generation and job matching
- **[Apify](https://apify.com/)** — LinkedIn post scraping via `harvestapi/linkedin-post-search`
- **[Stirling PDF](https://stirlingtools.com/)** — PDF text extraction and OCR
- **[Biome](https://biomejs.dev/)** — Linting and formatting
- **TypeScript** — with `tsup` for bundling
