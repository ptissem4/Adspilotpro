
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
  const [adUrl, setAdUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [projectName, setProjectName] = useState('');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showNamingModal, setShowNamingModal] = useState(false);
  
  const [hookScore, setHookScore] = useState(5);
  const [offerScore, setOfferScore] = useState(5);
  const [desirabilityScore, setDesirabilityScore] = useState(5);
  const [aiVerdict, setAiVerdict] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

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
    setIsArchived(false);
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
    } catch (error) {
      console.error("AI Analysis Error:", error);
      alert("L'analyse IA a échoué.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const creativeResults = useMemo(() => {
    const weightedAvg = (hookScore * 0.4) + (offerScore * 0.3) + (desirabilityScore * 0.3);
    const baseCtr = (weightedAvg / 10) * 2.2;
    const estimatedCtr = baseCtr + (checklistScore * 0.1);
    const signalScore = (hookScore + offerScore + desirabilityScore) / 3;
    
    let verdict = aiVerdict || "En attente de scan...";
    return { estimatedCtr, verdict, checklistScore, signalScore };
  }, [hookScore, offerScore, desirabilityScore, checklistScore, aiVerdict]);

  const handleArchiveClick = () => {
    const user = AuthService.getCurrentUser();
    if (!user) return alert("Connexion requise pour archiver un diagnostic.");
    if (!imagePreview) return alert("Veuillez d'abord scanner une créative.");
    setShowNamingModal(true);
  };

  const confirmArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const user = AuthService.getCurrentUser();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const nameToSave = projectName.trim();
      const inputs: CalculatorInputs = {
        name: nameToSave,
        type: 'CREATIVE',
        creativeHookScore: hookScore, 
        creativeOfferScore: offerScore, 
        creativeDesirabilityScore: desirabilityScore, 
        checklistScore, 
        creativeImageUrl: imagePreview || '', 
        currentCtr: creativeResults.estimatedCtr.toFixed(2),
        pmv: '0', margin: '0', targetRoas: '0', targetVolume: '0', currentCpa: '0', currentRoas: '0', currentBudget: '0', 
        emqScore: creativeResults.signalScore.toFixed(1),
        niche: 'other', ltv: '0', creativeFormats: [], dataSource: 'manual' as const
      };
      
      const results = { 
        estimatedCtr: creativeResults.estimatedCtr, 
        roasThreshold: 0, maxCpa: 0, targetCpa: 0, minWeeklyBudget: 0, budgetGap: 0, nicheRoas: 0, nicheCtr: 0, 
        roasDiffBenchmark: 0, roasDiffTarget: 0, cpaStatus: 'good' as const, realMaxCpa: 0, learningPhaseBudget: 0, 
        recommendationType: 'scale' as const, idealLearningCpa: 0, cpaReductionPercent: 0, ventesActuellesHebdo: 0, 
        ventesCiblesHebdo: 0, ventesManquantes: 0, margeInitiale: 0, provisionParClient: 0, tresorerieLatenteHebdo: 0, 
        andromedaOptimized: true, creativeDiversityScore: 100 
      };

      await AuditService.saveAudit(user, inputs, results, creativeResults.verdict, 'CREATIVE', nameToSave);
      setIsArchived(true);
      setShowNamingModal(false);
      
      // Déclenchement de la notification globale
      if ((window as any).setAppMode) {
          // Utilisation du toast via dispatch d'un événement si possible ou via setAppMode
          // Ici on force le retour au dashboard
          (window as any).setAppMode('user_dashboard');
          setTimeout(() => {
              const ev = new CustomEvent('setDashboardTab', { detail: 'history' });
              window.dispatchEvent(ev);
              alert("Diagnostic archivé avec succès, Alexia !");
          }, 100);
      }
    } catch (e) {
      alert("Erreur lors de l'archivage.");
    } finally { 
      setIsSaving(false); 
    }
  };

  return (
    <div className="space-y-12 pb-32 relative">
      <div className="flex justify-between items-end gap-6">
        <div className="animate-fade-in">
           <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 mb-4">Analyse Vision v3.5</div>
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Audit <span className="text-indigo-400">Créatif Automatisé</span></h2>
        </div>
        <button 
          onClick={handleArchiveClick} 
          disabled={isSaving || isAnalyzing || isArchived} 
          className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all border flex items-center gap-3 ${
            isArchived 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 cursor-default' 
              : 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-white hover:scale-105 active:scale-95 disabled:opacity-50'
          }`}
        >
          {isArchived ? 'ARCHIVÉ ✅' : isSaving ? 'ENCOURS...' : '💾 ARCHIVER'}
        </button>
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
                    <ScoreSlider label="Score d'Arrêt" value={hookScore} onChange={setHookScore} icon="🪝" />
                    <ScoreSlider label="Clarté Offre" value={offerScore} onChange={setOfferScore} icon="💡" />
                    <ScoreSlider label="Désirabilité" value={desirabilityScore} onChange={setDesirabilityScore} icon="🔥" />
                 </div>
                 <div className="bg-indigo-600 p-10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mb-4 relative z-10">CTR Théorique Estimé</p>
                    <span className="text-7xl font-black italic tracking-tighter text-white tabular-nums relative z-10">{creativeResults.estimatedCtr.toFixed(2)}%</span>
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
                       "{creativeResults.verdict}"
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {showNamingModal && (
        <div className="fixed inset-0 z-[1000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 text-center space-y-8 relative shadow-2xl border border-slate-100">
              <button onClick={() => setShowNamingModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">✕</button>
              <ExpertAvatar className="w-20 h-20 mx-auto" neon={true} />
              <div className="space-y-2">
                <h4 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">Archivage Stratégique</h4>
                <p className="text-slate-500 text-sm font-medium italic">Sous quel nom souhaitez-vous archiver ce diagnostic ?</p>
              </div>
              <form onSubmit={confirmArchive} className="space-y-6">
                 <input 
                   type="text" required autoFocus
                   className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 text-slate-900 shadow-inner"
                   placeholder="ex: UGC - Promo Printemps"
                   value={projectName}
                   onChange={(e) => setProjectName(e.target.value)}
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                       <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Score Signal</p>
                       <p className="text-xl font-black text-indigo-600">{creativeResults.signalScore.toFixed(1)}/10</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl text-center">
                       <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">CTR Estimé</p>
                       <p className="text-xl font-black text-slate-900">{creativeResults.estimatedCtr.toFixed(2)}%</p>
                    </div>
                 </div>
                 <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                   {isSaving ? 'ARCHIVAGE EN COURS...' : 'CONFIRMER L\'ARCHIVAGE →'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const ScoreSlider = ({ label, value, onChange, icon }: { label: string, value: number, onChange: (v: number) => void, icon: string }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
       <div className="flex items-center gap-3"><span className="text-xl">{icon}</span><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label></div>
       <span className="text-2xl font-black italic text-indigo-400 tabular-nums">{value}/10</span>
    </div>
    <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
       <div className="h-full bg-indigo-500 transition-all duration-[1000ms]" style={{ width: `${value * 10}%` }}></div>
       <input type="range" min="0" max="10" step="0.1" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  </div>
);
