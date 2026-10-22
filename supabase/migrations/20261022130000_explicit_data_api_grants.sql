-- Explicit Data API grants for existing public tables (NestProtect)
--
-- Why: starting Oct 30, 2026 Supabase no longer auto-grants Data API access on
-- new public tables. Live tables keep their grants, but anything that replays
-- migrations (supabase db reset, preview branches, new projects) would create
-- tables with NO grants. This migration makes the grants explicit.
--
-- Grants are scoped to what each table's RLS policies call for (least privilege).
-- RLS still decides which rows are visible.
--
-- Guarded: some tables (act_*, prep_*, recovery_*, zips_with_risks) were created
-- outside supabase/migrations, so on a replay they may not exist yet. Each grant
-- is skipped when its object is missing instead of failing the whole migration.
-- Grants are idempotent, so this is safe to run on the live project.

do $$
declare
  r record;
begin
  -- Table grants: (table, privileges, roles)
  for r in
    select * from (values
      -- Public reference data: readable by anon + authenticated
      ('act_tasks',          'select', 'anon, authenticated'),
      ('prep_maintasks',     'select', 'anon, authenticated'),
      ('prep_subtasks',      'select', 'anon, authenticated'),
      ('recovery_tasks',     'select', 'anon, authenticated'),
      ('zips_with_risks',    'select', 'anon, authenticated'),

      -- Readable by signed-in users only
      ('disaster_resources', 'select', 'authenticated'),

      -- Per-user data: authenticated only (RLS limits rows to the owner)
      ('act_task_user_state',        'select, insert, update, delete', 'authenticated'),
      ('prep_task_user_state',       'select, insert, update, delete', 'authenticated'),
      ('recovery_task_user_state',   'select, insert, update, delete', 'authenticated'),
      ('user_preparedness_progress', 'select, insert, update, delete', 'authenticated'),
      ('user_resource_prefs',        'select, insert, update, delete', 'authenticated'),

      -- No DELETE policy exists for these, so no DELETE grant
      ('profiles',           'select, insert, update', 'authenticated'),
      ('user_assessments',   'select, insert, update', 'authenticated'),

      -- Read-only for users (roles are managed server-side)
      ('user_roles',         'select', 'authenticated'),

      -- Sensitive audit log: admins (authenticated) read only; service_role writes
      ('contact_access_logs','select', 'authenticated'),

      -- service_role: server-side access to every table
      ('act_task_user_state',        'select, insert, update, delete', 'service_role'),
      ('act_tasks',                  'select, insert, update, delete', 'service_role'),
      ('contact_access_logs',        'select, insert, update, delete', 'service_role'),
      ('disaster_resources',         'select, insert, update, delete', 'service_role'),
      ('prep_maintasks',             'select, insert, update, delete', 'service_role'),
      ('prep_subtasks',              'select, insert, update, delete', 'service_role'),
      ('prep_task_user_state',       'select, insert, update, delete', 'service_role'),
      ('profiles',                   'select, insert, update, delete', 'service_role'),
      ('recovery_task_user_state',   'select, insert, update, delete', 'service_role'),
      ('recovery_tasks',             'select, insert, update, delete', 'service_role'),
      ('user_assessments',           'select, insert, update, delete', 'service_role'),
      ('user_preparedness_progress', 'select, insert, update, delete', 'service_role'),
      ('user_resource_prefs',        'select, insert, update, delete', 'service_role'),
      ('user_roles',                 'select, insert, update, delete', 'service_role'),
      ('zips_with_risks',            'select, insert, update, delete', 'service_role')
    ) as t(tbl, privs, roles)
  loop
    if to_regclass(format('public.%I', r.tbl)) is not null then
      execute format('grant %s on public.%I to %s', r.privs, r.tbl, r.roles);
    else
      raise notice 'skipping grant: public.% does not exist', r.tbl;
    end if;
  end loop;

  -- Sequences used by server-side inserts
  for r in
    select * from (values
      ('act_tasks_order_num_seq'),
      ('disaster_resources_id_seq')
    ) as s(seq)
  loop
    if to_regclass(format('public.%I', r.seq)) is not null then
      execute format('grant usage, select on sequence public.%I to service_role', r.seq);
    else
      raise notice 'skipping grant: sequence public.% does not exist', r.seq;
    end if;
  end loop;
end
$$;
