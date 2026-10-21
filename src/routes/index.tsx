import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { TYPE_STYLES } from "@/components/typeStyles";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeProvider";
import { useCompany } from "@/context/CompanyContext";
import { useCompanies } from "@/lib/companyApi";
import { COLLEGE_NAME, COLLEGE_SHORT, COMPANY_TYPES, type CompanySummary, type CompanyType } from "@/lib/companyData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_SHORT} Companies Research & Placement Analytics Portal` },
      { name: "description", content: `Research recruiting companies and placement intelligence for ${COLLEGE_NAME} students.` },
      { property: "og:title", content: `${COLLEGE_SHORT} Placement Intelligence Hub` },
      { property: "og:description", content: "Your strategic edge for campus placements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Filter = "All" | CompanyType;

function Index() {
  const navigate = useNavigate();
  const { selectCompany } = useCompany();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const { data: companies = [], isLoading, isError, refetch } = useCompanies();

  useEffect(() => { const t = setTimeout(() => setDebounced(query), 200); return () => clearTimeout(t); }, [query]);

  const searched = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return q ? companies.filter((c) => `${c.name} ${c.shortName} ${c.headquarters} ${c.category}`.toLowerCase().includes(q)) : companies;
  }, [companies, debounced]);
  const counts = useMemo(() => {
    const m: Record<string, number> = { All: searched.length };
    COMPANY_TYPES.forEach((t) => (m[t] = searched.filter((c) => c.companyType === t).length));
    return m;
  }, [searched]);
  const visible = filter === "All" ? searched : searched.filter((c) => c.companyType === filter);

  const onSelect = useCallback((c: CompanySummary) => {
    selectCompany({ companyId: c.companyId, companyName: c.shortName, logoUrl: c.logoUrl });
    navigate({ to: "/company/intelligence" });
  }, [navigate, selectCompany]);

  const reset = () => { setQuery(""); setDebounced(""); setFilter("All"); };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
            {COLLEGE_SHORT} · INTELLIGENCE PLATFORM
          </span>
          <ThemeToggle />
          </div>
          <h1 className="mt-4 max-w-4xl font-heading text-2xl font-semibold leading-tight text-foreground sm:text-4xl">
            {COLLEGE_NAME} Companies Research & Placement Analytics Portal
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">Your strategic edge for campus placements</p>
          <div className="relative mt-6 max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, locations, categories…"
              aria-label="Search companies"
              className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-10 text-sm outline-none focus:border-dream focus:ring-2 focus:ring-ring/20"
            />
            {query && (
              <button aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {(["All", ...COMPANY_TYPES] as Filter[]).map((f) => {
            const active = filter === f;
            const style = f === "All" ? { active: "bg-primary text-primary-foreground border-primary", dot: "bg-muted-foreground" } : TYPE_STYLES[f];
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${active ? style.active : "border-border bg-card text-foreground hover:bg-muted"}`}>
                {!active && <span className={`h-2 w-2 rounded-full ${style.dot}`} />}
                {f}
                <span className={`rounded-full px-1.5 text-xs ${active ? "bg-background/20" : "bg-muted text-muted-foreground"}`}>{counts[f]}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="font-heading font-semibold">No companies match your search</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or category.</p>
            <Button variant="outline" className="mt-4" onClick={reset}>Reset filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visible.map((c) => <CompanyCard key={c.companyId} company={c} onSelect={onSelect} />)}
          </div>
        )}
      </main>
    </div>
  );
}
