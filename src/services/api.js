import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const initSupabase = async () => {
  if (supabaseInstance) return supabaseInstance;

  try {
    const url = import.meta.env.VITE_SB_URL;
    const anonKey = import.meta.env.VITE_SB_ANON_KEY;

    if (url && anonKey) {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    }

    const response = await fetch('/api/get-config');
    if (!response.ok) throw new Error('Error fetching config');

    const config = await response.json();
    if (!config.url || !config.anonKey) throw new Error('Missing credentials');

    supabaseInstance = createClient(config.url, config.anonKey);
    return supabaseInstance;
  } catch (error) {
    console.error('API Initialization Error:', error);
    throw error;
  }
};

export const getProducts = async () => {
  const supabase = await initSupabase();
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
};

export const placeOrderAPI = async (orderDetails) => {
  let response;

  try {
    response = await fetch('/api/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderDetails }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Error del servidor (${response.status}). Intenta de nuevo.`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Error procesando la orden (${response.status})`);
  }

  return data;
};