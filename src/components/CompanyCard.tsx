import { memo } from "react";
import { ArrowRight, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import { isNullish, type CompanySummary } from "@/lib/companyData";
import { TYPE_STYLES } from "./typeStyles";

const Val = ({ v }: { v: string }) =>
  isNullish(v) ? <span className="italic text-muted-foreground">not publicly available</span> : <span>{v}</span>;

export const CompanyCard = memo(function CompanyCard({ company, onSelect }: { company: CompanySummary; onSelect: (c: CompanySummary) => void }) {
  const down = company.yoyGrowthRate.trim().startsWith("-");
  const Trend = down ? TrendingDown : TrendingUp;
  return (
    <button
      type="button"
      onClick={() => onSelect(company)}
      aria-label={`Open ${company.name}`}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-dream/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <CompanyLogo name={company.shortName} logoUrl={company.logoUrl} websiteUrl={company.websiteUrl} className="h-12 w-12" />
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[company.companyType].soft}`}>{company.companyType}</span>
      </div>
      <div>
        <h3 className="font-heading text-base font-semibold leading-tight text-foreground">{company.name}</h3>
        <p className="text-sm text-muted-foreground">{company.shortName}</p>
      </div>
      <div className="space-y-1.5 text-sm text-foreground/80">
        <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><Val v={company.headquarters} /></div>
        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><Val v={company.employeeSize} /></div>
        <div className={`flex items-center gap-2 ${down ? "text-destructive" : "text-standard"}`}>
          <Trend className="h-4 w-4" /><Val v={company.yoyGrowthRate} /><span className="text-xs text-muted-foreground">YoY</span>
        </div>
      </div>
      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-dream" />
    </button>
  );
});
