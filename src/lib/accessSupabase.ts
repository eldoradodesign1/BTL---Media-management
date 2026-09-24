import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_ACCESS_URL = 'https://upkzlppvwckriuidnyvq.supabase.co';
const DEFAULT_ACCESS_KEY = 'sb_publishable_36S8t4yZQhYXXMZa3p9ldg_EWnP8gPL';

export const getAccessSupabaseConfig = () => {
  const url = (import.meta.env.VITE_ACCESS_SUPABASE_URL || DEFAULT_ACCESS_URL).trim().replace(/\/$/, '');
  const anonKey = (import.meta.env.VITE_ACCESS_SUPABASE_ANON_KEY || DEFAULT_ACCESS_KEY).trim();
  return { url, anonKey, isConfigured: Boolean(url && anonKey) };
};

let accessSupabaseInstance: SupabaseClient | null = null;

export const getAccessSupabaseClient = (): SupabaseClient | null => {
  const config = getAccessSupabaseConfig();
  if (!config.isConfigured) return null;
  if (!accessSupabaseInstance) {
    try {
      accessSupabaseInstance = createClient(config.url, config.anonKey);
    } catch (error) {
      console.error('Error initializing access Supabase client:', error);
      return null;
    }
  }
  return accessSupabaseInstance;
};

export const resetAccessSupabaseClient = () => {
  accessSupabaseInstance = null;
};

export const normalizePhone = (value: string | null | undefined) =>
  (value || '').replace(/\D/g, '');
