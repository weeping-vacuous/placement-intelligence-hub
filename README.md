# JSSATEN Placement Intelligence Hub

Companies Research & Placement Analytics Portal for **JSS Academy of Technical Education and Technology** (short tag `JSSATEN`).

- **Phase 1 is UI-only.** All data comes from `src/data/seedCompanies.ts` (one Accenture record) and `src/data/skillTopics.ts`. No database, no backend.
- **Fully public.** There is no login, no auth, no protected routes.
- **Routes:** `/` (company grid), `/company` → redirects to `/company/intelligence`, `/company/skills`.
- **Phase 2** will swap the data source in `src/lib/companyData.ts` (`getAllCompanySummaries`, `getCompanyById`) to database rows. The normalizers already accept the raw `short_json` / `full_json` / `skill_levels` shapes, so it is a one-file change.
- Optional env: `VITE_LOGO_DEV_PUBLISHABLE_KEY` for Logo.dev company logos (falls back to seed `logo_url`, then an initial letter).
- CTC, stipend and selection ratio are never displayed.

Note: this project runs on TanStack Start + Tailwind v4 (the platform's fixed stack), so file-based routes replace React Router with identical URLs and behavior.
