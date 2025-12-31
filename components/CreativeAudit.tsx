
import React, { useState, useMemo, useEffect } from 'react';
import { ExpertAvatar } from './UserDashboard.tsx';
import { AuthService, AuditService } from '../services/storage.ts';
import { VisionService } from '../services/genai.ts';
import { CalculatorInputs } from '../types.ts';

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
  const [scanProgress, setScanProgress] = useState(0);
  
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
    setScanProgress(0);
    setAiVerdict(null);
    setIsSaved(false);
    
    const progressInterval = setInterval(() => {
      setScanProgress(prev => (prev < 95 ? prev + Math.random() * 5 : prev));
    }, 150);

    try {
      const pureBase64 = base64Data.split(',')[1];
      const data = await VisionService.analyzeCreative(pureBase64, type);
      
      clearInterval(progressInterval);
      setScanProgress(100);

      // Mise à jour sécurisée des scores
      const h = data.hookScore ?? 5;
      const o = data.offerScore ?? 5;
      const d = data.desirabilityScore ?? 5;
      
      setHookScore(h);
      setOfferScore(o);
      setDesirabilityScore(d);

      // Mapping de la checklist
      const newChecked = new Set<string>();
      if (data.checklist) {
        Object.keys(data.checklist).forEach(key => {
          if (data.checklist[key]) newChecked.add(key);
        });
      }
      setCheckedItems(newChecked);
      setAiVerdict(data.verdict || "Analyse terminée.");

      // Sauvegarde automatique pour le cockpit d'Alexia
      const user = AuthService.getCurrentUser();
      if (user) {
        setIsSaving(true);
        const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const autoName = `Scan Vision - ${timestamp}`;
        
        const weightedAvg = (h * 0.4 + o * 0.3 + d * 0.3);
        const ctr = ((weightedAvg / 10) * 2.2 + (newChecked.size * 0.1)).toFixed(2);

        const inputs: CalculatorInputs = {
          name: autoName,
          type: 'CREATIVE',
          creativeHookScore: h, 
          creativeOfferScore: o, 
          creativeDesirabilityScore: d, 
          checklistScore: newChecked.size, 
          creativeImageUrl: base64Data, 
          currentCtr: ctr,
          pmv: '0', margin: '0', targetRoas: '0', targetVolume: '0', currentCpa: '0', currentRoas: '0', currentBudget: '0', 
          emqScore: (weightedAvg).toFixed(1),
          niche: 'other', ltv: '0', creativeFormats: [], dataSource: 'manual' as const
        };
        
        const results = { 
          roasThreshold: 0, maxCpa: 0, targetCpa: 0, minWeeklyBudget: 0, budgetGap: 0, nicheRoas: 0, nicheCtr: 0, 
          roasDiffBenchmark: 0, roasDiffTarget: 0, cpaStatus: 'good' as const, realMaxCpa: 0, learningPhaseBudget: 0, 
          recommendationType: 'scale' as const, idealLearningCpa: 0, cpaReductionPercent: 0, ventesActuellesHebdo: 0, 
          ventesCiblesHebdo: 0, ventesManquantes: 0, margeInitiale: 0, provisionParClient: 0, tresorerieLatenteHebdo: 0, 
          andromedaOptimized: true, creativeDiversityScore: 100 
        };

        await AuditService.saveAudit(user, inputs, results, data.verdict || "Scan Validé", 'CREATIVE', autoName);
        setIsSaved(true);
        window.dispatchEvent(new CustomEvent('auditSaved'));
      }

    } catch (error) {
      console.error("AI Analysis Error:", error);
      clearInterval(progressInterval);
      setAiVerdict("Échec de l'analyse. Vérifiez votre connexion ou la taille de l'image.");
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setIsSaving(false);
      }, 500);
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
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="animate-fade-in">
           <div className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 mb-4">Analyse Vision v3.5 — Multimodal</div>
           <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white">Audit <span className="text-indigo-400">Créatif Automatisé</span></h2>
        </div>
        <div className="flex items-center gap-4">
           {isSaved && (
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-fade-in">✓ Archivé</span>
           )}
           <button 
            onClick={() => { (window as any).setAppMode('user_dashboard'); setTimeout(() => window.dispatchEvent(new CustomEvent('setDashboardTab', { detail: 'history' })), 50); }}
            className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-indigo-500 transition-all"
           >
             📁 Mes audits
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-8 animate-fade-in">
           <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="text-center mb-10"><h3 className="text-xl font-black uppercase italic tracking-widest text-white">Protocole Architecte</h3></div>
              <div className="space-y-3">
                 {CHECKLIST_ITEMS.map((item) => (
                    <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${checkedItems.has(item.id) ? 'bg-indigo-600/20 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 opacity-40'}`}>
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${checkedItems.has(item.id) ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'}`}>{checkedItems.has(item.id) && <span className="text-white text-[10px] font-black">✓</span>}</div>
                       <p className={`text-[10px] font-black uppercase tracking-tight ${checkedItems.has(item.id) ? 'text-white' : 'text-slate-500'}`}>{item.label}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`bg-[#0A0A0A] border border-white/5 rounded-[3rem] aspect-square overflow-hidden flex items-center justify-center relative shadow-2xl transition-all ${isAnalyzing ? 'ring-4 ring-indigo-500' : ''}`}>
                 {imagePreview ? (
                   <>
                     <img src={imagePreview} className={`w-full h-full object-contain transition-all duration-1000 ${isAnalyzing ? 'scale-105 blur-[2px] brightness-75' : ''}`} />
                     {isAnalyzing && (
                       <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                          <div className="w-full h-1 bg-indigo-500 shadow-[0_0_20px_#6366f1] absolute top-0 animate-[scan_2s_ease-in-out_infinite]"></div>
                       </div>
                     )}
                   </>
                 ) : (
                   <div className="text-center opacity-20"><span className="text-8xl block mb-4">📸</span><p className="text-[10px] font-black uppercase tracking-widest text-white">Déposer la créative</p></div>
                 )}
                 
                 {!isAnalyzing && <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />}
                 
                 {isAnalyzing && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-black/40 backdrop-blur-[2px]">
                      <div className="bg-indigo-600 px-6 py-3 rounded-full text-[9px] font-black text-white uppercase shadow-2xl mb-4 border border-indigo-400">Scan des pixels...</div>
                      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                      </div>
                   </div>
                 )}
              </div>

              <div className="space-y-8">
                 <div className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[2.5rem] shadow-inner space-y-10">
                    <ScoreRow label="🪝 Score d'Arrêt" score={hookScore} isAnalyzing={isAnalyzing} />
                    <ScoreRow label="💡 Clarté Offre" score={offerScore} isAnalyzing={isAnalyzing} />
                    <ScoreRow label="🔥 Désirabilité" score={desirabilityScore} isAnalyzing={isAnalyzing} />
                 </div>
                 <div className="bg-indigo-600 p-10 rounded-[3rem] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-white/10 transition-transform duration-1000 ${isAnalyzing ? 'translate-x-full' : '-translate-x-full'}`}></div>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.4em] mb-4">CTR Théorique Estimé</p>
                    <span className={`text-7xl font-black italic tracking-tighter text-white tabular-nums transition-all ${isAnalyzing ? 'blur-md scale-90 opacity-50' : 'opacity-100'}`}>
                      {creativeResults.estimatedCtr.toFixed(2)}%
                    </span>
                 </div>
              </div>
           </div>

           <div className="bg-indigo-950/20 border border-indigo-500/20 p-10 rounded-[3.5rem] relative overflow-hidden group min-h-[240px] flex items-center">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 w-full text-center md:text-left">
                 <ExpertAvatar className="w-24 h-24 shadow-2xl" />
                 <div className="space-y-4 flex-1">
                    <div>
                       <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-1">Verdict de l'Architecte</h4>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Analyse en temps réel via Gemini 3 Vision Engine.</p>
                    </div>
                    <div className="relative min-h-[60px] flex items-center">
                      {isAnalyzing ? (
                        <div className="flex gap-2">
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                           <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                      ) : (
                        <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed animate-fade-in">
                           "{aiVerdict || "Alexia attend votre visuel pour lancer le diagnostic."}"
                        </p>
                      )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

const ScoreRow = ({ label, score, isAnalyzing }: { label: string, score: number, isAnalyzing: boolean }) => (
  <div className="space-y-4">
     <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <span className={`text-2xl font-black italic text-indigo-400 transition-all ${isAnalyzing ? 'opacity-20 animate-pulse' : 'opacity-100'}`}>{score}/10</span>
     </div>
     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-[1500ms] ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
          style={{ width: isAnalyzing ? '10%' : `${score * 10}%` }}
        ></div>
     </div>
  </div>
);
