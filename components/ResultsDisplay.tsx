
import React, { useState, useMemo } from 'react';
import { CalculationResults, CalculatorInputs } from '../types.ts';
import { ComparisonTable } from './ComparisonTable.tsx';
import { ProductAccelerators } from './ProductAccelerators.tsx';
import { TechnicalRecommendations } from './TechnicalRecommendations.tsx';
import { AndromedaDefinition } from './AndromedaDefinition.tsx';
import { AuthService } from '../services/storage.ts';

interface ResultsDisplayProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
  onShowGuide?: () => void;
}

const ExpertAvatar = ({ className = "w-10 h-10" }) => (
  <div className={`relative ${className} group shrink-0`}>
    <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm group-hover:bg-indigo-500/40 transition-all"></div>
    <div className="relative w-full h-full bg-slate-800 rounded-xl border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
        <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="currentColor" className="text-indigo-400" />
        <path d="M12 13C9.23858 13 7 15.2386 7 18V19H17V18C17 15.2386 14.7614 13 12 13Z" fill="currentColor" className="text-indigo-400" />
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500/30" />
      </svg>
    </div>
  </div>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, inputs, onShowGuide }) => {
  const [crBoost, setCrBoost] = useState(15);
  const [aovBoost, setAovBoost] = useState(10);
  const [ltvBoost, setLtvBoost] = useState(30);

  const currentUser = AuthService.getCurrentUser();
  // Fixed: UserProfile has full_name instead of firstName
  const userName = currentUser?.full_name?.split(' ')[0] || "Expert";

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const emq = parseFloat(inputs.emqScore || '7');
  const type = inputs.type || 'ANDROMEDA';

  const verdictConfig = useMemo(() => {
    const isDanger = results.cpaStatus === 'bad' || (results.calculatedLtv && results.calculatedLtv < parseFloat(inputs.currentCpa));
    return {
      color: isDanger ? 'text-red-500' : 'text-emerald-500',
      bg: isDanger ? 'bg-red-500/10' : 'bg-emerald-500/10',
      icon: isDanger ? '🚨' : '⚡'
    };
  }, [results, inputs]);

  return (
    <div className="relative font-sans text-slate-900 pb-20 overflow-x-hidden">
      <div className="space-y-12 md:space-y-16 max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 relative flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full flex flex-col items-center justify-center space-y-8 pt-4">
          <div className="w-full max-w-2xl animate-fade-in">
             <div className="bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden group">
                <div className="bg-indigo-950/50 backdrop-blur-xl rounded-[2.4rem] p-8 md:p-10 relative">
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                         <ExpertAvatar className="w-10 h-10" />
                         <div>
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Architecte Expert</h4>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Alexia Kebir</p>
                         </div>
                      </div>
                      <p className={`text-lg md:text-xl font-medium italic leading-relaxed ${verdictConfig.color}`}>
                        "{inputs.name?.split(' - ')[0]} : {inputs.projectName || 'Analyse en cours'}"
                      </p>
                      <p className="text-white text-base mt-4 leading-relaxed font-medium italic">
                         "{results.andromedaOptimized ? "Signal Andromeda validé." : results.calculatedLtv ? `LTV estimée à ${formatCurrency(results.calculatedLtv)}.` : "Diagnostic stratégique complété."}"
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* MAIN VERDICT CARD */}
          <div className={`w-full max-w-2xl p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center text-center space-y-4 ${verdictConfig.bg}`}>
             <div className="text-5xl">{verdictConfig.icon}</div>
             <h3 className={`text-2xl font-black uppercase italic ${verdictConfig.color}`}>
                {results.calculatedLtv && results.calculatedLtv < parseFloat(inputs.currentCpa) ? "SIGNAL CRITIQUE" : 
                 type === 'MERCURY' && parseFloat(inputs.atcRate || '0') < 3 ? "ENTONNOIR PERCÉ" : "OPPORTUNITÉ DÉTECTÉE"}
             </h3>
             <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.3em]">Verdict Stratégique</p>
          </div>
        </section>

        {/* MODULE SPECIFIC CONTENT */}
        <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
           {type === 'ORACLE' && (
              <>
                 <StatCard label="LTV Calculée" value={formatCurrency(results.calculatedLtv || 0)} />
                 <StatCard label="CPA Actuel" value={formatCurrency(parseFloat(inputs.currentCpa || '0'))} />
                 <StatCard label="Taux Rachat" value={`${inputs.retentionRate}%`} />
              </>
           )}
           {type === 'MERCURY' && (
              <>
                 <StatCard label="Conversion Est." value={`${(parseFloat(inputs.atcRate || '0') * 0.3).toFixed(2)}%`} />
                 <StatCard label="Abandon Panier" value={`${inputs.abandonmentRate}%`} />
                 <StatCard label="Temps de Charge" value={`${inputs.loadTime}s`} />
              </>
           )}
           {type === 'ATLAS' && (
              <>
                 <StatCard label="Jours de Stock" value={`${results.daysToStockout || 0}j`} />
                 <StatCard label="Capacité Scale" value={`${(results.scalingSolidarity || 0)}/10`} />
                 <StatCard label="Budget Max/j" value={formatCurrency(parseFloat(inputs.targetVolume || '0') * (parseFloat(inputs.currentCpa || '0')) / 30)} />
              </>
           )}
           {type === 'ANDROMEDA' && (
              <>
                 <StatCard label="ROAS Point Mort" value={`${results.roasThreshold.toFixed(2)}x`} />
                 <StatCard label="CPA Max (Front)" value={formatCurrency(results.maxCpa)} />
                 <StatCard label="Provision LTV" value={formatCurrency(results.provisionParClient)} />
              </>
           )}
        </section>

        <section className="w-full"><TechnicalRecommendations results={results} inputs={inputs} /></section>
        <section className="w-full"><ProductAccelerators emqScore={emq} ltv={results.calculatedLtv || parseFloat(inputs.ltv)} currentRoas={parseFloat(inputs.currentRoas || '0')} targetRoas={parseFloat(inputs.targetRoas || '0')} tresorerieLatenteMonthly={results.tresorerieLatenteHebdo * 4.34} /></section>
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm text-center space-y-2">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
     <p className="text-3xl font-black text-slate-900 tabular-nums">{value}</p>
  </div>
);