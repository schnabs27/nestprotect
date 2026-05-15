import { get, set } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { prewarmChecklistMirrors } from './checklistSync';

// Row type aliases drawn from the generated Database type
type PrepMaintask     = Database['public']['Tables']['prep_maintasks']['Row'];
type PrepSubtask      = Database['public']['Tables']['prep_subtasks']['Row'];
type ActTask          = Database['public']['Tables']['act_tasks']['Row'];
type RecoveryTask     = Database['public']['Tables']['recovery_tasks']['Row'];
type DisasterResource = Database['public']['Tables']['disaster_resources']['Row'];

export type ZipRisk = {
  risk_rating: string | null;
  high_risks: string | null;
  high_risks_oneword: string[] | null;
};

export type { PrepMaintask, PrepSubtask, ActTask, RecoveryTask, DisasterResource };

// --- Cache keys ---
const KEYS = {
  zipRisk: (zip: string) => `zips_with_risks:${zip}`,
  prepMaintasks:     'playbook:prep_maintasks',
  prepSubtasks:      'playbook:prep_subtasks',
  actTasks:          'playbook:act_tasks',
  recoveryTasks:     'playbook:recovery_tasks',
  disasterResources: 'playbook:disaster_resources',
} as const;

// --- Connectivity vs. real-error detection ---
//
// PostgreSQL errors from Supabase always carry a non-empty `code`
// (e.g. "42501" RLS violation, "42P01" undefined table).
// Network-level failures come back from supabase-js with `code = ''`
// (empty string — falsy) plus a browser-generated message.
//
// Rule: fall back to IDB ONLY on connectivity failures.
// Real server errors must surface so callers can handle them correctly.
export function isConnectivityError(err: unknown): boolean {
  if (!navigator.onLine) return true;
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  if (e.code) return false; // non-empty PostgreSQL error code → real server error
  // AbortError / TimeoutError are connectivity-class failures
  const name = String(e.name ?? '');
  if (name === 'AbortError' || name === 'TimeoutError') return true;
  // Chrome: "Failed to fetch"
  // Firefox: "NetworkError when attempting to fetch"
  // Safari iOS: "Load failed"
  const msg = String(e.message ?? '');
  return /failed to fetch|networkerror when attempting to fetch|load failed|network error|request was aborted/i.test(msg);
}

// --- Internal ---
type Cached<T> = { data: T; cached_at: number };

async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<{ data: T | null; error: unknown }>,
): Promise<{ data: T | null; error: unknown; fromCache?: true }> {
  const { data, error } = await fetcher();

  if (!error) {
    set(key, { data, cached_at: Date.now() } as Cached<T>).catch(() => {});
    return { data, error: null };
  }

  if (!isConnectivityError(error)) {
    return { data: null, error }; // real server error — let it surface
  }

  const cached = await get<Cached<T>>(key).catch(() => undefined);
  if (cached != null) {
    return { data: cached.data, error: null, fromCache: true };
  }

  return { data: null, error };
}

// --- ZIP risk (per-zip key) ---

export async function fetchZipRisk(zip: string) {
  return fetchWithCache<ZipRisk>(KEYS.zipRisk(zip), () =>
    supabase
      .from('zips_with_risks')
      .select('risk_rating, high_risks, high_risks_oneword')
      .eq('zipcode', parseInt(zip))
      .single() as unknown as Promise<{ data: ZipRisk | null; error: unknown }>,
  );
}

// --- Playbook tables (full table, single shared key) ---

export async function fetchPrepMaintasks() {
  return fetchWithCache<PrepMaintask[]>(KEYS.prepMaintasks, () =>
    supabase
      .from('prep_maintasks')
      .select('*') as unknown as Promise<{ data: PrepMaintask[] | null; error: unknown }>,
  );
}

export async function fetchPrepSubtasks() {
  return fetchWithCache<PrepSubtask[]>(KEYS.prepSubtasks, () =>
    supabase
      .from('prep_subtasks')
      .select('*') as unknown as Promise<{ data: PrepSubtask[] | null; error: unknown }>,
  );
}

export async function fetchActTasks() {
  return fetchWithCache<ActTask[]>(KEYS.actTasks, () =>
    supabase
      .from('act_tasks')
      .select('*') as unknown as Promise<{ data: ActTask[] | null; error: unknown }>,
  );
}

export async function fetchRecoveryTasks() {
  return fetchWithCache<RecoveryTask[]>(KEYS.recoveryTasks, () =>
    supabase
      .from('recovery_tasks')
      .select('*') as unknown as Promise<{ data: RecoveryTask[] | null; error: unknown }>,
  );
}

export async function fetchDisasterResources() {
  return fetchWithCache<DisasterResource[]>(KEYS.disasterResources, () =>
    supabase
      .from('disaster_resources')
      .select('*') as unknown as Promise<{ data: DisasterResource[] | null; error: unknown }>,
  );
}

// --- Pre-warm ---

export async function prewarmPlaybook(): Promise<void> {
  await Promise.allSettled([
    fetchPrepMaintasks(),
    fetchPrepSubtasks(),
    fetchActTasks(),
    fetchRecoveryTasks(),
    fetchDisasterResources(),
  ]);
}

export async function prewarmForUser(userId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('zip_code')
      .eq('user_id', userId)
      .maybeSingle();

    await Promise.allSettled([
      data?.zip_code ? fetchZipRisk(data.zip_code) : Promise.resolve(),
      prewarmPlaybook(),
      prewarmChecklistMirrors(userId),
    ]);
  } catch {
    // Pre-warming is best-effort; never throw.
  }
}
