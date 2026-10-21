import type { CompanyType } from "@/lib/companyData";

export const TYPE_STYLES: Record<CompanyType, { soft: string; active: string; dot: string }> = {
  "Super Dream": { soft: "bg-super-dream/10 text-super-dream", active: "bg-super-dream text-primary-foreground border-super-dream", dot: "bg-super-dream" },
  Dream: { soft: "bg-dream/10 text-dream", active: "bg-dream text-primary-foreground border-dream", dot: "bg-dream" },
  Standard: { soft: "bg-standard/10 text-standard", active: "bg-standard text-primary-foreground border-standard", dot: "bg-standard" },
  Regular: { soft: "bg-regular/10 text-regular", active: "bg-regular text-primary-foreground border-regular", dot: "bg-regular" },
};
