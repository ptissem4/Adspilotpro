
import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types';
import { Logo } from './Logo';
import { ComparisonTable } from './ComparisonTable';

interface PrintableReportProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
  verdict: any;
  advice: any;
  synthesis: any;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ 
  results, 
  inputs, 
  verdict, 
}) => {
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);
    
  const ltv = parseFloat(inputs.ltv) || 0;
  const emq = parseFloat(inputs.emqScore) || 0;
  
  const vActuelles = results?.ventesActuellesHebdo ?? 0;
  const vManquantes = results?.ventesManquantes ?? 0;
  const tCpa = results?.targetCpa ?? 0;
  const mInitiale = results?.margeInitiale ?? 0;
  const tLatente = results?.tresorerieLatenteHebdo ?? 0;
  const rMaxCpa = results?.realMaxCpa ?? 0;
  const mCpa = results?.maxCpa ?? 1;

  const ltvPower = Math.round(((rMaxCpa - mCpa) / mCpa) * 100);

  return (
    <div className="bg-white text-slate-900 leading-normal font-sans">
      
      {/* PAGE 1: COUVERTURE PREMIUM */}
      <div className="page-break p-20 bg-slate-900 text-white flex flex-col justify-between">
          <div>
              <Logo className="invert brightness-0 mb-32 scale-150 origin-left" />
              <div className="h-1.5 w-32 bg-indigo-500 mb-12"></div>
              <h1 className="text-8xl font-black leading-[0.9] mb-10 tracking-tighter italic uppercase">
                  Audit <br/>
                  <span className="text-indigo-400">Chirurgical</span> <br/>
                  Meta Ads.
              </h1>
              <div className={`inline-block px-10 py-5 rounded-[2rem] ${verdict.bg} text-white text-3xl font-black italic shadow-2xl mt-10`}>
                  {verdict.icon} {verdict.title}
              </div>
          </div>
          <div className="border-t border-white/10 pt-16 flex justify-between items-end">
              <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-4">Préparé pour</p>
                  <p className="text-3xl font-black uppercase italic tracking-widest">{inputs.projectName || inputs.niche}</p>
              </div>
              <div className="text-right">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] mb-4">Généré le</p>
                  <p className="text-3xl font-black">{new Date().toLocaleDateString('fr-FR')}</p>
              </div>
          </div>
      </div>

      {/* PAGE 2: ANALYSE FINANCIÈRE */}
      <div className="page-break p-20 bg-white">
          <header className="border-b-4 border-slate-900 pb-10 mb-16 flex justify-between items-end">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">01. Diagnostic de Rentabilité</h2>
              <span className="text-slate-300 font-black text-sm tracking-widest">PAGE 02</span>
          </header>

          <div className="space-y-12">
              <h3 className="text-xl font-black uppercase tracking-widest italic">📊 Comparatif Performance : Réel vs Potentiel</h3>
              <ComparisonTable results={results} inputs={inputs} isPrint={true} />

              <div className="bg-indigo-600 p-12 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <h4 className="text-indigo-200 font-black uppercase text-xs tracking-[0.4em]">Analyse de l'Architecte</h4>
                    <p className="text-2xl font-medium leading-[1.4] italic">
                        "Votre écosystème génère actuellement <span className="font-black text-white">{vActuelles.toFixed(1)}</span> ventes/sem. En optimisant votre structure vers un CPA cible de <span className="font-black text-white">{tCpa.toFixed(0)}€</span>, vous débloquez <span className="font-black text-emerald-400">{vManquantes.toFixed(1)} ventes additionnelles</span> à budget constant."
                    </p>
                    <div className="pt-8 border-t border-white/20">
                      <p className="text-xl font-medium leading-[1.4] italic">
                        Provision LTV latente : <span className="font-black text-white">{formatCurrency(tLatente)} / semaine</span>. C'est le profit futur à sécuriser via vos séquences de rétention.
                      </p>
                    </div>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">CPA Breakeven (Front-end)</p>
                      <p className="text-4xl font-black text-slate-900">{formatCurrency(mCpa)}</p>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-2">Profit Net Immédiat / Vente</p>
                      <p className="text-4xl font-black text-indigo-600">{formatCurrency(mInitiale)}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* PAGE 3: DATA & SIGNAL */}
      <div className="page-break p-20 bg-white">
          <header className="border-b-4 border-slate-900 pb-10 mb-20 flex justify-between items-end">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">02. Signal & Tracking</h2>
              <span className="text-slate-300 font-black text-sm tracking-widest">PAGE 03</span>
          </header>

          <div className="flex items-center gap-12 mb-20 bg-purple-50 p-12 rounded-[3rem] border border-purple-100">
              <div className="text-[140px] font-black text-purple-700 leading-none tracking-tighter">{emq}</div>
              <div className="space-y-4">
                  <p className="text-purple-400 font-black uppercase text-xs tracking-[0.3em]">Event Match Quality (EMQ)</p>
                  <h4 className="text-3xl font-black text-slate-900 italic">État du Flux de Données</h4>
                  <p className="text-xl text-slate-600 leading-relaxed font-medium italic">
                      {emq < 5 
                        ? "CRITIQUE : Meta est aveugle sur une partie de vos ventes. L'algorithme tourne à vide et gaspille votre budget sur des audiences froides."
                        : "OPTIMAL : Vos données remontent correctement. Votre avantage concurrentiel réside maintenant dans votre offre créative."}
                  </p>
              </div>
          </div>

          <div className="bg-slate-900 p-12 rounded-[3rem] text-white">
              <h5 className="text-indigo-400 font-black uppercase text-xs tracking-[0.3em] mb-10 italic">Feuille de Route Technique</h5>
              <div className="space-y-10">
                  <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">01</div>
                      <p className="text-xl font-black uppercase italic tracking-tight">Installation de la CAPI (API de Conversion) Server-side.</p>
                  </div>
                  <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">02</div>
                      <p className="text-xl font-black uppercase italic tracking-tight">Activation des paramètres de correspondance avancée.</p>
                  </div>
                  <div className="flex gap-6 items-center">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">03</div>
                      <p className="text-xl font-black uppercase italic tracking-tight">Validation du domaine et mesure agrégée (iOS 14.5+).</p>
                  </div>
              </div>
          </div>
      </div>

      {/* PAGE 4: LTV & SCALING */}
      <div className="page-break p-20 bg-white">
          <header className="border-b-4 border-slate-900 pb-10 mb-20 flex justify-between items-end">
              <h2 className="text-5xl font-black uppercase italic tracking-tighter">03. Levier LTV & Scaling</h2>
              <span className="text-slate-300 font-black text-sm tracking-widest">PAGE 04</span>
          </header>

          <div className="bg-emerald-600 text-white p-16 rounded-[3rem] relative overflow-hidden mb-16">
              <div className="relative z-10">
                  <p className="text-emerald-200 font-black uppercase text-xs tracking-[0.3em] mb-8">Capacité d'Enchère Dominante</p>
                  <p className="text-[120px] font-black leading-none tracking-tighter mb-8">+{ltvPower}%</p>
                  <p className="text-2xl font-medium leading-relaxed max-w-2xl italic">
                      Avec votre LTV de {formatCurrency(ltv)}, votre CPA Max réel est de <span className="font-black underline">{formatCurrency(rMaxCpa)}</span>. Vous pouvez sur-enchérir sur vos concurrents tout en restant rentable.
                  </p>
              </div>
          </div>

          <div className="p-10 border border-slate-200 rounded-[3rem] bg-slate-50">
              <h4 className="text-slate-900 font-black uppercase text-xs tracking-widest mb-8 text-center">Structure de Budget Recommandée (70/20/10)</h4>
              <div className="grid grid-cols-3 gap-8">
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
                      <p className="text-slate-400 font-black text-[10px] mb-2 uppercase">Acquisition</p>
                      <p className="text-3xl font-black">{formatCurrency((results?.minWeeklyBudget ?? 0) * 0.7)}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100">
                      <p className="text-slate-400 font-black text-[10px] mb-2 uppercase">Retargeting</p>
                      <p className="text-3xl font-black">{formatCurrency((results?.minWeeklyBudget ?? 0) * 0.2)}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 text-indigo-600">
                      <p className="text-indigo-300 font-black text-[10px] mb-2 uppercase">Testing</p>
                      <p className="text-3xl font-black">{formatCurrency((results?.minWeeklyBudget ?? 0) * 0.1)}</p>
                  </div>
              </div>
          </div>
      </div>

      {/* PAGE 5: CONCLUSION & CONTACT */}
      <div className="page-break p-20 bg-slate-900 text-white flex flex-col justify-between">
          <div>
              <header className="border-b border-white/10 pb-10 mb-20 flex justify-between items-end">
                  <h2 className="text-5xl font-black uppercase italic tracking-tighter">04. Accélération</h2>
                  <span className="text-slate-600 font-black text-sm tracking-widest">PAGE 05</span>
              </header>

              <h3 className="text-7xl font-black leading-none mb-12 tracking-tighter italic uppercase">
                  Passer de l'Audit <br/>
                  <span className="text-indigo-400">À l'Exécution.</span>
              </h3>

              <div className="bg-white/5 border-2 border-indigo-500 p-12 rounded-[3rem] backdrop-blur-sm">
                  <p className="text-2xl font-medium leading-relaxed italic mb-8">
                      "Ce diagnostic est votre boussole. L'étape suivante est la mise en place du protocole technique pour sécuriser vos {formatCurrency(tLatente)} de provision hebdomadaire."
                  </p>
                  <div className="flex items-center gap-4 text-emerald-400 font-black uppercase text-sm tracking-[0.2em]">
                      <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                      Consultation Stratégique offerte (15 min)
                  </div>
              </div>
          </div>

          <footer className="border-t border-white/10 pt-16 flex justify-between items-end">
              <div>
                  <Logo className="invert brightness-0 scale-110 origin-left mb-6" />
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Architecte ROAS-Garantie</p>
              </div>
              <div className="text-right">
                  <p className="text-slate-400 font-black text-xl">shopiflight@gmail.com</p>
                  <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-2">© 2026 ADS PILOT PRO — TOUS DROITS RÉSERVÉS</p>
              </div>
          </footer>
      </div>

    </div>
  );
};
