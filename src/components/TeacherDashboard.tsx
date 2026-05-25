import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, TaskItem, StudentSubmission, AccessCode, SavedWord } from '../types';
import abbaLogo from '../assets/logo abba.svg';

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  onLaunchReviewMode: (submission: StudentSubmission) => void;
}

// Initial Mock Data
const INITIAL_STUDENTS = [
  { id: 'st-1', name: "Beatriz Silva", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150", progress: 85, matricula: '202401' },
  { id: 'st-2', name: "Carlos Eduardo", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150", progress: 60, matricula: '202402' },
  { id: 'st-3', name: "Daniela Santos", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150", progress: 95, matricula: '202403' },
  { id: 'st-4', name: "Enzo Ferreira", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150", progress: 40, matricula: '202404' },
  { id: 'st-5', name: "Fernanda Lima", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150", progress: 70, matricula: '202405' },
  { id: 'st-6', name: "Gabriel Souza", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=150&h=150", progress: 50, matricula: '202406' },
  { id: 'st-7', name: "Helena Rocha", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=150&h=150", progress: 90, matricula: '202407' },
  { id: 'st-8', name: "Igor Mendes", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150", progress: 30, matricula: '202408' },
  { id: 'st-9', name: "Julia Paiva", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1491349174775-aaafddd81942?auto=format&fit=crop&q=80&w=150&h=150", progress: 80, matricula: '202409' },
  { id: 'st-10', name: "Kevin Costa", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=150&h=150", progress: 65, matricula: '202410' },
  { id: 'st-11', name: "Lucas Oliveira", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150&h=150", progress: 75, matricula: '202411' },
  { id: 'st-12', name: "Mariana Costa", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150", progress: 88, matricula: '202412' },
  { id: 'st-13', name: "Nataniel Cruz", class: "Turma A - 3º Ano", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150", progress: 45, matricula: '202413' },
  { id: 'st-14', name: "Olivia Martins", class: "Turma B - 3º Ano", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150", progress: 92, matricula: '202414' },
  { id: 'st-15', name: "Pedro Henrique", class: "Turma C - 3º Ano", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150", progress: 55, matricula: '202415' }
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Exercício de Numerais Multilingue',
    description: 'Soletrar os numerais de 0 a 9 em Português, Inglês e Alemão usando as cores de fios correspondentes.',
    dueDate: '2026-06-15',
    status: 'active',
    targetWords: [
      { word: 'ZERO', language: 'pt', color: '#1e293b' },
      { word: 'UM', language: 'pt', color: '#1e293b' },
      { word: 'DOIS', language: 'pt', color: '#1e293b' },
      { word: 'THREE', language: 'en', color: '#3b82f6' },
      { word: 'FOUR', language: 'en', color: '#3b82f6' },
      { word: 'FIVE', language: 'en', color: '#3b82f6' },
      { word: 'SECHS', language: 'de', color: '#ef4444' },
      { word: 'SIEBEN', language: 'de', color: '#ef4444' },
      { word: 'ACHT', language: 'de', color: '#ef4444' }
    ],
    submissionsCount: 15
  },
  {
    id: 'task-2',
    title: 'Gramática Básica - Unidade 4',
    description: 'Exercícios práticos de tempos verbais e estruturação de frases no idioma nativo.',
    dueDate: '2026-06-25',
    status: 'draft',
    targetWords: [
      { word: 'ESTUDAR', language: 'pt', color: '#1e293b' },
      { word: 'APRENDER', language: 'pt', color: '#1e293b' }
    ],
    submissionsCount: 0
  },
  {
    id: 'task-3',
    title: 'História das Civilizações',
    description: 'Soletrar conceitos-chave do surgimento das sociedades clássicas.',
    dueDate: '2026-06-28',
    status: 'active',
    targetWords: [
      { word: 'ROMA', language: 'pt', color: '#1e293b' },
      { word: 'ATENAS', language: 'pt', color: '#1e293b' }
    ],
    submissionsCount: 8
  },
  {
    id: 'task-4',
    title: 'Revisão de Verbos Irregulares',
    description: 'Atividade concluída de conjugação de verbos em múltiplos idiomas.',
    dueDate: '2026-05-10',
    status: 'completed',
    targetWords: [
      { word: 'BE', language: 'en', color: '#3b82f6' },
      { word: 'HAVE', language: 'en', color: '#3b82f6' }
    ],
    submissionsCount: 20
  },
  {
    id: 'task-5',
    title: 'Cálculo Diferencial Avançado',
    description: 'Montar os símbolos fundamentais de cálculo no ábaco numérico.',
    dueDate: '2026-07-02',
    status: 'active',
    targetWords: [
      { word: 'LIMITE', language: 'pt', color: '#1e293b' },
      { word: 'DERIVADA', language: 'pt', color: '#1e293b' }
    ],
    submissionsCount: 19
  }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-1',
    studentName: 'Beatriz Silva',
    taskTitle: 'Exercício de Numerais Multilingue',
    submittedAt: '2026-05-23T14:30:00Z',
    spelledWords: [
      {
        word: 'ZERO',
        letters: [
          { id: 'l1', letter: 'Z', originCubeId: 'cube-z', color: '#1e293b' },
          { id: 'l2', letter: 'E', originCubeId: 'cube-e', color: '#1e293b' },
          { id: 'l3', letter: 'R', originCubeId: 'cube-r', color: '#1e293b' },
          { id: 'l4', letter: 'O', originCubeId: 'cube-o', color: '#1e293b' }
        ],
        themeColor: '#1e293b'
      },
      {
        word: 'THREE',
        letters: [
          { id: 'l5', letter: 'T', originCubeId: 'cube-t', color: '#3b82f6' },
          { id: 'l6', letter: 'H', originCubeId: 'cube-h', color: '#3b82f6' },
          { id: 'l7', letter: 'R', originCubeId: 'cube-r', color: '#3b82f6' },
          { id: 'l8', letter: 'E', originCubeId: 'cube-e', color: '#3b82f6' },
          { id: 'l9', letter: 'E', originCubeId: 'cube-e', color: '#3b82f6' }
        ],
        themeColor: '#3b82f6'
      }
    ]
  },
  {
    id: 'sub-2',
    studentName: 'Carlos Eduardo',
    taskTitle: 'Exercício de Numerais Multilingue',
    submittedAt: '2026-05-24T10:15:00Z',
    spelledWords: [
      {
        word: 'UM',
        letters: [
          { id: 'l10', letter: 'U', originCubeId: 'cube-u', color: '#1e293b' },
          { id: 'l11', letter: 'M', originCubeId: 'cube-m', color: '#1e293b' }
        ],
        themeColor: '#1e293b'
      }
    ]
  }
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout, onLaunchReviewMode }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'students' | 'access'>('home');
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const local = localStorage.getItem('abba_teacher_tasks');
    return local ? JSON.parse(local) : INITIAL_TASKS;
  });
  
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    const local = localStorage.getItem('abba_student_submissions');
    return local ? JSON.parse(local) : INITIAL_SUBMISSIONS;
  });

  // Access Code Generation States
  const [studentNameInput, setStudentNameInput] = useState('');
  const [duration, setDuration] = useState('1h'); // 1h, 4h, 1d, 1w, custom
  const [customExpiryDate, setCustomExpiryDate] = useState('2026-12-31');
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedBase64, setGeneratedBase64] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [activeCodes, setActiveCodes] = useState<AccessCode[]>(() => {
    const local = localStorage.getItem('abba_active_codes');
    return local ? JSON.parse(local) : [];
  });

  // Checkbox Student Selector States
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentsFilter, setStudentsFilter] = useState<'all' | 'completed' | 'pending' | 'inprogress'>('all');
  const [studentsLimit, setStudentsLimit] = useState(6);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('Turma A - 3º Ano');
  const [newStudentProgress, setNewStudentProgress] = useState(0);

  // Modals for Cloud Save and Batch Delete
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudentIdsSave, setSelectedStudentIdsSave] = useState<string[]>([]);
  const [selectedStudentIdsDelete, setSelectedStudentIdsDelete] = useState<string[]>([]);

  // Add Task Modal State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-06-30');
  const [newTaskWords, setNewTaskWords] = useState<{ word: string; language: 'pt' | 'en' | 'de'; color: string }[]>([
    { word: 'CASA', language: 'pt', color: '#1e293b' }
  ]);

  const [isAssignStudentsOpen, setIsAssignStudentsOpen] = useState(false);
  const [tempCreatedTask, setTempCreatedTask] = useState<TaskItem | null>(null);
  const [newTaskTeacherNote, setNewTaskTeacherNote] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState('2026-05-24');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [addTaskStudentSearchQuery, setAddTaskStudentSearchQuery] = useState('');
  const [addTaskFile, setAddTaskFile] = useState<File | null>(null);
  const addTaskFileInputRef = useRef<HTMLInputElement | null>(null);

  // States for Task Editing Modal (matches requested high-fidelity markup)
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [editTaskAssignedStudentIds, setEditTaskAssignedStudentIds] = useState<string[]>([]);
  const [showEditAssignPanel, setShowEditAssignPanel] = useState(false);
  const [editTaskStudentSearchQuery, setEditTaskStudentSearchQuery] = useState('');
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);
  const [detailsStudentSearchQuery, setDetailsStudentSearchQuery] = useState('');
  const [detailsStudentPage, setDetailsStudentPage] = useState(1);

  const handleAddTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImage && !isPdf) {
        alert('Por favor, selecione apenas arquivos de imagem ou PDF.');
        return;
      }
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('O arquivo selecionado excede o limite de tamanho de 5MB.');
        return;
      }
      setAddTaskFile(file);
      alert(`Arquivo "${file.name}" anexado com sucesso!`);
    }
  };

  // Leave students unchecked by default when the Add Task Modal opens
  useEffect(() => {
    if (isAddTaskOpen) {
      setSelectedStudentIds([]);
      setAddTaskStudentSearchQuery('');
      setAddTaskFile(null);
    }
  }, [isAddTaskOpen]);

  // Sync editing task states when selection changes
  useEffect(() => {
    if (editingTask) {
      setEditTaskTitle(editingTask.title);
      setEditTaskDueDate(editingTask.dueDate);
      setEditTaskDescription(editingTask.description);
      setEditTaskPriority(editingTask.priority || 'Alta');
      setEditTaskAssignedStudentIds(editingTask.assignedStudentIds || []);
      setShowEditAssignPanel(false);
      setEditTaskStudentSearchQuery('');
      setIsDetailEditMode(false);
      setDetailsStudentSearchQuery('');
      setDetailsStudentPage(1);
    }
  }, [editingTask]);

  // Stateful Bento Grid & Details parameters
  const [tasksFilter, setTasksFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [tasksPage, setTasksPage] = useState(1);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<TaskItem | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = useState('');

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('abba_teacher_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('abba_active_codes', JSON.stringify(activeCodes));
  }, [activeCodes]);

  const handleGenerateCode = () => {
    if (!studentNameInput.trim()) {
      alert('Por favor, informe o nome do aluno.');
      return;
    }

    const name = studentNameInput.trim();
    let durationMs = 0;
    let durationLabel = '';

    if (duration === '1h') {
      durationMs = 60 * 60 * 1000;
      durationLabel = '1 Hora';
    } else if (duration === '4h') {
      durationMs = 4 * 60 * 60 * 1000;
      durationLabel = '4 Horas';
    } else if (duration === '1d') {
      durationMs = 24 * 60 * 60 * 1000;
      durationLabel = '1 Dia';
    } else if (duration === '1w') {
      durationMs = 7 * 24 * 60 * 60 * 1000;
      durationLabel = '1 Semana';
    } else {
      const parts = customExpiryDate.split('-');
      const expDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 23, 59, 59);
      durationMs = expDate.getTime() - Date.now();
      durationLabel = `Até ${customExpiryDate}`;
    }

    const expiresAt = Date.now() + durationMs;
    const codeId = Math.random().toString(36).substring(2, 9).toUpperCase();

    // Create Base64 Token
    const payload = {
      name,
      role: 'student',
      expiresAt,
      codeId
    };

    const token = 'ABBA-' + btoa(JSON.stringify(payload));
    
    // Display code as readable key for presentation but copy the full token
    const friendlyCode = `ABBA-${codeId}-${name.split(' ')[0].toUpperCase()}`;

    const newCodeItem: AccessCode = {
      id: codeId,
      code: token,
      studentName: name,
      expiresAt,
      durationLabel,
      status: 'active'
    };

    setActiveCodes([newCodeItem, ...activeCodes]);
    setGeneratedCode(friendlyCode);
    setGeneratedBase64(token);
    setStudentNameInput('');
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Student Select logic
  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      const filtered = students.filter(s => 
        s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
        s.class.toLowerCase().includes(studentSearchQuery.toLowerCase())
      );
      setSelectedStudentIds(filtered.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds([...selectedStudentIds, id]);
    } else {
      setSelectedStudentIds(selectedStudentIds.filter(sid => sid !== id));
    }
  };

  // Add word helper in Add Task
  const handleAddWordToNewTask = () => {
    setNewTaskWords([...newTaskWords, { word: '', language: 'pt', color: '#1e293b' }]);
  };

  const handleRemoveWordFromNewTask = (index: number) => {
    setNewTaskWords(newTaskWords.filter((_, idx) => idx !== index));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDesc.trim()) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const cleanWords = newTaskWords
      .filter(w => w.word.trim().length > 0)
      .map(w => ({
        word: w.word.trim().toUpperCase(),
        language: w.language,
        color: w.color
      }));

    if (cleanWords.length === 0) {
      alert('Adicione pelo menos uma palavra para a tarefa.');
      return;
    }

    const newTaskItem: TaskItem = {
      id: 'task-' + Math.random().toString(36).substring(2, 9),
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      dueDate: newTaskDueDate,
      status: 'active',
      targetWords: cleanWords,
      submissionsCount: 0,
      startDate: newTaskStartDate,
      teacherNote: newTaskTeacherNote.trim() || undefined
    };

    setTasks(prev => [newTaskItem, ...prev]);
    setIsAddTaskOpen(false);
    alert(`Tarefa "${newTaskItem.title}" criada e atribuída com sucesso para ${selectedStudentIds.length} alunos! 🚀`);

    // Reset Form
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskTeacherNote('');
    setNewTaskStartDate('2026-05-24');
    setNewTaskDueDate('2026-06-30');
    setNewTaskWords([{ word: 'CASA', language: 'pt', color: '#1e293b' }]);
  };

  const filteredStudentsForGrid = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
                          s.class.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                          (s.name.toLowerCase().replace(' ', '.') + '@email.com').includes(studentSearchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (studentsFilter === 'completed') return s.progress === 100;
    if (studentsFilter === 'pending') return s.progress < 50;
    if (studentsFilter === 'inprogress') return s.progress >= 50 && s.progress < 100;
    return true;
  });

  const [selectedStudentIdsGrid, setSelectedStudentIdsGrid] = useState<string[]>([]);

  const handleCloudSync = () => {
    setSelectedStudentIdsSave(students.map(s => s.id));
    setIsSaveModalOpen(true);
  };

  const handleDeleteSelected = () => {
    setSelectedStudentIdsDelete(selectedStudentIdsGrid);
    setIsDeleteModalOpen(true);
  };

  const toggleSelectStudentGrid = (id: string) => {
    setSelectedStudentIdsGrid(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter and paginated tasks logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(taskSearchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (tasksFilter === 'all') return true;
    if (tasksFilter === 'active') return task.status === 'active';
    if (tasksFilter === 'draft') return task.status === 'draft';
    if (tasksFilter === 'archived') return task.status === 'completed';
    return true;
  });

  const TASKS_PER_PAGE = 5;
  const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE) || 1;
  const startIndex = (tasksPage - 1) * TASKS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + TASKS_PER_PAGE);

  return (
    <div className="min-h-screen bg-surface text-on-background flex flex-col font-sans">
      
      {/* Side Navigation Bar */}
      <aside className="fixed left-0 top-0 bottom-0 flex flex-col p-md z-40 bg-surface-container-low border-r border-outline-variant h-screen w-64">
        <div className="flex items-center gap-sm mb-xl px-sm">
          <img src={abbaLogo} alt="ABBA DIGITAL Logo" className="w-9 h-9 object-contain shrink-0" />
          <div>
            <h1 className="font-headline-md text-headline-md font-black text-on-surface tracking-tight">ABBA DIGITAL</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Portal da Educação</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-all font-label-md text-label-md cursor-pointer ${
              activeTab === 'home'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">home</span>Inicio
          </button>
          
          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-all font-label-md text-label-md cursor-pointer ${
              activeTab === 'students'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">group</span>Alunos
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-all font-label-md text-label-md cursor-pointer ${
              activeTab === 'tasks'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">assignment</span>Tarefas
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`w-full flex items-center gap-md px-md py-sm rounded-lg transition-all font-label-md text-label-md cursor-pointer ${
              activeTab === 'access'
                ? 'bg-primary-container text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>Acessos
          </button>
        </nav>
        
        <div className="mt-auto space-y-xs">
          <button
            onClick={() => alert('Para obter ajuda, entre em contato em suporte@abbadigital.com')}
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all font-label-md text-label-md text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">help</span>
            Ajuda
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-md px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all font-label-md text-label-md text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Top App Bar - Identical to Student Dashboard */}
        <header className="flex items-center justify-between px-margin-desktop w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md h-16 border-b border-outline-variant">
          <div className="flex items-center gap-md flex-1">
            <h2 className="font-title-md text-title-md text-slate-800 font-extrabold md:block hidden">Área do Professor</h2>
          </div>
          
          <div className="flex items-center gap-md">
            {activeTab === 'students' && (
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => setIsAddStudentOpen(true)}
                  className="bg-primary text-on-primary px-4 py-1.5 rounded-full font-label-md text-label-md flex items-center gap-sm hover:opacity-90 active:scale-95 transition-all shadow-sm border-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  Adicionar Aluno
                </button>
                <button 
                  onClick={handleCloudSync}
                  className="p-1.5 bg-surface-container-high text-primary rounded-full hover:bg-primary-container/10 transition-all shadow-sm flex items-center justify-center border-none cursor-pointer active:scale-95" 
                  title="Nuvem"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud</span>
                </button>
                <button 
                  onClick={handleDeleteSelected}
                  className="p-1.5 bg-surface-container-high text-error rounded-full hover:bg-error-container transition-all shadow-sm flex items-center justify-center border-none cursor-pointer active:scale-95" 
                  title="Excluir Selecionados"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            )}

            <button 
              onClick={() => alert('Nenhuma notificação nova no momento.')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors relative cursor-pointer bg-transparent border-none"
              title="Notificações"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-tertiary rounded-full"></span>
            </button>
            
            <button 
              onClick={() => alert('Configurações do painel do professor')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer bg-transparent border-none"
              title="Configurações"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            
            <div className="w-px h-6 bg-outline-variant mx-xs"></div>

            {/* Profile Avatar + Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(prev => !prev)}
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer p-0 bg-transparent outline-none ring-0 focus:outline-none flex items-center justify-center"
                title="Perfil"
              >
                <img
                  alt={`${user.name} Avatar`}
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFglNNrbUVhLI4jVpxuIpCzpHrDsFs3-5yWZKyg2YmaJLhlq0-vJzzjFo1kJPLT3M1SRSUkXCVB8HL1GlLR1fA2eLLinUqMpKgIZkH5zyH5NqJtLipvICB8BuKnAZRnj7zY74zzuRSyGwf7XxHDwFjLz8SZTZhz4cXeZNtS8af-VkIwwQVHcxn94y9hlSvTqpmhfpBsA0OtQer6mb5eADOLH6ey3YByVEPnNMaAv_D4SQxSceGiLApcsmAfp9HgBZfNY8oVLWbuenB"
                />
              </button>

              {showProfileMenu && (
                <>
                  {/* Click-away backdrop */}
                  <div
                    className="fixed inset-0 z-[200]"
                    onClick={() => setShowProfileMenu(false)}
                  />

                  {/* Dropdown panel — Light Theme */}
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[300] w-72 bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in border border-slate-200">
                    {/* Header strip */}
                    <div className="bg-slate-50 px-5 py-4 flex items-center gap-3 border-b border-slate-100">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shrink-0">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFglNNrbUVhLI4jVpxuIpCzpHrDsFs3-5yWZKyg2YmaJLhlq0-vJzzjFo1kJPLT3M1SRSUkXCVB8HL1GlLR1fA2eLLinUqMpKgIZkH5zyH5NqJtLipvICB8BuKnAZRnj7zY74zzuRSyGwf7XxHDwFjLz8SZTZhz4cXeZNtS8af-VkIwwQVHcxn94y9hlSvTqpmhfpBsA0OtQer6mb5eADOLH6ey3YByVEPnNMaAv_D4SQxSceGiLApcsmAfp9HgBZfNY8oVLWbuenB"
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-slate-400 leading-tight">{user.email || 'professor@abba.com'}</p>
                      </div>
                    </div>

                    {/* Info section label */}
                    <div className="px-5 pt-4 pb-1 flex items-center gap-2">
                      <img src={abbaLogo} alt="ABBA" className="w-4 h-4 object-contain" />
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">ABBA DIGITAL</p>
                    </div>

                    {/* Info card */}
                    <div className="mx-4 mb-4 mt-2 bg-slate-50 rounded-xl p-3 border border-slate-200 text-left">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Função: Professor</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Matemática &amp; Idiomas</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        Gerencie tarefas, atribua atividades e acompanhe o progresso de alfabetização digital dos seus alunos.
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Actions */}
                    <div className="px-4 py-3 flex flex-col gap-1">
                      <button
                        onClick={() => { setShowProfileMenu(false); alert('Funcionalidade de edição de perfil em breve!'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer bg-transparent border-none text-left"
                      >
                        <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                        Editar Perfil
                      </button>
                      <button
                        onClick={() => { setShowProfileMenu(false); onLogout(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none text-left"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Sair da conta
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-margin-desktop max-w-[1200px] mx-auto w-full flex-1">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#131b2e]">Bem-vindo de volta, {user.name.split(' ')[0]}! 👋</h2>
                  <p className="text-xs text-slate-500 mt-1">Aqui está a visão geral da alfabetização bilíngue de suas turmas.</p>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-[#005bb3] hover:bg-[#00468c] text-white text-xs font-bold rounded-xl transition-all shadow shadow-[#005bb3]/20 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Adicionar Tarefa
                </button>
              </div>

              {/* Bento Grid Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">group</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#131b2e]">{students.length}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alunos Ativos</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">assignment</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#131b2e]">{tasks.length}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarefas Totais</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">pending_actions</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#131b2e]">{submissions.length}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entregas Pendentes</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">verified_user</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#131b2e]">
                      {activeCodes.filter(c => c.expiresAt > Date.now()).length}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Códigos Ativos</p>
                  </div>
                </div>
              </div>

              {/* Submissions Section */}
              <div className="bg-white rounded-2xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#dde0e2]">
                  <h3 className="font-extrabold text-lg">Submissões Recentes dos Alunos</h3>
                  <p className="text-xs text-slate-400">Clique em Revisar para abrir a simulação tridimensional do ábaco</p>
                </div>
                <div className="divide-y divide-[#dde0e2]">
                  {submissions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Nenhuma submissão recebida até o momento.
                    </div>
                  ) : (
                    submissions.map((sub, idx) => (
                      <div key={sub.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#f2f3ff] transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#eaedff] text-[#005bb3] flex items-center justify-center font-bold">
                            {sub.studentName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold">{sub.studentName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{sub.taskTitle} • {new Date(sub.submittedAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-50 text-[#005bb3] text-[10px] font-bold rounded-full">
                            {sub.spelledWords.length} Palavras
                          </span>
                          <button
                            onClick={() => onLaunchReviewMode(sub)}
                            className="flex items-center gap-1.5 px-4 py-2 border border-[#005bb3] text-[#005bb3] hover:bg-[#005bb3] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            Revisar Ábaco
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-xl animate-fade-in">
              <div className="flex items-center justify-between mb-xl">
                <div>
                 <h1 className="font-headline-lg text-headline-lg text-on-surface">Minhas Tarefas</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Gerencie e acompanhe o progresso das atividades enviadas.</p>
                </div>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="flex items-center gap-sm px-lg py-md bg-primary text-on-primary rounded-xl font-label-md text-label-md hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                  Nova Tarefa
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-md mb-xl border-b border-outline-variant">
                <button
                  onClick={() => { setTasksFilter('all'); setTasksPage(1); }}
                  className={`px-md py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
                    tasksFilter === 'all'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => { setTasksFilter('active'); setTasksPage(1); }}
                  className={`px-md py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
                    tasksFilter === 'active'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Ativas
                </button>
                <button
                  onClick={() => { setTasksFilter('draft'); setTasksPage(1); }}
                  className={`px-md py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
                    tasksFilter === 'draft'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Rascunhos
                </button>
                <button
                  onClick={() => { setTasksFilter('archived'); setTasksPage(1); }}
                  className={`px-md py-sm font-label-md text-label-md border-b-2 transition-all cursor-pointer ${
                    tasksFilter === 'archived'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Arquivadas
                </button>
              </div>

              {/* Bento Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {/* Create New Task Card - Only visible when filter is 'all' or 'draft' or on first page */}
                {tasksPage === 1 && (tasksFilter === 'all' || tasksFilter === 'draft') && (
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-xl bg-surface-container-lowest hover:bg-surface-container-low hover:border-primary transition-all group min-h-[280px] cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">add_task</span>
                    </div>
                    <span className="font-headline-md text-headline-md text-on-surface">Criar nova tarefa</span>
                    <span className="font-body-md text-body-md text-on-surface-variant mt-xs">Clique para iniciar uma nova atividade</span>
                  </button>
                )}

                {/* Paginated Tasks list */}
                {paginatedTasks.length === 0 ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 text-sm bg-white rounded-2xl border border-outline-variant p-6">
                    <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">layers_clear</span>
                    Nenhuma tarefa encontrada neste filtro.
                  </div>
                ) : (
                  paginatedTasks.map(task => {
                    const isArchived = task.status === 'completed';
                    const isDraft = task.status === 'draft';
                    const isActive = task.status === 'active';

                    if (isArchived) {
                      return (
                        <div
                          key={task.id}
                          className="bg-white/60 rounded-xl border border-outline-variant p-lg card-shadow flex flex-col justify-between min-h-[280px] hover:shadow-md hover:translate-y-[-4px] transition-all duration-200"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-md">
                              <span className="px-sm py-xs bg-surface-container-high text-on-surface-variant rounded-lg font-label-sm text-label-sm">
                                Arquivada
                              </span>
                            </div>
                            <h3 className="font-headline-md text-headline-md text-on-surface-variant/80 mb-xs line-through">
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-xs text-on-surface-variant/60 mb-md">
                              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                              <span className="font-label-sm text-label-sm">Finalizada em Setembro</span>
                            </div>
                          </div>
                          <div className="space-y-md">
                            <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                              <span>Relatório Final Gerado</span>
                              <span className="material-symbols-outlined text-green-600">check_circle</span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = tasks.map(t => t.id === task.id ? { ...t, status: 'active' as const } : t);
                                setTasks(updated);
                                alert(`Tarefa "${task.title}" reativada com sucesso! 🚀`);
                              }}
                              className="w-full py-sm border border-outline text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors cursor-pointer"
                            >
                              Reativar
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (isDraft) {
                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl border border-outline-variant p-lg card-shadow flex flex-col justify-between min-h-[280px] hover:border-primary/30 hover:translate-y-[-4px] transition-all duration-200"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-md">
                              <span className="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-lg font-label-sm text-label-sm">
                                Rascunho
                              </span>
                              <button
                                onClick={() => setEditingTask(task)}
                                className="text-on-surface-variant hover:text-primary cursor-pointer"
                              >
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                            </div>
                            <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{task.title}</h3>
                            <div className="flex items-center gap-xs text-on-surface-variant mb-md">
                              <span className="material-symbols-outlined text-[18px]">history</span>
                              <span className="font-label-sm text-label-sm">Aguardando publicação</span>
                            </div>
                          </div>
                          <div className="space-y-md">
                            <div className="p-md bg-surface-container-low rounded-lg text-center">
                              <p className="font-body-md text-body-md text-on-surface-variant italic">Aguardando publicação</p>
                            </div>
                            <button
                              onClick={() => {
                                const updated = tasks.map(t => t.id === task.id ? { ...t, status: 'active' as const } : t);
                                setTasks(updated);
                                alert(`Tarefa "${task.title}" publicada com sucesso! 📡`);
                              }}
                              className="w-full py-sm border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                              Retomar Edição
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Active state (Ativa)
                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-xl border border-outline-variant p-lg card-shadow flex flex-col justify-between min-h-[280px] hover:border-primary/50 transition-all hover:translate-y-[-4px] duration-200"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-md">
                            <span className="px-sm py-xs bg-primary-container/20 text-on-primary-fixed-variant rounded-lg font-label-sm text-label-sm flex items-center gap-xs">
                              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                              Ativa
                            </span>
                            <button
                              onClick={() => setEditingTask(task)}
                              className="text-on-surface-variant hover:text-primary cursor-pointer"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                          </div>
                          <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{task.title}</h3>
                          <div className="flex items-center gap-xs text-on-surface-variant mb-md">
                            <span className="material-symbols-outlined text-[18px]">event</span>
                            <span className="font-label-sm text-label-sm">Entrega: {task.dueDate}</span>
                          </div>
                        </div>
                        <div className="space-y-md">
                          <div className="space-y-xs">
                            <div className="flex justify-between font-label-sm text-label-sm">
                              <span className="text-on-surface-variant">Progresso de Entrega</span>
                              <span className="text-primary font-bold">{(task.submissionsCount ?? 0)}/20 Alunos</span>
                            </div>
                            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(100, ((task.submissionsCount ?? 0) / 20) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedTaskDetails(task)}
                            className="w-full py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {filteredTasks.length > 0 && (
                <div className="mt-xl flex items-center justify-between py-md border-t border-outline-variant">
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Mostrando {Math.min(filteredTasks.length, TASKS_PER_PAGE * tasksPage)} de {filteredTasks.length} tarefas
                  </p>
                  <div className="flex items-center gap-sm">
                    <button
                      onClick={() => setTasksPage(prev => Math.max(1, prev - 1))}
                      disabled={tasksPage === 1}
                      className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex items-center gap-xs">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTasksPage(i + 1)}
                          className={`w-10 h-10 rounded-lg font-label-md text-label-md cursor-pointer transition-colors ${
                            tasksPage === i + 1
                              ? 'bg-primary text-on-primary font-bold'
                              : 'hover:bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setTasksPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={tasksPage === totalPages}
                      className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-background">Alunos</h2>
                <p className="text-on-surface-variant font-label-sm text-label-sm">Gerencie seus estudantes e acompanhe o progresso individual.</p>
              </div>

              {/* Filters & Stats Chips */}
              <div className="flex flex-wrap items-center gap-sm mb-lg">
                <button 
                  onClick={() => { setStudentsFilter('all'); setStudentsLimit(6); }}
                  className={`px-md py-xs rounded-full font-label-sm text-label-sm border-none cursor-pointer transition-colors duration-150 ${
                    studentsFilter === 'all' 
                      ? 'bg-on-background text-surface font-bold shadow-sm' 
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'
                  }`}
                >
                  Todos ({students.length})
                </button>
                <button 
                  onClick={() => { setStudentsFilter('completed'); setStudentsLimit(6); }}
                  className={`px-md py-xs rounded-full font-label-sm text-label-sm border-none cursor-pointer transition-colors duration-150 ${
                    studentsFilter === 'completed' 
                      ? 'bg-green-600 text-white font-bold shadow-sm' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  Concluídos ({students.filter(s => s.progress === 100).length})
                </button>
                <button 
                  onClick={() => { setStudentsFilter('pending'); setStudentsLimit(6); }}
                  className={`px-md py-xs rounded-full font-label-sm text-label-sm border-none cursor-pointer transition-colors duration-150 ${
                    studentsFilter === 'pending' 
                      ? 'bg-red-500 text-white font-bold shadow-sm' 
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-outline-variant'
                  }`}
                >
                  Pendentes ({students.filter(s => s.progress < 50).length})
                </button>
                <button 
                  onClick={() => { setStudentsFilter('inprogress'); setStudentsLimit(6); }}
                  className={`px-md py-xs rounded-full font-label-sm text-label-sm border-none cursor-pointer transition-colors duration-150 ${
                    studentsFilter === 'inprogress' 
                      ? 'bg-blue-600 text-white font-bold shadow-sm' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Concluindo ({students.filter(s => s.progress >= 50 && s.progress < 100).length})
                </button>
              </div>

              {/* Bento Grid / Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {filteredStudentsForGrid.slice(0, studentsLimit).map(student => {
                  const studentEmail = `${student.name.toLowerCase().replace(/\s+/g, '.')}@email.com`;
                  const isDone = student.progress === 100;
                  const isWaiting = student.progress < 50;

                  return (
                    <div 
                      key={student.id} 
                      className="student-card bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:translate-y-[-2px] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-md">
                        <div className="flex items-center gap-md">
                          {/* Circular Selection Checkbox */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectStudentGrid(student.id);
                            }}
                            className={`w-5 h-5 rounded-full flex items-center justify-center cursor-pointer border transition-all shrink-0 ${
                              selectedStudentIdsGrid.includes(student.id)
                                ? 'bg-primary border-primary text-white shadow-sm'
                                : 'border-[#c1c6d6] bg-white text-transparent hover:border-primary'
                            }`}
                            title="Selecionar aluno"
                          >
                            <span className="material-symbols-outlined text-[12px] font-black select-none">check</span>
                          </div>

                          <img 
                            src={student.img} 
                            alt={student.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-surface-container-high"
                          />
                          <div>
                            <h3 className="font-headline-md text-body-lg font-bold text-on-background">{student.name}</h3>
                            <p className="text-outline font-label-sm text-label-sm">{studentEmail}</p>
                          </div>
                        </div>

                        {isDone ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check_circle
                            </span>
                          </span>
                        ) : isWaiting ? (
                          <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                            report_problem
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>
                            schedule
                          </span>
                        )}
                      </div>

                      <div className={`rounded-lg p-md mb-lg ${isDone ? 'bg-green-100' : 'bg-surface-container-low'}`}>
                        <div className="flex justify-between items-end mb-xs">
                          <span className="text-outline font-label-sm text-label-sm">Progresso de Tarefas</span>
                          <span className={`font-label-md text-label-md font-bold ${isDone ? 'text-green-600' : isWaiting ? 'text-red-500' : 'text-primary'}`}>
                            {isDone ? 'Concluído' : `${student.progress}%`}
                          </span>
                        </div>
                        <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-600' : isWaiting ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-sm mt-auto">
                        <button 
                          onClick={() => {
                            // Find any submission by this student or simulate reviewing
                            const sub = submissions.find(sub => sub.studentName === student.name);
                            if (sub) {
                              onLaunchReviewMode(sub);
                            } else {
                              alert(`Simulando revisão de tarefas de ${student.name}. Carregando ábaco digital em modo leitura...`);
                              onLaunchReviewMode({
                                id: 'sub-sim',
                                studentName: student.name,
                                taskTitle: 'Exercício de Numerais Multilingue',
                                submittedAt: new Date().toISOString(),
                                spelledWords: [
                                  { 
                                    word: 'ZERO', 
                                    themeColor: '#1e293b', 
                                    letters: [
                                      { id: 'w1-z', letter: 'Z', originCubeId: 'cube-z' },
                                      { id: 'w1-e', letter: 'E', originCubeId: 'cube-e' },
                                      { id: 'w1-r', letter: 'R', originCubeId: 'cube-r' },
                                      { id: 'w1-o', letter: 'O', originCubeId: 'cube-o' }
                                    ] 
                                  }
                                ]
                              });
                            }
                          }}
                          className="flex-1 py-sm bg-surface-container-high text-on-surface font-label-md text-label-md rounded-lg hover:bg-outline-variant transition-colors border-none cursor-pointer"
                        >
                          Ver Tarefas
                        </button>
                        <button 
                          onClick={() => alert(`Acesso na Nuvem sincronizado para o aluno ${student.name} (ID: ${student.matricula})`)}
                          className="px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center hover:opacity-90 border-none cursor-pointer active:scale-95"
                          title="Sincronizar Cloud PWA"
                        >
                          <span className="material-symbols-outlined text-[18px]">cloud</span>
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Add New Card Skeleton */}
                <div 
                  onClick={() => setIsAddStudentOpen(true)}
                  className="border-2 border-dashed border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-outline hover:border-primary hover:text-primary transition-all cursor-pointer group bg-surface-container-low/30 min-h-[220px] duration-150"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center mb-md group-hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-[32px]">add</span>
                  </div>
                  <p className="font-label-md text-label-md font-bold">Adicionar Novo Aluno</p>
                  <p className="text-[11px] text-center mt-xs px-md">Adicione um aluno usando formulário rápido</p>
                </div>
              </div>

              {/* Pagination/Load More */}
              {filteredStudentsForGrid.length > studentsLimit && (
                <div className="mt-xl flex justify-center">
                  <button 
                    onClick={() => setStudentsLimit(prev => prev + 6)}
                    className="flex items-center gap-sm px-xl py-md bg-surface-container-lowest border border-outline-variant rounded-full text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm cursor-pointer"
                  >
                    Carregar mais alunos
                    <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACCESS (Template 8) */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              
              {/* Alphanumeric Configuração de Acesso Block */}
              <div className="bg-white p-6 rounded-2xl border border-[#c1c6d6] shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-[#131b2e]">Configuração de Acesso</h2>
                  <p className="text-xs text-slate-400 mt-1">Gere chaves encriptadas temporárias para acesso offline do aluno.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Name and Expiry select */}
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Nome do Aluno
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Ana Souza"
                        value={studentNameInput}
                        onChange={(e) => setStudentNameInput(e.target.value)}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">
                          Validade do Código
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full bg-white border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                        >
                          <option value="1h">1 Hora</option>
                          <option value="4h">4 Horas</option>
                          <option value="1d">1 Dia</option>
                          <option value="1w">1 Semana</option>
                          <option value="custom">Personalizado (Calendário)</option>
                        </select>
                      </div>

                      {duration === 'custom' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-600 mb-1.5" htmlFor="expiry-date">
                            Data de Expiração
                          </label>
                          <input
                            type="date"
                            id="expiry-date"
                            value={customExpiryDate}
                            onChange={(e) => setCustomExpiryDate(e.target.value)}
                            className="w-full bg-white border border-[#c1c6d6] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleGenerateCode}
                      className="px-6 py-3 bg-[#005bb3] hover:bg-[#00468c] text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer active:scale-95"
                    >
                      Gerar Código Criptografado
                    </button>
                  </div>

                  {/* Render Generated Code Area */}
                  {generatedCode && (
                    <div className="bg-[#f2f3ff] border border-[#d6e3ff] p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Chave Aluna Gerada</span>
                        <div className="font-mono text-lg font-bold text-[#005bb3] break-all leading-tight">
                          {generatedCode}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                          Utilize o botão abaixo para copiar o token integral encriptado em Base64.
                        </p>
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-[#dde0e2]">
                        <button
                          onClick={() => handleCopyCode(generatedBase64, 999)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-[#c1c6d6] hover:bg-[#005bb3] hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {copiedIndex === 999 ? 'check' : 'content_copy'}
                          </span>
                          {copiedIndex === 999 ? 'Copiado!' : 'Copiar Token'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Student grid with Checkboxes selection */}
              <div className="bg-white rounded-2xl border border-[#c1c6d6] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-6 border-b border-[#dde0e2] space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <h3 className="font-extrabold text-lg">Selecionar Alunos para Atribuição</h3>
                    <div className="flex items-center gap-2 px-3 py-2 bg-[#f2f3ff] rounded-xl border border-[#c1c6d6]/60">
                      <input
                        type="checkbox"
                        id="select-all"
                        checked={selectedStudentIds.length === filteredStudentsForGrid.length && filteredStudentsForGrid.length > 0}
                        onChange={(e) => handleSelectAllStudents(e.target.checked)}
                        className="w-4 h-4 rounded text-[#005bb3] border-[#c1c6d6] cursor-pointer"
                      />
                      <label htmlFor="select-all" className="text-xs font-bold text-slate-500 cursor-pointer select-none">
                        Selecionar Todos
                      </label>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                    <input
                      type="text"
                      placeholder="Filtrar por nome ou turma..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#f2f3ff] border-none rounded-xl text-xs focus:ring-2 focus:ring-[#005bb3] outline-none"
                    />
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredStudentsForGrid.map(s => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id, !isSelected)}
                          className={`flex items-center gap-3 p-3 border rounded-2xl transition-all cursor-pointer relative bg-white hover:shadow-sm ${
                            isSelected ? 'border-[#005bb3] bg-[#f2f3ff]' : 'border-[#c1c6d6]/70'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img src={s.img} alt={s.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" />
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'bg-[#005bb3] border-[#005bb3] text-white' : 'bg-white border-[#c1c6d6]'
                            }`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleSelectStudent(s.id, e.target.checked);
                                }}
                                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                              />
                              {isSelected && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                            </div>
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="font-bold text-xs truncate leading-tight">{s.name}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.class}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active codes table */}
              <div className="bg-white rounded-2xl border border-[#c1c6d6] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#dde0e2]">
                  <h3 className="font-extrabold text-lg">Chaves de Acesso Ativas</h3>
                  <p className="text-xs text-slate-400">Tokens gerados em atividade para acompanhamento</p>
                </div>
                <div className="divide-y divide-[#dde0e2]">
                  {activeCodes.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      Nenhum código de acesso gerado ainda.
                    </div>
                  ) : (
                    activeCodes.map((c, index) => {
                      const isExpired = Date.now() > c.expiresAt;
                      return (
                        <div key={c.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-sm text-[#131b2e]">{c.studentName}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                {c.id}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {isExpired ? 'Expirado' : 'Ativo'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500 font-semibold">{c.durationLabel}</span>
                            <button
                              onClick={() => handleCopyCode(c.code, index)}
                              className="flex items-center gap-1.5 px-3.5 py-2 border border-[#c1c6d6] hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {copiedIndex === index ? 'check' : 'content_copy'}
                              </span>
                              {copiedIndex === index ? 'Copiado' : 'Copiar Token'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Modal: Add Task */}
        <AnimatePresence>
          {isAddTaskOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#131b2e]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#c1c6d6] max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-[#dde0e2] pb-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400">Adicionar Nova Tarefa</span>
                    <h3 className="text-xl font-extrabold text-[#131b2e]">Criar Tarefa no Portal</h3>
                  </div>
                  <button 
                    onClick={() => setIsAddTaskOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-transparent border-none"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task Title */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome da Tarefa *</label>
                      <input
                        type="text"
                        placeholder="Ex: Exercício de Numerais Multilingue"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                        required
                      />
                    </div>

                    {/* Task Description */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Descrição da Tarefa *</label>
                      <textarea
                        placeholder="Instruções gerais para os alunos de como soletrar no ábaco..."
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none resize-none"
                        required
                      />
                    </div>

                    {/* Note from Teacher */}
                    <div className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nota do Professor (Dica especial)</label>
                      <textarea
                        placeholder="Adicione observações ou instruções adicionais de pronúncia..."
                        value={newTaskTeacherNote}
                        onChange={(e) => setNewTaskTeacherNote(e.target.value)}
                        rows={2}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none resize-none"
                      />
                    </div>

                    {/* Start Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data de início</label>
                      <input
                        type="date"
                        value={newTaskStartDate}
                        onChange={(e) => setNewTaskStartDate(e.target.value)}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                      />
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Data de conclusão</label>
                      <input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="w-full bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                      />
                    </div>
                  </div>

                  {/* Two Column Section for Student Assign & Upload simulator */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assign section */}
                    <div className="flex flex-col gap-2 bg-[#f8fafc] border border-outline-variant/30 rounded-2xl p-4 shadow-xs">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Atribuir a Alunos</h4>
                      <p className="text-[10px] text-slate-400">Selecione quais alunos devem receber esta tarefa</p>
                      
                      <input
                        type="text"
                        placeholder="Buscar aluno..."
                        value={addTaskStudentSearchQuery}
                        onChange={(e) => setAddTaskStudentSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#c1c6d6] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#005bb3] outline-none mt-1"
                      />

                      <div className="space-y-2 max-h-36 overflow-y-auto pr-2 mt-1">
                        {students
                          .filter(s => s.name.toLowerCase().includes(addTaskStudentSearchQuery.toLowerCase()))
                          .map(s => {
                            const isAssigned = selectedStudentIds.includes(s.id);
                            return (
                              <div 
                                key={s.id} 
                                onClick={() => {
                                  setSelectedStudentIds(prev => 
                                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                  );
                                }}
                                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-primary/30 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-md">
                                  <img src={s.img} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-[#eaedff]" />
                                  <span className="font-bold text-xs text-on-background group-hover:text-primary transition-colors">{s.name}</span>
                                </div>
                                <span className={`material-symbols-outlined text-[20px] transition-all ${
                                  isAssigned ? 'text-primary' : 'text-slate-300'
                                }`}>
                                  {isAssigned ? 'check_circle' : 'circle'}
                                </span>
                              </div>
                            );
                          })}
                        {students.filter(s => s.name.toLowerCase().includes(addTaskStudentSearchQuery.toLowerCase())).length === 0 && (
                          <p className="text-center text-[10px] text-slate-400 py-4">Nenhum aluno encontrado</p>
                        )}
                      </div>
                    </div>

                    {/* Attachments Section */}
                    <div className="flex flex-col gap-2 bg-[#f8fafc] border border-outline-variant/30 rounded-2xl p-4 shadow-xs">
                      <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Adicionar Anexo</h4>
                      <p className="text-[10px] text-slate-400">Anexe materiais de apoio ou pdfs explicativos</p>
                      
                      <input 
                        type="file"
                        accept="image/*,application/pdf"
                        ref={addTaskFileInputRef}
                        className="hidden"
                        onChange={handleAddTaskFileChange}
                      />

                      <div 
                        onClick={() => addTaskFileInputRef.current?.click()}
                        className="flex-grow min-h-[120px] mt-2 border-2 border-dashed border-[#dde0e2] hover:border-primary hover:bg-[#eaedff]/20 rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer group p-4 text-center"
                      >
                        {addTaskFile ? (
                          <>
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                              <span className="material-symbols-outlined text-[24px]">
                                {addTaskFile.type === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                              </span>
                            </div>
                            <p className="font-bold text-xs text-slate-600 truncate max-w-full px-2">{addTaskFile.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{(addTaskFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddTaskFile(null);
                                if (addTaskFileInputRef.current) addTaskFileInputRef.current.value = '';
                              }}
                              className="text-xs text-red-500 hover:text-red-700 mt-2 font-bold bg-transparent border-none cursor-pointer"
                            >
                              Remover
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2 group-hover:scale-105 transition-all">
                              <span className="material-symbols-outlined text-[24px]">upload_file</span>
                            </div>
                            <p className="font-bold text-xs text-slate-600">Upload de Imagem ou PDF</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Tamanho máximo: 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Spelled Words Builder */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Palavras Meta (Soletrar no Fio do Ábaco)</label>
                      <button
                        type="button"
                        onClick={handleAddWordToNewTask}
                        className="flex items-center gap-1 text-[#005bb3] hover:text-[#00468c] font-bold text-xs cursor-pointer border-none bg-transparent"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Adicionar Palavra
                      </button>
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                      {newTaskWords.map((wordObj, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-3 items-center bg-[#f2f3ff] p-3 rounded-xl border border-[#dde0e2]">
                          <input
                            type="text"
                            placeholder="PALAVRA"
                            value={wordObj.word}
                            onChange={(e) => {
                              const updated = [...newTaskWords];
                              updated[idx].word = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '').toUpperCase();
                              setNewTaskWords(updated);
                            }}
                            className="bg-white border border-[#c1c6d6] rounded-lg px-3 py-1.5 text-xs font-bold text-[#131b2e] w-full sm:w-44 focus:ring-1 focus:ring-[#005bb3] outline-none"
                          />

                          <select
                            value={wordObj.language}
                            onChange={(e) => {
                              const updated = [...newTaskWords];
                              const lang = e.target.value as 'pt' | 'en' | 'de';
                              updated[idx].language = lang;
                              // Default language theme colors
                              if (lang === 'pt') updated[idx].color = '#1e293b'; // Slate (Black)
                              if (lang === 'en') updated[idx].color = '#3b82f6'; // Blue
                              if (lang === 'de') updated[idx].color = '#ef4444'; // Red
                              setNewTaskWords(updated);
                            }}
                            className="bg-white border border-[#c1c6d6] rounded-lg px-2 py-1.5 text-xs font-bold w-full sm:w-36 focus:ring-1"
                          >
                            <option value="pt">Português</option>
                            <option value="en">Inglês</option>
                            <option value="de">Alemão</option>
                          </select>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-slate-400">Cor do Fio:</label>
                            <input
                              type="color"
                              value={wordObj.color}
                              onChange={(e) => {
                                const updated = [...newTaskWords];
                                updated[idx].color = e.target.value;
                                setNewTaskWords(updated);
                              }}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-[#c1c6d6] p-0.5 bg-white shrink-0"
                            />
                          </div>

                          {newTaskWords.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveWordFromNewTask(idx)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1.5 shrink-0 cursor-pointer border-none bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#dde0e2]">
                    <button
                      type="button"
                      onClick={() => setIsAddTaskOpen(false)}
                      className="px-5 py-2.5 border border-[#c1c6d6] hover:bg-slate-50 text-xs font-bold rounded-xl cursor-pointer bg-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl cursor-pointer shadow border-none"
                    >
                      Criar tarefa
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Selecionar Alunos (Template 9) */}
        <AnimatePresence>
          {isAssignStudentsOpen && tempCreatedTask && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#c1c6d6] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-[#dde0e2] flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#131b2e]">Selecionar Alunos</h3>
                    <p className="text-[11px] text-slate-400 font-medium">Selecione os alunos que participarão desta atividade</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsAssignStudentsOpen(false);
                      setTempCreatedTask(null);
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Modal Sub-header / Filter */}
                <div className="px-6 py-3 bg-[#f2f3ff] flex items-center justify-between border-b border-[#dde0e2] shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <input 
                        type="checkbox"
                        id="select-all-assign"
                        checked={selectedStudentIds.length === filteredStudentsForGrid.length && filteredStudentsForGrid.length > 0}
                        onChange={(e) => handleSelectAllStudents(e.target.checked)}
                        className="w-4 h-4 rounded text-[#005bb3] border-[#c1c6d6] cursor-pointer"
                      />
                      <label htmlFor="select-all-assign" className="ml-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                        Selecionar Todos
                      </label>
                    </div>
                    <span className="text-[#dde0e2]">|</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{filteredStudentsForGrid.length} alunos encontrados</span>
                  </div>
                  <div className="relative flex items-center gap-1">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
                    <input 
                      type="text"
                      placeholder="Filtrar por nome..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="bg-transparent border-none text-xs focus:ring-0 placeholder:text-slate-400 w-32 p-0 outline-none"
                    />
                  </div>
                </div>

                {/* Student Grid list (Scrollable) */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-[#faf8ff]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {filteredStudentsForGrid.map(s => {
                      const isSelected = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectStudent(s.id, !isSelected)}
                          className={`group flex flex-col items-center p-4 border rounded-2xl transition-all cursor-pointer relative bg-white hover:shadow-md ${
                            isSelected ? 'border-[#005bb3] bg-[#f2f3ff]' : 'border-[#c1c6d6]/70'
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="absolute top-3 right-3 w-4 h-4 rounded text-[#005bb3] border-[#c1c6d6] pointer-events-none"
                          />
                          <img 
                            src={s.img} 
                            alt={s.name}
                            className={`w-14 h-14 rounded-full object-cover mb-2 border-2 transition-all ${
                              isSelected ? 'border-[#005bb3] scale-105' : 'border-slate-100'
                            }`}
                          />
                          <p className="font-bold text-xs text-center text-[#131b2e] truncate w-full leading-tight">{s.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Matrícula: {s.matricula || '202400'}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-[#dde0e2] bg-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-black text-[#005bb3]" id="selected-count">{selectedStudentIds.length}</span>
                    <span className="text-slate-400 font-semibold">alunos selecionados</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setIsAssignStudentsOpen(false);
                        setTempCreatedTask(null);
                      }}
                      className="px-5 py-2.5 rounded-xl border border-[#c1c6d6] hover:bg-slate-50 text-xs font-bold text-slate-500 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={() => {
                        if (selectedStudentIds.length === 0) {
                          alert('Selecione pelo menos um aluno para a tarefa.');
                           return;
                        }
                        const finalTask: TaskItem = {
                          ...tempCreatedTask,
                          submissionsCount: 0
                        };
                        setTasks([finalTask, ...tasks]);
                        setIsAssignStudentsOpen(false);
                        setTempCreatedTask(null);
                        alert(`Tarefa "${finalTask.title}" atribuída com sucesso para os alunos selecionados! 🎉`);
                      }}
                      className="px-7 py-2.5 rounded-xl bg-[#005bb3] hover:bg-[#00468c] text-white text-xs font-bold shadow-lg shadow-[#005bb3]/20 cursor-pointer transition-all"
                    >
                      Confirmar Atribuição
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Task Details */}
        <AnimatePresence>
          {selectedTaskDetails && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#131b2e]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl border border-outline-variant max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl"
              >
                <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                  <div>
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                      selectedTaskDetails.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : selectedTaskDetails.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {selectedTaskDetails.status === 'active' ? 'Ativa' : selectedTaskDetails.status === 'draft' ? 'Rascunho' : 'Arquivada'}
                    </span>
                    <h3 className="text-xl font-extrabold text-on-surface mt-2">{selectedTaskDetails.title}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTaskDetails(null)}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-4 font-body-md text-body-md text-on-surface-variant">
                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Descrição / Instruções</h4>
                    <p className="bg-surface p-4 rounded-xl border border-outline-variant/60 leading-relaxed italic">
                      {selectedTaskDetails.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Prazo de Entrega</h4>
                      <p className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {selectedTaskDetails.dueDate}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Submissões Concluídas</h4>
                      <p className="font-semibold text-primary flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        {(selectedTaskDetails.submissionsCount ?? 0)} alunos entregaram
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Palavras do Exercício</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTaskDetails.targetWords.map((w, idx) => (
                        <div 
                          key={idx} 
                          style={{ borderColor: w.color + '40', backgroundColor: w.color + '08' }} 
                          className="border px-3.5 py-2 rounded-2xl flex items-center gap-2"
                        >
                          <span style={{ backgroundColor: w.color }} className="w-3 h-3 rounded-full shrink-0 shadow-sm animate-pulse"></span>
                          <span className="font-bold text-xs text-on-surface tracking-wider font-mono">{w.word}</span>
                          <span className="text-[10px] text-slate-400 font-bold bg-white border border-outline-variant px-1.5 py-0.5 rounded uppercase">
                            {w.language}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  {selectedTaskDetails.status !== 'completed' ? (
                    <button
                      onClick={() => {
                        const updated = tasks.map(t => t.id === selectedTaskDetails.id ? { ...t, status: 'completed' as const } : t);
                        setTasks(updated);
                        setSelectedTaskDetails(null);
                        alert(`Tarefa "${selectedTaskDetails.title}" arquivada com sucesso! 📦`);
                      }}
                      className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Arquivar Tarefa
                    </button>
                  ) : null}
                  <button
                    onClick={() => setSelectedTaskDetails(null)}
                    className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl cursor-pointer shadow transition-all"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Edit Task - Matches Mockup Exactly */}
        <AnimatePresence>
          {editingTask && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[999] bg-[#faf8ff] overflow-y-auto w-full h-full flex flex-col font-sans select-text text-on-surface"
            >
              {/* Top Navigation Bar */}
              <header className="flex justify-between items-center px-lg py-sm w-full sticky top-0 z-50 bg-surface-container-low dark:bg-on-surface-variant select-none shrink-0">
                <div className="flex items-center gap-md">
                  <div className="md:hidden flex items-center p-xs cursor-pointer hover:bg-surface-container-high transition-colors rounded-lg" onClick={() => setEditingTask(null)}>
                    <span className="material-symbols-outlined">menu</span>
                  </div>
                  <div className="hidden md:flex items-center gap-sm">
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
                      <input 
                        className="pl-10 pr-4 py-2 bg-surface border-none rounded-lg focus:ring-2 focus:ring-primary-container w-64 text-body-md outline-none" 
                        placeholder="Pesquisar..." 
                        type="text" 
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-lg">
                  <div className="flex items-center gap-md">
                    <button className="p-xs hover:bg-surface-container-high transition-colors rounded-full relative bg-transparent border-none cursor-pointer">
                      <span className="material-symbols-outlined">notifications</span>
                      <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
                    </button>
                    <button className="p-xs hover:bg-surface-container-high transition-colors rounded-full bg-transparent border-none cursor-pointer">
                      <span className="material-symbols-outlined">settings</span>
                    </button>
                  </div>
                  <div className="h-8 w-[1px] bg-outline-variant mx-sm"></div>
                  <div className="flex items-center gap-md text-right">
                    <div className="hidden sm:block">
                      <p className="font-label-md text-on-surface font-bold">{user.name || "Profª. Maria Silva"}</p>
                      <p className="text-xs text-on-surface-variant">Matemática &amp; Idiomas</p>
                    </div>
                    <img 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwZpHVOml6IEqqOvOzAewn5Wlw3qkJVyBTb7hNnhVmMYJL-L93rcbjp9qGPMxoZ_uvR-O_b5Vp-PX-OjZiHKmpxuekuLwBr40UWsqfE1aWIclH8fDVMVl-HI5ZiZf6mrfSN91WEzvaX1TazE1QA5g_6DxrfR-rAG3Zaie0hwHoJGGHENy8sNov9CnsmPcih2oEEd-E0bQK4cXSO3Nml9zS6uahtpIl8bEK9F9_n8ceuzN7fT4wfTyGXh2egTjgbUzSm6MaeH46E1jr" 
                    />
                  </div>
                </div>
              </header>

              <div className="flex flex-1 relative min-h-0">
                {/* Sidebar Navigation */}
                <aside className="flex flex-col h-screen fixed left-0 top-0 pt-xl px-md gap-sm bg-surface dark:bg-on-surface border-r border-outline-variant dark:border-on-secondary-fixed-variant w-64 z-40 select-none">
                  <div className="px-md mb-xl flex items-center gap-sm">
                    <img src={abbaLogo} alt="ABBA DIGITAL Logo" className="w-10 h-10 object-contain shrink-0" />
                    <div>
                      <h1 className="font-headline-sm text-[18px] font-black text-primary leading-tight">ABBA DIGITAL</h1>
                      <p className="text-[11px] text-on-surface-variant">Portal da Educação</p>
                    </div>
                  </div>
                  <nav className="flex flex-col gap-xs flex-1">
                    <button 
                      onClick={() => { setEditingTask(null); setActiveTab('home'); }} 
                      className="w-full flex items-center gap-md px-md py-md text-secondary hover:bg-secondary-container transition-all cursor-pointer rounded-lg bg-transparent border-none text-left"
                    >
                      <span className="material-symbols-outlined">home</span>
                      <span className="font-label-md">inicio</span>
                    </button>
                    <button 
                      onClick={() => { setEditingTask(null); setActiveTab('students'); }} 
                      className="w-full flex items-center gap-md px-md py-md text-secondary hover:bg-secondary-container transition-all cursor-pointer rounded-lg bg-transparent border-none text-left"
                    >
                      <span className="material-symbols-outlined">group</span>
                      <span className="font-label-md">Alunos</span>
                    </button>
                    <button 
                      onClick={() => { setEditingTask(null); setActiveTab('tasks'); }} 
                      className="w-full flex items-center gap-md px-md py-md bg-primary text-white font-bold cursor-pointer rounded-lg border-none text-left active:scale-98"
                    >
                      <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                      <span className="font-label-md">Tarefas</span>
                    </button>
                    <button 
                      onClick={() => { setEditingTask(null); setActiveTab('access'); }} 
                      className="w-full flex items-center gap-md px-md py-md text-secondary hover:bg-secondary-container transition-all cursor-pointer rounded-lg bg-transparent border-none text-left"
                    >
                      <span className="material-symbols-outlined">key</span>
                      <span className="font-label-md">Access0s</span>
                    </button>
                  </nav>
                  <div className="mt-auto mb-lg flex flex-col gap-xs">
                    <button 
                      onClick={() => alert('Para obter ajuda, entre em contato em suporte@abbadigital.com')} 
                      className="w-full flex items-center gap-md px-md py-md text-secondary hover:bg-secondary-container transition-all rounded-lg bg-transparent border-none text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined">help</span>
                      <span className="font-label-md">Help</span>
                    </button>
                    <button 
                      onClick={() => { setEditingTask(null); onLogout(); }} 
                      className="w-full flex items-center gap-md px-md py-md text-secondary hover:bg-secondary-container transition-all rounded-lg bg-transparent border-none text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span className="font-label-md">Logout</span>
                    </button>
                  </div>
                </aside>

                {/* Main Content Canvas */}
                <main className="ml-64 flex-1 p-xl overflow-y-auto">
                  {/* Breadcrumbs */}
                  <nav className="flex items-center gap-sm text-label-sm text-[#717785] mb-md select-none">
                    <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setEditingTask(null)}>ABBA DIGITAL</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="cursor-pointer hover:text-primary transition-colors" onClick={() => setEditingTask(null)}>Minhas Tarefas</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-on-surface-variant font-bold">Detalhes</span>
                  </nav>

                  {/* CONDITIONAL RENDER: DETAIL VIEW OR DETAIL EDIT VIEW */}
                  {!isDetailEditMode ? (
                    <>
                      {/* Header Section */}
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-lg mb-xl">
                        <div>
                          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs font-bold leading-tight">{editingTask.title}</h2>
                          <p className="text-body-md text-on-surface-variant mt-sm mb-md max-w-3xl leading-relaxed">{editingTask.description || "Pratique a escrita e pronúncia das palavras usando os fios correspondentes."}</p>
                          <div className="flex flex-wrap items-center gap-md">
                            <div className="flex items-center gap-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                              <span className="text-body-md">Entrega: <span className="font-semibold">{editingTask.dueDate ? new Date(editingTask.dueDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Sem prazo'}</span></span>
                            </div>
                            {editingTask.status === 'active' && (
                              <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-xs font-bold flex items-center gap-xs">
                                <span className="w-2 h-2 bg-primary rounded-full"></span>
                                Ativa
                              </span>
                            )}
                            {editingTask.status === 'draft' && (
                              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold flex items-center gap-xs">
                                <span className="w-2 h-2 bg-secondary rounded-full"></span>
                                Rascunho
                              </span>
                            )}
                            {editingTask.status === 'completed' && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-xs">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Arquivada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-sm self-start">
                          <button 
                            onClick={() => setIsDetailEditMode(true)}
                            className="flex items-center justify-center w-10 h-10 border border-outline-variant rounded-lg text-primary hover:bg-surface-container-high transition-all cursor-pointer bg-white" 
                            title="Editar Tarefa"
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button 
                            onClick={() => setEditingTask(null)}
                            className="flex items-center justify-center w-10 h-10 bg-primary text-on-primary rounded-lg shadow-sm hover:bg-primary-container transition-all active:scale-95 cursor-pointer border-none" 
                            title="Voltar"
                          >
                            <span className="material-symbols-outlined">arrow_back</span>
                          </button>
                        </div>
                      </div>

                      {/* Summary Bento Grid Section */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-xl select-none">
                        <div className="md:col-span-2 bg-white card-shadow rounded-xl p-lg flex flex-col justify-between">
                          <div>
                            <p className="text-label-md text-outline uppercase tracking-wider mb-sm">Progresso Geral</p>
                            <h3 className="text-headline-md text-on-surface">
                              {(() => {
                                const taskSubmissions = submissions.filter(sub => sub.taskTitle === editingTask.title);
                                const completedCount = taskSubmissions.length;
                                const totalCount = editingTask.assignedStudentIds?.length || students.length;
                                return `${completedCount} de {totalCount} Alunos concluíram`.replace('{totalCount}', String(totalCount));
                              })()}
                            </h3>
                          </div>
                          <div className="mt-md">
                            <div className="flex justify-between items-end mb-xs">
                              <span className="text-label-md font-bold text-primary">
                                {(() => {
                                  const taskSubmissions = submissions.filter(sub => sub.taskTitle === editingTask.title);
                                  const completedCount = taskSubmissions.length;
                                  const totalCount = editingTask.assignedStudentIds?.length || students.length;
                                  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                  return `${completionPercentage}% concluído`;
                                })()}
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-high rounded-full h-3">
                              <div 
                                className="bg-primary h-3 rounded-full shadow-inner transition-all duration-300" 
                                style={{ 
                                  width: `${(() => {
                                    const taskSubmissions = submissions.filter(sub => sub.taskTitle === editingTask.title);
                                    const completedCount = taskSubmissions.length;
                                    const totalCount = editingTask.assignedStudentIds?.length || students.length;
                                    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                  })()}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white card-shadow rounded-xl p-lg flex flex-col justify-center items-center text-center">
                          <div className="bg-surface-container-low text-primary p-md rounded-full mb-md">
                            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                          </div>
                          <p className="text-label-sm text-outline mb-xs">Prazo Restante</p>
                          <p className="font-headline-md text-on-surface">
                            {(() => {
                              if (!editingTask.dueDate) return 'N/A';
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const due = new Date(editingTask.dueDate + 'T12:00:00');
                              due.setHours(0, 0, 0, 0);
                              const diffTime = due.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return 'Expirado';
                              if (diffDays === 0) return 'Hoje';
                              return `${diffDays} Dia${diffDays > 1 ? 's' : ''}`;
                            })()}
                          </p>
                        </div>

                        <div className="bg-white card-shadow rounded-xl p-lg flex flex-col justify-center items-center text-center">
                          <div className="bg-surface-container-low text-primary p-md rounded-full mb-md">
                            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          </div>
                          <p className="text-label-sm text-outline mb-xs">Média da Turma</p>
                          <p className="font-headline-md text-on-surface">8.4 / 10</p>
                        </div>
                      </div>

                      {/* Students List Header */}
                      <div className="flex items-center justify-between mb-lg select-none">
                        <h4 className="text-on-surface text-headline-lg font-bold text-black">Atribuido aos alunos</h4>
                        <div className="flex-1 max-w-md mx-md hidden lg:block">
                          <div className="relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">search</span>
                            <input 
                              className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container w-full text-body-md font-display outline-none" 
                              placeholder="Buscar aluno..." 
                              type="text"
                              value={detailsStudentSearchQuery}
                              onChange={(e) => {
                                setDetailsStudentSearchQuery(e.target.value);
                                setDetailsStudentPage(1);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-sm">
                          <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors bg-white cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">filter_list</span>
                          </button>
                          <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors bg-white cursor-pointer">
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                          </button>
                        </div>
                      </div>

                      {/* Mobile Search input */}
                      <div className="block lg:hidden mb-md">
                        <div className="relative flex items-center">
                          <span className="material-symbols-outlined absolute left-3 text-outline text-[20px]">search</span>
                          <input 
                            className="pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary-container w-full text-body-md outline-none" 
                            placeholder="Buscar aluno..." 
                            type="text"
                            value={detailsStudentSearchQuery}
                            onChange={(e) => {
                              setDetailsStudentSearchQuery(e.target.value);
                              setDetailsStudentPage(1);
                            }}
                          />
                        </div>
                      </div>

                      {/* Student Cards Grid */}
                      <div className="student-grid select-none">
                        {(() => {
                          const assignedIds = editingTask.assignedStudentIds || [];
                          const hasAssignments = assignedIds.length > 0;
                          
                          const filteredStudents = students
                            .filter(s => {
                              if (hasAssignments && !assignedIds.includes(s.id)) return false;
                              return s.name.toLowerCase().includes(detailsStudentSearchQuery.toLowerCase());
                            })
                            .map(student => {
                              const submission = submissions.find(sub => sub.studentName === student.name && sub.taskTitle === editingTask.title);
                              
                              let status: 'completed' | 'progress' | 'pending' = 'pending';
                              let progressVal = 0;
                              
                              if (submission) {
                                status = 'completed';
                                progressVal = 100;
                              } else if (student.id === 'st-2') { // Carlos Eduardo
                                status = 'progress';
                                progressVal = 65;
                              } else if (student.id === 'st-5' || student.id === 'st-4') { // Ana Clara/Enzo
                                status = 'progress';
                                progressVal = 40;
                              } else {
                                status = 'pending';
                                progressVal = 0;
                              }

                              return { ...student, status, progressVal, submission };
                            });

                          const detailsStudentsPerPage = 6;
                          const detailsTotalPages = Math.ceil(filteredStudents.length / detailsStudentsPerPage) || 1;
                          const paginatedDetailsStudents = filteredStudents.slice(
                            (detailsStudentPage - 1) * detailsStudentsPerPage, 
                            detailsStudentPage * detailsStudentsPerPage
                          );

                          if (paginatedDetailsStudents.length === 0) {
                            return (
                              <div className="col-span-full py-12 text-center text-slate-400 italic bg-white rounded-2xl border border-outline-variant card-shadow p-6">
                                Nenhum aluno atribuído encontrado.
                              </div>
                            );
                          }

                          return paginatedDetailsStudents.map(student => (
                            <div key={student.id} className="bg-white card-shadow rounded-xl p-md flex flex-col gap-md hover:border-primary-container border border-transparent transition-all group">
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-md">
                                  <div className="relative">
                                    <img 
                                      alt={student.name} 
                                      className="w-12 h-12 rounded-full object-cover border-2 border-surface-container-high" 
                                      src={student.img} 
                                    />
                                    {student.status === 'completed' && (
                                      <span className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></span>
                                    )}
                                    {student.status === 'progress' && (
                                      <span className="absolute -bottom-1 -right-1 bg-blue-500 w-4 h-4 rounded-full border-2 border-white"></span>
                                    )}
                                    {student.status === 'pending' && (
                                      <span className="absolute -bottom-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white"></span>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">{student.name}</h5>
                                    <p className="text-xs text-outline">
                                      {student.status === 'completed' 
                                        ? `Entregue em: ${student.submission ? new Date(student.submission.submittedAt).toLocaleDateString('pt-BR') : '17 Mai, 2026'}` 
                                        : student.status === 'progress' 
                                          ? 'Em progresso...' 
                                          : 'Pendente'}
                                    </p>
                                  </div>
                                </div>
                                
                                {student.status === 'completed' && (
                                  <span className="flex items-center gap-xs px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                  </span>
                                )}
                                {student.status === 'progress' && (
                                  <span className="flex items-center gap-xs px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                                  </span>
                                )}
                                {student.status === 'pending' && (
                                  <span className="flex items-center gap-xs px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
                                  </span>
                                )}
                              </div>

                              <div className="space-y-sm">
                                <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-on-surface-variant">Progresso</span>
                                  <span className={student.status === 'completed' ? 'text-green-600' : student.status === 'progress' ? 'text-blue-600' : 'text-red-600'}>
                                    {student.progressVal}%
                                  </span>
                                </div>
                                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${student.status === 'completed' ? 'bg-green-500' : student.status === 'progress' ? 'bg-blue-500' : 'bg-red-400'}`} 
                                    style={{ width: `${student.progressVal}%` }}
                                  ></div>
                                </div>
                              </div>

                              <button 
                                type="button"
                                onClick={() => {
                                  if (student.submission) {
                                    setEditingTask(null);
                                    onLaunchReviewMode(student.submission);
                                  } else {
                                    alert(`O aluno ${student.name} ainda não enviou esta atividade.`);
                                  }
                                }}
                                className="w-full py-sm text-label-md font-bold text-primary-container border border-primary-container rounded-lg group-hover:bg-primary-container group-hover:text-white transition-all bg-transparent cursor-pointer"
                              >
                                Conferir
                              </button>
                            </div>
                          ));
                        })()}
                      </div>

                      {/* Pagination Footer */}
                      {(() => {
                        const assignedIds = editingTask.assignedStudentIds || [];
                        const hasAssignments = assignedIds.length > 0;
                        const filteredStudents = students.filter(s => {
                          if (hasAssignments && !assignedIds.includes(s.id)) return false;
                          return s.name.toLowerCase().includes(detailsStudentSearchQuery.toLowerCase());
                        });

                        const detailsStudentsPerPage = 6;
                        const detailsTotalPages = Math.ceil(filteredStudents.length / detailsStudentsPerPage) || 1;

                        if (filteredStudents.length === 0) return null;

                        return (
                          <div className="flex items-center justify-between mt-xl pt-lg border-t border-outline-variant select-none">
                            <p className="text-body-md text-on-surface-variant">
                              Mostrando {Math.min(filteredStudents.length, detailsStudentPage * detailsStudentsPerPage)} de {filteredStudents.length} alunos
                            </p>
                            <div className="flex items-center gap-xs">
                              <button 
                                onClick={() => setDetailsStudentPage(prev => Math.max(1, prev - 1))}
                                disabled={detailsStudentPage === 1}
                                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 bg-white cursor-pointer"
                              >
                                <span className="material-symbols-outlined">chevron_left</span>
                              </button>
                              {Array.from({ length: detailsTotalPages }, (_, i) => i + 1).map(pageNum => (
                                <button 
                                  key={pageNum}
                                  onClick={() => setDetailsStudentPage(pageNum)}
                                  className={`w-10 h-10 rounded-lg font-bold border cursor-pointer transition-all ${
                                    detailsStudentPage === pageNum 
                                      ? 'bg-primary border-primary text-white' 
                                      : 'border-outline-variant hover:bg-surface-container-high bg-white text-on-surface'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              ))}
                              <button 
                                onClick={() => setDetailsStudentPage(prev => Math.min(detailsTotalPages, prev + 1))}
                                disabled={detailsStudentPage === detailsTotalPages}
                                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors disabled:opacity-50 bg-white cursor-pointer"
                              >
                                <span className="material-symbols-outlined">chevron_right</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    /* DETAIL EDIT FORM - GORGEOUS INTERACTIVE OVERLAY */
                    <div className="max-w-2xl bg-white card-shadow rounded-2xl p-lg border border-outline-variant animate-fade-in select-none">
                      <div className="flex justify-between items-center border-b border-[#dde0e2] pb-md mb-lg">
                        <h3 className="text-xl font-extrabold text-[#131b2e] flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">edit_document</span>
                          Editar Detalhes da Tarefa
                        </h3>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir permanentemente a tarefa "${editingTask.title}"?`)) {
                                setTasks(prev => prev.filter(t => t.id !== editingTask.id));
                                setEditingTask(null);
                                alert('Tarefa excluída permanentemente! 🗑️');
                              }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                            title="Excluir Atividade"
                          >
                            <span className="material-symbols-outlined text-[22px]">delete</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDetailEditMode(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors border-none bg-transparent cursor-pointer"
                            title="Voltar para detalhes"
                          >
                            <span className="material-symbols-outlined text-[22px]">close</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-md">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#414754]">Nome da Tarefa</label>
                          <input 
                            className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c1c6d6] rounded-xl focus:border-[#005bb3] focus:ring-1 focus:ring-[#005bb3] outline-none transition-all text-sm font-medium text-[#131b2e]" 
                            type="text" 
                            value={editTaskTitle}
                            onChange={(e) => setEditTaskTitle(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#414754]">Data de Entrega</label>
                            <input 
                              className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c1c6d6] rounded-xl focus:border-[#005bb3] focus:ring-1 focus:ring-[#005bb3] outline-none transition-all text-sm font-medium text-[#131b2e]" 
                              type="date" 
                              value={editTaskDueDate}
                              onChange={(e) => setEditTaskDueDate(e.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#414754]">Prioridade</label>
                            <div className="relative">
                              <select 
                                className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c1c6d6] rounded-xl focus:border-[#005bb3] focus:ring-1 focus:ring-[#005bb3] outline-none transition-all text-sm font-medium text-[#131b2e] appearance-none"
                                value={editTaskPriority}
                                onChange={(e) => setEditTaskPriority(e.target.value as 'Alta' | 'Média' | 'Baixa')}
                              >
                                <option value="Alta">Alta</option>
                                <option value="Média">Média</option>
                                <option value="Baixa">Baixa</option>
                              </select>
                              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">arrow_drop_down</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#414754]">Descrição / Objetivos</label>
                          <textarea 
                            className="w-full px-4 py-2.5 bg-[#faf8ff] border border-[#c1c6d6] rounded-xl focus:border-[#005bb3] focus:ring-1 focus:ring-[#005bb3] outline-none transition-all text-sm font-medium text-[#131b2e] resize-none" 
                            rows={4}
                            value={editTaskDescription}
                            onChange={(e) => setEditTaskDescription(e.target.value)}
                          />
                        </div>

                        {/* Students Assignment Selector */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-[#414754]">Atribuído aos Alunos ({editTaskAssignedStudentIds.length} selecionados)</label>
                            <button 
                              type="button"
                              onClick={() => setShowEditAssignPanel(prev => !prev)}
                              className="text-primary text-xs font-bold hover:underline bg-transparent border-none cursor-pointer animate-pulse"
                            >
                              {showEditAssignPanel ? 'Ocultar Filtro' : 'Modificar Seleção'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-2 items-center overflow-hidden">
                              {editTaskAssignedStudentIds.slice(0, 5).map(id => {
                                const student = students.find(s => s.id === id);
                                if (!student) return null;
                                return (
                                  <div key={student.id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-sm">
                                    <img src={student.img} alt={student.name} className="w-full h-full object-cover" />
                                  </div>
                                );
                              })}
                              {editTaskAssignedStudentIds.length > 5 && (
                                <div className="w-9 h-9 rounded-full border-2 border-white bg-[#dae2fd] flex items-center justify-center text-[#005bb3] text-xs font-bold shrink-0 shadow-sm">
                                  +{editTaskAssignedStudentIds.length - 5}
                                </div>
                              )}
                              {editTaskAssignedStudentIds.length === 0 && (
                                <p className="text-xs text-slate-400 italic py-1">Atribuída a todos os alunos</p>
                              )}
                            </div>
                            <button 
                              type="button"
                              onClick={() => setShowEditAssignPanel(prev => !prev)}
                              className="w-9 h-9 rounded-full border border-dashed border-[#c1c6d6] flex items-center justify-center text-[#717785] hover:border-[#005bb3] hover:text-[#005bb3] transition-colors cursor-pointer bg-white"
                            >
                              <span className="material-symbols-outlined text-xl">person_add</span>
                            </button>
                          </div>

                          {showEditAssignPanel && (
                            <div className="mt-2 p-4 bg-[#f2f3ff]/50 border border-[#c1c6d6]/60 rounded-xl space-y-2 animate-fade-in">
                              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Selecionar Alunos</p>
                              <input
                                type="text"
                                placeholder="Buscar aluno..."
                                value={editTaskStudentSearchQuery}
                                onChange={(e) => setEditTaskStudentSearchQuery(e.target.value)}
                                className="w-full bg-white border border-[#c1c6d6] rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#005bb3] outline-none"
                              />
                              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                {students
                                  .filter(s => s.name.toLowerCase().includes(editTaskStudentSearchQuery.toLowerCase()))
                                  .map(s => {
                                    const isChecked = editTaskAssignedStudentIds.includes(s.id);
                                    return (
                                      <div 
                                        key={s.id}
                                        onClick={() => {
                                          setEditTaskAssignedStudentIds(prev => 
                                            prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                                          );
                                        }}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-100 hover:border-primary/30 transition-colors cursor-pointer select-none"
                                      >
                                        <div className="flex items-center gap-2">
                                          <img src={s.img} alt={s.name} className="w-7 h-7 rounded-full object-cover border" />
                                          <span className="font-semibold text-xs text-[#131b2e]">{s.name}</span>
                                        </div>
                                        <span className={`material-symbols-outlined text-[18px] ${isChecked ? 'text-primary' : 'text-slate-300'}`}>
                                          {isChecked ? 'check_circle' : 'circle'}
                                        </span>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-lg pt-md border-t border-[#dde0e2] flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setIsDetailEditMode(false)}
                          className="flex-1 py-2.5 border border-[#717785] text-[#414754] font-semibold text-sm rounded-xl active:scale-95 transition-all hover:bg-slate-50 bg-white cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            if (!editTaskTitle.trim()) {
                              alert('Por favor, informe o nome da tarefa.');
                              return;
                            }
                            setTasks(prev => prev.map(t => {
                              if (t.id === editingTask.id) {
                                return {
                                  ...t,
                                  title: editTaskTitle.trim(),
                                  dueDate: editTaskDueDate,
                                  description: editTaskDescription.trim(),
                                  priority: editTaskPriority,
                                  assignedStudentIds: editTaskAssignedStudentIds,
                                };
                              }
                              return t;
                            }));
                            setEditingTask(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                title: editTaskTitle.trim(),
                                dueDate: editTaskDueDate,
                                description: editTaskDescription.trim(),
                                priority: editTaskPriority,
                                assignedStudentIds: editTaskAssignedStudentIds,
                              };
                            });
                            setIsDetailEditMode(false);
                            alert('Tarefa atualizada com sucesso! 🚀');
                          }}
                          className="flex-1 py-2.5 bg-primary text-white font-semibold text-sm rounded-xl shadow-md shadow-primary/20 active:scale-95 transition-all hover:brightness-110 cursor-pointer border-none"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAddStudentOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#131b2e]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl border border-[#c1c6d6] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-[#dde0e2] pb-4">
                <h3 className="text-xl font-extrabold text-[#131b2e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_add</span>
                  Adicionar Novo Aluno
                </h3>
                <button 
                  onClick={() => setIsAddStudentOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-transparent border-none"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome Completo</label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: Beatriz Silva"
                    className="bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">E-mail</label>
                  <input
                    type="email"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    placeholder="Ex: beatriz.silva@email.com"
                    className="bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Turma</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="bg-[#f2f3ff] border border-[#c1c6d6] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#005bb3] outline-none"
                  >
                    <option value="Turma A - 3º Ano">Turma A - 3º Ano</option>
                    <option value="Turma B - 3º Ano">Turma B - 3º Ano</option>
                    <option value="Turma C - 3º Ano">Turma C - 3º Ano</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Progresso Inicial (%)</label>
                    <span className="text-xs font-bold text-primary">{newStudentProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newStudentProgress}
                    onChange={(e) => setNewStudentProgress(Number(e.target.value))}
                    className="w-full h-1.5 bg-[#eaedff] rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#dde0e2]">
                <button
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer border-none"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!newStudentName.trim()) {
                      alert('Por favor, informe o nome do aluno.');
                      return;
                    }
                    const email = newStudentEmail.trim() || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@email.com`;
                    const newStudent = {
                      id: 'st-' + Math.random().toString(36).substring(2, 9),
                      name: newStudentName.trim(),
                      class: newStudentClass,
                      img: `https://images.unsplash.com/photo-${['1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80', '1500648767791-00dcc994a43e'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150&h=150`,
                      progress: newStudentProgress,
                      matricula: String(202400 + students.length + 1)
                    };
                    setStudents([...students, newStudent]);
                    setIsAddStudentOpen(false);
                    setNewStudentName('');
                    setNewStudentEmail('');
                    setNewStudentProgress(0);
                    alert(`Estudante "${newStudent.name}" adicionado com sucesso!`);
                  }}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl cursor-pointer shadow border-none"
                >
                  Salvar Aluno
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Salvar Alunos */}
        <AnimatePresence>
          {isSaveModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#131b2e]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsSaveModalOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#c1c6d6] max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-[#dde0e2] space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#131b2e]">Salvar Alunos</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Selecione os alunos que deseja processar e salvar no backup na nuvem.</p>
                    </div>
                    <button
                      onClick={() => setIsSaveModalOpen(false)}
                      className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-transparent border-none"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  
                  <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition-colors w-full">
                    <input
                      type="checkbox"
                      id="selectAllSave"
                      checked={selectedStudentIdsSave.length === students.length && students.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsSave(students.map(s => s.id));
                        } else {
                          setSelectedStudentIdsSave([]);
                        }
                      }}
                      className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-700">Selecionar Todos ({students.length})</span>
                  </label>
                </div>

                {/* Modal Body Grid */}
                <div className="p-6 md:p-8 overflow-y-auto grow bg-[#faf8ff]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {students.map((student) => {
                      const isChecked = selectedStudentIdsSave.includes(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            setSelectedStudentIdsSave(prev =>
                              prev.includes(student.id)
                                ? prev.filter(id => id !== student.id)
                                : [...prev, student.id]
                            );
                          }}
                          className={`group relative p-4 rounded-2xl border transition-all flex flex-col gap-3 cursor-pointer ${
                            isChecked
                              ? 'border-primary bg-[#eaedff]/30 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <img
                              src={student.img}
                              alt={student.name}
                              className="w-12 h-12 rounded-full border border-slate-100 object-cover"
                            />
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary pointer-events-none"
                            />
                          </div>
                          
                          <div>
                            <p className="font-bold text-sm text-slate-800">{student.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Status: {' '}
                              <span className={student.progress >= 50 ? 'text-primary font-bold' : 'text-red-500 font-bold'}>
                                {student.progress >= 50 ? 'Ativo' : 'Pendente'}
                              </span>
                            </p>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Progresso</span>
                              <span>{student.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${student.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-[#dde0e2] bg-white flex justify-end items-center gap-3">
                  <button
                    onClick={() => setIsSaveModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl cursor-pointer border-none"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStudentIdsSave.length === 0) {
                        alert('Por favor, selecione pelo menos um estudante para salvar.');
                        return;
                      }
                      // Simulate cloud save
                      alert(`Sincronização com a nuvem ABBA DIGITAL concluída!\nDados de progresso de ${selectedStudentIdsSave.length} alunos salvos com sucesso.`);
                      setIsSaveModalOpen(false);
                    }}
                    className="px-6 py-2.5 bg-primary hover:opacity-90 text-on-primary text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-primary/10 border-none flex items-center gap-1.5 active:scale-95 duration-100"
                  >
                    <span className="material-symbols-outlined text-[18px]">cloud</span>
                    Salvar Alunos
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Excluir Alunos */}
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#131b2e]/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsDeleteModalOpen(false);
              }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white rounded-3xl border border-[#c1c6d6] max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
              >
                {/* Modal Header */}
                <div className="p-6 md:p-8 border-b border-[#dde0e2] flex justify-between items-center">
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
                    <h3 className="text-xl font-extrabold">Excluir Alunos</h3>
                  </div>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer bg-transparent border-none"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Toolbar */}
                <div className="px-6 md:px-8 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      id="selectAllDelete"
                      checked={selectedStudentIdsDelete.length === students.length && students.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIdsDelete(students.map(s => s.id));
                        } else {
                          setSelectedStudentIdsDelete([]);
                        }
                      }}
                      className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary transition-all cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800 transition-colors">Selecionar Todos</span>
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{selectedStudentIdsDelete.length} alunos selecionados</span>
                    <button
                      onClick={() => {
                        if (selectedStudentIdsDelete.length === 0) {
                          alert('Nenhum aluno selecionado para exclusão.');
                          return;
                        }
                        if (confirm(`Tem certeza de que deseja excluir permanentemente os ${selectedStudentIdsDelete.length} alunos selecionados?`)) {
                          // Update students list
                          setStudents(prev => prev.filter(s => !selectedStudentIdsDelete.includes(s.id)));
                          // Clear selection
                          setSelectedStudentIdsDelete([]);
                          // Close modal
                          setIsDeleteModalOpen(false);
                          alert('Alunos selecionados excluídos com sucesso! 🗑️');
                        }
                      }}
                      className="bg-red-100 hover:bg-red-200 text-red-600 w-9 h-9 rounded-full font-bold flex items-center justify-center cursor-pointer transition-all border-none active:scale-90"
                      title="Excluir selecionados em lote"
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>delete</span>
                    </button>
                  </div>
                </div>

                {/* Modal Body Grid */}
                <div className="p-6 md:p-8 overflow-y-auto grow bg-[#faf8ff]">
                  {students.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-sm">
                      Nenhum aluno cadastrado no momento.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {students.map((student) => {
                        const isChecked = selectedStudentIdsDelete.includes(student.id);
                        return (
                          <div
                            key={student.id}
                            onClick={() => {
                              setSelectedStudentIdsDelete(prev =>
                                prev.includes(student.id)
                                  ? prev.filter(id => id !== student.id)
                                  : [...prev, student.id]
                              );
                            }}
                            className={`group relative p-4 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer ${
                              isChecked
                                ? 'border-primary bg-[#eaedff]/30 shadow-sm'
                                : 'bg-white border-slate-200 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="absolute top-3 right-3 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary pointer-events-none"
                            />
                            
                            <img
                              src={student.img}
                              alt={student.name}
                              className="w-12 h-12 rounded-full object-cover border border-slate-100"
                            />
                            
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="font-bold text-sm text-slate-800 truncate">{student.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">Matrícula: {student.matricula}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 md:p-8 border-t border-[#dde0e2] bg-white flex justify-end">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer border-none"
                  >
                    Fechar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};
