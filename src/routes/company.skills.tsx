import { createFileRoute } from "@tanstack/react-router";
import { memo, useMemo, useState } from "react";
import { ChevronDown, Lock, CheckCircle2, Circle } from "lucide-react";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/context/CompanyContext";
import { useCompanyProfile, useCompanySkills } from "@/lib/companyApi";
import { COLLEGE_SHORT, type Bloom, type Criticality, type DashboardSkill } from "@/lib/companyData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/company/skills")({
  head: () => ({
    meta: [
      { title: `Skill Intelligence · ${COLLEGE_SHORT} Placement Hub` },
      { name: "description", content: "Required skills, Bloom levels and 10-level learning roadmaps for a recruiting company." },
      { property: "og:title", content: `Skill Intelligence · ${COLLEGE_SHORT}` },
      { property: "og:description", content: "Know exactly which skills to build, and how deep." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SkillIntelligence,
});

const BLOOM: Record<Bloom, { label: string; range: string; text: string; bg: string; bar: string }> = {
  CU: { label: "Comprehend & Understand", range: "1–2", text: "text-bloom-cu", bg: "bg-bloom-cu/10", bar: "bg-bloom-cu" },
  AP: { label: "Apply", range: "3–4", text: "text-bloom-ap", bg: "bg-bloom-ap/10", bar: "bg-bloom-ap" },
  AS: { label: "Analyse & Synthesize", range: "5–6", text: "text-bloom-as", bg: "bg-bloom-as/10", bar: "bg-bloom-as" },
  EV: { label: "Evaluate", range: "7–8", text: "text-bloom-ev", bg: "bg-bloom-ev/10", bar: "bg-bloom-ev" },
  CR: { label: "Create", range: "9–10", text: "text-bloom-cr", bg: "bg-bloom-cr/10", bar: "bg-bloom-cr" },
};
const CRIT: Record<Criticality, { desc: string; cls: string }> = {
  Critical: { desc: "Score 7+ — must be strong", cls: "text-expert" },
  Important: { desc: "Score 5–6 — expected", cls: "text-advanced" },
  Baseline: { desc: "Below 5 — good to have", cls: "text-beginner" },
};

const SkillCard = memo(function SkillCard({ skill }: { skill: DashboardSkill }) {
  const [open, setOpen] = useState(false);
  const b = BLOOM[skill.bloom];
  return (
    <div className="rounded-xl border border-border bg-card">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-heading font-semibold">{skill.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-semibold ${b.bg} ${b.text}`}>{skill.bloom}</span>
              <span className={`font-medium ${CRIT[skill.criticality].cls}`}>{skill.criticality}</span>
              <span className="text-muted-foreground">· {skill.proficiency}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-semibold">{skill.score}<span className="text-sm text-muted-foreground">/10</span></span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${skill.score * 10}%` }} />
        </div>
      </button>
      {open && (
        <ol className="border-t border-border px-4 py-3">
          {skill.topics.map((t) => {
            const locked = t.level > skill.score;
            return (
              <li key={t.level} className={`flex items-center gap-3 py-1.5 text-sm ${locked ? "text-muted-foreground" : ""}`}>
                <span className="w-6 shrink-0 text-xs font-semibold text-muted-foreground">L{t.level}</span>
                {locked ? <Lock className="h-4 w-4 shrink-0" /> : t.level === skill.score ? <CheckCircle2 className={`h-4 w-4 shrink-0 ${b.text}`} /> : <Circle className={`h-4 w-4 shrink-0 ${b.text}`} />}
                <span className="flex-1">{t.topic}</span>
                {locked && <span className="shrink-0 text-xs italic">Beyond scope</span>}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
});

function SkillIntelligence() {
  const { selected } = useCompany();
  const companyId = selected?.companyId ?? null;
  const profileQuery = useCompanyProfile(companyId);
  const skillsQuery = useCompanySkills(companyId);

  if (!selected) return null;
  if (profileQuery.isLoading || skillsQuery.isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-16 rounded-xl" />
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }
  if (profileQuery.isError || skillsQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-heading font-semibold">Couldn’t load skill intelligence</p>
          <p className="mt-1 text-sm text-muted-foreground">Check your Supabase configuration in .env, then try again.</p>
          <Button variant="outline" className="mt-4" onClick={() => { profileQuery.refetch(); skillsQuery.refetch(); }}>Retry</Button>
        </div>
      </div>
    );
  }
  const summary = profileQuery.data.summary;
  const skills = skillsQuery.data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <CompanyLogo name={summary.shortName} logoUrl={summary.logoUrl} websiteUrl={summary.websiteUrl} className="h-12 w-12" />
        <div>
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">{summary.shortName} Skill Intelligence</h1>
          <p className="text-sm text-muted-foreground">{skills.length} skills required · sorted by required level</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {(Object.keys(BLOOM) as Bloom[]).map((k) => (
          <div key={k} className={`rounded-lg p-3 ${BLOOM[k].bg}`}>
            <div className={`font-heading text-sm font-bold ${BLOOM[k].text}`}>{k} <span className="font-normal text-muted-foreground">· {BLOOM[k].range}</span></div>
            <div className="text-xs text-foreground/80">{BLOOM[k].label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {(Object.keys(CRIT) as Criticality[]).map((k) => (
          <div key={k} className="rounded-lg border border-border bg-card p-3">
            <div className={`font-heading text-sm font-semibold ${CRIT[k].cls}`}>{k}</div>
            <div className="text-xs text-muted-foreground">{CRIT[k].desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {skills.map((s) => <SkillCard key={s.id} skill={s} />)}
      </div>
    </div>
  );
}
