import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://qyadjaahgiqkohvucfmg.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});
