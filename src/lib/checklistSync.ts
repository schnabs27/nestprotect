import { get, set } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';
import { isConnectivityError } from './offlineCache';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChecklistType = 'prep' | 'act' | 'recovery';

const TABLE_FOR: Record<ChecklistType, 'prep_task_user_state' | 'act_task_user_state' | 'recovery_task_user_state'> = {
  prep:     'prep_task_user_state',
  act:      'act_task_user_state',
  recovery: 'recovery_task_user_state',
};

interface WriteQueueEntry {
  table: 'prep_task_user_state' | 'act_task_user_state' | 'recovery_task_user_state';
  user_id: string;
  task_id: string;
  action: 'check' | 'uncheck';
  timestamp: number;
}

// ---------------------------------------------------------------------------
// IDB keys
// ---------------------------------------------------------------------------
// All keys live in the same idb-keyval store as the Step-2a playbook cache.
//
// checklist:prep:<userId>      → string[]  (checked task IDs; undefined = not seeded)
// checklist:act:<userId>       → string[]
// checklist:recovery:<userId>  → string[]
// checklist:queue              → WriteQueueEntry[]
//   Persisted in IndexedDB so offline writes survive app close/reopen.
//   Each entry carries user_id, so the queue is shared across sessions —
//   writes are correctly attributed regardless of who is signed in.
//   If per-user queue isolation is ever needed, scope this key to include userId.

const MIRROR_KEY = (type: ChecklistType, userId: string) =>
  `checklist:${type}:${userId}` as const;

const QUEUE_KEY = 'checklist:queue';

// ---------------------------------------------------------------------------
// IDB mirror helpers
// ---------------------------------------------------------------------------

export async function getChecklistMirror(
  type: ChecklistType,
  userId: string,
): Promise<string[] | undefined> {
  return get<string[]>(MIRROR_KEY(type, userId));
}

export async function setChecklistMirror(
  type: ChecklistType,
  userId: string,
  ids: string[],
): Promise<void> {
  await set(MIRROR_KEY(type, userId), ids);
}

// ---------------------------------------------------------------------------
// Queue helpers (persisted in idb-keyval)
// ---------------------------------------------------------------------------

async function getQueue(): Promise<WriteQueueEntry[]> {
  return (await get<WriteQueueEntry[]>(QUEUE_KEY)) ?? [];
}

async function saveQueue(entries: WriteQueueEntry[]): Promise<void> {
  await set(QUEUE_KEY, entries);
}

// ---------------------------------------------------------------------------
// Coalescing
// ---------------------------------------------------------------------------
// Groups entries by (user_id, task_id) and keeps only the latest per group.
// Preserves timestamp-ascending order so drains apply writes chronologically.
//
// Example:
//   in:  [check t=100, uncheck t=200, check t=300] for (u,taskA)
//        [check t=150] for (u,taskB)
//   out: [check t=150 for taskB, check t=300 for taskA]

function coalesceQueue(entries: WriteQueueEntry[]): WriteQueueEntry[] {
  const latest = new Map<string, WriteQueueEntry>();
  for (const entry of entries) {
    const key = `${entry.user_id}:${entry.task_id}`;
    const existing = latest.get(key);
    if (!existing || entry.timestamp > existing.timestamp) {
      latest.set(key, entry);
    }
  }
  return Array.from(latest.values()).sort((a, b) => a.timestamp - b.timestamp);
}

// ---------------------------------------------------------------------------
// Apply a single intent to Supabase
// ---------------------------------------------------------------------------

async function applyIntent(entry: WriteQueueEntry): Promise<void> {
  if (entry.action === 'check') {
    const { error } = await supabase.from(entry.table).upsert(
      { user_id: entry.user_id, task_id: entry.task_id, is_checked: true },
      { onConflict: 'user_id,task_id' },
    );
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from(entry.table)
      .delete()
      .eq('user_id', entry.user_id)
      .eq('task_id', entry.task_id);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// revertMirrorForEntry — shared by both error paths
// ---------------------------------------------------------------------------

async function revertMirrorForEntry(entry: WriteQueueEntry): Promise<void> {
  const type = (Object.keys(TABLE_FOR) as ChecklistType[]).find(
    k => TABLE_FOR[k] === entry.table,
  )!;
  const current = (await getChecklistMirror(type, entry.user_id)) ?? [];
  if (entry.action === 'check') {
    await setChecklistMirror(type, entry.user_id, current.filter(id => id !== entry.task_id));
  } else {
    if (!current.includes(entry.task_id)) {
      await setChecklistMirror(type, entry.user_id, [...current, entry.task_id]);
    }
  }
}

// ---------------------------------------------------------------------------
// drainQueue — background path only (online listener + boot-time call).
//
// Coalesces the queue, then applies each entry in timestamp order.
// On connectivity error: stops and keeps the remaining entries queued.
// On real server error: reverts the IDB mirror for that entry and shows a
//   toast so the UI matches Supabase truth after the next mount/refresh.
// ---------------------------------------------------------------------------

async function drainQueue(): Promise<void> {
  let queue = await getQueue();
  if (queue.length === 0) return;

  queue = coalesceQueue(queue);
  await saveQueue(queue);

  const remaining: WriteQueueEntry[] = [];

  for (let i = 0; i < queue.length; i++) {
    const entry = queue[i];
    try {
      await applyIntent(entry);
      // success — don't add to remaining
    } catch (err) {
      if (isConnectivityError(err)) {
        // Stop here; keep this entry and all that follow.
        remaining.push(...queue.slice(i));
        break;
      }
      // Real server error: revert mirror so UI corrects on next mount/refresh,
      // show toast, and drop the entry (it won't succeed on retry).
      await revertMirrorForEntry(entry).catch(() => {});
      toast.error("Some recent changes couldn't be saved and have been reverted.");
    }
  }

  await saveQueue(remaining);
}

// ---------------------------------------------------------------------------
// writeChecklist — called by checkbox toggle handlers in all three pages.
//
// Attempts only the just-enqueued entry directly. This keeps the immediate
// path scoped to "did MY write succeed" — earlier queued entries from
// offline sessions are handled exclusively by background drains.
//
// Flow:
//   1. Update IDB mirror optimistically.
//   2. Enqueue the entry (persists it for background drain if needed).
//   3. Attempt THIS entry only via a direct applyIntent call:
//      - Success:            remove entry from queue, return.
//      - Connectivity error: leave entry queued, return without throwing.
//      - Real server error:  revert IDB mirror, remove entry from queue, throw.
// ---------------------------------------------------------------------------

export async function writeChecklist(opts: {
  type: ChecklistType;
  userId: string;
  taskId: string;
  action: 'check' | 'uncheck';
}): Promise<void> {
  const { type, userId, taskId, action } = opts;

  // 1. Update IDB mirror optimistically.
  const current = (await getChecklistMirror(type, userId)) ?? [];
  const updated =
    action === 'check'
      ? current.includes(taskId) ? current : [...current, taskId]
      : current.filter(id => id !== taskId);
  await setChecklistMirror(type, userId, updated);

  // 2. Enqueue (persists for background drain if the immediate attempt fails).
  const entry: WriteQueueEntry = {
    table: TABLE_FOR[type],
    user_id: userId,
    task_id: taskId,
    action,
    timestamp: Date.now(),
  };
  const queue = await getQueue();
  await saveQueue([...queue, entry]);

  // 3. Attempt only this entry directly.
  try {
    await applyIntent(entry);
    // Success: remove this entry from the queue.
    const q = await getQueue();
    await saveQueue(q.filter(e => !(e.user_id === userId && e.task_id === taskId && e.timestamp === entry.timestamp)));
  } catch (err) {
    if (isConnectivityError(err)) {
      // Offline: entry stays queued for background drain. Not an error.
      return;
    }
    // Real server error: revert IDB mirror and throw so the component
    // can revert its React state and show a toast.
    await revertMirrorForEntry(entry).catch(() => {});
    const q = await getQueue();
    await saveQueue(q.filter(e => !(e.user_id === userId && e.task_id === taskId && e.timestamp === entry.timestamp)));
    throw err;
  }
}

// ---------------------------------------------------------------------------
// prewarmChecklistMirrors — seeds the three IDB mirrors from Supabase.
// Called by prewarmForUser on SIGNED_IN (new login only).
// ---------------------------------------------------------------------------

export async function prewarmChecklistMirrors(userId: string): Promise<void> {
  const tables: [ChecklistType, 'prep_task_user_state' | 'act_task_user_state' | 'recovery_task_user_state'][] = [
    ['prep',     'prep_task_user_state'],
    ['act',      'act_task_user_state'],
    ['recovery', 'recovery_task_user_state'],
  ];

  await Promise.allSettled(
    tables.map(async ([type, table]) => {
      const { data, error } = await supabase
        .from(table)
        .select('task_id')
        .eq('user_id', userId)
        .eq('is_checked', true);
      if (!error && data) {
        await setChecklistMirror(type, userId, data.map(r => r.task_id));
      }
    }),
  );
}

// ---------------------------------------------------------------------------
// startSyncEngine — call once when a session is available (new login or
// page reload with existing session).
//
// On page reload: drainQueue fires before any prewarmForUser call because
// prewarmForUser only runs on SIGNED_IN, not on page reload. This ordering
// is intentional — queued offline writes hit Supabase first, and the local
// IDB mirrors are already correct (updated in-place by writeChecklist during
// the offline session), so re-pre-warming is not needed in this path.
//
// Note: the queue is global (not per-user) but each entry carries user_id,
// so writes are applied to the correct Supabase rows regardless of who is
// currently signed in.
// ---------------------------------------------------------------------------

let syncEngineStarted = false;

export function startSyncEngine(): void {
  if (syncEngineStarted) return;
  syncEngineStarted = true;

  // Drain any writes queued during a previous offline session.
  drainQueue().catch(() => {});

  // Re-drain whenever the browser comes back online.
  window.addEventListener('online', () => {
    drainQueue().catch(() => {});
  });
}
