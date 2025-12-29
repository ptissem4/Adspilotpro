
import React, { useState, useEffect, useMemo } from 'react';
import { CalculatorInputs, CalculationResults, NicheData, UserProfile, SimulationHistory } from './types.ts';
import { ResultsDisplay } from './components/ResultsDisplay.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { CalculatorForm } from './components/CalculatorForm.tsx';
import { AuthGate } from './components/AuthGate.tsx';
import { SaveAuditModal } from './components/SaveAuditModal.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { Boutique } from './components/Boutique.tsx';
import { UserDashboard, ExpertAvatar } from './components/UserDashboard.tsx';
import { AuthService, AdminService, AuditService } from './services/storage.ts';
import { Logo } from './components/Logo.tsx';

const NICHE_DATA: NicheData[] = [
  { id: 'fashion', label: 'Vêtements / Mode', benchmarkRoas: 2.8, benchmarkCtr: 1.1 },
  { id: 'beauty', label: 'Cosmétiques / Beauté', benchmarkRoas: 3.1, benchmarkCtr: 1.4 },
  { id: 'info', label: 'Infopreneuriat / Coaching', benchmarkRoas: 1.8, benchmarkCtr: 0.8 },
  { id: 'tech', label: 'High-Tech / Gadgets', benchmarkRoas: 2.5, benchmarkCtr: 0.9 },
  { id: 'realestate', label: 'Services / Immobilier', benchmarkRoas: 1.5, benchmarkCtr: 0.5 },
  { id: 'food', label: 'Alimentaire / Boissons', benchmarkRoas: 2.2, benchmarkCtr: 1.0 },
  { id: 'home', label: 'Maison / Décoration', benchmarkRoas: 2.6, benchmarkCtr: 1.0 },
  { id: 'saas', label: 'Logiciels / SaaS B2C', benchmarkRoas: 2.0, benchmarkCtr: 1.2 },
  { id: 'finance', label: 'Services Financiers', benchmarkRoas: 1.5, benchmarkCtr: 0.7 },
  { id: 'other', label: 'Autres / Non Spécifié', benchmarkRoas: 2.0, benchmarkCtr: 0.9 },
];

export default function App() {
  const [appMode, setAppMode] = useState<'home' | 'selection' | 'calculator' | 'analyzing' | 'results' | 'dashboard' | 'admin_dashboard' | 'boutique' | 'user_dashboard'>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(AuthService.getCurrentUser());
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [currentAuditId, setCurrentAuditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authIntent, setAuthIntent] = useState<'dashboard' | 'audit'>('dashboard');
  const [latestAudit, setLatestAudit] = useState<SimulationHistory | null>(null);

  useEffect(() => {
    (window as any).setAppMode = (mode: any) => setAppMode(mode);
  }, []);

  const [inputs, setInputs] = useState<CalculatorInputs>({
    pmv: '', margin: '', targetRoas: '', targetVolume: '', currentCpa: '',
    currentRoas: '', currentBudget: '', currentCtr: '', emqScore: '',
    niche: 'other', ltv: '', creativeFormats: [], dataSource: 'manual', projectName: ''
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        AdminService.getNewLeadsCount().then(setNewLeadsCount).catch(() => {});
      }
      AuditService.getAuditHistory(currentUser.id).then(history => {
        if (history.length > 0) setLatestAudit(history[0]);
      });
    }
  }, [currentUser]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const results: CalculationResults = useMemo(() => {
    const pmv = parseFloat(inputs.pmv) || 0;
    const margin = (parseFloat(inputs.margin) || 0) / 100;
    const targetRoas = parseFloat(inputs.targetRoas) || 1;
    const currentCpa = parseFloat(inputs.currentCpa) || 1;
    const currentBudget = parseFloat(inputs.currentBudget) || 0;
    const ltv = parseFloat(inputs.ltv) || 0;
    const emq = parseFloat(inputs.emqScore) || 0;
    const formats = inputs.creativeFormats || [];
    const selectedNiche = NICHE_DATA.find(n => n.id === inputs.niche) || NICHE_DATA[0];

    const targetCpa = pmv / targetRoas;
    const realMaxCpa = (pmv + ltv) * margin;
    const minWeeklyBudget = targetCpa * 50;
    const budgetHebdo = currentBudget / 4.34;
    const ventesActuellesHebdo = budgetHebdo / currentCpa;
    const ventesCiblesHebdo = budgetHebdo / targetCpa;
    const creativeDiversityScore = (formats.length / 4) * 100;
    const andromedaOptimized = emq >= 8 && formats.length >= 2;
    const currentMonthlyRevenue = ventesActuellesHebdo * pmv * 4.34;
    const tresorerieLatenteHebdo = (currentMonthlyRevenue * 0.15) / 4.34;

    return {
      roasThreshold: margin > 0 ? 1/margin : 0,
      maxCpa: pmv * margin,
      targetCpa,
      minWeeklyBudget,
      budgetGap: minWeeklyBudget - currentBudget,
      nicheRoas: selectedNiche.benchmarkRoas,
      nicheCtr: selectedNiche.benchmarkCtr,
      roasDiffBenchmark: (parseFloat(inputs.currentRoas) - selectedNiche.benchmarkRoas) / selectedNiche.benchmarkRoas,
      roasDiffTarget: parseFloat(inputs.currentRoas) - targetRoas,
      cpaStatus: (currentCpa > (pmv * margin) ? 'bad' : 'good') as 'bad' | 'good',
      realMaxCpa,
      learningPhaseBudget: currentCpa * 50,
      recommendationType: (currentCpa > realMaxCpa ? 'reduce_cpa' : 'scale') as 'reduce_cpa' | 'scale',
      idealLearningCpa: currentBudget / 50,
      cpaReductionPercent: ((currentCpa - targetCpa) / currentCpa) * 100,
      ventesActuellesHebdo,
      ventesCiblesHebdo,
      ventesManquantes: Math.max(0, ventesCiblesHebdo - ventesActuellesHebdo),
      margeInitiale: pmv - currentCpa,
      provisionParClient: ltv - pmv,
      tresorerieLatenteHebdo,
      andromedaOptimized,
      creativeDiversityScore
    };
  }, [inputs]);

  const calculateVerdict = (currentInputs: CalculatorInputs, currentResults: CalculationResults): string => {
    const emq = parseFloat(currentInputs.emqScore) || 0;
    const roas = parseFloat(currentInputs.currentRoas) || 0;
    const latent = currentResults.tresorerieLatenteHebdo || 0;
    if (emq < 6) return 'SIGNAL AVEUGLE';
    if (latent > 500) return 'MARGE À RISQUE';
    if (emq >= 8 && roas > 3) return 'CHAMPION SCALING';
    return 'POTENTIEL SOLIDE';
  };

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    setAppMode('analyzing');
    setLoadingMessage("Audit Andromeda en cours...");
    setCurrentAuditId(null); 
    setTimeout(() => setAppMode('results'), 1500);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setAppMode('home');
  };

  const handleSaveAuditLocally = async (name: string) => {
    if (!currentUser) {
      showNotification("Session expirée. Veuillez vous reconnecter.", "error");
      setAppMode('home');
      return;
    }

    const updatedInputs: CalculatorInputs = { 
      ...inputs, 
      projectName: name,
      name: name,
      type: 'ANDROMEDA'
    };
    
    setIsSaving(true);
    try {
      const verdict = calculateVerdict(updatedInputs, results);
      const savedSim = await AuditService.saveAudit(currentUser, updatedInputs, results, verdict, 'ANDROMEDA', name);
      setLatestAudit(savedSim);
      setIsSaving(false);
      setShowSaveModal(false);
      showNotification("Diagnostic archivé avec succès, Alexia !");
      setAppMode('user_dashboard');
      setTimeout(() => {
          const ev = new CustomEvent('setDashboardTab', { detail: 'history' });
          window.dispatchEvent(ev);
      }, 100);
    } catch (e) {
      setIsSaving(false);
      showNotification("Erreur de sauvegarde", "error");
    }
  };

  const handleAuthenticated = (user: UserProfile) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (authIntent === 'audit') {
      setAppMode('selection');
    } else {
      setAppMode(user.role === 'admin' ? 'admin_dashboard' : 'user_dashboard');
    }
  };

  const handleUpdateCurrentAudit = async () => {
    if (!currentUser || !currentAuditId) return;
    setIsSaving(true);
    try {
      const verdict = calculateVerdict(inputs, results);
      await AuditService.updateAudit(currentAuditId, {
        inputs,
        results,
        verdict_label: verdict,
        date: new Date().toISOString()
      });
      showNotification("Audit mis à jour !");
    } catch (e) {
      showNotification("Erreur de mise à jour", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartIntent = () => {
    if (currentUser) {
      setAppMode('selection');
    } else {
      setAuthIntent('audit');
      setShowAuthModal(true);
    }
  };

  const renderContent = () => {
    if (appMode === 'home') return (
      <div className="flex-1 overflow-y-auto bg-white">
        <LandingPage onStart={handleStartIntent} onBoutique={() => setAppMode('boutique')} onLogin={() => { setAuthIntent('dashboard'); setShowAuthModal(true); }} currentUser={currentUser} onDashboard={() => setAppMode(currentUser?.role === 'admin' ? 'admin_dashboard' : 'user_dashboard')} newLeadsCount={newLeadsCount} />
      </div>
    );

    if (appMode === 'admin_dashboard' && currentUser) return <div className="flex-1 h-full overflow-hidden bg-slate-100"><AdminDashboard adminUser={currentUser} onLogout={handleLogout} /></div>;
    
    if (appMode === 'user_dashboard' && currentUser) return (
      <div className="flex-1 h-full overflow-y-auto bg-slate-950">
        <UserDashboard 
          user={currentUser} 
          latestAudit={latestAudit} 
          onNewAudit={() => setAppMode('selection')}
          onLogout={handleLogout}
          onConsulting={() => window.location.href='mailto:shopiflight@gmail.com?subject=Consulting Stratégique Cockpit'}
          onNotification={showNotification}
        />
      </div>
    );

    if (appMode === 'dashboard' && currentUser) return <div className="flex-1 h-full overflow-hidden bg-slate-50"><Dashboard user={currentUser} onLoadSimulation={(sim) => { setInputs(sim.inputs); setCurrentAuditId(sim.id); setAppMode('results'); }} onNewSimulation={() => { setCurrentAuditId(null); setAppMode('selection'); }} onLogout={handleLogout} onNotification={showNotification} onGoToBoutique={() => setAppMode('boutique')} /></div>;

    if (appMode === 'boutique') return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {renderNav()}
        <main className="flex-1 overflow-y-auto scroll-smooth"><Boutique onNotification={showNotification} /></main>
      </div>
    );

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {renderNav()}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {appMode === 'results' && (
            <aside className="w-full lg:w-[380px] bg-white border-b lg:border-r border-slate-200 flex flex-col no-print h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <CalculatorForm mode="live" inputs={inputs} onInputChange={(field, value) => setInputs(prev => ({...prev, [field]: value}))} errors={{}} nicheData={NICHE_DATA} isApiMode={false} />
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                <button onClick={currentAuditId ? handleUpdateCurrentAudit : () => setShowSaveModal(true)} disabled={isSaving} className={`w-full text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 ${currentAuditId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>{currentAuditId ? '💾 Sauvegarder' : '📁 Enregistrer'}</span>}
                </button>
              </div>
            </aside>
          )}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            <div className="p-4 md:p-10">
              {appMode === 'results' ? <ResultsDisplay results={results} inputs={inputs} onShowGuide={() => setShowSaveModal(true)} /> : appMode === 'selection' ? <div className="max-w-md mx-auto py-20 text-center animate-fade-in"><Logo className="justify-center mb-12" /><h2 className="text-4xl font-black mb-10 tracking-tighter uppercase italic">Audit AdsPilot Pro</h2><div className="flex flex-col gap-[15px]"><button onClick={() => setAppMode('calculator')} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Saisie Manuelle &rarr;</button></div></div> : appMode === 'analyzing' ? <div className="flex flex-col items-center justify-center h-full text-center py-40"><div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div><p className="text-xl font-black uppercase tracking-widest text-indigo-600">{loadingMessage}</p></div> : <div className="max-w-5xl mx-auto py-10"><CalculatorForm mode="initial" inputs={inputs} onInputChange={(field, value) => setInputs(prev => ({...prev, [field]: value}))} onValidate={handleStartAnalysis} errors={{}} nicheData={NICHE_DATA} isApiMode={false} /></div>}
            </div>
          </main>
        </div>
      </div>
    );
  };

  const renderNav = () => (
    <nav className={`h-20 border-b px-6 md:px-12 flex items-center justify-between shrink-0 z-50 no-print transition-colors ${appMode === 'user_dashboard' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-6"><button onClick={() => setAppMode('home')} className="hover:scale-105 transition-transform"><Logo iconOnly className="scale-75" /></button></div>
      <div className="flex items-center gap-4">
        <button onClick={() => setAppMode('boutique')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${appMode === 'user_dashboard' ? 'text-slate-500 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>💎 Boutique</button>
        {currentUser ? (
          <div className="flex items-center gap-4">
             <button onClick={() => setAppMode('user_dashboard')} className={`hidden md:block px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${appMode === 'user_dashboard' ? 'text-indigo-400 font-black underline decoration-2' : 'text-slate-400 hover:text-indigo-600'}`}>🚀 Cockpit Stratégique</button>
             <div className="flex items-center gap-3">
                <button onClick={() => setAppMode(currentUser.role === 'admin' ? 'admin_dashboard' : 'dashboard')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${appMode === 'user_dashboard' ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'}`}>
                  {currentUser.role === 'admin' ? '👑 Admin' : '📊 Archives'}
                </button>
                <ExpertAvatar className="w-8 h-8" neon={appMode === 'user_dashboard'} />
             </div>
          </div>
        ) : (
          <button onClick={() => { setAuthIntent('dashboard'); setShowAuthModal(true); }} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Connexion</button>
        )}
      </div>
    </nav>
  );

  return (
    <div className={`h-screen flex flex-col overflow-hidden relative ${appMode === 'user_dashboard' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-[1.5rem] shadow-2xl bg-slate-900 text-white border border-slate-700 animate-fade-in flex items-center gap-4">
          <ExpertAvatar className="w-8 h-8" neon={false} />
          <span className="font-black text-[11px] uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}
      {showAuthModal && <AuthGate onAuthenticated={handleAuthenticated} onCancel={() => setShowAuthModal(false)} defaultView={authIntent === 'audit' ? 'signup' : 'login'} />}
      {showSaveModal && <SaveAuditModal initialName={inputs.projectName} loading={isSaving} isGuest={!currentUser} onCancel={() => setShowSaveModal(false)} onSave={handleSaveAuditLocally} />}
      {renderContent()}
    </div>
  );
}
