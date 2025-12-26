
import React from 'react';

interface AndromedaDefinitionProps {
  emq: number;
}

export const AndromedaDefinition: React.FC<AndromedaDefinitionProps> = ({ emq }) => {
  const isOptimized = emq >= 8;
  const isWarning = emq >= 6 && emq < 8;
  const isDanger = emq < 6;

  // Configuration dynamique de la carte "Signal"
  const signalConfig = {
    title: isOptimized ? "Signal Laser" : isWarning ? "Signal Instable" : "Le Pixel Aveugle",
    desc: isOptimized 
      ? "Votre Pixel capte 100% des données. L'IA Andromeda est parfaitement alimentée et peut identifier vos acheteurs avec une précision chirurgicale."
      : isWarning
      ? "Votre signal est flou. L'IA reçoit des données fragmentées, ce qui limite sa capacité d'apprentissage et rend vos performances instables."
      : "Sans CAPI et avec un score EMQ faible, Meta ne voit que 40% de vos ventes. L'IA Andromeda est privée de vue et dépense votre budget au hasard.",
    colorClass: isOptimized ? "border-emerald-500 bg-emerald-50/30" : isWarning ? "border-amber-400 bg-amber-50/30" : "border-red-50 bg-white",
    titleClass: isOptimized ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-red-600",
    icon: isOptimized ? "🎯" : isWarning ? "⚠️" : "🌑",
    progressClass: isOptimized ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-red-500",
    statusLabel: isOptimized ? "Signal Synchronisé" : isWarning ? "Signal Bruité" : "Perte de Data"
  };

  return (
    <div className="w-full space-y-12 animate-fade-in py-12">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-indigo-900 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-2 border border-indigo-500/30">
          Concept Exclusif AdsPilot Pro
        </div>
        <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-slate-900">
          C'est quoi <span className="text-indigo-600">Andromeda ?</span>
        </h3>
        <p className="text-slate-500 font-medium italic text-lg max-w-2xl mx-auto">
          Andromeda est le nom de code de l'IA de Meta. Son efficacité dépend exclusivement de la clarté du signal que vous lui envoyez.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* CARTE 1: SIGNAL (DYNAMIQUE) */}
        <div className={`border-2 p-10 rounded-[3rem] space-y-6 relative overflow-hidden group transition-all duration-500 ${signalConfig.colorClass}`}>
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
            <span className="text-6xl">{signalConfig.icon}</span>
          </div>
          <h4 className={`text-xl font-black uppercase tracking-tighter ${signalConfig.titleClass}`}>
            {signalConfig.title}
          </h4>
          <p className="text-slate-600 text-sm leading-relaxed italic">
            {signalConfig.desc}
          </p>
          <div className="pt-4 flex items-center gap-3">
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${signalConfig.progressClass}`} 
                  style={{ width: `${(emq / 10) * 100}%` }}
                ></div>
             </div>
             <span className={`text-[10px] font-black uppercase whitespace-nowrap ${signalConfig.titleClass}`}>
               {signalConfig.statusLabel}
             </span>
          </div>
        </div>

        {/* CARTE 2: LE MOTEUR (CIBLE) */}
        <div className="bg-slate-900 p-10 rounded-[3rem] space-y-6 relative overflow-hidden group shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-700">
            <span className="text-6xl">⚡</span>
          </div>
          <h4 className="text-xl font-black uppercase tracking-tighter text-indigo-400">Le Moteur Andromeda</h4>
          <p className="text-slate-400 text-sm leading-relaxed italic">
            Lorsque votre signal est pur, l'IA reçoit un feedback instantané sur chaque euro dépensé. Elle identifie vos futurs clients avant même qu'ils ne cliquent. C'est le secret du <strong>Scaling Illimité</strong>.
          </p>
          <div className="pt-4 flex items-center gap-3">
             <div className="h-1.5 w-full bg-indigo-500/20 rounded-full overflow-hidden">
                <div className="h-full w-full bg-indigo-500 animate-shimmer"></div>
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase">Andromeda Active</span>
          </div>
        </div>
      </div>

      {/* LES 3 PILIERS */}
      <div className="bg-indigo-50 rounded-[4rem] p-12 md:p-16 border border-indigo-100">
        <h5 className="text-center text-[11px] font-black text-indigo-600 uppercase tracking-[0.5em] mb-12 italic">Les 3 Piliers de l'Architecture</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">📡</div>
            <h6 className="font-black uppercase tracking-tighter text-slate-900">Le Signal (Data)</h6>
            <p className="text-xs text-slate-500 leading-relaxed italic">Sans une CAPI Server-side, Andromeda est aveugle. C'est votre priorité technique n°1.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🎨</div>
            <h6 className="font-black uppercase tracking-tighter text-slate-900">Le Carburant (Creatives)</h6>
            <p className="text-xs text-slate-500 leading-relaxed italic">Andromeda se nourrit de formats variés (UGC, Reels, Statiques) pour trouver vos audiences.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="text-4xl mb-4">🎯</div>
            <h6 className="font-black uppercase tracking-tighter text-slate-900">La Structure (Broad)</h6>
            <p className="text-xs text-slate-500 leading-relaxed italic">Laissez l'IA choisir. Le ciblage par intérêts est mort. Le scaling moderne est large (Broad).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
