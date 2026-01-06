
import { CalculatorInputs, CalculationResults, SimulationHistory, UserProfile, LeadData, Guide } from '../types';
import { supabase, configDiagnostic } from './supabase';

const ADMIN_EMAIL = 'shopiflight@gmail.com';

// 📧 CONFIGURATION EMAIL (EmailJS)
// 1. Créez un compte gratuit sur https://www.emailjs.com/
// 2. Connectez votre service email (Gmail, Outlook...)
// 3. Créez un template d'email avec les variables {{user_email}} et {{date}}
// 4. Copiez vos clés ici :
const EMAILJS_SERVICE_ID = "service_8ckuzhi";   // Ex: service_z3x4...
const EMAILJS_TEMPLATE_ID = "template_mt5z067"; // Ex: template_a8b9...
const EMAILJS_PUBLIC_KEY = "aXsosjwe1vFc";   // Ex: user_XyZ123... (Trouvable dans Account > API Keys)

const STORAGE_KEYS = { 
  CURRENT_SESSION: 'ads_pilot_session', 
  AUDITS_LOCAL: 'ads_pilot_audits_local',
  PENDING_AUDIT: 'ads_pilot_pending_audit',
  GUIDES: 'ads_pilot_guides'
};

/**
 * 🛠️ SCRIPT DE MIGRATION SQL POUR L'EXPERT (À coller dans Supabase SQL Editor)
 * 
 * -- Mise à jour des profils
 * ALTER TABLE profiles 
 * ADD COLUMN IF NOT EXISTS brand_name TEXT,
 * ADD COLUMN IF NOT EXISTS website_url TEXT,
 * ADD COLUMN IF NOT EXISTS niche TEXT,
 * ADD COLUMN IF NOT EXISTS target_cpa NUMERIC;
 * 
 * -- Mise à jour des audits pour supporter les nouveaux modules
 * ALTER TABLE audits 
 * ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'ANDROMEDA',
 * ADD COLUMN IF NOT EXISTS name TEXT;
 */

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
      target_cpa: profile?.target_cpa
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
  addToWaitlist: async (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Sauvegarde Database (Prioritaire)
    try {
      const { error } = await supabase.from('profiles').upsert({ 
        email: cleanEmail, 
        status: 'waitlist',
        role: 'user',
        full_name: 'Pilote Waitlist' 
      }, { onConflict: 'email', ignoreDuplicates: false });
      
      if (error) console.warn("Waitlist DB Warning:", error.message);
    } catch (dbErr) {
      console.warn("Waitlist DB Error", dbErr);
    }

    // 2. Notification Admin via Email (EmailJS API)
    try {
      if (EMAILJS_SERVICE_ID.includes("A_REMPLACER")) {
        console.log("⚠️ EmailJS non configuré : l'email de notification n'a pas été envoyé.");
        return;
      }

      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: EMAILJS_SERVICE_ID,
          template_id: EMAILJS_TEMPLATE_ID,
          user_id: EMAILJS_PUBLIC_KEY,
          template_params: {
            user_email: cleanEmail,
            date: new Date().toLocaleString('fr-FR'),
            source: "Waitlist Andromeda",
            message: "Un nouveau prospect est prêt pour le scaling."
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API EmailJS: ${response.statusText}`);
      }
      
      console.log("✅ Notification Admin (Email) envoyée avec succès.");
      
    } catch (notifyErr) {
      console.error("Échec de l'envoi de l'email de notification :", notifyErr);
      // On ne bloque pas l'UI pour l'utilisateur, l'inscription en base a réussi.
    }
  },
  recordPurchase: async (email: string, product: string) => {
    const { data: profile } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase().trim()).maybeSingle();
    if (profile) {
      const currentProducts = profile.purchased_products || [];
      const newProducts = currentProducts.includes(product) ? currentProducts : [...currentProducts, product];
      await supabase.from('profiles').update({ purchased_products: newProducts, status: 'buyer' }).eq('id', profile.id);
    }
  },
  updateBusiness: async (userId: string, updates: Partial<UserProfile>) => {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      brand_name: updates.brand_name,
      website_url: updates.website_url,
      shop_logo: updates.shop_logo,
      niche: updates.niche,
      target_cpa: updates.target_cpa,
      full_name: updates.full_name
    });
    
    if (error) {
      console.error("❌ ERREUR SUPABASE 400 - DÉTAILS CRITIQUES :");
      console.dir(error); 
      throw error;
    }

    const current = AuthService.getCurrentUser();
    if (current) {
      const newUser = { ...current, ...updates };
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(newUser));
    }
  },
  logout: async () => { try { await supabase.auth.signOut(); } catch(e) {} localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION); },
  getCurrentUser: (): UserProfile | null => { const data = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION); if (!data) return null; try { return JSON.parse(data); } catch (e) { return null; } }
};

export const AuditService = {
  saveAudit: async (user: UserProfile, inputs: CalculatorInputs, results: CalculationResults, verdictLabel: string, type: 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS', name: string): Promise<SimulationHistory> => {
    const auditData = { 
      user_id: user.id, 
      name: name,
      type: type,
      roas: parseFloat(inputs.currentRoas) || 0, 
      cpa: parseFloat(inputs.currentCpa) || 0, 
      emq_score: parseFloat(inputs.emqScore) || 0, 
      inputs: { ...inputs, type, name }, 
      results: results, 
      verdict_label: verdictLabel
    };

    const { data, error } = await supabase.from('audits').insert(auditData).select().single();
    
    if (error) {
      console.error("Supabase Save Error:", error);
      throw error; // On propage l'erreur pour que l'UI ne dise pas "archivé" faussement
    }

    const serverId = data.id;

    return { 
      id: serverId, 
      auditId: serverId.toString().split('-')[0].toUpperCase(), 
      userId: user.id, 
      name: name, 
      date: data.created_at || new Date().toISOString(), 
      inputs: auditData.inputs, 
      results, 
      verdictLabel,
      type: type
    };
  },
  updateAudit: async (auditId: string, updates: any) => {
    const { error } = await supabase.from('audits').update(updates).eq('id', auditId);
    if (error) throw error;
  },
  getAuditHistory: async (userId: string): Promise<SimulationHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      return (data || []).map(s => ({ 
        id: s.id, 
        auditId: s.id.toString().split('-')[0].toUpperCase(), 
        userId: s.user_id, 
        name: s.name || s.project_name || 'Audit sans nom', 
        date: s.created_at, 
        inputs: s.inputs, 
        results: s.results, 
        verdictLabel: s.verdict_label,
        notes: s.notes,
        type: s.type || (s.inputs?.creativeImageUrl ? 'CREATIVE' : 'ANDROMEDA')
      }));
    } catch (e) { 
      console.error("Erreur History Fetch:", e);
      return []; 
    }
  },
  deleteAudit: async (auditId: string) => { 
    const { error } = await supabase.from('audits').delete().eq('id', auditId);
    
    if (error) {
      console.error("❌ Détail Erreur Supabase (Delete):", error);
      throw error;
    }
    
    return true;
  }
};

export const AdminService = {
  getNewLeadsCount: async (): Promise<number> => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'new');
    return count || 0;
  },
  getGlobalCounts: async () => {
    const [andromeda, creative] = await Promise.all([
      supabase.from('audits').select('*', { count: 'exact', head: true }).or('type.eq.ANDROMEDA,type.is.null'),
      supabase.from('audits').select('*', { count: 'exact', head: true }).eq('type', 'CREATIVE')
    ]);
    return {
      andromeda: andromeda.count || 0,
      creative: creative.count || 0
    };
  },
  getGlobalLeads: async (): Promise<LeadData[]> => {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (pError) throw pError;

    const leads: LeadData[] = [];
    const { data: audits } = await supabase.from('audits').select('*').order('created_at', { ascending: false });

    for (const p of (profiles || [])) {
      const lastAudit = audits?.find(a => a.user_id === p.id);
      
      leads.push({
        user: {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          role: p.role,
          createdAt: p.created_at,
          consultingValue: p.consulting_value || 0,
          purchasedProducts: p.purchased_products || [],
          brand_name: p.brand_name,
          website_url: p.website_url,
          shop_logo: p.shop_logo,
          niche: p.niche,
          target_cpa: p.target_cpa
        },
        lastSimulation: lastAudit ? {
          id: lastAudit.id,
          auditId: lastAudit.id.toString().split('-')[0].toUpperCase(),
          userId: lastAudit.user_id,
          name: lastAudit.name || lastAudit.project_name || 'Sans titre',
          date: lastAudit.created_at,
          inputs: lastAudit.inputs,
          results: lastAudit.results,
          verdictLabel: lastAudit.verdict_label,
          notes: lastAudit.notes,
          type: lastAudit.type || (lastAudit.inputs?.creativeImageUrl ? 'CREATIVE' : 'ANDROMEDA')
        } : null,
        status: (p.status || 'new') as any
      });
    }
    return leads;
  },
  // Nouvelle méthode pour l'historique complet d'un utilisateur
  getUserHistory: async (userId: string): Promise<SimulationHistory[]> => {
    return AuditService.getAuditHistory(userId);
  },
  // Nouvelle méthode pour supprimer un lead
  deleteUser: async (userId: string) => {
    // Suppression des audits associés
    await supabase.from('audits').delete().eq('user_id', userId);
    // Suppression du profil
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
  },
  // Nouvelle méthode pour mettre à jour un profil
  updateLeadProfile: async (userId: string, updates: Partial<UserProfile> & { status?: string }) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
    if (error) throw error;
  },
  getDatabaseLogs: async (limit: number = 300): Promise<any[]> => {
    const { data: audits, error: aError } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (aError) throw aError;
    if (!audits) return [];

    const { data: profiles } = await supabase.from('profiles').select('id, email, full_name');
    
    const enrichedAudits = audits.map(audit => ({
      ...audit,
      profiles: profiles?.find(p => p.id === audit.user_id) || { email: 'Inconnu', full_name: 'Visiteur' }
    }));

    return enrichedAudits;
  },
  updateLeadStatus: async (userId: string, status: string) => {
    await supabase.from('profiles').update({ status }).eq('id', userId);
  },
  updateLeadConsulting: async (userId: string, value: number) => {
    await supabase.from('profiles').update({ consulting_value: value }).eq('id', userId);
  }
};
