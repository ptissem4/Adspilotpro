import { CalculatorInputs, CalculationResults, SimulationHistory, UserProfile, LeadData } from '../types';
import { supabase, configDiagnostic } from './supabase';

const ADMIN_EMAIL = 'shopiflight@gmail.com';

/**
 * Récupère de manière sécurisée une variable d'environnement
 * en essayant import.meta.env (Vite) puis process.env (Node/Netlify/Vercel)
 */
const getEnvValue = (key: string): string => {
  try {
    // Tentative via Vite
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // Repli via process.env (Standard)
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

const EMAILJS_SERVICE_ID = getEnvValue('VITE_EMAILJS_SERVICE_ID');
const EMAILJS_TEMPLATE_ID = getEnvValue('VITE_EMAILJS_TEMPLATE_ID');
const EMAILJS_PUBLIC_KEY = getEnvValue('VITE_EMAILJS_PUBLIC_KEY');

const STORAGE_KEYS = { 
  CURRENT_SESSION: 'ads_pilot_session', 
};

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
      purchasedProducts: profile?.purchased_products || [],
      brand_name: profile?.brand_name,
      website_url: profile?.website_url,
      shop_logo: profile?.shop_logo,
      niche: profile?.niche,
      target_cpa: profile?.target_cpa,
      has_andromeda_access: profile?.has_andromeda_access || false
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
    
    const user: UserProfile = { 
      id: data.user.id, 
      email: data.user.email!, 
      full_name: firstName, 
      role: role as 'admin' | 'user', 
      createdAt: data.user.created_at, 
      consultingValue: 0, 
      purchasedProducts: [],
      has_andromeda_access: false
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(user));
    return user;
  },
  grantAndromedaAccess: async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ has_andromeda_access: true }).eq('id', userId);
    if (error) throw error;
    
    const current = AuthService.getCurrentUser();
    if (current && current.id === userId) {
      const newUser = { ...current, has_andromeda_access: true };
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newUser));
    }
  },
  addToWaitlist: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      await supabase.from('profiles').upsert({ 
        email: cleanEmail, 
        status: 'waitlist',
        role: 'user',
        full_name: 'Pilote Waitlist' 
      }, { onConflict: 'email', ignoreDuplicates: false });
    } catch (e) {}

    if (EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
      try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS_SERVICE_ID,
            template_id: EMAILJS_TEMPLATE_ID,
            user_id: EMAILJS_PUBLIC_KEY,
            template_params: {
              user_email: cleanEmail,
              date: new Date().toLocaleString('fr-FR'),
              source: "Waitlist Andromeda"
            }
          })
        });
      } catch (e) {}
    }
  },
  updateBusiness: async (userId: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;

    const current = AuthService.getCurrentUser();
    if (current) {
      const newUser = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newUser));
    }
  },
  recordPurchase: async (email: string, product: string) => {
    const cleanEmail = email.toLowerCase().trim();
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', cleanEmail).maybeSingle();
    
    if (profile) {
      const currentProducts = profile.purchased_products || [];
      const newProducts = currentProducts.includes(product) ? currentProducts : [...currentProducts, product];
      
      await supabase.from('profiles').update({ 
        purchased_products: newProducts,
        status: 'buyer'
      }).eq('id', profile.id);

      const current = AuthService.getCurrentUser();
      if (current && current.email.toLowerCase() === cleanEmail) {
        const newUser = { ...current, purchasedProducts: newProducts };
        localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newUser));
      }
    }
  },
  logout: async () => { try { await supabase.auth.signOut(); } catch(e) {} localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION); },
  getCurrentUser: (): UserProfile | null => { 
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION); 
    if (!data) return null; 
    try { return JSON.parse(data); } catch (e) { return null; } 
  }
};

export const AuditService = {
  saveAudit: async (user: UserProfile, inputs: CalculatorInputs, results: CalculationResults, verdictLabel: string, type: 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS', name: string): Promise<SimulationHistory> => {
    const { data, error } = await supabase.from('audits').insert({ 
      user_id: user.id, 
      name, type,
      inputs, results, 
      verdict_label: verdictLabel
    }).select().single();
    if (error) throw error;
    return { 
      id: data.id, 
      auditId: data.id.toString().split('-')[0].toUpperCase(), 
      userId: user.id, 
      name, date: data.created_at, inputs, results, verdictLabel, type 
    };
  },
  getAuditHistory: async (userId: string): Promise<SimulationHistory[]> => {
    const { data, error } = await supabase.from('audits').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(s => ({ 
      id: s.id, auditId: s.id.toString().split('-')[0].toUpperCase(), userId: s.user_id, 
      name: s.name, date: s.created_at, inputs: s.inputs, results: s.results, 
      verdictLabel: s.verdict_label, type: s.type || 'ANDROMEDA'
    }));
  },
  deleteAudit: async (id: string) => { await supabase.from('audits').delete().eq('id', id); }
};

export const AdminService = {
  getGlobalLeads: async (): Promise<LeadData[]> => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: audits } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
    return (profiles || []).map(p => ({
      user: { ...p, createdAt: p.created_at },
      lastSimulation: audits?.find(a => a.user_id === p.id) || null,
      status: p.status || 'new'
    }));
  },
  getUserHistory: async (userId: string) => AuditService.getAuditHistory(userId),
  deleteUser: async (id: string) => {
    await supabase.from('audits').delete().eq('user_id', id);
    await supabase.from('profiles').delete().eq('id', id);
  },
  updateLeadProfile: async (id: string, updates: any) => {
    await supabase.from('profiles').update(updates).eq('id', id);
  },
  getGlobalCounts: async () => {
    const { count: a } = await supabase.from('audits').select('*', { count: 'exact', head: true }).eq('type', 'ANDROMEDA');
    const { count: c } = await supabase.from('audits').select('*', { count: 'exact', head: true }).eq('type', 'CREATIVE');
    return { andromeda: a || 0, creative: c || 0 };
  },
  getDatabaseLogs: async (limit = 100) => {
    const { data } = await supabase.from('audits').select('*, profiles(email, full_name)').order('created_at', { ascending: false }).limit(limit);
    return data || [];
  }
};