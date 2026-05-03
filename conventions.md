# Coding Conventions — AB360 V3

## File Structure

```
src/
  app/
    [locale]/
      (site)/
        [route]/
          page.tsx        ← page component (thin, no logic)
      layout.tsx
  components/
    sections/             ← page-level section blocks
      [feature]/
        [Feature]Section.tsx
    ui/                   ← atomic, reusable primitives
    pages/                ← full-page compositions
    diagnostic/           ← diagnostic-specific components
  lib/                    ← pure logic, no React
  config/                 ← route definitions, constants
  messages/               ← i18n JSON files
    es.json
    en.json
    ca.json
```

## Naming

| Entity | Convention | Example |
|--------|-----------|---------|
| React components | PascalCase | `HeroSection.tsx` |
| Hooks | camelCase + `use` prefix | `useFormState.ts` |
| Utility functions | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `NavItem`, `FeatureConfig` |
| Constants | SCREAMING_SNAKE | `MAX_RETRIES` |
| CSS classes | Tailwind utilities only — no custom CSS unless unavoidable |

## Components

- One component per file
- Props interface defined in the same file, typed explicitly (no `any`)
- No default exports for utilities — named exports only
- Page components are thin: import sections, pass props, no business logic
- Presentational components receive all data via props (container/presentational split)

## i18n

- **Every user-visible string** must live in `src/messages/{locale}.json`
- Paridad obligatoria: adding a key in `es.json` → must add to `en.json` and `ca.json`
- Keys are namespaced by page/feature: `{ "home": { "hero": { "title": "..." } } }`
- Run `npm run check:i18n-parity` before any commit touching messages

## Tests

- Test files: `*.test.ts` or `*.test.tsx`, colocated with the source file
- Pure logic (no React) → `src/lib/`
- React component tests use `@testing-library/react` + `happy-dom`
- No mocking of internal modules without explicit justification
- Coverage target: 100% for `src/lib/diagnostic/**`

## Styles

- Tailwind CSS 4 utilities only
- Color palette: use design tokens only (enforced by `npm run lint:palette`)
- No inline `style=` props unless animating dynamic values
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)

## API / PHP Endpoints

- Live in `public/api/*.php`
- Each endpoint validates input, implements anti-bot checks
- No secrets hardcoded — use environment variables

## Git

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`
- One commit per logical change
- No `--no-verify`, no AI attribution in commit messages
- Branch: `staging` for active work, PRs target `main`

## Forbidden Patterns

- `any` type (use `unknown` + type narrowing)
- `console.log` in production code
- Direct DOM manipulation outside of refs
- Hardcoded strings visible to the user (i18n violation)
- CSS custom properties outside the design token system
