
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
      <nav className="fixed top-0 left-0 w-full h-16 md:h-24 z-[100] px-4 md:px-12 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-100">
        <Logo onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="cursor-pointer scale-75 md:scale-100 origin-left" />
        
        <div className="flex items-center gap-3 md:gap-10">
          <button 
            onClick={onBoutique}
            className="hidden md:block text-[10px] font-black uppercase tracking-[0.25em] text-[#64748B] hover:text-[#6366F1] transition-colors"
          >
            Boutique
          </button>
          
          {currentUser ? (
            <button 
              onClick={onDashboard}
              className="bg-[#1E293B] text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest hover:bg-[#6366F1] transition-all shadow-xl active:scale-95"
            >
              Cockpit Expert
            </button>
          ) : (
            <button 
              onClick={onLogin}
              className="bg-slate-100 text-[#1E293B] px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              Connexion
            </button>
          )}
        </div>
      </nav>

      {/* HERO SECTION - ARCHITECT EDITION */}
      <section className="relative pt-32 md:pt-64 pb-20 md:pb-48 bg-white overflow-hidden text-center px-4">
        <div className="max-w-6xl mx-auto relative z-10">
           <div className="inline-block px-4 py-1.5 bg-indigo-50 text-[#6366F1] rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] mb-8 md:mb-12 border border-indigo-100">
              Système d'Exploitation ROI v6.2 — Édition Architecte
           </div>
           <h1 className="text-4xl md:text-[6.5rem] font-black tracking-tighter text-[#1E293B] mb-8 md:mb-12 leading-[0.9] uppercase italic">
             PILOTEZ VOTRE <br/>
             CROISSANCE À LA <br/>
             <span className="text-[#6366F1]">MARGE NETTE.</span>
           </h1>
           <p className="text-lg md:text-2xl text-[#64748B] max-w-4xl mx-auto mb-12 md:mb-20 leading-relaxed font-medium italic">
             Arrêtez de naviguer à l'aveugle avec le ROAS de Meta. Accédez à l'infrastructure qui audite vos créas par IA et sécurise votre rentabilité réelle.
           </p>
           <button 
              onClick={onStart}
              className="w-full md:w-auto bg-[#1E293B] text-white px-8 md:px-14 py-5 md:py-7 rounded-2xl text-lg md:text-xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-[#6366F1] transition-all hover:-translate-y-1 active:scale-95"
            >
              DÉPLOYER MON INFRASTRUCTURE &rarr;
            </button>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-indigo-50/30 rounded-full blur-[80px] md:blur-[120px] -z-0"></div>
      </section>

      {/* GRID DES MODULES (THE EMPIRE SUITE) */}
      <section className="py-20 md:py-48 bg-[#F8FAFC] border-y border-slate-100 relative overflow-hidden px-4">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 md:mb-24 space-y-4 md:space-y-6">
            <h2 className="text-[#6366F1] font-black uppercase text-[10px] md:text-xs tracking-[0.5em] italic">L'Empire Suite</h2>
            <h3 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.85] text-[#1E293B]">
              L'ARSENAL <br/> <span className="text-slate-400">DÉCISIONNEL.</span>
            </h3>
            <p className="text-base md:text-lg text-[#64748B] font-medium italic max-w-2xl mx-auto leading-relaxed">
              Six piliers technologiques conçus pour réconcilier vos données, valider vos actifs et simuler votre scale avec une précision chirurgicale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
             <ModuleSummaryCard 
                title="ATLAS (P&L)" 
                desc="Le Titan Financier. Ne vous fiez plus au ROAS menteur. Maîtrisez votre profit net réel après chaque dépense logistique et fiscale." 
                icon="🌍" 
                badge="Finance"
                mockup={<AtlasSnippetCompact />}
             />
             <ModuleSummaryCard 
                title="ORACLE (VISION)" 
                desc="L’Audit Créatif IA. Détectez instantanément pourquoi vos publicités ne convertissent pas avant même de dépenser votre budget." 
                icon="👁️" 
                badge="Intelligence"
                mockup={<OracleSnippetCompact />}
             />
             <ModuleSummaryCard 
                title="MERCURY (SCALE)" 
                desc="Le Simulateur de Profit. Prédisez vos revenus à 30 jours et simulez vos hausses de budget sans jamais casser votre algorithme." 
                icon="⚡" 
                badge="Simulation"
                mockup={<MercurySnippetCompact />}
             />
             <ModuleSummaryCard 
                title="ANDROMEDA" 
                desc="Benchmark industriel. Comparez vos signaux Meta aux leaders du top 1% et identifiez vos goulots d'étranglement." 
                icon="🌌" 
                badge="KPI"
                mockup={<AndromedaSnippetCompact />}
             />
             <ModuleSummaryCard 
                title="AUDIT STRATÉGIQUE" 
                desc="Le scanner 360° de votre tunnel. Identifiez les frictions qui tuent votre conversion et optimisez chaque étape du parcours client." 
                icon="📄" 
                badge="Expertise"
             />
             <SidebarPilotCard />
          </div>
        </div>
      </section>

      {/* RAPPORTS DE BATAILLE (ÉTUDES DE CAS) */}
      <section className="py-20 md:py-56 bg-white overflow-hidden px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24 md:mb-40 space-y-4">
            <h2 className="text-[#6366F1] font-black uppercase text-[10px] md:text-xs tracking-[0.5em] italic">Preuves de Combat</h2>
            <h3 className="text-4xl md:text-[5.5rem] font-black italic tracking-tighter uppercase leading-none text-[#1E293B]">
              Rapports de <span className="text-slate-400">Bataille.</span>
            </h3>
            <p className="text-[#64748B] text-lg md:text-xl font-medium italic mt-6">Comment l'architecture a sauvé et scalé des business réels.</p>
          </div>

          <div className="space-y-40 md:space-y-64">
             {/* MODULE 1: ATLAS */}
             <DossierItem 
                badge="Sauvetage Financier"
                title="LE TITAN ATLAS (P&L)"
                problem="Une marque naviguait avec un ROAS de 3.5 mais voyait sa trésorerie fondre. Atlas a scanné les coûts cachés que Meta ignorait."
                solution="L'interface a immédiatement isolé une fuite de 4 150€ mensuels. En pivotant vers une gestion 'Net Profit', le business est devenu sain en 7 jours."
                metrics={[
                  { label: "Profit Identifié", value: "+4 150€", status: 'emerald' },
                  { label: "Marge Nette", value: "+18%", status: 'emerald' }
                ]}
                side="right"
                mockup={<AtlasSnippetDark />}
                caption="Atlas : Détection chirurgicale des anomalies de profit."
             />

             {/* MODULE 2: ORACLE */}
             <DossierItem 
                badge="Optimisation Créative"
                title="L'EXPLOSION ORACLE (VISION)"
                problem="CTR stagnant à 0.80%. L'IA Oracle a scanné les actifs créatifs pour identifier les zones de friction sur les 3 premières secondes."
                solution="Le diagnostic a révélé un Hook Rate trop faible (pastille Orange). Après correction vers un format 9:16 contrasté, le CTR a bondi à 3.20%."
                metrics={[
                  { label: "CTR Final", value: "3.20%", status: 'emerald' },
                  { label: "Hook Rate", value: "x4.2", status: 'emerald' }
                ]}
                side="left"
                mockup={<OracleSnippetDark />}
                caption="Oracle : Audit prédictif avant déploiement massif."
             />

             {/* MODULE 3: MERCURY */}
             <DossierItem 
                badge="Scalabilité Prédictive"
                title="L'ACCÉLÉRATEUR MERCURY"
                problem="Peur du scaling vertical. Le client craignait qu'une hausse de budget ne détruise son ROI actuel. Mercury a simulé 14 scénarios."
                solution="Mercury a prédit un ROI de 4.5. Le déploiement réel à 5 000€/jour a confirmé une précision de 98% avec un ROI final de 4.48."
                metrics={[
                  { label: "ROI Réel", value: "4.48", status: 'emerald' },
                  { label: "Précision", value: "98%", status: 'emerald' }
                ]}
                side="right"
                mockup={<MercurySnippetDark />}
                caption="Mercury : Simulateur de profit haute fidélité."
             />
          </div>

          <div className="mt-40 md:mt-64 text-center bg-slate-900 rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-24 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
             <h4 className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mb-8 md:mb-12 relative z-10 leading-tight">
               DÉPLOYER VOTRE <br/>
               <span className="text-[#6366F1]">COMMAND CENTER.</span>
             </h4>
             <button 
                onClick={onLogin}
                className="w-full md:w-auto relative z-10 bg-white text-slate-900 px-8 md:px-16 py-6 md:py-8 rounded-2xl text-lg md:text-xl font-black uppercase italic tracking-widest hover:bg-[#6366F1] hover:text-white transition-all shadow-2xl active:scale-95"
              >
                ACCÉDER AU COCKPIT &rarr;
              </button>
          </div>
        </div>
      </section>

      {/* FOOTER - ARCHITECT EDITION */}
      <footer className="py-16 md:py-24 bg-white text-center border-t border-slate-100 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
           <Logo iconOnly className="opacity-20 scale-75 md:scale-90" />
           <p className="text-[#64748B] font-bold text-[9px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] max-w-xs md:max-w-none">
              © 2026 ADSPILOT PRO — ÉDITION ARCHITECTE.
           </p>
           <button onClick={onLogin} className="text-[10px] font-black uppercase tracking-widest text-[#6366F1] hover:text-[#1E293B] transition-colors italic">Command Center &rarr;</button>
        </div>
      </footer>
    </div>
  );
};

/* --- COMPOSANTS DE STRUCTURE --- */

const DossierItem = ({ badge, title, problem, solution, metrics, side, mockup, caption }: any) => (
  <div className={`flex flex-col ${side === 'left' ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 md:gap-32`}>
     <div className="lg:w-1/2 space-y-8 md:space-y-12 animate-fade-in w-full">
        <div className="space-y-4 md:space-y-6">
           <span className="inline-block px-4 py-1.5 bg-indigo-50 text-[#6366F1] rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 italic">
              {badge}
           </span>
           <h4 className="text-3xl md:text-5xl font-black italic text-[#1E293B] uppercase tracking-tighter leading-none">{title}</h4>
        </div>

        <div className="space-y-6 md:space-y-8">
           <div className="bg-slate-50 border border-slate-100 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative shadow-sm">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">LE PROBLÈME</p>
              <p className="text-slate-600 font-medium italic leading-relaxed text-base md:text-lg">"{problem}"</p>
           </div>
           <div className="bg-[#F5F3FF] border border-[#DDD6FE] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] relative shadow-sm">
              <p className="text-[8px] md:text-[9px] font-black text-[#6366F1] uppercase tracking-widest mb-3">LA SOLUTION STRATÉGIQUE</p>
              <p className="text-[#1E293B] font-bold italic leading-relaxed text-base md:text-lg">"{solution}"</p>
           </div>
        </div>

        <div className="flex gap-10 md:gap-16 pt-4 md:pt-6">
           {metrics.map((m: any, idx: number) => (
              <div key={idx} className="space-y-1">
                 <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{m.label}</p>
                 <p className={`text-3xl md:text-5xl font-black ${m.status === 'emerald' ? 'text-emerald-500' : 'text-[#6366F1]'} tracking-tighter italic leading-none`}>{m.value}</p>
              </div>
           ))}
        </div>
     </div>
     
     <div className="lg:w-1/2 w-full flex flex-col items-center">
        <div className="relative w-full py-6 md:py-10 flex justify-center">
           {mockup}
        </div>
        <p className="mt-6 md:mt-8 text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.4em] italic text-center px-4">
           {caption}
        </p>
     </div>
  </div>
);

const ModuleSummaryCard = ({ title, desc, icon, badge, mockup }: any) => (
  <div className="p-8 md:p-10 bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] space-y-6 hover:border-[#6366F1] hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
     <div className="absolute top-4 right-4"><span className="text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full">{badge}</span></div>
     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all">{icon}</div>
     <div className="flex-1">
        <h5 className="text-xl font-black italic uppercase tracking-tighter text-[#1E293B] mb-2">{title}</h5>
        <p className="text-slate-500 text-[13px] md:text-sm font-medium italic leading-relaxed mb-6">{desc}</p>
        {mockup && (
          <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity">
            {mockup}
          </div>
        )}
     </div>
  </div>
);

const SidebarPilotCard = () => (
  <div className="p-0.5 md:p-1 bg-gradient-to-br from-[#6366F1] to-indigo-900 rounded-[2rem] md:rounded-[2.5rem] shadow-xl">
    <div className="bg-[#1E293B] rounded-[1.9rem] md:rounded-[2.4rem] p-8 md:p-9 h-full flex flex-col justify-center text-white space-y-4">
        <h5 className="text-xl font-black italic uppercase tracking-tighter">PILOTAGE D'EMPIRE</h5>
        <p className="text-slate-400 text-[13px] md:text-sm font-medium italic leading-relaxed">Déployez l'infrastructure globale qui soutient le scaling massif du top 1% annonceurs.</p>
        <div className="pt-2">
           <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/30 px-3 py-1 rounded-full">Système Prêt</span>
        </div>
    </div>
  </div>
);

/* --- UI SNIPPETS (Dashboards) --- */

const AtlasSnippetCompact = () => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between items-center"><span className="text-[8px] font-black text-red-500">FUITE</span><span className="text-[10px] font-black text-red-500">-4 150 €</span></div>
    <div className="h-1 bg-red-100 rounded-full overflow-hidden"><div className="h-full w-2/3 bg-red-500"></div></div>
    <div className="flex justify-between items-center mt-1"><span className="text-[8px] font-black text-emerald-500">PROFIT NET</span><span className="text-[10px] font-black text-emerald-500">+12 850 €</span></div>
    <div className="h-1 bg-emerald-100 rounded-full overflow-hidden"><div className="h-full w-full bg-emerald-500"></div></div>
  </div>
);

const OracleSnippetCompact = () => (
  <div className="space-y-3">
    <div className="flex justify-between"><span className="text-[8px] font-black text-slate-400 uppercase">Hook Rate</span><span className="text-[8px] font-black text-amber-500 uppercase">Orange (4.2)</span></div>
    <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-[42%] bg-amber-500"></div></div>
    <div className="flex justify-between"><span className="text-[8px] font-black text-slate-400 uppercase">Desirability</span><span className="text-[8px] font-black text-emerald-500 uppercase">Vert (9.5)</span></div>
    <div className="h-1 bg-slate-200 rounded-full overflow-hidden"><div className="h-full w-[95%] bg-emerald-500"></div></div>
  </div>
);

const MercurySnippetCompact = () => (
  <div className="grid grid-cols-2 gap-2">
    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center"><p className="text-[7px] font-black text-slate-400 uppercase">ROI Prédit</p><p className="text-[12px] font-black text-indigo-600">4.50</p></div>
    <div className="bg-white p-3 rounded-lg border border-slate-200 text-center"><p className="text-[7px] font-black text-slate-400 uppercase">Précision</p><p className="text-[12px] font-black text-emerald-500">98%</p></div>
  </div>
);

const AndromedaSnippetCompact = () => (
  <div className="space-y-2">
    <div className="flex justify-between text-[7px] font-black uppercase text-slate-400"><span>Benchmark CPA</span><span>TOP 1%</span></div>
    <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center">
      <span className="text-[10px] font-black text-indigo-600">12,10 €</span>
      <span className="text-[7px] font-black text-indigo-400 italic">Target Acq.</span>
    </div>
  </div>
);

const AtlasSnippetDark = () => (
  <div className="w-full max-w-sm md:max-w-lg bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/5 p-8 md:p-12 space-y-8 md:space-y-10 transform hover:scale-[1.03] transition-transform duration-700">
     <div className="flex justify-between items-center border-b border-white/5 pb-6 md:pb-8">
        <div className="flex gap-2">
           <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
           <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-emerald-500"></div>
        </div>
        <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Atlas Engine v6.2</span>
     </div>
     <div className="space-y-6 md:space-y-8">
        <div className="p-6 md:p-8 bg-red-500/10 border border-red-500/20 rounded-2xl md:rounded-3xl flex justify-between items-center">
           <span className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest">Fuite Détectée</span>
           <span className="text-xl md:text-2xl font-black text-red-500">- 4 150 €</span>
        </div>
        <div className="flex justify-center opacity-30"><span className="text-white text-2xl">↓</span></div>
        <div className="p-6 md:p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl md:rounded-3xl flex justify-between items-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
           <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Profit Sécurisé</span>
           <span className="text-xl md:text-2xl font-black text-emerald-500">+ 12 850 €</span>
        </div>
     </div>
  </div>
);

const OracleSnippetDark = () => (
  <div className="w-full max-w-sm md:max-w-lg bg-[#080808] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/5 p-8 md:p-12 space-y-8 md:space-y-12 transform hover:-rotate-2 transition-transform duration-700">
     <div className="flex items-center gap-4 md:gap-5 border-b border-white/5 pb-6 md:pb-8">
        <div className="w-10 md:w-12 h-10 md:h-12 bg-indigo-600/20 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-2xl">👁️</div>
        <span className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">Oracle Vision AI</span>
     </div>
     <div className="space-y-8 md:space-y-10">
        <div className="space-y-3 md:space-y-4">
           <div className="flex justify-between text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>Hook Rate (3s)</span>
              <span className="text-amber-500">Alerte Orange</span>
           </div>
           <div className="h-2 md:h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[42%] bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]"></div>
           </div>
        </div>
        <div className="space-y-3 md:space-y-4">
           <div className="flex justify-between text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span>CTR Réel</span>
              <span className="text-emerald-500">Optimal — 3.20%</span>
           </div>
           <div className="h-2 md:h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[95%] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
           </div>
        </div>
     </div>
  </div>
);

const MercurySnippetDark = () => (
  <div className="w-full max-w-sm md:max-w-lg bg-slate-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/5 p-8 md:p-12 space-y-8 md:space-y-10 transform hover:rotate-2 transition-transform duration-700">
     <div className="flex justify-between items-center mb-6 md:mb-8">
        <span className="text-[10px] md:text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] md:tracking-[0.4em] italic">Mercury Simulator</span>
        <span className="px-3 md:px-4 py-1 bg-blue-500/20 rounded-full border border-blue-500/30 text-[8px] md:text-[9px] font-black text-blue-400 uppercase tracking-widest">Précision 98%</span>
     </div>
     <div className="grid grid-cols-2 gap-4 md:gap-6">
        <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-center space-y-2">
           <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">ROI Prédit</p>
           <p className="text-2xl md:text-4xl font-black text-white italic tracking-tighter">4.50</p>
        </div>
        <div className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl text-center space-y-2">
           <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest">ROI Réel</p>
           <p className="text-2xl md:text-4xl font-black text-emerald-500 italic tracking-tighter">4.48</p>
        </div>
     </div>
  </div>
);

const AndromedaSnippetDark = () => (
  <div className="w-full max-w-sm md:max-w-lg bg-[#0A0A0A] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] border border-white/5 p-8 md:p-12 space-y-6 md:space-y-8 transform hover:scale-[1.05] transition-transform duration-700">
     <div className="text-center pb-4 md:pb-6 border-b border-white/5">
        <h5 className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] md:tracking-[0.5em]">Radar Andromeda Benchmark</h5>
     </div>
     <div className="space-y-6 md:space-y-8">
        <div className="flex items-center justify-between px-2 md:px-4">
           <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest">CPA Actuel</span>
           <span className="text-xl md:text-2xl font-black text-white italic">25,40 €</span>
        </div>
        <div className="p-6 md:p-8 bg-indigo-600/10 border border-indigo-600/30 rounded-[2rem] md:rounded-[2.5rem] space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[9px] md:text-[10px] font-black text-indigo-300 uppercase italic">Leader Niche</span>
              <span className="text-2xl md:text-3xl font-black text-indigo-400 italic">12,10 €</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full w-[35%] bg-indigo-600 animate-shimmer"></div>
           </div>
           <p className="text-center text-[7px] md:text-[8px] font-black text-emerald-400 uppercase tracking-[0.3em]">Opportunité de Scale Immédiate</p>
        </div>
     </div>
  </div>
);
