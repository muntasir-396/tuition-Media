/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
// If the environment variables are not set, it will fail gracefully when attempting to connect.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Example usage:
 * 
 * import { supabase } from '../lib/supabase';
 * 
 * async function fetchUsers() {
 *   if (!supabase) throw new Error("Supabase is not configured.");
 *   const { data, error } = await supabase.from('users').select('*');
 *   if (error) console.error(error);
 *   return data;
 * }
 */
