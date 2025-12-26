
import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types';

interface Advice {
  status: 'red' | 'orange' | 'green';
  title: string;
  text: string;
  action: string;
  guide: string;
  link: string;
}

interface TechnicalRecommendationsProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
}

export const TechnicalRecommendations: React.FC<TechnicalRecommendationsProps> = ({ results, inputs }) => {
  const emq = parseFloat(inputs.emqScore) || 0;
  const ltv = parseFloat(inputs.ltv) || 0;
  const pmv = parseFloat(inputs.pmv) || 1;
  const currentCpa = parseFloat(inputs.currentCpa) || 0;
  const ltvRatio = ltv / pmv;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const getSignalAdvice = (): Advice => {
    if (emq < 5) return {
      status: 'red',
      title: "Signal Aveugle",
      text: `Meta ignore actuellement ~${Math.round((10 - emq) * 8)}% de vos conversions. Vos algorithmes tournent à vide.`,
      action: "Installation CAPI Server-side.",
      guide: "SOS Signal",
      link: "https://ton-lien-systeme-io/guide-sos-signal"
    };
    if (emq < 8) return {
      status: 'orange',
      title: "Signal Instable",
      text: "Tracking actif mais instable face à iOS 14+. Le CPA est gonflé artificiellement.",
      action: "Nettoyage doublons & validation domaine.",
      guide: "SOS Signal",
      link: "https://ton-lien-systeme-io/guide-sos-signal"
    };
    return {
      status: 'green',
      title: "Signal Champion",
      text: "Flux sain. Meta reçoit 100% des signaux. Votre avantage est technique.",
      action: "Enrichir via LAL offline.",
      guide: "",
      link: ""
    };
  };

  const getProfitAdvice = (): Advice => {
    const perteLtv = results.tresorerieLatenteHebdo * 4.34;
    const isCriticalLoss = perteLtv > 500;

    if (isCriticalLoss || ltvRatio < 1.3) return {
      status: 'red',
      title: "Marge à Risque",
      text: `Vous laissez ${formatCurrency(perteLtv)}/mois sur la table. Votre rentabilité est fragile.`,
      action: "Flow Post-Achat immédiat.",
      guide: "LTV Maximal",
      link: "https://ton-lien-systeme-io/systeme-ltv"
    };
    if (ltvRatio < 2.5) return {
      status: 'orange',
      title: "Profit Inexploité",
      text: `Potentiel de croissance de ${Math.round((2.5 - ltvRatio) * 40)}% sur votre valeur client.`,
      action: "Order Bump stratégique.",
      guide: "LTV Maximal",
      link: "https://ton-lien-systeme-io/systeme-ltv"
    };
    return {
      status: 'green',
      title: "Économie Circulaire",
      text: "Excellente rétention. Vos investissements génèrent des intérêts composés.",
      action: "Campagnes VIP.",
      guide: "",
      link: ""
    };
  };

  const getScalingAdvice = (): Advice => {
    if (currentCpa > results.realMaxCpa) return {
      status: 'red',
      title: "Scaling Toxique",
      text: `Perte de ${formatCurrency(currentCpa - results.realMaxCpa)} par vente. Stopper le scale.`,
      action: "Pivot créatif & test d'offre.",
      guide: "Scale & Sniper",
      link: "https://ton-lien-systeme-io/scale-sniper"
    };
    if (currentCpa > results.targetCpa) return {
      status: 'orange',
      title: "Scaling Bridé",
      text: "Structure stable mais inefficace pour un scaling vertical massif.",
      action: "Structure Broad (No Interest).",
      guide: "Scale & Sniper",
      link: "https://ton-lien-systeme-io/scale-sniper"
    };
    return {
      status: 'green',
      title: "Prêt pour l'Impact",
      text: "Metrics au vert. Le scaling est un choix, pas un risque.",
      action: "Hausse budget +20% / 48h.",
      guide: "",
      link: ""
    };
  };

  const categories = [
    { id: 'signal', advice: getSignalAdvice(), icon: '📡' },
    { id: 'profit', advice: getProfitAdvice(), icon: '💎' },
    { id: 'scaling', advice: getScalingAdvice(), icon: '🎯' }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold tracking-tighter uppercase italic leading-none flex items-center justify-center gap-2">
           <span className="text-indigo-600">🧠</span> Conseils d'Expert
        </h3>
        <p className="text-slate-500 text-[11px] italic font-medium">Recommandations basées sur votre investissement publicitaire.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className={`p-6 rounded-[2rem] border bg-white shadow-sm flex flex-col h-full ${
            cat.advice.status === 'red' ? 'border-red-50' : 
            cat.advice.status === 'orange' ? 'border-amber-50' : 'border-emerald-50'
          }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                    cat.advice.status === 'red' ? 'bg-red-50 text-red-600' : 
                    cat.advice.status === 'orange' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {cat.icon}
                  </div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">{cat.advice.title}</h4>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${
                  cat.advice.status === 'red' ? 'bg-red-600 text-white' : 
                  cat.advice.status === 'orange' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {cat.advice.status}
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className={`p-4 rounded-xl text-[12px] leading-relaxed italic font-medium ${
                  cat.advice.status === 'red' ? 'bg-red-50 text-red-900' : 
                  cat.advice.status === 'orange' ? 'bg-amber-50 text-amber-900' : 'bg-emerald-50 text-emerald-900'
                }`}>
                  "{cat.advice.text}"
                </div>
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Priorité :</p>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{cat.advice.action}</p>
                </div>
              </div>

              {cat.advice.guide && (
                <div className="mt-6 pt-5 border-t border-slate-50">
                  <a href={cat.advice.link} target="_blank" rel="noopener noreferrer" className={`block w-full py-3 rounded-xl text-center text-[9px] font-black uppercase tracking-widest transition-all ${
                    cat.advice.status === 'red' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  }`}>
                    Guide {cat.advice.guide} &rarr;
                  </a>
                </div>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};
