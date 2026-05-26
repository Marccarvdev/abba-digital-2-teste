import React, { SVGProps, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from './Loader';
import styled from 'styled-components';


// Custom icons to keep everything clean and self-contained
const ArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const WhatsAppIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const GmailIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

const CalendarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Mapped metadata for the 8 sequential gallery images
const GALLERY_ITEMS = [
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/tabvermelho_iuejrf.avif",
    title: "Tabela de Letras Vermelhas (Alemão)",
    description: "Tabela em formato A4 para os exercícios do ABBA analógico na língua alemã."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565247/tabazul_eplu2h.avif",
    title: "Tabela de Letras Azuis (Inglês)",
    description: "Tabela em formato A4 para os exercícios na língua inglesa."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/tabpreto_dbwmcl.avif",
    title: "Tabela de Letras Pretas (Português)",
    description: "Tabela em formato A4 para os exercícios na língua portuguesa."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palavras1_hj2w4z.avif",
    title: "Palavras Escritas com os Cubos (Exemplo 1)",
    description: "Exemplo de palavras montadas e alinhadas empiricamente em paralelo."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palavras2_bky3wy.avif",
    title: "Palavras Escritas com os Cubos (Exemplo 2)",
    description: "Destaque para a correspondência de cores e caracteres entre as línguas."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palav3_bhesqe.avif",
    title: "Frases Escritas com os Cubos (Exemplo 1)",
    description: "Montagem física de frases integradoras usando os cubos do ABBA."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565245/palavr4_qbydb0.avif",
    title: "Frases Escritas com os Cubos (Exemplo 2)",
    description: "Tradução paralela e consolidação da velocidade de leitura e escrita."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565245/painel_k2fqw5.avif",
    title: "O Painel Magnético do ABBA",
    description: "Estrutura metálica de apoio para fixação dos cubos e treinamento pedagógico."
  },
  {
    src: "https://res.cloudinary.com/dudmozd8z/image/upload/v1779565508/habenter_cfxsmy.avif",
    title: "A Camiseta Bordada do ABBA",
    description: "Apresentação da identidade visual do ábaco bilingue."
  }
];

const GALLERY_GROUPS: Record<string, typeof GALLERY_ITEMS> = {
  tables: [
    GALLERY_ITEMS[0],
    GALLERY_ITEMS[1],
    GALLERY_ITEMS[2]
  ],
  words: [
    GALLERY_ITEMS[3],
    GALLERY_ITEMS[4]
  ],
  phrases: [
    GALLERY_ITEMS[5],
    GALLERY_ITEMS[6]
  ],
  panel: [
    GALLERY_ITEMS[7]
  ],
  shirt: [
    GALLERY_ITEMS[8]
  ]
};

const renderAbacusBlockSVG = (letter: string) => {
  return (
    <span className="inline-block align-middle mx-1.5 select-none font-sans">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.12)]">
        {/* Extruded base for depth */}
        <rect x="0" y="2" width="28" height="26" rx="5" fill="#D1D5DB" />
        {/* Main top face of block */}
        <rect x="0" y="0" width="28" height="25" rx="5" fill="#FFFFFF" />
        {/* Subtle top bezel highlight */}
        <rect x="1" y="1" width="26" height="23" rx="4" fill="none" stroke="#E2E8F0" strokeWidth="1" />
        {/* Centered Bold Letter */}
        <text 
          x="14" 
          y="17" 
          textAnchor="middle" 
          fill="#000000" 
          fontSize="14" 
          fontWeight="900" 
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
        >
          {letter}
        </text>
      </svg>
    </span>
  );
};

const StyledThemeSwitch = styled.div`
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
    scale: 0.85; /* Slightly scaled for modern proportions */
  }

  .switch #theme-toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2196f3;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    z-index: 0;
    overflow: hidden;
  }

  .sun-moon {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: yellow;
    -webkit-transition: 0.4s;
    transition: 0.4s;
  }

  #theme-toggle-input:checked + .slider {
    background-color: black;
  }

  #theme-toggle-input:focus + .slider {
    box-shadow: 0 0 1px #2196f3;
  }

  #theme-toggle-input:checked + .slider .sun-moon {
    -webkit-transform: translateX(26px);
    -ms-transform: translateX(26px);
    transform: translateX(26px);
    background-color: white;
    -webkit-animation: rotate-center 0.6s ease-in-out both;
    animation: rotate-center 0.6s ease-in-out both;
  }

  .moon-dot {
    opacity: 0;
    transition: 0.4s;
    fill: gray;
  }

  #theme-toggle-input:checked + .slider .sun-moon .moon-dot {
    opacity: 1;
  }

  .slider.round {
    border-radius: 34px;
  }

  .slider.round .sun-moon {
    border-radius: 50%;
  }

  #moon-dot-1 {
    left: 10px;
    top: 3px;
    position: absolute;
    width: 6px;
    height: 6px;
    z-index: 4;
  }

  #moon-dot-2 {
    left: 2px;
    top: 10px;
    position: absolute;
    width: 10px;
    height: 10px;
    z-index: 4;
  }

  #moon-dot-3 {
    left: 16px;
    top: 18px;
    position: absolute;
    width: 3px;
    height: 3px;
    z-index: 4;
  }

  #light-ray-1 {
    left: -8px;
    top: -8px;
    position: absolute;
    width: 43px;
    height: 43px;
    z-index: -1;
    fill: white;
    opacity: 10%;
  }

  #light-ray-2 {
    left: -50%;
    top: -50%;
    position: absolute;
    width: 55px;
    height: 55px;
    z-index: -1;
    fill: white;
    opacity: 10%;
  }

  #light-ray-3 {
    left: -18px;
    top: -18px;
    position: absolute;
    width: 60px;
    height: 60px;
    z-index: -1;
    fill: white;
    opacity: 10%;
  }

  .cloud-light {
    position: absolute;
    fill: #eee;
    animation-name: cloud-move;
    animation-duration: 6s;
    animation-iteration-count: infinite;
  }

  .cloud-dark {
    position: absolute;
    fill: #ccc;
    animation-name: cloud-move;
    animation-duration: 6s;
    animation-iteration-count: infinite;
    animation-delay: 1s;
  }

  #cloud-1 {
    left: 30px;
    top: 15px;
    width: 40px;
  }

  #cloud-2 {
    left: 44px;
    top: 10px;
    width: 20px;
  }

  #cloud-3 {
    left: 18px;
    top: 24px;
    width: 30px;
  }

  #cloud-4 {
    left: 36px;
    top: 18px;
    width: 40px;
  }

  #cloud-5 {
    left: 48px;
    top: 14px;
    width: 20px;
  }

  #cloud-6 {
    left: 22px;
    top: 26px;
    width: 30px;
  }

  @keyframes cloud-move {
    0% {
      transform: translateX(0px);
    }

    40% {
      transform: translateX(4px);
    }

    80% {
      transform: translateX(-4px);
    }

    100% {
      transform: translateX(0px);
    }
  }

  .stars {
    transform: translateY(-32px);
    opacity: 0;
    transition: 0.4s;
  }

  .star {
    fill: white;
    position: absolute;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    animation-name: star-twinkle;
    animation-duration: 2s;
    animation-iteration-count: infinite;
  }

  #theme-toggle-input:checked + .slider .stars {
    -webkit-transform: translateY(0);
    -ms-transform: translateY(0);
    transform: translateY(0);
    opacity: 1;
  }

  #star-1 {
    width: 20px;
    top: 2px;
    left: 3px;
    animation-delay: 0.3s;
  }

  #star-2 {
    width: 6px;
    top: 16px;
    left: 3px;
  }

  #star-3 {
    width: 12px;
    top: 20px;
    left: 10px;
    animation-delay: 0.6s;
  }

  #star-4 {
    width: 18px;
    top: 0px;
    left: 18px;
    animation-delay: 1.3s;
  }

  @keyframes star-twinkle {
    0% {
      transform: scale(1);
    }

    40% {
      transform: scale(1.2);
    }

    80% {
      transform: scale(0.8);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes rotate-center {
    0% {
      transform: translateX(26px) rotate(0deg);
    }
    100% {
      transform: translateX(26px) rotate(360deg);
    }
  }
`;

interface AboutSectionProps {
  onBack: () => void;
}


export const AboutSection: React.FC<AboutSectionProps> = ({ onBack }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isRespectModalOpen, setIsRespectModalOpen] = useState(false);

  const OFFENSIVE_WORDS = [
    'porra', 'caralho', 'puta', 'viado', 'viido', 'vido', 'viad', 'fdp', 'corno', 'bosta', 'merda', 'otario', 'otário',
    'imbecil', 'idiota', 'retardado', 'lixo', 'babaca', 'burro', 'estupido', 'estúpido',
    'cu', 'cuzao', 'cuzão', 'asshole', 'bitch', 'shit', 'fuck', 'paspalho', 'arrombado', 'desgraçado',
    'chupador', 'vagabundo', 'canalha', 'safado', 'cretino', 'escroto', 'fedorento', 'corrupto',
    'pinto', 'bunda', 'crl', 'vtnc', 'tnc', 'pqp', 'caralha', 'caralhao', 'caralhão', 'fodase', 'foda-se',
    'piroca', 'cacete', 'xereca', 'xota', 'buceta', 'pica', 'rola', 'boquete', 'punheta', 'bicha', 'viadinho',
    'crleo', 'caraleo', 'caralho', 'bct', 'crlh', 'krlh', 'filhodaputa', 'putaria', 'cuzao', 'fodido'
  ];

  const hasOffensiveTerms = (text: string): boolean => {
    if (!text) return false;
    const normalized = text.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      // Leetspeak / bypasses translation
      .replace(/4|@/g, "a")
      .replace(/3|&/g, "e")
      .replace(/1|!|%|\|/g, "i")
      .replace(/0|\*/g, "o")
      .replace(/5|\$/g, "s")
      .replace(/7/g, "t")
      .replace(/k/g, "c") // treat 'k' as 'c' (e.g. krl -> crl)
      .replace(/\s+/g, "") // strip all spaces
      .replace(/[^a-z]/g, ""); // strip all other symbols (e.g. @, %, *, _)
      
    return OFFENSIVE_WORDS.some(word => {
      const wordNormalized = word.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/4|@/g, "a")
        .replace(/3|&/g, "e")
        .replace(/1|!|%|\|/g, "i")
        .replace(/0|\*/g, "o")
        .replace(/5|\$/g, "s")
        .replace(/7/g, "t")
        .replace(/k/g, "c")
        .replace(/\s+/g, "")
        .replace(/[^a-z]/g, "");
      return normalized.includes(wordNormalized);
    });
  };

  const isGibberish = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length < 2) return true;

    // 1. Repeated letters (3 or more same letters consecutively)
    if (/(.)\1\1/.test(trimmed)) return true;

    // 2. Count vowels and consonants
    const vowels = (trimmed.match(/[aeiouyáéíóúâêôãõüÀ-ÿ]/gi) || []).length;
    const letters = (trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
    const consonants = letters - vowels;

    // A valid name must have at least one vowel
    if (vowels === 0 && letters > 0) return true;

    // Consonant smash (e.g. "sdfgh")
    if (/[bcdfghjklmnpqrstvwxz]{4,}/i.test(trimmed)) return true;

    // Vowel smash (e.g. "aeiouy")
    if (/[aeiouyáéíóúâêôãõü]{5,}/i.test(trimmed)) return true;

    // Extreme ratios
    if (letters >= 4) {
      if (vowels / letters < 0.15) return true;
      if (vowels / letters === 1) return true;
    }

    // Key smash patterns
    const commonSmashes = ['qwe', 'asd', 'zxc', 'jkl', 'dfg', 'yui', 'bnm', 'hjkl', 'asdf'];
    const lower = trimmed.toLowerCase();
    if (commonSmashes.some(smash => lower.includes(smash))) return true;

    return false;
  };

  const [formValues, setFormValues] = useState({ firstName: '', lastName: '', phone: '', message: '' });
  const [formErrors, setFormErrors] = useState<{ firstName?: string, lastName?: string, phone?: string, message?: string }>({});
  const [gmailOffensiveWarned, setGmailOffensiveWarned] = useState(false);

  const [whatsappFormValues, setWhatsappFormValues] = useState({ firstName: '', lastName: '', message: '' });
  const [whatsappFormErrors, setWhatsappFormErrors] = useState<{ firstName?: string, lastName?: string, message?: string }>({});
  const [whatsappOffensiveWarned, setWhatsappOffensiveWarned] = useState(false);

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (!numbers) return "Preencha o número de Whatsapp";
    if (numbers.length > 0 && numbers.length < 11) return "Formato de número invalido, digite novamente";
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    let formatted = val;
    if (val.length > 2) formatted = `(${val.slice(0,2)}) ${val.slice(2)}`;
    if (val.length > 7) formatted = `(${val.slice(0,2)}) ${val.slice(2,7)}-${val.slice(7)}`;
    setFormValues(prev => ({ ...prev, phone: formatted }));
    
    if (formErrors.phone) {
        setFormErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const errors: any = {};
    const fName = formValues.firstName.trim();
    const lName = formValues.lastName.trim();

    let hasOffensive = false;

    if (!fName) {
      errors.firstName = "Nome é obrigatório.";
    } else if (hasOffensiveTerms(fName)) {
      errors.firstName = "O Nome contém um termo inadequado!";
      hasOffensive = true;
    } else if (isGibberish(fName)) {
      errors.firstName = "Insira um nome válido.";
    }

    if (!lName) {
      errors.lastName = "Sobrenome é obrigatório.";
    } else if (hasOffensiveTerms(lName)) {
      errors.lastName = "O Sobrenome contém um termo inadequado!";
      hasOffensive = true;
    } else if (isGibberish(lName)) {
      errors.lastName = "Insira um sobrenome válido.";
    }

    if (!formValues.message.trim()) {
      errors.message = "Mensagem é obrigatória.";
    } else if (hasOffensiveTerms(formValues.message)) {
      errors.message = "A Mensagem contém um termo inadequado!";
      hasOffensive = true;
    }
    
    const phoneErr = validatePhone(formValues.phone);
    if (phoneErr) errors.phone = phoneErr;

    if (Object.keys(errors).length > 0 || hasOffensive) {
      setFormErrors(errors);
      if (hasOffensive) {
        if (gmailOffensiveWarned) {
          setIsRespectModalOpen(true);
        } else {
          setGmailOffensiveWarned(true);
        }
      }
      return;
    }

    setIsSending(true);

    try {
      const resp = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues)
      });
      const data = await resp.json();
      
      if (data && data.isValid === false) {
        setIsSending(false);
        setIsRespectModalOpen(true);
        return;
      }
    } catch(err) {
      console.error(err);
    }

    if (formValues.message) {
      navigator.clipboard.writeText(formValues.message).catch(() => {});
    }

    setTimeout(() => {
      setIsSending(false);
      setIsFormModalOpen(false);
      const subject = encodeURIComponent(`Nome: ${formValues.firstName}, Sobrenome: ${formValues.lastName}, Whatsapp: ${formValues.phone}`);
      const body = encodeURIComponent(formValues.message || '');
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=projetobrasilbilingue@gmail.com&su=${subject}&body=${body}`, '_blank');
      setFormValues({ firstName: '', lastName: '', phone: '', message: '' });
      setFormErrors({});
    }, 2500);
  };

  const handleWhatsappSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const errors: any = {};
    const fName = whatsappFormValues.firstName.trim();
    const lName = whatsappFormValues.lastName.trim();

    let hasOffensive = false;

    if (!fName) {
      errors.firstName = "Nome é obrigatório.";
    } else if (hasOffensiveTerms(fName)) {
      errors.firstName = "O Nome contém um termo inadequado!";
      hasOffensive = true;
    } else if (isGibberish(fName)) {
      errors.firstName = "Insira um nome válido.";
    }

    if (!lName) {
      errors.lastName = "Sobrenome é obrigatório.";
    } else if (hasOffensiveTerms(lName)) {
      errors.lastName = "O Sobrenome contém um termo inadequado!";
      hasOffensive = true;
    } else if (isGibberish(lName)) {
      errors.lastName = "Insira um sobrenome válido.";
    }

    if (!whatsappFormValues.message.trim()) {
      errors.message = "Mensagem é obrigatória.";
    } else if (hasOffensiveTerms(whatsappFormValues.message)) {
      errors.message = "A Mensagem contém um termo inadequado!";
      hasOffensive = true;
    }
    
    if (Object.keys(errors).length > 0 || hasOffensive) {
      setWhatsappFormErrors(errors);
      if (hasOffensive) {
        if (whatsappOffensiveWarned) {
          setIsRespectModalOpen(true);
        } else {
          setWhatsappOffensiveWarned(true);
        }
      }
      return;
    }

    setIsSending(true);

    try {
      const resp = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatsappFormValues)
      });
      const data = await resp.json();
      
      if (data && data.isValid === false) {
        setIsSending(false);
        setIsRespectModalOpen(true);
        return;
      }
    } catch(err) {
      console.error(err);
    }

    setTimeout(() => {
      setIsSending(false);
      setIsWhatsappModalOpen(false);
      const contactText = `*Nome:* ${whatsappFormValues.firstName}\n*Sobrenome:* ${whatsappFormValues.lastName}\n*Mensagem enviada do Abba digital*\n\n${whatsappFormValues.message}`;
      const url = `https://wa.me/5547999034403?text=${encodeURIComponent(contactText)}`;
      window.open(url, '_blank');
      setWhatsappFormValues({ firstName: '', lastName: '', message: '' });
      setWhatsappFormErrors({});
    }, 2500);
  };

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      onBack();
    }, 500); // Wait for the transition to finish before actually unmounting
  };

  // Unified grouped keyboard navigation controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // First try closing fullscreen image
      if (e.key === 'Escape' && fullScreenImage !== null) {
        setFullScreenImage(null);
        return;
      }

      // Allow navigation and closing if in gallery mode
      if (activeGroup === null) return;
      const currentItems = GALLERY_GROUPS[activeGroup] || [];
      if (currentItems.length === 0) return;

      if (e.key === 'Escape') {
        setActiveGroup(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveGroupIndex(prev => {
          return prev === 0 ? currentItems.length - 1 : prev - 1;
        });
      } else if (e.key === 'ArrowRight') {
        setActiveGroupIndex(prev => {
          return prev === currentItems.length - 1 ? 0 : prev + 1;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGroup, activeGroupIndex, fullScreenImage]);

  // Prevent background scrolling while the modal gallery is active
  useEffect(() => {
    const el = containerRef.current;
    if (activeGroup !== null) {
      document.body.style.overflow = 'hidden';
      if (el) el.style.overflowY = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (el) el.style.overflowY = 'auto';
    }
    return () => {
      document.body.style.overflow = '';
      if (el) el.style.overflowY = 'auto';
    };
  }, [activeGroup]);

  // Intersection Observer for highlighting current reading section dynamically
  

  

  // Proactive preloader for high performance loading
  useEffect(() => {
    if (activeGroup && GALLERY_GROUPS[activeGroup]) {
      const group = GALLERY_GROUPS[activeGroup];
      if (group.length <= 1) return;

      const nextIndex = (activeGroupIndex + 1) % group.length;
      const prevIndex = (activeGroupIndex - 1 + group.length) % group.length;

      // Preload next image in background
      const imgNext = new Image();
      imgNext.src = group[nextIndex].src;

      // Preload previous image in background
      const imgPrev = new Image();
      imgPrev.src = group[prevIndex].src;
    }
  }, [activeGroup, activeGroupIndex]);

  // Render container with blurred backdrop and contained clean photo (WhatsApp style)
  const renderCardVisual = (item: { src: string; title: string }) => {
    return (
      <div className={`w-full h-full relative flex items-center justify-center overflow-hidden select-none transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#05050a]' : 'bg-[#FAF9F5]'
      }`}>
        {/* WhatsApp-style blurred background */}
        <img 
          src={item.src} 
          alt="" 
          className={`absolute inset-0 w-full h-full object-cover blur-2xl scale-[1.08] pointer-events-none select-none transition-opacity duration-300 ${
            theme === 'dark' ? 'opacity-[0.25]' : 'opacity-[0.14]'
          }`}
          referrerPolicy="no-referrer"
        />
        
        {/* Foreground Image */}
        <img 
          src={item.src} 
          alt={item.title} 
          className="relative z-10 max-w-full max-h-full object-contain pointer-events-none" 
          referrerPolicy="no-referrer"
        />

        {/* Fullscreen Icon Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setFullScreenImage(item.src);
          }}
          className={`absolute bottom-4 right-4 z-30 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            theme === 'dark' 
              ? 'bg-black/40 hover:bg-black/60 text-white/90' 
              : 'bg-white/40 hover:bg-white/60 text-black/90 shadow-sm'
          }`}
          title="Ver imagem em tamanho máximo"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V3m0 0h5M3 3l7 7m4-7h5v5m0-5l-7 7m7 4v5m0 0h-5m5 0l-7-7M8 21H3v-5m0 5l7-7" />
          </svg>
        </button>
      </div>
    );
  };

  // Reusable WhatsApp style thumbnail with blurred background inside a solid frame
  const renderThumbnail = (src: string, alt: string, groupKey: string, indexInGroup: number, aspectClass = "aspect-[4/3]", isVertical = false) => {
    return (
      <div 
        onClick={() => {
          setActiveGroup(groupKey);
          setActiveGroupIndex(indexInGroup);
        }}
        className={`flex flex-col text-center font-mono p-1.5 rounded-2xl border transition-all duration-300 hover:scale-[1.015] hover:shadow-lg cursor-pointer w-full ${
          theme === 'dark' 
            ? 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/80 shadow-black/40' 
            : 'bg-[#FAF9F5] border-gray-150 hover:border-gray-250 shadow-gray-200/50'
        }`}
      >
        <div className={`${aspectClass} w-full rounded-xl overflow-hidden relative group border ${
          theme === 'dark' ? 'border-white/5 bg-[#05050a]' : 'border-black/5 bg-[#fcfbfa]'
        }`}>
          {isVertical && (
            /* Blurred WhatsApp style background image */
            <img 
              src={src} 
              alt="" 
              className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 pointer-events-none select-none transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-[0.25]' : 'opacity-[0.14]'
              }`}
              referrerPolicy="no-referrer"
            />
          )}
          {/* Main image */}
          <img 
            src={src} 
            alt={alt} 
            className={`relative z-10 w-full h-full pointer-events-none transition-transform duration-500 group-hover:scale-[1.03] ${
              isVertical ? 'object-contain' : 'object-cover'
            }`} 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 z-20 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  };

  const currentGroupItems = activeGroup ? GALLERY_GROUPS[activeGroup] : [];

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`min-h-screen font-sans pb-24 overflow-y-auto transition-colors duration-500 relative ${
        theme === 'dark' ? 'bg-[#00000f] text-[#cfd5dc] dark-theme-article' : 'bg-white text-gray-900'
      }`}
    >
      {/* Grid background overlay for Dark mode (subtle, soft grid + elegant gradient mask fading at the bottom) */}
      <div 
        className={`absolute inset-0 pointer-events-none select-none z-0 transition-opacity duration-500 ease-in-out ${
          !isExiting && theme === 'dark' ? 'opacity-[0.012]' : 'opacity-0'
        }`}
        style={{
          maskImage: 'linear-gradient(to bottom, black 50%, rgba(0, 0, 0, 0.15) 98%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, rgba(0, 0, 0, 0.15) 98%)'
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg-dark-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="none" />
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-dark-grid)" />
        </svg>
      </div>

      {/* Editorial top navigation bar with Voltar, Logo & Modern Switcher (Only visible in blog article, opposite to Logo) */}
      <div className={`sticky top-0 z-50 py-3.5 px-4 sm:px-6 md:px-8 flex items-center justify-center transition-all duration-300 border-b ${
        isExiting ? 'bg-transparent border-transparent shadow-none backdrop-blur-none' : (
          theme === 'dark' 
            ? 'bg-[#00000f]/95 border-slate-800 text-white shadow-[0_1px_3px_rgba(0,0,0,0.4)] backdrop-blur-md' 
            : 'bg-white/95 border-gray-100 text-gray-900 shadow-xs backdrop-blur-md'
        )
      }`}>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
          {/* Left side: Morphing Hamburger/Back Button and Logo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExit}
              className={`p-2 -ml-1 rounded-full active:scale-95 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer flex items-center justify-center border shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-transparent w-10 h-10 ${
                theme === 'dark'
                  ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:text-white'
                  : 'border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900'
              }`}
              title="Voltar para o Ábaco"
            >
              <div className="w-4.5 h-3.5 flex items-center relative">
                <span className={`absolute left-0 h-0.5 rounded-full transition-all duration-500 origin-left ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'
                } ${
                    isExiting 
                      ? 'w-full -translate-y-[5px] rotate-0' 
                      : 'w-[11px] -rotate-45 translate-x-[-1px]'
                }`} />
                <span className={`absolute left-0 h-0.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'
                } ${
                    isExiting 
                       ? 'w-full translate-x-0' 
                       : 'w-full translate-x-[1px]'
                }`} />
                <span className={`absolute left-0 h-0.5 rounded-full transition-all duration-500 origin-left ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    theme === 'dark' ? 'bg-gray-300' : 'bg-gray-700'
                } ${
                    isExiting 
                      ? 'w-full translate-y-[5px] rotate-0' 
                      : 'w-[11px] rotate-45 translate-x-[-1px]'
                }`} />
              </div>
            </button>

            {/* Logo & Title */}
            <img src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779315941/logoabra2_kls3we.svg" alt="ABBA Logo" className="w-10 h-10 ml-0.5 object-contain" />
            <div>
              <h1 className={`font-display font-extrabold text-xl tracking-tight flex items-center gap-1.5 transition-colors duration-500 ${
                theme === 'dark' ? 'text-white' : 'text-gray-950'
              }`}>
                ABBA DIGITAL
              </h1>
             
            </div>
          </div>

          {/* Right side: Fluid & Modern Theme Switcher (opposing the logo on the right side) */}
          <div 
            className={`flex items-center select-none shrink-0 transition-opacity duration-300 ${
              isExiting ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <StyledThemeSwitch>
              <label className="switch" title="Alternar Tema (Claro / Escuro)">
                <input 
                  id="theme-toggle-input" 
                  type="checkbox" 
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')} 
                />
                <div className="slider round">
                  <div className="sun-moon">
                    <svg id="moon-dot-1" className="moon-dot" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="moon-dot-2" className="moon-dot" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="moon-dot-3" className="moon-dot" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="light-ray-1" className="light-ray" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="light-ray-2" className="light-ray" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="light-ray-3" className="light-ray" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-1" className="cloud-dark" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-2" className="cloud-dark" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-3" className="cloud-dark" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-4" className="cloud-light" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-5" className="cloud-light" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                    <svg id="cloud-6" className="cloud-light" viewBox="0 0 100 100">
                      <circle cx={50} cy={50} r={50} />
                    </svg>
                  </div>
                  <div className="stars">
                    <svg id="star-1" className="star" viewBox="0 0 20 20">
                      <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
                    </svg>
                    <svg id="star-2" className="star" viewBox="0 0 20 20">
                      <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
                    </svg>
                    <svg id="star-3" className="star" viewBox="0 0 20 20">
                      <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
                    </svg>
                    <svg id="star-4" className="star" viewBox="0 0 20 20">
                      <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
                    </svg>
                  </div>
                </div>
              </label>
            </StyledThemeSwitch>
          </div>
        </div>
      </div>

      {/* Article Navigation & Body Grid */}
      <div 
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 flex flex-col lg:flex-row gap-12 transition-opacity duration-300 ease-in-out ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`}
      >
        
      

        {/* Main Article Area */}
        <article className="flex-1 min-w-0 flex flex-col text-left">
          
          {/* Título Principal no estilo Editorial Clean do GitHub */}
          <header className={`mb-12 border-b pb-8 ${theme === 'dark' ? 'border-slate-800' : 'border-gray-100'}`}>
            <h1 className={`font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.05] mb-4 uppercase ${
              theme === 'dark' ? 'text-white' : 'text-slate-950'
            }`}>
              Ábaco Brasileiro de Alfabetização Bilíngue (ABBA)
            </h1>
            
            {/* Secção do Autor integrada com os seus Modais de Contacto locais */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-2">
              <div className={`shrink-0 rounded-full p-[2px] border-2 ${theme === 'dark' ? 'border-white' : 'border-gray-900'}`}>
                <img 
                  src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779573141/clipboard-image-1779573127_oef0qy.avif" 
                  alt="José Décio de Alencar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-0.5 justify-center flex-1 min-w-[240px]">
                <p className={`font-display font-extrabold text-sm uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  AUTOR: JOSÉ DÉCIO DE ALENCAR
                </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Gestor de PD&I (Projetos de Desenvolvimento e Inovação) • Blumenau, SC, Brasil
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold font-mono mt-1">
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsFormModalOpen(true); }} className={`flex items-center gap-1.5 transition-colors ${theme === 'dark' ? 'text-sky-400 hover:text-sky-300' : 'text-[#005ba4] hover:text-[#004a87]'}`}>
                    <img src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779574833/gmail-svgrepo-com_hwwnlb.svg" alt="Email" className="w-4 h-4 shrink-0" />
                    <span className="break-all">projetobrasilbilingue@gmail.com</span>
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsWhatsappModalOpen(true); }} className={`flex items-center gap-1.5 transition-colors ${theme === 'dark' ? 'text-sky-400 hover:text-sky-300' : 'text-gray-400 hover:text-gray-500'}`}>
                    <img src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779574832/whatsapp-svgrepo-com_tgqnb3.svg" alt="WhatsApp" className="w-4 h-4" />
                    <span className="break-all">47 9 9903-4403</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Corpo de Texto com a tipografia e espaçamentos do GitHub */}
          <div className={`prose max-w-none font-sans text-base sm:text-lg leading-relaxed space-y-6 ${
            theme === 'dark' ? 'prose-invert text-slate-300' : 'prose-slate text-slate-700'
          }`}>
            
            <p className={`font-semibold text-lg sm:text-xl border-l-4 border-blue-500 pl-4 py-1 rounded-r-xl ${
              theme === 'dark' ? 'bg-blue-950/20 text-blue-300' : 'bg-blue-50/30 text-slate-900'
            }`}>
              Uma revolução metodológica e pedagógica de matriz brasileira voltada para o ensino de línguas estrangeiras e soletração multi-idiomas.
            </p>
            
            {/* 1. O Conceito */}
            <section id="o-que-e-o-abba" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                1. O Conceito e a Estrutura Fonética
              </h3>
              <p>
                O projeto ABBA Digital foi concebido para espelhar a transição natural da fala para a escrita. Ao contrário dos métodos tradicionais de memorização mecânica, o sistema interliga as propriedades ordinais e fonéticas das letras através de cubos coloridos, organizando calhas de correspondência para múltiplos idiomas simultâneos: Português, Inglês, Alemão e Italiano.
              </p>
              <p>
                O material prático original consiste de <strong>150 cubos de madeira ou cartolina MDF</strong> de 27cm³ cada, com 900 letras selecionadas pela lógica do <strong>DIAGRAMA DE PARETO</strong> impressas em todas as seis faces de cada cubo. Cada cubo tem 6 lados: 2 lados têm letras pretas para o português, 2 lados letras azuis para o inglês e 2 lados letras vermelhas para o alemão.
              </p>

              {/* Bloco de codificação adaptado ao tema */}
              <div className={`my-6 p-5 rounded-xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xs font-bold uppercase tracking-wider block mb-2 text-blue-500">Exemplo de codificação:</span>
                <ul className="space-y-2 text-sm list-none pl-0">
                  <li><strong>Português (Preto):</strong> Escrever o número 1 requer duas letras pretas <strong>U</strong> e <strong>M</strong> (a 21ª e 13ª do alfabeto).</li>
                  <li><strong>Inglês (Azul):</strong> Escrever o mesmo número requer 3 letras azuis nas posições ordinais <strong>[15, 14, 5]</strong>.</li>
                  <li><strong>Alemão (Vermelho):</strong> A palavra <strong>EINS</strong> tem 4 letras vermelhas correspondentes à sequência <strong>[5, 9, 14, 19]</strong>.</li>
                </ul>
              </div>

              {/* Injeção das miniaturas locais no fluxo tipográfico */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/tabvermelho_iuejrf.avif", "Tabela Vermelho", "tables", 0)}
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565247/tabazul_eplu2h.avif", "Tabela Azul", "tables", 1)}
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/tabpreto_dbwmcl.avif", "Tabela Preto", "tables", 2)}
              </div>
            </section>

            {/* 2. Como Funciona */}
            <section id="como-funciona" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                2. A Inovação dos Cubos e Conexões Físico-Digitais
              </h3>
              <p>
                A grande inovação reside na representation tridimensional do alfabeto. As conexões elásticas (ou cabos tensores virtuais) demonstram visualmente como uma única raiz alfabética se distribui e se comporta na formação de palavras em ecossistemas fonéticos completamente distintos, estimulando a memória espacial e cognitiva da criança.
              </p>
              <p>
                No modelo analógico, usavam-se tabelas em folhas A4 com quadrados de 9 cm² contendo os números correspondentes às letras usadas para escrever de <strong>ZERO a CEM</strong> nas três línguas.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palavras1_hj2w4z.avif", "Palavras Escritas 1", "words", 0)}
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palavras2_bky3wy.avif", "Palavras Escritas 2", "words", 1)}
              </div>
            </section>

            {/* 3. Objetivos */}
            <section id="objetivo-das-tarefas" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                3. Velocidade de Escrita e Teoria Alencarina
              </h3>
              <p>
                O objetivo das tarefas é proporcionar ao aprendiz uma forma prática de medir, comparar e controlar a velocidade com a qual lê e escreve ao mesmo tempo em que identifica as letras de cada palavra de forma paralela e integrada.
              </p>
              <p>
                A <strong>Teoria Alencarina</strong> defende que existe uma relação de equivalência entre os numerais que formam os números e as letras que formam as palavras em qualquer idioma, servindo como uma amostra fiel de toda a organização gramatical e sináptica do cérebro humano.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565246/palav3_bhesqe.avif", "Frase Escrita 1", "phrases", 0)}
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565245/palavr4_qbydb0.avif", "Frase Escrita 2", "phrases", 1)}
              </div>
            </section>

            {/* 4. Símbolo Linguístico */}
            <section id="simbolo-linguistico" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                4. O Símbolo Linguístico Multilíngue
              </h3>
              <p>
                O símbolo linguístico é a imagem mental que registramos antes de conhecermos as palavras. Por exemplo, o conceito de uma habitação gera a palavra de 4 letras <strong>CASA</strong> em português, a de 5 letras <strong>HOUSE</strong> em inglês, e a de 4 letras <strong>HAUS</strong> em alemão. O símbolo é o mesmo; mudam apenas quais letras usar, a quantidade e a ordem de disposição.
              </p>
              
              <div className={`p-4 rounded-xl border my-4 ${theme === 'dark' ? 'bg-emerald-950/20 border-emerald-900/40' : 'bg-green-50/40 border-green-200'}`}>
                <p className="italic text-sm m-0">
                  "Quando o aprendiz faz os exercícios com o ABBA, a mente dele aprende a identificar automaticamente estas duas novas palavras, <strong>HOUSE</strong> e <strong>HAUS</strong>, para descrever este único símbolo linguístico que é sempre o mesmo."
                </p>
              </div>
            </section>

            {/* 5. Metas */}
            <section id="metas-do-projeto" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                5. Metas do Sistema ABBA
              </h3>
              <p>
                A meta inicial do projeto é guiar o aluno a escrever de 0 a 100 nos três idiomas na mesma velocidade que escreve em português. A meta final é transferir de forma automática as habilidades de leitura e escrita já consolidadas no idioma materno diretamente para o inglês e o alemão.
              </p>
              
              <div className="flex flex-col items-center gap-2 my-6">
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565245/painel_k2fqw5.avif", "O Painel Magnético do ABBA", "panel", 0, "aspect-video", true)}
              </div>
            </section>

            {/* 6. Insight */}
            <section id="como-nasceu-o-projeto" className="pt-4">
              <h3 className={`font-display font-extrabold text-xl sm:text-2xl tracking-tight mb-3 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                6. Fundamentação e a Origem do Insight
              </h3>
              <p>
                O insight original nasceu em Blumenau (SC), cidade onde famílias preservam o alemão clássico da colonização, combinado com a experiência de José Décio como tradutor em feiras industriais de Frankfurt, na Alemanha. Ao notar conexões exatas como a transição fonética das letras <strong>D</strong> e <strong>TH</strong> (onde <em>Three</em> vira <em>Drei</em>), o sistema ganhou vida.
              </p>

              <div className="flex flex-col items-center gap-2 my-6">
                {renderThumbnail("https://res.cloudinary.com/dudmozd8z/image/upload/v1779565508/habenter_cfxsmy.avif", "A Camiseta Bordada do ABBA", "shirt", 0, "aspect-video", true)}
              </div>
            </section>

            {/* Rodapé do Artigo no padrão GitHub */}
            <footer className={`pt-8 border-t text-center text-sm font-medium transition-colors ${
              theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-gray-150 text-slate-400'
            }`}>
              <div className="loadingspinner scale-[0.6] origin-center mb-4 mx-auto block">
                <div id="square1" /> <div id="square2" /> <div id="square3" /> <div id="square4" /> <div id="square5" />
              </div>
              <p className="uppercase tracking-widest font-bold text-xs mb-1">Ábaco Brasileiro de Alfabetização Bilíngue</p>
              <p>© {new Date().getFullYear()} Ábaco Digital. Todos os direitos reservados ao inventor e autor José Décio de Alencar.</p>
            </footer>

          </div>
        </article>
    </div>

      {/* Immersive fluid image gallery overlay */}
      <AnimatePresence>
        {activeGroup !== null && currentGroupItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex flex-col justify-between backdrop-blur-xl p-4 sm:p-6 md:p-8 select-none transition-colors duration-300 ${
              theme === 'dark' ? 'bg-black/95' : 'bg-[#FAF9F5]/95'
            }`}
          >
            {/* Top header controls */}
            <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-8 sm:mb-10 md:mb-12 shrink-0 px-2 relative h-12">
              <div className="invisible font-mono text-xs sm:text-sm font-bold text-white/50 tracking-widest uppercase">
                {currentGroupItems[activeGroupIndex]?.title}
              </div>

              {/* Fractional counter always absolute centered and in the middle */}
              <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md rounded-full px-4 py-1.5 text-xs font-mono font-bold tracking-widest shadow-inner transition-colors duration-300 ${
                theme === 'dark' ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
              }`}>
                {activeGroupIndex + 1} / {currentGroupItems.length}
              </div>

              {/* Close button with circular hover shape */}
              <button
                onClick={() => setActiveGroup(null)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ml-auto active:scale-90 ${
                  theme === 'dark' 
                    ? 'bg-white/10 hover:bg-white/15 text-white' 
                    : 'bg-black/5 hover:bg-black/10 text-black'
                }`}
                title="Fechar (Esc)"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Main Stage with elegant navigation arrows */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center max-w-5xl mx-auto w-full relative gap-6 my-auto min-h-0">
              
              {/* Left Arrow Button */}
              {currentGroupItems.length > 1 && (
                <button
                  onClick={() => setActiveGroupIndex(prev => {
                    return prev === 0 ? currentGroupItems.length - 1 : prev - 1;
                  })}
                  className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/15 text-white' 
                      : 'bg-black/5 hover:bg-black/10 text-black'
                  }`}
                  title="Anterior (Seta Esquerda)"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Spacious visual stage with custom motion spring animation */}
              <motion.div 
                key={`${activeGroup}-${activeGroupIndex}`}
                initial={{ opacity: 0, scale: 0.98, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl flex flex-col gap-6 sm:gap-8 justify-center min-h-0"
              >
                {/* Visual Area - True Custom proportional sizing to prevent any overflow or clipping */}
                <div className={`w-full h-[38vh] sm:h-[48vh] md:h-[52vh] rounded-3xl border overflow-hidden shadow-2xl relative shrink-0 transition-colors duration-300 ${
                  theme === 'dark' ? 'border-white/10' : 'border-black/5'
                }`}>
                  {renderCardVisual(currentGroupItems[activeGroupIndex])}
                </div>

                {/* Elegant White Bold Caption Area - Centered below the image */}
                <div className="text-center max-w-3xl mx-auto px-4 select-text">
                  <p className={`text-sm sm:text-base md:text-lg font-bold tracking-normal leading-relaxed transition-colors duration-300 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentGroupItems[activeGroupIndex]?.description}
                  </p>
                </div>
              </motion.div>

              {/* Right Arrow Button */}
              {currentGroupItems.length > 1 && (
                <button
                  onClick={() => setActiveGroupIndex(prev => {
                    return prev === currentGroupItems.length - 1 ? 0 : prev + 1;
                  })}
                  className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-all cursor-pointer shadow-md shrink-0 active:scale-95 ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/15 text-white' 
                      : 'bg-black/5 hover:bg-black/10 text-black'
                  }`}
                  title="Próxima (Seta Direita)"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

            </div>

            {/* Bottom Controls for Mobile Arrow Bar */}
            {currentGroupItems.length > 1 && (
              <div className="flex sm:hidden items-center justify-center gap-6 mt-4 mb-2 shrink-0">
                <button
                  onClick={() => setActiveGroupIndex(prev => {
                    return prev === 0 ? currentGroupItems.length - 1 : prev - 1;
                  })}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/15 text-white' 
                      : 'bg-black/5 hover:bg-black/10 text-black'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className={`text-xs font-mono font-bold tracking-widest transition-colors duration-300 ${
                  theme === 'dark' ? 'text-white/45' : 'text-gray-400'
                }`}>
                  NAVEGAR
                </div>

                <button
                  onClick={() => setActiveGroupIndex(prev => {
                    return prev === currentGroupItems.length - 1 ? 0 : prev + 1;
                  })}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 ${
                    theme === 'dark' 
                      ? 'bg-white/10 hover:bg-white/15 text-white' 
                      : 'bg-black/5 hover:bg-black/10 text-black'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* Pure Fullscreen Image Overlay */}
      <AnimatePresence>
        {fullScreenImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] flex items-center justify-center backdrop-blur-xl ${
              theme === 'dark' ? 'bg-black/95' : 'bg-white/95'
            }`}
            onClick={() => setFullScreenImage(null)}
          >
            {/* Close Button at top right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullScreenImage(null);
              }}
              className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-90 z-[210] ${
                theme === 'dark' 
                  ? 'bg-white/10 hover:bg-white/15 text-white' 
                  : 'bg-black/5 hover:bg-black/10 text-black'
              }`}
              title="Fechar Tela Cheia (Esc)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Natural size image but contained to not exceed viewport */}
            <img 
              src={fullScreenImage} 
              alt="Imagem em Tamanho Original" 
              className="max-w-full max-h-full object-contain cursor-zoom-out select-none"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFormModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-xl ${
              theme === 'dark' ? 'bg-black/95' : 'bg-black/40'
            }`}
            onClick={() => setIsFormModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-10 rounded-lg shadow-lg relative max-w-2xl w-full max-h-[95vh] m-4 transition-colors duration-300 overflow-hidden overflow-y-auto ${
                theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              <AnimatePresence>
                {isSending && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md ${
                      theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'
                    }`}
                  >
                    <div className="mb-12 scale-75">
                      <Loader isDark={theme === 'dark'} />
                    </div>
                    <span className={`text-sm font-semibold tracking-wide animate-pulse ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Encaminhando para o Gmail...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleContactSubmit}>
                <div className="flex flex-wrap gap-5 items-center w-full max-md:max-w-full mb-10">
                <div className="flex flex-wrap flex-1 shrink gap-5 items-center self-stretch my-auto basis-0 min-w-[240px] max-md:max-w-full">
                  <div className={`flex relative shrink-0 justify-center items-center h-[70px] rounded-[16px] overflow-hidden w-[70px] transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                  }`}>
                    <img 
                      src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779573141/clipboard-image-1779573127_oef0qy.avif" 
                      alt="José Décio de Alencar"
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                  <div className="flex flex-col flex-1 shrink self-stretch my-auto basis-4 min-w-[240px] max-md:max-w-full justify-center">
                    <h2 className="text-xl font-bold font-inter tracking-[0] leading-[150%] max-md:max-w-full mb-3">
                      Entrar em contato com o professor Decio por E-mail
                    </h2>
                    <div className="flex flex-col self-stretch min-w-[240px]">
                      <div className={`text-base font-bold transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>José Décio de Alencar</div>
                      <div className={`mt-1 text-sm transition-colors duration-300 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-505'
                      }`}>
                        Professor e Autor, Projeto Brasil Bilíngue
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                <div className="relative">
                  <input 
                    type="text" 
                    id="floating_first_name" 
                    name="firstName" 
                    value={formValues.firstName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, '');
                      setFormValues({ ...formValues, firstName: val });
                      if (formErrors.firstName) setFormErrors({ ...formErrors, firstName: undefined });
                      setGmailOffensiveWarned(false);
                    }}
                    className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer overflow-ellipsis overflow-hidden pr-4 transition-colors duration-300 placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 ${
                    formErrors.firstName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-sky-400 focus:ring-sky-400'
                        : 'border-blue-200 text-slate-900 focus:border-[#005ba4] focus:ring-[#005ba4]'
                  }`} placeholder="Digite seu nome aqui" />
                  <label htmlFor="floating_first_name" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    formErrors.firstName 
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-sky-400'
                        : 'bg-white text-gray-500 peer-focus:text-[#005ba4]'
                  }`}>
                    Nome *
                  </label>
                  {formErrors.firstName && (
                    <div className="absolute bottom-full left-0 mb-2.5 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg whitespace-nowrap font-medium">
                        {formErrors.firstName}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    id="floating_last_name" 
                    name="lastName" 
                    value={formValues.lastName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, '');
                      setFormValues({ ...formValues, lastName: val });
                      if (formErrors.lastName) setFormErrors({ ...formErrors, lastName: undefined });
                      setGmailOffensiveWarned(false);
                    }}
                    className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer overflow-ellipsis overflow-hidden pr-4 transition-colors duration-300 placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 ${
                    formErrors.lastName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-sky-400 focus:ring-sky-400'
                        : 'border-blue-200 text-slate-900 focus:border-[#005ba4] focus:ring-[#005ba4]'
                  }`} placeholder="Digite seu sobrenome aqui" />
                  <label htmlFor="floating_last_name" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    formErrors.lastName 
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-sky-400'
                        : 'bg-white text-gray-500 peer-focus:text-[#005ba4]'
                  }`}>
                    Sobrenome *
                  </label>
                  {formErrors.lastName && (
                    <div className="absolute bottom-full left-0 mb-2.5 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg whitespace-nowrap font-medium">
                        {formErrors.lastName}
                        <div className="absolute top-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input type="text" id="floating_email" name="email" className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer overflow-ellipsis overflow-hidden pr-4 transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'border-slate-700 text-slate-400 focus:border-sky-400 focus:ring-sky-400 opacity-60 cursor-not-allowed'
                      : 'border-blue-200 text-slate-500 focus:border-[#005ba4] focus:ring-[#005ba4] disabled:bg-gray-50 cursor-not-allowed'
                  }`} placeholder=" " defaultValue="projetobrasilbilingue@gmail.com" disabled />
                  <label htmlFor="floating_email" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-slate-500 peer-focus:text-sky-400'
                      : 'bg-white text-gray-400 peer-focus:text-[#005ba4]'
                  }`}>
                    E-mail
                  </label>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    id="floating_phone" 
                    name="phone" 
                    value={formValues.phone}
                    onChange={handlePhoneChange}
                    className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer overflow-ellipsis overflow-hidden pr-4 transition-colors duration-300 placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 ${
                    formErrors.phone 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-sky-400 focus:ring-sky-400'
                        : 'border-blue-200 text-slate-900 focus:border-[#005ba4] focus:ring-[#005ba4]'
                  }`} placeholder="Digite seu WhatsApp aqui" />
                  <label htmlFor="floating_phone" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    formErrors.phone 
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-sky-400'
                        : 'bg-white text-gray-500 peer-focus:text-[#005ba4]'
                  }`}>
                    WhatsApp *
                  </label>
                  {formErrors.phone && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg whitespace-nowrap font-medium">
                        {formErrors.phone}
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative sm:col-span-2">
                  <textarea 
                    id="floating_message" 
                    name="message" 
                    value={formValues.message}
                    onChange={(e) => {
                      setFormValues({ ...formValues, message: e.target.value });
                      if (formErrors.message) setFormErrors({ ...formErrors, message: undefined });
                      setGmailOffensiveWarned(false);
                    }}
                    className={`block w-full text-sm min-h-[120px] max-h-[200px] px-4 pt-6 pb-6 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer resize-y transition-colors duration-300 placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 ${
                    formErrors.message
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500 [&::-webkit-scrollbar-thumb]:bg-red-300'
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-sky-400 focus:ring-sky-400 [&::-webkit-scrollbar-thumb]:bg-slate-600 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-thumb]:rounded-full'
                        : 'border-blue-200 text-slate-900 focus:border-[#005ba4] focus:ring-[#005ba4] [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400'
                  }`} placeholder="Digite sua mensagem aqui"></textarea>
                  <label htmlFor="floating_message" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    formErrors.message
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-sky-400'
                        : 'bg-white text-gray-500 peer-focus:text-[#005ba4]'
                  }`}>
                    Mensagem *
                  </label>
                  {formErrors.message && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg font-medium">
                        {formErrors.message}
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row-reverse gap-4">
                <button className={`w-full sm:w-fit rounded-lg text-sm px-6 py-2 h-[50px] font-semibold text-white transition-all shadow-md active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-sky-500 hover:bg-sky-600 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900'
                    : 'bg-[#005ba4] hover:bg-[#004a87] focus:ring-2 focus:ring-[#005ba4] focus:ring-offset-2 focus:ring-offset-white'
                }`} type="submit">
                  Enviar
                </button>
                <button type="button" className={`w-full sm:w-fit rounded-lg text-sm px-6 py-2 h-[50px] font-medium border transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800 focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-white'
                }`} onClick={() => setIsFormModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWhatsappModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[300] flex items-center justify-center backdrop-blur-xl ${
              theme === 'dark' ? 'bg-black/95' : 'bg-black/40'
            }`}
            onClick={() => setIsWhatsappModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-10 rounded-lg shadow-lg relative max-w-2xl w-full max-h-[95vh] m-4 transition-colors duration-305 overflow-hidden overflow-y-auto ${
                theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-black'
              }`}
            >
              <AnimatePresence>
                {isSending && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`absolute inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-md ${
                      theme === 'dark' ? 'bg-slate-900/90' : 'bg-white/90'
                    }`}
                  >
                    <div className="mb-12 scale-75">
                      <Loader isDark={theme === 'dark'} />
                    </div>
                    <span className={`text-sm font-semibold tracking-wide animate-pulse ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Encaminhando para o WhatsApp...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleWhatsappSubmit}>
                <div className="flex flex-wrap gap-5 items-center w-full max-md:max-w-full mb-10">
                <div className="flex flex-wrap flex-1 shrink gap-5 items-center self-stretch my-auto basis-0 min-w-[240px] max-md:max-w-full">
                  <div className={`flex relative shrink-0 justify-center items-center h-[70px] rounded-[16px] overflow-hidden w-[70px] transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'
                  }`}>
                    <img 
                      src="https://res.cloudinary.com/dudmozd8z/image/upload/v1779573141/clipboard-image-1779573127_oef0qy.avif" 
                      alt="José Décio de Alencar"
                      className="w-full h-full object-cover object-center" 
                    />
                  </div>
                  <div className="flex flex-col flex-1 shrink self-stretch my-auto basis-4 min-w-[240px] max-md:max-w-full justify-center">
                    <h2 className="text-xl font-bold font-inter tracking-[0] leading-[150%] max-md:max-w-full mb-3">
                      Entrar em contato com o professor Decio via Whatsapp
                    </h2>
                    <div className="flex flex-col self-stretch min-w-[240px]">
                      <div className={`text-base font-bold transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>José Décio de Alencar</div>
                      <div className={`mt-1 text-sm transition-colors duration-305 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        Professor e Autor, Projeto Brasil Bilíngue
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <input 
                    type="text" 
                    id="wa_floating_first_name" 
                    name="firstName" 
                    value={whatsappFormValues.firstName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, '');
                      setWhatsappFormValues(prev => ({ ...prev, firstName: val }));
                      if (whatsappFormErrors.firstName) setWhatsappFormErrors(prev => ({ ...prev, firstName: undefined }));
                      setWhatsappOffensiveWarned(false);
                    }}
                    className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 transition-colors duration-300 ${
                    whatsappFormErrors.firstName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-green-400 focus:ring-green-400'
                        : 'border-green-200 text-slate-900 focus:border-green-600 focus:ring-green-600'
                  }`} placeholder="Digite seu nome aqui" />
                  <label htmlFor="wa_floating_first_name" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-305 ${
                    whatsappFormErrors.firstName 
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-green-400'
                        : 'bg-white text-gray-500 peer-focus:text-green-600'
                  }`}>
                    Nome *
                  </label>
                  {whatsappFormErrors.firstName && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg font-medium whitespace-nowrap">
                        {whatsappFormErrors.firstName}
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    id="wa_floating_last_name" 
                    name="lastName" 
                    value={whatsappFormValues.lastName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z\sÀ-ÿ]/g, '');
                      setWhatsappFormValues(prev => ({ ...prev, lastName: val }));
                      if (whatsappFormErrors.lastName) setWhatsappFormErrors(prev => ({ ...prev, lastName: undefined }));
                      setWhatsappOffensiveWarned(false);
                    }}
                    className={`block w-full text-sm h-[50px] px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 transition-colors duration-300 ${
                    whatsappFormErrors.lastName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-green-400 focus:ring-green-400'
                        : 'border-green-200 text-slate-900 focus:border-green-600 focus:ring-green-600'
                  }`} placeholder="Digite seu sobrenome aqui" />
                  <label htmlFor="wa_floating_last_name" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-305 ${
                    whatsappFormErrors.lastName 
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-green-400'
                        : 'bg-white text-gray-500 peer-focus:text-green-600'
                  }`}>
                    Sobrenome *
                  </label>
                  {whatsappFormErrors.lastName && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg font-medium whitespace-nowrap">
                        {whatsappFormErrors.lastName}
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative sm:col-span-2">
                  <textarea 
                    id="wa_floating_message" 
                    name="message" 
                    value={whatsappFormValues.message}
                    onChange={(e) => {
                      setWhatsappFormValues(prev => ({ ...prev, message: e.target.value }));
                      if (whatsappFormErrors.message) setWhatsappFormErrors(prev => ({ ...prev, message: undefined }));
                      setWhatsappOffensiveWarned(false);
                    }}
                    className={`block w-full min-h-[120px] text-sm py-4 px-4 bg-transparent rounded-[8px] border appearance-none focus:outline-none focus:ring-1 peer placeholder-transparent focus:placeholder-gray-400 dark:focus:placeholder-slate-500 transition-colors duration-300 resize-y max-h-[300px] ${
                    whatsappFormErrors.message 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 text-red-500' 
                      : theme === 'dark'
                        ? 'border-slate-700 text-white focus:border-green-400 focus:ring-green-400'
                        : 'border-green-200 text-slate-900 focus:border-green-600 focus:ring-green-600'
                  }`} placeholder="Digite sua mensagem aqui"></textarea>
                  <label htmlFor="wa_floating_message" className={`absolute text-[14px] leading-[150%] duration-300 transform -translate-y-[1.2rem] scale-75 top-2 z-10 origin-[0] px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-[1.2rem] left-2 transition-colors duration-300 ${
                    whatsappFormErrors.message
                      ? theme === 'dark' ? 'bg-slate-900 text-red-500' : 'bg-white text-red-500'
                      : theme === 'dark'
                        ? 'bg-slate-900 text-slate-400 peer-focus:text-green-400'
                        : 'bg-white text-gray-500 peer-focus:text-green-600'
                  }`}>
                    Mensagem *
                  </label>
                  {whatsappFormErrors.message && (
                    <div className="absolute top-full left-0 mt-2 z-20">
                      <div className="relative bg-[#FC2020] text-white text-[13.5px] px-4 py-2 rounded shadow-lg font-medium">
                        {whatsappFormErrors.message}
                        <div className="absolute bottom-full left-4 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[7px] border-b-[#FC2020]"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row-reverse gap-4">
                <button className={`w-full sm:w-fit rounded-lg text-sm px-6 py-2 h-[50px] font-semibold text-white transition-all shadow-md active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-[#25D366] hover:bg-[#1ebd5a] focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-slate-900'
                    : 'bg-[#25D366] hover:bg-[#1ebd5a] focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-white'
                }`} type="submit">
                  Enviar
                </button>
                <button type="button" className={`w-full sm:w-fit rounded-lg text-sm px-6 py-2 h-[50px] font-medium border transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800 focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-slate-900'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:ring-offset-white'
                }`} onClick={() => setIsWhatsappModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* RESPECT AND LEGAL WARNING MODAL */}
      <AnimatePresence>
        {isRespectModalOpen && (
          <motion.div
            key="respect-warning-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[11000] flex items-center justify-center p-4 backdrop-blur-xl ${
              theme === 'dark' ? 'bg-black/85' : 'bg-black/50'
            }`}
            onClick={() => setIsRespectModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-8 rounded-2xl shadow-2xl relative max-w-lg w-full max-h-[90vh] overflow-y-auto border transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-slate-900 border-red-500/30 text-white shadow-red-950/20' 
                  : 'bg-white border-red-200 text-slate-900 shadow-slate-200'
              }`}
            >
              {/* Alert Header Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-inter tracking-tight text-red-600 dark:text-red-400">
                    Aviso de Respeito e Cidadania
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    Internet não é terra sem leis
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-[14.5px] leading-relaxed font-sans">
                <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                  Detectamos termos ofensivos ou inadequados nos campos digitados. A empatia, a ética e o respeito mútuo são fundamentais para uma convivência harmônica em nossa sociedade.
                </p>

                <div className={`p-4 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-slate-950/50 border-slate-800' 
                    : 'bg-slate-50 border-slate-100'
                }`}>
                  <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span>
                    Crimes Virtuais de Ofensa
                  </h4>
                  <p className={`text-[13px] leading-normal ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mb-3`}>
                    No Brasil, injúrias, calúnias ou difamações proferidas por meios eletrônicos (redes sociais, formulários, e-mails) constituem infrações de alta gravidade enquadradas no <strong>Código Penal Brasileiro</strong>:
                  </p>
                  <ul className="space-y-2.5 text-[13px] list-none pl-0">
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Injúria (Art. 140)</strong>: Ofender a dignidade ou o decoro de outrem. Pena aumentada caso utilize elementos discriminatórios.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Difamação (Art. 139)</strong>: Difamar a reputação alheia imputando-lhe fato ofensivo à sua reputação.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span><strong>Calúnia (Art. 138)</strong>: Afirmar falsamente que alguém cometeu um ato criminoso.</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2">
                  <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-2`}>
                    Consulte a legislação oficial sobre Crimes Contra a Honra diretamente no site do Planalto:
                  </p>
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-sky-500 hover:text-sky-400 hover:underline transition-colors"
                  >
                    <span>Decreto-Lei nº 2.848 (Código Penal Brasileiro)</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsRespectModalOpen(false)}
                  className="w-full py-3 px-6 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-500 active:scale-98 transition-all shadow-md shadow-red-600/10 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                >
                  Entendi e me comprometo a respeitar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


