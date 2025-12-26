
import React from 'react';
import { CalculationResults, CalculatorInputs } from '../types';

interface ComparisonTableProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
  isPrint?: boolean;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ results, inputs, isPrint = false }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const currentCpa = parseFloat(inputs.currentCpa) || 0;
  const currentRoas = parseFloat(inputs.currentRoas) || 0;
  const targetRoas = parseFloat(inputs.targetRoas) || 0;
  
  // Sécurisation contre les valeurs nulles provenant d'anciennes simulations
  const vActuelles = results?.ventesActuellesHebdo ?? 0;
  const vCibles = results?.ventesCiblesHebdo ?? 0;
  const vManquantes = results?.ventesManquantes ?? 0;
  const tCpa = results?.targetCpa ?? 0;

  const deltaCpa = currentCpa - tCpa;
  const deltaRoas = targetRoas - currentRoas;

  const rows = [
    { id: 'sales', label: "Ventes (Hebdo)", actual: vActuelles.toFixed(1), target: vCibles.toFixed(1), impact: `+${vManquantes.toFixed(1)}`, impactPositive: true },
    { id: 'cpa', label: "CPA Réel", actual: `${formatCurrency(currentCpa)}`, target: `${formatCurrency(tCpa)}`, impact: `-${formatCurrency(deltaCpa)}`, impactPositive: deltaCpa > 0 },
    { id: 'roas', label: "ROAS", actual: currentRoas.toFixed(1), target: targetRoas.toFixed(1), impact: `+${(deltaRoas > 0 ? deltaRoas : 0).toFixed(1)}`, impactPositive: deltaRoas > 0 }
  ];

  return (
    <div className={`overflow-hidden transition-all duration-500 ${isPrint ? 'rounded-xl border border-slate-900' : 'rounded-2xl border border-slate-100 bg-white shadow-sm'}`}>
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest">KPI</th>
            <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest">Actuel</th>
            <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest bg-indigo-700">Cible</th>
            <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest">Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">{row.label}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-400">{row.actual}</td>
              <td className="px-4 py-3 text-base font-black text-indigo-600 bg-indigo-50/5">{row.target}</td>
              <td className={`px-4 py-3 text-xs font-black ${row.impactPositive ? 'text-emerald-600' : 'text-slate-300'}`}>{row.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
