import { describe, expect, it } from "vitest";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { normalizeCompanyProfile, normalizeDashboardSkills, proficiencyToBloom, scoreToCriticality } from "@/lib/companyData";

describe("company data", () => {
  const c = SEED_COMPANIES[0];
  it("builds 22 sections", () => {
    expect(buildIntelligenceSections(normalizeCompanyProfile(c.full_json, c.short_json))).toHaveLength(22);
  });
  it("normalizes 12 skills with 10-level roadmaps, sorted desc", () => {
    const s = normalizeDashboardSkills(c.skill_levels);
    expect(s).toHaveLength(12);
    expect(s[0].score).toBe(8);
    s.forEach((k) => expect(k.topics).toHaveLength(10));
  });
  it("maps bloom and criticality", () => {
    expect(proficiencyToBloom(2)).toBe("CU");
    expect(proficiencyToBloom(8)).toBe("EV");
    expect(scoreToCriticality(7)).toBe("Critical");
    expect(scoreToCriticality(5)).toBe("Important");
    expect(scoreToCriticality(4)).toBe("Baseline");
  });
});
