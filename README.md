# Global Leads Platform — Technical Lead Test

Phase 1 reference implementation: a responsive, multilingual website with an
accessible **lead capture form** and a server-side **lead handler** that validates,
sanitises, stores, and routes leads by type + country of origin.

This repo contains both the **written deliverables** (`docs/`) and a **working
project** (a Next.js app demonstrating the proposed stack).

> The original brief is in [`TASK.md`](TASK.md).

```
.
├── README.md
├── TASK.md                 # Original brief
├── docs/
│   ├── _assets/            # Mermaid sources for the diagrams
│   ├── 1-solution.md       # Architecture, tech, plain-English summary, threat model
│   └── 2-delivery-estimate-and-timeline.md
├── src/
│   ├── app/
│   │   ├── [locale]/       # Localised pages (en, mi, fr, de) + SEO/social meta + JSON-LD
│   │   ├── api/leads/      # Lead capture API route (form handler)
│   │   └── globals.css
│   ├── components/         # Accessible LeadCaptureForm
│   ├── i18n/               # next-intl routing/config/navigation
│   ├── lib/                # Validation, sanitisation, storage, routing, delivery
│   └── middleware.ts       # Locale negotiation
├── messages/               # Translation catalogues per locale
├── tests/                  # Vitest unit tests
└── data/                   # Local lead store (JSONL, git-ignored)
```

## Tech stack

| Concern        | Choice                                                                               |
| -------------- | ------------------------------------------------------------------------------------ |
| Framework      | Next.js 14 (App Router) + React 18 + TypeScript                                      |
| i18n           | next-intl (locale-prefixed routing, 10-market ready)                                 |
| Forms          | React Hook Form + Zod (one schema shared client/server — and Phase 2 mobile)         |
| Sanitisation   | isomorphic-dompurify                                                                 |
| Anti-spam      | Cloudflare Turnstile (client widget + server verify) + per-IP rate limit             |
| Storage (demo) | File JSON-Lines store behind a `LeadStore` interface (prod → region-pinned Postgres) |
| Tests          | Vitest                                                                               |
| Lint/format    | ESLint (next/core-web-vitals) + Prettier                                             |

See [`docs/1-solution.md`](docs/1-solution.md) for the full rationale.

## Prerequisites

- Node.js **>= 18.18** (developed on Node 22)
- npm

## Setup

```bash
npm install
cp .env.example .env.local   # optional — demo runs without any secrets
```

All secrets are optional for local dev. With no keys:

- **Turnstile** — the widget is not rendered and the server skips the challenge
  **in development** (`npm run dev`); the per-IP rate limit still applies. In
  **production** (`npm run build && npm start`) a missing `TURNSTILE_SECRET_KEY`
  **fails closed** (every submit → `403`), so configure Turnstile before deploying.
  Cloudflare provides always-pass/always-fail test keys for local testing.
- **Email / CRM** — delivery is simulated (logged, marked delivered).

## Run

```bash
npm run dev
```

Open <http://localhost:3100/en> (also `/mi`, `/fr`, `/de`). The root `/` redirects
to a negotiated locale. (Server runs on port **3100** — set in the `dev`/`start` scripts.)

## Try the lead handler

Submit the form in the browser, or hit the API directly:

```bash
curl -i -X POST http://localhost:3100/api/leads \
  -H 'content-type: application/json' \
  -d '{
    "firstName":"Ada","lastName":"Lovelace",
    "email":"ada@example.com","mobile":"+64 21 555 0000",
    "acceptTerms":true,"marketingReferral":"Google",
    "notes":"Keen to hear more","turnstileToken":""
  }'
```

(Run against `npm run dev` so the Turnstile challenge is skipped; under `npm start`
without keys this returns `403` by design — see the secrets note above.)

A successful call returns `202 Accepted` with the lead id, and the record is appended
to `data/leads.jsonl`. The handler:

1. **Rate-limits** per IP and **verifies the Turnstile token** (anti-spam).
2. **Validates** the payload against the shared Zod schema.
3. **Sanitises** every free-text field (strips HTML/scripts/control chars).
4. **Persists** the lead as `pending` _before_ delivery (so nothing is lost on failure).
5. **Routes** it by **server-derived country** (geo-IP) to email and/or a 3rd-party
   CRM API, then marks it `delivered` or `failed` (failed → retried / replayable).

## Scripts

| Script                        | Purpose                  |
| ----------------------------- | ------------------------ |
| `npm run dev`                 | Start the dev server     |
| `npm run build` / `npm start` | Production build / serve |
| `npm test`                    | Run unit tests (Vitest)  |
| `npm run test:coverage`       | Tests with coverage      |
| `npm run typecheck`           | TypeScript, no emit      |
| `npm run lint`                | ESLint                   |
| `npm run format`              | Prettier write           |

## Accessibility & SEO notes

- Semantic labels, `aria-invalid`/`aria-describedby` error wiring, visible focus
  rings, a skip link, and `role="alert"`/`role="status"` live regions on the form.
- Per-locale `lang`, canonical + `hreflang` alternates, OpenGraph/Twitter meta, and
  schema.org **JSON-LD** structured data emitted from the layout.

## What's intentionally stubbed

This is a focused reference for the test, not the full platform. The CMS, live data
feed, durable queue/DLQ, region-pinned Postgres, WAF and observability stack are
**designed in [`docs/1-solution.md`](docs/1-solution.md)** and represented here by clean
interfaces (e.g. `LeadStore`, `DeliveryAdapter`) so production wiring is a swap, not a
rewrite.
