
import React, { useEffect, useState, useMemo } from 'react';
import { LeadData, UserProfile, SimulationHistory } from '../types.ts';
import { AdminService } from '../services/storage.ts';
import { supabase } from '../services/supabase.ts';
import { ResultsDisplay } from './ResultsDisplay.tsx';
import { CreativeResultDisplay } from './CreativeResultDisplay.tsx';
import { Logo } from './Logo.tsx';

interface AdminDashboardProps {
  adminUser: UserProfile;
  onLogout: () => void;
  onLeadsSeen?: () => void;
}

const ExpertAvatar = ({ className = "w-10 h-10", pulse = false }) => (
  <div className={`relative ${className} group shrink-0`}>
    <div className={`absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm group-hover:bg-indigo-500/40 transition-all ${pulse ? 'animate-pulse' : ''}`}></div>
    <div className="relative w-full h-full bg-slate-800 rounded-xl border-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
        <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="currentColor" className="text-indigo-400" />
        <path d="M12 13C9.23858 13 7 15.2386 7 18V19H17V18C17 15.2386 14.7614 13 12 13Z" fill="currentColor" className="text-indigo-400" />
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500/30" />
      </svg>
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, onLeadsSeen }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'empire'>('empire');
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [allAudits, setAllAudits] = useState<any[]>([]);
  const [stats, setStats] = useState({ andromeda: 0, creative: 0 });
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);
  const [viewingAudit, setViewingAudit] = useState<SimulationHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setSynced(false);
    try {
      const [leadsData, auditsData, counts] = await Promise.all([
        AdminService.getGlobalLeads(),
        AdminService.getDatabaseLogs(300),
        AdminService.getGlobalCounts()
      ]);
      setLeads(leadsData);
      setAllAudits(auditsData);
      setStats(counts);
      setSynced(true);
      console.log("Empire d'Alexia synchronisé, Gouverneur.");
    } catch (e: any) {
      console.error("ADMIN SYNC ERROR:", e.message || e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAudit = async (id: string, e: React.MouseEvent) => {
    console.log('GOUVERNEUR: ORDRE DE PURGE REÇU POUR ID:', id);
    e.preventDefault();
    e.stopPropagation();
    
    alert("Suppression Admin demandée pour ID: " + id);
    if (!window.confirm("Gouverneur, purger cet audit définitivement de l'Empire ?")) return;
    
    try {
      const { error } = await supabase.from('audits').delete().eq('id', id);
      if (error) {
        console.error("❌ ADMIN DELETE ERROR:", error);
        alert("Action interdite ou erreur base : " + error.message);
      } else {
        console.log('✅ Audit purgé avec succès par le Gouverneur.');
        setAllAudits(prev => prev.filter(a => a.id !== id));
      }
    } catch (e) {
      console.error("❌ ERREUR ADMIN CRITIQUE:", e);
    }
  };

  useEffect(() => { 
    loadData();
    const channel = supabase
      .channel('admin_control_tower_v9')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audits' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const andromedaAudits = useMemo(() => 
    allAudits.filter(a => (a.type === 'ANDROMEDA' || !a.type) && 
    ((a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (a.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase())))
    .slice(0, 15)
  , [allAudits, searchTerm]);

  const creativeAudits = useMemo(() => 
    allAudits.filter(a => a.type === 'CREATIVE' && 
    ((a.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || (a.profiles?.email || "").toLowerCase().includes(searchTerm.toLowerCase())))
    .slice(0, 15)
  , [allAudits, searchTerm]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const SidebarContent = () => (
    <div className="p-6 h-full flex flex-col">
       <div className="mb-10">
          <Logo className="invert brightness-0 scale-90 origin-left" />
          <div className="mt-4 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${synced ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">{synced ? 'Empire Synchronisé' : 'Connexion...'}</p>
          </div>
       </div>
       <nav className="flex-1 space-y-2">
          <button onClick={() => { setActiveTab('empire'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'empire' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🏰 Empire</button>
          <button onClick={() => { setActiveTab('pipeline'); setIsMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🎯 Pipeline</button>
       </nav>
       <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="flex items-center gap-4 mb-6">
              <ExpertAvatar pulse={true} />
              <div>
                <p className="text-[11px] font-black uppercase text-white leading-none">Alexia Kebir</p>
                <p className="text-[8px] text-indigo-400 uppercase tracking-widest font-black italic">Gouverneur</p>
              </div>
          </div>
          <button onClick={onLogout} className="w-full bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5">Déconnexion</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      
      <div className="md:hidden h-20 bg-slate-900 flex items-center justify-between px-6 shrink-0 z-50">
        <Logo className="invert brightness-0 scale-75" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 bg-white/5 rounded-xl text-white border border-white/10">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {isMobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />}
           </svg>
        </button>
      </div>

      <aside className="hidden md:flex w-64 bg-slate-900 text-white shrink-0 flex-col z-20 shadow-2xl">
        <SidebarContent />
      </aside>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl animate-fade-in text-white">
           <SidebarContent />
           <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-slate-400 text-3xl">✕</button>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="hidden md:flex h-20 bg-white border-b border-slate-200 px-8 items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-4">
                 <ExpertAvatar className="w-10 h-10" pulse={true} />
                 <div>
                    <h1 className="text-xs font-black text-slate-900 uppercase italic tracking-tight leading-none mb-1">Empire d'Alexia</h1>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Pilotage des Flux Réels</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="relative w-80">
                    <input type="text" placeholder="Rechercher..." className="w-full bg-slate-50 border border-slate-200 py-2 rounded-xl text-xs font-medium pl-10 focus:ring-2 ring-indigo-500/20 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="absolute left-3.5 top-2.5 text-slate-300 text-xs">🔍</span>
                 </div>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 md:space-y-12 bg-slate-100/50 scrollbar-hide">
             {activeTab === 'empire' ? (
                <div className="space-y-8 md:space-y-12 animate-fade-in">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-200 shadow-sm flex items-center justify-between group relative overflow-hidden">
                         <div className="relative z-10">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ANDROMEDA (P&L)</p>
                            <h2 className="text-5xl md:text-8xl font-black italic text-slate-900">{stats.andromeda}</h2>
                         </div>
                         <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl">📊</div>
                      </div>
                      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-200 shadow-sm flex items-center justify-between group relative overflow-hidden">
                         <div className="relative z-10">
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">VISION (CRÉATIF)</p>
                            <h2 className="text-5xl md:text-8xl font-black italic text-slate-900">{stats.creative}</h2>
                         </div>
                         <div className="w-16 h-16 md:w-24 md:h-24 bg-indigo-50 rounded-2xl md:rounded-[2rem] flex items-center justify-center text-3xl md:text-5xl">🎨</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:gap-10">
                      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
                         <div className="p-6 md:p-8 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center">
                            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-emerald-800 italic">Flux Andromeda</h3>
                            <span className="text-[8px] font-black text-white bg-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Realtime</span>
                         </div>
                         <div className="overflow-x-auto scrollbar-hide">
                            <table className="min-w-full divide-y divide-slate-100">
                               <thead className="bg-slate-50/50">
                                  <tr>
                                     <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit / Client</th>
                                     <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                     <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50">
                                  {andromedaAudits.map(audit => (
                                     <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                           <span className="text-[10px] md:text-[11px] font-black block text-slate-900 uppercase truncate max-w-[120px] md:max-w-none">{audit.name || 'Audit P&L'}</span>
                                           <span className="text-[8px] md:text-[9px] text-slate-400 italic truncate block">{audit.profiles?.email || 'Visiteur'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                           <span className={`text-[10px] font-black ${(audit.emq_score || 0) >= 8 ? 'text-emerald-600' : 'text-amber-500'}`}>{audit.emq_score || '0'}/10</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                           <button onClick={() => setViewingAudit(audit)} className="text-emerald-600 font-black text-[9px] md:text-[10px] hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg border border-emerald-100 uppercase transition-all">Ouvrir</button>
                                           <button 
                                              onClick={(e) => handleDeleteAudit(audit.id, e)} 
                                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100"
                                              title="Effacer diagnostic"
                                           >
                                              🗑️
                                           </button>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>

                      <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
                         <div className="p-6 md:p-8 border-b border-slate-100 bg-indigo-50/20 flex justify-between items-center">
                            <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-indigo-800 italic">Flux Vision</h3>
                            <span className="text-[8px] font-black text-white bg-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Creative</span>
                         </div>
                         <div className="overflow-x-auto scrollbar-hide">
                            <table className="min-w-full divide-y divide-slate-100">
                               <thead className="bg-slate-50/50">
                                  <tr>
                                     <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Visuel</th>
                                     <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                                     <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50">
                                  {creativeAudits.map(audit => (
                                     <tr key={audit.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3 md:gap-4">
                                           <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                              {audit.inputs?.creativeImageUrl ? <img src={audit.inputs.creativeImageUrl} className="w-full h-full object-cover" /> : <span className="text-xl">🖼️</span>}
                                           </div>
                                           <div className="min-w-0">
                                              <span className="text-[10px] md:text-[11px] font-black block truncate text-slate-900 uppercase max-w-[80px] md:max-w-none">{audit.name || 'Vision'}</span>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                           <span className="text-[10px] font-black text-indigo-600">{audit.emq_score || '0'}/10</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                           <button onClick={() => setViewingAudit(audit)} className="text-indigo-600 font-black text-[9px] md:text-[10px] hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg border border-indigo-100 uppercase transition-all">Scan</button>
                                           <button 
                                              onClick={(e) => handleDeleteAudit(audit.id, e)} 
                                              className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-red-100"
                                              title="Effacer diagnostic"
                                           >
                                              🗑️
                                           </button>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                </div>
             ) : (
                <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                   <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-inner">🎯</div>
                         <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-800 italic">Pipeline CRM</h3>
                      </div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{leads.length} Clients</p>
                   </div>
                   <div className="overflow-x-auto scrollbar-hide">
                      <table className="min-w-full divide-y divide-slate-100">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-6 md:px-8 py-4 md:py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                               <th className="px-6 md:px-8 py-4 md:py-6 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                               <th className="px-6 md:px-8 py-4 md:py-6 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostic</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {leads.map((lead) => (
                               <tr key={lead.user.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="px-6 md:px-8 py-4 md:py-6">
                                     <div className="flex flex-col">
                                        <span className="text-[10px] md:text-[11px] font-black uppercase text-slate-900 truncate max-w-[120px] md:max-w-none">{lead.user.full_name || 'Anonyme'}</span>
                                        <span className="text-[8px] text-slate-400 italic truncate max-w-[120px] md:max-w-none">{lead.user.email}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 md:px-8 py-4 md:py-6 text-center">
                                     <span className="text-[11px] md:text-[13px] font-black text-indigo-600">{lead.lastSimulation?.inputs?.currentBudget ? formatCurrency(parseFloat(lead.lastSimulation.inputs.currentBudget)) : 'N/A'}</span>
                                  </td>
                                  <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                     <span className="text-[9px] md:text-[11px] font-black text-slate-900 uppercase truncate max-w-[80px] md:max-w-none block">{lead.lastSimulation?.name || '--'}</span>
                                     <span className="text-[7px] md:text-[9px] text-slate-400 font-black italic">{lead.lastSimulation ? new Date(lead.lastSimulation.date).toLocaleDateString() : ''}</span>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}
          </div>
      </main>

      {viewingAudit && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex flex-col animate-fade-in">
           <header className="h-20 md:h-24 px-6 md:px-12 border-b border-white/10 flex items-center justify-between shrink-0">
              <Logo className="invert brightness-0 scale-75" />
              <button onClick={() => setViewingAudit(null)} className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/5 flex items-center justify-center text-xl text-white">✕</button>
           </header>
           <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-slate-900/40 scrollbar-hide">
              <div className="max-w-5xl mx-auto bg-white rounded-[2rem] md:rounded-[4rem] overflow-hidden text-slate-900 shadow-2xl">
                {viewingAudit.type === 'CREATIVE' ? <CreativeResultDisplay report={viewingAudit} /> : <ResultsDisplay results={viewingAudit.results} inputs={viewingAudit.inputs} />}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
