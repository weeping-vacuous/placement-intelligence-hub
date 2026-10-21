import { useState } from "react";
import { cn } from "@/lib/utils";

function domainOf(url?: string) {
  try { return url ? new URL(url).hostname.replace(/^www\./, "") : ""; } catch { return ""; }
}

export function CompanyLogo({ name, logoUrl, websiteUrl, className }: { name: string; logoUrl?: string; websiteUrl?: string; className?: string }) {
  const key = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY as string | undefined;
  const domain = domainOf(websiteUrl);
  const sources = [key && domain ? `https://img.logo.dev/${domain}?token=${key}&size=128` : "", logoUrl ?? ""].filter(Boolean);
  const [idx, setIdx] = useState(0);
  const base = cn("flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card", className ?? "h-10 w-10");
  if (idx >= sources.length) {
    return <div className={cn(base, "font-heading font-semibold text-dream")}>{name.charAt(0).toUpperCase()}</div>;
  }
  return (
    <div className={base}>
      <img src={sources[idx]} alt={`${name} logo`} className="h-full w-full object-contain p-1.5" onError={() => setIdx((i) => i + 1)} loading="lazy" />
    </div>
  );
}
