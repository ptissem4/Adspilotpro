
import React from 'react';
import { SimulationHistory } from '../types';
import { ExpertAvatar } from './UserDashboard';

interface CreativeResultDisplayProps {
  report: SimulationHistory;
}

export const CreativeResultDisplay: React.FC<CreativeResultDisplayProps> = ({ report }) => {
  const inputs = report.inputs;
  const checklist = [
    { label: 'Contraste Fort', checked: inputs.checklistScore! >= 1 },
    { label: 'Visage Humain', checked: inputs.checklistScore! >= 2 },
    { label: 'Texte Minimal', checked: inputs.checklistScore! >= 3 },
    { label: 'Bénéfice Clair', checked: inputs.checklistScore! >= 4 },
    { label: 'Preuve Sociale', checked: inputs.checklistScore! >= 5 },
    { label: 'Urgence/Rareté', checked: inputs.checklistScore! >= 6 },
    { label: 'Lien Direct', checked: inputs.checklistScore! >= 7 },
    { label: 'Cohérence Visuelle', checked: inputs.checklistScore! >= 8 },
    { label: 'Format Mobile', checked: inputs.checklistScore! >= 9 },
    { label: 'Son & Subs', checked: inputs.checklistScore! >= 10 },
  ];

  return (
    <div className="bg-white text-slate-900 animate-fade-in overflow-hidden">
      {/* HEADER VALIDATION ARCHITECTE */}
      <div className="bg-slate-50 border-b border-slate-100 p-8 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <ExpertAvatar className="w-14 h-14" neon={false} />
            <div>
               <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-1">Diagnostic Officiel</p>
               <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Alexia Kebir — Architecte</h3>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID ARCHIVE</p>
            <p className="text-sm font-black text-slate-900">{report.auditId}</p>
         </div>
      </div>

      <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* COLONNE GAUCHE : L'IMAGE ET LES SCORES */}
        <div className="space-y-10">
           <div className="aspect-square rounded-[3rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
              {inputs.creativeImageUrl ? (
                 <img src={inputs.creativeImageUrl} className="w-full h-full object-contain" alt="Créative analysée" />
              ) : (
                 <span className="text-6xl opacity-20">📸</span>
              )}
           </div>

           <div className="grid grid-cols-3 gap-4">
              <ScoreBadge label="Hook" score={inputs.creativeHookScore || 0} icon="🪝" />
              <ScoreBadge label="Offre" score={inputs.creativeOfferScore || 0} icon="💡" />
              <ScoreBadge label="Désir" score={inputs.creativeDesirabilityScore || 0} icon="🔥" />
           </div>
        </div>

        {/* COLONNE DROITE : CHECKLIST ET VERDICT */}
        <div className="space-y-10">
           <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 group-hover:rotate-12 transition-transform italic font-black">!</div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-indigo-200">Alexia a validé le potentiel de conversion de votre visuel.</p>
              <p className="text-2xl font-medium italic leading-relaxed">
                 "{report.verdictLabel}"
              </p>
              <div className="mt-8 pt-6 border-t border-white/20 flex justify-between items-end">
                 <div>
                    <p className="text-[9px] font-black uppercase text-indigo-300">CTR Estimé</p>
                    <p className="text-4xl font-black italic">{inputs.currentCtr}%</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-indigo-300">Score Signal</p>
                    <p className="text-4xl font-black italic">{inputs.emqScore}/10</p>
                 </div>
              </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 border-b pb-4">Checklist de Conformité</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                 {checklist.slice(0, inputs.checklistScore || 0).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-emerald-600">
                       <span className="text-lg">✓</span>
                       <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                    </div>
                 ))}
                 {checklist.slice(inputs.checklistScore || 0).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                       <span className="text-lg opacity-30">○</span>
                       <span className="text-[10px] font-black uppercase tracking-tight opacity-50">{item.label}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const ScoreBadge = ({ label, score, icon }: { label: string, score: number, icon: string }) => (
  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center flex flex-col items-center">
     <span className="text-xl mb-2">{icon}</span>
     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-xl font-black text-slate-900">{score}/10</p>
  </div>
);
