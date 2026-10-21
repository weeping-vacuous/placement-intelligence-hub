// Browser Supabase client for the public, read-only portal.
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env (see .env.example).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;
  if (!url || !key) {
    const msg =
      "Supabase is not configured: paste VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY into .env (see .env.example), then restart the dev server.";
    console.error(msg);
    throw new Error(msg);
  }
  client = createClient(url, key);
  return client;
}
