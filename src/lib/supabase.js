import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

let supabaseClient = null;
let clientInitializationError = null;

if (isSupabaseConfigured) {
  try {
    const parsedUrl = new URL(supabaseUrl);
    const isLocalDevelopmentHost = ['localhost', '127.0.0.1'].includes(parsedUrl.hostname);

    if (parsedUrl.protocol !== 'https:' && !(isLocalDevelopmentHost && parsedUrl.protocol === 'http:')) {
      throw new Error('O URL do Supabase deve utilizar HTTPS (HTTP só é permitido em localhost).');
    }

    supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  } catch (error) {
    clientInitializationError = error;
  }
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Configuração do Supabase em falta.');
  }

  if (clientInitializationError) {
    throw clientInitializationError;
  }

  if (!supabaseClient) {
    throw new Error('Não foi possível inicializar o cliente Supabase.');
  }

  return supabaseClient;
}
