
import React, { useState, useMemo } from 'react';
import { CalculatorInputs, CalculationResults } from '../types';

interface ExplainerCardProps {
  icon: React.ReactNode;
  title: string;
  what: string;
  why: string;
  advice: string;
  onAction: () => void;
  color: string;
}

const ExplainerCard: React.FC<ExplainerCardProps> = ({ icon, title, what, why, advice, onAction, color }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group">
    <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-3xl mb-8 shadow-inner group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">{title}</h3>
    
    <div className="space-y-6 flex-1">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">C'est quoi ?</p>
        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{what}"</p>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pourquoi c'est vital ?</p>
        <p className="text-sm text-slate-600 font-medium leading-relaxed">"{why}"</p>
      </div>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Le conseil de l'Expert</p>
        <p className="text-xs font-bold text-slate-900 leading-relaxed italic">{advice}</p>
      </div>
    </div>

    <button 
      onClick={onAction}
      className="mt-10 w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
    >
      Réparer cette métrique &rarr;
    </button>
  </div>
);

interface AuditExplainerProps {
  onBack?: () => void;
  inputs?: CalculatorInputs;
  results?: CalculationResults;
}

export const AuditExplainer: React.FC<AuditExplainerProps> = ({ onBack, inputs, results }) => {
  // Simulator State
  const [crBoost, setCrBoost] = useState(15);
  const [aovBoost, setAovBoost] = useState(10);
  const [ltvBoost, setLtvBoost] = useState(30);

  const handleAction = () => {
    window.location.href = 'mailto:shopiflight@gmail.com?subject=Planification Stratégie Croissance ROI';
  };

  // Default values if no audit is provided (for demo/onboarding)
  const baseVentesHebdo = results?.ventesActuellesHebdo || 25;
  const baseAov = parseFloat(inputs?.pmv || '75');
  const baseLtv = parseFloat(inputs?.ltv || '120');

  const potentialGains = useMemo(() => {
    const newVentesHebdo = baseVentesHebdo * (1 + crBoost / 100);
    const newAov = baseAov + aovBoost;
    const ltvMultiplier = baseLtv / baseAov;
    const newLtv = (newAov * ltvMultiplier) * (1 + ltvBoost / 100);

    const currentMonthlyRevenue = baseVentesHebdo * baseLtv * 4.34;
    const projectedMonthlyRevenue = newVentesHebdo * newLtv * 4.34;
    
    return projectedMonthlyRevenue - currentMonthlyRevenue;
  }, [crBoost, aovBoost, ltvBoost, baseVentesHebdo, baseAov, baseLtv]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  return (
    <div className="max-w-6xl mx-auto pt-12 pb-32 px-6 animate-fade-in space-y-24">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          {onBack && (
            <button onClick={onBack} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
              &larr; Retour au rapport
            </button>
          )}
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Comprendre <span className="text-indigo-600">vos Chiffres</span>
          </h2>
          <p className="text-slate-500 font-medium italic text-lg max-w-2xl">
            L'audit ne ment jamais. Voici comment interpréter les 3 piliers de votre rentabilité Meta.
          </p>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ExplainerCard 
          color="bg-purple-50 text-purple-600"
          icon="📡"
          title="Signal Meta (EMQ)"
          what="C'est la qualité de la donnée que votre Pixel renvoie à Facebook. Plus le score est haut, plus Meta 'voit' vos acheteurs."
          why="Sans un signal propre (EMQ > 8), Meta tire à l'aveugle. Vous payez pour des impressions inutiles car l'algorithme ne sait pas qui cibler."
          advice="Passez impérativement à la CAPI Server-side. Le tracking navigateur classique est mort."
          onAction={handleAction}
        />
        <ExplainerCard 
          color="bg-emerald-50 text-emerald-600"
          icon="💎"
          title="Valeur Vie (LTV)"
          what="La LTV représente tout ce qu'un client vous rapporte en 12 mois, pas seulement sur sa première commande."
          why="C'est votre vrai budget d'acquisition. Si votre LTV est haute, vous pouvez payer plus cher que vos concurrents pour acquérir un client."
          advice="Ne vous contentez pas de vendre une fois. Automatisez vos séquences email pour faire racheter vos clients."
          onAction={handleAction}
        />
        <ExplainerCard 
          color="bg-amber-50 text-amber-600"
          icon="💰"
          title="Trésorerie Latente"
          what="C'est l'argent qui 'dort' dans votre structure publicitaire à cause d'un CPA trop haut ou d'un budget trop bas."
          why="Chaque jour sans scaling ou avec un mauvais signal est une perte sèche que vous ne récupérerez jamais."
          advice="Suivez le 'CPA Max Réel' calculé par cet audit. C'est votre boussole pour savoir quand couper ou scaler."
          onAction={handleAction}
        />
      </div>

      {/* GROWTH SIMULATOR */}
      <section className="relative space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic">
            Simulateur de <span className="text-purple-600">Croissance ROI</span>
          </h3>
          <p className="text-slate-500 font-medium italic max-w-2xl mx-auto">
            Et si on optimisait chaque étape de votre tunnel ? Glissez les curseurs pour voir l'impact sur votre profit net mensuel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* SLIDERS */}
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10">
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-xs">📈</span>
                    Taux de Conversion
                  </label>
                  <span className="text-sm font-black text-purple-600">+{crBoost}%</span>
                </div>
                <input 
                  type="range" min="5" max="50" step="1" value={crBoost} 
                  onChange={(e) => setCrBoost(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-xs">🛍️</span>
                    Panier Moyen (AOV)
                  </label>
                  <span className="text-sm font-black text-emerald-600">+{aovBoost}€</span>
                </div>
                <input 
                  type="range" min="5" max="50" step="5" value={aovBoost} 
                  onChange={(e) => setAovBoost(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
             </div>

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-xs">💎</span>
                    Rétention (LTV)
                  </label>
                  <span className="text-sm font-black text-amber-600">+{ltvBoost}%</span>
                </div>
                <input 
                  type="range" min="10" max="100" step="5" value={ltvBoost} 
                  onChange={(e) => setLtvBoost(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
             </div>
          </div>

          {/* DYNAMIC RESULT */}
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-12 md:p-16 rounded-[4rem] text-center text-white shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-1000"></div>
              
              <div className="relative z-10 space-y-6">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em]">Profit Net Supplémentaire Potentiel</p>
                <div className="relative inline-block">
                  <h4 className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-200">
                    {formatCurrency(potentialGains)}
                    <span className="text-2xl font-black text-indigo-400 block mt-2 tracking-widest uppercase">/ MOIS</span>
                  </h4>
                </div>
                
                <div className="pt-6 border-t border-white/10 max-w-sm mx-auto">
                  <p className="text-xs md:text-sm font-medium italic text-indigo-200 leading-relaxed">
                    "Ce montant représente votre gain manqué actuel. Mon accompagnement vise à transformer ce potentiel en trésorerie réelle."
                  </p>
                </div>

                <button 
                  onClick={handleAction}
                  className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95 mt-4"
                >
                  Planifier ma stratégie de croissance &rarr;
                </button>
              </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-20 text-white text-center space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none relative z-10">
          Besoin d'un <span className="text-indigo-400">Plan d'Attaque ?</span>
        </h3>
        <p className="text-slate-400 text-lg font-medium italic max-w-2xl mx-auto relative z-10">
          Comprendre est la première étape. L'exécution est celle qui remplit votre compte en banque.
        </p>
        <button 
          onClick={handleAction}
          className="relative z-10 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl active:scale-95"
        >
          Réserver mon Appel de Scaling &rarr;
        </button>
      </div>
    </div>
  );
};
