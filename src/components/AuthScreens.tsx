import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { supabase } from '../supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onGoToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onGoToSignup }) => {
  const [activeTab, setActiveTab] = useState<'email' | 'code'>('code');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isTeacherCodeMode, setIsTeacherCodeMode] = useState<boolean>(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [studentEmailInput, setStudentEmailInput] = useState('');
  const [alphanumericCode, setAlphanumericCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setActiveTab('code'); // Auto-switch to access code tab when offline
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Set default tab on mount based on network state
  useEffect(() => {
    if (!isOnline) {
      setActiveTab('code');
    }
  }, [isOnline]);

  // Pre-fill access code from URL parameters (join/code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get('join') || params.get('code');
    if (joinParam) {
      const cleanParam = joinParam.trim().toUpperCase().replace('ABBA-', '');
      const registryKey = 'abba_invite_codes_registry';
      let matchedRecord = null;
      try {
        const localRegistry = localStorage.getItem(registryKey);
        const registryList = localRegistry ? JSON.parse(localRegistry) : [];
        matchedRecord = registryList.find((item: any) => item.code === cleanParam);
      } catch (err) {
        console.error('Error looking up code registry:', err);
      }

      if (matchedRecord) {
        setAccessCode(matchedRecord.code);
        setActiveTab('code');
      } else {
        setAccessCode(joinParam);
        setActiveTab('code');
      }
    }
  }, []);

  // Check active Supabase session on mount (handles OAuth redirect success)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const loggedUser: User = {
            name: session.user.user_metadata?.name || 'Professor',
            email: session.user.email || '',
            role: 'teacher'
          };
          setSuccessMsg('Autenticação social realizada com sucesso! Redirecionando...');
          setTimeout(() => {
            onLoginSuccess(loggedUser);
          }, 800);
        }
      } catch (err) {
        console.error('Error fetching Supabase session:', err);
      }
    };
    if (isOnline) {
      checkSession();
    }
  }, [isOnline]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isOnline) {
      setErrorMsg('Login por e-mail indisponível em modo offline.');
      return;
    }

    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    // Default teacher account bypass for fast demonstration
    if (email === 'teacher@abba.com' && password === 'admin') {
      const teacherUser: User = {
        name: 'Professor Décio Silva',
        email: email,
        role: 'teacher'
      };
      setSuccessMsg('Login realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        onLoginSuccess(teacherUser);
      }, 1000);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (error) {
        setErrorMsg('Erro ao fazer login: ' + error.message);
        return;
      }

      if (data.user) {
        const user: User = {
          name: data.user.user_metadata?.name || 'Professor',
          email: data.user.email || '',
          role: 'teacher'
        };
        setSuccessMsg('Login realizado com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoginSuccess(user);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg('Erro de conexão: ' + err.message);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!accessCode.trim()) {
      setErrorMsg('Por favor, insira seu Código de Acesso Único.');
      return;
    }

    const trimmedCode = accessCode.trim().toUpperCase();
    const cleanCode = trimmedCode.replace('ABBA-', '');

    // 1. Validate student email input (must be Gmail or Outlook format)
    if (!studentEmailInput.trim()) {
      setErrorMsg('Por favor, informe seu e-mail (Gmail ou Outlook) para acessar.');
      return;
    }
    const emailLower = studentEmailInput.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(?:gmail|outlook)\.com$/;
    if (!emailRegex.test(emailLower)) {
      setErrorMsg('E-mail inválido. O e-mail deve ser do formato @gmail.com ou @outlook.com.');
      return;
    }

    // 2. First, check if this matches our 6-char alphanumeric registry!
    const registryKey = 'abba_invite_codes_registry';
    let matchedRecord = null;
    try {
      const localRegistry = localStorage.getItem(registryKey);
      const registryList = localRegistry ? JSON.parse(localRegistry) : [];
      matchedRecord = registryList.find((item: any) => item.code === cleanCode);
    } catch (err) {
      console.error('Error looking up registry code:', err);
    }

    if (matchedRecord) {
      if (Date.now() > matchedRecord.expiresAt) {
        setErrorMsg('Este código de acesso expirou. Solicite um novo ao professor.');
        return;
      }

      // Update or add student record in abba_students_list
      try {
        const studentListLocal = localStorage.getItem('abba_students_list');
        const studentsList = studentListLocal ? JSON.parse(studentListLocal) : [];
        const index = studentsList.findIndex((s: any) => s.id === matchedRecord.codeId || s.name.toLowerCase() === matchedRecord.name.toLowerCase());
        if (index !== -1) {
          studentsList[index].email = emailLower;
          studentsList[index].lastAccessAt = new Date().toISOString();
          studentsList[index].loginMethod = 'code';
          localStorage.setItem('abba_students_list', JSON.stringify(studentsList));
        } else {
          const newStudent = {
            id: matchedRecord.codeId || `st-${Date.now()}`,
            name: matchedRecord.name,
            class: "Turma A - 3º Ano",
            img: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&q=80&w=150&h=150`,
            progress: 0,
            matricula: `2026${Math.floor(1000 + Math.random() * 9000)}`,
            gender: 'M',
            email: emailLower,
            lastAccessAt: new Date().toISOString(),
            loginMethod: 'code'
          };
          studentsList.push(newStudent);
          localStorage.setItem('abba_students_list', JSON.stringify(studentsList));
        }
      } catch (err) {
        console.error('Error updating student list in login:', err);
      }

      const studentUser: User = {
        name: matchedRecord.name,
        email: emailLower,
        role: 'student',
        codeSession: {
          code: matchedRecord.code,
          expiresAt: matchedRecord.expiresAt,
          codeId: matchedRecord.codeId
        }
      };

      // Record access in localStorage for Teacher's dashboard to see!
      const accessRecord = {
        id: matchedRecord.codeId || `st-${Date.now()}`,
        studentName: matchedRecord.name,
        accessedAt: new Date().toISOString(),
        code: matchedRecord.code
      };
      try {
        const local = localStorage.getItem('abba_students_logged_by_code');
        const list = local ? JSON.parse(local) : [];
        const filtered = list.filter((item: any) => item.studentName.toLowerCase() !== matchedRecord.name.toLowerCase());
        localStorage.setItem('abba_students_logged_by_code', JSON.stringify([accessRecord, ...filtered]));
      } catch (err) {
        console.error(err);
      }

      // Supabase database capture integration
      try {
        await supabase.from('student_logins').insert([
          {
            student_name: matchedRecord.name,
            student_email: emailLower,
            access_code: matchedRecord.code,
            logged_at: new Date().toISOString(),
            login_method: 'code'
          }
        ]);

        // Sincronizar na tabela 'students'
        const { data: existingStudents } = await supabase
          .from('students')
          .select('*')
          .eq('name', matchedRecord.name);

        if (existingStudents && existingStudents.length > 0) {
          await supabase.from('students').update({
            last_access_at: new Date().toISOString(),
            email: emailLower,
            login_method: 'code'
          }).eq('id', existingStudents[0].id);
        } else {
          await supabase.from('students').insert([
            {
              id: matchedRecord.codeId || `st-${Date.now()}`,
              name: matchedRecord.name,
              email: emailLower,
              class: "Turma A - 3º Ano",
              img: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&q=80&w=150&h=150`,
              progress: 0,
              matricula: `2026${Math.floor(1000 + Math.random() * 9000)}`,
              gender: 'M',
              last_access_at: new Date().toISOString(),
              login_method: 'code'
            }
          ]);
        }
      } catch (dbErr) {
        console.warn('Erro ao registrar login do estudante no Supabase:', dbErr);
      }

      setSuccessMsg(`Bem-vindo, ${matchedRecord.name}! Carregando atividades...`);
      setTimeout(() => {
        onLoginSuccess(studentUser);
      }, 1000);
      return;
    }

    // 2. Legacy Base64 fallback (must start with ABBA-)
    if (!trimmedCode.startsWith('ABBA-')) {
      setErrorMsg('Código de acesso inválido. Verifique o código e tente novamente.');
      return;
    }

    try {
      const base64Part = trimmedCode.substring(5);
      const decodedJson = atob(base64Part);
      const sessionData = JSON.parse(decodedJson);

      if (!sessionData.name || !sessionData.expiresAt || !sessionData.codeId) {
        setErrorMsg('Código corrompido ou inválido.');
        return;
      }

      // Check expiration
      if (Date.now() > sessionData.expiresAt) {
        setErrorMsg('Este código de acesso expirou. Solicite um novo ao professor.');
        return;
      }

      // Update or add student record in abba_students_list
      try {
        const studentListLocal = localStorage.getItem('abba_students_list');
        const studentsList = studentListLocal ? JSON.parse(studentListLocal) : [];
        const index = studentsList.findIndex((s: any) => s.id === sessionData.codeId || s.name.toLowerCase() === sessionData.name.toLowerCase());
        if (index !== -1) {
          studentsList[index].email = `student-${sessionData.codeId}@abba.com`;
          studentsList[index].lastAccessAt = new Date().toISOString();
          studentsList[index].loginMethod = 'link';
          localStorage.setItem('abba_students_list', JSON.stringify(studentsList));
        } else {
          const newStudent = {
            id: sessionData.codeId,
            name: sessionData.name,
            class: "Turma A - 3º Ano",
            img: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&q=80&w=150&h=150`,
            progress: 0,
            matricula: `2026${Math.floor(1000 + Math.random() * 9000)}`,
            gender: 'M',
            email: `student-${sessionData.codeId}@abba.com`,
            lastAccessAt: new Date().toISOString(),
            loginMethod: 'link'
          };
          studentsList.push(newStudent);
          localStorage.setItem('abba_students_list', JSON.stringify(studentsList));
        }
      } catch (err) {
        console.error('Error updating student list in login:', err);
      }

      // Active session successful
      const studentUser: User = {
        name: sessionData.name,
        email: `student-${sessionData.codeId}@abba.com`,
        role: 'student',
        codeSession: {
          code: trimmedCode,
          expiresAt: sessionData.expiresAt,
          codeId: sessionData.codeId
        }
      };

      // Record access in localStorage for Teacher's dashboard to see!
      const accessRecord = {
        id: sessionData.codeId,
        studentName: sessionData.name,
        accessedAt: new Date().toISOString(),
        code: trimmedCode
      };
      try {
        const local = localStorage.getItem('abba_students_logged_by_code');
        const list = local ? JSON.parse(local) : [];
        const filtered = list.filter((item: any) => item.studentName.toLowerCase() !== sessionData.name.toLowerCase());
        localStorage.setItem('abba_students_logged_by_code', JSON.stringify([accessRecord, ...filtered]));
      } catch (err) {
        console.error(err);
      }

      // Supabase database capture integration
      try {
        await supabase.from('student_logins').insert([
          {
            student_name: sessionData.name,
            student_email: `student-${sessionData.codeId}@abba.com`,
            access_code: trimmedCode,
            logged_at: new Date().toISOString(),
            login_method: 'link'
          }
        ]);

        // Sincronizar na tabela 'students'
        const { data: existingStudents } = await supabase
          .from('students')
          .select('*')
          .eq('name', sessionData.name);

        if (existingStudents && existingStudents.length > 0) {
          await supabase.from('students').update({
            last_access_at: new Date().toISOString(),
            email: `student-${sessionData.codeId}@abba.com`,
            login_method: 'link'
          }).eq('id', existingStudents[0].id);
        } else {
          await supabase.from('students').insert([
            {
              id: sessionData.codeId || `st-${Date.now()}`,
              name: sessionData.name,
              email: `student-${sessionData.codeId}@abba.com`,
              class: "Turma A - 3º Ano",
              img: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 100)}?auto=format&fit=crop&q=80&w=150&h=150`,
              progress: 0,
              matricula: `2026${Math.floor(1000 + Math.random() * 9000)}`,
              gender: 'M',
              last_access_at: new Date().toISOString(),
              login_method: 'link'
            }
          ]);
        }
      } catch (dbErr) {
        console.warn('Erro ao registrar login do estudante no Supabase:', dbErr);
      }

      setSuccessMsg(`Bem-vindo, ${sessionData.name}! Carregando atividades...`);
      setTimeout(() => {
        onLoginSuccess(studentUser);
      }, 1000);

    } catch (err) {
      setErrorMsg('Falha ao decodificar o código. Verifique e tente novamente.');
    }
  };

  const handleTeacherCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmed = alphanumericCode.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Por favor, insira o código alfanumérico do professor.');
      return;
    }

    if (trimmed === 'ABC123DEF') {
      const teacherUser: User = {
        name: 'Professor Décio Silva',
        email: 'teacher@abba.com',
        role: 'teacher'
      };
      setSuccessMsg('Login de professor realizado com sucesso! Redirecionando...');
      setTimeout(() => {
        onLoginSuccess(teacherUser);
      }, 1000);
    } else {
      setErrorMsg('Código incorreto. Tente "ABC123DEF" para demonstração.');
    }
  };

  // Real social login handlers
  const handleSocialLogin = async (platform: 'google' | 'microsoft') => {
    if (!isOnline) return;
    setErrorMsg(null);
    setSuccessMsg(`Redirecionando para login com ${platform === 'google' ? 'Google' : 'Microsoft'}...`);
    
    try {
      const provider = platform === 'google' ? 'google' : 'azure';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        }
      });
      if (error) {
        setErrorMsg('Erro na autenticação social: ' + error.message);
      }
    } catch (err: any) {
      setErrorMsg('Erro de conexão: ' + err.message);
    }
  };

  const handleUnifiedCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = accessCode.trim().toUpperCase();
    if (trimmed === 'ABC123DEF') {
      handleTeacherCodeLogin(e);
    } else {
      handleCodeLogin(e);
    }
  };

  const isStudentCode = accessCode.trim().length === 6 && accessCode.trim().toUpperCase() !== 'ABC123DEF';

  return (
    <div className="min-h-screen bg-[#d3d8e0] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none selection:bg-blue-100 selection:text-slate-900">
      
      {/* Background Mountain Image underlay */}
      <img 
        src="https://res.cloudinary.com/dudmozd8z/image/upload/q_auto/f_auto/v1778857528/montain_uqtkyt.avif" 
        alt="Fundo Montanha" 
        className="absolute inset-0 w-full h-full object-cover -z-10 scale-105 brightness-[0.75] mask-gradient" 
      />
      
      {/* White Main Box container */}
      <div className="w-full max-w-[960px] min-h-[640px] md:h-[640px] bg-white rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-white/20 z-10">
        
        {/* Left half (Login Form fields) */}
        <div className="w-full md:w-1/2 h-full px-6 py-8 sm:px-12 sm:py-10 flex flex-col justify-between text-left gap-6 overflow-y-auto">
          
          {/* Header/Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-slate-800 rounded-xl rotate-45 flex items-center justify-center shadow-md shadow-slate-900/10 shrink-0">
              <img 
                src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779315941/logoabra2_kls3we.svg" 
                alt="ABBA Logo" 
                className="w-5 h-5 -rotate-45 object-contain"
              />
            </div>
            <div className="text-left">
              <h2 className="text-slate-900 font-extrabold text-base leading-none tracking-tight">ABBA DIGITAL</h2>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mt-0.5">Portal da Educação</span>
            </div>
          </div>

          {/* Form and Controls */}
          <div className="w-full flex flex-col gap-4 my-auto max-w-[340px] mx-auto">
            <div className="text-left">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Olá, bem-vindo<br /> de volta! 👋🏽</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">
                {activeTab === 'code' 
                  ? 'Insira o seu código para entrar na plataforma.' 
                  : 'Insira suas credenciais de professor para acessar.'}
              </p>
            </div>

            {/* Offline notification badge */}
            <AnimatePresence>
              {!isOnline && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-[#ffdad6] text-[#93000a] rounded-xl border border-red-200 text-[11px] leading-tight flex items-start gap-2"
                >
                  <span className="material-symbols-outlined shrink-0 text-red-600 text-[16px] mt-0.5">wifi_off</span>
                  <div>
                    <span className="font-bold block">Você está offline!</span>
                    Login por e-mail desativado. Use seu **Código de Acesso Único** simples para entrar localmente.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error and Success Notifications */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-xl"
                >
                  {errorMsg}
                </motion.div>
              )}
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-xs font-bold rounded-r-xl"
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Small Modern Segmented Sliders tabs control */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-1">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex-grow py-2 rounded-lg font-bold text-xs transition-all cursor-pointer border-none ${
                  activeTab === 'code'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 bg-transparent'
                }`}
              >
                Entrar com Código
              </button>
              <button
                type="button"
                onClick={() => isOnline && setActiveTab('email')}
                disabled={!isOnline}
                className={`flex-grow py-2 rounded-lg font-bold text-xs transition-all cursor-pointer border-none ${
                  activeTab === 'email'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 bg-transparent'
                } ${!isOnline ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                E-mail e Senha
              </button>
            </div>

            {/* Main Fields Form */}
            <form 
              onSubmit={activeTab === 'code' ? handleUnifiedCodeSubmit : handleEmailLogin}
              className="space-y-3.5"
            >
              {activeTab === 'code' ? (
                // TAB 1: CODE LOGIN (STUDENTS / TEACHERS DEMO)
                <div className="space-y-3">
                  
                  {/* Code Input Field */}
                  <div className="w-full bg-white border-2 border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner shadow-slate-50 focus-within:border-slate-300 transition-all">
                    <div className="flex items-center gap-3.5 w-full">
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">vpn_key</span>
                      </div>
                      <div className="flex-grow text-left">
                        <span className="text-slate-400 text-[11px] font-bold block leading-none">Código de Acesso</span>
                        <input
                          type="text"
                          placeholder="Ex: ABC123DEF ou NKOHML"
                          className="text-slate-900 text-sm font-bold block mt-1 w-full bg-transparent border-none outline-none focus:ring-0 p-0 font-mono uppercase tracking-wider"
                          value={accessCode}
                          onChange={(e) => {
                            setAccessCode(e.target.value);
                            setAlphanumericCode(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Student E-mail field disclosure */}
                  <AnimatePresence>
                    {isStudentCode && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full bg-white border-2 border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner shadow-slate-50 focus-within:border-slate-300 transition-all"
                      >
                        <div className="flex items-center gap-3.5 w-full">
                          <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </div>
                          <div className="flex-grow text-left">
                            <span className="text-slate-400 text-[11px] font-bold block leading-none">Seu E-mail (Gmail ou Outlook)</span>
                            <input
                              type="email"
                              placeholder="exemplo@gmail.com"
                              className="text-slate-900 text-sm font-bold block mt-1 w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                              value={studentEmailInput}
                              onChange={(e) => setStudentEmailInput(e.target.value)}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // TAB 2: EMAIL LOGIN (TEACHERS STANDARD)
                <div className="space-y-3">
                  
                  {/* Teacher E-mail */}
                  <div className="w-full bg-white border-2 border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner shadow-slate-50 focus-within:border-slate-300 transition-all">
                    <div className="flex items-center gap-3.5 w-full">
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">mail</span>
                      </div>
                      <div className="flex-grow text-left">
                        <span className="text-slate-400 text-[11px] font-bold block leading-none">E-mail do Professor</span>
                        <input
                          type="email"
                          placeholder="professor@email.com"
                          className="text-slate-900 text-sm font-bold block mt-1 w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Teacher Password */}
                  <div className="w-full bg-white border-2 border-slate-100 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-inner shadow-slate-50 focus-within:border-slate-300 transition-all">
                    <div className="flex items-center gap-3.5 w-full">
                      <div className="p-2.5 bg-slate-50 text-slate-700 rounded-xl border border-slate-100 shrink-0 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">lock</span>
                      </div>
                      <div className="flex-grow text-left">
                        <span className="text-slate-400 text-[11px] font-bold block leading-none">Senha</span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="text-slate-900 text-sm font-bold block mt-1 w-full bg-transparent border-none outline-none focus:ring-0 p-0"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {showPassword ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submission Button */}
              <button 
                type="submit"
                className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm py-4 rounded-2xl transition-all active:scale-[0.99] shadow-md shadow-slate-950/10 cursor-pointer border-none"
              >
                Acessar
              </button>
            </form>

            {/* Social logins option if online */}
            {isOnline && (
              <>
                <div className="flex items-center justify-between my-1">
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                  <span className="text-slate-400 text-[10px] font-black uppercase px-3 tracking-widest">ou</span>
                  <div className="h-[1px] bg-slate-100 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="border-2 border-slate-100 hover:bg-slate-50 bg-white px-4 py-3 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-2 text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
                    <div>
                      <span className="text-slate-400 text-[9px] font-bold block leading-none">Google</span>
                      <span className="text-slate-800 text-[10px] font-black block mt-0.5">Acesso Rápido</span>
                    </div>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialLogin('microsoft')}
                    className="border-2 border-slate-100 hover:bg-slate-50 bg-white px-4 py-3 rounded-2xl transition-all active:scale-[0.98] flex items-center gap-2 text-left cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-slate-900 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.56 2.95-1.39z"/></svg>
                    <div>
                      <span className="text-slate-400 text-[9px] font-bold block leading-none">Microsoft</span>
                      <span className="text-slate-800 text-[10px] font-black block mt-0.5">Acesso Rápido</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom links and sign up */}
          <div className="max-w-[370px] text-[10px] text-slate-400 font-medium leading-normal text-left">
            <span>© 2026 Abba Digital. Todos os direitos reservados. </span>
            <button 
              type="button"
              onClick={onGoToSignup}
              className="text-[#005bb3] font-bold hover:underline cursor-pointer border-none bg-transparent"
            >
              Criar Conta de Professor
            </button>
          </div>
        </div>

        {/* Right half (Mountain display, hidden on mobile) */}
        <div className="w-1/2 h-full p-4 relative hidden md:block select-none">
          <div className="w-full h-full rounded-tl-[24px] rounded-br-[80px] rounded-bl-none rounded-tr-none overflow-hidden relative shadow-inner">
            <img 
              src="https://res.cloudinary.com/dudmozd8z/image/upload/q_auto/f_auto/v1778857528/montain_uqtkyt.avif" 
              alt="Mountain View Internal" 
              className="w-full h-full object-cover scale-105 brightness-[0.72] object-center" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>

            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-slate-900 font-bold text-xs px-4 py-2.5 rounded-full shadow-md flex items-center gap-1.5 cursor-pointer">
              Abba digital
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" x2="17" y1="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
            </div>

            <div className="absolute bottom-8 inset-x-6 flex flex-col gap-4 text-left">
              <div className="text-white">
                <span className="text-xs font-bold text-slate-300 block">Descobrindo o melhor!</span>
                <h4 className="text-lg font-black tracking-tight leading-snug mt-1.5 max-w-[340px]">
                  "Ábaco brasileiro interativo para alfabetização bilíngue de suas turmas."
                </h4>
              </div>

              <div className="flex items-center gap-2.5 text-[11px] font-bold text-white select-none">
                <div className="border border-white/35 backdrop-blur-md bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  100% Interativo
                </div>
                <div className="border border-white/35 backdrop-blur-md bg-white/5 rounded-full px-4 py-2.5 flex items-center gap-1.5 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
                  Acesso Offline
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-[3px] bg-white rounded-full w-12 transition-all"></div>
                <div className="h-[3px] bg-white/30 rounded-full w-8 transition-all"></div>
                <div className="h-[3px] bg-white/30 rounded-full w-8 transition-all"></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};


interface SignupScreenProps {
  onSignupSuccess: () => void;
  onGoToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignupSuccess, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '');
    setName(cleanValue);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Você precisa aceitar os Termos e Políticas de Privacidade.');
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: { data: { name: name.trim(), role: 'teacher' } }
      });

      if (error) {
        setErrorMsg('Erro ao cadastrar: ' + error.message);
        return;
      }

      setSuccessMsg('Cadastro realizado com sucesso! Redirecionando...');
      setTimeout(onSignupSuccess, 1500);
    } catch (err: any) {
      setErrorMsg('Erro: ' + err.message);
    }
  };

  const handleSocialSignup = async (platform: 'google' | 'microsoft') => {
    setErrorMsg(null);
    setSuccessMsg(`Redirecionando para ${platform === 'google' ? 'Google' : 'Microsoft'}...`);
    try {
      const provider = platform === 'google' ? 'google' : 'azure';
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) {
        setErrorMsg('Erro na autenticação: ' + error.message);
        setSuccessMsg(null);
      }
    } catch (err: any) {
      setErrorMsg('Erro de conexão: ' + err.message);
      setSuccessMsg(null);
    }
  };

  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#faf8ff', color: '#131b2e' }}>

      {/* ═══ HEADER ═══ */}
      <header
        className="fixed top-0 w-full z-50 border-b"
        style={{ backgroundColor: 'rgba(250, 248, 255, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: '#c1c6d6' }}
      >
        <div className="flex justify-between items-center w-full mx-auto" style={{ maxWidth: 1200, padding: '16px 20px' }}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={onGoToLogin}>
            <img src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779315941/logoabra2_kls3we.svg" alt="ABBA Logo" className="w-8 h-8 object-contain" />
            <span style={{ color: '#005bb3', fontSize: 28, lineHeight: '36px', fontWeight: 600, letterSpacing: '-0.02em' }}>ABBA DIGITAL</span>
          </div>
          <div className="flex items-center" style={{ gap: 16 }}>
            <span className="hidden md:inline" style={{ color: '#414754', fontSize: 13, lineHeight: '18px', fontWeight: 500 }}>Já tem uma conta?</span>
            <button
              onClick={onGoToLogin}
              className="cursor-pointer border-none bg-transparent"
              style={{ color: '#005bb3', fontWeight: 700, fontSize: 14, padding: '4px 8px' }}
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN ═══ */}
      <main className="flex-grow flex items-stretch" style={{ paddingTop: 72 }}>
        <div className="flex w-full" style={{ minHeight: '100%' }}>

          {/* ── LEFT PANEL: Hero image + Glass card ── */}
          <section className="hidden lg:flex relative overflow-hidden items-center justify-center" style={{ width: '50%', padding: 32 }}>
            {/* Background image */}
            <div className="absolute inset-0" style={{ zIndex: 0 }}>
              <img
                alt="Estudantes colaborando"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJM3W4OSkGFPWU6UimtB-Fvcrjrrzuub3IVwCevEH8sgByQgET-iZnCLaCzHbZXgi7_DRtGzWNq1APFm37XN978EpVU5WEXCB4dIRSnq9g43xk9TqB_lFfcXC9epBV9AIUWJ-DY56TluzXRcgSP8EpNH6YWK9jOHTRV05uEY0TcDe-kL4LmACJfJ54BG7TSCrj4vf55fwLZO7BBml0Ihm1MxZR2S4laeHiLldwWlOwZ083rXhdzSyk6htg1NKtSmp3ni7ZMeWPL9_w"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top right, rgba(0,91,179,0.4), rgba(0,115,224,0.2))', mixBlendMode: 'multiply' }} />
            </div>

            {/* Glass card */}
            <div
              className="relative"
              style={{
                zIndex: 10,
                maxWidth: 512,
                width: '100%',
                padding: 32,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              }}
            >
              <h1 style={{ fontWeight: 600, fontSize: 28, lineHeight: '36px', letterSpacing: '-0.02em', color: '#131b2e', marginBottom: 16 }}>
                Expanda seus horizontes com o Abba Digital.
              </h1>
              <p style={{ fontSize: 16, lineHeight: '24px', color: '#414754', whiteSpace: 'pre-wrap' }}>
                Abba Digital é a evolução online do método ABBA: uma plataforma que transforma os cubos físicos em experiências interativas para leitura, escrita e práticas bilíngues, acessíveis de qualquer lugar
              </p>
              <div className="flex items-center" style={{ marginTop: 32, gap: 16 }}>
                <div className="flex" style={{ marginLeft: 0 }}>
                  <img alt="User 1" className="w-10 h-10 rounded-full" style={{ border: '2px solid #faf8ff', marginRight: -12 }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE7Zl4eLsTwLr1CnPreQc7_143RMvlmv8fV9QgzaBURfjdtjnGii4i0Jq_jyfssUREgesEKpmTkiZsT7j1_RbKBt93oZzMYrKbWdqpOhyRtrjHq80RPIpbzmABShKulRCvb2_n4YSroPdHfNha7mntyKet3rbKa3MGdIOqWnlDYwtGBRgwhHKx7WwURT6t1g7aB9o0KAR40R4QUQqG-xqIRVDRVkkMfDKcpYxFjoC24vDCRHVTqqeMYvE8qPN_Hb3B_13dtutd892D" />
                  <img alt="User 2" className="w-10 h-10 rounded-full" style={{ border: '2px solid #faf8ff', marginRight: -12 }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9meeOXPXwLVfWzM30w-DR8sjrUx2srrdCRzljhbkP2c22W5GRir2REb3MGASHLISGyiTFtheRlr20wxOLRp07CdVMvLuG2Zh3AWv3vhCHnvazcKf-XB7PQYv7u4qJYxNbmr-gYcj820-cZAXKOUJ6zDiwVaC0uAeEmlec9wAQjwaR4Iqd0pVEdRDVcmHJBf_P0Ii6l5fiiHl8wtbbLvZ5r_No8aUxoP1S7NZ4VsPmJFyJIlGc1mVU5PAfuQP6BRYkjgEIYG8ndXt4" />
                  <img alt="User 3" className="w-10 h-10 rounded-full" style={{ border: '2px solid #faf8ff', marginRight: -12 }} src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtt-wVq_Q5H8vbqqp93I1TYU-uLntQHjQwiN8u3KzcVqJ4Nj5BZSDs67N1lXkV7H6G-8pFppEZGENb0yZbERZdUcarWFY1pFLihPuzXC8lWZRhaSwf3TPr41pkqnbHXtcr5l0nBjp4aKER5XwY7DgF-TabnDZy44ttdd9RtUrp9LaiEj_eKLAZI31ofp3hzNY209moYRrsfIwdrBLTW_cYrxVTADH1gN2JqA_JFFrpNNThLhTGKo5A133THqdhQ0Ocz-YbqA3XdZiZ" />
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '2px solid #faf8ff', backgroundColor: '#005bb3', color: '#fff', fontSize: 12, fontWeight: 700 }}>+</div>
                </div>
                <span style={{ color: '#414754', fontSize: 13, lineHeight: '18px', fontWeight: 500 }}>Educação levada a sério.</span>
              </div>
            </div>
          </section>

          {/* ── RIGHT PANEL: Signup form ── */}
          <section className="w-full lg:w-auto flex items-center justify-center" style={{ flex: '1 1 50%', padding: '20px', backgroundColor: '#faf8ff' }}>
            <div className="w-full flex flex-col" style={{ maxWidth: 440, gap: 32 }}>

              {/* Title block */}
              <div className="flex flex-col" style={{ gap: 8 }}>
                <h2 style={{ fontWeight: 600, fontSize: 28, lineHeight: '36px', letterSpacing: '-0.02em', color: '#131b2e' }}>Criar Conta</h2>
                <p style={{ fontSize: 14, lineHeight: '20px', color: '#414754' }}>Comece sua jornada educacional hoje mesmo.</p>
              </div>

              {/* Error / Success feedback */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: 14, backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', fontSize: 12, fontWeight: 600, borderRadius: 12 }}
                  >
                    {errorMsg}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ padding: 14, backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e', color: '#15803d', fontSize: 12, fontWeight: 600, borderRadius: 12 }}
                  >
                    {successMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form area */}
              <div className="flex flex-col" style={{ gap: 16 }}>
                <h3 style={{ fontWeight: 600, fontSize: 16, lineHeight: '24px', color: '#131b2e', marginBottom: 8 }}>Crie sua conta com:</h3>

                {/* Social buttons */}
                <div className="flex flex-col" style={{ gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => handleSocialSignup('google')}
                    className="w-full flex items-center justify-center cursor-pointer group"
                    style={{ gap: 16, padding: '16px 24px', border: '1px solid #c1c6d6', borderRadius: 8, backgroundColor: 'transparent', transition: 'background-color 200ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2f3ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img alt="Google Logo" className="w-5 h-5" src="src/assets/icons/Google logo.svg" />
                    <span style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754' }}>Entrar com o Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialSignup('microsoft')}
                    className="w-full flex items-center justify-center cursor-pointer group"
                    style={{ gap: 16, padding: '16px 24px', border: '1px solid #c1c6d6', borderRadius: 8, backgroundColor: 'transparent', transition: 'background-color 200ms' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f2f3ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <img alt="Microsoft Logo" className="w-5 h-5" src="src/assets/icons/Microsoft_logo.svg" />
                    <span style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754' }}>Entrar com o Microsoft</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center" style={{ padding: '16px 0' }}>
                  <div className="flex-grow" style={{ borderTop: '1px solid #c1c6d6' }} />
                  <span style={{ flexShrink: 0, margin: '0 16px', fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#717785' }}>OU</span>
                  <div className="flex-grow" style={{ borderTop: '1px solid #c1c6d6' }} />
                </div>

                {/* Email form */}
                <form onSubmit={handleSignupSubmit} className="flex flex-col" style={{ gap: 16 }}>

                  {/* Nome */}
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <label style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754', marginLeft: 4 }} htmlFor="signup-name">Nome Completo</label>
                    <input
                      style={{ width: '100%', height: 48, padding: '0 16px', backgroundColor: '#ffffff', border: '1px solid #c1c6d6', borderRadius: 8, outline: 'none', fontSize: 14, lineHeight: '20px', color: '#131b2e', transition: 'all 200ms' }}
                      id="signup-name"
                      placeholder="Ex: Maria Silva"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#005bb3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,91,179,0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#c1c6d6'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col" style={{ gap: 4 }}>
                    <label style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754', marginLeft: 4 }} htmlFor="signup-email">Email Profissional</label>
                    <input
                      style={{ width: '100%', height: 48, padding: '0 16px', backgroundColor: '#ffffff', border: '1px solid #c1c6d6', borderRadius: 8, outline: 'none', fontSize: 14, lineHeight: '20px', color: '#131b2e', transition: 'all 200ms' }}
                      id="signup-email"
                      placeholder="nome@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#005bb3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,91,179,0.2)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#c1c6d6'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Senha + Confirmar lado a lado em md+ */}
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16 }}>
                    <div className="flex flex-col" style={{ gap: 4 }}>
                      <label style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754', marginLeft: 4 }} htmlFor="signup-password">Senha</label>
                      <div className="relative">
                        <input
                          style={{ width: '100%', height: 48, padding: '0 40px 0 16px', backgroundColor: '#ffffff', border: '1px solid #c1c6d6', borderRadius: 8, outline: 'none', fontSize: 14, lineHeight: '20px', color: '#131b2e', transition: 'all 200ms' }}
                          id="signup-password"
                          placeholder="••••••••"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={(e) => { e.currentTarget.style.borderColor = '#005bb3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,91,179,0.2)'; }}
                          onBlur={(e) => { e.currentTarget.style.borderColor = '#c1c6d6'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          className="absolute cursor-pointer border-none bg-transparent"
                          style={{ right: 12, top: '50%', transform: 'translateY(-50%)', color: '#717785', transition: 'color 200ms' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#005bb3')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#717785')}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col" style={{ gap: 4 }}>
                      <label style={{ fontSize: 13, lineHeight: '18px', fontWeight: 500, color: '#414754', marginLeft: 4 }} htmlFor="signup-confirm">Confirmar Senha</label>
                      <input
                        style={{ width: '100%', height: 48, padding: '0 16px', backgroundColor: '#ffffff', border: '1px solid #c1c6d6', borderRadius: 8, outline: 'none', fontSize: 14, lineHeight: '20px', color: '#131b2e', transition: 'all 200ms' }}
                        id="signup-confirm"
                        placeholder="••••••••"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#005bb3'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,91,179,0.2)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#c1c6d6'; e.currentTarget.style.boxShadow = 'none'; }}
                      />
                    </div>
                  </div>

                  {/* Termos checkbox */}
                  <div className="flex items-start" style={{ gap: 16, marginTop: 8 }}>
                    <input
                      className="cursor-pointer"
                      style={{ marginTop: 4, width: 16, height: 16, accentColor: '#005bb3', borderRadius: 4 }}
                      id="signup-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#414754' }} htmlFor="signup-terms" className="cursor-pointer select-none">
                      Eu concordo com os{' '}
                      <a href="#" style={{ color: '#005bb3' }} className="hover:underline">Termos de Serviço</a>
                      {' '}e com a{' '}
                      <a href="#" style={{ color: '#005bb3' }} className="hover:underline">Política de Privacidade</a>
                      {' '}do Abba digital.
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full cursor-pointer border-none"
                    style={{
                      marginTop: 16,
                      height: 48,
                      backgroundColor: '#005bb3',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 14,
                      borderRadius: 8,
                      boxShadow: '0 10px 15px -3px rgba(0,91,179,0.2)',
                      transition: 'all 200ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0073e0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#005bb3')}
                  >
                    Criar Minha Conta
                  </button>
                </form>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ backgroundColor: '#f2f3ff', borderTop: '1px solid #c1c6d6' }}>
        <div className="w-full flex flex-col md:flex-row justify-between items-center mx-auto" style={{ maxWidth: 1200, padding: '16px 20px', gap: 16 }}>
          <div style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#5f6365' }}>© 2026 Abba Digital. Todos os direitos reservados.</div>
          <div className="flex" style={{ gap: 24 }}>
            <a href="#" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#5f6365' }} className="hover:text-[#005bb3] transition-colors">Política de privacidade</a>
            <a href="#" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#5f6365' }} className="hover:text-[#005bb3] transition-colors">Termos de uso</a>
            <a href="#" style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: '#5f6365' }} className="hover:text-[#005bb3] transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

