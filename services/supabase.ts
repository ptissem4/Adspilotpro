import { createClient } from '@supabase/supabase-js';

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
  } catch (e) {
    console.warn(`Erreur lors de la lecture de la clé ${key}:`, e);
  }
  return '';
};

const supabaseUrl = getEnvValue('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvValue('VITE_SUPABASE_ANON_KEY');

export const configDiagnostic = {
  hasUrl: supabaseUrl.length > 10 && supabaseUrl.startsWith('http'),
  hasKey: supabaseAnonKey.length > 20,
  url: supabaseUrl
};

// Initialisation du client avec des placeholders sécurisés si les clés sont absentes
export const supabase = createClient(
  configDiagnostic.hasUrl ? supabaseUrl : 'https://placeholder.supabase.co', 
  configDiagnostic.hasKey ? supabaseAnonKey : 'placeholder'
);