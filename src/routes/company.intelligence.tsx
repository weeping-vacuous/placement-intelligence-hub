import { createFileRoute } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "@/components/CompanyLogo";
import { renderValue } from "@/components/ValueRenderer";
import { useCompany } from "@/context/CompanyContext";
import { buildIntelligenceSections, type IntelSection } from "@/data/intelligenceData";
import { COLLEGE_SHORT, getCompanyById, isNullish, normalizeCompanyProfile } from "@/lib/companyData";

export const Route = createFileRoute("/company/intelligence")({
  head: () => ({
    meta: [
      { title: `Company Intelligence · ${COLLEGE_SHORT} Placement Hub` },
      { name: "description", content: "22-section research profile of a recruiting company." },
      { property: "og:title", content: `Company Intelligence · ${COLLEGE_SHORT}` },
      { property: "og:description", content: "Deep company research for campus placement preparation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CompanyIntelligence,
});

const SectionCard = memo(function SectionCard({ section, index }: { section: IntelSection; index: number }) {
  const filled = section.fields.filter((f) => !isNullish(f.value)).length;
  return (
    <section id={`sec-${index}`} data-idx={index} className="scroll-mt-32 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-nav-active-bg text-nav-active"><section.icon className="h-4 w-4" /></span>
        <h2 className="flex-1 font-heading text-base font-semibold">{section.title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{filled}/{section.fields.length}</span>
      </div>
      <dl className="divide-y divide-border">
        {section.fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="text-sm font-medium text-muted-foreground sm:w-1/3">{f.label}</dt>
            <dd className="text-sm text-foreground sm:w-2/3">{renderValue(f.value, f.key)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
});

function CompanyIntelligence() {
  const { selected } = useCompany();
  const company = selected ? getCompanyById(selected.companyId) : undefined;
  const profile = useMemo(() => (company ? normalizeCompanyProfile(company.full_json, company.short_json) : undefined), [company]);
  const sections = useMemo(() => buildIntelligenceSections(profile), [profile]);
  const [active, setActive] = useState(0);
  const isScrollingRef = useRef(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(Number((vis[0].target as HTMLElement).dataset["idx"]));
      },
      { rootMargin: "-130px 0px -60% 0px" },
    );
    document.querySelectorAll("[data-idx]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const scrollToSection = useCallback((idx: number) => {
    isScrollingRef.current = true;
    setActive(idx);
    document.getElementById(`sec-${idx}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => { isScrollingRef.current = false; }, 800);
  }, []);

  if (!company || !profile) return null;

  return (
    <div>
      <div className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <CompanyLogo name={profile.short_name} logoUrl={profile.logo_url} websiteUrl={profile.website_url} />
            <div className="min-w-0">
              <h1 className="truncate font-heading text-lg font-semibold">{profile.name}</h1>
              <span className="rounded-full bg-dream/10 px-2 py-0.5 text-xs font-medium text-dream">{profile.category || "Industry"}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {!isNullish(profile.website_url) && (
              <Button asChild variant="outline" size="sm"><a href={profile.website_url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /><span className="hidden sm:inline">Website</span></a></Button>
            )}
            {!isNullish(profile.linkedin_url) && (
              <Button asChild variant="outline" size="sm"><a href={profile.linkedin_url} target="_blank" rel="noreferrer"><Linkedin className="h-4 w-4" /><span className="hidden sm:inline">LinkedIn</span></a></Button>
            )}
          </div>
        </div>
        <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2" role="tablist">
          {sections.map((s, i) => (
            <button key={s.id} ref={(el) => { tabRefs.current[i] = el; }} role="tab" aria-selected={active === i} onClick={() => scrollToSection(i)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${active === i ? "bg-nav-active-bg text-nav-active" : "text-muted-foreground hover:bg-muted"}`}>
              {s.title}
            </button>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6">
        {sections.map((s, i) => <SectionCard key={s.id} section={s} index={i} />)}
      </div>
    </div>
  );
}
