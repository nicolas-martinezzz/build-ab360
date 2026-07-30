# AB360

Multilingual marketing site and self-assessment tool, built with Next.js and
deployed as a static export.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| i18n | next-intl — Spanish, English, Catalan |
| Output | Static export (`output: "export"`) |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Backend | PHP endpoints in `public/api`, MySQL |

The site is fully static: there is no Node.js server in production. Form
submissions post to the PHP endpoints, which are deployed alongside the build.

## Getting started

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev             # http://localhost:3000
```

`.env` holds every deploy, database, and mail credential. It is gitignored and
must never be committed — `.env.example` documents the variables required.

## Project layout

```
src/
  app/[locale]/       Routes, grouped by (site) and (diagnostic)
  components/         sections/ (page blocks), ui/ (primitives), diagnostic/
  lib/                Pure logic, no React
  config/             Route definitions and constants
  messages/           i18n catalogues: es.json, en.json, ca.json
  i18n/               Routing, slug map, request config
public/
  api/                PHP endpoints (forms, diagnostic, export)
  admin/              Admin panel (PHP)
scripts/              Build checks and deployment
tests/e2e/            Playwright suites
```

Localized routes use translated slugs — `/es/programa`, `/en/program`,
`/ca/programa` — mapped in `src/i18n/slug-map.ts`.

See [conventions.md](conventions.md) for naming and component conventions.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `out/` |
| `npm test` | Unit tests |
| `npm run lint` | ESLint |
| `npm run verify` | Full gate: lint, palette, JSON BOM, i18n parity, tests, build |
| `npm run test:e2e` | Playwright suite |
| `npm run deploy` | Build output and PHP endpoints to production |
| `npm run ship` | Preflight checks, verify, then deploy |

Run `npm run verify` before pushing. It is the same gate the deploy runs.

### Automated checks

Beyond linting and tests, the build enforces three project-specific rules:

- **Palette** — flags colors outside the approved brand palette.
  `src/lib/diagnostic/report-html.ts` is exempt: it generates standalone
  email/PDF HTML, and mail clients strip CSS variables and Tailwind tokens, so
  literal hex values are required there.
- **JSON BOM** — rejects byte-order marks in message catalogues, which break
  JSON parsing.
- **i18n parity** — fails if the three locales do not define the same keys.

## Testing

Unit tests live next to the code they cover, as `*.test.ts`. End-to-end suites
are in `tests/e2e/`.

```bash
npm test                                          # unit
npx playwright test --project=chromium            # e2e against localhost
PROD_BASE_URL=https://example.com npx playwright test intro-prod --project=chromium
```

Suites ending in `-prod` run against a deployed site rather than localhost.
They default to production and accept `PROD_BASE_URL` / `ADMIN_BASE_URL` to
target staging or a preview instead.

## Deployment

`npm run ship` is the intended path. It refuses to deploy unless the working
tree is clean and the branch is in sync with origin, so production can only
receive a commit that is already pushed. It then runs `npm run verify` and
hands off to the deploy script.

The deploy uploads the static build over SFTP, syncing `out/` to the remote
webroot and deleting remote files that no longer exist locally. PHP endpoints,
PDFs, and the admin panel are uploaded separately; database credentials are
written to a config file stored outside the webroot.

Every server detail — host, port, user, SSH key, remote paths, public URLs —
comes from environment variables. Nothing about the infrastructure is hardcoded
in this repository.

> `public/.htaccess` is synced to the webroot on every deploy, so server rewrite
> and access rules must be edited there, not directly on the server, or the next
> deploy will overwrite them.
