import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export const STORAGE_KEY = "selected-company";
export interface SelectedCompany { companyId: number; companyName: string; logoUrl: string }

interface Ctx {
  selected: SelectedCompany | null;
  ready: boolean;
  selectCompany: (c: SelectedCompany) => void;
}
const CompanyContext = createContext<Ctx | null>(null);

export function readStoredCompany(): SelectedCompany | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SelectedCompany;
    return getCompanyById(Number(parsed.companyId)) ? parsed : null;
  } catch {
    return null;
  }
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<SelectedCompany | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSelected(readStoredCompany());
    setReady(true);
  }, []);

  const selectCompany = useCallback((c: SelectedCompany) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
    setSelected(c);
  }, []);

  return <CompanyContext.Provider value={{ selected, ready, selectCompany }}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
