
import React, { useEffect, useState, useMemo } from 'react';
import { LeadData, UserProfile, SimulationHistory, Guide } from '../types';
import { AdminService, AuditService } from '../services/storage';
import { ResultsDisplay } from './ResultsDisplay';
import { Logo } from './Logo';

interface AdminDashboardProps {
  adminUser: UserProfile;
  onLogout: () => void;
  onLeadsSeen?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout, onLeadsSeen }) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'guides'>('pipeline');
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'premium'>('all');
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expertNote, setExpertNote] = useState('');
  const [consultingInput, setConsultingInput] = useState<string>('0');
  const [showFullReport, setShowFullReport] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getGlobalLeads();
      setLeads(data);
    } catch (e) {
      console.error("Erreur chargement leads:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadLeads();
    setGuides(AdminService.getGuides());
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const closingPitch = useMemo(() => {
    if (!selectedLead || !selectedLead.lastSimulation) return { title: 'Prospect Froid', text: 'Aucune donnée disponible. Attendez que le client lance son premier audit Andromeda.' };
    const inputs = selectedLead.lastSimulation.inputs;
    const results = selectedLead.lastSimulation.results;
    const emq = parseFloat(inputs.emqScore) || 0;
    const ltv = parseFloat(inputs.ltv) || 0;
    const pmv = parseFloat(inputs.pmv) || 1;
    const budget = parseFloat(inputs.currentBudget) || 0;
    const latent = (results.tresorerieLatenteHebdo || 0) * 4.34;

    if (emq < 6) {
      return {
        title: "Priorité : Réparation Signal/CAPI",
        text: `Son Pixel est 'aveugle' (Score EMQ: ${emq}/10). Il dépense ${formatCurrency(budget)}/mois à l'aveugle. Proposez de réparer le signal pour baisser le CPA.`
      };
    }
    if ((ltv / pmv) < 1.3) {
      return {
        title: "Priorité : Backend & Rétention",
        text: `Sa LTV de ${formatCurrency(ltv)} est trop faible. Proposez d'activer son backend pour doubler la valeur client.`
      };
    }
    return {
      title: "Priorité : Scaling Agressif",
      text: `Tous les voyants sont au vert. Trésorerie latente : ${formatCurrency(latent)}/mois. Sécurisez sa montée en charge.`
    };
  }, [selectedLead]);

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (lead.user.firstName || "").toLowerCase().includes(term);
    const projMatch = lead.lastSimulation ? lead.lastSimulation.name.toLowerCase().includes(term) : false;
    const emailMatch = (lead.user.email || "").toLowerCase().includes(term);
    const matchesSearch = emailMatch || nameMatch || projMatch;
    
    if (filterType === 'buyers') return matchesSearch && (lead.user.purchasedProducts?.length || 0) > 0;
    if (filterType === 'premium') return matchesSearch && (lead.user.consultingValue || 0) > 0;
    return matchesSearch;
  });

  const getStatusDot = (type: 'signal' | 'ltv' | 'scaling', lead: LeadData) => {
    if (!lead.lastSimulation) return <div className="w-2 h-2 rounded-full bg-slate-100" title="Pas de données" />;
    
    let color = 'bg-slate-200';
    const pmv = parseFloat(lead.lastSimulation.inputs.pmv) || 1;
    const ltv = parseFloat(lead.lastSimulation.inputs.ltv) || 1;
    const cpa = parseFloat(lead.lastSimulation.inputs.currentCpa) || 1;
    if (type === 'signal') {
      const emq = parseFloat(lead.lastSimulation.inputs.emqScore) || 0;
      color = emq >= 8 ? 'bg-emerald-500' : emq >= 5 ? 'bg-amber-500' : 'bg-red-500';
    } else if (type === 'ltv') {
      const ratio = ltv / pmv;
      color = ratio > 2.5 ? 'bg-emerald-500' : ratio > 1.2 ? 'bg-amber-500' : 'bg-red-500';
    } else if (type === 'scaling') {
      const targetCpa = lead.lastSimulation.results.targetCpa;
      const realMax = lead.lastSimulation.results.realMaxCpa;
      color = cpa <= targetCpa ? 'bg-emerald-500' : cpa <= realMax ? 'bg-amber-500' : 'bg-red-500';
    }
    return <div className={`w-2 h-2 rounded-full ${color} shadow-sm`} title={type.toUpperCase()} />;
  };

  const handleStatusChange = async (userId: string, newStatus: 'new' | 'contacted' | 'closed') => {
    await AdminService.updateLeadStatus(userId, newStatus);
    setLeads(prev => prev.map(l => l.user.id === userId ? { ...l, status: newStatus } : l));
    if (selectedLead?.user.id === userId) {
      setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
    }
    if (onLeadsSeen) onLeadsSeen();
  };

  const handleUpdateConsulting = async () => {
    if (selectedLead) {
      const value = parseFloat(consultingInput) || 0;
      await AdminService.updateLeadConsulting(selectedLead.user.id, value);
      setLeads(prev => prev.map(l => l.user.id === selectedLead.user.id ? { ...l, user: { ...l.user, consultingValue: value } } : l));
      setSelectedLead(prev => prev ? { ...prev, user: { ...prev.user, consultingValue: value } } : null);
      alert("Valeur Consulting mise à jour !");
    }
  };

  const handleSelectLead = (lead: LeadData) => {
    setSelectedLead(lead);
    setShowFullReport(false);
    setExpertNote(lead.lastSimulation?.notes || '');
    setConsultingInput((lead.user.consultingValue || 0).toString());
    if (lead.status === 'new') handleStatusChange(lead.user.id, 'contacted');
  };

  const handleSaveNote = async () => {
    if (selectedLead && selectedLead.lastSimulation) {
      await AuditService.updateAudit(selectedLead.lastSimulation.id, { notes: expertNote });
      const updatedSim = { ...selectedLead.lastSimulation, notes: expertNote };
      const updatedLead = { ...selectedLead, lastSimulation: updatedSim };
      setSelectedLead(updatedLead);
      setLeads(prev => prev.map(l => l.lastSimulation?.id === updatedSim.id ? updatedLead : l));
      alert("Note d'expert enregistrée !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
              <Logo className="invert brightness-0 scale-90 origin-left" />
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Expert Cockpit v5.3</p>
              </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto space-y-2">
              <button onClick={() => setActiveTab('pipeline')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <span className="text-lg">🎯</span> Pipeline CRM
              </button>
              <button onClick={() => setActiveTab('guides')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'guides' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <span className="text-lg">📚</span> Librairie Guides
              </button>
          </nav>
          <div className="p-4 border-t border-slate-800">
              <button onClick={onLogout} className="w-full bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest border border-slate-700">Déconnexion</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'pipeline' ? (
            <>
              <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
                  <div className="flex items-center gap-4">
                    <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Flux Pipeline</h1>
                    <button onClick={loadLeads} disabled={loading} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>Tous</button>
                        <button onClick={() => setFilterType('buyers')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'buyers' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>Acheteurs</button>
                        <button onClick={() => setFilterType('premium')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'premium' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'}`}>Consulting</button>
                    </div>
                  </div>
                  <div className="relative w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input type="text" placeholder="Nom, email ou projet..." className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl text-xs font-medium outline-none transition-all focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
              </header>

              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-[10px] font-black uppercase tracking-widest">Mise à jour...</p>
                        </div>
                      ) : filteredLeads.length === 0 ? (
                        <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-200 shadow-sm">
                           <p className="text-4xl mb-4">🏜️</p>
                           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Aucun prospect trouvé</h3>
                           <p className="text-xs text-slate-400 italic">Vérifiez vos filtres ou invitez de nouveaux utilisateurs.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                          <table className="min-w-full divide-y divide-slate-100 table-fixed">
                              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                                  <tr>
                                      <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest w-64">Identité & Projet</th>
                                      <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Statut Client</th>
                                      <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest w-32">Andromeda Triage</th>
                                      <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscrit</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredLeads.map((lead) => {
                                    const isBuyer = (lead.user.purchasedProducts?.length || 0) > 0;
                                    const isConsulting = (lead.user.consultingValue || 0) > 0;
                                    return (
                                      <tr key={lead.user.id} onClick={() => handleSelectLead(lead)} className={`cursor-pointer transition-all hover:bg-slate-50 ${selectedLead?.user.id === lead.user.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : ''}`}>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-4">
                                                {lead.user.email === 'shopiflight@gmail.com' ? (
                                                  <img src="IMG_2492.jpg" className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" alt="Alexia" />
                                                ) : (
                                                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 border border-indigo-100 shadow-inner">
                                                    {lead.user.firstName?.charAt(0) || "P"}
                                                  </div>
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                  <div className="flex items-center gap-2">
                                                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">
                                                        {lead.user.firstName || lead.user.email}
                                                     </span>
                                                     {lead.user.email === adminUser.email && <span className="text-[7px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-black">MOI</span>}
                                                  </div>
                                                  <span className="text-[9px] text-indigo-600 font-bold uppercase italic truncate">
                                                    {lead.lastSimulation ? lead.lastSimulation.name : "Aucun Audit Lancé"}
                                                  </span>
                                                  <span className="text-[9px] text-slate-400 font-medium lowercase truncate mt-0.5 opacity-60">{lead.user.email}</span>
                                                </div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-4 text-center">
                                              <div className="flex flex-col items-center gap-1">
                                                 {isConsulting && <span className="text-[7px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">Premium</span>}
                                                 {isBuyer && <span className="text-[7px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-sm">Acheteur</span>}
                                                 {!isConsulting && !isBuyer && <span className="text-[7px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Prospect</span>}
                                              </div>
                                          </td>
                                          <td className="px-4 py-4 text-center">
                                              <div className="flex justify-center gap-1.5">
                                                  {getStatusDot('signal', lead)}
                                                  {getStatusDot('ltv', lead)}
                                                  {getStatusDot('scaling', lead)}
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 text-right">
                                              <span className="text-[9px] text-slate-400 font-black uppercase">
                                                {new Date(lead.user.createdAt).toLocaleDateString()}
                                              </span>
                                          </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                          </table>
                        </div>
                      )}
                  </div>

                  <div className="w-[550px] overflow-y-auto bg-white border-l border-slate-200 shrink-0 flex flex-col shadow-2xl">
                      {selectedLead ? (
                        <div className="flex-1 flex flex-col min-h-0">
                          {showFullReport && selectedLead.lastSimulation ? (
                            <div className="flex-1 overflow-y-auto relative bg-slate-50">
                               <button onClick={() => setShowFullReport(false)} className="fixed top-24 right-12 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all">
                                 &larr; Retour CRM
                               </button>
                               <div className="scale-90 origin-top pt-10">
                                  <ResultsDisplay inputs={selectedLead.lastSimulation.inputs} results={selectedLead.lastSimulation.results} />
                               </div>
                            </div>
                          ) : (
                            <div className="p-8 space-y-8 animate-fade-in flex-1 overflow-y-auto">
                                {/* HEADER PROFIL DÉTAILLÉ */}
                                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                                   <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                   <div className="relative z-10 flex justify-between items-start">
                                      <div className="space-y-1">
                                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic mb-2">IDENTITÉ DÉTECTÉE</p>
                                         <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedLead.user.firstName || selectedLead.user.email}</h2>
                                         <p className="text-sm text-slate-300 font-bold">{selectedLead.user.email}</p>
                                         <p className="text-[10px] text-slate-500 font-medium italic">Inscrit le {new Date(selectedLead.user.createdAt).toLocaleDateString()} à {new Date(selectedLead.user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                      </div>
                                      <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.user.id, e.target.value as any)} className="bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl text-white outline-none cursor-pointer shadow-inner">
                                           <option value="new" className="text-slate-900">🔴 Nouveau</option>
                                           <option value="contacted" className="text-slate-900">🟠 En Cours</option>
                                           <option value="closed" className="text-slate-900">🟢 Terminé</option>
                                      </select>
                                   </div>
                                   
                                   <div className="mt-8 flex gap-3">
                                      {(selectedLead.user.consultingValue || 0) > 0 && (
                                        <span className="bg-indigo-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">💎 Premium Consulting</span>
                                      )}
                                      {(selectedLead.user.purchasedProducts?.length || 0) > 0 && (
                                        <span className="bg-emerald-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">🛒 Acheteur Digital</span>
                                      )}
                                   </div>
                                </div>

                                {/* FINANCES & PRODUITS */}
                                <div className="grid grid-cols-2 gap-4">
                                   <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between shadow-sm">
                                      <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Valeur Consulting</h4>
                                      <div className="space-y-4">
                                         <div className="flex items-center gap-2">
                                            <input type="number" value={consultingInput} onChange={(e) => setConsultingInput(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 ring-indigo-500/20 outline-none" placeholder="0 €" />
                                            <button onClick={handleUpdateConsulting} className="bg-indigo-600 text-white p-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100">OK</button>
                                         </div>
                                         <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-inner">
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Encaissé</p>
                                            <p className="text-xl font-black text-slate-900">{formatCurrency(selectedLead.user.consultingValue || 0)}</p>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="bg-indigo-50 p-6 rounded-[2.5rem] border border-indigo-100 flex flex-col shadow-sm">
                                      <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Bibliothèque Clients</h4>
                                      <div className="flex-1 space-y-3">
                                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Produits actifs :</p>
                                         <div className="flex flex-wrap gap-1.5">
                                            {(selectedLead.user.purchasedProducts?.length || 0) > 0 ? (
                                              selectedLead.user.purchasedProducts?.map(p => (
                                                <span key={p} className="bg-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border border-indigo-100 text-indigo-600 shadow-sm">{p}</span>
                                              ))
                                            ) : (
                                              <p className="text-[9px] text-slate-400 italic font-medium leading-relaxed">Aucun guide acheté.</p>
                                            )}
                                         </div>
                                      </div>
                                   </div>
                                </div>
                                
                                {/* AUDIT RÉCENT */}
                                {!selectedLead.lastSimulation ? (
                                  <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center border border-dashed border-slate-200">
                                    <span className="text-4xl block mb-4">🧊</span>
                                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">Aucun audit Andromeda</h5>
                                    <p className="text-[10px] text-slate-400 italic max-w-[200px] mx-auto leading-relaxed">Cet utilisateur n'a pas encore lancé de diagnostic de performance.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-2">Provision Hebdo</p>
                                            <p className="text-3xl font-black text-white">{formatCurrency(selectedLead.lastSimulation.results.tresorerieLatenteHebdo || 0)}</p>
                                        </div>
                                        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Andromeda Score</p>
                                            <p className="text-3xl font-black text-emerald-400">{selectedLead.lastSimulation.inputs.emqScore}/10</p>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] space-y-6 shadow-sm">
                                       <div className="flex justify-between items-center">
                                          <div className="max-w-[70%]">
                                             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dernier Audit</h3>
                                             <p className="text-lg font-black text-slate-900 uppercase italic tracking-tighter truncate">{selectedLead.lastSimulation.name}</p>
                                          </div>
                                          <button onClick={() => setShowFullReport(true)} className="bg-slate-50 text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-50 transition-all">
                                             Voir Rapport &rarr;
                                          </button>
                                       </div>
                                       <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] shadow-inner">
                                          <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-3">Argumentaire Closing Andromeda</h3>
                                          <p className="text-[11px] text-indigo-900 font-medium italic leading-relaxed">"{closingPitch.text}"</p>
                                       </div>
                                    </div>
                                  </div>
                                )}

                                {/* NOTES EXPERT */}
                                <div className="space-y-4 pb-12">
                                   <div className="flex items-center gap-2">
                                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes Stratégiques Internes</h3>
                                      <span className="h-px flex-1 bg-slate-100"></span>
                                   </div>
                                   <textarea 
                                     className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-xs font-medium focus:ring-2 ring-indigo-500/20 outline-none transition-all placeholder:text-slate-300 shadow-inner" 
                                     placeholder="Quelles sont les prochaines étapes pour ce client ? (Note privée)" 
                                     value={expertNote} 
                                     onChange={(e) => setExpertNote(e.target.value)} 
                                   />
                                   <button 
                                     onClick={handleSaveNote} 
                                     className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all disabled:opacity-30 active:scale-95"
                                   >
                                     Enregistrer Note Expert &rarr;
                                   </button>
                                </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                            <Logo iconOnly className="scale-150 mb-10 opacity-20" />
                            <p className="font-black uppercase tracking-[0.4em] text-[11px]">Cockpit Pipeline AdsPilot</p>
                            <p className="text-[10px] text-slate-400 mt-2 italic">Sélectionnez un profil pour voir ses performances Meta.</p>
                        </div>
                      )}
                  </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Gestion des <span className="text-indigo-600">Offres Digitales</span></h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {guides.map(guide => (
                    <div key={guide.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-inner">{guide.icon}</div>
                       <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{guide.title}</h4>
                       <p className="text-xs text-slate-400 mb-6 italic leading-relaxed">{guide.description}</p>
                       <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                          <span className="text-xl font-black text-slate-900">{guide.price}</span>
                          <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Modifier &rarr;</button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
      </main>
    </div>
  );
};
