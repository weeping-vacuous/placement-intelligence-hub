// Phase 2 data-access layer: React Query hooks reading from Supabase.
// Read-only. Company data comes ONLY from public.company_json (short_json / full_json);
// skills come from the 4 skill tables. Rows are piped through the existing
// normalizers in src/lib/companyData.ts untouched.
import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabaseClient";
import {
  asString,
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  type CompanyProfile,
  type CompanySummary,
  type DashboardSkill,
  type SkillTopicsMap,
} from "@/lib/companyData";

export interface CompanyDetail {
  summary: CompanySummary;
  profile: CompanyProfile;
}

// Company cards / listing → SELECT company_id, short_json FROM company_json
export function useCompanies() {
  return useQuery<CompanySummary[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await getSupabase().from("company_json").select("company_id, short_json");
      if (error) throw error;
      return (data ?? []).map((r) => normalizeCompanySummary(r.short_json, r.company_id));
    },
  });
}

// Single company detail → SELECT company_id, short_json, full_json FROM company_json WHERE company_id = :id
export function useCompanyProfile(id: number | null) {
  return useQuery<CompanyDetail>({
    enabled: id !== null,
    queryKey: ["company", id],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("company_json")
        .select("company_id, short_json, full_json")
        .eq("company_id", id!)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error(`Company ${id} not found`);
      return {
        summary: normalizeCompanySummary(data.short_json, data.company_id),
        profile: normalizeCompanyProfile(data.full_json, data.short_json),
      };
    },
  });
}

// Skill cards + 10-level roadmaps from the 4 skill tables, assembled into the
// same DashboardSkill shape the seed path produced.
export function useCompanySkills(id: number | null) {
  return useQuery<DashboardSkill[]>({
    enabled: id !== null,
    queryKey: ["company-skills", id],
    queryFn: async () => {
      const sb = getSupabase();
      const [levels, masters, profs, topics] = await Promise.all([
        sb.from("company_skill_levels").select("company_id, skill_set_id, required_level, required_proficiency_level_id").eq("company_id", id!),
        sb.from("skill_set_master").select("skill_set_id, skill_set_name, short_name"),
        sb.from("proficiency_levels").select("proficiency_level_id, proficiency_name, proficiency_code"),
        sb.from("skill_set_topics").select("skill_set_id, level_number, topics"),
      ]);
      for (const r of [levels, masters, profs, topics]) if (r.error) throw r.error;

      const masterById = new Map((masters.data ?? []).map((m) => [m.skill_set_id as number, m]));
      const profById = new Map((profs.data ?? []).map((p) => [p.proficiency_level_id as number, p]));
      const topicsById: SkillTopicsMap = new Map();
      for (const t of topics.data ?? []) {
        const arr = topicsById.get(t.skill_set_id) ?? [];
        arr.push({ level: Number(t.level_number) || 0, topic: asString(t.topics) });
        topicsById.set(t.skill_set_id, arr);
      }
      for (const arr of topicsById.values()) arr.sort((a, b) => a.level - b.level);

      const rows = (levels.data ?? []).map((l) => ({
        skill_set_id: l.skill_set_id,
        skill_set_name: asString(masterById.get(l.skill_set_id)?.skill_set_name) || `Skill ${l.skill_set_id}`,
        required_level: l.required_level,
        required_proficiency: asString(profById.get(l.required_proficiency_level_id)?.proficiency_name),
      }));
      return normalizeDashboardSkills(rows, topicsById);
    },
  });
}
