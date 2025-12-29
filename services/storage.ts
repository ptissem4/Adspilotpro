
import { CalculatorInputs, CalculationResults, SimulationHistory, UserProfile, LeadData, Guide } from '../types';
import { supabase, configDiagnostic } from './supabase';

const ADMIN_EMAIL = 'shopiflight@gmail.com';
const STORAGE_KEYS = { 
  CURRENT_SESSION: 'ads_pilot_session', 
  AUDITS_LOCAL: 'ads_pilot_audits_local',
  PENDING_AUDIT: 'ads_pilot_pending_audit',
  GUIDES: 'ads_pilot_guides'
};

const DEFAULT_GUIDES: Guide[] = [
  {
    id: 'SOS Signal',
    title: 'Guide SOS Signal',
    price: '47€',
    description: 'Réparez votre tracking et restaurez la vision de Meta sur vos conversions.',
    link: 'https://ton-tunnel-sio.com/sos-signal',
    icon: '📡',
    recommendationTrigger: 'signal'
  },
  {
    id: 'LTV Maximal',
    title: 'Système LTV Maximal',
    price: '67€',
    description: 'Activez vos leviers de rétention pour rentabiliser chaque prospect au-delà du premier achat.',
    link: 'https://ton-tunnel-sio.com/ltv-maximal',
    icon: '💎',
    recommendationTrigger: 'ltv'
  },
  {
    id: 'Scale & Sniper',
    title: 'Scale & Sniper',
    price: '97€',
    description: 'Passez de 1k à 10k/jour sans exploser votre CPA grâce à la structure Broad.',
    link: 'https://ton-tunnel-sio.com/scale-sniper',
    icon: '🎯',
    recommendationTrigger: 'scaling'
  }
];

export const AuthService = {
  login: async (email: string, password: string): Promise<UserProfile> => {
    if (!configDiagnostic.hasUrl) throw new Error("Le serveur n'est pas configuré.");
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) throw authError;
    if (!data.user) throw new Error("Utilisateur introuvable.");
    const isExplicitAdmin = data.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role = isExplicitAdmin ? 'admin' : 'user';
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email!,
      full_name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email!,
      role: role as 'admin' | 'user',
      createdAt: data.user.created_at,
      consultingValue: profile?.consulting_value || 0,
      purchasedProducts: profile?.purchased_products || []
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
    return user;
  },
  register: async (email: string, password: string, firstName: string): Promise<UserProfile> => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: firstName } } });
    if (error) throw error;
    if (!data.user) throw new Error("Erreur lors de la création du compte.");
    const role = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
    await supabase.from('profiles').upsert({ id: data.user.id, email: email.toLowerCase(), full_name: firstName, role: role, status: 'new' });
    const user: UserProfile = { id: data.user.id, email: data.user.email!, full_name: firstName, role: role as 'admin' | 'user', createdAt: data.user.created_at, consultingValue: 0, purchasedProducts: [] };
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
    return user;
  },
  logout: async () => { try { await supabase.auth.signOut(); } catch(e) {} localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION); },
  getCurrentUser: (): UserProfile | null => { const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION); if (!data) return null; try { return JSON.parse(data); } catch (e) { return null; } },
  setPendingAudit: (audit: any) => { if (audit) localStorage.setItem(STORAGE_KEYS.PENDING_AUDIT, JSON.stringify(audit)); else localStorage.removeItem(STORAGE_KEYS.PENDING_AUDIT); },
  getPendingAudit: () => { const data = localStorage.getItem(STORAGE_KEYS.PENDING_AUDIT); return data ? JSON.parse(data) : null; },
  recordPurchase: async (email: string, product: string) => {
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data: profile } = await supabase.from('profiles').select('purchased_products').eq('email', cleanEmail).maybeSingle();
      const existing = profile?.purchased_products || [];
      if (!existing.includes(product)) {
        await supabase.from('profiles').update({ purchased_products: [...existing, product] }).eq('email', cleanEmail);
      }
    } catch (e) {}
  }
};

export const AuditService = {
  saveAudit: async (user: UserProfile, inputs: CalculatorInputs, results: CalculationResults, verdictLabel: string): Promise<SimulationHistory> => {
    const auditData = { user_id: user.id, project_name: inputs.projectName || `Audit ${new Date().toLocaleDateString()}`, roas: parseFloat(inputs.currentRoas) || 0, cpa: parseFloat(inputs.currentCpa) || 0, emq_score: parseFloat(inputs.emqScore) || 0, inputs: inputs, results: results, verdict_label: verdictLabel };
    let serverId = 'local_' + Date.now();
    try {
      const { data, error } = await supabase.from('audits').insert(auditData).select().single();
      if (!error && data) serverId = data.id;
    } catch (e) {}
    return { id: serverId, auditId: serverId.toString().split('-')[0].toUpperCase(), userId: user.id, name: auditData.project_name, date: new Date().toISOString(), inputs, results, verdictLabel };
  },
  getAuditHistory: async (userId: string): Promise<SimulationHistory[]> => {
    try {
      const { data } = await supabase.from('audits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      return (data || []).map(s => ({ id: s.id, auditId: s.id.toString().split('-')[0].toUpperCase(), userId: s.user_id, name: s.project_name, date: s.created_at, inputs: s.inputs, results: s.results, verdictLabel: s.verdict_label }));
    } catch (e) { return []; }
  },
  deleteAudit: async (id: string) => { if (!id.toString().startsWith('local_')) await supabase.from('audits').delete().eq('id', id); },
  updateAudit: async (id: string, updates: any) => { if (!id.toString().startsWith('local_')) await supabase.from('audits').update(updates).eq('id', id); }
};

export const AdminService = {
  getGlobalLeads: async (): Promise<LeadData[]> => {
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      const { data: allAudits, error: aErr } = await supabase
        .from('audits')
        .select('*')
        .order('created_at', { ascending: false });

      return (profiles || []).map(p => {
        const userAudits = (allAudits || []).filter(a => a.user_id === p.id);
        const lastAudit = userAudits.length > 0 ? userAudits[0] : null;

        return {
          user: {
            id: p.id,
            email: p.email || "Email masqué",
            full_name: p.full_name || p.email || "Prospect Inconnu",
            role: p.role || 'user',
            createdAt: p.created_at,
            consultingValue: p.consulting_value || 0,
            purchasedProducts: p.purchased_products || []
          },
          lastSimulation: lastAudit ? {
            id: lastAudit.id,
            auditId: lastAudit.id.toString().split('-')[0].toUpperCase(),
            userId: lastAudit.user_id,
            name: lastAudit.project_name,
            date: lastAudit.created_at,
            inputs: lastAudit.inputs,
            results: lastAudit.results,
            verdictLabel: lastAudit.verdict_label
          } : null,
          status: p.status || 'new'
        };
      });
    } catch (e) { 
      console.error("AdminService.getGlobalLeads Nuclear Error:", e);
      return []; 
    }
  },
  updateLeadStatus: async (userId: string, status: string) => { await supabase.from('profiles').update({ status }).eq('id', userId); },
  updateLeadConsulting: async (userId: string, value: number) => { await supabase.from('profiles').update({ consulting_value: value }).eq('id', userId); },
  getNewLeadsCount: async (): Promise<number> => { try { const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'new'); return count || 0; } catch (e) { return 0; } },
  getGuides: (): Guide[] => { return DEFAULT_GUIDES; },
  saveGuide: (guide: Guide) => { console.log("Guide mis à jour"); }
};
