# Find My New Job API

A REST API that analyses your CV and finds matching job opportunities from LinkedIn. Upload a PDF resume, review AI-generated search keywords, then get back a ranked list of relevant job posts — powered by Claude AI and Apify.

## How it works

1. **Upload your CV** (PDF) to `POST /cv`
2. **Text extraction** — Stirling PDF parses the document (OCR fallback for image-based PDFs)
3. **Query generation** — Claude reads your CV and generates optimised LinkedIn search keywords
4. **Session storage** — CV text and tags are stored in Redis for 10 minutes; a `sessionToken` is returned
5. **Keyword review** — the client can edit the tags before the next step (nothing is re-uploaded)
6. **Job scraping** — `POST /jobs/match` retrieves the CV from Redis using the token, then calls Apify
7. **Ranking** — Claude scores each post against your profile and returns ranked results

No CV data is persisted beyond the Redis TTL.

## Requirements

- Node.js >= 22
- Docker (for Stirling PDF and Redis)
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
CORS_ORIGIN=*

STIRLING_URL=http://localhost:8080

ANTHROPIC_API_KEY=your_anthropic_key_here

APIFY_API_TOKEN=your_apify_token_here
APIFY_MAX_POSTS=20

REDIS_URL=redis://localhost:6379
SESSION_TTL_SECONDS=600
```

**3. Start Stirling PDF and Redis**

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
| `POST` | `/cv` | Extract CV text, generate search tags, and create a session |
| `POST` | `/jobs/match` | Match CV to LinkedIn job posts using a session token |

### `POST /cv`

Upload a CV PDF to extract text and generate search keywords.

**Request:** `multipart/form-data` with a `file` field (PDF, max 10 MB)

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionToken": "d4e8f1a2-...",
    "tags": [
      "Senior TypeScript engineer remote",
      "Node.js backend developer",
      "Fullstack engineer fintech"
    ]
  }
}
```

The `sessionToken` is valid for 10 minutes. Pass it to `POST /jobs/match` to avoid re-uploading the CV.

---

### `POST /jobs/match`

Find and rank LinkedIn job posts against the stored CV profile.

**Request:** `application/json`

```json
{
  "sessionToken": "d4e8f1a2-...",
  "tags": ["Senior TypeScript engineer remote", "Node.js backend developer"]
}
```

The `tags` array may differ from the ones returned by `POST /cv` — the user can add or remove keywords before submitting.

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

**Error — session expired (404):**
```json
{
  "ok": false,
  "error": "Session not found or expired. Please upload your CV again."
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
- **[Claude (claude-haiku-4-5)](https://www.anthropic.com/claude)** — Query generation and job matching
- **[Apify](https://apify.com/)** — LinkedIn post scraping via `harvestapi/linkedin-post-search`
- **[Stirling PDF](https://stirlingtools.com/)** — PDF text extraction and OCR
- **[Redis](https://redis.io/)** — Short-lived session storage (no persistent data)
- **[Biome](https://biomejs.dev/)** — Linting and formatting
- **TypeScript** — with `tsup` for bundling
