import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cdhgmrgndiwdnsbgkikg.supabase.co";
const SUPABASE_KEY = "sb_publishable_-sgJduPROE-071E-zn6_UA_hrjeIKDj";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
