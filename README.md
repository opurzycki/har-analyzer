# HAR Analyzer

A tool for analyzing HTTP Archive (HAR) files to identify failed requests and performance issues.

> **⚠️ Work in Progress** - Backend complete, frontend UI in progress.

## What It Does

Upload a HAR file (exported from browser DevTools) and get instant analysis:
- Failed HTTP requests (4xx/5xx errors)
- Slow requests (over 1 second)
- Performance statistics

## Tech Stack

**Backend:** Java 21, Spring Boot 3.3.5  
**Frontend:** React 18, TypeScript, Vite, Tailwind CSS

## Quick Start

### Backend
```bash
cd har-analyzer-backend
./mvnw spring-boot:run
# Runs on http://localhost:8080
```

### Frontend
```bash
cd har-analyzer-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## API Example

```bash
# Upload a HAR file of your choosing
curl -X POST http://localhost:8080/api/har/upload -F "file=@yourfile.har"
# Or use a test HAR file
curl -X POST http://localhost:8080/api/har/upload -F "file=@test.har"

# Example response:
{
  "totalRequests": 25,
  "failedRequests": 3,
  "slowRequests": 5,
  "totalLoadTime": 8420.5,
  "totalSize": 234567,
  "failedRequestsList": [...],
  "slowRequestsList": [...]
}
```

## Why This Project?

Built as a learning project to demonstrate full-stack development skills. Solves a real problem I encounter daily - analyzing HAR files for debugging customer issues.

## Next Steps

- [ ] File upload UI
- [ ] Results visualization
- [ ] Extended data analysis
- [ ] Filtering and search
- [ ] Add Dockerfile to backend and frontend and orchestrate with docker compose
