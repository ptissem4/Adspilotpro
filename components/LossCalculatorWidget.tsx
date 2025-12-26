
import React, { useEffect, useState } from 'react';

interface LossCalculatorWidgetProps {
  targetValue: number;
}

export const LossCalculatorWidget: React.FC<LossCalculatorWidgetProps> = ({ targetValue }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2000; // 2 seconds animation

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for a smooth finish
      const easeOutQuad = (t: number) => t * (2 - t);
      
      setDisplayValue(easeOutQuad(progress) * targetValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [targetValue]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR', 
      maximumFractionDigits: 0 
    }).format(val);

  return (
    <div className="relative group perspective-1000">
      <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white border border-slate-100 p-8 md:p-12 rounded-[2.5rem] shadow-xl overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -right-10 -bottom-10 text-[120px] font-black italic text-slate-50 opacity-[0.03] select-none pointer-events-none">
          PROFIT
        </div>
        
        <div className="flex flex-col items-center text-center space-y-4">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 uppercase tracking-widest border border-indigo-100">
            📊 Trésorerie Récupérable Mensuelle
          </span>
          
          <div className="relative">
            <h4 className="text-6xl md:text-8xl font-black tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-600">
              {formatCurrency(displayValue)}
            </h4>
            <div className="absolute -top-4 -right-8">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <p className="text-slate-500 font-medium italic text-sm leading-relaxed">
              Ce montant combine l'économie immédiate sur le <span className="text-slate-900 font-bold underline decoration-indigo-300">Gaspillage du Signal Meta</span> et le <span className="text-slate-900 font-bold underline decoration-emerald-300">Profit Manquant</span> de vos ventes non réalisées.
            </p>
          </div>
          
          <div className="pt-4 flex items-center gap-4">
             <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-emerald-500 rounded-full"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuite stoppée</span>
             <div className="h-1 w-24 bg-gradient-to-l from-red-500 to-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
