import React, { useState, useMemo } from 'react';
import { Module, Lesson } from '../types';
import { AuthService } from '../services/storage';

const ACADEMY_CONTENT: Module[] = [
  {
    id: 'mod-1',
    title: "01. Check-list Pré-Décollage",
    description: "Les fondamentaux techniques et mentaux avant de dépenser le premier euro. Accès Gratuit.",
    thumbnail: "🚀",
    progress: 0,
    isLocked: false,
    lessons: [
      { id: 'l1-1', title: "Sécurisation du Business Manager", duration: "05:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false },
      { id: 'l1-2', title: "La psychologie du Media Buyer", duration: "10:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-2',
    title: "02. Radar à Profit",
    description: "Mise en place des tableaux de bord financiers pour piloter à la marge nette.",
    thumbnail: "📡", progress: 0, isLocked: true, lessons: [
      { id: 'l2-1', title: "Setup Dashboard Financier", duration: "12:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-3',
    title: "03. Architecture Créative IA",
    description: "Comment utiliser l'IA pour générer des scripts qui convertissent massivement.",
    thumbnail: "🤖", progress: 0, isLocked: true, lessons: [
      { id: 'l3-1', title: "Génération de scripts via IA", duration: "15:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-4',
    title: "04. Le Protocole Scroll-Stopper",
    description: "La science des 3 premières secondes pour capturer l'attention instantanément.",
    thumbnail: "⚡", progress: 0, isLocked: true, lessons: [
      { id: 'l4-1', title: "Hooks visuels dévastateurs", duration: "08:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-5',
    title: "05. Exploration d'Audience",
    description: "La méthode Broad vs Interests : laisser l'algorithme travailler pour vous.",
    thumbnail: "🎯", progress: 0, isLocked: true, lessons: [
      { id: 'l5-1', title: "Structure de campagne Broad", duration: "11:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-6',
    title: "06. Injection de Budget",
    description: "Les règles mathématiques pour augmenter le budget sans casser le CPA.",
    thumbnail: "💉", progress: 0, isLocked: true, lessons: [
      { id: 'l6-1', title: "Scaling Vertical sécurisé", duration: "09:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-7',
    title: "07. L'Algorithme Andromeda",
    description: "Comprendre le fonctionnement interne de l'IA Meta pour la dompter.",
    thumbnail: "🌌", progress: 0, isLocked: true, lessons: [
      { id: 'l7-1', title: "Le cerveau de Meta", duration: "14:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-8',
    title: "08. Audit de Vol",
    description: "Savoir lire les métriques et couper les branches mortes impitoyablement.",
    thumbnail: "📊", progress: 0, isLocked: true, lessons: [
      { id: 'l8-1', title: "Analyse de metrics P&L", duration: "10:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-9',
    title: "09. Phase de Scaling Vertical",
    description: "Doubler, tripler les budgets sur les campagnes gagnantes.",
    thumbnail: "📈", progress: 0, isLocked: true, lessons: [
      { id: 'l9-1', title: "Scaling agressif x10", duration: "13:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-10',
    title: "10. Phase de Scaling Horizontal",
    description: "Duplication et diversification pour saturer votre marché cible.",
    thumbnail: "🌍", progress: 0, isLocked: true, lessons: [
      { id: 'l10-1', title: "Diversification d'audiences", duration: "12:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-11',
    title: "11. Blindage Anti-Ban",
    description: "Protéger votre compte publicitaire contre les blocages injustifiés.",
    thumbnail: "🛡️", progress: 0, isLocked: true, lessons: [
      { id: 'l11-1', title: "Sécurisation BM & Profils", duration: "07:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  },
  {
    id: 'mod-12',
    title: "12. Commandement Suprême",
    description: "Délégation, automatisation et vision long terme de l'empire.",
    thumbnail: "👑", progress: 0, isLocked: true, lessons: [
      { id: 'l12-1', title: "Automatisation du profit", duration: "15:00", videoUrl: "dQw4w9WgXcQ", isCompleted: false, isLocked: false }
    ]
  }
];

interface AcademyViewProps {
  isDark?: boolean;
}

export const AcademyView: React.FC<AcademyViewProps> = ({ isDark = true }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  
  const currentUser = AuthService.getCurrentUser();
  const hasAccess = currentUser?.has_andromeda_access || false;

  // Calculer les modules avec le statut de verrouillage mis à jour
  const modulesWithAccess = useMemo(() => {
    return ACADEMY_CONTENT.map(mod => ({
      ...mod,
      isLocked: mod.id === 'mod-1' ? false : !hasAccess
    }));
  }, [hasAccess]);

  const handleModuleClick = (mod: Module) => {
    if (mod.isLocked) {
      setShowLockOverlay(true);
    } else if (mod.lessons && mod.lessons.length > 0) {
      setSelectedModule(mod);
      setSelectedLesson(mod.lessons[0]);
    }
  };

  const goToSalesPage = () => {
    // @ts-ignore
    if (window.setAppMode) window.setAppMode('masterclass');
  };

  if (selectedModule && selectedLesson) {
    return (
      <div className={`h-full flex flex-col ${isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900'} animate-fade-in`}>
        <div className={`px-8 py-6 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center gap-4`}>
          <button 
            onClick={() => { setSelectedModule(null); setSelectedLesson(null); }}
            className={`text-[10px] font-black uppercase tracking-widest hover:text-indigo-500 transition-colors flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            ← Retour
          </button>
          <span className="text-slate-600">/</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedModule.title}</span>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 overflow-y-auto p-6 lg:p-12">
             <div className="max-w-5xl mx-auto space-y-8">
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative">
                   <iframe 
                     width="100%" height="100%" 
                     src={`https://www.youtube.com/embed/${selectedLesson.videoUrl || ''}?rel=0`} 
                     title="Video Player"
                     frameBorder="0" allowFullScreen
                     className="absolute inset-0"
                   ></iframe>
                </div>
                <div className="flex justify-between items-center">
                   <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">{selectedLesson.title}</h1>
                   <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Terminer la leçon</button>
                </div>
             </div>
          </div>
          <div className={`w-full lg:w-96 border-l shrink-0 flex flex-col ${isDark ? 'border-white/10 bg-[#0A0A0A]' : 'border-slate-200 bg-white'}`}>
             <div className="p-6 border-b border-inherit">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Programme du Module</h3>
                <div className="mt-4 h-1 bg-slate-700/30 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: `${selectedModule.progress || 0}%` }}></div>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {(selectedModule.lessons || []).map((lesson, idx) => (
                   <button 
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        selectedLesson.id === lesson.id 
                          ? (isDark ? 'bg-indigo-500/10 border-indigo-500 text-white' : 'bg-indigo-50 border-indigo-200 text-indigo-900')
                          : (isDark ? 'border-transparent hover:bg-white/5 text-slate-400' : 'border-transparent hover:bg-slate-50 text-slate-500')
                      }`}
                   >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border border-inherit">{idx + 1}</span>
                      <p className="text-[11px] font-bold uppercase tracking-wide">{lesson.title}</p>
                   </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 md:p-16 w-full max-w-[1600px] mx-auto animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className="mb-12 space-y-4">
         <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Académie <span className="text-indigo-500">Andromeda</span>
         </h1>
         <p className={`text-lg font-medium italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Accédez à vos missions d'entraînement et aux protocoles secrets de media buying.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
         {modulesWithAccess.map((mod) => (
            <div 
               key={mod.id} 
               onClick={() => handleModuleClick(mod)}
               className={`relative group rounded-[2.5rem] border overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer ${
                  mod.isLocked
                    ? 'opacity-80 border-slate-800' 
                    : `hover:-translate-y-2 hover:shadow-2xl hover:border-indigo-500/50 ${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200'}`
               }`}
            >
               <div className={`aspect-video w-full flex items-center justify-center text-6xl relative ${isDark ? 'bg-[#111]' : 'bg-slate-100'}`}>
                  {mod.thumbnail}
                  {mod.isLocked && (
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center flex-col gap-2">
                        <span className="text-4xl">🔒</span>
                     </div>
                  )}
               </div>
               <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-black uppercase italic tracking-tight mb-3">{mod.title}</h3>
                  <p className="text-xs font-medium leading-relaxed opacity-60 flex-1">{mod.description}</p>
                  {mod.isLocked && (
                     <div className="mt-4 pt-4 border-t border-white/5 text-amber-500 text-[9px] font-black uppercase tracking-widest">Contenu Verrouillé • Nécessite Andromeda</div>
                  )}
               </div>
            </div>
         ))}
      </div>

      {showLockOverlay && (
        <div className="fixed inset-0 z-[500] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
           <div className="max-w-md w-full text-center space-y-8 bg-slate-900 border border-indigo-500/30 p-10 rounded-[3rem] shadow-2xl">
              <div className="w-20 h-20 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">👑</div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Accès Andromeda Requis</h3>
              <p className="text-slate-400 font-medium italic leading-relaxed">
                 Ce module exclusif est réservé aux membres de l'Escouade Andromeda. Débloquez votre plein potentiel de scaling dès maintenant.
              </p>
              <button 
                onClick={goToSalesPage}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-xl"
              >
                DÉBLOQUER L'ARSENAL &rarr;
              </button>
              <button onClick={() => setShowLockOverlay(false)} className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Retourner au Cockpit</button>
           </div>
        </div>
      )}
    </div>
  );
};