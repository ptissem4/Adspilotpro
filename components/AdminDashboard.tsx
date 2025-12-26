
import React, { useEffect, useState, useMemo } from 'react';
import { LeadData, UserProfile, SimulationHistory, Guide } from '../types';
// Fix: replaced non-existent SimulationService with AuditService
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

  useEffect(() => { 
    loadLeads();
    setGuides(AdminService.getGuides());
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const data = await AdminService.getGlobalLeads();
    setLeads(data);
    setLoading(false);
  };

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
    if (!selectedLead) return { title: '', text: '' };
    const inputs = selectedLead.lastSimulation.inputs;
    const results = selectedLead.lastSimulation.results;
    const emq = parseFloat(inputs.emqScore) || 0;
    const ltv = parseFloat(inputs.ltv) || 0;
    const pmv = parseFloat(inputs.pmv) || 1;
    const budget = parseFloat(inputs.currentBudget) || 0;
    const latent = results.tresorerieLatenteHebdo * 4.34;

    if (emq < 6) {
      return {
        title: "Priorité : Réparation Signal/CAPI",
        text: `Votre Pixel est 'aveugle' (Score EMQ: ${emq}/10). Vous dépensez ${formatCurrency(budget)}/mois sans que Meta sache qui achète vraiment. Réparons le signal pour baisser le CPA de 20% dès la semaine 1.`
      };
    }
    if ((ltv / pmv) < 1.3) {
      return {
        title: "Priorité : Stratégie Backend & Rétention",
        text: `Votre LTV de ${formatCurrency(ltv)} est trop proche de votre panier moyen. Vous remplissez un seau percé. Activons votre backend pour doubler la valeur client sans frais pub supplémentaires.`
      };
    }
    return {
      title: "Priorité : Scaling Agressif",
      text: `Tous vos indicateurs sont au vert. Votre trésorerie latente est de ${formatCurrency(latent)}/mois. Sécurisons votre montée en charge pour scaler massivement sans exploser le CPA.`
    };
  }, [selectedLead]);

  const copyPitch = () => {
    if (closingPitch.text) {
      navigator.clipboard.writeText(closingPitch.text);
      alert("Pitch copié !");
    }
  };

  const filteredLeads = leads.filter(lead => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = lead.user.email.toLowerCase().includes(term) || lead.lastSimulation.name.toLowerCase().includes(term) || lead.lastSimulation.auditId.toLowerCase().includes(term);
    const isBuyer = (lead.user.purchasedProducts?.length || 0) > 0;
    const isPremium = (lead.user.consultingValue || 0) > 0;
    if (filterType === 'buyers') return matchesSearch && isBuyer;
    if (filterType === 'premium') return matchesSearch && isPremium;
    return matchesSearch;
  });

  const getStatusDot = (type: 'signal' | 'ltv' | 'scaling', lead: LeadData) => {
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
      // Fix: updated state updater to return full LeadData object instead of UserProfile
      setSelectedLead(prev => prev ? { ...prev, user: { ...prev.user, consultingValue: value } } : null);
      alert("Valeur Consulting mise à jour !");
    }
  };

  const handleSelectLead = (lead: LeadData) => {
    setSelectedLead(lead);
    setExpertNote(lead.lastSimulation.notes || '');
    setConsultingInput((lead.user.consultingValue || 0).toString());
    if (lead.status === 'new') handleStatusChange(lead.user.id, 'contacted');
  };

  const handleSaveNote = async () => {
    if (selectedLead) {
      // Fix: used AuditService.updateAudit instead of non-existent SimulationService
      await AuditService.updateAudit(selectedLead.lastSimulation.id, { notes: expertNote });
      // Mise à jour locale pour éviter le délai d'affichage
      const updatedSim = { ...selectedLead.lastSimulation, notes: expertNote };
      const updatedLead = { ...selectedLead, lastSimulation: updatedSim };
      setSelectedLead(updatedLead);
      setLeads(prev => prev.map(l => l.lastSimulation.id === updatedSim.id ? updatedLead : l));
      alert("Note d'expert enregistrée !");
    }
  };

  // Ajout de la fonction manquante pour enregistrer les guides
  const handleSaveGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuide) {
      AdminService.saveGuide(editingGuide);
      setGuides(AdminService.getGuides());
      setEditingGuide(null);
      alert("Guide mis à jour !");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col z-20 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
              <Logo className="invert brightness-0 scale-90 origin-left" />
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em]">Expert Cockpit v5.2</p>
              </div>
          </div>
          <nav className="flex-1 p-4 overflow-y-auto space-y-2">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Commandes</p>
              <button onClick={() => setActiveTab('pipeline')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <span className="text-lg">🎯</span> Pipeline CRM
              </button>
              <button onClick={() => setActiveTab('guides')} className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'guides' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <span className="text-lg">📚</span> Librairie Guides
              </button>
          </nav>
          <div className="p-4 border-t border-slate-800">
              <div className="bg-slate-800/50 p-4 rounded-xl mb-4 text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">CA Global Période</p>
                <p className="text-lg font-black text-emerald-400">{formatCurrency(stats.total)}</p>
              </div>
              <button onClick={onLogout} className="w-full bg-slate-800 text-slate-400 hover:text-white py-3 rounded-xl transition-colors text-[9px] font-black uppercase tracking-widest border border-slate-700">Déconnexion</button>
          </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === 'pipeline' ? (
            <>
              {/* STATS HEADER */}
              <div className="bg-white border-b border-slate-200 px-8 py-4 flex gap-6 shrink-0 z-10">
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenus Guides (Auto)</p>
                    <p className="text-lg font-black text-slate-900">{formatCurrency(stats.auto)}</p>
                  </div>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">🤝</div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenus Consulting</p>
                    <p className="text-lg font-black text-slate-900">{formatCurrency(stats.consulting)}</p>
                  </div>
                </div>
                <div className="flex-1 bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 flex items-center gap-4 shadow-xl shadow-indigo-100">
                  <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl">👑</div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest">Chiffre d'Affaires Global</p>
                    <p className="text-lg font-black text-white">{formatCurrency(stats.total)}</p>
                  </div>
                </div>
              </div>

              <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-10">
                  <div className="flex items-center gap-4">
                    <h1 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">Flux Pipeline</h1>
                    <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                      <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Tous</button>
                      <button onClick={() => setFilterType('buyers')} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'buyers' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Acheteurs</button>
                      <button onClick={() => setFilterType('premium')} className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${filterType === 'premium' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Premium</button>
                    </div>
                  </div>
                  <div className="relative w-80">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input type="text" placeholder="Projet, Email ou ID..." className="w-full bg-slate-50 border border-slate-200 py-2 pl-10 pr-4 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
              </header>

              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                          <table className="min-w-full divide-y divide-slate-100 table-fixed">
                              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm z-10">
                                  <tr>
                                      <th className="w-1/3 px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Dossier / Projet</th>
                                      <th className="w-1/6 px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Secteur</th>
                                      <th className="w-1/6 px-4 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Triage</th>
                                      <th className="w-1/4 px-6 py-4 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">Badges</th>
                                      <th className="w-1/6 px-6 py-4 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">CA Client</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {filteredLeads.map((lead) => {
                                      const isBuyer = lead.user.purchasedProducts && lead.user.purchasedProducts.length > 0;
                                      const isPremium = (lead.user.consultingValue || 0) > 0;
                                      const hasNotes = lead.lastSimulation.notes && lead.lastSimulation.notes.length > 0;
                                      return (
                                        <tr key={lead.user.id} onClick={() => handleSelectLead(lead)} className={`cursor-pointer transition-all hover:bg-slate-50 ${selectedLead?.user.id === lead.user.id ? 'bg-indigo-50 ring-1 ring-inset ring-indigo-200' : ''} ${isPremium ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                  <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black tracking-tight ${isPremium ? 'text-amber-700' : 'text-slate-900'} uppercase truncate`}>
                                                       {lead.lastSimulation.name}
                                                    </span>
                                                    {hasNotes && <span className="text-[10px]" title="Note stratégique enregistrée">📝</span>}
                                                    <span className="text-[8px] font-bold text-slate-300">#{lead.lastSimulation.auditId}</span>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(lead.lastSimulation.date).toLocaleDateString()}</span>
                                                    <span className="text-[9px] text-indigo-300 truncate max-w-[120px]">{lead.user.email}</span>
                                                  </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight bg-slate-100 px-2 py-1 rounded-lg truncate inline-block max-w-full">
                                                  {lead.lastSimulation.inputs.niche}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-center gap-1.5">
                                                    {getStatusDot('signal', lead)}
                                                    {getStatusDot('ltv', lead)}
                                                    {getStatusDot('scaling', lead)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap justify-center gap-1">
                                                  {isBuyer && <span className="bg-indigo-600 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm">ACHETEUR</span>}
                                                  {isPremium && <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm">PREMIUM</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`text-[10px] font-black ${isPremium ? 'text-amber-600' : 'text-slate-300'}`}>
                                                  {isPremium ? formatCurrency(lead.user.consultingValue!) : '0 €'}
                                                </span>
                                            </td>
                                        </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  {/* PANNEAU DE DÉTAILS */}
                  <div className="w-[500px] overflow-y-auto bg-white border-l border-slate-200 shrink-0 flex flex-col">
                      {selectedLead ? (
                        <div className="p-8 space-y-8 animate-fade-in flex-1">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                               <div className="max-w-[70%]">
                                  <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Dossier #{selectedLead.lastSimulation.auditId}</h2>
                                  <h2 className={`text-2xl font-black truncate leading-tight uppercase tracking-tighter ${selectedLead.user.consultingValue! > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{selectedLead.lastSimulation.name}</h2>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`w-2 h-2 rounded-full ${selectedLead.status === 'new' ? 'bg-red-500' : selectedLead.status === 'contacted' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{selectedLead.status}</p>
                                    </div>
                                    <span className="text-[9px] text-indigo-400 font-bold">{selectedLead.user.email}</span>
                                  </div>
                               </div>
                               <select value={selectedLead.status} onChange={(e) => handleStatusChange(selectedLead.user.id, e.target.value as any)} className="bg-slate-50 border border-slate-200 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl cursor-pointer">
                                    <option value="new">🔴 Nouveau</option>
                                    <option value="contacted">🟠 En Cours</option>
                                    <option value="closed">🟢 Terminé</option>
                               </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Trésorerie Latente</p>
                                    <p className="text-3xl font-black text-emerald-400 leading-none">{formatCurrency(selectedLead.lastSimulation.results.tresorerieLatenteHebdo * 4.34)}<span className="text-xs text-slate-500 block mt-1">/mois</span></p>
                                </div>
                                <div className="bg-indigo-600 p-6 rounded-[2rem] text-white">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300 mb-2">CPA Max Réel</p>
                                    <p className="text-3xl font-black text-white leading-none">{formatCurrency(selectedLead.lastSimulation.results.realMaxCpa)}<span className="text-xs text-indigo-300 block mt-1">Seuil Rentabilité</span></p>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-[2.5rem] space-y-4">
                               <div className="flex items-center justify-between">
                                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-700">Arguments de Closing</h3>
                                  <button onClick={copyPitch} className="text-[9px] font-black text-white bg-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm">📋 Copier</button>
                               </div>
                               <p className="text-xs font-black text-indigo-900 uppercase tracking-tight leading-snug">{closingPitch.title}</p>
                               <div className="bg-white/50 border border-indigo-100 p-4 rounded-xl text-xs text-slate-600 font-medium italic leading-relaxed">"{closingPitch.text}"</div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] space-y-4">
                               <div className="flex items-center justify-between">
                                 <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Contrat Consulting Premium</h3>
                                 <span className="text-xl">🏆</span>
                               </div>
                               <div className="flex gap-2">
                                   <input type="number" className="flex-1 bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 ring-amber-500 outline-none" value={consultingInput} onChange={(e) => setConsultingInput(e.target.value)} placeholder="0" />
                                   <button onClick={handleUpdateConsulting} className="bg-amber-500 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">OK</button>
                               </div>
                            </div>

                            <div className="space-y-4">
                               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note Stratégique Expert (Visible par le client)</h3>
                               <textarea className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 ring-indigo-500 outline-none transition-all placeholder:italic" placeholder="Vos conseils personnalisés que le client pourra lire directement sur son rapport..." value={expertNote} onChange={(e) => setExpertNote(e.target.value)} />
                               <button onClick={handleSaveNote} className="w-full bg-slate-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95">Enregistrer Note &rarr;</button>
                            </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6">📂</div>
                            <p className="font-black uppercase tracking-[0.3em] text-[10px]">Sélectionnez un diagnostic</p>
                        </div>
                      )}
                  </div>
              </div>

              {showFullReport && selectedLead && (
                <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col animate-fade-in overflow-hidden">
                    <header className="h-20 bg-white/5 border-b border-white/10 px-12 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-6">
                           <Logo className="invert brightness-0 scale-75" />
                           <h2 className="text-white font-black uppercase tracking-widest text-sm italic">Audit #{selectedLead.lastSimulation.auditId}</h2>
                        </div>
                        <button onClick={() => setShowFullReport(false)} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all">Fermer</button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-12 scroll-smooth">
                        <div className="max-w-5xl mx-auto bg-white rounded-[4rem] shadow-2xl overflow-hidden p-1">
                          <ResultsDisplay results={selectedLead.lastSimulation.results} inputs={{ ...selectedLead.lastSimulation.inputs, notes: selectedLead.lastSimulation.notes }} />
                        </div>
                    </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
               <div className="max-w-5xl mx-auto space-y-12">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                     <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Librairie de Solutions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {guides.map((guide) => (
                      <div key={guide.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                           <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">{guide.icon}</div>
                           <button onClick={() => setEditingGuide(guide)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Éditer</button>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-2">{guide.title}</h3>
                        <p className="text-xs text-slate-500 italic mb-6 leading-relaxed flex-1">"{guide.description}"</p>
                        <div className="pt-6 border-t border-slate-50 space-y-3">
                           <div className="flex justify-between items-center"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prix</span><span className="text-sm font-black text-slate-900">{guide.price}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {editingGuide && (
                    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                        <form onSubmit={handleSaveGuide} className="bg-white w-full max-w-xl rounded-[3rem] p-12 space-y-8 shadow-2xl relative">
                           <button type="button" onClick={() => setEditingGuide(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors text-2xl">✕</button>
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">Éditer le Guide</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Titre Public</label>
                                 <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-indigo-500 outline-none" value={editingGuide.title} onChange={(e) => setEditingGuide({...editingGuide, title: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix (ex: 47€)</label>
                                 <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 ring-indigo-500 outline-none" value={editingGuide.price} onChange={(e) => setEditingGuide({...editingGuide, price: e.target.value})} />
                              </div>
                           </div>
                           <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all">Sauvegarder</button>
                        </form>
                    </div>
                  )}
               </div>
            </div>
          )}
      </main>
    </div>
  );
};
