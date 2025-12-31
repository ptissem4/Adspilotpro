
import React from 'react';
import { Logo } from './Logo';
import { UserProfile } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onBoutique: () => void;
  onLogin: () => void;
  onDashboard: () => void;
  currentUser: UserProfile | null;
  newLeadsCount?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onBoutique, onLogin, onDashboard, currentUser }) => {
  return (
    <div className="min-h-screen font-sans text-[#1E293B] bg-white selection:bg-indigo-100 scroll-smooth">
      
      {/* NAVIGATION MINIMALISTE */}
      <nav className="fixed top-0 left-0 w-full h-20 md:h-24 z-[100] px-6 md:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer scale-90 md:scale-100" />
        
        <div className="flex items-center gap-6 md:gap-10">
          <button 
            onClick={onBoutique}
            className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B] hover:text-indigo-600 transition-colors"
          >
            Boutique
          </button>
          
          {currentUser ? (
            <button 
              onClick={onDashboard}
              className="bg-[#1E293B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95"
            >
              Tableau de bord
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-slate-100 text-[#1E293B] px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION APPLE-LIKE */}
      <section className="relative pt-48 md:pt-64 pb-24 md:pb-40 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
           <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-indigo-100">
              Système d'Exploitation ROI v6.2
           </div>
           <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tighter text-[#1E293B] mb-12 leading-[0.9] uppercase italic">
             ARRÊTEZ DE PILOTER <br/>
             VOTRE CROISSANCE <br/>
             <span className="text-indigo-600">À L'AVEUGLE.</span>
           </h1>
           <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto mb-20 leading-relaxed font-medium italic">
             Accédez à l'infrastructure de diagnostic qui transforme les chiffres en Empire. L'armure technologique des top 1% annonceurs Meta.
           </p>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto bg-[#1E293B] text-white px-14 py-7 rounded-2xl text-xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-indigo-600 transition-all hover:-translate-y-1 active:scale-95"
              >
                DÉPLOYER MON INFRASTRUCTURE &rarr;
              </button>
           </div>
        </div>
      </section>

      {/* RAPPORTS DE BATAILLE (DÉTAILLÉS AVEC UI SNIPPETS) */}
      <section className="py-32 md:py-48 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32 space-y-4">
            <h2 className="text-indigo-600 font-black uppercase text-xs tracking-[0.5em] italic">Analyses de Terrain</h2>
            <h3 className="text-4xl md:text-[5rem] font-black italic tracking-tighter uppercase leading-none text-[#1E293B]">
              Rapports de <span className="text-slate-400">Bataille.</span>
            </h3>
            <p className="text-[#64748B] text-xl font-medium italic mt-6">Dossiers déclassifiés : La rigueur scientifique appliquée au scaling.</p>
          </div>

          <div className="space-y-56">
             {/* CAS 1: ATLAS (ROUGE -> VERT) */}
             <DossierSection 
                badge="Analyse P&L & Fuites"
                title="LE SAUVETAGE ATLAS (P&L)"
                problem="Une marque de mode naviguait avec un ROAS de 3.5 mais voyait sa trésorerie fondre. Atlas a scanné les coûts cachés (logistique, retours, taxes)."
                solution="L'interface a immédiatement identifié 4 000€ de pertes invisibles. En pivotant vers une gestion 'Net Profit', le business est devenu sain en 7 jours."
                metrics={[
                  { label: "Alertes Stop", value: "ROUGE" },
                  { label: "Correction", value: "VERT" }
                ]}
                side="right"
                mockup={<AtlasSnippet />}
                caption="Détection instantanée des anomalies de profit."
             />

             {/* CAS 2: ORACLE (ORANGE WARNINGS) */}
             <DossierSection 
                badge="Audit Créatif IA"
                title="L'EXPLOSION ORACLE (VISION)"
                problem="CTR stagnant à 0.80%. L'IA Oracle a scanné le visuel pour identifier les zones de friction et le manque d'impact émotionnel."
                solution="Le diagnostic a révélé un Hook Rate trop faible (pastille Orange). Après correction vers un format 9:16 contrasté, le CTR a bondi à 3.20%."
                metrics={[
                  { label: "Hook Rate", value: "x4" },
                  { label: "Scan Score", value: "9.2/10" }
                ]}
                side="left"
                mockup={<OracleSnippet />}
                caption="Validation scientifique de vos actifs créatifs."
             />

             {/* CAS 3: ANDROMEDA (KPI COMPARISONS) */}
             <DossierSection 
                badge="Benchmark Industriel"
                title="LE RADAR ANDROMEDA (KPI)"
                problem="Absence de boussole. Comment savoir si votre CPA de 25€ est une victoire ou une faillite imminente par rapport au marché ?"
                solution="Andromeda compare vos metrics aux leaders de votre niche. Le verdict a forcé un scaling immédiat sur une opportunité non détectée."
                metrics={[
                  { label: "CPA Delta", value: "-12€" },
                  { label: "Volume", value: "+45%" }
                ]}
                side="right"
                mockup={<AndromedaSnippet />}
                caption="Comparatif en temps réel avec les standards du top 1%."
             />
          </div>

          <div className="mt-48 text-center bg-slate-900 rounded-[4rem] p-16 md:p-24 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <h4 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-10 relative z-10 text-center">
               DÉPLOYER VOTRE <br/>
               <span className="text-indigo-400">INFRASTRUCTURE D'EXPERTE.</span>
             </h4>
             <button 
                onClick={onLogin}
                className="relative z-10 bg-white text-slate-900 px-16 py-8 rounded-2xl text-xl font-black uppercase italic tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-2xl active:scale-95"
              >
                DÉPLOYER MON INFRASTRUCTURE &rarr;
              </button>
          </div>
        </div>
      </section>

      {/* FOOTER LIGHT */}
      <footer className="py-24 bg-white text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
           <Logo iconOnly className="opacity-20 scale-90" />
           <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-[0.5em]">
              © 2026 AdsPilot Pro — L'Architecture de Croissance Meta.
           </p>
           <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-[#1E293B] transition-colors italic italic">Command Center &rarr;</button>
        </div>
      </footer>
    </div>
  );
};

/* --- UI SNIPPETS (COMPOSANTS RÉALISTES) --- */

const AtlasSnippet = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8 space-y-6 transform rotate-2 hover:rotate-0 transition-transform duration-700">
    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calculateur Atlas v2</span>
       <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
       </div>
    </div>
    <div className="space-y-4">
       <div className="flex justify-between items-center p-4 bg-red-50 border border-red-100 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <span className="text-[10px] font-black text-red-600 uppercase">Perte Logistique</span>
          <span className="text-sm font-black text-red-600">- 4 000,00 €</span>
       </div>
       <div className="flex justify-center text-xl">↓</div>
       <div className="flex justify-between items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="text-[10px] font-black text-emerald-600 uppercase">Profit Net Réel</span>
          <span className="text-sm font-black text-emerald-600">+ 12 850,00 €</span>
       </div>
    </div>
  </div>
);

const OracleSnippet = () => (
  <div className="w-full max-w-md mx-auto bg-slate-900 rounded-3xl shadow-2xl p-8 space-y-6 transform -rotate-2 hover:rotate-0 transition-transform duration-700">
     <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-xs">👁️</div>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Oracle Creative Scan</span>
     </div>
     <div className="space-y-6">
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
              <span>Hook (Arrêt Scroll)</span>
              <span className="text-amber-500">4/10 — Alerte Orange</span>
           </div>
           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[40%] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"></div>
           </div>
        </div>
        <div className="space-y-2">
           <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
              <span>Clarté de l'offre</span>
              <span className="text-emerald-500">9/10 — Optimal</span>
           </div>
           <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-[90%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
           </div>
        </div>
     </div>
  </div>
);

const AndromedaSnippet = () => (
  <div className="w-full max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6 transform rotate-1 hover:rotate-0 transition-transform duration-700">
     <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b pb-4 border-slate-100">Benchmark Andromeda</h5>
     <div className="space-y-4">
        <div className="flex items-center justify-between">
           <span className="text-xs font-bold text-slate-500 italic">Votre CPA Actuel</span>
           <span className="text-lg font-black text-slate-900">25,40 €</span>
        </div>
        <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
           <span className="text-xs font-bold text-indigo-600 italic">Benchmark Niche (Top 1%)</span>
           <div className="text-right">
              <span className="text-lg font-black text-indigo-600">12,10 €</span>
              <span className="block text-[8px] font-black text-emerald-500 uppercase">Opportunité de Scale</span>
           </div>
        </div>
        <div className="flex justify-center pt-2">
           <div className="w-full h-1 bg-slate-100 rounded-full relative">
              <div className="absolute top-0 left-0 h-full w-[35%] bg-indigo-600 animate-shimmer"></div>
           </div>
        </div>
     </div>
  </div>
);

/* COMPOSANT DOSSIER DÉTAILLÉ */
const DossierSection = ({ badge, title, problem, solution, metrics, side, mockup, caption }: any) => (
  <div className={`flex flex-col ${side === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 md:gap-32`}>
     <div className="lg:w-1/2 space-y-12 animate-fade-in">
        <div className="space-y-6">
           <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
              {badge}
           </span>
           <h4 className="text-4xl md:text-5xl font-black italic text-[#1E293B] uppercase tracking-tighter leading-none">{title}</h4>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] relative">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Le Problème</p>
              <p className="text-slate-600 font-medium italic leading-relaxed">"{problem}"</p>
           </div>
           <div className="bg-indigo-50/40 border border-indigo-100 p-8 rounded-[2.5rem] relative">
              <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3">La Solution Stratégique</p>
              <p className="text-[#1E293B] font-bold italic leading-relaxed">"{solution}"</p>
           </div>
        </div>

        <div className="flex gap-12 pt-6">
           {metrics.map((m: any, idx: number) => (
              <div key={idx} className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                 <p className={`text-4xl font-black tracking-tighter italic ${m.value === 'VERT' || m.value === 'ROUGE' ? (m.value === 'VERT' ? 'text-emerald-500' : 'text-red-500') : 'text-indigo-600'}`}>{m.value}</p>
              </div>
           ))}
        </div>
     </div>
     
     <div className="lg:w-1/2 w-full flex flex-col items-center">
        <div className="relative w-full py-10">
           {mockup}
        </div>
        <p className="mt-8 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] italic text-center">
           {caption}
        </p>
     </div>
  </div>
);
