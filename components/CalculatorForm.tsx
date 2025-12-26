
import React, { useMemo } from 'react';
import { CalculatorInputs, NicheData } from '../types';
import { InputField } from './InputField';
import { SelectField } from './SelectField';

interface CalculatorFormProps {
  mode: 'initial' | 'live';
  inputs: CalculatorInputs;
  onInputChange: (field: keyof CalculatorInputs, value: any) => void;
  onValidate?: (e: React.FormEvent) => void;
  errors: Record<string, string>;
  nicheData: NicheData[];
  isApiMode: boolean;
}

const TOOLTIPS: Record<string, string> = {
  pmv: "Le montant moyen d'une commande sur votre boutique (AOV).",
  ltv: "La valeur totale qu'un client génère pour vous sur 12 mois.",
  margin: "Votre marge brute après coût produit et livraison.",
  targetRoas: "Le ROAS que vous visez pour être rentable.",
  targetVolume: "Le nombre de ventes hebdomadaires souhaité.",
  currentCpa: "Ce que vous payez réellement aujourd'hui.",
  currentRoas: "Votre ROAS actuel affiché sur Meta.",
  currentCtr: "Le taux de clic sur vos publicités.",
  currentBudget: "Votre investissement publicitaire total par mois.",
  emqScore: "L'IA Andromeda de Meta nécessite un signal de 8/10 pour fonctionner à pleine puissance. En dessous, votre ciblage est aléatoire."
};

const CREATIVE_FORMATS = [
  { id: 'static', label: 'Images Statiques' },
  { id: 'video', label: 'Vidéos / UGC' },
  { id: 'carousel', label: 'Carrousels' },
  { id: 'reels', label: 'Reels 9:16' }
];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  mode,
  inputs,
  onInputChange,
  onValidate,
  errors,
  nicheData
}) => {
  const isLive = mode === 'live';
  
  const sections = useMemo(() => [
    {
      id: 'section-1',
      title: "1. Modèle Économique",
      fields: [
        { id: 'pmv', label: "Prix Moyen (AOV)", suffix: "€" },
        { id: 'ltv', label: "LTV (12m)", suffix: "€" },
        { id: 'margin', label: "Marge Brute", suffix: "%" }
      ]
    },
    {
      id: 'section-2',
      title: "2. Objectifs",
      fields: [
        { id: 'targetRoas', label: "ROAS Cible", suffix: "" },
        { id: 'targetVolume', label: "Volume Cible", suffix: "" }
      ]
    },
    {
      id: 'section-3',
      title: "3. Metrics Meta (Andromeda)",
      fields: [
        { id: 'currentCpa', label: "CPA Actuel", suffix: "€" },
        { id: 'currentRoas', label: "ROAS Actuel", suffix: "" },
        { id: 'currentCtr', label: "CTR Actuel", suffix: "%" },
        { id: 'currentBudget', label: "Budget Mensuel", suffix: "€" },
        { id: 'emqScore', label: "Score EMQ", suffix: "/10" }
      ]
    }
  ], []);

  const handleFormatToggle = (formatId: string) => {
    const current = inputs.creativeFormats || [];
    const updated = current.includes(formatId) 
      ? current.filter(id => id !== formatId)
      : [...current, formatId];
    onInputChange('creativeFormats', updated);
  };

  const formBody = (
    <div className={`relative ${isLive ? "space-y-10" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10"}`}>
      <div className="col-span-full space-y-8">
        <SelectField 
          id="niche" 
          label="Secteur d'Activité" 
          value={inputs.niche} 
          onChange={(v) => onInputChange('niche', v)} 
          options={nicheData.map(n => ({ value: n.id, label: n.label }))} 
          error={errors.niche} 
        />
      </div>

      {sections.map((section) => (
        <React.Fragment key={section.id}>
          <div className="col-span-full mt-6">
             <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] border-b border-slate-100 pb-3 mb-2">
                {section.title}
             </h4>
          </div>
          {section.fields.map((f) => (
            <InputField 
              key={f.id}
              id={f.id} 
              label={f.label} 
              value={(inputs as any)[f.id]} 
              onChange={(v) => onInputChange(f.id as any, v)} 
              suffix={f.suffix} 
              tooltip={TOOLTIPS[f.id]}
            />
          ))}
        </React.Fragment>
      ))}

      <div className="col-span-full mt-6">
         <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] border-b border-indigo-50 pb-3 mb-4">
            Andromeda : Mix Créatif
         </h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CREATIVE_FORMATS.map(format => (
              <button
                key={format.id}
                type="button"
                onClick={() => handleFormatToggle(format.id)}
                className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  (inputs.creativeFormats || []).includes(format.id)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200'
                }`}
              >
                {format.label}
              </button>
            ))}
         </div>
         <p className="mt-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
           * Meta recommande au moins 2 formats pour le scaling.
         </p>
      </div>
    </div>
  );

  if (isLive) return <div className="animate-fade-in">{formBody}</div>;

  return (
    <form onSubmit={onValidate} className="bg-white p-8 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-12 max-w-5xl mx-auto relative">
      <div className="text-center mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Audit Stratégique AdsPilot Pro</p>
      </div>
      <div className="lg:pl-4">
        {formBody}
      </div>
      <div className="pt-8">
        <button type="submit" className="w-full bg-slate-900 text-white py-8 rounded-[2rem] font-black text-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest italic shadow-2xl active:scale-95 group">
          Lancer l'Audit Andromeda
          <span className="inline-block ml-3 group-hover:translate-x-2 transition-transform">&rarr;</span>
        </button>
      </div>
    </form>
  );
};
