import React, { useState } from 'react';
import { Logo } from './Logo';

interface MasterclassLandingProps {
  onBack: () => void;
  onJoin: () => void;
}

export const MasterclassLanding: React.FC<MasterclassLandingProps> = ({ onBack, onJoin }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const modules = [
    { num: '01', title: 'Signal Pur', desc: 'Sécurise ton setup technique (Pixel/CAPI) pour éviter le sabotage de Meta.' },
    { num: '02', title: 'Radar à Profit', desc: 'Démasque les metrics menteuses et identifie tes vrais leviers de rentabilité.' },
    { num: '03', title: 'Architecture Créative', desc: "Laisse l'IA disséquer tes visuels pour créer des publicités qui vendent." },
    { num: '04', title: 'Protocol Scroll-Stopper', desc: 'La science des 3 premières secondes pour capturer l\'attention.' },
    { num: '05', title: 'Exploration d\'Audience', desc: 'Domine le Broad et laisse l\'algorithme travailler pour toi.' },
    { num: '06', title: 'Injection de Budget', desc: 'Les règles mathématiques pour augmenter ton budget sans casser ton CPA.' },
    { num: '07', title: 'L\'Algorithme Andromeda', desc: 'Le fonctionnement secret de l\'IA de Meta enfin révélé.' },
    { num: '08', title: 'Audit de Vol', desc: 'Savoir lire les metrics et couper les branches mortes impitoyablement.' },
    { num: '09', title: 'Scaling Vertical', desc: 'Doubler, tripler les budgets sur les campagnes gagnantes.' },
    { num: '10', title: 'Scaling Horizontal', desc: 'Duplication et diversification pour saturer ton marché.' },
    { num: '11', title: 'Blindage Anti-Ban', desc: 'Protéger ton compte publicitaire contre les blocages injustifiés.' },
    { num: '12', title: 'Commandement Suprême', desc: 'Délégation, automatisation et vision long terme de l\'empire.' },
  ];

  const handlePurchaseClick = () => {
    setIsProcessing(true);
    // Lien Stripe direct fourni par l'utilisateur
    const stripeLink = 'https://buy.stripe.com/9B63cwa15fPF8SS2KX3oA00';
    window.location.href = stripeLink;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A202C] font-sans selection:bg-indigo-100 overflow-x-hidden">
      
      {/* HEADER MINIMALISTE */}
      <nav className="fixed top-0 left-0 w-full h-20 z-[100] px-6 md:px-12 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-slate-200">
        <Logo onClick={onBack} className="cursor-pointer scale-90" />
        <button 
          onClick={onBack}
          className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors"
        >
          ← Retour au Dashboard
        </button>
      </nav>

      {/* HERO SECTION - LIGHT PREMIUM */}
      <section className="pt-32 md:pt-48 pb-20 px-4 relative flex flex-col items-center text-center">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-indigo-500/5 blur-[120px] rounded-full -z-0"></div>
         
         <div className="max-w-4xl mx-auto relative z-10 space-y-10">
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4 border border-indigo-100">
              Édition Limitée : Escouade Andromeda
            </span>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-[#1A202C] uppercase leading-[0.9] italic">
              Dompte l'IA. Scale ton Empire. <br/>
              <span className="text-indigo-600">Pilote à la Marge Nette.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium italic">
               95% des dashboards Meta mentent. Apprends la seule méthode pour transformer tes données en profit réel et sortir du brouillard du ROAS.
            </p>

            {/* VSL CONTAINER */}
            <div className="w-full aspect-video bg-slate-900 rounded-[2.5rem] border-8 border-white shadow-2xl overflow-hidden relative group">
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer">
                  <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                     <span className="text-white text-2xl ml-1">▶</span>
                  </div>
               </div>
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                  Regarder le protocole de vol (12:00)
               </div>
            </div>

            {/* PUCES PROMESSES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left max-w-5xl mx-auto">
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <span className="text-emerald-500 text-xl">✅</span>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-tight text-slate-900">Zéro Perte de Données</h5>
                    <p className="text-[11px] text-slate-500 italic mt-1 leading-relaxed">Setup Pixel/CAPI blindé pour que l'algorithme apprenne 2x plus vite.</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <span className="text-indigo-500 text-xl">📈</span>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-tight text-slate-900">Scaling Sécurisé</h5>
                    <p className="text-[11px] text-slate-500 italic mt-1 leading-relaxed">La méthode mathématique pour scaler sans faire exploser ton CPA.</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                  <span className="text-indigo-500 text-xl">🤖</span>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-tight text-slate-900">Audit IA Illimité</h5>
                    <p className="text-[11px] text-slate-500 italic mt-1 leading-relaxed">L'accès à ton cockpit pour analyser chaque créa avec la puissance d'Andromeda.</p>
                  </div>
               </div>
            </div>

            <div className="pt-10">
                <button 
                  onClick={handlePurchaseClick}
                  disabled={isProcessing}
                  className={`bg-indigo-600 text-white px-10 md:px-16 py-6 md:py-8 rounded-2xl text-lg md:text-xl font-black uppercase italic tracking-widest shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:bg-slate-900 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto ${isProcessing ? 'opacity-80 cursor-wait' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      CHARGEMENT...
                    </>
                  ) : (
                    "JE REJOINS L'ESCOUADE ANDROMEDA →"
                  )}
                </button>
                <p className="mt-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                   Accès immédiat aux 12 modules + Cockpit AdsPilot Pro
                </p>
            </div>
         </div>
      </section>

      {/* SECTION LA PROMESSE */}
      <section className="py-24 bg-white border-y border-slate-100">
         <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-[#1A202C]">
              Ce n'est pas une formation, <br/> c'est ton <span className="text-indigo-600">nouveau protocole de vol.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
              De la check-list pré-décollage au scaling agressif de tes créas, accède à 12 missions intensives pour maîtriser l'algorithme qui génère des millions. 
              Chaque module est une brique de ton infrastructure de croissance.
            </p>
         </div>
      </section>

      {/* GRID DU PROGRAMME - L'ARSENAL COMPLET */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
               <h2 className="text-indigo-600 font-black uppercase text-xs tracking-[0.5em]">Le Programme</h2>
               <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-[#1A202C]">L'Arsenal <span className="text-slate-400">Complet.</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {modules.map((m, idx) => (
                 <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 hover:border-indigo-200 transition-all group">
                    <div className="text-4xl font-black italic text-slate-100 group-hover:text-indigo-50 transition-colors">{m.num}</div>
                    <h4 className="text-xl font-black uppercase italic tracking-tight text-[#1A202C]">{m.title}</h4>
                    <p className="text-slate-500 text-sm font-medium italic leading-relaxed">"{m.desc}"</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* APPEL À L'ACTION FINAL */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
         <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
            <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
               Prêt pour le <br/> <span className="text-indigo-400">décollage ?</span>
            </h3>
            <div className="space-y-6">
                <button 
                  onClick={handlePurchaseClick}
                  disabled={isProcessing}
                  className={`bg-white text-slate-900 px-12 md:px-20 py-6 md:py-8 rounded-2xl text-xl md:text-2xl font-black uppercase italic tracking-widest shadow-2xl hover:bg-indigo-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-4 mx-auto ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isProcessing ? "CHARGEMENT..." : "JE REJOINS L'ESCOUADE ANDROMEDA"}
                </button>
                <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.3em]">
                  Accès immédiat à vie • Support QG Inclus • 12 Missions Experts
                </p>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 text-center bg-white border-t border-slate-100">
          <Logo iconOnly className="mx-auto mb-8 opacity-10 scale-125 grayscale" />
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.5em]">
            © 2026 ADSPILOT PRO — SYSTÈME D'EXPLOITATION ANDROMEDA.
          </p>
      </footer>
    </div>
  );
};