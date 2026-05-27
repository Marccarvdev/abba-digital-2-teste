import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, User, BookOpen, Key, History, Plus, FileText, 
  CheckCircle, LogOut, Download, ExternalLink, Calendar, 
  ChevronRight, Award, Trash2, ShieldAlert, Menu, X, Copy,
  Check, Sparkles, Activity
} from 'lucide-react';
import { User as UserType, TaskItem, StudentSubmission, AccessCode } from '../types';
import { supabase } from '../supabaseClient';

interface TeacherDashboardPremiumProps {
  user: UserType;
  onLogout: () => void;
  onLaunchReviewMode: (submission: StudentSubmission) => void;
}

export const TeacherDashboardPremium: React.FC<TeacherDashboardPremiumProps> = ({ 
  user, 
  onLogout, 
  onLaunchReviewMode 
}) => {
  // Navigation / Tabs (inbox = Submissions, accessKeys = Links, logs = actions log, tasks = all tasks, students = list students)
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'accessKeys' | 'logs' | 'tasks' | 'students'>('inbox');
  
  // Mobile drawers toggle states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);

  // Modals visibility states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Followed mentors list simulation
  const [followedMentors, setFollowedMentors] = useState<string[]>([]);

  // Database States
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeCodes, setActiveCodes] = useState<AccessCode[]>([]);
  const [actionLogs, setActionLogs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection & Details
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'pending' | 'evaluated' | 'all'>('all');

  // Create Link form states
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [linkDuration, setLinkDuration] = useState('1h');
  const [generatedLinkInfo, setGeneratedLinkInfo] = useState<{ code: string; url: string } | null>(null);
  const [isCreatingLink, setIsCreatingLink] = useState(false);

  // Create Task form states
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-06-30');
  const [taskWords, setTaskWords] = useState<string>('DADO, BOLA, SOL');
  const [taskLang, setTaskLang] = useState<'pt' | 'en' | 'de'>('pt');
  const [taskPriority, setTaskPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Copied states for dynamic feedback
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCodeText, setCopiedCodeText] = useState<string | null>(null);

  // Sincronizar dados do Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Sincronizar Submissões
      const { data: dbSubs, error: subsErr } = await supabase
        .from('student_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (dbSubs && !subsErr) {
        const mappedSubs: StudentSubmission[] = dbSubs.map((s: any) => ({
          id: s.id.toString(),
          studentName: s.student_name,
          studentEmail: s.student_email,
          taskTitle: s.task_title,
          submittedAt: s.submitted_at,
          spelledWords: typeof s.spelled_words === 'string'
            ? JSON.parse(s.spelled_words)
            : s.spelled_words || [],
          taskFiles: typeof s.task_files === 'string'
            ? JSON.parse(s.task_files)
            : s.task_files || []
        }));
        setSubmissions(mappedSubs);
        if (mappedSubs.length > 0 && !selectedSubmissionId) {
          setSelectedSubmissionId(mappedSubs[0].id);
        }
      }

      // 2. Sincronizar Tarefas
      const { data: dbTasks, error: tasksErr } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (dbTasks && !tasksErr) {
        const mappedTasks: TaskItem[] = dbTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          dueDate: t.due_date || '',
          status: t.status || 'active',
          targetWords: typeof t.target_words === 'string' 
            ? JSON.parse(t.target_words) 
            : t.target_words || [],
          priority: t.priority || 'Alta'
        }));
        setTasks(mappedTasks);
      }

      // 3. Sincronizar Links / Códigos ativos
      const { data: dbLinks, error: linksErr } = await supabase
        .from('teacher_generated_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbLinks && !linksErr) {
        const mappedCodes: AccessCode[] = dbLinks.map((l: any) => ({
          id: l.link_id,
          code: l.link_id,
          studentName: l.student_name,
          expiresAt: Date.now() + 3600000, 
          durationLabel: '1 Hora',
          status: 'active'
        }));
        setActiveCodes(mappedCodes);
      }

      // 4. Sincronizar Logs de Ações em tempo real
      const { data: dbLogs, error: logsErr } = await supabase
        .from('student_actions_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (dbLogs && !logsErr) {
        setActionLogs(dbLogs);
      }

      // 5. Sincronizar Alunos da tabela 'students' ou fallback para 'student_logins'
      try {
        const { data: dbStudents, error: studentsErr } = await supabase
          .from('students')
          .select('*');

        if (dbStudents && !studentsErr) {
          if (dbStudents.length === 0) {
            // Auto-seed
            const formattedInitial = [
              { id: 'st-1', name: "Ana Beatriz Silva", class: "Turma A - 3º Ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA36Ly4xeWawwKgX-g0LtkXrGT5DTjmm-XeB9Qk6DnSHU-NH54f_hVpqhRSjZs2501yox04bFvBm3qcg4yJditWLeZ66sEhf1BM2qzrzTrRAJ1IuAIpRYb1T08Th4stWnf7V5GK2BSYKgk3P5OvbDzMAAbIACMxK2mI8bpZrbH76YSaaBRPkN9xMZfQmhcm1FtZ7ThFMF6DEYGrtqYqtjPuw6W6iljH5xz1skvI1FXm8WrX2SwaVwgX4vD0qOebo0Hq7Z48evtz0z5Z", progress: 85, matricula: '202300142', gender: 'F' },
              { id: 'st-2', name: "Carlos andré", class: "Turma A - 3º Ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqkV-9yCRTIEx8yOwalSNgnJoB7RDDIC5cjysNDwq3qLDkFhWPSGMkg_upCUk2izlt4E-kqkdhSEbFbCNkiuxBU8MtAExoSWUkjzw8FlH2wZ4VSNrCVOHHweC7l6JL19tJNL5ff3Uwdt1UJsPMMHs3POE0Ile5WBXcNOYSC72xdbVYwTSuZTAHmCJ3b69Zs-_lW1c2qq-pKfAeqP8CFv0SUDEntbF7bUmmBtE3o97YG2yRkd-Cx5gF0NYXf4nZkSCMIhiOb68pAWOS", progress: 60, matricula: '202300891', gender: 'M' },
              { id: 'st-3', name: "Gabriela Fontes", class: "Turma B - 3º Ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpRBuZNFWOpOoV_maEY_xg9EoZOrICbKrCsPNfW24bg3aC9ZYU5ORJA4sBL1TO4HTT5oDcgnyA1veDLqsnMEOdwTXgXNf4GW-WF4roWaC_e7MoJYH3ZFFhGCo0Rvep8UZilU1vS3GOROSKcJzB6QxvXzS0obKYNGiYDyGHQ1PtXFoK_QqYXJOzedbSAGVwD7Fx9FpJdD1RAKvVKZPsuDpQMnH1k-Cb4Xr7WM0BQny82cnTZp5vlve3OVfOmb0wlHRa5S9foFIRVSQh", progress: 95, matricula: '202301225', gender: 'F' },
              { id: 'st-4', name: "João Vitor Rezende", class: "Turma A - 3º Ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBr8bD9ZzGhFEt7oLruZohpN8SJELwbHxG11_tSiiJu5T4bVdwWf4yrCVWYCbFHtMQ5UVaL5ULioUnlkyWiGw3gzgbiqySzjtjm1PDHPxur524EFEKchY3whP1deXqnANASENlzs-e_E99vbTm7a6mGhPhOtXIUHKHuIBCkfKVQAYGctKycj5IaP-kSNtnulfLt3TthD-cEDbx4tQTyw2gvFjttyvK2YOljZ7IWw0hAACZGrBf39sgtgvUZ8SoVelySNvCJKnTvOgMw", progress: 40, matricula: '202300554', gender: 'M' },
              { id: 'st-5', name: "Lara Vasconcelos", class: "Turma C - 3º Ano", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZCDyQjcZT49YUlxQl2LjrBSU4AGNV8wpgZUzz6x_eW-n-23oY3rh-5bbHCjnp_OwnfeCWJxah_8xD5m3I-318UQowMH1epfQmhp5oRAd4zgJx7G6h7SkH0rFOUY-FekT_U_mze4HPnrZC4cAg3azgr2j1sKmTnrF4qf7s007A7carK9Np5c3X0AwBk7ONLeX2LDFjfaYz2bGYeVKRfVrE1hvKt59L8a2oq7-7Fx9u0iV8lCM_Q3Vd3JsHYZsYTlrRXv_dmb4fTi4D", progress: 70, matricula: '202301102', gender: 'F' },
              { id: 'st-6', name: "Gabriel Souza", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=150&h=150", progress: 50, matricula: '202406', gender: 'M' },
              { id: 'st-7', name: "Helena Rocha", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150&h=150", progress: 90, matricula: '202407', gender: 'F' },
              { id: 'st-8', name: "Igor Mendes", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150", progress: 30, matricula: '202408', gender: 'M' },
              { id: 'st-9', name: "Julia Paiva", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?auto=format&fit=crop&q=80&w=150&h=150", progress: 80, matricula: '202409', gender: 'F' },
              { id: 'st-10', name: "Kevin Costa", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=150&h=150", progress: 65, matricula: '202410', gender: 'M' },
              { id: 'st-11', name: "Lucas Oliveira", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150&h=150", progress: 75, matricula: '202411', gender: 'M' },
              { id: 'st-12', name: "Mariana Costa", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150", progress: 88, matricula: '202412', gender: 'F' },
              { id: 'st-13', name: "Nataniel Cruz", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150", progress: 45, matricula: '202413', gender: 'M' },
              { id: 'st-14', name: "Olivia Martins", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150", progress: 92, matricula: '202414', gender: 'F' },
              { id: 'st-15', name: "Pedro Henrique", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150", progress: 55, matricula: '202415', gender: 'M' }
            ].map(s => ({
              id: s.id,
              name: s.name,
              class: s.class,
              img: s.img,
              progress: s.progress,
              matricula: s.matricula,
              gender: s.gender,
              email: `${s.id}@abba.com`,
              last_access_at: new Date().toISOString(),
              login_method: 'initial'
            }));
            await supabase.from('students').insert(formattedInitial);
            
            const mappedInitial = formattedInitial.map(s => ({
              id: s.id,
              name: s.name,
              class: s.class,
              img: s.img,
              progress: s.progress,
              matricula: s.matricula,
              gender: s.gender,
              email: s.email,
              lastAccessAt: s.last_access_at,
              loginMethod: s.login_method
            }));
            setStudents(mappedInitial);
            if (mappedInitial.length > 0) {
              setSelectedStudentName(mappedInitial[0].name);
              if (!selectedStudentId) setSelectedStudentId(mappedInitial[0].id);
            }
          } else {
            const mapped = dbStudents.map(s => ({
              id: s.id,
              name: s.name,
              class: s.class || 'Turma A - 3º Ano',
              img: s.img || `https://images.unsplash.com/photo-1535713875002?auto=format&fit=crop&q=80&w=150&h=150`,
              progress: s.progress || 0,
              matricula: s.matricula || `2026${Math.floor(1000 + Math.random() * 9000)}`,
              gender: s.gender || 'M',
              email: s.email || 'estudante@abba.com',
              lastAccessAt: s.last_access_at,
              loginMethod: s.login_method
            }));
            setStudents(mapped);
            if (mapped.length > 0) {
              setSelectedStudentName(mapped[0].name);
              if (!selectedStudentId) setSelectedStudentId(mapped[0].id);
            }
          }
        } else {
          // Fallback para logins
          const { data: dbLogins, error: loginsErr } = await supabase
            .from('student_logins')
            .select('student_name, student_email')
            .order('logged_at', { ascending: false });

          if (dbLogins && !loginsErr) {
            const uniqueNames = new Set();
            const studentList: any[] = [];
            dbLogins.forEach((login: any) => {
              if (!uniqueNames.has(login.student_name)) {
                uniqueNames.add(login.student_name);
                studentList.push({
                  id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                  name: login.student_name,
                  class: 'Turma A - 3º Ano',
                  img: `https://images.unsplash.com/photo-1535713875002?auto=format&fit=crop&q=80&w=150&h=150`,
                  progress: 0,
                  matricula: `2026${Math.floor(1000 + Math.random() * 9000)}`,
                  gender: 'M',
                  email: login.student_email || 'estudante@abba.com',
                  lastAccessAt: new Date().toISOString(),
                  loginMethod: 'login'
                });
              }
            });
            setStudents(studentList);
            if (studentList.length > 0) {
              setSelectedStudentName(studentList[0].name);
              if (!selectedStudentId) setSelectedStudentId(studentList[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao sincronizar estudantes:', err);
      }

    } catch (e) {
      console.error('Erro ao buscar dados do Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Selecionar tarefa padrão ao carregar tarefas
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks]);

  // Função para Gerar Link de Acesso Único
  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentName.trim()) return;

    setIsCreatingLink(true);
    setGeneratedLinkInfo(null);

    try {
      const codeId = `st-${Date.now()}`;
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
      }

      let ms = 3600000; // 1h
      if (linkDuration === '4h') ms = 4 * 3600000;
      else if (linkDuration === '1d') ms = 24 * 3600000;
      else if (linkDuration === '1w') ms = 7 * 24 * 3600000;

      const expiresAt = Date.now() + ms;

      const payload = {
        id: codeId,
        code: code,
        name: selectedStudentName,
        expiresAt: expiresAt,
        durationLabel: linkDuration === '1h' ? '1 Hora' : linkDuration === '4h' ? '4 Horas' : linkDuration === '1d' ? '1 Dia' : '1 Semana',
        createdAt: new Date().toISOString()
      };

      // Registrar código localmente
      const localRegistry = JSON.parse(localStorage.getItem('abba_invite_codes_registry') || '[]');
      localRegistry.push(payload);
      localStorage.setItem('abba_invite_codes_registry', JSON.stringify(localRegistry));

      const magicLink = `${window.location.origin}/?code=ABBA-${payload.code}`;
      
      // Sincronizar com o Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const teacherId = session?.user?.id || 'prof-demo';

      await supabase
        .from('teacher_generated_links')
        .insert([
          {
            link_id: payload.code,
            student_name: payload.name,
            task_id: selectedTaskId || 'task-generica',
            task_title: tasks.find(t => t.id === selectedTaskId)?.title || 'Exercício de Numerais Multilingue',
            link_url: magicLink,
            teacher_id: teacherId,
            created_at: payload.createdAt
          }
        ]);

      setGeneratedLinkInfo({
        code: `ABBA-${payload.code}`,
        url: magicLink
      });

      fetchData(); 

    } catch (err) {
      console.error('Erro ao gerar link de acesso:', err);
    } finally {
      setIsCreatingLink(false);
    }
  };

  // Função para Criar uma Nova Tarefa
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsCreatingTask(true);

    try {
      const generatedId = `task-${Date.now()}`;
      const rawWords = taskWords.split(',').map(w => w.trim().toUpperCase()).filter(Boolean);
      
      const themeColor = taskLang === 'pt' ? '#1e293b' : taskLang === 'en' ? '#3b82f6' : '#ef4444';
      const targetWords = rawWords.map(word => ({
        word,
        language: taskLang,
        color: themeColor
      }));

      const dbPayload = {
        id: generatedId,
        title: taskTitle,
        description: taskDesc,
        due_date: taskDueDate,
        status: 'active',
        target_words: JSON.stringify(targetWords),
        priority: taskPriority,
        assigned_student_ids: JSON.stringify([]),
        start_date: new Date().toISOString().split('T')[0],
        teacher_note: '',
        submissions_count: 0
      };

      const { error } = await supabase
        .from('tasks')
        .insert([dbPayload]);

      if (!error) {
        setTaskTitle('');
        setTaskDesc('');
        setTaskWords('DADO, BOLA, SOL');
        alert(`Tarefa "${dbPayload.title}" criada e salva com sucesso no Supabase! 📝`);
        setIsTaskModalOpen(false);
        fetchData();
      } else {
        console.error('Erro ao salvar no banco:', error);
      }

    } catch (err) {
      console.error('Erro na criação de tarefa:', err);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Excluir link/código gerado
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Deseja realmente apagar este link de acesso ativo?')) return;
    try {
      const { error } = await supabase
        .from('teacher_generated_links')
        .delete()
        .eq('link_id', linkId);
      if (!error) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filtragem e Busca de Submissões
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.taskTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'pending') {
      return matchesSearch && sub.spelledWords.length === 0;
    } else if (filterType === 'evaluated') {
      return matchesSearch && sub.spelledWords.length > 0;
    }
    return matchesSearch;
  });

  const selectedSubmission = submissions.find(s => s.id === selectedSubmissionId);
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Dinamicamente obter dados do estudante para o painel de estatísticas lateral
  const activeStatStudent = selectedStudent || students[0] || {
    name: 'Estudante',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHUQK8IorzIumgthKFtCPWo2riabZasOxpyAW_sE4zJHYFnV4QDcPGS-U_1nRfZo44W96KrUL9V4AJ1dHZt6C_NrkzcM3ViQMTKT1yYT9_glo5PCAbYoCRs0OZrUsWReuBmqxZ0OjLynylvuIMlhsKTn72v2vEDG7pcUZ3p27dt4TQuOMEATxKfXdCfzLV5WxnEXcMk_Fpi0Jo0_Bh0_L6aUJqzMsztsgTbUJq-4Al1qVBT0Q4Np9mcK6h7czZNg2yCBwQ5mIccXAN',
    progress: 32
  };

  // Obter cores para as linguagens
  const getLanguageDetails = (taskTitle: string) => {
    const titleLower = taskTitle.toLowerCase();
    if (titleLower.includes('alemão') || titleLower.includes('deutsch') || titleLower.includes('de')) {
      return { label: 'ALEMÃO', colorClass: 'bg-amber-100 text-amber-600 border border-amber-200' };
    }
    if (titleLower.includes('inglês') || titleLower.includes('english') || titleLower.includes('en')) {
      return { label: 'INGLÊS', colorClass: 'bg-blue-100 text-blue-600 border border-blue-200' };
    }
    return { label: 'PORTUGUÊS', colorClass: 'bg-purple-100 text-purple-600 border border-purple-200' };
  };

  // Simular mentor seguir/seguindo
  const toggleFollowMentor = (mentorName: string) => {
    if (followedMentors.includes(mentorName)) {
      setFollowedMentors(prev => prev.filter(m => m !== mentorName));
    } else {
      setFollowedMentors(prev => [...prev, mentorName]);
    }
  };

  return (
    <div className="min-h-screen bg-[#e2e8f0] font-sans flex items-center justify-center p-0 md:p-4 lg:p-8 select-none overflow-hidden relative">
      
      {/* Container Principal */}
      <main className="w-full max-w-[1440px] bg-[#f8fafc] rounded-none md:rounded-3xl shadow-2xl flex overflow-hidden min-h-screen md:min-h-[900px] h-screen md:h-[90vh] transition-all relative">
        
        {/* ==================================================== */}
        {/* 1. COLUNA: SIDEBAR ESQUERDO                          */}
        {/* ==================================================== */}
        
        {/* Desktop Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 justify-between">
          <div className="space-y-8 flex-1">
            {/* Logo */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-[#635bfc] rounded-xl flex items-center justify-center text-white shadow-md">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <span className="text-xl font-black text-gray-800 tracking-tight">Abba Digital</span>
            </div>

            {/* Navegação */}
            <nav className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Geral</p>
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => setActiveFolder('inbox')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                        activeFolder === 'inbox' 
                          ? 'bg-[#635bfc]/10 text-[#635bfc]' 
                          : 'text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <FileText className="w-4 h-4 shrink-0" />
                      <span>Submissões</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveFolder('students')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                        activeFolder === 'students' 
                          ? 'bg-[#635bfc]/10 text-[#635bfc]' 
                          : 'text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <User className="w-4 h-4 shrink-0" />
                      <span>Lista de Alunos</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveFolder('accessKeys')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                        activeFolder === 'accessKeys' 
                          ? 'bg-[#635bfc]/10 text-[#635bfc]' 
                          : 'text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <Key className="w-4 h-4 shrink-0" />
                      <span>Chaves de Acesso</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveFolder('logs')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                        activeFolder === 'logs' 
                          ? 'bg-[#635bfc]/10 text-[#635bfc]' 
                          : 'text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <History className="w-4 h-4 shrink-0" />
                      <span>Registro de Ações</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveFolder('tasks')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                        activeFolder === 'tasks' 
                          ? 'bg-[#635bfc]/10 text-[#635bfc]' 
                          : 'text-gray-500 bg-transparent hover:bg-gray-50 hover:text-gray-800'
                      }`}
                    >
                      <BookOpen className="w-4 h-4 shrink-0" />
                      <span>Tarefas Criadas</span>
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Ações Rápidas</p>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => {
                        setGeneratedLinkInfo(null);
                        setIsLinkModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-[#635bfc] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#635bfc]/20 border-none"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Gerar Convite</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsTaskModalOpen(true)}
                      className="w-full py-2.5 bg-brand-light text-brand hover:bg-brand/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#635bfc]/15"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Criar Tarefa</span>
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {/* Ajustes e Sair */}
          <div className="pt-6 border-t border-gray-100 space-y-1.5">
            <a 
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl text-xs font-bold transition-colors no-underline"
            >
              📋 Layout Clássico
            </a>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors text-left border-none bg-transparent cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sair do Sistema</span>
            </button>
          </div>
        </aside>

        {/* Mobile Left Sidebar overlay drawer */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              {/* Tap backdrop to close */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />
              {/* Drawer Container */}
              <motion.aside 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 left-0 w-64 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
              >
                <div className="space-y-8 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#635bfc] rounded-xl flex items-center justify-center text-white shadow-md">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                        </svg>
                      </div>
                      <span className="text-xl font-black text-gray-800 tracking-tight">Abba Digital</span>
                    </div>
                    <button onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <nav className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Geral</p>
                      <ul className="space-y-1">
                        <li>
                          <button 
                            onClick={() => { setActiveFolder('inbox'); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                              activeFolder === 'inbox' ? 'bg-[#635bfc]/10 text-[#635bfc]' : 'text-gray-500 bg-transparent'
                            }`}
                          >
                            <FileText className="w-4 h-4 shrink-0" />
                            <span>Submissões</span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => { setActiveFolder('students'); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                              activeFolder === 'students' ? 'bg-[#635bfc]/10 text-[#635bfc]' : 'text-gray-500 bg-transparent'
                            }`}
                          >
                            <User className="w-4 h-4 shrink-0" />
                            <span>Lista de Alunos</span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => { setActiveFolder('accessKeys'); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                              activeFolder === 'accessKeys' ? 'bg-[#635bfc]/10 text-[#635bfc]' : 'text-gray-500 bg-transparent'
                            }`}
                          >
                            <Key className="w-4 h-4 shrink-0" />
                            <span>Chaves de Acesso</span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => { setActiveFolder('logs'); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                              activeFolder === 'logs' ? 'bg-[#635bfc]/10 text-[#635bfc]' : 'text-gray-500 bg-transparent'
                            }`}
                          >
                            <History className="w-4 h-4 shrink-0" />
                            <span>Registro de Ações</span>
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => { setActiveFolder('tasks'); setIsMobileSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border-none cursor-pointer ${
                              activeFolder === 'tasks' ? 'bg-[#635bfc]/10 text-[#635bfc]' : 'text-gray-500 bg-transparent'
                            }`}
                          >
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>Tarefas Criadas</span>
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Ações Rápidas</p>
                      <ul className="space-y-2">
                        <li>
                          <button
                            onClick={() => {
                              setIsMobileSidebarOpen(false);
                              setGeneratedLinkInfo(null);
                              setIsLinkModalOpen(true);
                            }}
                            className="w-full py-2.5 bg-[#635bfc] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Gerar Convite</span>
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              setIsMobileSidebarOpen(false);
                              setIsTaskModalOpen(true);
                            }}
                            className="w-full py-2.5 bg-brand-light text-brand rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#635bfc]/15"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Criar Tarefa</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </nav>
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-1.5">
                  <a 
                    href="/"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-500 rounded-xl text-xs font-bold transition-colors no-underline"
                  >
                    📋 Layout Clássico
                  </a>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors text-left border-none bg-transparent cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sair</span>
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ==================================================== */}
        {/* 2. ÁREA CENTRAL DE CONTEÚDO                          */}
        {/* ==================================================== */}
        <div className="flex-grow flex flex-col overflow-y-auto scrollbar-hide bg-[#f8fafc] w-full min-w-0">
          
          {/* Header Superior */}
          <header className="flex items-center justify-between p-4 md:p-6 bg-[#f8fafc] sticky top-0 z-20 border-b border-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              {/* Mobile hamburger toggle button */}
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-brand transition-colors border border-gray-100 lg:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Barra de Pesquisa */}
              <div className="relative w-full max-w-[200px] sm:max-w-md">
                <input 
                  type="text"
                  placeholder={`Buscar em ${
                    activeFolder === 'inbox' ? 'submissões' : 
                    activeFolder === 'students' ? 'alunos' : 
                    activeFolder === 'accessKeys' ? 'chaves' : 
                    activeFolder === 'tasks' ? 'tarefas' : 'logs'
                  }...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200/60 rounded-full shadow-sm text-xs focus:outline-none focus:ring-2 focus:ring-[#635bfc] focus:border-transparent transition-all font-medium text-gray-700 placeholder:text-gray-400"
                />
                <Search className="w-4.5 h-4.5 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Ações e Avatar do Perfil */}
            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              <button className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-brand transition-colors border border-gray-100 cursor-pointer">
                <Bell className="w-4 h-4" />
              </button>
              
              {/* Mobile Stats Toggle button */}
              <button 
                onClick={() => setIsMobileStatsOpen(true)}
                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-brand transition-colors border border-gray-100 lg:hidden cursor-pointer"
              >
                <Activity className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 p-1 pr-3 bg-white rounded-full shadow-sm border border-gray-100 hover:shadow-md transition-all group shrink-0">
                <img 
                  alt="Perfil do Professor" 
                  className="w-8 h-8 rounded-full border-2 border-brand/20 group-hover:border-brand transition-colors object-cover" 
                  src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779573141/clipboard-image-1779573127_oef0qy.avif"
                />
                <span className="text-xs font-bold text-gray-700 hidden sm:inline">&nbsp;{user.name.split(' ')[0]}</span>
              </div>
            </div>
          </header>

          {/* Área de Visualização Principal */}
          <div className="p-4 md:p-6 space-y-6 md:space-y-8 flex-1">
            
            {/* HERO BANNER & STATS GRIDS - Apenas se estiver no inbox (Dashboard) */}
            {activeFolder === 'inbox' && (
              <>
                {/* Hero Banner */}
                <section className="relative rounded-3xl p-6 md:p-8 flex flex-col justify-center overflow-hidden bg-gradient-to-r from-brand/5 to-purple-600/5 border border-brand/10 relative overflow-hidden animate-fade-in-up">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand/10 rounded-full blur-3xl" />
                  <div className="relative z-10 max-w-lg text-left">
                    <h1 className="text-2xl md:text-3xl font-black mb-2 text-gray-800 leading-tight">
                      Bem-vindo de volta,<br className="hidden sm:inline" />
                      <span className="text-[#635bfc]">Professor {user.name.split(' ')[0]}!</span>
                    </h1>
                    <p className="text-xs text-gray-500 font-semibold mb-5 leading-relaxed">
                      Acompanhe o aprendizado tridimensional do ábaco e impulsione as lições em tempo real.
                    </p>
                    <button 
                      onClick={() => setIsTaskModalOpen(true)}
                      className="bg-white text-brand px-5 py-2.5 rounded-full font-extrabold text-xs flex items-center gap-2 hover:shadow-md transition-all border border-gray-200/80 cursor-pointer w-fit"
                    >
                      Criar Nova Lição
                      <div className="bg-brand text-white rounded-full p-0.5">
                        <Plus className="w-3 h-3" />
                      </div>
                    </button>
                  </div>
                </section>

                {/* Category Progress Snap Cards */}
                <section className="flex overflow-x-auto scrollbar-hide pb-2 gap-4 snap-x snap-mandatory scroll-smooth w-full">
                  
                  {/* Card 1: Submissões */}
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/60 flex items-center gap-3.5 min-w-[240px] flex-1 snap-start transition-all duration-300 hover:shadow-md animate-fade-in-up">
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-blue-100">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-grow text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{submissions.length} Realizadas</p>
                      <h3 className="text-sm font-bold text-gray-800">Submissões</h3>
                    </div>
                  </div>

                  {/* Card 2: Alunos Ativos */}
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/60 flex items-center gap-3.5 min-w-[240px] flex-1 snap-start transition-all duration-300 hover:shadow-md animate-fade-in-up [animation-delay:0.1s]">
                    <div className="w-11 h-11 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-pink-100">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-grow text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{students.length} Cadastrados</p>
                      <h3 className="text-sm font-bold text-gray-800">Alunos Ativos</h3>
                    </div>
                  </div>

                  {/* Card 3: Chaves geradas */}
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/60 flex items-center gap-3.5 min-w-[240px] flex-1 snap-start transition-all duration-300 hover:shadow-md animate-fade-in-up [animation-delay:0.2s]">
                    <div className="w-11 h-11 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-cyan-100">
                      <Key className="w-5 h-5" />
                    </div>
                    <div className="flex-grow text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{activeCodes.length} Em andamento</p>
                      <h3 className="text-sm font-bold text-gray-800">Convites</h3>
                    </div>
                  </div>

                  {/* Card 4: Tarefas criadas */}
                  <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/60 flex items-center gap-3.5 min-w-[240px] flex-1 snap-start transition-all duration-300 hover:shadow-md animate-fade-in-up [animation-delay:0.3s]">
                    <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-purple-100">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-grow text-left">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{tasks.length} Ativas</p>
                      <h3 className="text-sm font-bold text-gray-800">Lições Totais</h3>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* DYNAMIC CONTENT VIEWS BY TABS */}
            
            {/* VIEW A: SUBMISSÕES (DASHBOARD) */}
            {activeFolder === 'inbox' && (
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Inbox Left list */}
                <div className="xl:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4 text-left min-h-[400px]">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-50">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <span>Inbox do Professor</span>
                      <span className="px-2 py-0.5 bg-[#635bfc]/10 text-[#635bfc] text-[10px] rounded-full font-bold">{filteredSubmissions.length}</span>
                    </h2>
                    
                    {/* Inbox small filters */}
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setFilterType('all')} 
                        className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all border border-gray-200 cursor-pointer ${
                          filterType === 'all' ? 'bg-[#635bfc] text-white border-transparent' : 'bg-transparent text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        TUDO
                      </button>
                      <button 
                        onClick={() => setFilterType('evaluated')} 
                        className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition-all border border-gray-200 cursor-pointer ${
                          filterType === 'evaluated' ? 'bg-[#635bfc] text-white border-transparent' : 'bg-transparent text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        AVALIADAS
                      </button>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                      <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Buscando do Supabase...</span>
                    </div>
                  ) : filteredSubmissions.length === 0 ? (
                    <div className="py-20 text-center text-gray-400 text-xs italic">
                      Nenhuma submissão encontrada.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {filteredSubmissions.map((sub) => {
                        const isSelected = sub.id === selectedSubmissionId;
                        const langDetails = getLanguageDetails(sub.taskTitle);
                        return (
                          <div
                            key={`sub-${sub.id}`}
                            onClick={() => setSelectedSubmissionId(sub.id)}
                            className={`p-3.5 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden cursor-pointer ${
                              isSelected 
                                ? 'bg-[#635bfc]/5 border-[#635bfc]/30 shadow-sm' 
                                : 'bg-[#f8fafc]/50 border-gray-100 hover:bg-white hover:border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-extrabold text-[13px] text-gray-800 truncate max-w-[70%]">
                                {sub.studentName}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold shrink-0">
                                {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-gray-500 font-semibold truncate mb-3">
                              {sub.taskTitle}
                            </p>

                            <div className="flex justify-between items-center">
                              <span className={`px-2 py-0.5 text-[8px] font-black rounded-md ${langDetails.colorClass}`}>
                                #{langDetails.label}
                              </span>
                              <span className="text-[9px] text-gray-400 font-bold flex items-center gap-0.5">
                                {sub.spelledWords.length} palavras
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inbox Right review pane */}
                <div className="xl:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 text-left min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {!selectedSubmission ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 gap-3">
                        <Award className="w-12 h-12 text-brand/35 animate-bounce" />
                        <div className="max-w-xs space-y-1">
                          <h4 className="font-bold text-sm text-gray-800">Selecione uma Submissão</h4>
                          <p className="text-[11px] text-gray-400">Selecione um card na lista ao lado para inspecionar os blocos construídos e auditar a soletragem no Ábaco 3D.</p>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        key={`sub-detail-${selectedSubmission.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-5"
                      >
                        {/* Student Badge Card */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 relative overflow-hidden">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-brand to-purple-500 text-white font-black text-sm flex items-center justify-center uppercase shadow-md shrink-0">
                            {selectedSubmission.studentName.charAt(0)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="font-extrabold text-sm text-gray-800 leading-tight truncate">{selectedSubmission.studentName}</h3>
                            <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">
                              E-mail: {selectedSubmission.studentEmail || `${selectedSubmission.studentName.toLowerCase().replace(' ', '')}@abba.com`}
                            </p>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg px-2.5 py-1 font-bold shrink-0">
                            ✓ Entregue em {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Files Storage Attachments */}
                        <div className="p-4 bg-white rounded-2xl border border-gray-100/80 space-y-3">
                          <h4 className="text-xs font-black text-gray-800 tracking-wide uppercase border-b border-gray-50 pb-2">Arquivos Enviados</h4>
                          {!selectedSubmission.taskFiles || selectedSubmission.taskFiles.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">Nenhum arquivo ou documento anexado a esta tarefa.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {selectedSubmission.taskFiles.map((file, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 py-2 px-3 rounded-xl border border-gray-100 transition-colors">
                                  <span className="text-[11px] text-gray-600 font-semibold truncate max-w-[70%]">{file.name || 'Anexo'}</span>
                                  <div className="flex gap-2">
                                    <a 
                                      href={file.url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="p-1 text-brand hover:bg-[#635bfc]/10 rounded-lg transition-all"
                                      title="Visualizar"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <a 
                                      href={file.url} 
                                      download 
                                      className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                                      title="Download"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Words Spelled details */}
                        <div className="p-4 bg-white rounded-2xl border border-gray-100/80 space-y-3">
                          <h4 className="text-xs font-black text-gray-800 tracking-wide uppercase border-b border-gray-50 pb-2">Soletragem Tridimensional</h4>
                          {selectedSubmission.spelledWords.length === 0 ? (
                            <p className="text-[11px] text-gray-400 italic">Nenhum registro de palavra gravado no ábaco.</p>
                          ) : (
                            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                              {selectedSubmission.spelledWords.map((wordObj, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                  <div className="flex flex-col gap-1.5 text-left flex-1 min-w-0">
                                    <span className="text-[11px] font-black text-gray-800 tracking-wider">Palavra: "{wordObj.word}"</span>
                                    <div className="flex flex-wrap gap-1">
                                      {wordObj.letters.map((l: any, slotIdx: number) => (
                                        <div 
                                          key={slotIdx} 
                                          className="w-6.5 h-6.5 rounded-lg border border-gray-200 flex items-center justify-center font-bold text-[10px] shrink-0 bg-white"
                                          style={{
                                            color: wordObj.themeColor || '#635bfc',
                                            borderColor: wordObj.themeColor || '#635bfc'
                                          }}
                                        >
                                          {l.letter}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <span className="w-3 h-3 rounded-full shrink-0 border border-white shadow-sm" style={{ backgroundColor: wordObj.themeColor || '#635bfc' }} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Corrections & Launching Review Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => onLaunchReviewMode(selectedSubmission)}
                            className="w-full py-3.5 bg-gradient-to-r from-brand to-purple-600 text-white rounded-2xl font-black text-xs shadow-md shadow-[#635bfc]/20 hover:shadow-lg hover:shadow-[#635bfc]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                            <span>Iniciar Correção no Ábaco 3D Real 🔮</span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </section>
            )}

            {/* VIEW B: LISTA DE ALUNOS */}
            {activeFolder === 'students' && (
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start text-left animate-fade-in-up">
                
                {/* Students directory left list */}
                <div className="xl:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 space-y-4 min-h-[400px]">
                  <h2 className="text-base font-bold text-gray-800 px-2 pb-2 border-b border-gray-50 flex justify-between items-center">
                    <span>Estudantes Cadastrados</span>
                    <span className="px-2 py-0.5 bg-[#635bfc]/10 text-[#635bfc] text-[10px] rounded-full font-bold">{students.length}</span>
                  </h2>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {students.length === 0 ? (
                      <p className="py-20 text-center text-gray-400 italic text-xs">Nenhum aluno carregado.</p>
                    ) : (
                      students
                        .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((s) => {
                          const isSelected = s.id === selectedStudentId;
                          return (
                            <div
                              key={`student-${s.id}`}
                              onClick={() => setSelectedStudentId(s.id)}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-[#635bfc]/5 border-[#635bfc]/30' 
                                  : 'bg-[#f8fafc]/50 border-gray-100 hover:bg-white hover:border-gray-200'
                              }`}
                            >
                              <div className="flex gap-3 items-center min-w-0">
                                <img src={s.img} alt={s.name} className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-extrabold text-[13px] text-gray-800 truncate">{s.name}</p>
                                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5 truncate">{s.class}</p>
                                </div>
                              </div>
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (confirm(`Tem certeza de que deseja excluir permanentemente o aluno ${s.name}?`)) {
                                    try {
                                      const { error } = await supabase.from('students').delete().eq('id', s.id);
                                      if (error) throw error;
                                      setStudents(prev => prev.filter(student => student.id !== s.id));
                                      alert('Aluno excluído com sucesso! 🗑️');
                                      if (selectedStudentId === s.id) {
                                        setSelectedStudentId(null);
                                      }
                                    } catch (err) {
                                      console.warn('Erro ao excluir no banco:', err);
                                      setStudents(prev => prev.filter(student => student.id !== s.id));
                                      alert('Aluno removido localmente.');
                                    }
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                                title="Excluir aluno"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Selected Student details right pane */}
                <div className="xl:col-span-7 bg-white rounded-3xl border border-gray-100/80 shadow-sm p-6 space-y-6 min-h-[400px]">
                  <AnimatePresence mode="wait">
                    {!selectedStudent ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 gap-3">
                        <User className="w-12 h-12 text-[#635bfc]/30 animate-pulse" />
                        <div className="max-w-xs space-y-1">
                          <h4 className="font-bold text-sm text-gray-800">Selecione um Aluno</h4>
                          <p className="text-[11px] text-gray-400">Escolha um aluno na lista ao lado para inspecionar seus dados de matrícula, logs de acessos recentes e gerenciar cadastro.</p>
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        key={`student-detail-${selectedStudent.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Profile header card */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 pb-5 border-b border-gray-50 relative">
                          <img src={selectedStudent.img} alt={selectedStudent.name} className="w-16 h-16 rounded-full object-cover border-2 border-brand/20 shadow-md" />
                          <div className="text-center sm:text-left">
                            <h3 className="font-extrabold text-lg text-gray-800 leading-tight">{selectedStudent.name}</h3>
                            <p className="text-xs text-[#635bfc] font-bold mt-1">{selectedStudent.class}</p>
                            <p className="text-[10px] text-gray-400 font-semibold mt-1">
                              Matrícula: {selectedStudent.matricula} &nbsp;|&nbsp; Gênero: {selectedStudent.gender === 'F' ? 'Feminino' : 'Masculino'}
                            </p>
                          </div>
                        </div>

                        {/* Sub-cards specs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                            <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-wider">Histórico de Acesso</h4>
                            <div className="space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Método de Login:</span>
                                <span className="font-bold text-gray-700 capitalize">{selectedStudent.loginMethod || 'Código'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">E-mail:</span>
                                <span className="font-bold text-brand truncate max-w-[150px] font-mono">{selectedStudent.email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Último Login:</span>
                                <span className="font-bold text-gray-700 text-[10px]">{selectedStudent.lastAccessAt ? new Date(selectedStudent.lastAccessAt).toLocaleString() : 'Não informado'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                            <h4 className="font-black text-[10px] uppercase text-gray-400 tracking-wider">Métricas de Aprendizado</h4>
                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                  <span>Progresso:</span>
                                  <span>{selectedStudent.progress || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200/50 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-brand rounded-full transition-all duration-500" 
                                    style={{ width: `${selectedStudent.progress || 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400">Nível:</span>
                                <span className="px-2 py-0.5 bg-brand-light text-brand text-[9px] font-black uppercase rounded-md border border-brand/10">
                                  {selectedStudent.progress >= 90 ? 'Mestre' : selectedStudent.progress >= 70 ? 'Avançado' : selectedStudent.progress >= 50 ? 'Intermediário' : 'Iniciante'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Critical Removal Area */}
                        <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl space-y-3">
                          <div className="flex gap-2.5 items-start">
                            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                            <div>
                              <h4 className="font-bold text-xs text-red-700">Zona de Perigo</h4>
                              <p className="text-[10px] text-gray-400">Ao deletar este aluno, todos os registros de acessos, estatísticas e submissões dele serão limpos do banco.</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (confirm(`Excluir de forma irrevogável o cadastro do aluno ${selectedStudent.name}?`)) {
                                try {
                                  const { error } = await supabase.from('students').delete().eq('id', selectedStudent.id);
                                  if (error) throw error;
                                  setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
                                  alert('Aluno deletado permanentemente! 🗑️');
                                  setSelectedStudentId(null);
                                } catch (err) {
                                  console.warn('Erro ao excluir no banco:', err);
                                  setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
                                  alert('Removido localmente.');
                                  setSelectedStudentId(null);
                                }
                              }
                            }}
                            className="w-full py-2.5 bg-red-100 hover:bg-red-200 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            Excluir {selectedStudent.name} 🗑️
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </section>
            )}

            {/* VIEW C: CHAVES DE ACESSO */}
            {activeFolder === 'accessKeys' && (
              <section className="space-y-6 text-left animate-fade-in-up">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span>Códigos e Convites de Acesso Ativos</span>
                    <span className="px-2 py-0.5 bg-brand-light text-brand text-[10px] rounded-full font-bold">{activeCodes.length}</span>
                  </h2>
                  <button 
                    onClick={() => { setGeneratedLinkInfo(null); setIsLinkModalOpen(true); }}
                    className="py-1.5 px-3 bg-brand text-white text-[11px] font-black rounded-full hover:bg-brand-dark transition-all flex items-center gap-1 cursor-pointer border-none shadow-sm shadow-[#635bfc]/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gerar Novo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activeCodes.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic text-xs bg-white rounded-3xl border border-gray-100 shadow-sm">
                      Nenhuma chave de convite ativa. Clique em "Gerar Novo" para convidar alunos.
                    </div>
                  ) : (
                    activeCodes.map((item) => (
                      <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-extrabold text-sm text-gray-800 leading-tight truncate">{item.studentName}</h4>
                            <p className="text-[10px] text-brand font-mono font-bold mt-1 tracking-wider">ABBA-{item.code}</p>
                          </div>
                          
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                const magicLink = `${window.location.origin}/?code=ABBA-${item.code}`;
                                navigator.clipboard.writeText(magicLink);
                                setCopiedCodeText(item.code);
                                setTimeout(() => setCopiedCodeText(null), 2000);
                              }}
                              className="p-1.5 hover:bg-brand/5 text-gray-400 hover:text-brand rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                              title="Copiar Link de Acesso"
                            >
                              {copiedCodeText === item.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteLink(item.code)}
                              className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                              title="Excluir código"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mt-3 pt-2.5 border-t border-gray-50">
                          <span>Duração: {item.durationLabel || '1 Hora'}</span>
                          <span className="text-emerald-500 bg-emerald-50 border border-emerald-100 rounded-md px-1.5 py-0.5">Ativo ✓</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {/* VIEW D: REGISTRO DE AÇÕES (LOGS) */}
            {activeFolder === 'logs' && (
              <section className="space-y-4 text-left animate-fade-in-up">
                
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span>Monitoramento de Atividade Real (Ábaco 3D)</span>
                  <span className="px-2.5 py-0.5 bg-brand-light text-brand text-[10px] rounded-full font-bold">{actionLogs.length} logs</span>
                </h2>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-3.5">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {actionLogs.length === 0 ? (
                      <p className="py-20 text-center text-gray-400 italic text-xs">Nenhum log de atividade registrado no momento.</p>
                    ) : (
                      actionLogs
                        .filter(l => l.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.action_type.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((log) => (
                          <div key={log.id} className="p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-7.5 h-7.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-600 font-black flex items-center justify-center text-[10px]">
                                LOG
                              </div>
                              <div className="text-left">
                                <span className="font-extrabold text-gray-800 block leading-tight">{log.student_name}</span>
                                <span className="text-[10px] text-gray-400 font-bold block mt-0.5 uppercase tracking-wide text-cyan-500">{log.action_type}</span>
                              </div>
                            </div>

                            <p className="text-[10px] text-gray-500 font-mono bg-white border border-gray-150 p-2 rounded-xl flex-1 max-w-lg truncate block text-left">
                              {JSON.stringify(log.action_details)}
                            </p>

                            <span className="text-[9px] text-gray-400 font-bold shrink-0">
                              {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* VIEW E: TAREFAS CRIADAS */}
            {activeFolder === 'tasks' && (
              <section className="space-y-6 text-left animate-fade-in-up">
                
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span>Tarefas e Lições Disponíveis</span>
                    <span className="px-2 py-0.5 bg-brand-light text-brand text-[10px] rounded-full font-bold">{tasks.length}</span>
                  </h2>
                  <button 
                    onClick={() => setIsTaskModalOpen(true)}
                    className="py-1.5 px-3 bg-brand text-white text-[11px] font-black rounded-full hover:bg-brand-dark transition-all flex items-center gap-1 cursor-pointer border-none shadow-sm shadow-[#635bfc]/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Tarefa</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {tasks.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-gray-400 italic text-xs bg-white rounded-3xl border border-gray-100 shadow-sm">
                      Nenhuma lição criada ainda. Clique em "Criar Tarefa" para começar.
                    </div>
                  ) : (
                    tasks
                      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((task) => (
                        <div key={task.id} className="p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <span className="font-extrabold text-sm text-gray-800 leading-tight truncate">{task.title}</span>
                              <span className={`px-2 py-0.5 text-[8px] font-bold rounded-md shrink-0 uppercase tracking-wide ${
                                task.priority === 'Alta' ? 'bg-red-50 text-red-500 border border-red-100' : task.priority === 'Média' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-green-50 text-green-500 border border-green-100'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mt-1">{task.description}</p>
                            
                            {/* Palavras-alvo */}
                            <div className="flex flex-wrap gap-1 mt-3">
                              {task.targetWords.map((w, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded font-mono text-[9px]">
                                  {w.word}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold mt-4 pt-2 border-t border-gray-50">
                            <span>Prazo: {task.dueDate}</span>
                            <span className="text-brand uppercase font-black tracking-wider text-[8px]">{task.targetWords[0]?.language || 'pt'}</span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </section>
            )}

          </div>
        </div>

        {/* ==================================================== */}
        {/* 3. COLUNA: SIDEBAR DIREITO (ESTATÍSTICAS)            */}
        {/* ==================================================== */}
        
        {/* Desktop Stats Sidebar */}
        <aside className="w-80 flex-shrink-0 bg-white border-l border-gray-100 p-8 hidden xl:flex flex-col justify-between overflow-y-auto scrollbar-hide text-left">
          <div className="space-y-8 flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-800">Estatísticas</h2>
              <Award className="w-5 h-5 text-gray-300" />
            </div>

            {/* Circular Progress & Selected Student snapshot */}
            <div className="flex flex-col items-center text-center">
              <div className="relative w-36 h-36 flex items-center justify-center mb-5">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-gray-100" cx="72" cy="72" fill="transparent" r="62" stroke="currentColor" strokeWidth="6"></circle>
                  <circle 
                    className="text-[#635bfc] rounded-full transition-all duration-1000" 
                    cx="72" 
                    cy="72" 
                    fill="transparent" 
                    r="62" 
                    stroke="currentColor" 
                    strokeDasharray="390" 
                    strokeDashoffset={390 - (390 * (activeStatStudent.progress || 0)) / 100}
                    strokeWidth="6"
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <img 
                    alt="Estudante ativo" 
                    className="w-18 h-18 rounded-full border-4 border-white shadow-lg object-cover" 
                    src={activeStatStudent.img}
                  />
                  <div className="bg-[#635bfc] text-white text-[9px] font-bold px-2 py-0.5 rounded-full absolute bottom-4 border-2 border-white shadow-sm">
                    {activeStatStudent.progress || 0}%
                  </div>
                </div>
              </div>
              <h3 className="text-base font-extrabold text-gray-800">Olá, {activeStatStudent.name.split(' ')[0]}! 🔥</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-xs">
                Acompanhando o progresso individual nas lições de vogais e junção de sílabas.
              </p>
            </div>

            {/* Activity Chart simulation */}
            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">Envios por Período</h4>
              <div className="flex items-end justify-between gap-3 h-20 px-2 mb-3">
                <div className="w-7 bg-[#635bfc]/20 h-[40%] rounded-lg hover:bg-[#635bfc]/30 transition-all cursor-pointer" title="40%" />
                <div className="w-7 bg-[#635bfc]/45 h-[65%] rounded-lg hover:bg-[#635bfc]/60 transition-all cursor-pointer" title="65%" />
                <div className="w-7 bg-[#635bfc]/25 h-[30%] rounded-lg hover:bg-[#635bfc]/40 transition-all cursor-pointer" title="30%" />
                <div className="w-7 bg-[#635bfc] h-[90%] rounded-lg hover:bg-brand-dark transition-all cursor-pointer" title="90%" />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-gray-400 px-1">
                <span>01-10 Out</span>
                <span>11-20 Out</span>
                <span>21-31 Out</span>
              </div>
            </div>

            {/* Simulated Mentors List */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">Orientadores da Rede</h3>
              <div className="space-y-3">
                
                {/* Mentor 1 */}
                <div className="flex items-center gap-3 bg-white p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                  <img alt="Mentor 1" className="w-9 h-9 rounded-full object-cover border border-slate-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_1Qhc2K70O_H6pLnYXi0wlUW04npQ10lh-Ahke544FXvaIGufKHMGxyQExINqYgvLPncTQpFrBbPfnirVAhyi570nHJzy2IkClpZIuZxLzvUxWTNY0Q4XUchiEZa4WGW-WgnYVeXbXO8weI-lIBtMcKNEdgIBo1gxkQUHmU_Sn7d2DnteeQ952fyIS_LITt1Bnq13sOYEb4nS3XKu0BOQMy-gWnb-dzotte1qoVtShga24gEkueN6cNDzWUZuU-z30YY2Gsn2vpfZ" />
                  <div className="flex-grow text-left">
                    <p className="text-xs font-bold text-gray-800 leading-tight">Marta Ferreira</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Especialista</p>
                  </div>
                  <button 
                    onClick={() => toggleFollowMentor('Marta Ferreira')}
                    className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      followedMentors.includes('Marta Ferreira') 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-transparent text-brand border-brand/20 hover:bg-brand hover:text-white hover:border-transparent'
                    }`}
                  >
                    {followedMentors.includes('Marta Ferreira') ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>

                {/* Mentor 2 */}
                <div className="flex items-center gap-3 bg-white p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                  <img alt="Mentor 2" className="w-9 h-9 rounded-full object-cover border border-slate-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzIZAlz5jon-Um-Y11HiBXOheXLA9QW2j3xxe2WxI_aZ2aHjOvqWV0_uymLSjzmYOXWzZRjA_Cw-bhIw-BsvwV44v02CVIM6NgFzr60sXK5m1CeFKu8ooteyHxHVXpgYHCP7qboy7bIKtKx38pxOb-ASQ0T2sIKi-D4Dy3JlerVRoCF-O6VKTZBCwgOu_aFWoybhDZv-Dxq0kXZgc422SYYLBs9TqfbM-t7GkSs2qgFsTA88J3EPPTi5K7dHBUohoq2VdH1PMeC69q" />
                  <div className="flex-grow text-left">
                    <p className="text-xs font-bold text-gray-800 leading-tight">Prof. Arnaldo</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Psicopedagogo</p>
                  </div>
                  <button 
                    onClick={() => toggleFollowMentor('Prof. Arnaldo')}
                    className={`text-[9px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      followedMentors.includes('Prof. Arnaldo') 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-transparent text-brand border-brand/20 hover:bg-brand hover:text-white hover:border-transparent'
                    }`}
                  >
                    {followedMentors.includes('Prof. Arnaldo') ? 'Seguindo' : 'Seguir'}
                  </button>
                </div>

              </div>
            </div>

          </div>
        </aside>

        {/* Mobile Stats Sidebar Overlay Drawer */}
        <AnimatePresence>
          {isMobileStatsOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileStatsOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />
              <motion.aside 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed inset-y-0 right-0 w-80 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden text-left"
              >
                <div className="space-y-6 flex-grow overflow-y-auto scrollbar-hide pr-1">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <h2 className="text-base font-bold text-gray-800">Estatísticas do Aluno</h2>
                    <button onClick={() => setIsMobileStatsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 border-none bg-transparent cursor-pointer">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="relative w-36 h-36 flex items-center justify-center mb-5">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="text-gray-100" cx="72" cy="72" fill="transparent" r="62" stroke="currentColor" strokeWidth="6"></circle>
                        <circle 
                          className="text-[#635bfc] rounded-full transition-all" 
                          cx="72" 
                          cy="72" 
                          fill="transparent" 
                          r="62" 
                          stroke="currentColor" 
                          strokeDasharray="390" 
                          strokeDashoffset={390 - (390 * (activeStatStudent.progress || 0)) / 100}
                          strokeWidth="6"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <img alt="Estudante ativo" className="w-18 h-18 rounded-full border-4 border-white shadow-lg object-cover" src={activeStatStudent.img} />
                        <div className="bg-[#635bfc] text-white text-[9px] font-bold px-2 py-0.5 rounded-full absolute bottom-4 border-2 border-white shadow-sm">
                          {activeStatStudent.progress || 0}%
                        </div>
                      </div>
                    </div>
                    <h3 className="text-base font-extrabold text-gray-800">Olá, {activeStatStudent.name.split(' ')[0]}! 🔥</h3>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed max-w-xs">
                      Monitorando progressos individuais no ábaco.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">Envios por Período</h4>
                    <div className="flex items-end justify-between gap-3 h-20 px-2 mb-3">
                      <div className="w-7 bg-[#635bfc]/20 h-[40%] rounded-lg" />
                      <div className="w-7 bg-[#635bfc]/45 h-[65%] rounded-lg" />
                      <div className="w-7 bg-[#635bfc]/25 h-[30%] rounded-lg" />
                      <div className="w-7 bg-[#635bfc] h-[90%] rounded-lg" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">Orientadores</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white p-2 border border-gray-100 rounded-xl">
                        <img alt="Marta" className="w-9 h-9 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_1Qhc2K70O_H6pLnYXi0wlUW04npQ10lh-Ahke544FXvaIGufKHMGxyQExINqYgvLPncTQpFrBbPfnirVAhyi570nHJzy2IkClpZIuZxLzvUxWTNY0Q4XUchiEZa4WGW-WgnYVeXbXO8weI-lIBtMcKNEdgIBo1gxkQUHmU_Sn7d2DnteeQ952fyIS_LITt1Bnq13sOYEb4nS3XKu0BOQMy-gWnb-dzotte1qoVtShga24gEkueN6cNDzWUZuU-z30YY2Gsn2vpfZ" />
                        <div className="flex-grow text-left">
                          <p className="text-xs font-bold text-gray-800">Marta Ferreira</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

      </main>

      {/* ==================================================== */}
      {/* MODAL: GERAR CONVITE (Magic Link)                    */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isLinkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl border border-gray-100 text-left space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-brand" />
                  <span>Gerar Link & Código de Convite</span>
                </h3>
                <button onClick={() => setIsLinkModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-50 border-none bg-transparent cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {!generatedLinkInfo ? (
                <form onSubmit={handleGenerateLink} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Selecionar Estudante</label>
                    {students.length === 0 ? (
                      <input 
                        type="text"
                        placeholder="Nome do Aluno (Ex: Leyton Graves)"
                        value={selectedStudentName}
                        onChange={(e) => setSelectedStudentName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                        required
                      />
                    ) : (
                      <select
                        value={selectedStudentName}
                        onChange={(e) => setSelectedStudentName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                      >
                        <option value="">Selecione um aluno...</option>
                        {students.map((student, idx) => (
                          <option key={idx} value={student.name}>{student.name} ({student.email.split('@')[0]})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Atribuir à Tarefa</label>
                    {tasks.length === 0 ? (
                      <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-gray-150">Nenhuma tarefa cadastrada no Supabase.</p>
                    ) : (
                      <select
                        value={selectedTaskId}
                        onChange={(e) => setSelectedTaskId(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                      >
                        <option value="">Selecione a tarefa...</option>
                        {tasks.map((task) => (
                          <option key={task.id} value={task.id}>{task.title}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Tempo de Expiração</label>
                    <select
                      value={linkDuration}
                      onChange={(e) => setLinkDuration(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    >
                      <option value="1h">1 Hora (Segurança alta)</option>
                      <option value="4h">4 Horas</option>
                      <option value="1d">1 Dia</option>
                      <option value="1w">1 Semana</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingLink || !selectedStudentName}
                    className="w-full py-3 bg-[#635bfc] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-[#635bfc]/10 disabled:opacity-50"
                  >
                    {isCreatingLink ? 'Gerando Link...' : 'Gerar Chave e Link de Convite ⚡'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-2 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h4 className="font-extrabold text-sm text-emerald-800">Convite Gerado com Sucesso!</h4>
                    <p className="text-[10px] text-gray-500">Envie o código ou o link mágico abaixo para o aluno iniciar.</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center">
                      <div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Código Alfanumérico</span>
                        <strong className="text-sm font-mono text-gray-800 tracking-wider block mt-0.5">{generatedLinkInfo.code}</strong>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLinkInfo.code);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="p-2 hover:bg-gray-150 rounded-lg text-brand transition-colors border-none bg-transparent cursor-pointer"
                        title="Copiar Código"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex justify-between items-center">
                      <div className="min-w-0 flex-1">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-wider block">Link de Acesso Direto</span>
                        <span className="text-[11px] font-mono text-brand truncate block mt-0.5">{generatedLinkInfo.url}</span>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(generatedLinkInfo.url);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className="p-2 hover:bg-gray-150 rounded-lg text-brand transition-colors border-none bg-transparent cursor-pointer shrink-0"
                        title="Copiar Link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setGeneratedLinkInfo(null)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-none"
                  >
                    Gerar outro convite
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* MODAL: CRIAR TAREFA (Nova Lição)                      */}
      {/* ==================================================== */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-slate-900"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full relative z-10 shadow-2xl border border-gray-100 text-left space-y-4 overflow-y-auto max-h-[90vh] scrollbar-hide"
            >
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <h3 className="font-extrabold text-base text-gray-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand" />
                  <span>Cadastrar Nova Tarefa (Lição)</span>
                </h3>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-50 border-none bg-transparent cursor-pointer">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Título da Atividade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Alfabetização - Família Silábica"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Descrição / Instruções</label>
                  <textarea 
                    placeholder="Instruções para o aluno soletrar a palavra com os blocos..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white min-h-[80px]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Palavras-Alvo (Separadas por vírgula)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: BOLA, CASA, DADO"
                    value={taskWords}
                    onChange={(e) => setTaskWords(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Idioma Foco</label>
                    <select
                      value={taskLang}
                      onChange={(e) => setTaskLang(e.target.value as 'pt' | 'en' | 'de')}
                      className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    >
                      <option value="pt">Português 🇧🇷</option>
                      <option value="en">Inglês 🇺🇸</option>
                      <option value="de">Alemão 🇩🇪</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Prioridade</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as 'Alta' | 'Média' | 'Baixa')}
                      className="w-full bg-gray-50 border border-gray-200 py-2.5 px-3 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Prazo Final para Entrega</label>
                  <input 
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-xs text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="w-full py-3 bg-[#635bfc] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-md shadow-[#635bfc]/10 disabled:opacity-50"
                >
                  {isCreatingTask ? 'Salvando no Banco...' : 'Criar Lição Persistente 📝'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
