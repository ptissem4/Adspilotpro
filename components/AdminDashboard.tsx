
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
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [showFullReport, setShowFullReport] = useState(false);

  const loadLeads = async () => {
    setLoading(true);
    const data = await AdminService.getGlobalLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { 
    loadLeads();
    setGuides(AdminService.getGuides());
  }, []);

  const parsePrice = (priceStr: string) => {
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(isNaN(val) ? 0 : val);

  const stats = useMemo(() => {
    let guideTotal = 0;
    let consultingTotal = 0;
    leads.forEach(lead => {
      if (lead.user.purchasedProducts) {
        lead.user.purchasedProducts.forEach(productName => {
          const guide = guides.find(g => g.title === productName || g.id === productName);
          guideTotal += guide ? parsePrice(guide.price) : 47;
        });
      }
      consultingTotal += lead.user.consultingValue || 0;
    });
    return { auto: guideTotal, consulting: consultingTotal, total: guideTotal + consultingTotal };
  }, [leads, guides]);

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
    const nameMatch = lead.lastSimulation ? lead.lastSimulation.name.toLowerCase().includes(term) : false;
    const emailMatch = lead.user.email.toLowerCase().includes(term);
    const matchesSearch = emailMatch || nameMatch;
    
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

  const handleSelectLead = (lead: LeadData) => {
    setSelectedLead(lead);
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
              <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
                  <div className="flex items-center gap-4">
                    <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Flux Pipeline</h1>
                    <button onClick={loadLeads} disabled={loading} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                    </button>
                  </div>
                  <div className="relative w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input type="text" placeholder="Rechercher email ou projet..." className="w-full bg-slate-50 border border-slate-200 py-2 pl-10 pr-4 rounded-xl text-xs font-medium outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                           <p className="text-xs text-slate-400 italic">Vérifiez que vos utilisateurs se sont bien connectés au moins une fois pour synchroniser leur profil.</p>
                        </div>
                      ) : (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                          <table className="min-w-full divide-y divide-slate-100 table-fixed">
                              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                                  <tr>
                                      <th className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Prospect</th>
                                      <th className="px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Triage</th>
                                      <th className="px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Inscrit le</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredLeads.map((lead) => (
                                    <tr key={lead.user.id} onClick={() => handleSelectLead(lead)} className={`cursor-pointer transition-all hover:bg-slate-50 ${selectedLead?.user.id === lead.user.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                              <span className={`text-[10px] font-black tracking-tight uppercase truncate ${!lead.lastSimulation ? 'text-indigo-400' : 'text-slate-900'}`}>
                                                 {lead.lastSimulation ? lead.lastSimulation.name : "🆕 Profil Synchronisé (Sans audit)"}
                                              </span>
                                              <span className="text-[9px] text-slate-400 font-bold lowercase">{lead.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
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
                                  ))}
                              </tbody>
                          </table>
                        </div>
                      )}
                  </div>

                  <div className="w-[500px] overflow-y-auto bg-white border-l border-slate-200 shrink-0 flex flex-col">
                      {selectedLead ? (
                        <div className="p-8 space-y-8 animate-fade-in flex-1">
                            {/* ... (Détails du lead identiques à avant) ... */}
                            <div className="border-b border-slate-100 pb-6 flex justify-between items-start">
                               <div className="max-w-[70%]">
                                  <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">PROFIL INSCRIT</h2>
                                  <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 truncate leading-tight">
                                    {selectedLead.user.firstName || "Inconnu"}
                                  </h2>
                                  <p className="text-[9px] text-indigo-400 font-bold">{selectedLead.user.email}</p>
                               </div>
                               <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.user.id, e.target.value as any)} className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl">
                                    <option value="new">🔴 Nouveau</option>
                                    <option value="contacted">🟠 En Cours</option>
                                    <option value="closed">🟢 Terminé</option>
                               </select>
                            </div>
                            
                            {!selectedLead.lastSimulation ? (
                              <div className="bg-slate-50 rounded-[2rem] p-10 text-center border border-dashed border-slate-200">
                                <span className="text-4xl block mb-4">🧊</span>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Lead en attente</p>
                                <p className="text-[10px] text-slate-400 italic">Cet utilisateur s'est inscrit mais n'a pas encore lancé de diagnostic Andromeda.</p>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Trésorerie Latente</p>
                                        <p className="text-3xl font-black text-emerald-400">{formatCurrency((selectedLead.lastSimulation.results.tresorerieLatenteHebdo || 0) * 4.34)}</p>
                                    </div>
                                    <div className="bg-indigo-600 p-6 rounded-[2rem] text-white">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-2">EMQ Signal</p>
                                        <p className="text-3xl font-black text-white">{selectedLead.lastSimulation.inputs.emqScore}/10</p>
                                    </div>
                                </div>
                              </>
                            )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                            <span className="text-4xl mb-6">📂</span>
                            <p className="font-black uppercase tracking-[0.3em] text-[10px]">Sélectionnez un Prospect</p>
                        </div>
                      )}
                  </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
               {/* Librairie Guides */}
            </div>
          )}
      </main>
    </div>
  );
};
