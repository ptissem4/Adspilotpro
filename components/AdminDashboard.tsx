
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
    const channel = supabase.channel('admin_pipeline_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadLeads()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // AUCUN FILTRE POUR DEBUGGER
  const filteredLeads = leads;

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex h-screen overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 shadow-2xl">
          <div className="p-6 border-b border-slate-800">
              <Logo className="invert brightness-0 scale-90 origin-left" />
              <p className="text-[9px] text-indigo-400 font-black uppercase mt-2">DEBUG MODE : ON</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
              <button onClick={() => setActiveTab('pipeline')} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white">🎯 Pipeline</button>
          </nav>
          <div className="p-4 border-t border-slate-800">
              <button onClick={onLogout} className="w-full bg-slate-800 py-3 rounded-xl text-[9px] font-black uppercase">Déconnexion</button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
          <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
              <h1 className="text-sm font-black text-slate-900 uppercase italic">Pipeline CRM (Brut)</h1>
              <button onClick={loadLeads} className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-[9px] font-black uppercase">Actualiser</button>
          </header>

          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
              {/* DEBUG JSON PLEIN ÉCRAN */}
              <div className="mb-10 p-6 bg-slate-900 rounded-[2rem] border-2 border-indigo-500 shadow-2xl overflow-hidden">
                  <h3 className="text-indigo-400 font-black text-[10px] uppercase mb-4 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Données Brutes Supabase ({leads.length} profils)
                  </h3>
                  <pre className="text-xs text-slate-300 font-mono max-h-64 overflow-y-auto bg-slate-800/50 p-4 rounded-xl">
                      {JSON.stringify(leads.map(l => ({ 
                        id: l.user.id, 
                        full_name: l.user.full_name, 
                        email: l.user.email,
                        status: l.status
                      })), null, 2)}
                  </pre>
              </div>

              {loading ? (
                <div className="text-center py-20 opacity-40 uppercase font-black tracking-widest text-[10px]">Chargement des données...</div>
              ) : leads.length === 0 ? (
                <div className="bg-white p-20 rounded-[2rem] text-center border-2 border-dashed border-slate-200">
                   <p className="text-4xl mb-4">🏜️</p>
                   <p className="font-black uppercase text-sm">Zéro Prospect Trouvé</p>
                   <p className="text-xs text-slate-400 mt-2 italic">La requête n'a renvoyé aucun utilisateur de la table 'profiles'.</p>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Identité (full_name)</th>
                                <th className="px-6 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                <th className="px-6 py-4 text-right text-[9px] font-black uppercase tracking-widest text-slate-400">Date Inscription</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {leads.map(lead => (
                              <tr key={lead.user.id} onClick={() => setSelectedLead(lead)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors">
                                  <td className="px-6 py-5">
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-xs">
                                              {(lead.user.full_name || "P").charAt(0).toUpperCase()}
                                          </div>
                                          <span className="text-xs font-black text-slate-900 uppercase italic tracking-tighter">
                                              {lead.user.full_name || "SANS NOM"}
                                          </span>
                                      </div>
                                  </td>
                                  <td className="px-6 py-5 text-xs text-slate-500 font-medium">{lead.user.email}</td>
                                  <td className="px-6 py-5 text-right text-[10px] text-slate-400 font-bold uppercase">
                                      {new Date(lead.user.createdAt).toLocaleDateString()}
                                  </td>
                              </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              )}
          </div>
      </main>

      {/* DETAIL PANEL (MINIMAL) */}
      {selectedLead && (
        <aside className="w-96 bg-white border-l border-slate-200 p-8 flex flex-col gap-6 animate-fade-in shadow-2xl">
            <button onClick={() => setSelectedLead(null)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">&larr; Fermer</button>
            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4">
               <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest">Fiche Prospect</p>
               <h2 className="text-2xl font-black uppercase italic tracking-tighter">{selectedLead.user.full_name}</h2>
               <p className="text-xs opacity-60">{selectedLead.user.email}</p>
            </div>
            <div className="space-y-2">
                <p className="text-[8px] font-black uppercase text-slate-400">ID Unique</p>
                <code className="text-[10px] block bg-slate-50 p-2 rounded-lg border border-slate-100">{selectedLead.user.id}</code>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50 italic text-[10px] text-slate-400 text-center">
              Andromeda Data Engine v5.3
            </div>
        </aside>
      )}
    </div>
  );
};
