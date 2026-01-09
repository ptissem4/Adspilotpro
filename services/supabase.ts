import { createClient } from '@supabase/supabase-js';

/**
 * 🛠️ CONFIGURATION SUPABASE
 */
const MANUAL_URL = "https://jgmiexccumfeglryjywj.supabase.co"; 
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbWlleGNjdW1mZWdscnlqeXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTM3NDksImV4cCI6MjA4MjEyOTc0OX0.SHhjCOFbDctlt1ZnFczxk-M94Njsaaq3EgVUiZCiTtA";

const getEnvValue = (key: string): string => {
  try {
    // 1. Vite / Modern ESM (Standard actuel pour Netlify/Vercel)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignorer silencieusement
  }
  return '';
};

// Logique de priorité : Manuel > Vite Env > Vide
const url = (MANUAL_URL || getEnvValue('VITE_SUPABASE_URL') || '').replace(/\/$/, "");
const key = (MANUAL_KEY || getEnvValue('VITE_SUPABASE_ANON_KEY') || '').trim();

export const configDiagnostic = {
  hasUrl: url.length > 10 && url.startsWith('http'),
  hasKey: key.length > 20,
  url: url
};

// Initialisation sécurisée
// Utilise un placeholder si la config échoue pour éviter le crash immédiat au chargement du fichier
export const supabase = createClient(
  configDiagnostic.hasUrl ? url : 'https://placeholder.supabase.co', 
  configDiagnostic.hasKey ? key : 'placeholder'
);