
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
      
      {/* NAVIGATION PREMIUM */}
      <nav className="fixed top-0 left-0 w-full h-20 md:h-24 z-[100] px-6 md:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-slate-100">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer scale-90 md:scale-100" />
        
        <div className="flex items-center gap-6 md:gap-10">
          <button 
            onClick={onBoutique}
            className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-[#64748B] hover:text-[#6366F1] transition-colors"
          >
            Boutique
          </button>
          
          {currentUser ? (
            <button 
              onClick={onDashboard}
              className="bg-[#1E293B] text-white px-8 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#6366F1] transition-all shadow-xl active:scale-95"
            >
              Cockpit Expert
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

      {/* HERO SECTION */}
      <section className="relative pt-48 md:pt-64 pb-32 md:pb-48 bg-white overflow-hidden text-center">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
           <div className="inline-block px-4 py-1.5 bg-indigo-50 text-[#6366F1] rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-indigo-100">
              Système d'Exploitation ROI v6.2
           </div>
           <h1 className="text-5xl md:text-[6.5rem] font-black tracking-tighter text-[#1E293B] mb-12 leading-[0.85] uppercase italic">
             L'ARCHITECTURE <br/>
             DE SCALING <br/>
             <span className="text-[#6366F1]">DÉFINITIVE.</span>
           </h1>
           <p className="text-xl md:text-2xl text-[#64748B] max-w-3xl mx-auto mb-20 leading-relaxed font-medium italic">
             Passez de l'amateurisme à la rigueur scientifique. AdsPilot Pro est l'armure technologique conçue pour transformer vos campagnes Meta en Empire.
           </p>
           <button 
              onClick={onStart}
              className="bg-[#1E293B] text-white px-14 py-7 rounded-2xl text-xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-[#6366F1] transition-all hover:-translate-y-1 active:scale-95"
            >
              DÉPLOYER MON INFRASTRUCTURE &rarr;
            </button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-[120px] -z-0"></div>
      </section>

      {/* GRID DES MODULES (RÉSUMÉ) */}
      <section className="py-32 md:py-48 bg-[#F8FAFC] border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-[#6366F1] font-black uppercase text-xs tracking-[0.5em] italic">Infrastructure d'Empire</h2>
            <h3 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-none text-[#1E293B]">
              L'ARSENAL <br/> <span className="text-slate-400">TECHNOLOGIQUE.</span>
            </h3>
            <p className="text-lg text-[#64748B] font-medium italic max-w-2xl mx-auto leading-relaxed">
              Six modules intégrés conçus pour sécuriser votre profit, valider vos actifs et simuler votre croissance avec une précision chirurgicale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             <ModuleSummaryCard 
                title="ATLAS" 
                desc="Le module qui traque chaque euro. Atlas ne se contente pas de lire tes données, il identifie tes pertes financières invisibles pour sécuriser ton profit net." 
                icon="🌍" 
             />
             <ModuleSummaryCard 
                title="ORACLE" 
                desc="L'IA qui analyse tes publicités avant que l'algorithme Meta ne le fasse. Oracle détecte la puissance d'arrêt et la clarté de ton offre pour garantir un CTR optimal." 
                icon="👁️" 
             />
             <ModuleSummaryCard 
                title="MERCURY" 
                desc="Simule tes profits à l'euro près. Mercury te permet de tester tes hypothèses de budget et de prédire tes revenus sans risquer ton capital." 
                icon="⚡" 
             />
             <ModuleSummaryCard 
                title="ANDROMEDA" 
                desc="L'intelligence comparative. Analyse tes signaux Meta et identifie les goulots d'étranglement de ton scaling pour ne plus laisser la chance décider." 
                icon="🌌" 
             />
             <ModuleSummaryCard 
                title="AUDIT" 
                desc="Le scanner 360° de votre tunnel. Identifiez les frictions qui tuent votre conversion et transformez vos prospects en clients dévoués." 
                icon="📄" 
             />
             <SidebarPilotCard />
          </div>
        </div>
      </section>

      {/* DOSSIERS CONFIDENTIELS (DÉTAILLÉS) */}
      <section className="py-32 md:py-56 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-40 space-y-4">
            <h2 className="text-[#6366F1] font-black uppercase text-xs tracking-[0.5em] italic">Dossiers Confidentiels</h2>
            <h3 className="text-4xl md:text-[5.5rem] font-black italic tracking-tighter uppercase leading-none text-[#1E293B]">
              Rapports de <span className="text-slate-400">Bataille.</span>
            </h3>
            <p className="text-[#64748B] text-xl font-medium italic mt-6">Comment l'infrastructure a sauvé et scalé des business réels.</p>
          </div>

          <div className="space-y-64">
             {/* MODULE 1: ATLAS */}
             <DossierItem 
                badge="Rapport de Rentabilité"
                title="LE TITAN ATLAS (P&L)"
                problem="Une marque de mode naviguait avec un ROAS de 3.5 mais voyait sa trésorerie fondre. Atlas a scanné les coûts cachés (logistique, retours, taxes) que Meta ignorait."
                solution="L'interface a immédiatement isolé une fuite de 4 000€ mensuels. En pivotant vers une gestion 'Net Profit', le business est devenu sain en 7 jours."
                metrics={[
                  { label: "Pertes Stoppées", value: "+4 000€" },
                  { label: "Marge Nette", value: "+18%" }
                ]}
                side="right"
                mockup={<AtlasSnippetDark />}
                caption="Détection instantanée des anomalies de profit."
             />

             {/* MODULE 2: ORACLE */}
             <DossierItem 
                badge="Audit Créatif Vision IA"
                title="L'EXPLOSION ORACLE (CREATIVE)"
                problem="CTR stagnant à 0.80%. L'IA Oracle a scanné les actifs créatifs pour identifier les zones de friction et le manque d'impact émotionnel sur les 3 premières secondes."
                solution="Le diagnostic a révélé un Hook Rate trop faible (pastille Orange). Après correction vers un format 9:16 contrasté, le CTR a bondi à 3.20%."
                metrics={[
                  { label: "CTR Final", value: "3.20%" },
                  { label: "Hook Rate", value: "x4.2" }
                ]}
                side="left"
                mockup={<OracleSnippetDark />}
                caption="Validation scientifique de vos actifs créatifs par IA."
             />

             {/* MODULE 3: MERCURY */}
             <DossierItem 
                badge="Simulation de Scaling"
                title="L'ACCÉLÉRATEUR MERCURY"
                problem="Peur du scaling vertical. Le client craignait qu'une hausse de budget ne détruise son ROI actuel. Mercury a simulé 14 scénarios de scale."
                solution="Mercury a prédit un ROI de 4.5. Le déploiement réel à 5 000€/jour a confirmé une précision prédictive de 98% (ROI réel de 4.48)."
                metrics={[
                  { label: "ROI Prédit", value: "4.50" },
                  { label: "ROI Réel", value: "4.48" }
                ]}
                side="right"
                mockup={<MercurySnippetDark />}
                caption="Simulateur Mercury : Précision prédictive chirurgicale."
             />

             {/* MODULE 4: ANDROMEDA */}
             <DossierItem 
                badge="Benchmark Industriel"
                title="LE RADAR ANDROMEDA (KPI)"
                problem="Absence de boussole. Comment savoir si votre CPA de 25€ est une victoire ou une faillite imminente par rapport à vos concurrents ?"
                solution="Andromeda compare vos metrics aux leaders du top 1%. Le verdict a forcé un pivot immédiat sur une opportunité de scale non détectée."
                metrics={[
                  { label: "CPA Delta", value: "-12€" },
                  { label: "Benchmark", value: "TOP 1%" }
                ]}
                side="left"
                mockup={<AndromedaSnippetDark />}
                caption="Comparatif en temps réel avec les standards du marché."
             />
          </div>

          <div className="mt-64 text-center bg-slate-900 rounded-[4rem] p-16 md:p-24 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <h4 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mb-10 relative z-10">
               DÉPLOYER VOTRE <br/>
               <span className="text-[#6366F1]">COMMAND CENTER.</span>
             </h4>
             <button 
                onClick={onLogin}
                className="relative z-10 bg-white text-slate-900 px-16 py-8 rounded-2xl text-xl font-black uppercase italic tracking-widest hover:bg-[#6366F1] hover:text-white transition-all shadow-2xl active:scale-95"
              >
                ACCÉDER AU COCKPIT &rarr;
              </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 bg-white text-center border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
           <Logo iconOnly className="opacity-20 scale-90" />
           <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-[0.5em]">
              © 2026 AdsPilot Pro — L'Architecture d'Expertise Meta.
           </p>
           <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-[#6366F1] hover:text-[#1E293B] transition-colors italic">Command Center &rarr;</button>
        </div>
      </footer>
    </div>
  );
};

/* --- COMPOSANTS DE STRUCTURE DOSSIER --- */

const DossierItem = ({ badge, title, problem, solution, metrics, side, mockup, caption }: any) => (
  <div className={`flex flex-col ${side === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 md:gap-32`}>
     <div className="lg:w-1/2 space-y-12 animate-fade-in">
        <div className="space-y-6">
           <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#6366F1] rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 italic">
              {badge}
           </span>
           <h4 className="text-4xl md:text-5xl font-black italic text-[#1E293B] uppercase tracking-tighter leading-none">{title}</h4>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-50 border border-slate-100 p-10 rounded-[3rem] relative shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">LE PROBLÈME</p>
              <p className="text-slate-600 font-medium italic leading-relaxed text-lg">"{problem}"</p>
           </div>
           <div className="bg-[#F5F3FF] border border-[#DDD6FE] p-10 rounded-[3rem] relative shadow-sm">
              <p className="text-[9px] font-black text-[#6366F1] uppercase tracking-widest mb-3">LA SOLUTION STRATÉGIQUE</p>
              <p className="text-[#1E293B] font-bold italic leading-relaxed text-lg">"{solution}"</p>
           </div>
        </div>

        <div className="flex gap-16 pt-6">
           {metrics.map((m: any, idx: number) => (
              <div key={idx} className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{m.label}</p>
                 <p className="text-5xl md:text-7xl font-black text-[#6366F1] tracking-tighter italic">{m.value}</p>
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

const ModuleSummaryCard = ({ title, desc, icon }: any) => (
  <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] space-y-6 hover:border-[#6366F1] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group">
     <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all">{icon}</div>
     <div>
        <h5 className="text-xl font-black italic uppercase tracking-tighter text-[#1E293B] mb-2">{title}</h5>
        <p className="text-slate-500 text-sm font-medium italic leading-relaxed">{desc}</p>
     </div>
  </div>
);

const SidebarPilotCard = () => (
  <div className="p-1 p-1 bg-gradient-to-br from-[#6366F1] to-indigo-900 rounded-[2.5rem] shadow-xl">
    <div className="bg-[#1E293B] rounded-[2.4rem] p-9 h-full flex flex-col justify-center text-white space-y-4">
        <h5 className="text-xl font-black italic uppercase tracking-tighter">PILOTAGE D'EMPIRE</h5>
        <p className="text-slate-400 text-sm font-medium italic leading-relaxed">La configuration experte par Alexia. Déployez l'infrastructure globale qui soutient le scaling massif du top 1% annonceurs.</p>
        <div className="pt-2">
           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-3 py-1 rounded-full">Système Prêt</span>
        </div>
    </div>
  </div>
);

/* --- UI SNIPPETS DARK MODE --- */

const AtlasSnippetDark = () => (
  <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5 p-12 space-y-10 transform hover:scale-[1.03] transition-transform duration-700">
     <div className="flex justify-between items-center border-b border-white/5 pb-8">
        <div className="flex gap-2">
           <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
           <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Atlas Engine v6.2</span>
     </div>
     <div className="space-y-8">
        <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl flex justify-between items-center">
           <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Fuite Détectée</span>
           <span className="text-2xl font-black text-red-500">- 4 000 €</span>
        </div>
        <div className="flex justify-center opacity-30"><span className="text-white text-3xl">↓</span></div>
        <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex justify-between items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
           <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Profit Sécurisé</span>
           <span className="text-2xl font-black text-emerald-500">+ 12 850 €</span>
        </div>
     </div>
  </div>
);

const OracleSnippetDark = () => (
  <div className="w-full max-w-lg mx-auto bg-[#080808] rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5 p-12 space-y-12 transform hover:-rotate-2 transition-transform duration-700">
     <div className="flex items-center gap-5 border-b border-white/5 pb-8">
        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-2xl">👁️</div>
        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em]">Oracle Vision AI</span>
     </div>
     <div className="space-y-10">
        <div className="space-y-4">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Hook Rate (3s)</span>
              <span className="text-amber-500">Alerte Orange — 4.2/10</span>
           </div>
           <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[42%] bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
           </div>
        </div>
        <div className="space-y-4">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Désirabilité Produit</span>
              <span className="text-emerald-500">Optimal — 9.5/10</span>
           </div>
           <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[95%] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
           </div>
        </div>
     </div>
  </div>
);

const MercurySnippetDark = () => (
  <div className="w-full max-w-lg mx-auto bg-slate-900 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5 p-12 space-y-10 transform hover:rotate-2 transition-transform duration-700">
     <div className="flex justify-between items-center mb-8">
        <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] italic">Mercury Simulator</span>
        <span className="px-4 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[9px] font-black text-blue-400 uppercase tracking-widest">Précision 98%</span>
     </div>
     <div className="grid grid-cols-2 gap-6">
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ROI Prédit</p>
           <p className="text-4xl font-black text-white italic tracking-tighter">4.50</p>
        </div>
        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl text-center space-y-2">
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ROI Réel</p>
           <p className="text-4xl font-black text-emerald-500 italic tracking-tighter">4.48</p>
        </div>
     </div>
  </div>
);

const AndromedaSnippetDark = () => (
  <div className="w-full max-w-lg mx-auto bg-[#0A0A0A] rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/5 p-12 space-y-8 transform hover:scale-[1.05] transition-transform duration-700">
     <div className="text-center pb-6 border-b border-white/5">
        <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em]">Radar Andromeda Benchmark</h5>
     </div>
     <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <span className="text-[11px] font-black text-slate-500 uppercase">CPA Actuel</span>
           <span className="text-2xl font-black text-white italic">25,40 €</span>
        </div>
        <div className="p-8 bg-indigo-600/10 border border-indigo-600/30 rounded-[2.5rem] space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-300 uppercase italic">Leader Niche</span>
              <span className="text-3xl font-black text-indigo-400 italic">12,10 €</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[35%] bg-indigo-600 animate-shimmer"></div>
           </div>
           <p className="text-center text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em]">Opportunité de Scale Immédiate</p>
        </div>
     </div>
  </div>
);
