import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://emzlgvjeekwpxugzqcpw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtemxndmplZWtweHVndXpxY3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MzY0MDYsImV4cCI6MjA5NTQxMjQwNn0.z_IS-9p_1ue3bRCF3lrG3-XlejWfI6USYberfJyDLeI';

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

