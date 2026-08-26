import { supabase } from '../lib/supabase';
import type { Profile } from '../types/db';

export type ProgressEvent = 'swipe_rejected' | 'story_beat';

export async function awardProgress(event: ProgressEvent): Promise<Profile> {
  const { data, error } = await supabase.rpc('award_progress', { p_event: event });
  if (error) throw error;
  return data as Profile;
}
