
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, SimulationHistory, CalculatorInputs, CalculationResults } from '../types.ts';
import { AuditService, AuthService } from '../services/storage.ts';
import { supabase } from '../services/supabase.ts';
import { ResultsDisplay } from './ResultsDisplay.tsx';
import { CreativeAudit } from './CreativeAudit.tsx';
import { CreativeResultDisplay } from './CreativeResultDisplay.tsx';
import { CalculatorForm } from './CalculatorForm.tsx';
import { Logo } from './Logo.tsx';
import { NICHE_DATA } from '../App.tsx';

interface UserDashboardProps {
  user: UserProfile;
  latestAudit: SimulationHistory | null;
  onNewAudit: () => void;
  onConsulting: () => void;
  onLogout: () => void;
  onNotification?: (msg: string, type?: 'success' | 'error') => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

type DashboardTab = 'cockpit' | 'history' | 'creative' | 'business' | 'selection' | 'andromeda' | 'analyzing' | 'oracle' | 'mercury' | 'atlas';
type AuditFilter = 'ALL' | 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS';

const BUDGET_MIN = 10;
const BUDGET_MAX = 1000000;

const budgetToPosition = (val: number) => {
  return (Math.log10(val) - Math.log10(BUDGET_MIN)) / (Math.log10(BUDGET_MAX) - Math.log10(BUDGET_MIN)) * 100;
};
const positionToBudget = (pos: number) => {
  const min = BUDGET_MIN;
  const max = BUDGET_MAX;
  const val = Math.round(min * Math.pow(10, (pos / 100) * (Math.log10(max) - Math.log10(min))));
  return val > 10000 ? Math.round(val / 1000) * 1000 : val;
};

export const ExpertAvatar = ({ className = "w-10 h-10", neon = true }: { className?: string, neon?: boolean }) => (
  <div className={`relative ${className} group shrink-0`}>
    {neon && <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm group-hover:bg-indigo-500/40 transition-all"></div>}
    <div className={`relative w-full h-full bg-slate-800 rounded-xl border-2 ${neon ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-slate-700'} flex items-center justify-center overflow-hidden`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
        <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="currentColor" className="text-indigo-400" />
        <path d="M12 13C9.23858 13 7 15.2386 7 18V19H17V18C17 15.2386 14.7614 13 12 13Z" fill="currentColor" className="text-indigo-400" />
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500/30" />
      </svg>
    </div>
  </div>
);

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, latestAudit, onNewAudit, onConsulting, onLogout, onNotification, theme = 'dark', onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('cockpit');
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState<SimulationHistory | null>(null);
  const [historyFilter, setHistoryFilter] = useState<AuditFilter>('ALL');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [businessData, setBusinessData] = useState({
    brand_name: user.brand_name || '',
    website_url: user.website_url || '',
    niche: user.niche || 'other',
    target_cpa: user.target_cpa || 25,
    full_name: user.full_name || ''
  });

  const [simPrice, setSimPrice] = useState(75);
  const [simBudget, setSimBudget] = useState(5000);
  const [simCtr, setSimCtr] = useState(1.2);
  const [simCpm, setSimCpm] = useState(10);
  const [simCogs, setSimCogs] = useState(25);
  const [simShipping, setSimShipping] = useState(5);
  const [simFixedCosts, setSimFixedCosts] = useState(500);
  const [simRetention, setSimRetention] = useState(15);

  const isDark = theme === 'dark';

  const filteredHistory = useMemo(() => {
    if (historyFilter === 'ALL') return history;
    return history.filter(audit => audit.type === historyFilter);
  }, [history, historyFilter]);

  const historyStats = useMemo(() => {
    return {
      ALL: history.length,
      ANDROMEDA: history.filter(a => a.type === 'ANDROMEDA').length,
      CREATIVE: history.filter(a => a.type === 'CREATIVE').length,
      ORACLE: history.filter(a => a.type === 'ORACLE').length,
      MERCURY: history.filter(a => a.type === 'MERCURY').length,
      ATLAS: history.filter(a => a.type === 'ATLAS').length,
    };
  }, [history]);

  const [moduleInputs, setModuleInputs] = useState<CalculatorInputs>({
    pmv: '75', margin: '60', targetRoas: '2.5', targetVolume: '50', currentCpa: '35',
    currentRoas: '2.1', currentBudget: '5000', currentCtr: '1.2', emqScore: '7',
    niche: 'other', ltv: '120', creativeFormats: [], dataSource: 'manual', projectName: '',
    retentionRate: '15', loadTime: '2.5', atcRate: '4.5', abandonmentRate: '75',
    stockLevel: '500', leadTimeDays: '14'
  });

  const dummyResults: CalculationResults = {
    roasThreshold: 2.5, maxCpa: 40, targetCpa: 30, minWeeklyBudget: 1000, budgetGap: 0, nicheRoas: 2.5, nicheCtr: 1.2, 
    roasDiffBenchmark: 0, roasDiffTarget: 0, cpaStatus: 'good', realMaxCpa: 50, learningPhaseBudget: 500, 
    recommendationType: 'scale', idealLearningCpa: 25, cpaReductionPercent: 15, ventesActuellesHebdo: 50, 
    ventesCiblesHebdo: 75, ventesManquantes: 25, margeInitiale: 15, provisionParClient: 20, tresorerieLatenteHebdo: 500, 
    andromedaOptimized: true, creativeDiversityScore: 100 
  };

  const loadHistory = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const sims = await AuditService.getAuditHistory(user.id);
      setHistory(sims);
    } finally { if (!silent) setLoading(false); }
  };

  useEffect(() => { 
    loadHistory(); 
    
    // Écouteur pour rafraîchir quand un audit est sauvegardé depuis un module
    const handleRefresh = () => loadHistory(true);
    window.addEventListener('auditSaved', handleRefresh);
    
    const channel = supabase.channel(`sync_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audits', filter: `user_id=eq.${user.id}` }, 
      () => loadHistory(true)).subscribe();
      
    return () => { 
      window.removeEventListener('auditSaved', handleRefresh);
      supabase.removeChannel(channel); 
    };
  }, [user.id]);

  useEffect(() => {
    const handleTabSwitch = (e: any) => { if (e.detail) { setActiveTab(e.detail); setIsMobileMenuOpen(false); } };
    window.addEventListener('setDashboardTab', handleTabSwitch);
    return () => window.removeEventListener('setDashboardTab', handleTabSwitch);
  }, []);

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await AuditService.deleteAudit(id);
      setHistory(prev => prev.filter(a => a.id !== id));
      if (viewingReport?.id === id) setViewingReport(null);
      if (onNotification) onNotification("Audit supprimé avec succès, Alexia", "success");
    } catch (err) {
      if (onNotification) onNotification("Erreur lors de la suppression.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAndromedaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pmv = parseFloat(moduleInputs.pmv) || 1;
      const margin = (parseFloat(moduleInputs.margin) || 0) / 100;
      const ltv = parseFloat(moduleInputs.ltv) || pmv;
      const results: CalculationResults = { ...dummyResults, roasThreshold: 1 / (margin || 1), maxCpa: pmv * margin, realMaxCpa: ltv * margin };
      const audit = await AuditService.saveAudit(user, moduleInputs, results, "Signal Champion", 'ANDROMEDA', moduleInputs.projectName || "Audit Andromeda");
      setViewingReport(audit);
      loadHistory(true);
    } finally { setLoading(false); }
  };

  const handleOracleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const pmv = parseFloat(moduleInputs.pmv) || 1;
      const retention = parseFloat(moduleInputs.retentionRate || '0') / 100;
      const ltv = pmv * (1 / (1 - retention));
      const results: CalculationResults = { ...dummyResults, calculatedLtv: ltv };
      const audit = await AuditService.saveAudit(user, moduleInputs, results, "LTV OPTIMISÉE", 'ORACLE', "Audit Oracle - LTV");
      setViewingReport(audit);
      loadHistory(true);
    } finally { setLoading(false); }
  };

  const handleMercurySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const atc = parseFloat(moduleInputs.atcRate || '0');
      const abandon = parseFloat(moduleInputs.abandonmentRate || '0');
      const results: CalculationResults = { ...dummyResults, conversionScore: atc < 3 ? 2 : 8, frictionRate: abandon };
      const audit = await AuditService.saveAudit(user, moduleInputs, results, atc < 1.5 ? "ENTONNOIR PERCÉ" : "CONVERSION STABLE", 'MERCURY', "Audit Mercury - CRO");
      setViewingReport(audit);
      loadHistory(true);
    } finally { setLoading(false); }
  };

  const handleAtlasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stock = parseFloat(moduleInputs.stockLevel || '0');
      const budget = parseFloat(moduleInputs.targetVolume || '0');
      const results: CalculationResults = { ...dummyResults, scalingSolidarity: budget > stock ? 3 : 9, daysToStockout: stock / (budget / 7 || 1) };
      const audit = await AuditService.saveAudit(user, moduleInputs, results, "SOLIDITÉ DE L'EMPIRE", 'ATLAS', "Audit Atlas - Scaling");
      setViewingReport(audit);
      loadHistory(true);
    } finally { setLoading(false); }
  };

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.updateBusiness(user.id, {
        brand_name: businessData.brand_name,
        website_url: businessData.website_url,
        niche: businessData.niche,
        target_cpa: parseFloat(businessData.target_cpa.toString()),
        full_name: businessData.full_name
      });
      if (onNotification) onNotification("Infrastructure de l'Empire synchronisée, Alexia", "success");
    } catch (err) {
      if (onNotification) onNotification("Échec de la synchronisation business", "error");
    } finally {
      setLoading(false);
    }
  };

  const simulation = useMemo(() => {
    const [p, b, c, cp, cg, sh, fc] = [simPrice, simBudget, simCtr, simCpm, simCogs, simShipping, simFixedCosts];
    const orders = ((b / cp) * 1000 * (c / 100)) * (2.8 / 100);
    const revenue = orders * p; 
    const netProfit = (revenue - (orders * cg) - (orders * sh) - (revenue * 0.03)) - b - fc;
    return { revenue, netProfit, currentRoas: revenue / (b || 1), breakevenRoas: (b + fc + (orders * cg) + (orders * sh) + (revenue * 0.03)) / (b || 1), orders, isLoss: netProfit <= 0, targetCpa: (p - cg) / ((revenue / (b || 1)) || 1) };
  }, [simBudget, simPrice, simCtr, simCpm, simCogs, simShipping, simFixedCosts]);

  const radarMetrics = useMemo(() => [
    Math.min(Math.max((simulation.netProfit / (simulation.revenue || 1)) * 40, 0), 10),
    Math.min(Math.max(10 - (simulation.breakevenRoas / 2), 0), 10),
    Math.min(simCtr * 4, 10),
    Math.min(simRetention / 2, 10),
    parseFloat(latestAudit?.inputs.emqScore || '6')
  ], [simulation, simCtr, simRetention, latestAudit]);

  const formatCurrency = (val: number, compact = false) => {
    if (compact && Math.abs(val) >= 1000000) {
      return (val / 1000000).toFixed(1).replace('.', ',') + 'M €';
    }
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);
  };

  const getModuleBadge = (type: string) => {
    switch (type) {
      case 'CREATIVE': return { label: '🎨 VISION', color: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' };
      case 'ORACLE': return { label: '🔮 ORACLE', color: 'bg-violet-600/10 text-violet-400 border-violet-500/20' };
      case 'MERCURY': return { label: '🔵 MERCURY', color: 'bg-blue-600/10 text-blue-400 border-blue-500/20' };
      case 'ATLAS': return { label: '🌍 ATLAS', color: 'bg-amber-600/10 text-amber-400 border-amber-500/20' };
      default: return { label: '📊 ANDROMEDA', color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const SidebarItem = ({ icon, label, active = false, isDark = true, onClick }: { icon: string; label: string; active?: boolean; isDark?: boolean; onClick?: () => void }) => (
    <button onClick={onClick} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 border ${active ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500 shadow-sm' : (isDark ? 'text-slate-400 border-transparent hover:bg-white/5' : 'text-slate-500 border-transparent hover:bg-slate-50')}`}>
       <span className="text-lg">{icon}</span>{label}
    </button>
  );

  return (
    <div className={`flex flex-col md:flex-row h-screen transition-colors duration-500 ${isDark ? 'bg-[#050505] text-slate-100' : 'bg-[#F9FAFB] text-[#0F172A]'} font-sans overflow-hidden`}>
      <aside className={`hidden md:flex w-64 border-r ${isDark ? 'border-white/5 bg-[#080808]' : 'border-[#E2E8F0] bg-white shadow-2xl shadow-slate-200/50'} flex-col shrink-0 z-40`}>
         <div className="p-8 flex-1 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-base">🚀</span>
               </div>
               <span className={`text-xl font-black tracking-tighter uppercase italic ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>AdsPilot <span className="text-indigo-500">Pro</span></span>
            </div>
            <nav className="space-y-2 flex-1">
               <SidebarItem icon="📊" label="Cockpit P&L" active={activeTab === 'cockpit'} isDark={isDark} onClick={() => setActiveTab('cockpit')} />
               <SidebarItem icon="✨" label="Lancer Audit" active={activeTab === 'selection' || activeTab === 'andromeda' || activeTab === 'creative' || activeTab === 'oracle' || activeTab === 'mercury' || activeTab === 'atlas'} isDark={isDark} onClick={() => setActiveTab('selection')} />
               <SidebarItem icon="📂" label="Mes Audits" active={activeTab === 'history'} isDark={isDark} onClick={() => setActiveTab('history')} />
               <SidebarItem icon="🏢" label="Mon Business" active={activeTab === 'business'} isDark={isDark} onClick={() => setActiveTab('business')} />
            </nav>
            <button onClick={onLogout} className="mt-8 w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400">🚪 Déconnexion</button>
         </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
         <header className={`hidden md:flex h-24 px-12 border-b ${isDark ? 'border-white/5 bg-[#050505]/90' : 'border-[#E2E8F0] bg-white/90'} backdrop-blur-xl items-center justify-between shrink-0 z-30`}>
            <div className="flex items-center gap-4">
              <ExpertAvatar />
              <h2 className={`text-[10px] font-black italic uppercase tracking-[0.4em] ${isDark ? 'text-slate-500' : 'text-[#0F172A]'}`}>
                 {activeTab === 'business' ? "MON BUSINESS" : activeTab === 'history' ? "MES AUDITS" : "PILOTAGE STRATÉGIQUE"}
              </h2>
            </div>
            <div className="flex items-center gap-6">
               <button onClick={onToggleTheme} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-amber-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {isDark ? '☀️' : '🌙'}
               </button>
               <button onClick={() => setActiveTab('selection')} className="bg-indigo-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-slate-900 transition-all shadow-xl">Nouveau Diagnostic &rarr;</button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'selection' ? (
              <div className="p-8 md:p-16 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                 <ModuleCard title="Module Andromeda" desc="Analyse P&L & CPA Max." color="emerald" isDark={isDark} onClick={() => setActiveTab('andromeda')} />
                 <ModuleCard title="Module Vision" desc="Scan Créatif AI." color="indigo" isDark={isDark} onClick={() => setActiveTab('creative')} />
                 <ModuleCard title="Module Oracle" desc="Audit Rétention & LTV." color="violet" isDark={isDark} onClick={() => setActiveTab('oracle')} />
                 <ModuleCard title="Module Mercury" desc="Scan Conversion & CRO." color="blue" isDark={isDark} onClick={() => setActiveTab('mercury')} />
                 <ModuleCard title="Module Atlas" desc="Test de Scalabilité." color="amber" isDark={isDark} onClick={() => setActiveTab('atlas')} />
              </div>
            ) : activeTab === 'cockpit' ? (
              <div className="p-6 md:p-12 animate-fade-in space-y-12 pb-32 w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <ResultCard label="Profit Net Réel" value={formatCurrency(simulation.netProfit, true)} highlight={simulation.isLoss ? 'danger' : 'success'} sub="Mensuel estimé" extra={`CPA CIBLE : ${formatCurrency(simulation.targetCpa)}`} isDark={isDark} />
                   <ResultCard label="ROAS Point Mort" value={`${simulation.breakevenRoas.toFixed(2)}x`} highlight="indigo" sub="Seuil de rentabilité" isDark={isDark} />
                   <ResultCard label="Commandes / Mois" value={simulation.orders.toFixed(0)} highlight="none" sub="Volume de transactions" extra={`CA TOTAL : ${formatCurrency(simulation.revenue, true)}`} isDark={isDark} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                   <div className={`${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-[#E2E8F0] shadow-xl shadow-slate-200/50'} border p-12 rounded-[3.5rem] space-y-10`}>
                      <h3 className={`text-xl font-black uppercase italic border-b pb-6 ${isDark ? 'text-indigo-400 border-white/10' : 'text-indigo-600 border-slate-100'}`}>Hardcore Simulator</h3>
                      <div className="space-y-12">
                        <SimInput label="Prix de Vente" valueRaw={simPrice} unit="€" min={0} max={10000} step={1} onChange={setSimPrice} icon="🏷️" isDark={isDark} />
                        <SimInput label="Budget Mensuel" value={simBudget} unit="€" min={0} max={100} step={0.1} isLog onChange={(pos: number) => setSimBudget(positionToBudget(pos))} icon="💰" displayVal={formatCurrency(simBudget)} isDark={isDark} />
                        <SimInput label="CTR (Scan Créa)" valueRaw={simCtr} unit="%" min={0.1} max={10} step={0.1} onChange={setSimCtr} icon="🎨" isDark={isDark} />
                        <SimInput label="Coût Produit (COGS)" valueRaw={simCogs} unit="€" min={0} max={5000} step={1} onChange={setSimCogs} icon="🛠️" isDark={isDark} />
                        <SimInput label="Rétention Client" valueRaw={simRetention} unit="%" min={0} max={100} step={1} onChange={setSimRetention} icon="💎" isDark={isDark} />
                      </div>
                   </div>
                   <div className={`${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-[#E2E8F0] shadow-xl shadow-slate-200/50'} border p-12 rounded-[3.5rem] flex flex-col items-center justify-center gap-10 min-h-[600px]`}>
                      <h3 className={`text-2xl font-black uppercase italic self-start ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Radar <span className={isDark ? "text-white" : "text-[#0F172A]"}>Empire</span></h3>
                      <div className="w-full aspect-square max-w-[420px]">
                         <RadarChart metrics={radarMetrics} labels={['PROFIT', 'SCALE', 'CRÉA', 'LTV', 'DATA']} isDark={isDark} />
                      </div>
                   </div>
                </div>
              </div>
            ) : activeTab === 'business' ? (
              <div className="p-8 md:p-16 max-w-5xl mx-auto animate-fade-in space-y-12 pb-32">
                 <div className="flex flex-col gap-6">
                    <h1 className={`text-5xl md:text-7xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>MON <span className="text-indigo-500">BUSINESS</span></h1>
                    <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium italic`}>Configurez votre infrastructure stratégique pour des diagnostics ultra-précis.</p>
                 </div>

                 <form onSubmit={handleUpdateBusiness} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4 space-y-8">
                       <div className={`${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200 shadow-xl'} border p-8 rounded-[3rem] text-center space-y-6`}>
                          <div className="flex justify-center"><ExpertAvatar className="w-24 h-24 shadow-2xl" /></div>
                          <div className="space-y-1">
                             <h4 className="text-xl font-black uppercase italic tracking-tight">{businessData.full_name || 'Utilisateur AdsPilot'}</h4>
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.email}</p>
                          </div>
                          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Rôle Système</p>
                             <p className="text-[10px] font-black uppercase text-indigo-500 italic tracking-widest">{user.role === 'admin' ? '🏰 GOUVERNEUR' : '🛡️ ARCHITECTE'}</p>
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Membre depuis {new Date(user.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                       <div className={`${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-slate-200 shadow-xl'} border p-10 rounded-[3.5rem] space-y-10`}>
                          <h3 className="text-xl font-black uppercase italic border-b border-indigo-500/20 pb-4 text-indigo-400">Paramètres de l'Empire</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Nom de l'E-shop / Marque</label>
                                <input type="text" value={businessData.brand_name} onChange={(e) => setBusinessData(p => ({...p, brand_name: e.target.value}))} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-[#E2E8F0] text-[#0F172A]'}`} placeholder="Ma Super Marque" />
                             </div>
                             <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>URL du Site (Lien direct)</label>
                                <input type="url" value={businessData.website_url} onChange={(e) => setBusinessData(p => ({...p, website_url: e.target.value}))} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-[#E2E8F0] text-[#0F172A]'}`} placeholder="https://maboutique.com" />
                             </div>
                             <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Secteur (Niche)</label>
                                <select value={businessData.niche} onChange={(e) => setBusinessData(p => ({...p, niche: e.target.value}))} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-[#E2E8F0] text-[#0F172A]'}`}>
                                   {NICHE_DATA.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>CPA Cible Idéal (€)</label>
                                <input type="number" step="1" value={businessData.target_cpa} onChange={(e) => setBusinessData(p => ({...p, target_cpa: parseFloat(e.target.value)}))} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-[#E2E8F0] text-[#0F172A]'}`} />
                             </div>
                          </div>

                          <div className="pt-6 border-t border-white/5">
                             <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                                {loading ? "SYNCHRONISATION..." : "SAUVEGARDER LES PARAMÈTRES BUSINESS &rarr;"}
                             </button>
                          </div>
                       </div>
                    </div>
                 </form>
              </div>
            ) : activeTab === 'creative' ? (
              <div className="p-8 md:p-16 max-w-7xl mx-auto animate-fade-in"><CreativeAudit /></div>
            ) : activeTab === 'mercury' ? (
              <div className="p-8 md:p-16 max-w-3xl mx-auto animate-fade-in">
                 <form onSubmit={handleMercurySubmit} className={`${isDark ? 'bg-[#0A0A0A] border-blue-500/20' : 'bg-white border-blue-200 shadow-xl'} border p-12 rounded-[4rem] space-y-10`}>
                    <div className="flex items-center gap-4 mb-4">
                       <span className="text-4xl">🔵</span>
                       <div>
                          <h3 className="text-3xl font-black text-blue-600 uppercase italic leading-none">Module Mercury</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Diagnostic Conversion & Vitesse</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <SimField label="Taux d'Ajout au Panier (%)" value={moduleInputs.atcRate || ''} onChange={(v: string) => setModuleInputs(p => ({...p, atcRate: v}))} isDark={isDark} />
                       <SimField label="Taux d'Abandon Panier (%)" value={moduleInputs.abandonmentRate || ''} onChange={(v: string) => setModuleInputs(p => ({...p, abandonmentRate: v}))} isDark={isDark} />
                       <SimField label="Temps de Chargement Mobile (s)" value={moduleInputs.loadTime || ''} onChange={(v: string) => setModuleInputs(p => ({...p, loadTime: v}))} isDark={isDark} />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 py-6 rounded-2xl font-black text-xs uppercase text-white hover:bg-blue-700 transition-all shadow-xl">Lancer Diagnostic Mercury &rarr;</button>
                 </form>
              </div>
            ) : activeTab === 'atlas' ? (
              <div className="p-8 md:p-16 max-w-3xl mx-auto animate-fade-in">
                 <form onSubmit={handleAtlasSubmit} className={`${isDark ? 'bg-[#0A0A0A] border-amber-500/20' : 'bg-white border-amber-200 shadow-xl'} border p-12 rounded-[4rem] space-y-10`}>
                    <div className="flex items-center gap-4 mb-4">
                       <span className="text-4xl">🌍</span>
                       <div>
                          <h3 className="text-3xl font-black text-amber-600 uppercase italic leading-none">Module Atlas</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Test de Scalabilité & Logistique</p>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <SimField label="Niveau de Stock actuel (Unités)" value={moduleInputs.stockLevel || ''} onChange={(v: string) => setModuleInputs(p => ({...p, stockLevel: v}))} isDark={isDark} />
                       <SimField label="Volume de ventes cibles (Hebdo)" value={moduleInputs.targetVolume || ''} onChange={(v: string) => setModuleInputs(p => ({...p, targetVolume: v}))} isDark={isDark} />
                       <SimField label="Délai de réapprovisionnement (Jours)" value={moduleInputs.leadTimeDays || ''} onChange={(v: string) => setModuleInputs(p => ({...p, leadTimeDays: v}))} isDark={isDark} />
                    </div>
                    <button type="submit" className="w-full bg-amber-600 py-6 rounded-2xl font-black text-xs uppercase text-white hover:bg-amber-700 transition-all shadow-xl">Lancer Diagnostic Atlas &rarr;</button>
                 </form>
              </div>
            ) : activeTab === 'andromeda' ? (
              <div className="p-12 md:p-16 max-w-5xl mx-auto animate-fade-in">
                 <CalculatorForm mode="initial" inputs={moduleInputs} onInputChange={(f, v) => setModuleInputs(prev => ({...prev, [f]: v}))} onValidate={handleAndromedaSubmit} errors={formErrors} nicheData={NICHE_DATA} isApiMode={false} />
              </div>
            ) : activeTab === 'oracle' ? (
              <div className="p-12 md:p-16 max-w-2xl mx-auto animate-fade-in">
                 <form onSubmit={handleOracleSubmit} className={`${isDark ? 'bg-[#0A0A0A] border-violet-500/20' : 'bg-white border-violet-200 shadow-xl'} border p-12 rounded-[4rem] space-y-8`}>
                    <h3 className="text-2xl font-black text-violet-400 uppercase italic">Module Oracle</h3>
                    <div className="space-y-6">
                       <SimField label="Taux de rachat client (%)" value={moduleInputs.retentionRate || ''} onChange={(v: string) => setModuleInputs(p => ({...p, retentionRate: v}))} isDark={isDark} />
                       <SimField label="Panier Moyen (€)" value={moduleInputs.pmv} onChange={(v: string) => setModuleInputs(p => ({...p, pmv: v}))} isDark={isDark} />
                       <SimField label="CPA Moyen Actuel (€)" value={moduleInputs.currentCpa} onChange={(v: string) => setModuleInputs(p => ({...p, currentCpa: v}))} isDark={isDark} />
                    </div>
                    <button type="submit" className="w-full bg-violet-600 py-5 rounded-2xl font-black text-xs uppercase text-white hover:bg-violet-700 transition-all">Lancer Diagnostic Oracle &rarr;</button>
                 </form>
              </div>
            ) : activeTab === 'history' ? (
              <div className="p-6 md:p-16 animate-fade-in w-full space-y-12 pb-40">
                 <h1 className={`text-5xl md:text-7xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>MES <span className="text-indigo-500">AUDITS</span></h1>
                 <div className={`flex flex-wrap gap-2 border-b ${isDark ? 'border-white/5' : 'border-slate-200'} pb-6`}>
                    {['ALL', 'ANDROMEDA', 'CREATIVE', 'ORACLE', 'MERCURY', 'ATLAS'].map(f => (
                      <FilterTab key={f} label={f} count={(historyStats as any)[f]} active={historyFilter === f} onClick={() => setHistoryFilter(f as any)} color="slate" isDark={isDark} />
                    ))}
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredHistory.map(audit => (<AuditCard key={audit.id} audit={audit} badge={getModuleBadge(audit.type)} isDark={isDark} onDelete={handleDelete} onView={setViewingReport} />))}
                 </div>
              </div>
            ) : null}
         </div>
      </main>

      {viewingReport && (
        <div className="fixed inset-0 z-[1000] bg-black flex flex-col animate-fade-in overflow-hidden">
           <header className="h-24 px-12 border-b border-white/10 flex items-center justify-between shrink-0">
              <Logo className="invert brightness-0 scale-75" />
              <button onClick={() => setViewingReport(null)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl text-white hover:bg-indigo-600 transition-all">✕</button>
           </header>
           <div className="flex-1 overflow-y-auto p-12 bg-[#050505] scrollbar-hide">
              <div className="max-w-5xl mx-auto bg-white rounded-[4rem] overflow-hidden text-slate-900 shadow-2xl relative">
                {viewingReport.type === 'CREATIVE' ? <CreativeResultDisplay report={viewingReport} /> : <ResultsDisplay results={viewingReport.results} inputs={viewingReport.inputs} />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AuditCard = ({ audit, badge, isDark, onDelete, onView }: any) => (
  <div className={`${isDark ? 'bg-[#0A0A0A] border-white/5 hover:border-indigo-500/50' : 'bg-white border-[#E2E8F0] hover:border-indigo-400 shadow-xl shadow-slate-200/20'} border p-8 rounded-[3rem] transition-all group relative flex flex-col min-h-[480px] overflow-hidden cursor-pointer`} onClick={() => onView(audit)}>
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(audit.id); }} className="absolute top-6 right-6 z-30 w-10 h-10 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">✕</button>
    <div className="mb-6"><span className={`border px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${badge.color}`}>{badge.label}</span></div>
    <div className="mb-8 flex-1 flex flex-col justify-center">
       {audit.type === 'CREATIVE' ? <div className={`aspect-square rounded-[2.5rem] ${isDark ? 'bg-[#0F0F0F] border-white/5' : 'bg-slate-50 border-slate-100'} border overflow-hidden shadow-inner`}><img src={audit.inputs.creativeImageUrl} className="w-full h-full object-contain" /></div> : <div className={`${isDark ? 'bg-emerald-600/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'} border p-6 rounded-[2.5rem] space-y-4`}><p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ROAS Point Mort</p><p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{audit.results.roasThreshold.toFixed(2)}x</p></div>}
    </div>
    <div className={`mt-auto pt-6 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}><h4 className={`text-xl font-black uppercase tracking-tight mb-2 truncate ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{audit.name}</h4><div className="flex justify-between items-center"><p className="text-[9px] text-slate-500 font-bold uppercase">{new Date(audit.date).toLocaleDateString()}</p></div></div>
  </div>
);

const FilterTab = ({ label, count, active, onClick, color, isDark }: any) => (
  <button onClick={onClick} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${isDark ? 'border-white/5' : 'border-[#E2E8F0]'} flex items-center gap-2 ${active ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}>
    {label} <span className="opacity-40">({count})</span>
  </button>
);

const ModuleCard = ({ title, desc, color, isDark, onClick }: any) => {
  const c: any = { emerald: 'emerald-600', indigo: 'indigo-600', violet: 'violet-600', blue: 'blue-600', amber: 'amber-600' };
  return (
    <button onClick={onClick} className={`${isDark ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-[#E2E8F0] shadow-xl shadow-slate-200/50'} border p-10 rounded-[2.5rem] text-left transition-all group`}>
      <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-4 transition-colors ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>{title}</h3>
      <p className="text-slate-500 text-sm italic mb-8 font-medium">{desc}</p>
      <span className={`bg-${c[color]} text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg`}>Lancer Scan &rarr;</span>
    </button>
  );
};

const SimField = ({ label, value, onChange, isDark }: any) => (
  <div className="space-y-2">
    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
    <input type="number" step="0.1" value={value} onChange={(e) => onChange(e.target.value)} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-2 ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-[#E2E8F0] text-[#0F172A]'}`} />
  </div>
);

const SimInput = ({ label, value, unit, min, max, step, onChange, icon, isLog = false, valueRaw, displayVal, isDark }: any) => {
  const finalPos = isLog ? budgetToPosition(value || 10) : valueRaw;
  return (
    <div className="space-y-5">
       <div className="flex justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest">
          <span className={`${isDark ? 'text-slate-600' : 'text-slate-400'} shrink-0`}>{icon} {label}</span>
          <span className={`italic font-bold tabular-nums whitespace-nowrap ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{displayVal || `${(valueRaw || 0).toLocaleString()} ${unit}`}</span>
       </div>
       <input type="range" min={min} max={max} step={step} value={finalPos || 0} onChange={(e) => onChange(parseFloat(e.target.value))} className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-indigo-500 ${isDark ? 'bg-[#1A1A1A]' : 'bg-slate-200'}`} />
    </div>
  );
};

const ResultCard = ({ label, value, sub, highlight, extra, isDark }: any) => (
  <div className={`p-8 rounded-[2.5rem] border flex flex-col gap-2 transition-all ${highlight === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : highlight === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-600' : highlight === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' : (isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-[#E2E8F0] text-[#0F172A] shadow-xl shadow-slate-200/30')}`}>
     <p className={`text-[9px] font-black uppercase ${isDark ? 'opacity-60' : 'text-slate-400'}`}>{label}</p>
     <p className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter truncate">{value}</p>
     {extra && <p className={`text-[10px] font-black uppercase mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{extra}</p>}
     <p className={`text-[8px] font-bold uppercase italic ${isDark ? 'opacity-40' : 'text-slate-400'}`}>{sub}</p>
  </div>
);

const RadarChart = ({ metrics, labels, isDark }: any) => {
  const size = 300; const center = size / 2; const radius = size * 0.35; const sides = metrics.length;
  const points = metrics.map((val: any, i: any) => {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const normVal = (val / 10) * radius;
    return { x: center + Math.cos(angle) * normVal, y: center + Math.sin(angle) * normVal };
  });
  const pathData = points.map((p: any, i: any) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const labelColor = isDark ? "fill-slate-500" : "fill-[#0F172A]";
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={`w-full h-full ${isDark ? 'drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]' : ''}`}>
      {[0.2, 0.4, 0.6, 0.8, 1].map((r, idx) => (<circle key={idx} cx={center} cy={center} r={radius * r} fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)"} strokeWidth="1" />))}
      {metrics.map((_: any, i: any) => {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        return (
          <React.Fragment key={i}>
            <line x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.3)"} strokeWidth="1.5" />
            <text x={center + Math.cos(angle) * (radius + 25)} y={center + Math.sin(angle) * (radius + 25)} textAnchor="middle" dominantBaseline="middle" className={`text-[10px] font-black uppercase tracking-widest ${labelColor}`}>{labels[i]}</text>
          </React.Fragment>
        );
      })}
      <path d={pathData} fill={isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(99, 102, 241, 0.5)"} stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
};
