
import { createClient } from '@supabase/supabase-js';

/**
 * 🛠️ CONFIGURATION SUPABASE
 * Collez vos clés ici pour activer le SaaS pour tous.
 */
const MANUAL_URL = "https://jgmiexccumfeglryjywj.supabase.co"; 
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnbWlleGNjdW1mZWdscnlqeXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NTM3NDksImV4cCI6MjA4MjEyOTc0OX0.SHhjCOFbDctlt1ZnFczxk-M94Njsaaq3EgVUiZCiTtA";
/** --------------------------------------------------------- */

const getEnvValue = (key: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    // @ts-ignore
    const val = (import.meta.env?.[key] || (window as any)?._env_?.[key] || (process?.env as any)?.[key] || '').trim();
    return val;
  } catch (e) {
    return '';
  }
};

const url = (MANUAL_URL || getEnvValue('NEXT_PUBLIC_SUPABASE_URL') || '').replace(/\/$/, "");
const key = (MANUAL_KEY || getEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '').trim();

export const configDiagnostic = {
  hasUrl: url.length > 10 && url.startsWith('http'),
  hasKey: key.length > 20,
  url: url
};

// Initialisation sécurisée
export const supabase = createClient(
  configDiagnostic.hasUrl ? url : 'https://placeholder.supabase.co', 
  configDiagnostic.hasKey ? key : 'placeholder'
);
