
import React, { useState, ChangeEvent } from 'react';
import { ExpertAvatar } from './UserDashboard';
import { VisionService } from '../services/genai';
import { AuthService, AuditService } from '../services/storage';
import { CalculatorInputs, CalculationResults } from '../types';

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

export const CreativeAudit = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [checklistData, setChecklistData] = useState<any>(null);
  const [scores, setScores] = useState({ hook: 0, offer: 0, desire: 0 });
  const [verdict, setVerdict] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        runAnalysis(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setScanProgress(0);
    
    // Animation fake
    const interval = setInterval(() => {
      setScanProgress(prev => (prev < 90 ? prev + 5 : prev));
    }, 150);

    try {
      const pureBase64 = base64.split(',')[1];
      const result = await VisionService.analyzeCreative(pureBase64, mimeType);
      
      clearInterval(interval);
      setScanProgress(100);
      
      // Update state
      setScores({
        hook: result.hookScore,
        offer: result.offerScore,
        desire: result.desirabilityScore
      });
      setChecklistData(result.checklist);
      setVerdict(result.verdict);

      // Save to history
      saveAuditToHistory(base64, result);
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Échec de l'analyse Vision. Réessayez.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAuditToHistory = async (image: string, data: any) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    // Calcul d'un "CTR estimé" basé sur les scores
    const avgScore = (data.hookScore + data.offerScore + data.desirabilityScore) / 3;
    const estimatedCtr = (0.5 + (avgScore / 10) * 2.5).toFixed(2); // Entre 0.5% et 3.0%
    const emq = avgScore.toFixed(1);

    // Comptage checklist
    let checkCount = 0;
    Object.values(data.checklist).forEach(v => { if(v) checkCount++; });

    const inputs: CalculatorInputs = {
      name: `Scan Vision ${new Date().toLocaleTimeString()}`,
      type: 'CREATIVE',
      creativeImageUrl: image,
      creativeHookScore: data.hookScore,
      creativeOfferScore: data.offerScore,
      creativeDesirabilityScore: data.desirabilityScore,
      checklistScore: checkCount,
      currentCtr: estimatedCtr,
      emqScore: emq,
      // Champs obligatoires dummy
      pmv: '0', margin: '0', targetRoas: '0', targetVolume: '0', currentCpa: '0', currentRoas: '0', 
      currentBudget: '0', niche: 'other', ltv: '0', creativeFormats: [], dataSource: 'manual'
    };

    const dummyResults: CalculationResults = {
      roasThreshold: 0, maxCpa: 0, targetCpa: 0, minWeeklyBudget: 0, budgetGap: 0, nicheRoas: 0, nicheCtr: 0,
      roasDiffBenchmark: 0, roasDiffTarget: 0, cpaStatus: 'good', realMaxCpa: 0, learningPhaseBudget: 0,
      recommendationType: 'optimize', idealLearningCpa: 0, cpaReductionPercent: 0, ventesActuellesHebdo: 0,
      ventesCiblesHebdo: 0, ventesManquantes: 0, margeInitiale: 0, provisionParClient: 0, tresorerieLatenteHebdo: 0,
      andromedaOptimized: false, creativeDiversityScore: 0
    };

    await AuditService.saveAudit(user, inputs, dummyResults, data.verdict, 'CREATIVE', inputs.name || 'Vision Scan');
    
    // Déclenche le rafraîchissement de l'historique dans le dashboard parent
    window.dispatchEvent(new Event('auditSaved'));
  };

  if (!imagePreview) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed border-indigo-500/30 rounded-[3rem] bg-indigo-50/5 relative group cursor-pointer hover:bg-indigo-50/10 transition-all">
        <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
        <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-8 group-hover:scale-110 transition-transform">
          <span className="text-4xl">📸</span>
        </div>
        <h3 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter">Déposer votre Créative</h3>
        <p className="text-slate-500 font-medium italic mt-2">L'IA Vision attend votre fichier (JPG, PNG)</p>
        {errorMsg && <p className="mt-6 text-red-500 font-bold bg-red-500/10 px-4 py-2 rounded-xl">{errorMsg}</p>}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-full">
      {/* GAUCHE : VISUEL + SCANNER */}
      <div className="relative rounded-[3rem] overflow-hidden border border-slate-700 bg-black flex items-center justify-center group">
        <img src={imagePreview} className={`w-full h-full object-contain transition-all duration-700 ${isAnalyzing ? 'opacity-50 blur-sm scale-105' : ''}`} alt="Upload" />
        
        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
             <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
               <div className="h-full bg-indigo-500 transition-all duration-200 ease-out" style={{ width: `${scanProgress}%` }}></div>
             </div>
             <p className="text-indigo-400 font-black uppercase tracking-widest text-xs animate-pulse">Analyse Vision en cours...</p>
             
             {/* Scanner effect line */}
             <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,1)] animate-[scan_2s_infinite]"></div>
          </div>
        )}

        {!isAnalyzing && (
          <div className="absolute bottom-6 left-6 right-6">
             <label className="w-full bg-slate-900/90 backdrop-blur-md text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-indigo-600 transition-all cursor-pointer flex items-center justify-center">
               Scanner une autre image
               <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
             </label>
          </div>
        )}
      </div>

      {/* DROITE : RÉSULTATS */}
      <div className="space-y-8 overflow-y-auto pr-2 scrollbar-hide">
        {verdict ? (
          <>
             {/* VERDICT CARD */}
             <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <ExpertAvatar className="w-10 h-10" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Verdict Architecte</span>
                   </div>
                   <p className="text-xl font-bold italic leading-relaxed">"{verdict}"</p>
                </div>
                <div className="absolute -bottom-10 -right-10 text-9xl opacity-10 rotate-12">👁️</div>
             </div>

             {/* SCORES GRID */}
             <div className="grid grid-cols-3 gap-4">
                <ResultScore label="Hook" score={scores.hook} color="text-amber-400" />
                <ResultScore label="Offre" score={scores.offer} color="text-indigo-400" />
                <ResultScore label="Désir" score={scores.desire} color="text-emerald-400" />
             </div>

             {/* CHECKLIST */}
             <div className="bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Conformité Protocole</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   {CHECKLIST_ITEMS.map((item) => {
                      const isValid = checklistData && checklistData[item.id];
                      return (
                        <div key={item.id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${isValid ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 bg-transparent'}`}>
                                 {isValid && <span className="text-[8px] text-white font-black">✓</span>}
                              </div>
                              <span className={`text-[10px] font-bold uppercase ${isValid ? 'text-slate-200' : 'text-slate-600'}`}>{item.label}</span>
                           </div>
                        </div>
                      );
                   })}
                </div>
             </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
             <div className="text-6xl mb-4">🔮</div>
             <p className="text-slate-400 font-medium italic">En attente du signal visuel...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultScore = ({ label, score, color }: { label: string, score: number, color: string }) => (
  <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
     <span className={`text-3xl font-black italic ${color}`}>{score}<span className="text-sm opacity-50">/10</span></span>
  </div>
);
