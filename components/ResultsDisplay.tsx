
import React, { useState, useMemo } from 'react';
import { CalculationResults, CalculatorInputs } from '../types';
import { ComparisonTable } from './ComparisonTable';
import { ProductAccelerators } from './ProductAccelerators';
import { TechnicalRecommendations } from './TechnicalRecommendations';
import { AndromedaDefinition } from './AndromedaDefinition';
import { AuthService } from '../services/storage';

interface ResultsDisplayProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
  onShowGuide?: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, inputs, onShowGuide }) => {
  const [crBoost, setCrBoost] = useState(15);
  const [aovBoost, setAovBoost] = useState(10);
  const [ltvBoost, setLtvBoost] = useState(30);

  const currentUser = AuthService.getCurrentUser();
  const userName = currentUser?.firstName || "Expert";

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const emq = parseFloat(inputs.emqScore) || 0;
  const formats = inputs.creativeFormats || [];
  const ltvValue = parseFloat(inputs.ltv) || 0;
  const pmv = parseFloat(inputs.pmv) || 1;
  const latentMonthly = results.tresorerieLatenteHebdo * 4.34;
  const realMaxCpa = results.realMaxCpa;
  const currentCpa = parseFloat(inputs.currentCpa) || 0;

  // DÉTERMINATION DES STATUTS CRITIQUES
  const isSignalRed = emq < 6;
  const isMargeARisque = latentMonthly > 500 || (ltvValue / pmv) < 1.3;
  const isScalingToxique = currentCpa > realMaxCpa;
  
  const redCount = [isSignalRed, isMargeARisque, isScalingToxique].filter(Boolean).length;
  const showEmergencyBlock = redCount >= 2;

  // --- LOGIQUE DE L'AVIS STRATÉGIQUE (BULLE HERO) ---
  const dynamicExpertAdvice = useMemo(() => {
    const name = userName;
    const variantIndex = Math.floor(emq * 10) % 2; 
    
    if (isSignalRed) {
      const variants = [
        `${name}, vous naviguez dans le brouillard. Sans un signal propre, Meta dépense votre budget au hasard. Avant de toucher au budget, vous devez impérativement stabiliser votre tracking CAPI. (Consultez le Guide SOS Signal)`,
        `Alerte rouge, ${name}. Votre Pixel ne voit que la moitié de vos ventes. Le scaling est actuellement suicidaire. C'est un cas d'urgence, je vous conseille de réserver l'appel de 15 min ci-dessous immédiatement.`
      ];
      return variants[variantIndex];
    }

    if (isScalingToxique) {
        const variants = [
            `${name}, plus vous vendez, plus vous perdez. Il faut stopper les d'penses et revoir l'offre immédiatement. Suivez le Guide Scale & Sniper pour redresser la barre.`,
            `Votre CPA actuel dévore votre marge brute, ${name}. Ce n'est pas du scaling, c'est une fuite de cash. Il est vital de réajuster votre structure Broad.`
        ];
        return variants[variantIndex];
    }

    if (isMargeARisque) {
      const variants = [
        `${name}, vos publicités fonctionnent, mais votre business ne retient pas l'argent. Vous remplissez un seau percé. Le Guide LTV Maximal est votre priorité pour boucher les fuites de profit.`,
        `Félicitations pour vos ventes, ${name}, mais attention : sans stratégie de rétention, vous travaillez uniquement pour enrichir Mark Zuckerberg. Activez votre backend dès maintenant.`
      ];
      return variants[variantIndex];
    }

    const isCreativeRobust = formats.length >= 2;
    if (emq >= 8 && isCreativeRobust) {
      return `${name}, tous les voyants sont au vert. Votre infrastructure est prête pour un scaling agressif. C'est le moment d'augmenter le budget de 20% par palier de 48h. (Suivez la méthode Scale & Sniper)`;
    }

    if (emq >= 6 && formats.length < 2) {
        return `${name}, vos fondations techniques sont saines, mais votre mix créatif bride l'IA Andromeda. Ajoutez au moins 2 nouveaux formats (UGC/Reels) pour débloquer votre plein potentiel.`;
    }

    return `${name}, votre structure est stable. Continuez à surveiller votre EMQ et optimisez vos créas pour passer à l'étape supérieure.`;
  }, [userName, emq, formats, isMargeARisque, isScalingToxique, isSignalRed]);

  // LOGIQUE DE VERDICT INDIVIDUELLE (SIGNAUX VISUELS)
  const signalStatus = useMemo(() => {
    if (emq < 6) return { label: 'CRITIQUE', color: 'text-red-500', bg: 'bg-red-500', icon: '🚨' };
    if (emq < 8) return { label: 'INSTABLE', color: 'text-amber-500', bg: 'bg-amber-500', icon: '⚠️' };
    return { label: 'OPTIMISÉ', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: '⚡' };
  }, [emq]);

  const creativeStatus = useMemo(() => {
    if (formats.length < 2) return { label: 'FAIBLE', color: 'text-amber-500', bg: 'bg-amber-500', icon: '🎨' };
    return { label: 'ROBUSTE', color: 'text-emerald-500', bg: 'bg-emerald-500', icon: '🚀' };
  }, [formats]);

  const potentialGains = useMemo(() => {
    const baseVentesHebdo = results.ventesActuellesHebdo || 0;
    const baseAov = parseFloat(inputs.pmv) || 1;
    const baseLtv = ltvValue;
    const newVentesHebdo = baseVentesHebdo * (1 + crBoost / 100);
    const newAov = baseAov + aovBoost;
    const ltvMultiplier = baseLtv / baseAov;
    const newLtv = (newAov * ltvMultiplier) * (1 + ltvBoost / 100);
    const currentMonthlyRevenue = baseVentesHebdo * baseLtv * 4.34;
    const projectedMonthlyRevenue = newVentesHebdo * newLtv * 4.34;
    return projectedMonthlyRevenue - currentMonthlyRevenue;
  }, [crBoost, aovBoost, ltvBoost, results, inputs.pmv, ltvValue]);

  const scrollToSimulator = () => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="relative font-sans text-slate-900 pb-20">
      <div className="space-y-16 max-w-4xl mx-auto px-6 py-8 relative flex flex-col items-center">
        
        {/* SECTION HERO */}
        <section id="hero" className="w-full scroll-mt-24 flex flex-col items-center justify-center min-h-[60vh] space-y-10">
          
          {/* BULLE EXPERT DYNAMIQUE & RÉACTIVE */}
          <div className="w-full max-w-2xl animate-fade-in">
             <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group">
                <div className="bg-indigo-950/50 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-10 relative">
                   <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none group-hover:rotate-12 transition-transform duration-700">📝</div>
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-xl">🤵</span>
                         </div>
                         <div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] leading-none mb-1">Expert AdsPilot Pro</h4>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Avis Stratégique Andromeda</p>
                         </div>
                      </div>
                      <p className="text-sm md:text-lg text-white font-medium italic leading-relaxed md:px-2">
                        "{dynamicExpertAdvice}"
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* TABLEAU DE BORD ANDROMEDA */}
          <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* STATUT PIXEL */}
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center">
                   <div className={`w-14 h-14 rounded-2xl ${signalStatus.bg} flex items-center justify-center text-white text-2xl shadow-xl mb-3`}>
                      {signalStatus.icon}
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">État du Signal (Pixel)</p>
                </div>
                <div>
                   <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${signalStatus.color}`}>{signalStatus.label}</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic">Score EMQ: {emq}/10</p>
                </div>
             </div>

             {/* STATUT CRÉATIF */}
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4">
                <div className="flex flex-col items-center">
                   <div className={`w-14 h-14 rounded-2xl ${creativeStatus.bg} flex items-center justify-center text-white text-2xl shadow-xl mb-3`}>
                      {creativeStatus.icon}
                   </div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Mix Créatif (Andromeda)</p>
                </div>
                <div>
                   <h3 className={`text-2xl font-black italic tracking-tighter uppercase ${creativeStatus.color}`}>{creativeStatus.label}</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 italic">{formats.length} formats actifs</p>
                </div>
             </div>
          </div>

          <button onClick={scrollToSimulator} className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-indigo-600 transition-all flex flex-col items-center gap-2 group">
              <span>Décortiquer l'Analyse</span>
              <span className="animate-bounce group-hover:translate-y-1 transition-transform">↓</span>
          </button>
        </section>

        {/* DÉFINITION RÉACTIVE */}
        <section id="definition" className="w-full scroll-mt-24">
           <AndromedaDefinition emq={emq} />
        </section>

        {/* RECOMMANDATIONS TECHNIQUES + BLOC D'URGENCE */}
        <section id="tech" className="w-full scroll-mt-24 space-y-12">
           <TechnicalRecommendations results={results} inputs={inputs} />
           
           {/* BLOC D'URGENCE CONDITIONNEL PLACÉ APRÈS LES CONSEILS D'EXPERT */}
           {showEmergencyBlock && (
              <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-red-500/20 shadow-2xl animate-fade-in relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                 <div className="text-center md:text-left space-y-3 relative z-10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                       <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                       <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Submergé par ces résultats ?</h3>
                    </div>
                    <p className="text-slate-400 text-sm md:text-base font-medium italic max-w-xl leading-relaxed">
                       Ne restez pas seul face à un diagnostic critique. Réservez un appel de 15 min pour prioriser vos actions avec un expert et arrêter l'hémorragie budgétaire.
                    </p>
                 </div>
                 <button 
                   onClick={() => window.location.href='mailto:shopiflight@gmail.com?subject=APPEL URGENCE ADS - Diagnostic Critique'}
                   className="shrink-0 relative z-10 bg-red-600 text-white px-8 py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all shadow-xl shadow-red-600/20 active:scale-95 whitespace-nowrap"
                 >
                   Réserver mon Appel d'Urgence &rarr;
                 </button>
              </div>
           )}
        </section>

        {/* SIMULATEUR DE CROISSANCE */}
        <section id="simulator" className="w-full scroll-mt-24 space-y-10 py-6">
            <div className="text-center space-y-2">
                <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tighter uppercase italic leading-none">
                    Simulateur de <span className="text-purple-600">Croissance</span>
                </h3>
                <p className="text-slate-500 font-medium italic text-base max-w-xl mx-auto">Impact direct sur votre CA mensuel en optimisant vos leviers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-md space-y-8 flex flex-col justify-center">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conversion</label>
                          <span className="text-xs font-black text-purple-600">+{crBoost}%</span>
                        </div>
                        <input type="range" min="5" max="50" step="1" value={crBoost} onChange={(e) => setCrBoost(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Panier Moyen (AOV)</label>
                          <span className="text-xs font-black text-emerald-600">+{aovBoost}€</span>
                        </div>
                        <input type="range" min="5" max="50" step="5" value={aovBoost} onChange={(e) => setAovBoost(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rétention (LTV)</label>
                          <span className="text-xs font-black text-amber-600">+{ltvBoost}%</span>
                        </div>
                        <input type="range" min="10" max="100" step="5" value={ltvBoost} onChange={(e) => setLtvBoost(parseInt(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 md:p-10 rounded-[2.5rem] text-center text-white shadow-xl flex flex-col justify-center">
                    <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.4em]">Gain Mensuel Potentiel</p>
                    <h4 className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums">{formatCurrency(potentialGains)}</h4>
                    
                    <div className="mt-6 flex flex-col gap-3">
                      <p className="text-[10px] text-indigo-200 font-medium italic px-4 leading-relaxed">
                        Ajustez vos metrics dans le panneau de gauche pour voir l'impact immédiat sur votre profitabilité réelle.
                      </p>
                    </div>
                </div>
            </div>
        </section>

        {/* TABLEAU COMPARATIF */}
        <section id="scaling" className="w-full scroll-mt-24">
           <ComparisonTable results={results} inputs={inputs} />
        </section>

        {/* ACCELERATEURS PRODUITS */}
        <section id="action" className="w-full scroll-mt-24">
           <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-indigo-50 shadow-lg text-center space-y-8">
              <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tighter uppercase italic leading-none">Feuille de Route <span className="text-indigo-600">Stratégique</span></h3>
              <ProductAccelerators emqScore={emq} ltv={ltvValue} currentRoas={parseFloat(inputs.currentRoas) || 0} targetRoas={parseFloat(inputs.targetRoas) || 0} tresorerieLatenteMonthly={results.tresorerieLatenteHebdo * 4.34} />
           </div>
        </section>

        {/* SECTION CONSULTING CTA (FINALE) */}
        <section id="consulting" className="w-full scroll-mt-24">
           <div className="bg-slate-900 rounded-[3.5rem] p-12 md:p-20 text-white text-center space-y-10 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 space-y-6">
                <div className="inline-block px-5 py-2 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-4">Accompagnement Sur-Mesure</div>
                <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
                  Prêt à Scaler <br/>
                  <span className="text-indigo-400">Pour de Vrai ?</span>
                </h3>
                <p className="text-slate-400 text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
                  "L'audit identifie vos failles. Mon consulting les répare."
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6">
                <button 
                  onClick={() => window.location.href='mailto:shopiflight@gmail.com'}
                  className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-2xl"
                >
                  Réserver mon Appel de Scaling &rarr;
                </button>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};
