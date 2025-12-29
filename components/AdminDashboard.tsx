
import React, { useEffect, useState, useMemo } from 'react';
import { LeadData, UserProfile, SimulationHistory, Guide } from '../types';
import { AdminService, AuditService } from '../services/storage';
import { supabase } from '../services/supabase';
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
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'premium'>('all');
  const [showFullReport, setShowFullReport] = useState(false);
  const [expertNote, setExpertNote] = useState('');
  const [consultingInput, setConsultingInput] = useState<string>('0');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await AdminService.getGlobalLeads();
      setLeads(data);
    } catch (e) {
      console.error("Erreur chargement leads dashboard:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadLeads();
    const channel = supabase.channel('admin_pipeline_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadLeads()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const closingPitch = useMemo(() => {
    if (!selectedLead || !selectedLead.lastSimulation) return { title: 'Prospect Froid', text: 'En attente de son premier diagnostic Andromeda.' };
    const inputs = selectedLead.lastSimulation.inputs;
    const emq = parseFloat(inputs.emqScore) || 0;
    const budget = parseFloat(inputs.currentBudget) || 0;

    if (emq < 6) return { title: "Priorité : Signal", text: `Pixel aveugle (${emq}/10). Vendez-lui SOS Signal.` };
    return { title: "Priorité : Scaling", text: "Structure stable. Sécurisez la montée en charge verticale." };
  }, [selectedLead]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const term = searchTerm.toLowerCase();
      const nameMatch = (lead.user.full_name || "").toLowerCase().includes(term);
      const emailMatch = (lead.user.email || "").toLowerCase().includes(term);
      const matchesSearch = nameMatch || emailMatch;
      
      if (filterType === 'buyers') return matchesSearch && (lead.user.purchasedProducts?.length || 0) > 0;
      if (filterType === 'premium') return matchesSearch && (lead.user.consultingValue || 0) > 0;
      return matchesSearch;
    });
  }, [leads, searchTerm, filterType]);

  const getStatusDot = (type: 'signal' | 'ltv' | 'scaling', lead: LeadData) => {
    if (!lead.lastSimulation) return <div className="w-2 h-2 rounded-full bg-slate-200" />;
    let color = 'bg-slate-200';
    const inputs = lead.lastSimulation.inputs;
    if (type === 'signal') {
      const emq = parseFloat(inputs.emqScore) || 0;
      color = emq >= 8 ? 'bg-emerald-500' : emq >= 5 ? 'bg-amber-500' : 'bg-red-500';
    } else if (type === 'ltv') {
      const ratio = (parseFloat(inputs.ltv) || 1) / (parseFloat(inputs.pmv) || 1);
      color = ratio > 1.3 ? 'bg-emerald-500' : 'bg-red-500';
    } else if (type === 'scaling') {
      color = lead.lastSimulation.results.recommendationType === 'scale' ? 'bg-emerald-500' : 'bg-amber-500';
    }
    return <div className={`w-2 h-2 rounded-full ${color}`} />;
  };

  const handleSelectLead = (lead: LeadData) => {
    setSelectedLead(lead);
    setShowFullReport(false);
    setExpertNote(lead.lastSimulation?.notes || '');
    setConsultingInput((lead.user.consultingValue || 0).toString());
    if (lead.status === 'new') handleStatusChange(lead.user.id, 'contacted');
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await AdminService.updateLeadStatus(userId, newStatus);
    setLeads(prev => prev.map(l => l.user.id === userId ? { ...l, status: newStatus as any } : l));
  };

  const handleUpdateConsulting = async () => {
    if (selectedLead) {
      const value = parseFloat(consultingInput) || 0;
      await AdminService.updateLeadConsulting(selectedLead.user.id, value);
      loadLeads();
      alert("Consulting mis à jour !");
    }
  };

  const handleSaveNote = async () => {
    if (selectedLead && selectedLead.lastSimulation) {
      await AuditService.updateAudit(selectedLead.lastSimulation.id, { notes: expertNote });
      alert("Note enregistrée !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      {/* SIDEBAR V5.3 */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
              <Logo className="invert brightness-0 scale-90 origin-left" />
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Expert Cockpit v5.3</p>
              </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto space-y-2">
              <button onClick={() => setActiveTab('pipeline')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                🎯 Pipeline CRM
              </button>
          </nav>
          <div className="p-4 border-t border-slate-800 flex items-center gap-4">
              <img src="IMG_2492.jpg" className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-xl" alt="Alexia" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase truncate">Alexia</p>
                <p className="text-[8px] text-slate-500 truncate uppercase tracking-widest">Admin Principal</p>
              </div>
          </div>
          <div className="p-4">
              <button onClick={onLogout} className="w-full bg-slate-800 text-slate-400 hover:text-white py-2 rounded-lg text-[9px] font-black uppercase">Déconnexion</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-6">
                <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Flux Pipeline</h1>
                <div className="flex gap-2">
                    <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Tous ({leads.length})</button>
                    <button onClick={() => setFilterType('buyers')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'buyers' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Acheteurs</button>
                    <button onClick={() => setFilterType('premium')} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${filterType === 'premium' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>Consulting</button>
                </div>
              </div>
              <div className="relative w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input type="text" placeholder="Rechercher par nom..." className="w-full bg-slate-50 border border-slate-200 py-2 rounded-xl text-xs font-medium pl-10 outline-none focus:ring-2 ring-indigo-500/20" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
              {/* LISTE DES PROSPECTS RÉELLE */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  {loading && leads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-[9px] font-black uppercase tracking-widest">Initialisation Andromeda...</p>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-200">
                       <p className="text-4xl mb-4">🏜️</p>
                       <p className="font-black uppercase text-sm text-slate-900">Pipeline Vide</p>
                       <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 italic">Aucun profil correspondant trouvé dans la base.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-100">
                          <thead className="bg-slate-50 sticky top-0 z-10">
                              <tr>
                                  <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest w-72">Identité & Projet</th>
                                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                  <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Andromeda Triage</th>
                                  <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscrit</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                              {filteredLeads.map((lead) => (
                                <tr key={lead.user.id} onClick={() => handleSelectLead(lead)} className={`cursor-pointer transition-all hover:bg-slate-50 ${selectedLead?.user.id === lead.user.id ? 'bg-indigo-50 ring-1 ring-indigo-200' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs shrink-0 border border-indigo-100">
                                            {(lead.user.full_name || "P").charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{lead.user.full_name}</span>
                                            <span className={`text-[9px] font-bold uppercase italic truncate ${lead.lastSimulation ? 'text-indigo-600' : 'text-slate-300'}`}>
                                              {lead.lastSimulation ? lead.lastSimulation.name : "En attente d'audit"}
                                            </span>
                                          </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                           {(lead.user.consultingValue || 0) > 0 && <span className="text-[7px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Premium</span>}
                                           {(lead.user.purchasedProducts?.length || 0) > 0 && <span className="text-[7px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase">Acheteur</span>}
                                           {(lead.user.consultingValue || 0) === 0 && (lead.user.purchasedProducts?.length || 0) === 0 && <span className="text-[7px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Lead</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex justify-center gap-2">
                                            {getStatusDot('signal', lead)}
                                            {getStatusDot('ltv', lead)}
                                            {getStatusDot('scaling', lead)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-[9px] text-slate-400 font-black uppercase">{new Date(lead.user.createdAt).toLocaleDateString()}</span>
                                    </td>
                                </tr>
                              ))}
                          </tbody>
                      </table>
                    </div>
                  )}
              </div>

              {/* PANNEAU DE DROITE (DÉTAILS) */}
              <div className="w-[500px] overflow-y-auto bg-white border-l border-slate-200 shrink-0 flex flex-col shadow-2xl">
                  {selectedLead ? (
                    <div className="flex-1 flex flex-col">
                      {showFullReport && selectedLead.lastSimulation ? (
                        <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                           <button onClick={() => setShowFullReport(false)} className="fixed top-24 right-12 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-600">
                             &larr; Retour Cockpit
                           </button>
                           <div className="scale-90 origin-top pt-10">
                              <ResultsDisplay inputs={selectedLead.lastSimulation.inputs} results={selectedLead.lastSimulation.results} />
                           </div>
                        </div>
                      ) : (
                        <div className="p-8 space-y-8 animate-fade-in flex-1 overflow-y-auto scrollbar-hide">
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                               <div className="relative z-10 flex justify-between items-start">
                                  <div className="space-y-1">
                                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 italic">IDENTITÉ DÉTECTÉE</p>
                                     <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{selectedLead.user.full_name}</h2>
                                     <p className="text-sm text-slate-300 font-bold">{selectedLead.user.email}</p>
                                  </div>
                                  <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.user.id, e.target.value)} className="bg-white/10 border border-white/20 text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl text-white outline-none cursor-pointer">
                                       <option value="new" className="text-slate-900">🔴 Nouveau</option>
                                       <option value="contacted" className="text-slate-900">🟠 En Cours</option>
                                       <option value="closed" className="text-slate-900">🟢 Terminé</option>
                                  </select>
                               </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-between shadow-sm">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Consulting Encaissé</h4>
                                  <div className="flex items-center gap-2">
                                     <input type="number" value={consultingInput} onChange={(e) => setConsultingInput(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 ring-indigo-500/20 outline-none" placeholder="0 €" />
                                     <button onClick={handleUpdateConsulting} className="bg-indigo-600 text-white p-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-100 active:scale-95">OK</button>
                                  </div>
                               </div>
                               <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col shadow-sm">
                                  <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-4">Produits Actifs</h4>
                                  <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-24 scrollbar-hide">
                                     {(selectedLead.user.purchasedProducts?.length || 0) > 0 ? (
                                       selectedLead.user.purchasedProducts?.map(p => (
                                         <span key={p} className="bg-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase border border-indigo-100 text-indigo-600 shadow-sm">{p}</span>
                                       ))
                                     ) : (
                                       <p className="text-[9px] text-slate-400 italic font-medium leading-relaxed">Aucun achat détecté.</p>
                                     )}
                                  </div>
                                </div>
                            </div>
                            
                            {selectedLead.lastSimulation ? (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-2">Provision Hebdo</p>
                                        <p className="text-3xl font-black">{formatCurrency(selectedLead.lastSimulation.results.tresorerieLatenteHebdo || 0)}</p>
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
                                         <p className="text-lg font-black text-slate-900 uppercase italic truncate tracking-tighter">{selectedLead.lastSimulation.name}</p>
                                      </div>
                                      <button onClick={() => setShowFullReport(true)} className="bg-slate-50 text-indigo-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-100 hover:bg-indigo-50 shadow-sm">
                                         Voir Rapport &rarr;
                                      </button>
                                   </div>
                                   <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[2rem] shadow-inner">
                                      <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-700 mb-3">{closingPitch.title}</h3>
                                      <p className="text-[11px] text-indigo-900 font-medium italic leading-relaxed">"{closingPitch.text}"</p>
                                   </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 rounded-[3rem] p-12 text-center border border-dashed border-slate-200">
                                <span className="text-4xl block mb-4">🧊</span>
                                <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">En attente d'audit</h5>
                                <p className="text-[10px] text-slate-400 italic max-w-[200px] mx-auto leading-relaxed">Cet utilisateur n'a pas encore lancé de diagnostic Andromeda.</p>
                              </div>
                            )}

                            <div className="space-y-4 pb-12">
                               <div className="flex items-center gap-2">
                                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes Stratégiques</h3>
                                  <span className="h-px flex-1 bg-slate-100"></span>
                               </div>
                               <textarea 
                                 className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-xs font-medium focus:ring-2 ring-indigo-500/20 outline-none placeholder:text-slate-300 shadow-inner" 
                                 placeholder="Note privée d'accompagnement..." 
                                 value={expertNote} 
                                 onChange={(e) => setExpertNote(e.target.value)} 
                               />
                               <button onClick={handleSaveNote} className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95">Enregistrer Note &rarr;</button>
                            </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <Logo iconOnly className="scale-150 mb-10 opacity-20" />
                        <p className="font-black uppercase tracking-[0.4em] text-[11px]">Cockpit Pipeline AdsPilot</p>
                        <p className="text-[9px] text-slate-400 mt-2 uppercase tracking-widest">Sélectionnez un prospect</p>
                    </div>
                  )}
              </div>
          </div>
      </main>
    </div>
  );
};
