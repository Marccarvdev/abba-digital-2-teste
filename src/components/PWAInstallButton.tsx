import React, { useEffect, useState } from 'react';
import { Download, Sparkles, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Detect iOS to show specific instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // If no desktop prompt, maybe it's iOS or just not captured yet. Explain to user.
      setShowIosGuide(true);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {isInstalled ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" /> App Instalado
          </span>
        ) : (
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs hover:shadow-md active:scale-95 transition-all text-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar App (Grátis)</span>
          </button>
        )}
      </div>

      {/* iOS & Manual Installation Guidelines Modal */}
      <AnimatePresence>
        {showIosGuide && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setShowIosGuide(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-50 p-2.5 rounded-full text-red-600">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-gray-900">Como instalar o ABBA DIGITAL?</h3>
                  <p className="text-xs text-gray-500">Use offline em qualquer dispositivo!</p>
                </div>
              </div>

              <div className="space-y-4 my-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 mb-1.5">
                    📱 No Celular Apple (iPhone / iPad)
                  </h4>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside leading-relaxed">
                    <li>Abra o link no navegador <strong>Safari</strong>.</li>
                    <li>Toque no botão de <strong>Compartilhar</strong> (ícone de quadrado com flecha para cima).</li>
                    <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em "Adicionar" no canto superior direito para confirmar.</li>
                  </ol>
                </div>

                <div className="p-3 bg-red-50/50 rounded-xl border border-red-100">
                  <h4 className="text-sm font-bold text-red-900 flex items-center gap-1.5 mb-1.5">
                    🤖 No Android ou Computador
                  </h4>
                  <ul className="text-xs text-red-800 space-y-1 list-disc list-inside leading-relaxed">
                    <li>Toque nos <strong>Três Pontinhos</strong> do Chrome, Edge ou Opera.</li>
                    <li>Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Instalar ABBA DIGITAL"</strong>.</li>
                    <li>Vá para a sua tela inicial e use o programa livremente offline!</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowIosGuide(false)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors w-full"
                >
                  Entendi, obrigado!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
