import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtkzyqzxfwslgbovidfx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Uw4DGNmgyqI3pEF-pAfWRA_vcawl_--';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

