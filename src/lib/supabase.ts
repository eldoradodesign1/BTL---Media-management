import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables, defaults, or localStorage for interactive setup
export const getSupabaseConfig = () => {
  const DEFAULT_URL = 'https://mpigzdighzzcdccffgyz.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_61FpNU20NoBPuwKrnXTDxQ_389wVYnz';

  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  let rawUrl = localStorage.getItem('mcm_supabase_url') || envUrl || DEFAULT_URL;
  let rawKey = localStorage.getItem('mcm_supabase_anon_key') || envKey || DEFAULT_KEY;

  // Clean URL format if user passed REST endpoint URL
  let cleanUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

  return {
    url: cleanUrl,
    anonKey: rawKey.trim(),
    isConfigured: Boolean(cleanUrl && rawKey.trim())
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (url) localStorage.setItem('mcm_supabase_url', url.trim());
  else localStorage.removeItem('mcm_supabase_url');

  if (anonKey) localStorage.setItem('mcm_supabase_anon_key', anonKey.trim());
  else localStorage.removeItem('mcm_supabase_anon_key');
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
