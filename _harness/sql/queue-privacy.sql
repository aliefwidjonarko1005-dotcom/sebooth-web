-- Queue privacy and one-number-per-person rules.
--
-- Run it by hand in the Supabase SQL editor, in this order:
--
--   1. Vercel: make sure SUPABASE_SERVICE_ROLE_KEY is set (server only, never NEXT_PUBLIC_).
--      Add it to .env.local too if you use the admin panel or the queue locally.
--   2. Deploy the code from the same change first. Older code reads tickets with select(*) as the
--      anon role, and that breaks the moment step 4 runs.
--   3. Run the read-only query below and keep its output. It is your way back.
--   4. Run the transaction. It applies completely or not at all.
--   5. Run: node scripts/verify_queue_privacy.mjs


-- ── Step 3: read-only, keep the output ─────────────────────────────────────────

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('queue_tickets', 'push_subscriptions')
order by tablename, policyname;


-- ── Step 4 ─────────────────────────────────────────────────────────────────────

begin;

-- One holder per number, one live number per person. These stop the double tickets for good;
-- joinQueue already retries when the database refuses one.
create unique index if not exists queue_tickets_event_number_key
  on public.queue_tickets (event_id, queue_number);

create unique index if not exists queue_tickets_one_live_ticket_per_user
  on public.queue_tickets (event_id, user_id)
  where user_id is not null and status in ('waiting', 'called', 'in_session');

-- The proximity notifications already try to set these. Without the columns the write fails
-- silently and people are notified again after every change in the queue.
alter table public.queue_tickets
  add column if not exists push_preparing_sent boolean not null default false,
  add column if not exists push_approaching_sent boolean not null default false;

-- queue_tickets: everyone may read what the venue screen shows anyway. Nothing else, and no writes:
-- those go through the server with the service key, after it has checked who is asking.
-- Keep the column list in step with PUBLIC_TICKET_COLUMNS in src/lib/queue/queueFetchers.ts.
alter table public.queue_tickets enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'queue_tickets'
  loop
    execute format('drop policy %I on public.queue_tickets', p.policyname);
  end loop;
end $$;

create policy "Anyone can read the public queue"
  on public.queue_tickets for select
  to anon, authenticated
  using (true);

revoke all on public.queue_tickets from anon, authenticated;
grant select (event_id, queue_number, display_name, status, called_at, completed_at, is_checked_in)
  on public.queue_tickets to anon, authenticated;

-- push_subscriptions: holds the keys to reach someone's phone. Server only.
alter table public.push_subscriptions enable row level security;

do $$
declare p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'push_subscriptions'
  loop
    execute format('drop policy %I on public.push_subscriptions', p.policyname);
  end loop;
end $$;

revoke all on public.push_subscriptions from anon, authenticated;

commit;


-- ── Way back, only if something breaks ─────────────────────────────────────────
-- The indexes and the two new columns are harmless and can stay.
--
-- begin;
-- drop policy "Anyone can read the public queue" on public.queue_tickets;
-- grant all on public.queue_tickets to anon, authenticated;
-- grant all on public.push_subscriptions to anon, authenticated;
-- -- then recreate the policies from the output you kept in step 3
-- commit;
