import { createClient } from '@supabase/supabase-js';

export let supabase = null;

export const initSupabase = async () => {
  if (supabase) return supabase;

  try {
    const url = import.meta.env.VITE_SB_URL;
    const anonKey = import.meta.env.VITE_SB_ANON_KEY;

    if (url && anonKey) {
      supabase = createClient(url, anonKey);
      return supabase;
    }

    const response = await fetch('/api/get-config');
    if (!response.ok) throw new Error('Error fetching config');

    const config = await response.json();
    if (!config.url || !config.anonKey) throw new Error('Missing credentials');

    supabase = createClient(config.url, config.anonKey);
    return supabase;
  } catch (error) {
    console.error('API Initialization Error:', error);
    throw error;
  }
};

export const getProducts = async () => {
  const sb = await initSupabase();
  const { data, error } = await sb.from('products').select('*');
  if (error) throw error;
  return data;
};

export const getBusinessConfig = async () => {
  const sb = await initSupabase();
  const { data, error } = await sb
    .from('business_config')
    .select('*')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return data;
};

export const validateOrderAPI = async (orderDetails) => {
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

export const saveOrderToDB = async (orderData) => {
  const sb = await initSupabase();
  const { data, error } = await sb.from('orders').insert([orderData]).select();
  if (error) throw error;
  return data;
};