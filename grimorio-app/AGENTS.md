<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project gotchas (Grimório)

- The URL segment `guide` is reserved by Next 16/Turbopack dev and silently returns 404 — never use it for a route. This project's help page lives at `/ajuda` (`app/(main)/ajuda/page.tsx`).
- Components may occasionally relocate themselves into `lib/components/` on this machine — verify tree structure before assuming a path.
- Machine network is restricted (picsum.photos times out). Use `registry.npmjs.org` or local `/samples/*` files for live tests.
- `next dev` only discovers routes that existed before it started or in fresh state; if a new route keeps 404ing, check for reserved names first, then clear `.next` and restart.
- Icon set is generated from the real logo via `scripts/gen-icons.ps1` (System.Drawing, offline). `public/*.png` icons must not be overwritten by the old `gen-icons.mjs` script (deleted).
