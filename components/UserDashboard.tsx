
import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, SimulationHistory, CalculatorInputs } from '../types';
import { AuditService, AuthService } from '../services/storage';
import { supabase } from '../services/supabase';
import { ResultsDisplay } from './ResultsDisplay';
import { CreativeAudit } from './CreativeAudit';
import { CreativeResultDisplay } from './CreativeResultDisplay';
import { Logo } from './Logo';

interface UserDashboardProps {
  user: UserProfile;
  latestAudit: SimulationHistory | null;
  onNewAudit: () => void;
  onConsulting: () => void;
  onLogout: () => void;
  onNotification?: (msg: string, type?: 'success' | 'error') => void;
}

type DashboardTab = 'cockpit' | 'history' | 'creative' | 'business';

const budgetToPosition = (val: number) => {
  return (Math.log10(val) - Math.log10(10)) / (Math.log10(250000) - Math.log10(10)) * 100;
};
const positionToBudget = (pos: number) => {
  const min = 10;
  const max = 250000;
  return Math.round(min * Math.pow(10, (pos / 100) * (Math.log10(max) - Math.log10(min))));
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

export const UserDashboard: React.FC<UserDashboardProps> = ({ user, latestAudit, onNewAudit, onConsulting, onLogout, onNotification }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('cockpit');
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState<SimulationHistory | null>(null);
  const [historyFilter, setHistoryFilter] = useState<'ANDROMEDA' | 'CREATIVE'>('ANDROMEDA');

  const [businessData, setBusinessData] = useState({
    shop_name: user.shop_name || '',
    shop_url: user.shop_url || '',
    niche: user.niche || 'other',
    target_cpa: user.target_cpa || 25
  });

  const [simBudget, setSimBudget] = useState<number>(5000);
  const [simAov, setSimAov] = useState<number>(75);
  const [simCtr, setSimCtr] = useState<number>(2.0);
  const [simCpm, setSimCpm] = useState<number>(12);
  const [simCogs, setSimCogs] = useState<number>(15);
  const [simShipping, setSimShipping] = useState<number>(6.5);
  const [simFixedCosts, setSimFixedCosts] = useState<number>(1200);
  const [simRetention, setSimRetention] = useState<number>(18);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const sims = await AuditService.getAuditHistory(user.id);
      setHistory(sims);
      
      const lastStrat = sims.find(s => s.type === 'ANDROMEDA');
      if (lastStrat) {
        setSimBudget(parseFloat(lastStrat.inputs.currentBudget) || 5000);
        setSimAov(parseFloat(lastStrat.inputs.pmv) || 75);
        setSimCtr(parseFloat(lastStrat.inputs.currentCtr) || 2.0);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { 
    loadHistory(); 
  }, [user.id, activeTab]);

  useEffect(() => {
    const handleTabSwitch = (e: any) => {
        if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('setDashboardTab', handleTabSwitch);
    return () => window.removeEventListener('setDashboardTab', handleTabSwitch);
  }, []);

  const handleUpdateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.updateBusiness(user.id, businessData);
      if (onNotification) onNotification("Configuration Business Archivée.");
    } catch (e) {
      if (onNotification) onNotification("Erreur de sync.", "error");
    } finally { setLoading(false); }
  };

  const simulation = useMemo(() => {
    const impressions = (simBudget / simCpm) * 1000;
    const clicks = impressions * (simCtr / 100);
    const convRate = 2.8 / 100; 
    const orders = clicks * convRate;
    const revenue = orders * simAov;
    const totalCogs = orders * simCogs;
    const totalShipping = orders * simShipping;
    const adsFees = revenue * 0.03;
    const grossProfit = revenue - totalCogs - totalShipping - adsFees;
    const netProfit = grossProfit - simBudget - simFixedCosts;
    const currentRoas = revenue / simBudget;
    const breakevenRoas = (simBudget + simFixedCosts + totalCogs + totalShipping + adsFees) / simBudget;
    return { revenue, netProfit, currentRoas, breakevenRoas, orders, isLoss: netProfit <= 0 };
  }, [simBudget, simAov, simCtr, simCpm, simCogs, simShipping, simFixedCosts]);

  const radarMetrics = useMemo(() => {
    const rentability = Math.min(Math.max((simulation.netProfit / (simulation.revenue || 1)) * 40, 0), 10);
    const scalability = Math.min(Math.max(10 - (simulation.breakevenRoas / 2), 0), 10);
    const creativity = Math.min(simCtr * 4, 10);
    const security = parseFloat(latestAudit?.inputs.emqScore || '6');
    const retention = Math.min(simRetention / 2, 10);
    return [rentability, scalability, creativity, retention, security];
  }, [simulation, simCtr, simRetention, latestAudit]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const handleDelete = async (id: string) => {
    if (!confirm("Effacer définitivement cet audit des archives ?")) return;
    setLoading(true);
    const { error } = await supabase.from('audits').delete().match({ id: id });
    if (!error) {
      setHistory(prev => prev.filter(a => a.id !== id));
      if (viewingReport?.id === id) setViewingReport(null);
      if (onNotification) onNotification("Nettoyage terminé, Alexia.");
    } else {
      alert("Erreur: " + error.message);
    }
    setLoading(false);
  };

  const filteredHistory = useMemo(() => {
    return history.filter(audit => audit.type === historyFilter);
  }, [history, historyFilter]);

  return (
    <div className="flex h-screen bg-[#050505] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* SIDEBAR NETTOYÉE */}
      <aside className="w-64 border-r border-white/5 flex flex-col shrink-0 bg-[#080808] z-20">
         <div className="p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                  <span className="text-white text-base">🚀</span>
               </div>
               <span className="text-xl font-black tracking-tighter uppercase italic">AdsPilot <span className="text-indigo-500">Pro</span></span>
            </div>
            <nav className="space-y-2 flex-1">
               <SidebarItem icon="📊" label="Cockpit P&L" active={activeTab === 'cockpit'} onClick={() => setActiveTab('cockpit')} />
               <SidebarItem icon="🎨" label="Audit Créatif" active={activeTab === 'creative'} onClick={() => setActiveTab('creative')} />
               <SidebarItem icon="🏢" label="Mon Business" active={activeTab === 'business'} onClick={() => setActiveTab('business')} />
               <SidebarItem icon="📂" label="Mes Audits" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
               <SidebarItem icon="🛍️" label="Boutique" onClick={() => (window as any).setAppMode('boutique')} />
            </nav>

            <button 
               onClick={onLogout}
               className="mt-auto w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-4 border border-transparent text-slate-500 hover:text-red-400 hover:bg-red-500/5 group"
            >
               <span className="text-lg group-hover:scale-110 transition-transform">🚪</span> Déconnexion
            </button>
         </div>
         <div className="p-8 border-t border-white/5 bg-indigo-950/5">
            <div className="flex items-center gap-4">
               <ExpertAvatar className="w-12 h-12" />
               <div className="overflow-hidden">
                  <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest leading-none mb-1">Architecte Expert</p>
                  <p className="text-xs font-black uppercase truncate text-white">Alexia Kebir</p>
               </div>
            </div>
         </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
         <header className="h-24 px-12 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#050505]/90 backdrop-blur-xl z-30">
            <h2 className="text-[10px] font-black italic uppercase tracking-[0.4em] text-slate-500">
               {activeTab === 'cockpit' ? "Mode : Hardcore Simulator" : activeTab === 'business' ? "Gestion du Profil Marque" : activeTab === 'history' ? "Ma Bibliothèque d'Expertise" : "Pilotage de Performance"}
            </h2>
            <div className="flex items-center gap-6">
               <button onClick={onNewAudit} className="bg-indigo-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-indigo-600 transition-all shadow-xl active:scale-95">Nouveau Diagnostic &rarr;</button>
               <div className="w-px h-6 bg-white/10"></div>
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.full_name}</span>
                  <ExpertAvatar className="w-8 h-8" neon={false} />
               </div>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'history' ? (
              <div className="p-16 animate-fade-in max-w-7xl mx-auto space-y-12 pb-40">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter">Mes <span className="text-indigo-400">Audits</span></h2>
                    
                    {/* TRI INTELLIGENT PAR ONGLETS */}
                    <div className="bg-white/5 p-1.5 rounded-[1.5rem] flex gap-2 border border-white/10">
                       <button 
                          onClick={() => setHistoryFilter('ANDROMEDA')}
                          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'ANDROMEDA' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                       >
                          📊 Diagnostics Andromeda
                       </button>
                       <button 
                          onClick={() => setHistoryFilter('CREATIVE')}
                          className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyFilter === 'CREATIVE' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                       >
                          🎨 Analyses Créatives
                       </button>
                    </div>
                 </div>
                 
                 {loading && history.length === 0 ? (
                    <div className="py-20 text-center">
                       <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Accès au coffre-fort...</p>
                    </div>
                 ) : filteredHistory.length === 0 ? (
                    <div className="bg-white/5 rounded-[4rem] p-32 text-center border border-dashed border-white/10">
                       <span className="text-6xl mb-8 block">{historyFilter === 'CREATIVE' ? '🎨' : '📊'}</span>
                       <h3 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">Aucun audit trouvé ici</h3>
                       <p className="text-slate-500 text-xs font-bold italic uppercase tracking-widest mb-10">L'Architecte attend votre signal.</p>
                       <button onClick={onNewAudit} className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl">Lancer un nouvel audit &rarr;</button>
                    </div>
                 ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {filteredHistory.map(audit => (
                         <div key={audit.id} className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[3rem] hover:border-indigo-500/50 transition-all shadow-2xl group relative overflow-hidden flex flex-col h-[600px]">
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(audit.id); }} className="absolute top-8 right-8 z-[70] w-12 h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-red-500/20">✕</button>
                            
                            <div className="mb-8 flex justify-between items-start">
                               <span className={`border px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${audit.type === 'CREATIVE' ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'}`}>
                                  {audit.type === 'CREATIVE' ? '🎨 VISION' : '📊 STRATÉGIE'}
                               </span>
                               <span className="text-[10px] font-black text-white italic">{audit.type === 'CREATIVE' ? 'ANALYSE IA' : `${audit.results.roasThreshold?.toFixed(2)}x`}</span>
                            </div>

                            <div className="mb-8 aspect-square rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                               {audit.type === 'CREATIVE' && audit.inputs.creativeImageUrl ? (
                                  <img src={audit.inputs.creativeImageUrl} className="w-full h-full object-contain" alt="Aperçu" />
                               ) : (
                                  <div className="text-center relative">
                                     <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                                     <span className="text-6xl relative z-10">{audit.type === 'CREATIVE' ? '🖼️' : '📡'}</span>
                                     <p className="mt-4 text-[8px] font-black text-indigo-400 uppercase tracking-widest relative z-10">
                                        {audit.type === 'CREATIVE' ? 'Scan Vision' : 'Radar Andromeda'}
                                     </p>
                                  </div>
                               )}
                            </div>

                            <h4 className="text-2xl font-black uppercase tracking-tight mb-2 text-white group-hover:text-indigo-400 transition-colors truncate">{audit.name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-10 italic">{new Date(audit.date).toLocaleDateString()}</p>
                            
                            {audit.type !== 'CREATIVE' ? (
                               <div className="mb-10 space-y-4">
                                  <div className="space-y-2">
                                     <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-500">
                                        <span>Signal Andromeda</span>
                                        <span className="text-white">{audit.inputs.emqScore}/10</span>
                                     </div>
                                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(parseFloat(audit.inputs.emqScore) || 0) * 10}%` }}></div>
                                     </div>
                                  </div>
                                  <div className="flex justify-between border-t border-white/5 pt-4">
                                      <div>
                                         <p className="text-[8px] font-black text-slate-500 uppercase">ROAS</p>
                                         <p className="text-sm font-black">{audit.inputs.currentRoas || '0'}x</p>
                                      </div>
                                      <div className="text-right">
                                         <p className="text-[8px] font-black text-slate-500 uppercase">CPA</p>
                                         <p className="text-sm font-black">{audit.inputs.currentCpa || '0'}€</p>
                                      </div>
                                  </div>
                               </div>
                            ) : (
                               <div className="mb-10 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
                                  <p className="text-[9px] font-black uppercase text-indigo-400 italic text-center">Score Créatif Expert</p>
                                  <div className="flex justify-around items-center">
                                      <div className="text-center">
                                         <p className="text-[7px] text-slate-500 uppercase">Hook</p>
                                         <p className="text-xs font-black">{audit.inputs.creativeHookScore || '0'}</p>
                                      </div>
                                      <div className="text-center">
                                         <p className="text-[7px] text-slate-500 uppercase">Désir</p>
                                         <p className="text-xs font-black">{audit.inputs.creativeDesirabilityScore || '0'}</p>
                                      </div>
                                  </div>
                               </div>
                            )}

                            <button onClick={() => setViewingReport(audit)} className="w-full mt-auto py-4 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-xl">
                               {audit.type === 'CREATIVE' ? 'Ouvrir Vision →' : 'Simulateur P&L →'}
                            </button>
                         </div>
                       ))}
                    </div>
                    </>
                 )}
              </div>
            ) : activeTab === 'business' ? (
              <div className="p-16 animate-fade-in max-w-2xl mx-auto space-y-16">
                 <div className="text-center space-y-4">
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter">Mon <span className="text-indigo-400">Business</span></h3>
                    <p className="text-slate-500 font-medium italic">Paramétrez vos objectifs pour aligner l'IA Andromeda sur votre profit.</p>
                 </div>
                 <form onSubmit={handleUpdateBusiness} className="bg-[#0A0A0A] border border-white/10 p-12 rounded-[4rem] space-y-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                    <BusinessInput label="Nom de la Boutique" value={businessData.shop_name} onChange={(v) => setBusinessData(p => ({...p, shop_name: v}))} placeholder="ex: MyBrand UGC" />
                    <BusinessInput label="URL du Shop" value={businessData.shop_url} onChange={(v) => setBusinessData(p => ({...p, shop_url: v}))} placeholder="https://..." />
                    <BusinessInput label="CPA Cible (Objectif €)" value={businessData.target_cpa.toString()} onChange={(v) => setBusinessData(p => ({...p, target_cpa: parseFloat(v) || 0}))} placeholder="ex: 25.00" type="number" />
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-indigo-900 transition-all shadow-2xl active:scale-95">
                       {loading ? 'ARCHIVAGE...' : 'SAUVEGARDER CONFIGURATION &rarr;'}
                    </button>
                 </form>
              </div>
            ) : activeTab === 'cockpit' ? (
              <div className="p-12 animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pb-32">
                <div className="lg:col-span-4 space-y-8 bg-[#0A0A0A] border border-white/5 p-10 rounded-[3rem] shadow-2xl">
                   <h3 className="text-lg font-black uppercase italic tracking-widest mb-6 text-indigo-400 border-b border-white/10 pb-4">Pilotage Hardcore</h3>
                   <div className="space-y-10">
                      <div className="space-y-6">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">💸 Acquisition</p>
                        <SimInput label="Budget Mensuel" value={simBudget} unit="€" min={0} max={100} step={0.1} isLog onChange={(pos) => setSimBudget(positionToBudget(pos))} icon="💰" displayVal={formatCurrency(simBudget)} />
                        <SimInput label="CTR (Scan Créa)" valueRaw={simCtr} unit="%" min={0.1} max={10} step={0.1} onChange={setSimCtr} icon="🎨" />
                      </div>
                      <div className="space-y-6 pt-6 border-t border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">📦 Logistique</p>
                        <SimInput label="Coût de Revient (COGS)" valueRaw={simCogs} unit="€" min={0} max={500} step={1} onChange={setSimCogs} icon="🛠️" />
                        <SimInput label="Frais d'Expédition" valueRaw={simShipping} unit="€" min={0} max={50} step={0.5} onChange={setSimShipping} icon="🚚" />
                      </div>
                   </div>
                </div>

                <div className="lg:col-span-8 space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ResultCard label="Profit Net Réel" value={formatCurrency(simulation.netProfit)} sub="Après Ad Spend & COGS" highlight={simulation.isLoss ? 'danger' : 'success'} />
                      <ResultCard label="ROAS Point Mort" value={`${simulation.breakevenRoas.toFixed(2)}x`} sub={`ROAS Actuel: ${simulation.currentRoas.toFixed(2)}x`} highlight="indigo" />
                      <ResultCard label="Commandes / mois" value={simulation.orders.toFixed(0)} sub="Volume de vente estimé" highlight="none" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] p-10 flex flex-col items-center gap-10 shadow-2xl relative overflow-hidden">
                         <h3 className="text-xl font-black uppercase italic tracking-tighter text-indigo-400 self-start">Radar <span className="text-white">Andromeda</span></h3>
                         <div className="w-full aspect-square max-w-[260px]"><RadarChart metrics={radarMetrics} labels={['PROFIT', 'SCALE', 'CRÉA', 'LTV', 'DATA']} /></div>
                      </div>
                      <div className="bg-indigo-600 p-10 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                         <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4">
                               <ExpertAvatar className="w-14 h-14 border-white/20" neon={false} />
                               <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Architecte Expert</p>
                                  <p className="text-xs font-black uppercase">Alexia Kebir</p>
                               </div>
                            </div>
                            <p className="text-xl font-medium italic leading-relaxed">
                               {simulation.isLoss 
                                 ? `"Votre structure actuelle brûle du cash. Réduisez vos frais d'expédition ou augmentez l'AOV pour survivre au scaling."`
                                 : simulation.currentRoas > 3 
                                 ? `"C'est un moteur de champion. Votre CPA cible est maîtrisé, passez au scaling vertical massif."`
                                 : `"C'est stable mais attention à la saturation créative. Votre CTR doit rester au-dessus de 1.8%."`}
                            </p>
                         </div>
                         <button className="mt-8 bg-white text-indigo-900 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">Télécharger Business Plan (PDF) &rarr;</button>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="p-12 animate-fade-in max-w-6xl mx-auto"><CreativeAudit /></div>
            )}
         </div>
      </main>

      {viewingReport && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col animate-fade-in">
           <header className="h-24 px-12 border-b border-white/10 flex items-center justify-between shrink-0">
              <Logo className="invert brightness-0 scale-75" />
              <div className="flex items-center gap-6">
                 <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black uppercase text-indigo-400">Diagnostic Officiel</p>
                    <p className="text-xs font-black uppercase text-white">Expertise par : Alexia Kebir</p>
                 </div>
                 <button onClick={() => setViewingReport(null)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl hover:bg-red-500 transition-all text-white">✕</button>
              </div>
           </header>
           <div className="flex-1 overflow-y-auto p-12 bg-slate-900/50">
              <div className="max-w-5xl mx-auto bg-white rounded-[4rem] overflow-hidden text-slate-900 shadow-[0_0_150px_rgba(99,102,241,0.2)]">
                {viewingReport.type === 'CREATIVE' ? (
                   <CreativeResultDisplay report={viewingReport} />
                ) : (
                   <ResultsDisplay results={viewingReport.results} inputs={viewingReport.inputs} />
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false, onClick }: { icon: string; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`w-full text-left px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-4 border ${active ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500 shadow-xl' : 'text-slate-400 border-transparent hover:bg-white/5'}`}>
     <span className="text-lg">{icon}</span>{label}
  </button>
);

const SimInput = ({ label, value, unit, min, max, step, onChange, icon, isLog = false, valueRaw, displayVal }: { label: string; value?: number; unit: string; min: number; max: number; step: number; onChange: (v: number) => void; icon: string; isLog?: boolean; valueRaw?: number; displayVal?: string }) => {
  const finalPos = isLog ? budgetToPosition(value || 10) : valueRaw;
  return (
    <div className="space-y-4 group">
       <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-400">
          <span className="flex items-center gap-2"><span>{icon}</span> {label}</span>
          <span className="text-indigo-400 italic">{displayVal || `${(valueRaw || 0).toLocaleString()} ${unit}`}</span>
       </div>
       <input type="range" min={min} max={max} step={step} value={finalPos || 0} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-full h-1 bg-[#1A1A1A] rounded-full appearance-none cursor-pointer accent-indigo-500" />
    </div>
  );
};

const ResultCard = ({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight: 'success' | 'danger' | 'indigo' | 'none' }) => {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.1)]',
    danger: 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 shadow-[0_0_40px_rgba(99,102,241,0.1)]',
    none: 'bg-white/5 border-white/5 text-white'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border flex flex-col gap-2 transition-all duration-700 hover:scale-105 ${styles[highlight]}`}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</p>
       <p className="text-3xl font-black tabular-nums tracking-tighter leading-none">{value}</p>
       <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 italic">{sub}</p>
    </div>
  );
};

const BusinessInput = ({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-500 transition-all shadow-inner" />
  </div>
);

const RadarChart = ({ metrics, labels }: { metrics: number[], labels: string[] }) => {
  const size = 300; const center = size / 2; const radius = size * 0.35; const sides = metrics.length;
  const points = metrics.map((val, i) => {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    const normVal = (val / 10) * radius;
    return { x: center + Math.cos(angle) * normVal, y: center + Math.sin(angle) * normVal };
  });
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]">
      <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      {metrics.map((_, i) => {
        const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
        return (
          <React.Fragment key={i}>
            <line x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={center + Math.cos(angle) * (radius + 20)} y={center + Math.sin(angle) * (radius + 20)} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-black fill-slate-500 uppercase tracking-widest">{labels[i]}</text>
          </React.Fragment>
        );
      })}
      <path d={pathData} fill="rgba(99, 102, 241, 0.3)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
};
