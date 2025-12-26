
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

  useEffect(() => {
    setLoading(true);
    AuditService.getAuditHistory(user.id).then(sims => {
      setHistory(sims);
      setLoading(false);
    });
  }, [user.id, activeTab]);

  const latestSim = useMemo(() => history[0], [history]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous supprimer cet audit ?')) {
      await AuditService.deleteAudit(id);
      setHistory(prev => prev.filter(s => s.id !== id));
      if (onNotification) onNotification("Audit supprimé.");
    }
  };

  return (
    <div className="h-full bg-slate-50 font-sans flex flex-col overflow-hidden">
      <nav className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-50 shrink-0">
         <div className="max-w-6xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-8">
               <Logo onClick={onLogout} className="cursor-pointer" />
               <div className="hidden md:flex bg-slate-100 p-1 rounded-xl gap-1">
                  <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>📊 Mes Audits</button>
                  <button onClick={() => setActiveTab('guide')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'guide' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>💡 Comprendre</button>
                  <button onClick={() => setActiveTab('boutique')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'boutique' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>💎 Boutique</button>
               </div>
             </div>
             <button onClick={onLogout} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest border px-4 py-2 rounded-lg">Déconnexion</button>
         </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'guide' ? <AuditExplainer onBack={() => setActiveTab('history')} inputs={latestSim?.inputs} results={latestSim?.results} /> : activeTab === 'boutique' ? <Boutique onNotification={onNotification} /> : (
          <div className="max-w-6xl mx-auto px-4 py-20 animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
                 <div><h1 className="text-4xl font-black text-slate-900 uppercase italic leading-none mb-2">Espace Stratégique</h1><p className="text-slate-500 italic">Retrouvez vos rapports personnalisés.</p></div>
                 <button onClick={onNewSimulation} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Nouvel Audit &rarr;</button>
             </div>
             {loading ? <div className="text-center py-20 font-black text-slate-400 animate-pulse uppercase tracking-[0.5em]">Chargement des données...</div> : history.length === 0 ? <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-200"><h3>Aucun audit enregistré</h3></div> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {history.map((sim) => (
                         <div key={sim.id} onClick={() => onLoadSimulation(sim)} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl cursor-pointer group relative overflow-hidden transition-all">
                             <div className="flex justify-between items-start mb-8">
                                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Dossier #{sim.auditId}</span>
                                 <button onClick={(e) => handleDelete(sim.id, e)} className="text-slate-300 hover:text-red-600 p-2">✕</button>
                             </div>
                             <h3 className="font-black text-slate-900 text-2xl mb-1 uppercase tracking-tighter group-hover:text-indigo-600">{sim.name}</h3>
                             <p className="text-[10px] text-slate-400 font-bold mb-8 uppercase">{new Date(sim.date).toLocaleDateString()}</p>
                             <div className="space-y-3 border-t border-slate-100 pt-8 mt-auto">
                                 <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400">ROAS</span><span className="font-black">{sim.inputs?.currentRoas || '0'}</span></div>
                                 <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400">CPA</span><span className="font-black">{sim.inputs?.currentCpa || '0'}€</span></div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};
