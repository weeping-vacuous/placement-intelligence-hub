# JSSATEN Placement Intelligence Hub

Companies Research & Placement Analytics Portal for **JSS Academy of Technical Education and Technology** (short tag `JSSATEN`).

- **Phase 1 is UI-only.** All data comes from `src/data/seedCompanies.ts` (one Accenture record) and `src/data/skillTopics.ts`. No database, no backend.
- **Fully public.** There is no login, no auth, no protected routes.
- **Routes:** `/` (company grid), `/company` → redirects to `/company/intelligence`, `/company/skills`.
- **Phase 2 — Supabase.** The portal reads live data from your own Supabase database, read-only. Paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env` (see `.env.example`), then `npm install && npm run dev` — that is the only manual step. Company cards and the 22 intelligence sections come from `public.company_json` (`short_json` / `full_json`) only; skill cards and 10-level roadmaps come from `company_skill_levels`, `skill_set_master`, `proficiency_levels`, and `skill_set_topics`. No other table is queried, no joins across the normalized tables, no auth. The React Query hooks live in `src/lib/companyApi.ts` and pipe rows through the unchanged normalizers in `src/lib/companyData.ts`. `src/data/seedCompanies.ts` and `src/data/skillTopics.ts` remain in the repo as a documented fallback but are no longer imported by the live render path.
- Optional env: `VITE_LOGO_DEV_PUBLISHABLE_KEY` for Logo.dev company logos (falls back to seed `logo_url`, then an initial letter).
- CTC, stipend and selection ratio are never displayed.

Note: this project runs on TanStack Start + Tailwind v4 (the platform's fixed stack), so file-based routes replace React Router with identical URLs and behavior.
