
import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, SimulationHistory } from '../types';
import { AuditService, AuthService } from '../services/storage';
import { Logo } from './Logo';
import { AuditExplainer } from './AuditExplainer';
import { Boutique } from './Boutique';

interface DashboardProps {
  user: UserProfile;
  onLoadSimulation: (sim: SimulationHistory) => void;
  onNewSimulation: () => void;
  onLogout: () => void;
  onNotification?: (msg: string, type?: 'success' | 'error') => void;
  onGoToBoutique?: () => void;
  defaultTab?: 'history' | 'guide' | 'boutique';
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLoadSimulation, onNewSimulation, onLogout, onNotification, onGoToBoutique, defaultTab = 'history' }) => {
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'guide' | 'boutique'>(defaultTab);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const sims = await AuditService.getAuditHistory(user.id);
      setHistory(sims);
    } catch (e) {
      console.error("Dashboard Load Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const latestSim = useMemo(() => history[0], [history]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous supprimer cet audit ?')) {
      await AuditService.deleteAudit(id);
      setHistory(prev => prev.filter(s => s.id !== id));
      if (onNotification) onNotification("Audit supprimé.");
    }
  };

  const getVerdictStyle = (label: string) => {
    const l = (label || '').toUpperCase();
    if (l.includes('AVEUGLE')) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: '🚨', label: 'SIGNAL CRITIQUE' };
    if (l.includes('RISQUE')) return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: '⚠️', label: 'MARGE À RISQUE' };
    if (l.includes('CHAMPION')) return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: '⚡', label: 'READY TO SCALE' };
    return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', icon: '🎯', label: 'POTENTIEL SOLIDE' };
  };

  return (
    <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden">
      <nav className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-50 shrink-0">
         <div className="max-w-6xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-8">
               <Logo onClick={() => setActiveTab('history')} className="cursor-pointer" />
               <div className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>📊 Mes Audits</button>
                  <button onClick={() => setActiveTab('guide')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>💡 Comprendre</button>
                  <button onClick={() => setActiveTab('boutique')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'boutique' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>💎 Boutique</button>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={loadHistory} disabled={loading} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30">
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
               </button>
               <button onClick={onLogout} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest border px-4 py-2 rounded-lg">Déconnexion</button>
             </div>
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'guide' ? <AuditExplainer onBack={() => setActiveTab('history')} inputs={latestSim?.inputs} results={latestSim?.results} /> : activeTab === 'boutique' ? <Boutique onNotification={onNotification} /> : (
          <div className="max-w-6xl mx-auto px-4 py-16 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                 <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic leading-none mb-4 tracking-tighter">Espace <span className="text-indigo-600">Stratégique</span></h1>
                    <p className="text-slate-400 font-medium italic">Accédez à vos rapports Andromeda archivés et suivez votre évolution.</p>
                 </div>
                 <button onClick={onNewSimulation} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95">Nouvel Audit &rarr;</button>
             </div>

             {loading && history.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-[10px] text-slate-400 uppercase tracking-widest">Synchronisation Database...</p>
                 </div>
             ) : history.length === 0 ? (
                 <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">📋</div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tight">Aucun rapport disponible</h3>
                    <p className="text-slate-500 mb-10 italic max-w-sm mx-auto leading-relaxed">Lancez votre premier diagnostic pour transformer vos données Meta en une stratégie de croissance claire.</p>
                    <button onClick={onNewSimulation} className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-900 transition-all">Lancer mon Diagnostic &rarr;</button>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {history.map((sim) => {
                         const style = getVerdictStyle(sim.verdictLabel);
                         const emq = parseFloat(sim.inputs?.emqScore) || 0;
                         return (
                           <div key={sim.id} onClick={() => onLoadSimulation(sim)} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl cursor-pointer group relative overflow-hidden transition-all hover:-translate-y-2 flex flex-col">
                               {/* Badge Verdict Premium */}
                               <div className={`absolute top-0 left-0 right-0 h-1 ${style.bg.replace('bg-', 'bg-')}`}></div>
                               <div className="flex justify-between items-start mb-6">
                                   <div className={`px-3 py-1.5 rounded-full border ${style.bg} ${style.border} ${style.text} flex items-center gap-2`}>
                                      <span className="text-sm">{style.icon}</span>
                                      <span className="text-[9px] font-black uppercase tracking-widest">{style.label}</span>
                                   </div>
                                   <button onClick={(e) => handleDelete(sim.id, e)} className="text-slate-300 hover:text-red-500 p-1 transition-colors">✕</button>
                               </div>

                               <div className="mb-8">
                                 <h3 className="font-black text-slate-900 text-2xl mb-1 uppercase tracking-tighter group-hover:text-indigo-600 truncate">{sim.name}</h3>
                                 <div className="flex items-center gap-2">
                                   <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(sim.date).toLocaleDateString()}</span>
                                   <span className="text-slate-200">•</span>
                                   <span className="text-[9px] text-slate-300 font-black uppercase tracking-[0.3em]">ID {sim.auditId}</span>
                                 </div>
                               </div>

                               {/* EMQ Score Visual */}
                               <div className="mb-8 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Signal Andromeda</span>
                                    <span className={`text-[9px] font-black ${emq >= 8 ? 'text-emerald-500' : 'text-amber-500'}`}>{emq}/10</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                     <div className={`h-full transition-all duration-1000 ${emq >= 8 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400'}`} style={{ width: `${emq * 10}%` }}></div>
                                  </div>
                               </div>

                               <div className="grid grid-cols-2 gap-4 mt-auto border-t border-slate-50 pt-6">
                                   <div className="space-y-1">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ROAS</p>
                                      <p className="text-xl font-black text-slate-900 italic tracking-tighter">{sim.inputs?.currentRoas || '0'}</p>
                                   </div>
                                   <div className="space-y-1 text-right">
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CPA</p>
                                      <p className="text-xl font-black text-slate-900 italic tracking-tighter">{sim.inputs?.currentCpa || '0'}€</p>
                                   </div>
                               </div>
                               
                               {/* Hint on hover */}
                               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Ouvrir le Rapport &rarr;</span>
                               </div>
                           </div>
                         );
                     })}
                 </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};
