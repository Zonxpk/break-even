import { supabase } from '../lib/supabase';
import type { MatchRow, Persona } from '../types/db';

export async function fetchPersonas(): Promise<Persona[]> {
  const { data, error } = await supabase.from('personas').select('*').eq('active', true);
  if (error) throw error;
  return (data as Persona[]).map((p) => ({
    ...p,
    beats: Array.isArray(p.beats) ? p.beats : [],
  }));
}

export async function listMatches(): Promise<(MatchRow & { personas: Persona | null })[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*, personas(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as never;
}

export async function getMatch(matchId: string): Promise<MatchRow & { personas: Persona | null }> {
  const { data, error } = await supabase.from('matches').select('*, personas(*)').eq('id', matchId).single();
  if (error) throw error;
  return data as never;
}

export async function createMatch(personaId: string): Promise<MatchRow> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error('NOT_SIGNED_IN');

  const { data, error } = await supabase
    .from('matches')
    .insert({ user_id: userId, persona_id: personaId, affection: 5, beats_done: [] })
    .select()
    .single();
  if (error) throw error;
  return data as MatchRow;
}

export async function updateMatch(matchId: string, patch: { affection?: number; beats_done?: string[] }): Promise<void> {
  const { error } = await supabase.from('matches').update(patch).eq('id', matchId);
  if (error) throw error;
}
