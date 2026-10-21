// Pure normalizers. Inputs are raw short_json / full_json / skill_levels shapes,
// so Phase 2 can pipe database rows in unchanged.
import { SKILL_TOPICS } from "@/data/skillTopics";
import { SEED_COMPANIES } from "@/data/seedCompanies";

export const COLLEGE_NAME = "JSS Academy of Technical Education and Technology";
export const COLLEGE_SHORT = "JSSATEN";

export type CompanyType = "Super Dream" | "Dream" | "Standard" | "Regular";
export const COMPANY_TYPES: CompanyType[] = ["Super Dream", "Dream", "Standard", "Regular"];

export interface CompanySummary {
  companyId: number;
  name: string;
  shortName: string;
  logoUrl: string;
  category: string;
  companyType: CompanyType;
  incorporationYear: string;
  employeeSize: string;
  headquarters: string;
  operatingCountries: string;
  officeLocations: string;
  yoyGrowthRate: string;
  websiteUrl: string;
}

export type CompanyProfile = Record<string, string> & {
  name: string;
  short_name: string;
  website_url: string;
  linkedin_url: string;
  logo_url: string;
  category: string;
};

export type Difficulty = "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
export type Bloom = "CU" | "AP" | "AS" | "EV" | "CR";
export type Criticality = "Critical" | "Important" | "Baseline";

export interface DashboardSkill {
  id: number;
  name: string;
  score: number;
  proficiency: string;
  difficulty: Difficulty;
  bloom: Bloom;
  criticality: Criticality;
  topics: { level: number; topic: string }[];
}

// Never surfaced anywhere in the portal.
const BLOCKED_KEYS = /ctc|stipend|selection_ratio/i;

export const asString = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(asString).join("; ");
  if (typeof v === "object") return JSON.stringify(v);
  return String(v).trim();
};
export const asRecord = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export const isNullish = (v: unknown) =>
  ["", "na", "n/a", "none", "-", "null", "undefined"].includes(asString(v).toLowerCase());

export const splitItems = (v: unknown): string[] =>
  asString(v)
    .split(/\n|;|•|\u2022|\.\s+(?=[A-Z])/)
    .map((s) => s.replace(/^[-*\s]+/, "").replace(/\.$/, "").trim())
    .filter(Boolean);

export const titleCaseFromCode = (code: string) =>
  code.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAnd\b/g, "&");

export const scoreToDifficulty = (s: number): Difficulty =>
  s >= 8 ? "EXPERT" : s >= 6 ? "ADVANCED" : s >= 4 ? "PRO" : "BEGINNER";
export const proficiencyToBloom = (s: number): Bloom =>
  s <= 2 ? "CU" : s <= 4 ? "AP" : s <= 6 ? "AS" : s <= 8 ? "EV" : "CR";
export const scoreToCriticality = (s: number): Criticality =>
  s >= 7 ? "Critical" : s >= 5 ? "Important" : "Baseline";

const toCompanyType = (v: unknown): CompanyType => {
  const s = asString(v).toLowerCase();
  return COMPANY_TYPES.find((t) => t.toLowerCase() === s) ?? "Regular";
};

export function normalizeCompanySummary(short_json: unknown, companyId = 0): CompanySummary {
  const r = asRecord(short_json);
  return {
    companyId,
    name: asString(r.name),
    shortName: asString(r.short_name) || asString(r.name),
    logoUrl: asString(r.logo_url),
    category: asString(r.category),
    companyType: toCompanyType(r.company_type),
    incorporationYear: asString(r.incorporation_year),
    employeeSize: asString(r.employee_size),
    headquarters: asString(r.headquarters_address),
    operatingCountries: asString(r.operating_countries),
    officeLocations: asString(r.office_locations),
    yoyGrowthRate: asString(r.yoy_growth_rate),
    websiteUrl: asString(r.website_url),
  };
}

export function normalizeCompanyProfile(full_json: unknown, short_json: unknown): CompanyProfile {
  const merged = { ...asRecord(short_json), ...asRecord(full_json) };
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (BLOCKED_KEYS.test(k)) continue;
    out[k] = asString(v);
  }
  for (const k of ["name", "short_name", "website_url", "linkedin_url", "logo_url", "category"]) out[k] ??= "";
  return out as CompanyProfile;
}

export function normalizeDashboardSkills(skillLevels: unknown[]): DashboardSkill[] {
  return (skillLevels ?? [])
    .map((raw) => {
      const r = asRecord(raw);
      const id = Number(r.skill_set_id) || 0;
      const score = Math.max(0, Math.min(10, Number(r.required_level) || 0));
      const topics = (SKILL_TOPICS[id] ?? []).map((topic, i) => ({ level: i + 1, topic }));
      return {
        id,
        name: asString(r.skill_set_name),
        score,
        proficiency: asString(r.required_proficiency),
        difficulty: scoreToDifficulty(score),
        bloom: proficiencyToBloom(score),
        criticality: scoreToCriticality(score),
        topics,
      };
    })
    .sort((a, b) => b.score - a.score);
}

// Data source (Phase 1: seed). Swap these to database calls in Phase 2.
export const getAllCompanySummaries = () =>
  SEED_COMPANIES.map((c) => normalizeCompanySummary(c.short_json, c.company_id));
export const getCompanyById = (id: number) => SEED_COMPANIES.find((c) => c.company_id === id);
