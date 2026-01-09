import { createClient } from '@supabase/supabase-js';

const getEnvValue = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

const url = getEnvValue('VITE_SUPABASE_URL').replace(/\/$/, "");
const key = getEnvValue('VITE_SUPABASE_ANON_KEY').trim();

export const configDiagnostic = {
  hasUrl: url.length > 10 && url.startsWith('http'),
  hasKey: key.length > 20,
  url: url
};

export const supabase = createClient(
  configDiagnostic.hasUrl ? url : 'https://placeholder.supabase.co', 
  configDiagnostic.hasKey ? key : 'placeholder'
);