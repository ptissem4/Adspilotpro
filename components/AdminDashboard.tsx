
import React, { useEffect, useState, useMemo } from 'react';
import { LeadData, UserProfile, SimulationHistory } from '../types';
import { AdminService } from '../services/storage';
import { supabase } from '../services/supabase';
import { ResultsDisplay } from './ResultsDisplay';
import { CreativeResultDisplay } from './CreativeResultDisplay';
import { Logo } from './Logo';

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

  const loadData = async () => {
    setLoading(true);
    setSynced(false);
    console.log("Lancement synchronisation Empire...");
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

  useEffect(() => { 
    loadData();
    const channel = supabase
      .channel('admin_control_tower_v8')
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

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      {/* SIDEBAR GOUVERNEUR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
              <Logo className="invert brightness-0 scale-90 origin-left" />
              <div className="mt-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${synced ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 animate-pulse'}`}></span>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">{synced ? 'Empire Synchronisé' : 'Connexion Flux...'}</p>
              </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto space-y-2">
              <button onClick={() => setActiveTab('empire')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'empire' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                🏰 Empire Stratégique
              </button>
              <button onClick={() => setActiveTab('pipeline')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                🎯 Pipeline CRM
              </button>
          </nav>
          
          <div className="p-6 border-t border-slate-800 bg-black/30">
              <div className="flex items-center gap-4 mb-6">
                  <ExpertAvatar className="w-12 h-12" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate text-white leading-none mb-1">Alexia Kebir</p>
                    <p className="text-[8px] text-indigo-400 truncate uppercase tracking-widest font-black italic">Architecte Gouverneur</p>
                  </div>
              </div>
              <button onClick={onLogout} className="w-full bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase transition-colors tracking-widest border border-white/5">🚪 Déconnexion</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-4">
                 <ExpertAvatar className="w-10 h-10" pulse={true} />
                 <div>
                    <h1 className="text-xs font-black text-slate-900 uppercase italic tracking-tight leading-none mb-1">Empire d'Alexia</h1>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">Pilotage des Flux Réels</p>
                 </div>
              </div>
              
              {synced && (
                <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 animate-fade-in">
                   <span className="text-lg">👑</span>
                   <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest text-center">Empire d'Alexia synchronisé, Gouverneur.</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                 <div className="relative w-80">
                    <input type="text" placeholder="Rechercher client ou projet..." className="w-full bg-slate-50 border border-slate-200 py-2.5 rounded-xl text-xs font-medium pl-10 outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="absolute left-3.5 top-3 text-slate-300 text-xs">🔍</span>
                 </div>
                 <button onClick={loadData} className="text-slate-400 hover:text-indigo-600 transition-colors p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                   <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                 </button>
              </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-12 bg-slate-100/50 scrollbar-hide">
             {activeTab === 'empire' ? (
                <div className="space-y-12 animate-fade-in">
                   {/* COMPTEURS RÉELS RÉCUPÉRÉS PAR COUNT() */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-emerald-500 transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ANDROMEDA (P&L)</p>
                            <h2 className="text-8xl font-black italic tracking-tighter text-slate-900 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">{stats.andromeda}</h2>
                         </div>
                         <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-emerald-100/50">📊</div>
                      </div>
                      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-500 transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">VISION (CRÉATIF)</p>
                            <h2 className="text-8xl font-black italic tracking-tighter text-slate-900 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">{stats.creative}</h2>
                         </div>
                         <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner border border-indigo-100/50">🎨</div>
                      </div>
                   </div>

                   {/* FLUX D'ACTIVITÉ RÉELS SANS ERREUR DE RELATION */}
                   <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                      {/* FLUX ANDROMEDA */}
                      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                         <div className="p-8 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 italic">Flux Stratégique Andromeda</h3>
                            <span className="text-[9px] font-black text-white bg-emerald-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Realtime Signal</span>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                               <thead className="bg-slate-50/50">
                                  <tr>
                                     <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostic / Client</th>
                                     <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Signal</th>
                                     <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50">
                                  {andromedaAudits.map(audit => (
                                     <tr key={audit.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5">
                                           <span className="text-[11px] font-black block text-slate-900 uppercase tracking-tight mb-0.5">{audit.name || 'Audit P&L'}</span>
                                           <span className="text-[9px] text-slate-400 italic font-medium">{audit.profiles?.email || 'Visiteur'}</span>
                                           <span className="text-[7px] text-slate-300 uppercase block font-black mt-1">{new Date(audit.created_at).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                           <div className="flex flex-col items-center gap-1.5">
                                              <span className={`text-xs font-black ${(audit.emq_score || 0) >= 8 ? 'text-emerald-600' : 'text-amber-500'}`}>{audit.emq_score || '0'}/10</span>
                                              <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                 <div className={`h-full ${(audit.emq_score || 0) >= 8 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-400'}`} style={{ width: `${(audit.emq_score || 0) * 10}%` }}></div>
                                              </div>
                                           </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                           <button onClick={() => setViewingAudit(audit)} className="text-emerald-600 font-black text-[10px] hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl border border-emerald-100 uppercase transition-all shadow-sm">Ouvrir →</button>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                         {andromedaAudits.length === 0 && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 opacity-50 italic">Aucun flux P&L détecté.</div>
                         )}
                      </div>

                      {/* FLUX VISION */}
                      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col min-h-[500px]">
                         <div className="p-8 border-b border-slate-100 bg-indigo-50/20 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-800 italic">Flux Créatif Vision</h3>
                            <span className="text-[9px] font-black text-white bg-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Vision AI</span>
                         </div>
                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                               <thead className="bg-slate-50/50">
                                  <tr>
                                     <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Visuel Analysé</th>
                                     <th className="px-8 py-5 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Score Vision</th>
                                     <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-50">
                                  {creativeAudits.map(audit => (
                                     <tr key={audit.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-5 flex items-center gap-5">
                                           <div className="w-14 h-14 rounded-[1.25rem] bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                              {audit.inputs?.creativeImageUrl ? (
                                                 <img src={audit.inputs.creativeImageUrl} className="w-full h-full object-cover" />
                                              ) : (
                                                 <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
                                              )}
                                           </div>
                                           <div className="min-w-0">
                                              <span className="text-[11px] font-black block truncate text-slate-900 uppercase tracking-tight mb-0.5">{audit.name || 'Analyse Vision'}</span>
                                              <span className="text-[9px] text-slate-400 italic font-medium truncate block">{audit.profiles?.email || 'Visiteur'}</span>
                                              <span className="text-[7px] text-slate-300 uppercase block font-black mt-1">{new Date(audit.created_at).toLocaleDateString()}</span>
                                           </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 shadow-sm">{audit.emq_score || '0'}/10</span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                           <button onClick={() => setViewingAudit(audit)} className="text-indigo-600 font-black text-[10px] hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl border border-indigo-100 uppercase transition-all shadow-sm">Analyse →</button>
                                        </td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                         {creativeAudits.length === 0 && !loading && (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-slate-400 opacity-50 italic">Aucun flux Vision détecté.</div>
                         )}
                      </div>
                   </div>
                </div>
             ) : (
                /* PIPELINE CRM COMPLET - RÉCUPÉRATION DE TOUS LES PROFILS */
                <div className="bg-white rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                   <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-inner">🎯</div>
                         <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Tous mes Clients Inscrits</h3>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leads.length} Clients Répertoriés</p>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-8 py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Client / Email</th>
                               <th className="px-8 py-6 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget Mensuel</th>
                               <th className="px-8 py-6 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Niche / Secteur</th>
                               <th className="px-8 py-6 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Dernier Diagnostic</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {leads.map((lead) => {
                               const lastAudit = lead.lastSimulation;
                               const budgetStr = lastAudit?.inputs?.currentBudget || '0';
                               const budget = parseFloat(budgetStr);
                               const roas = parseFloat(lastAudit?.inputs?.currentRoas || '0');
                               const isHot = budget >= 5000 || roas >= 3.5;
                               
                               return (
                                  <tr key={lead.user.id} className="hover:bg-slate-50/80 transition-colors">
                                     <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                           <div className="flex items-center gap-3 mb-1">
                                              <span className="text-[11px] font-black uppercase text-slate-900 tracking-tight">
                                                 {lead.user.full_name || 'Client Anonyme'}
                                              </span>
                                              {isHot && (
                                                 <span className="bg-red-500 text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest animate-pulse shadow-sm">HOT LEAD 🔥</span>
                                              )}
                                           </div>
                                           <div className="flex items-center gap-2">
                                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                                                 lead.status === 'new' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                 lead.status === 'buyer' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                                 'bg-amber-50 text-amber-600 border-amber-100'
                                              }`}>{lead.status}</span>
                                              <span className="text-[8px] text-slate-400 italic">{lead.user.email}</span>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-8 py-6 text-center">
                                        <span className={`text-[13px] font-black tabular-nums ${budget >= 5000 ? 'text-indigo-600' : 'text-slate-700'}`}>{budget > 0 ? formatCurrency(budget) : 'N/A'}</span>
                                     </td>
                                     <td className="px-8 py-6 text-center">
                                        <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100/80 px-4 py-1.5 rounded-xl border border-slate-200/50">{lead.user.niche || lastAudit?.inputs?.niche || 'Inconnu'}</span>
                                     </td>
                                     <td className="px-8 py-6 text-right">
                                        <div className="flex flex-col items-end">
                                           <span className="text-[11px] font-black text-slate-900 uppercase truncate max-w-[180px] mb-0.5">{lastAudit?.name || 'Aucun Historique'}</span>
                                           <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest italic">{lastAudit ? new Date(lastAudit.date).toLocaleDateString() : '--'}</span>
                                        </div>
                                     </td>
                                  </tr>
                                );
                            })}
                         </tbody>
                      </table>
                   </div>
                   {leads.length === 0 && !loading && (
                      <div className="p-32 text-center text-slate-400 italic font-medium">Aucun profil client détecté en base de données.</div>
                   )}
                </div>
             )}
          </div>
      </main>

      {/* MODAL OVERRIDE EXPERT */}
      {viewingAudit && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl flex flex-col animate-fade-in">
           <header className="h-24 px-12 border-b border-white/10 flex items-center justify-between shrink-0">
              <Logo className="invert brightness-0 scale-75" />
              <div className="flex items-center gap-10">
                 <div className="text-right text-white">
                    <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.3em] mb-1.5">VUE ARCHITECTE GOUVERNEUR</p>
                    <div className="flex items-center gap-3 justify-end">
                       <p className="text-xs font-black uppercase leading-none">Diagnostic Client : <span className="text-indigo-300">{(viewingAudit as any).profiles?.email}</span></p>
                       <ExpertAvatar className="w-8 h-8 border-white/10" />
                    </div>
                 </div>
                 <button onClick={() => setViewingAudit(null)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl hover:bg-red-500 transition-all text-white border border-white/10 shadow-xl group">
                    <span className="group-hover:rotate-90 transition-transform block">✕</span>
                 </button>
              </div>
           </header>
           <div className="flex-1 overflow-y-auto p-12 bg-slate-900/40">
              <div className="max-w-5xl mx-auto bg-white rounded-[4rem] overflow-hidden text-slate-900 shadow-[0_0_120px_rgba(99,102,241,0.25)]">
                {viewingAudit.type === 'CREATIVE' ? (
                   <CreativeResultDisplay report={viewingAudit} />
                ) : (
                   <ResultsDisplay results={viewingAudit.results} inputs={viewingAudit.inputs} />
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
