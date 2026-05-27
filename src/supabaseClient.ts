import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtkzyqzxfwslgbovidfx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Uw4DGNmgyqI3pEF-pAfWRA_vcawl_--';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logComponentAction = async (
  studentName: string,
  studentEmail: string,
  actionType: string,
  details: any
) => {
  try {
    const { error } = await supabase
      .from('student_actions_log')
      .insert([
        {
          student_name: studentName,
          student_email: studentEmail,
          action_type: actionType,
          action_details: details,
          created_at: new Date().toISOString()
        }
      ]);
    if (error) {
      console.warn('Erro ao salvar log de ação no Supabase:', error.message);
    }
  } catch (err: any) {
    console.warn('Falha ao conectar com o Supabase para registrar ação:', err.message);
  }
};

