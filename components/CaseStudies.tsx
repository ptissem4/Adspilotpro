
import React, { useState } from 'react';

interface StrategyPhase {
  title: string;
  description: string;
}

interface CaseStudy {
  id: string;
  sector: string;
  title: string;
  problem: string;
  metrics: {
    label: string;
    value: string;
    trend: 'up' | 'down';
    color: string;
  }[];
  chart: {
    label: string;
    before: number;
    after: number;
    unit: string;
  };
  phases: StrategyPhase[];
  resultSummary: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'signal',
    sector: 'E-commerce Mode',
    title: 'Le Diagnostic "Signal Invisible"',
    problem: 'Tracking cassé et perte de données Meta (EMQ 3.8)',
    metrics: [
      { label: 'Gain Profit Net', value: '+4 150€/m', trend: 'up', color: 'text-emerald-400' },
      { label: 'Baisse CPA', value: '-22%', trend: 'down', color: 'text-emerald-400' },
      { label: 'Précision Data', value: '95%', trend: 'up', color: 'text-indigo-400' }
    ],
    chart: { label: 'Score EMQ', before: 3.8, after: 8.9, unit: '/10' },
    phases: [
      { title: 'Nettoyage Technique', description: 'Suppression des doublons de pixels et installation de la CAPI server-side via GTM.' },
      { title: 'Restructuration Créative', description: 'Nouveaux angles d\'approche basés sur les données réelles et propres remontées.' },
      { title: 'Cockpit de Pilotage', description: 'Mise en place d\'un dashboard sur le profit net réel plutôt que le ROAS Meta.' }
    ],
    resultSummary: "En 30 jours, l'algorithme a cessé de viser à côté. Le profit récupéré dépasse largement le coût de l'intervention."
  },
  {
    id: 'ltv',
    sector: 'Cosmétique / Abonnement',
    title: 'Le Levier de la "Provision Future"',
    problem: 'Scaling impossible dû à une LTV trop faible (42€)',
    metrics: [
      { label: 'Hausse LTV', value: '+85%', trend: 'up', color: 'text-emerald-400' },
      { label: 'Rentabilité ROAS', value: 'x1.8', trend: 'up', color: 'text-emerald-400' },
      { label: 'Budget Scalé', value: 'x2.5', trend: 'up', color: 'text-indigo-400' }
    ],
    chart: { label: 'Valeur Client (LTV)', before: 42, after: 78, unit: '€' },
    phases: [
      { title: 'L\'Arsenal du Backend', description: 'Création d\'une séquence email de Welcome & Upsell automatique post-achat.' },
      { title: 'Offre de Recharge', description: 'Système de relance prédictif 5 jours avant l\'épuisement théorique du produit.' },
      { title: 'Optimisation de l\'AOV', description: 'Ajout d\'un Order Bump stratégique sur la page de paiement.' }
    ],
    resultSummary: "+12 000 € de profit net additionnel mensuel sans acquérir de nouveaux clients."
  }
];

export const CaseStudies: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => {
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  return (
    <section id="etudes-de-cas" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Grille de fond décorative */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4f46e5 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-indigo-400 font-black uppercase text-xs tracking-[0.4em]">Expertise Terrain</h2>
          <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none">
            Analyses de <span className="text-white underline decoration-indigo-500 decoration-8">Performance</span>
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium italic">
            Comment nous avons transformé des diagnostics AdsPilot Pro en victoires financières réelles.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {CASE_STUDIES.map((study) => (
            <div key={study.id} className="group relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[3rem] p-10 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="text-9xl font-black italic">{study.id === 'signal' ? '01' : '02'}</span>
              </div>
              
              <div className="mb-8 flex justify-between items-start">
                <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {study.sector}
                </span>
                {study.id === 'ltv' && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse">Scaling Expert</span>
                )}
              </div>

              <h4 className="text-2xl font-black mb-2 italic uppercase tracking-tighter">{study.title}</h4>
              <p className="text-slate-400 text-sm mb-10 font-medium">{study.problem}</p>

              {/* Graphique Avant/Après */}
              <div className="bg-slate-900/50 p-6 rounded-2xl mb-10 space-y-4 border border-slate-700/30">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{study.chart.label}</span>
                  <div className="flex gap-4">
                    <span className="text-xs text-red-400 font-black">Avant: {study.chart.before}{study.chart.unit}</span>
                    <span className="text-xs text-emerald-400 font-black">Après: {study.chart.after}{study.chart.unit}</span>
                  </div>
                </div>
                <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-red-500/30" style={{ width: `${(study.chart.before / study.chart.after) * 100}%` }}></div>
                  <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000 group-hover:w-full" style={{ width: `${(study.chart.after / study.chart.after) * 100}%` }}></div>
                </div>
              </div>

              {/* Métriques Clés */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                {study.metrics.map((m, i) => (
                  <div key={i} className="text-center">
                    <p className={`text-xl font-black ${m.color}`}>{m.value}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setSelectedCase(study)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all active:scale-95"
              >
                Voir la stratégie utilisée &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Détails Stratégie */}
      {selectedCase && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setSelectedCase(null)}
              className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <div className="p-12 md:p-16">
              <div className="mb-10">
                <span className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-2 block">Le Protocole Expert</span>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{selectedCase.title}</h3>
              </div>

              <div className="space-y-10 mb-12">
                {selectedCase.phases.map((phase, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-1">{phase.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed italic">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-indigo-600 rounded-3xl text-center shadow-2xl shadow-indigo-600/30">
                <p className="text-white font-black italic text-lg mb-6 leading-tight">"{selectedCase.resultSummary}"</p>
                <button 
                  onClick={() => { setSelectedCase(null); onCTAClick(); }}
                  className="bg-white text-slate-900 px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Obtenir le même diagnostic pour mon business
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
