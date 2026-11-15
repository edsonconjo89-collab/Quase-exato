import { getSupabaseClient } from '../lib/supabase.js';

let pendingSessionPromise = null;

/**
 * Reutiliza a sessão anónima guardada pelo Supabase ou cria uma nova.
 * A promessa partilhada evita dois sign-ins simultâneos durante o arranque.
 */
export async function ensureAnonymousSession() {
  if (pendingSessionPromise) {
    return pendingSessionPromise;
  }

  pendingSessionPromise = createOrRestoreSession();

  try {
    return await pendingSessionPromise;
  } finally {
    pendingSessionPromise = null;
  }
}

async function createOrRestoreSession() {
  const supabase = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (sessionData.session?.user) {
    return sessionData.session;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();

  if (signInError) {
    throw signInError;
  }

  if (!signInData.session?.user) {
    throw new Error('O Supabase não devolveu uma sessão de utilizador.');
  }

  return signInData.session;
}

