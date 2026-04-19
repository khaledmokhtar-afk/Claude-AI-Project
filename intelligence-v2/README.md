# IESL Project Intelligence v2

Single Next.js 15 app. User types a project brief; six focused Claude calls stream back structured JSON for plan, risks (ISO-grounded), and cost/personnel. Panels render independently as their data arrives — one failure never kills the dashboard.

## Run

```bash
pnpm install
cp .env.example .env.local  # add your ANTHROPIC_API_KEY
pnpm dev
```

Open `http://localhost:3000`.

## Architecture

See [`docs/v2-architecture.md`](docs/v2-architecture.md).
