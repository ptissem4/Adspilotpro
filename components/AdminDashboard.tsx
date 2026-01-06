
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

// Composant pour le Drawer Historique Client
const LeadDrawer = ({ lead, onClose }: { lead: LeadData, onClose: () => void }) => {
  const [history, setHistory] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await AdminService.getUserHistory(lead.user.id);
      setHistory(data);
      setLoading(false);
    };
    fetchHistory();
  }, [lead]);

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-fade-in">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100">✕</button>
        
        <div className="mb-8">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">👤</div>
              <div>
                 <h2 className="text-2xl font-black uppercase text-slate-900 leading-none">{lead.user.full_name}</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">{lead.user.email}</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                 <p className="text-[10px] font-black uppercase text-slate-400">Marque</p>
                 <p className="font-bold text-slate-900">{lead.user.brand_name || 'Non renseigné'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                 <p className="text-[10px] font-black uppercase text-slate-400">Site Web</p>
                 <a href={lead.user.website_url} target="_blank" className="font-bold text-indigo-600 truncate block">{lead.user.website_url || 'Non renseigné'}</a>
              </div>
           </div>
        </div>

        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b pb-4 mb-6">Historique des Scans</h3>
        
        {loading ? (
           <div className="text-center py-10 text-slate-400 animate-pulse">Chargement de la Timeline...</div>
        ) : history.length === 0 ? (
           <div className="text-center py-10 text-slate-400 italic">Aucune activité enregistrée.</div>
        ) : (
           <div className="space-y-6 relative border-l-2 border-slate-100 ml-3 pl-8">
              {history.map((audit) => (
                 <div key={audit.id} className="relative">
                    <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white bg-indigo-500 shadow-md"></div>
                    <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">{audit.type || 'ANDROMEDA'}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{new Date(audit.date).toLocaleDateString()}</span>
                       </div>
                       <h4 className="font-bold text-slate-900 mb-2">{audit.name}</h4>
                       {audit.inputs?.currentBudget && (
                          <div className="text-xs text-slate-600 bg-slate-50 inline-block px-2 py-1 rounded">
                             Budget: {parseFloat(audit.inputs.currentBudget).toLocaleString()}€
                          </div>
                       )}
                       <p className="mt-3 text-xs italic text-slate-500 border-t pt-2">Verdict: {audit.verdictLabel}</p>
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>
    </div>
  );
};

// Modal d'édition
const EditLeadModal = ({ lead, onClose, onSave }: { lead: LeadData, onClose: () => void, onSave: (id: string, data: any) => void }) => {
  const [formData, setFormData] = useState({
    full_name: lead.user.full_name || '',
    email: lead.user.email || '',
    status: lead.status || 'new'
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
       <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-fade-in">
          <h3 className="text-xl font-black uppercase text-slate-900 mb-6">Modifier le Prospect</h3>
          <div className="space-y-4">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
                <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border rounded-xl p-3 mt-1 font-medium focus:ring-2 ring-indigo-500 outline-none" />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Statut</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as LeadData['status']})} className="w-full border rounded-xl p-3 mt-1 font-medium focus:ring-2 ring-indigo-500 outline-none">
                   <option value="new">Nouveau Prospect</option>
                   <option value="waitlist">Waitlist Andromeda</option>
                   <option value="contacted">Contacté</option>
                   <option value="buyer">Client Actif</option>
                   <option value="closed">Fermé / Perdu</option>
                </select>
             </div>
          </div>
          <div className="flex gap-4 mt-8">
             <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Annuler</button>
             <button onClick={() => onSave(lead.user.id, formData)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg">Sauvegarder</button>
          </div>
       </div>
    </div>
  );
};

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
  
  // Nouveaux états pour le Pipeline amélioré
  const [sortConfig, setSortConfig] = useState<{ key: 'budget' | 'date', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [editingLead, setEditingLead] = useState<LeadData | null>(null);

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
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm("Gouverneur, purger cet audit définitivement de l'Empire ?")) return;
    try {
      const { error } = await supabase.from('audits').delete().eq('id', id);
      if (error) alert("Erreur: " + error.message);
      else setAllAudits(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  // Gestion CRUD Leads
  const handleDeleteLead = async (id: string) => {
    if (!window.confirm("⚠️ Attention Gouverneur : Cette action supprimera le client et tout son historique. Confirmer ?")) return;
    try {
      await AdminService.deleteUser(id);
      setLeads(prev => prev.filter(l => l.user.id !== id));
    } catch (e) { alert("Erreur lors de la suppression."); }
  };

  const handleUpdateLead = async (id: string, data: any) => {
    try {
      await AdminService.updateLeadProfile(id, data);
      setEditingLead(null);
      loadData(); // Recharger pour voir les changements
    } catch (e) { alert("Erreur mise à jour."); }
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

  // Logique de tri pour le Pipeline
  const sortedLeads = useMemo(() => {
    let sorted = [...leads];
    if (searchTerm) {
       sorted = sorted.filter(l => l.user.email.toLowerCase().includes(searchTerm.toLowerCase()) || (l.user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    return sorted.sort((a, b) => {
      if (sortConfig.key === 'budget') {
        const budgetA = parseFloat(a.lastSimulation?.inputs?.currentBudget || '0');
        const budgetB = parseFloat(b.lastSimulation?.inputs?.currentBudget || '0');
        return sortConfig.direction === 'asc' ? budgetA - budgetB : budgetB - budgetA;
      } else {
        const dateA = new Date(a.user.createdAt).getTime();
        const dateB = new Date(b.user.createdAt).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [leads, sortConfig, searchTerm]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'waitlist': return <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-200">Waitlist</span>;
      case 'buyer': return <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-200">Client Actif</span>;
      case 'contacted': return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-200">Contacté</span>;
      case 'closed': return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-200">Perdu</span>;
      default: return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">Prospect</span>;
    }
  };

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
      
      {/* Drawer & Modals */}
      {selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}
      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} onSave={handleUpdateLead} />}

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
                // ... (SECTION EMPIRE EXISTANTE - inchangée visuellement mais conservée dans le rendu conditionnel)
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
                // --- SECTION PIPELINE AMÉLIORÉE ---
                <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] border border-slate-200 overflow-hidden shadow-2xl animate-fade-in flex flex-col">
                   {/* Header avec Filtres */}
                   <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-inner text-indigo-600">🎯</div>
                         <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 italic">Pipeline CRM</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sortedLeads.length} Prospects Actifs</p>
                         </div>
                      </div>
                      
                      {/* Toolbar de tri */}
                      <div className="flex gap-2">
                         <button 
                            onClick={() => setSortConfig({ key: 'date', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${sortConfig.key === 'date' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                         >
                            📅 Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                         </button>
                         <button 
                            onClick={() => setSortConfig({ key: 'budget', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${sortConfig.key === 'budget' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}
                         >
                            💰 Budget {sortConfig.key === 'budget' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                         </button>
                      </div>
                   </div>

                   <div className="overflow-x-auto scrollbar-hide">
                      <table className="min-w-full divide-y divide-slate-100">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pl-8">Client</th>
                               <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                               <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                               <th className="px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Diagnostic</th>
                               <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest pr-8">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {sortedLeads.map((lead) => {
                               const budgetRaw = lead.lastSimulation?.inputs?.currentBudget;
                               const budget = budgetRaw ? parseFloat(budgetRaw) : 0;
                               
                               return (
                                  <tr key={lead.user.id} className="hover:bg-slate-50/80 transition-colors group">
                                     <td className="px-6 py-4 pl-8">
                                        <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                              {lead.user.full_name?.charAt(0) || lead.user.email.charAt(0)}
                                           </div>
                                           <div className="flex flex-col">
                                              <span className="text-[11px] font-black uppercase text-slate-900 truncate max-w-[150px]">{lead.user.full_name || 'Anonyme'}</span>
                                              <span className="text-[9px] text-slate-400 italic truncate max-w-[150px]">{lead.user.email}</span>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        {getStatusBadge(lead.status || 'new')}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        {budget > 0 ? (
                                           <span className="text-xs font-black text-slate-900">{formatCurrency(budget)}</span>
                                        ) : (
                                           <span className="text-[9px] text-slate-300 italic">N/A</span>
                                        )}
                                     </td>
                                     <td className="px-6 py-4 text-center">
                                        <button 
                                          onClick={() => setSelectedLead(lead)}
                                          className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 uppercase tracking-widest"
                                        >
                                           Voir Historique &rarr;
                                        </button>
                                     </td>
                                     <td className="px-6 py-4 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                           <button 
                                              onClick={() => setEditingLead(lead)}
                                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                                              title="Éditer"
                                           >
                                              ✎
                                           </button>
                                           <button 
                                              onClick={() => handleDeleteLead(lead.user.id)}
                                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-lg border border-transparent hover:border-red-100 transition-all"
                                              title="Supprimer"
                                           >
                                              🗑️
                                           </button>
                                        </div>
                                     </td>
                                  </tr>
                               );
                            })}
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