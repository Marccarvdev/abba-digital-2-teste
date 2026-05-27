import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Bell, User, BookOpen, Key, History, Plus, FileText, 
  CheckCircle, LogOut, Download, ExternalLink, Calendar, 
  ChevronRight, Award, Trash2, ShieldAlert
} from 'lucide-react';
import { User as UserType, TaskItem, StudentSubmission, AccessCode, SavedWord } from '../types';
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
  // Navigation / Tabs (Inbox = Submissions, AccessKeys = Links, Logs = actions log, Tasks = all tasks, Students = list students)
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'accessKeys' | 'logs' | 'tasks' | 'students'>('inbox');
  
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

  // Floating Sidebar Creator Drawer state
  const [drawerTab, setDrawerTab] = useState<'link' | 'task'>('link');
  
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
          expiresAt: Date.now() + 3600000, // Placeholder
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

      // Registrar código na lista de códigos local
      const localRegistry = JSON.parse(localStorage.getItem('abba_invite_codes_registry') || '[]');
      localRegistry.push(payload);
      localStorage.setItem('abba_invite_codes_registry', JSON.stringify(localRegistry));

      // Gerar link codificado
      const base64Str = btoa(unescape(encodeURIComponent(JSON.stringify({
        name: payload.name,
        expiresAt: payload.expiresAt,
        codeId: payload.id
      }))));

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

      fetchData(); // Recarregar dados

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

  // Obter cores para as linguagens
  const getLanguageDetails = (taskTitle: string) => {
    const titleLower = taskTitle.toLowerCase();
    if (titleLower.includes('alemão') || titleLower.includes('deutsch') || titleLower.includes('de')) {
      return { label: '#ALEMÃO', colorClass: 'from-amber-500 to-red-500 text-amber-200' };
    }
    if (titleLower.includes('inglês') || titleLower.includes('english') || titleLower.includes('en')) {
      return { label: '#INGLÊS', colorClass: 'from-cyan-500 to-blue-500 text-cyan-200' };
    }
    return { label: '#PORTUGUÊS', colorClass: 'from-purple-500 to-pink-500 text-purple-200' };
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 font-sans flex select-none selection:bg-purple-900 selection:text-purple-200 overflow-hidden">
      
      {/* 1. COLUNA: SIDEBAR (Menu minimalista escuro) */}
      <aside className="w-[280px] bg-[#0c0d1b]/90 border-r border-white/5 flex flex-col shrink-0 relative z-10">
        
        {/* Perfil do Professor */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
            <img 
              src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779573141/clipboard-image-1779573127_oef0qy.avif" 
              alt="Avatar" 
              className="w-11 h-11 rounded-full object-cover relative z-10 border border-white/10" 
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0c0d1b] z-20" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[14px] text-white truncate leading-tight">{user.name}</span>
            <span className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">Professor Administrador</span>
          </div>
        </div>

        {/* Logo ABBA */}
        <div className="px-6 py-4 flex items-center gap-3">
          <img 
            src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779315941/logoabra2_kls3we.svg" 
            alt="ABBA" 
            className="w-7 h-7 object-contain animate-pulse" 
          />
          <span className="font-extrabold text-[15px] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">ABBA DIGITAL</span>
        </div>

        {/* Menu de Pastas (Folders) */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <span className="px-3 text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Plataforma</span>
          
          <button
            onClick={() => setActiveFolder('inbox')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 font-medium text-xs ${
              activeFolder === 'inbox' 
                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border-l-[3px] border-pink-500 border border-white/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-[17px] h-[17px] shrink-0" />
              <span>Submissões de Alunos</span>
            </div>
            {submissions.length > 0 && (
              <span className="px-2 py-0.5 bg-pink-600/80 text-pink-100 text-[10px] font-bold rounded-full">{submissions.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveFolder('accessKeys')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 font-medium text-xs ${
              activeFolder === 'accessKeys' 
                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border-l-[3px] border-pink-500 border border-white/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Key className="w-[17px] h-[17px] shrink-0" />
              <span>Chaves de Acesso Ativas</span>
            </div>
            {activeCodes.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-full">{activeCodes.length}</span>
            )}
          </button>

          <button
            onClick={() => setActiveFolder('logs')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 font-medium text-xs ${
              activeFolder === 'logs' 
                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border-l-[3px] border-pink-500 border border-white/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-[17px] h-[17px] shrink-0" />
              <span>Registro de Ações</span>
            </div>
            {actionLogs.length > 0 && (
              <span className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-ping shrink-0" />
            )}
          </button>

          <button
            onClick={() => setActiveFolder('tasks')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 font-medium text-xs ${
              activeFolder === 'tasks' 
                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border-l-[3px] border-pink-500 border border-white/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-[17px] h-[17px] shrink-0" />
              <span>Tarefas Criadas</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">{tasks.length}</span>
          </button>

          <button
            onClick={() => setActiveFolder('students')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-300 font-medium text-xs ${
              activeFolder === 'students' 
                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-400 border-l-[3px] border-pink-500 border border-white/5' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <User className="w-[17px] h-[17px] shrink-0" />
              <span>Lista de Alunos</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-full">{students.length}</span>
          </button>

          {/* Seção Turmas */}
          <div className="pt-6">
            <span className="px-3 text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-2">Turmas ativas</span>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3.5 py-2.5 text-[11px] text-slate-400 font-semibold hover:text-slate-200 cursor-pointer rounded-xl hover:bg-white/5">
                <span className="flex items-center gap-2">📂 Turma A - 3º Ano</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-bold">12</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 text-[11px] text-slate-400 font-semibold hover:text-slate-200 cursor-pointer rounded-xl hover:bg-white/5">
                <span className="flex items-center gap-2">📂 Turma B - 4º Ano</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-bold">8</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer Sidebar (Voltar e Sair) */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <a
            href="/"
            className="w-full py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-2 font-bold text-xs bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white"
          >
            📋 Layout Clássico
          </a>
          
          <button
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* 2. COLUNA: INBOX / LISTA DE CARDS (Onde listamos submissões, tarefas, etc.) */}
      <section className="w-[380px] bg-[#090a14]/95 border-r border-white/5 flex flex-col shrink-0 relative z-10">
        
        {/* Barra superior de Busca */}
        <div className="p-5 border-b border-white/5 flex flex-col gap-4">
          <div className="relative flex items-center w-full group">
            <Search className="w-4.5 h-4.5 absolute left-4 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
            <input 
              type="text" 
              placeholder={`Buscar em ${activeFolder === 'inbox' ? 'submissões' : activeFolder === 'accessKeys' ? 'chaves' : activeFolder === 'tasks' ? 'tarefas' : 'logs'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121325]/80 border border-white/5 py-2.5 pl-11 pr-4 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all font-medium"
            />
          </div>

          {/* Abas de filtro rápidas (apenas se for inbox/submissões) */}
          {activeFolder === 'inbox' && (
            <div className="flex bg-[#121325]/85 border border-white/5 p-1 rounded-2xl">
              <button
                onClick={() => setFilterType('all')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer ${
                  filterType === 'all' ? 'bg-[#1a1b35] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer ${
                  filterType === 'pending' ? 'bg-[#1a1b35] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pendentes
              </button>
              <button
                onClick={() => setFilterType('evaluated')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-[10px] transition-all cursor-pointer ${
                  filterType === 'evaluated' ? 'bg-[#1a1b35] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Corrigidas
              </button>
            </div>
          )}
        </div>

        {/* Corpo da Lista */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
              <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] font-bold tracking-wider uppercase">Sincronizando Banco...</span>
            </div>
          ) : (
            <>
              {/* CASO A: FOLDER SUBMISSÕES (INBOX) */}
              {activeFolder === 'inbox' && (
                filteredSubmissions.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 italic text-xs">
                    Nenhuma submissão encontrada.
                  </div>
                ) : (
                  filteredSubmissions.map((sub) => {
                    const langDetails = getLanguageDetails(sub.taskTitle);
                    const isSelected = sub.id === selectedSubmissionId;
                    return (
                      <motion.div
                        key={`sub-${sub.id}`}
                        onClick={() => setSelectedSubmissionId(sub.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 text-left relative overflow-hidden group ${
                          isSelected 
                            ? 'bg-[#121327] border-purple-500/40 shadow-[0_8px_30px_rgb(168,85,247,0.06)]' 
                            : 'bg-[#131526]/40 border-white/5 hover:border-white/10 hover:bg-[#131526]/60'
                        }`}
                      >
                        {/* Indicador Ativo Lateral */}
                        {isSelected && (
                          <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
                        )}
                        
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="font-extrabold text-[13px] text-white truncate max-w-[70%] group-hover:text-pink-400 transition-colors">
                            {sub.studentName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold shrink-0">
                            {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-semibold truncate mb-3">
                          {sub.taskTitle}
                        </p>

                        <div className="flex justify-between items-center mt-2.5">
                          {/* Tag de Idioma Degradê */}
                          <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg bg-gradient-to-r shadow-xs ${langDetails.colorClass}`}>
                            {langDetails.label}
                          </span>

                          <span className="text-[10px] text-slate-500 font-semibold italic flex items-center gap-1">
                            {sub.spelledWords.length} palavras
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )
              )}

              {/* CASO B: FOLDER CHAVES DE ACESSO */}
              {activeFolder === 'accessKeys' && (
                activeCodes.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 italic text-xs">
                    Nenhuma chave de acesso ativa.
                  </div>
                ) : (
                  activeCodes
                    .filter(c => c.studentName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 rounded-3xl bg-[#131526]/40 border border-white/5 text-left flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <div>
                            <p className="font-extrabold text-[13px] text-white">{item.studentName}</p>
                            <p className="text-[10px] text-pink-400 font-mono tracking-widest font-bold mt-1">ABBA-{item.code}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteLink(item.code)}
                            className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg hover:text-red-300 transition-colors"
                            title="Apagar chave"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-3 pt-2 border-t border-white/5">
                          <span>Duração: {item.durationLabel}</span>
                          <span className="text-emerald-400 font-bold">Ativo ✓</span>
                        </div>
                      </div>
                    ))
                )
              )}

              {/* CASO C: FOLDER LOGS DE AÇÕES */}
              {activeFolder === 'logs' && (
                actionLogs.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 italic text-xs">
                    Nenhum log registrado.
                  </div>
                ) : (
                  actionLogs
                    .filter(l => l.student_name.toLowerCase().includes(searchQuery.toLowerCase()) || l.action_type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((log) => (
                      <div 
                        key={log.id} 
                        className="p-3.5 rounded-2xl bg-[#131526]/30 border border-white/5 text-left flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-[12px] text-white">{log.student_name}</span>
                          <span className="text-[9px] text-slate-500 font-semibold">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wide">
                          {log.action_type}
                        </span>
                        <p className="text-[10px] text-slate-400 leading-normal bg-black/20 p-2 rounded-lg mt-1 font-mono break-words max-h-24 overflow-y-auto">
                          {JSON.stringify(log.action_details)}
                        </p>
                      </div>
                    ))
                )
              )}

              {/* CASO D: FOLDER TAREFAS */}
              {activeFolder === 'tasks' && (
                tasks.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 italic text-xs">
                    Nenhuma tarefa criada.
                  </div>
                ) : (
                  tasks
                    .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((task) => (
                      <div 
                        key={task.id}
                        className="p-4 rounded-3xl bg-[#131526]/40 border border-white/5 text-left flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-extrabold text-[13px] text-white truncate max-w-[80%]">{task.title}</span>
                            <span className={`px-2 py-0.5 text-[8px] font-bold rounded ${
                              task.priority === 'Alta' ? 'bg-red-500/10 text-red-400' : task.priority === 'Média' ? 'bg-amber-500/10 text-amber-400' : 'bg-green-500/10 text-green-400'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed truncate">{task.description}</p>
                          
                          {/* Palavras-alvo */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {task.targetWords.map((w, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-[#121325] text-slate-300 rounded font-mono text-[9px] border border-white/5">
                                {w.word}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-4 pt-2 border-t border-white/5">
                          <span>Entrega: {task.dueDate}</span>
                          <span className="text-pink-400 uppercase tracking-widest text-[8px] font-black">{task.targetWords[0]?.language || 'pt'}</span>
                        </div>
                      </div>
                    ))
                )
              )}

              {/* CASO E: FOLDER LISTA DE ALUNOS */}
              {activeFolder === 'students' && (
                students.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 italic text-xs">
                    Nenhum aluno cadastrado.
                  </div>
                ) : (
                  students
                    .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((s) => {
                      const isSelected = s.id === selectedStudentId;
                      return (
                        <motion.div
                          key={`student-${s.id}`}
                          onClick={() => setSelectedStudentId(s.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 text-left relative overflow-hidden group ${
                            isSelected 
                              ? 'bg-[#121327] border-purple-500/40 shadow-[0_8px_30px_rgb(168,85,247,0.06)]' 
                              : 'bg-[#131526]/40 border-white/5 hover:border-white/10 hover:bg-[#131526]/60'
                          }`}
                        >
                          {/* Indicador Ativo Lateral */}
                          {isSelected && (
                            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
                          )}
                          
                          <div className="flex gap-3 items-center">
                            <img src={s.img} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            <div className="overflow-hidden flex-1">
                              <span className="font-extrabold text-[13px] text-white truncate block group-hover:text-pink-400 transition-colors">
                                {s.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                {s.class}
                              </span>
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
                              className="p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors border-none bg-transparent cursor-pointer shrink-0 z-30 flex items-center justify-center"
                              title="Excluir aluno permanentemente"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                )
              )}
            </>
          )}

        </div>
      </section>

      {/* 3. COLUNA: DETALHES DA SUBMISSÃO SELECIONADA */}
      <main className="flex-1 bg-[#06060c] flex flex-col min-w-0 relative z-10">
        
        {/* Cabeçalho do Detalhe (Barra superior de ações) */}
        <header className="h-[76px] px-6 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#06060c]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revisor de Aprendizado</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold text-slate-500">Última sincronização: Agora</span>
          </div>
        </header>

        {/* Visualização de Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left">
          
          <AnimatePresence mode="wait">
            {activeFolder === 'students' ? (
              !selectedStudent ? (
                <motion.div 
                  key="empty-student-detail"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-32 text-center text-slate-500 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-[#121325]/60 border border-white/5 flex items-center justify-center shadow-lg text-slate-400">
                    <User className="w-8 h-8 animate-pulse text-purple-400" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h4 className="font-bold text-[14px] text-white">Nenhum aluno selecionado</h4>
                    <p className="text-[11px] leading-relaxed text-slate-400">Escolha um aluno na lista ao lado para ver seu progresso, dados cadastrais e realizar ações de gerenciamento.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`student-detail-${selectedStudent.id}`}
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Perfil Header */}
                  <div className="p-6 rounded-3xl bg-[#131526]/40 border border-white/5 backdrop-blur-md flex flex-col md:flex-row items-center gap-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
                    
                    <img 
                      src={selectedStudent.img} 
                      alt={selectedStudent.name} 
                      className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/30 shadow-lg relative z-10" 
                    />
                    
                    <div className="flex-1 text-center md:text-left relative z-10">
                      <h3 className="font-extrabold text-xl text-white leading-tight">{selectedStudent.name}</h3>
                      <p className="text-xs text-purple-400 font-semibold mt-1">{selectedStudent.class}</p>
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-[10px] text-slate-400 font-semibold">
                        <span>Matrícula: <strong className="text-white">{selectedStudent.matricula}</strong></span>
                        <span>Sexo: <strong className="text-white">{selectedStudent.gender === 'F' ? 'Feminino' : 'Masculino'}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Acesso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-[#131526]/40 border border-white/5 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">Status de Acesso</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Método de Entrada:</span>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-lg font-bold text-[10px] capitalize">
                            {selectedStudent.loginMethod || 'Código'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Último Acesso:</span>
                          <span className="text-white font-semibold">
                            {selectedStudent.lastAccessAt 
                              ? new Date(selectedStudent.lastAccessAt).toLocaleString() 
                              : 'Sem registros'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">E-mail Cadastrado:</span>
                          <span className="text-pink-400 font-mono font-bold text-[11px] truncate max-w-[200px]" title={selectedStudent.email}>
                            {selectedStudent.email || 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-[#131526]/40 border border-white/5 space-y-4">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-white/5 pb-2">Desempenho Geral</h4>
                      
                      <div className="space-y-4 pt-1">
                        <div>
                          <div className="flex justify-between items-center text-xs mb-1.5">
                            <span className="text-slate-500 font-medium">Progresso das Atividades:</span>
                            <span className="text-white font-black">{selectedStudent.progress || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 transition-all duration-500" 
                              style={{ width: `${selectedStudent.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Nível Alcançado:</span>
                          <span className="px-2.5 py-0.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 font-black text-[9px] uppercase rounded-full">
                            {selectedStudent.progress >= 90 ? '🏆 Mestre' : selectedStudent.progress >= 70 ? '⭐️ Avançado' : selectedStudent.progress >= 50 ? '⚡️ Intermediário' : '🌱 Iniciante'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ação de Remoção Crítica */}
                  <div className="p-6 rounded-3xl bg-red-950/10 border border-red-900/20 space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-red-400">Área de Exclusão de Aluno</h4>
                        <p className="text-[10px] text-slate-400">Esta ação é permanente e removerá o cadastro do aluno bem como seus registros associados.</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        if (confirm(`Tem certeza de que deseja excluir permanentemente o aluno ${selectedStudent.name}?`)) {
                          try {
                            const { error } = await supabase.from('students').delete().eq('id', selectedStudent.id);
                            if (error) throw error;
                            setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
                            alert('Aluno excluído com sucesso! 🗑️');
                            setSelectedStudentId(null);
                          } catch (err) {
                            console.warn('Erro ao excluir no banco:', err);
                            setStudents(prev => prev.filter(student => student.id !== selectedStudent.id));
                            alert('Aluno removido localmente.');
                            setSelectedStudentId(null);
                          }
                        }
                      }}
                      className="w-full py-3 bg-red-950/40 hover:bg-red-950/60 border border-red-900/40 hover:border-red-500 text-red-400 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                    >
                      Excluir permanentemente {selectedStudent.name} 🗑️
                    </button>
                  </div>
                </motion.div>
              )
            ) : (
              !selectedSubmission ? (
                <motion.div 
                  key="empty-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-32 text-center text-slate-500 gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#121325]/60 border border-white/5 flex items-center justify-center shadow-lg text-slate-400">
                  <Award className="w-8 h-8 animate-bounce" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="font-bold text-[14px] text-white">Nenhuma atividade selecionada</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400">Escolha uma submissão de aluno na lista ao lado para corrigir a soletragem e acessar os arquivos anexados.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`detail-${selectedSubmission.id}`}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Cartão Informativo de Aluno */}
                <div className="p-6 rounded-3xl bg-[#121325]/40 border border-white/5 flex flex-wrap justify-between items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-b from-purple-500/10 to-transparent blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5 rounded-2xl shadow-lg shrink-0">
                      <div className="w-full h-full bg-[#121325] rounded-[14px] flex items-center justify-center text-white font-extrabold text-[16px]">
                        {selectedSubmission.studentName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white leading-tight">{selectedSubmission.studentName}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">E-mail: {selectedSubmission.studentEmail || 'estudante@email.com'}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-500 block">Enviado em</span>
                    <span className="font-bold text-xs text-slate-300 mt-1 block">
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString()} às {new Date(selectedSubmission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Arquivos Anexados (Supabase Storage) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    📁 Arquivos Anexos (Enviados no Storage)
                  </h4>
                  
                  {!selectedSubmission.taskFiles || selectedSubmission.taskFiles.length === 0 ? (
                    <div className="p-5 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 text-[11px] italic bg-[#121325]/10">
                      Nenhum arquivo enviado para esta atividade.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {selectedSubmission.taskFiles.map((file, i) => (
                        <div 
                          key={i} 
                          className="p-4 rounded-3xl bg-[#121325]/40 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[12px] text-white truncate leading-tight" title={file.name}>
                                {file.name}
                              </p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{file.size}</p>
                            </div>
                          </div>

                          {file.url ? (
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="px-3.5 py-1.5 rounded-xl bg-[#121325] border border-white/10 hover:border-white/20 active:scale-95 text-[10px] font-bold text-white transition-all flex items-center gap-1 shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Abrir</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold shrink-0">Local</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Palavras Soletradas no Ábaco */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    🔮 Histórico de Palavras Soletradas
                  </h4>

                  {selectedSubmission.spelledWords.length === 0 ? (
                    <div className="p-5 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 text-[11px] italic bg-[#121325]/10">
                      Nenhuma palavra soletrada disponível.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedSubmission.spelledWords.map((wordObj, i) => (
                        <div 
                          key={i} 
                          className="p-4 rounded-3xl bg-[#131526]/50 border border-white/5 flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4 overflow-hidden max-w-[80%]">
                            <span className="px-2.5 py-1 rounded bg-[#0b0c16] text-[#00AA6C] font-mono font-bold text-xs border border-white/5 uppercase">
                              {wordObj.word}
                            </span>
                            
                            {/* Visualizador dos blocos em miniatura */}
                            <div className="flex items-center gap-1 overflow-x-auto py-1 pr-4">
                              {wordObj.letters.map((l, slotIdx) => (
                                <div 
                                  key={slotIdx} 
                                  className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0"
                                  style={{
                                    backgroundColor: '#0c0d1b',
                                    borderColor: wordObj.themeColor || '#a855f7',
                                    color: wordObj.themeColor || '#a855f7'
                                  }}
                                >
                                  {l.letter}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div 
                            className="w-3.5 h-3.5 rounded-full border shrink-0" 
                            style={{ backgroundColor: wordObj.themeColor || '#a855f7', borderColor: 'rgba(255,255,255,0.1)' }} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão Gigante de Correção no Ábaco 3D */}
                <div className="pt-4 border-t border-white/5">
                  <button
                    onClick={() => onLaunchReviewMode(selectedSubmission)}
                    className="w-full py-4.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 rounded-3xl font-extrabold text-[13px] text-white shadow-2xl hover:shadow-purple-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">3d_rotation</span>
                    Iniciar Revisão no Ábaco 3D Real 🔮
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

        </div>
      </main>

      {/* 4. COLUNA / GAVETA GAVETAL LATERAL (Criar tarefa/link - Estilo Salesforce) */}
      <aside className="w-[340px] bg-[#0b0c16] border-l border-white/5 flex flex-col shrink-0 relative z-10 overflow-hidden">
        
        {/* Abas da Gaveta */}
        <div className="flex bg-[#0c0d1b] border-b border-white/5 p-1 shrink-0">
          <button
            onClick={() => setDrawerTab('link')}
            className={`flex-1 py-3.5 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none bg-transparent ${
              drawerTab === 'link' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Gerar Código</span>
          </button>
          <button
            onClick={() => setDrawerTab('task')}
            className={`flex-1 py-3.5 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none bg-transparent ${
              drawerTab === 'task' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Criar Tarefa</span>
          </button>
        </div>

        {/* Formulários */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar text-left">
          
          <AnimatePresence mode="wait">
            
            {/* ABA A: GERAR CHAVE DE ACESSO */}
            {drawerTab === 'link' && (
              <motion.form 
                key="form-link"
                onSubmit={handleGenerateLink}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Selecionar Estudante</label>
                  
                  {students.length === 0 ? (
                    <input 
                      type="text"
                      placeholder="Nome do Aluno (Ex: Leyton Graves)"
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                      className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                      required
                    />
                  ) : (
                    <select
                      value={selectedStudentName}
                      onChange={(e) => setSelectedStudentName(e.target.value)}
                      className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    >
                      {students.map((student, i) => (
                        <option key={i} value={student.name}>{student.name} ({student.email.split('@')[0]})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Atribuir à Tarefa</label>
                  {tasks.length === 0 ? (
                    <p className="text-[10px] text-slate-500 italic bg-white/5 p-2.5 rounded-lg border border-white/5">Nenhuma tarefa criada ainda.</p>
                  ) : (
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    >
                      {tasks.map((task) => (
                        <option key={task.id} value={task.id}>{task.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Expiração do Acesso</label>
                  <select
                    value={linkDuration}
                    onChange={(e) => setLinkDuration(e.target.value)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="1h">1 Hora (Segurança máxima)</option>
                    <option value="4h">4 Horas</option>
                    <option value="1d">1 Dia</option>
                    <option value="1w">1 Semana</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingLink || !selectedStudentName}
                  className="w-full py-3 bg-[#005bb3] hover:bg-[#00468c] disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  {isCreatingLink ? 'Gerando Link...' : 'Gerar Chave e Link 🔗'}
                </button>

                {/* Exibição do link gerado */}
                {generatedLinkInfo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#121325] border border-emerald-500/20 p-4.5 rounded-2xl mt-4 text-xs space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Código de Acesso Único</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 font-bold rounded">Criado</span>
                    </div>
                    <p className="font-mono text-center font-black text-lg py-2.5 bg-black/40 rounded-xl text-white tracking-widest uppercase">
                      {generatedLinkInfo.code}
                    </p>
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 block">Link Mágico:</span>
                      <input 
                        type="text" 
                        readOnly 
                        value={generatedLinkInfo.url}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        className="w-full bg-black/40 border border-white/5 py-1.5 px-3 rounded-lg text-[10px] font-mono text-slate-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedLinkInfo.url);
                        alert('Link de acesso copiado para a área de transferência! 📋');
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer border-none"
                    >
                      Copiar Link
                    </button>
                  </motion.div>
                )}
              </motion.form>
            )}

            {/* ABA B: CRIAR TAREFA */}
            {drawerTab === 'task' && (
              <motion.form 
                key="form-task"
                onSubmit={handleCreateTask}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Título da Atividade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Exercício de Numerais de 0 a 10"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Descrição</label>
                  <textarea 
                    placeholder="Instruções para o aluno (Ex: Soletrar os numerais no ábaco)"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium h-20 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Idioma Foco</label>
                  <select
                    value={taskLang}
                    onChange={(e) => setTaskLang(e.target.value as any)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="pt">Português (Preto)</option>
                    <option value="en">Inglês (Azul)</option>
                    <option value="de">Alemão (Vermelho)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Palavras-Alvo (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: DADO, BOLA, SOL"
                    value={taskWords}
                    onChange={(e) => setTaskWords(e.target.value)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Data Limite de Entrega</label>
                  <input 
                    type="date" 
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-4 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 ml-1">Prioridade</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full bg-[#121325]/80 border border-white/5 py-2.5 px-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="w-full py-3 bg-[#00aa6c] hover:bg-[#00925c] disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                >
                  {isCreatingTask ? 'Criando...' : 'Salvar e Publicar Tarefa 📝'}
                </button>
              </motion.form>
            )}

          </AnimatePresence>

        </div>
      </aside>

    </div>
  );
};
