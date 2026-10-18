import { createSupabaseServerClient } from './supabase/server';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('UNAUTHENTICATED');
  return user;
}
export async function requireUserOrRedirect() {
  try { return await requireUser(); } catch { redirect('/login'); }
}
