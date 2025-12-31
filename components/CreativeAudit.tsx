
import React, { useState, useMemo, useEffect } from 'react';
import { ExpertAvatar } from './UserDashboard';
import { AuthService, AuditService } from '../services/storage';
import { VisionService } from '../services/genai';
import { CalculatorInputs } from '../types';

const CHECKLIST_ITEMS = [
  { id: 'contrast', label: 'Contraste Fort', category: 'Le Visuel', why: 'Arrêt du scroll garanti.' },
  { id: 'human', label: 'Visage Humain', category: 'Le Visuel', why: 'Connexion émotionnelle.' },
  { id: 'text', label: 'Texte Minimal', category: 'Le Visuel', why: 'Diffusion algorithmique.' },
  { id: 'benefit', label: 'Bénéfice "Coup de Poing"', category: 'Le Message', why: 'Compréhension immédiate.' },
  { id: 'social', label: 'Preuve Sociale', category: 'Le Message', why: 'Crédibilité instantanée.' },
  { id: 'scarcity', label: 'Urgence / Rareté', category: 'Le Message', why: 'Peur de rater (FOMO).' },
  { id: 'direct', label: 'Lien Direct', category: 'Le Tunnel', why: 'Baisse du taux de rebond.' },
  { id: 'cohesion', label: 'Cohérence Visuelle', category: 'Le Tunnel', why: 'Mise en confiance.' },
  { id: 'mobile', label: 'Format Mobile (9:16)', category: 'La Technique', why: 'Expérience fluide.' },
  { id: 'subs', label: 'Son & Sous-titres', category: 'La Technique', why: 'Captation des "muets".' },
];

export const CreativeAudit: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [hookScore, setHookScore] = useState(5);
  const [offerScore, setOfferScore] = useState(5);
  const [desirabilityScore, setDesirabilityScore] = useState(5);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  const checklistScore = checkedItems.size;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        startAiAnalysis(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAiAnalysis = async (base64Data: string, type: string) => {
    setIsAnalyzing(true);
    setAiVerdict(null);
    setIsSaved(false);
    try {
      const pureBase64 = base64Data.split(',')[1];
      const data = await VisionService.analyzeCreative(pureBase64, type);
      
      setHookScore(data.hookScore);
      setOfferScore(data.offerScore);
      setDesirabilityScore(data.desirabilityScore);

      const newChecked = new Set<string>();
      if (data.checklist.contrast) newChecked.add('contrast');
      if (data.checklist.human) newChecked.add('human');
      if (data.checklist.text) newChecked.add('text');
      if (data.checklist.benefit) newChecked.add('benefit');
      if (data.checklist.social) newChecked.add('social');
      if (data.checklist.scarcity) newChecked.add('scarcity');
      if (data.checklist.direct) newChecked.add('direct');
      if (data.checklist.cohesion) newChecked.add('cohesion');
      if (data.checklist.mobile) newChecked.add('mobile');
      if (data.checklist.subs) newChecked.add('subs');
      setCheckedItems(newChecked);
      
      setAiVerdict(data.verdict);

      // SAUVEGARDE AUTOMATIQUE
      const user = AuthService.getCurrentUser();
      if (user) {
        setIsSaving(true);
        const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const autoName = `Diagnostic Vision - ${timestamp}`;
        
        const ctr = ((data.hookScore * 0.4 + data.offerScore * 0.3 + data.desirabilityScore * 0.3) / 10 * 2.2).toFixed(2);

        const inputs: CalculatorInputs = {
          name: autoName,
          type: 'CREATIVE',
          creativeHookScore: data.hookScore, 
          creativeOfferScore: data.offerScore, 
          creativeDesirabilityScore: data.desirabilityScore, 
          checklistScore: newChecked.size, 
          creativeImageUrl: base64Data, 
          currentCtr: ctr,
          pmv: '0', margin: '0', targetRoas: '0', targetVolume: '0', currentCpa: '0', currentRoas: '0', currentBudget: '0', 
          emqScore: ((data.hookScore + data.offerScore + data.desirabilityScore) / 3).toFixed(1),
          niche: 'other', ltv: '0', creativeFormats: [], dataSource: 'manual' as const
        };
        
        const results = { 
          roasThreshold: 0, maxCpa: 0, targetCpa: 0, minWeeklyBudget: 0, budgetGap: 0, nicheRoas: 0, nicheCtr: 0, 
          roasDiffBenchmark: 0, roasDiffTarget: 0, cpaStatus: 'good' as const, realMaxCpa: 0, learningPhaseBudget: 0, 
          recommendationType: 'scale' as const, idealLearningCpa: 0, cpaReductionPercent: 0, ventesActuellesHebdo: 0, 
          ventesCiblesHebdo: 0, ventesManquantes: 0, margeInitiale: 0, provisionParClient: 0, tresorerieLatenteHebdo: 0, 
          andromedaOptimized: true, creativeDiversityScore: 100 
        };

        await AuditService.saveAudit(user, inputs, results, data.verdict, 'CREATIVE', autoName);
        setIsSaved(true);
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
      setIsSaving(false);
    }
  };

  const creativeResults = useMemo(() => {
    const weightedAvg = (hookScore * 0.4) + (offerScore * 0.3) + (desirabilityScore * 0.3);
    const estimatedCtr = (weightedAvg / 10) * 2.2 + (checklistScore * 0.1);
    const signalScore = (hookScore + offerScore + desirabilityScore) / 3;
    return { estimatedCtr, signalScore };
  }, [hookScore, offerScore, desirabilityScore, checklistScore]);

  return (
    <div className="space-y-12 pb-32 relative">
      <div className="flex justify-between items-end gap-6">
        <div className="animate-fade-in">
           <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 mb-4">Analyse Vision v3.5</div>
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Audit <span className="text-indigo-400">Créatif Automatisé</span></h2>
        </div>
        <div className="flex items-center gap-4">
           {isSaved && (
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-fade-in">✓ Archivé automatiquement</span>
           )}
           <button 
            onClick={() => { (window as any).setAppMode('user_dashboard'); setTimeout(() => window.dispatchEvent(new CustomEvent('setDashboardTab', { detail: 'history' })), 50); }}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-indigo-500 transition-all"
           >
             📁 Voir mes audits
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8 animate-fade-in">
           <div className="bg-slate-900/60 border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="text-center mb-10"><h3 className="text-xl font-black uppercase italic tracking-widest text-white">Protocole de Validation</h3></div>
              <div className="space-y-3">
                 {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${checkedItems.has(item.id) ? 'bg-indigo-600/15 border-indigo-500' : 'bg-white/5 border-white/10 opacity-40'}`}>
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checkedItems.has(item.id) ? 'bg-indigo-50 border-indigo-400' : 'border-white/20'}`}>{checkedItems.has(item.id) && <span className="text-white text-[10px] font-black">✓</span>}</div>
                       <p className={`text-[10px] font-black uppercase tracking-tight ${checkedItems.has(item.id) ? 'text-white' : 'text-slate-500'}`}>{item.label}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`bg-slate-900/60 border border-white/5 rounded-[3rem] aspect-square overflow-hidden flex items-center justify-center relative shadow-2xl transition-all ${isAnalyzing ? 'ring-4 ring-indigo-500' : ''}`}>
                 {imagePreview ? <img src={imagePreview} className={`w-full h-full object-contain transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-[3px] brightness-50' : ''}`} /> : <div className="text-center opacity-20"><span className="text-8xl block mb-4">📸</span><p className="text-[10px] font-black uppercase tracking-widest">Cliquez pour scanner</p></div>}
                 {!isAnalyzing && <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                 {isAnalyzing && <div className="absolute inset-0 flex items-center justify-center z-30"><div className="bg-indigo-600 px-6 py-3 rounded-full text-[9px] font-black text-white uppercase animate-pulse">Vision Meta active...</div></div>}
              </div>

              <div className="space-y-8">
                 <div className="bg-slate-900/30 border border-white/5 p-8 rounded-[2.5rem] shadow-inner space-y-10">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🪝 Score d'Arrêt</label><span className="text-2xl font-black italic text-indigo-400">{hookScore}/10</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-[1000ms]" style={{ width: `${hookScore * 10}%` }}></div></div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">💡 Clarté Offre</label><span className="text-2xl font-black italic text-indigo-400">{offerScore}/10</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-[1000ms]" style={{ width: `${offerScore * 10}%` }}></div></div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🔥 Désirabilité</label><span className="text-2xl font-black italic text-indigo-400">{desirabilityScore}/10</span></div>
                       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 transition-all duration-[1000ms]" style={{ width: `${desirabilityScore * 10}%` }}></div></div>
                    </div>
                 </div>
                 <div className="bg-indigo-600 p-10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mb-4">CTR Théorique Estimé</p>
                    <span className="text-7xl font-black italic tracking-tighter text-white tabular-nums">{creativeResults.estimatedCtr.toFixed(2)}%</span>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-950/20 border border-indigo-500/20 p-10 rounded-[3.5rem] relative overflow-hidden group min-h-[240px] flex items-center">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 w-full">
                 <ExpertAvatar className="w-24 h-24 shadow-2xl" />
                 <div className="space-y-4 flex-1">
                    <div>
                       <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-1">Verdict de l'Architecte</h4>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Alexia a validé le potentiel de conversion de votre visuel.</p>
                    </div>
                    <p className={`text-xl md:text-2xl text-white font-medium italic leading-relaxed transition-all duration-700 ${isAnalyzing ? 'opacity-20 blur-[1px]' : 'opacity-100'}`}>
                       "{aiVerdict || "En attente de scan..."}"
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
