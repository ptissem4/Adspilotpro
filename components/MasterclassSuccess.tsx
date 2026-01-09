import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';
import { AuthService } from '../services/storage';
// @ts-ignore
import confetti from 'canvas-confetti';

interface MasterclassSuccessProps {
  onContinue: () => void;
}

export const MasterclassSuccess: React.FC<MasterclassSuccessProps> = ({ onContinue }) => {
  const [loading, setLoading] = useState(true);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    // 1. Déclencher les confettis pour célébrer
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // 2. Vérification de la session et mise à jour forcée de l'accès
    const finalizeAccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');

      if (currentUser) {
        try {
          // On force la mise à jour des accès dans la base et le localStorage
          await AuthService.grantAndromedaAccess(currentUser.id);
          console.log("Accès Andromeda déverrouillé avec succès.");
        } catch (e) {
          console.error("Erreur lors de la mise à jour des accès:", e);
        }
      }
      setLoading(false);
    };

    finalizeAccess();
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 animate-fade-in font-sans">
      <div className="max-w-2xl w-full bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_50px_100px_-20px_rgba(99,102,241,0.15)] p-10 md:p-20 text-center space-y-12 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-10">
          <Logo className="justify-center scale-90" />
          
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3 transform transition-transform hover:rotate-0">
             <span className="text-4xl text-white">🎉</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
              Succès de l'Achat. <br/>
              <span className="text-indigo-600">Bienvenue, Pilote.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium italic max-w-sm mx-auto leading-relaxed">
               Votre accès à la Masterclass Andromeda est activé. Toutes les missions sont désormais déverrouillées.
            </p>
          </div>

          <div className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-8 space-y-6">
             <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Statut du Compte</span>
                <span className="text-emerald-500 flex items-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                   Accès Andromeda Actif
                </span>
             </div>
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-emerald-500"></div>
             </div>
             <p className="text-[11px] text-slate-400 italic leading-relaxed font-bold">
                Mise à jour système effectuée. Pas de déconnexion requise.
             </p>
          </div>

          <button 
            onClick={onContinue}
            disabled={loading}
            className="w-full bg-[#1A202C] text-white py-6 md:py-8 rounded-2xl text-lg md:text-xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-4 group"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                ACCÉDER À MA PREMIÈRE MISSION
                <span className="group-hover:translate-x-2 transition-transform">→</span>
              </>
            )}
          </button>
          
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Propulsé par le Système d'Exploitation ROI v6.2
          </p>
        </div>
      </div>
    </div>
  );
};