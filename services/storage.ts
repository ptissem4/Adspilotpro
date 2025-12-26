
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
    id: 'signal',
    title: 'Guide SOS Signal',
    price: '47€',
    description: 'Réparez votre tracking et restaurez la vision de Meta sur vos conversions.',
    link: 'https://ton-lien-systeme-io/guide-sos-signal',
    icon: '📡',
    recommendationTrigger: 'signal'
  },
  {
    id: 'ltv',
    title: 'Système LTV Maximal',
    price: '67€',
    description: 'Activez vos leviers de rétention pour rentabiliser chaque prospect au-delà du premier achat.',
    link: 'https://ton-lien-systeme-io/systeme-ltv',
    icon: '💎',
    recommendationTrigger: 'ltv'
  },
  {
    id: 'scaling',
    title: 'Scale & Sniper',
    price: '97€',
    description: 'Passez de 1k à 10k/jour sans exploser votre CPA grâce à la structure Broad.',
    link: 'https://ton-lien-systeme-io/scale-sniper',
    icon: '🎯',
    recommendationTrigger: 'scaling'
  }
];

export const AuthService = {
  login: async (email: string, password: string): Promise<UserProfile> => {
    if (!configDiagnostic.hasUrl) throw new Error("Le serveur n'est pas configuré.");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    
    if (authError) throw authError;
    if (!data.user) throw new Error("Utilisateur introuvable.");

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();

    const isExplicitAdmin = data.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role = isExplicitAdmin ? 'admin' : (profile?.role || 'user');

    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email!,
      firstName: profile?.first_name || (isExplicitAdmin ? 'Admin' : 'Utilisateur'),
      role: role as 'admin' | 'user',
      createdAt: data.user.created_at,
      consultingValue: profile?.consulting_value || 0,
      purchasedProducts: profile?.purchased_products || []
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
    return user;
  },

  register: async (email: string, password: string, firstName: string): Promise<UserProfile> => {
    if (!configDiagnostic.hasUrl) throw new Error("Le serveur n'est pas configuré.");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName } }
    });

    if (error) throw error;
    if (!data.user) throw new Error("Erreur lors de la création du compte.");

    const isExplicitAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role = isExplicitAdmin ? 'admin' : 'user';

    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        role: role,
        status: 'new'
      });
    } catch (e) {}

    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email!,
      firstName,
      role: role as 'admin' | 'user',
      createdAt: data.user.created_at,
      consultingValue: 0,
      purchasedProducts: []
    };

    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    try { await supabase.auth.signOut(); } catch(e) {}
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  },

  getCurrentUser: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
  },

  // Gestion de l'audit en attente (survit au refresh)
  setPendingAudit: (audit: any) => {
    if (audit) localStorage.setItem(STORAGE_KEYS.PENDING_AUDIT, JSON.stringify(audit));
    else localStorage.removeItem(STORAGE_KEYS.PENDING_AUDIT);
  },
  
  getPendingAudit: () => {
    const data = localStorage.getItem(STORAGE_KEYS.PENDING_AUDIT);
    return data ? JSON.parse(data) : null;
  },

  // Fix error: Add missing recordPurchase method to AuthService
  recordPurchase: async (email: string, product: string) => {
    if (!configDiagnostic.hasUrl) return;
    try {
      const cleanEmail = email.toLowerCase().trim();
      const { data: profile } = await supabase.from('profiles').select('purchased_products').eq('email', cleanEmail).maybeSingle();
      const existing = profile?.purchased_products || [];
      if (!existing.includes(product)) {
        const updated = [...existing, product];
        await supabase.from('profiles').update({ purchased_products: updated }).eq('email', cleanEmail);
        
        // Synchronisation du cache local
        const currentUser = AuthService.getCurrentUser();
        if (currentUser && currentUser.email.toLowerCase() === cleanEmail) {
          currentUser.purchasedProducts = updated;
          localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(currentUser));
        }
      }
    } catch (e) {
      console.error("Erreur lors de l'enregistrement de l'achat:", e);
    }
  }
};

export const AuditService = {
  saveAudit: async (user: UserProfile, inputs: CalculatorInputs, results: CalculationResults, verdictLabel: string): Promise<SimulationHistory> => {
    const auditData = {
      user_id: user.id,
      project_name: inputs.projectName || `Audit ${new Date().toLocaleDateString()}`,
      roas: parseFloat(inputs.currentRoas) || 0,
      cpa: parseFloat(inputs.currentCpa) || 0,
      emq_score: parseFloat(inputs.emqScore) || 0,
      inputs: inputs,
      results: results,
      verdict_label: verdictLabel
    };

    let serverId = 'local_' + Date.now();
    try {
      const { data, error } = await supabase.from('audits').insert(auditData).select().single();
      if (!error && data) serverId = data.id;
    } catch (e) {
      console.error("Save error (Supabase):", e);
    }
    
    const historyItem: SimulationHistory = { 
      id: serverId,
      auditId: serverId.toString().split('-')[0].toUpperCase(),
      userId: user.id,
      name: auditData.project_name,
      date: new Date().toISOString(),
      inputs,
      results,
      verdictLabel
    };

    // Mise à jour immédiate du cache local pour un affichage instantané
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    const updatedLocal = [historyItem, ...allLocal.filter((i: any) => i.id !== historyItem.id)];
    localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify(updatedLocal));

    return historyItem;
  },

  getAuditHistory: async (userId: string): Promise<SimulationHistory[]> => {
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    const userLocal = allLocal.filter((s: any) => s.userId === userId);

    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return userLocal;

      const serverData = (data || []).map(s => ({
        id: s.id,
        auditId: s.id.toString().split('-')[0].toUpperCase(),
        userId: s.user_id,
        name: s.project_name,
        date: s.created_at,
        inputs: s.inputs,
        results: s.results,
        verdictLabel: s.verdict_label
      }));

      // Fusion intelligente : Serveur prioritaire, mais on garde les locaux non encore synchronisés
      const merged = [...serverData];
      userLocal.forEach((local: any) => {
          if (!merged.find(m => m.id === local.id)) merged.push(local);
      });
      
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      return userLocal;
    }
  },

  deleteAudit: async (id: string) => {
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify(allLocal.filter((s: any) => s.id !== id)));
    if (!id.toString().startsWith('local_')) {
      await supabase.from('audits').delete().eq('id', id);
    }
  },

  updateAudit: async (id: string, updates: any) => {
    if (!id.toString().startsWith('local_')) {
      await supabase.from('audits').update(updates).eq('id', id);
    }
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    const index = allLocal.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      allLocal[index] = { ...allLocal[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify(allLocal));
    }
  }
};

export const AdminService = {
  getGlobalLeads: async (): Promise<LeadData[]> => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const { data: audits } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
      if (!profiles) return [];

      return profiles.map(profile => {
        const userAudits = (audits || []).filter(a => a.user_id === profile.id);
        if (userAudits.length === 0) return null;
        const lastAudit = userAudits[0];
        return {
          user: {
            id: profile.id,
            email: profile.email,
            firstName: profile.first_name,
            role: profile.role,
            createdAt: profile.created_at,
            consultingValue: profile.consulting_value,
            purchasedProducts: profile.purchased_products || []
          },
          lastSimulation: {
            id: lastAudit.id,
            auditId: lastAudit.id.toString().split('-')[0].toUpperCase(),
            userId: lastAudit.user_id,
            name: lastAudit.project_name,
            date: lastAudit.created_at,
            inputs: lastAudit.inputs,
            results: lastAudit.results,
            verdictLabel: lastAudit.verdict_label
          },
          status: (profile.status as any) || 'new'
        };
      }).filter(Boolean) as LeadData[];
    } catch (e) { return []; }
  },
  
  updateLeadStatus: async (userId: string, status: string) => { await supabase.from('profiles').update({ status }).eq('id', userId); },
  updateLeadConsulting: async (userId: string, value: number) => { await supabase.from('profiles').update({ consulting_value: value }).eq('id', userId); },
  getNewLeadsCount: async (): Promise<number> => { try { const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'new'); return count || 0; } catch (e) { return 0; } },
  getGuides: (): Guide[] => { const data = localStorage.getItem(STORAGE_KEYS.GUIDES); return data ? JSON.parse(data) : DEFAULT_GUIDES; },
  saveGuide: (guide: Guide) => { const guides = AdminService.getGuides(); const index = guides.findIndex(g => g.id === guide.id); if (index !== -1) guides[index] = guide; else guides.push(guide); localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides)); }
};
