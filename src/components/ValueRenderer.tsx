import { ExternalLink, PlayCircle, Star } from "lucide-react";
import { isNullish, splitItems } from "@/lib/companyData";

export function NotAvailable() {
  return <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Not Available</span>;
}

export function renderValue(raw: string | undefined, key = "") {
  const v = (raw ?? "").trim();
  if (isNullish(v)) return <NotAvailable />;
  if (/^https?:\/\//i.test(v)) {
    const video = /youtube|youtu\.be|vimeo/i.test(v) || key.includes("video");
    const Icon = video ? PlayCircle : ExternalLink;
    return (
      <a href={v} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all text-dream hover:underline">
        <Icon className="h-4 w-4 shrink-0" />{v.replace(/^https?:\/\/(www\.)?/, "")}
      </a>
    );
  }
  if (/^@?[\w.+-]+@[\w-]+\.[\w.]+$/.test(v) && v.includes("@") && !v.startsWith("@"))
    return <a href={`mailto:${v}`} className="text-dream hover:underline">{v}</a>;
  const rating = v.match(/^(\d(\.\d)?)\s*\/\s*5$/);
  if (rating) {
    const n = parseFloat(rating[1]);
    return (
      <span className="inline-flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < Math.round(n) ? "fill-regular text-regular" : "text-border"}`} />
        ))}
        <span className="ml-1 font-medium">{v}</span>
      </span>
    );
  }
  if (v.length > 160) return <p className="leading-relaxed">{v}</p>;
  if (v.includes(";")) {
    const items = splitItems(v);
    if (items.length > 1)
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => <span key={i} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs text-foreground">{it}</span>)}
        </div>
      );
  }
  if (v.includes(",") && v.length < 120 && v.split(",").every((p) => p.trim().split(" ").length <= 4) && v.split(",").length > 2)
    return (
      <div className="flex flex-wrap gap-1.5">
        {v.split(",").map((it, i) => <span key={i} className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs">{it.trim()}</span>)}
      </div>
    );
  return <span>{v}</span>;
}
