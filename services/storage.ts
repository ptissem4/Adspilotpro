
import { CalculatorInputs, CalculationResults, SimulationHistory, UserProfile, LeadData, Guide } from '../types';
import { supabase, configDiagnostic } from './supabase';

const ADMIN_EMAIL = 'shopiflight@gmail.com';
const STORAGE_KEYS = { 
  CURRENT_SESSION: 'ads_pilot_session', 
  AUDITS_LOCAL: 'ads_pilot_audits_local',
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
    if (!configDiagnostic.hasUrl) throw new Error("Le serveur n'est pas configuré (URL manquante).");

    const { data, error: authError } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });
    
    if (authError) {
      if (authError.message === 'Failed to fetch') throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion ou l'URL du projet.");
      throw authError;
    }
    
    if (!data.user) throw new Error("Utilisateur introuvable.");

    // Récupération du profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

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
    if (!configDiagnostic.hasUrl) throw new Error("Le serveur n'est pas configuré (URL manquante).");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { first_name: firstName } }
    });

    if (error) {
      if (error.message === 'Failed to fetch') throw new Error("Erreur réseau : Impossible d'atteindre Supabase. Vérifiez l'URL du projet.");
      throw error;
    }
    
    if (!data.user) throw new Error("Erreur lors de la création du compte.");

    const isExplicitAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const role = isExplicitAdmin ? 'admin' : 'user';

    // Création silencieuse du profil
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        role: role,
        status: 'new'
      });
    } catch (e) {
      console.warn("Profil non créé en base, mais auth réussie.");
    }

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

  recordPurchase: async (email: string, product: string) => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!data) return;
    try {
      const user = JSON.parse(data) as UserProfile;
      if (!user.purchasedProducts) user.purchasedProducts = [];
      if (!user.purchasedProducts.includes(product)) {
        user.purchasedProducts.push(product);
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
        
        await supabase.from('profiles').update({
          purchased_products: user.purchasedProducts
        }).eq('id', user.id);
      }
    } catch (e) {
      console.error("Error recording purchase:", e);
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

    // Tentative d'insertion Supabase
    const { data, error } = await supabase.from('audits').insert(auditData).select().single();
    
    // On enregistre TOUJOURS en local en backup immédiat pour éviter les pertes dues à la latence
    const historyItem: SimulationHistory = { 
      id: data?.id || 'local_' + Date.now(),
      auditId: data?.id?.split('-')[0].toUpperCase() || `AD-NEW-${Date.now().toString().slice(-4)}`,
      userId: user.id,
      name: auditData.project_name,
      date: new Date().toISOString(),
      inputs,
      results,
      verdictLabel
    };

    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify([historyItem, ...allLocal.filter((i: any) => i.id !== historyItem.id)]));

    if (error) {
      console.warn("Audit sauvegardé en local uniquement (erreur Supabase):", error);
      return historyItem;
    }

    return {
      id: data.id,
      auditId: data.id.split('-')[0].toUpperCase(),
      userId: data.user_id,
      name: data.project_name,
      date: data.created_at,
      inputs: data.inputs,
      results: data.results,
      verdictLabel: data.verdict_label
    };
  },

  getAuditHistory: async (userId: string): Promise<SimulationHistory[]> => {
    // On récupère le local d'abord
    const localData = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    const userLocal = localData.filter((s: any) => s.userId === userId);

    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const serverData = (data || []).map(s => ({
        id: s.id,
        auditId: s.id.split('-')[0].toUpperCase(),
        userId: s.user_id,
        name: s.project_name,
        date: s.created_at,
        inputs: s.inputs,
        results: s.results,
        verdictLabel: s.verdict_label
      }));

      // On merge les deux, en priorisant le serveur mais en gardant ce qui n'y est pas encore
      const merged = [...serverData];
      userLocal.forEach((local: any) => {
          if (!merged.find(m => m.id === local.id)) {
              merged.push(local);
          }
      });
      
      return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
      return userLocal;
    }
  },

  deleteAudit: async (id: string) => {
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify(allLocal.filter((s: any) => s.id !== id)));
    
    if (!id.startsWith('local_')) {
      await supabase.from('audits').delete().eq('id', id);
    }
  },

  updateAudit: async (id: string, updates: any) => {
    const allLocal = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDITS_LOCAL) || '[]');
    const index = allLocal.findIndex((s: any) => s.id === id);
    if (index !== -1) {
      allLocal[index] = { ...allLocal[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.AUDITS_LOCAL, JSON.stringify(allLocal));
    }

    if (!id.startsWith('local_')) {
      await supabase.from('audits').update(updates).eq('id', id);
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
            auditId: lastAudit.id.split('-')[0].toUpperCase(),
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
