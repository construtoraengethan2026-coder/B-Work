import { createClient } from "@supabase/supabase-js";

// These are public values (anon/publishable key) — safe to expose client-side.
// RLS policies enforce security; the service_role key is never used in the frontend.
const SUPABASE_URL = "https://roohtpdctpxdizfelbik.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_k3eholXVCIvyhgo_u5bYVA_mDlFS55p";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});