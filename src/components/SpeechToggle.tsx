import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SpeechToggleProps {
  soundEnabled: boolean;
  onSoundChange: (enabled: boolean) => void;
}

export const speak = (text: string) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Cancel any ongoing speaking to keep responsive speed
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'pt-BR';
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // Cute cheerful educational pitch

  // Look for a high-quality Portuguese voice
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt-PT'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const SpeechToggle: React.FC<SpeechToggleProps> = ({ soundEnabled, onSoundChange }) => {
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setHasSpeechSupport(true);
      // Trigger voice list load (some browsers load async)
      window.speechSynthesis.getVoices();
    }
  }, []);

  const handleToggle = () => {
    const newState = !soundEnabled;
    onSoundChange(newState);
    if (newState) {
      speak("Som ligado!");
    }
  };

  if (!hasSpeechSupport) return null;

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full border transition-all duration-200 active:scale-90 flex items-center justify-center ${
        soundEnabled
          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
          : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
      }`}
      title={soundEnabled ? "Desativar áudio" : "Ativar áudio em português"}
      aria-label="Alternar áudio"
    >
      {soundEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
    </button>
  );
};
