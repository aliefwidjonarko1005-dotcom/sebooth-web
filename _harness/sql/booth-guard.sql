-- Booth Guard: which kiosk installs may run, and the owner-signed commands they receive.
--
-- Run it by hand in the Supabase SQL editor, once. It only adds tables; nothing existing changes.
-- Every table is server-only: RLS on, no policies, and anon/authenticated lose all grants. The
-- website's /api/booth/* and /api/admin/booths* routes reach them with SUPABASE_SERVICE_ROLE_KEY.
--
-- A booth can never be unlocked from here: the kiosk only accepts approve/unlock commands signed by
-- the owner's passkey (or offline recovery key) pinned in the app build. These rows are the relay
-- and the dashboard view, not the authority.

begin;

create table if not exists public.booth_devices (
  id uuid primary key default gen_random_uuid(),
  public_key text not null unique,           -- Ed25519 SPKI DER, base64
  fingerprint text not null,                 -- sha256(MachineGuid + app id), hex
  hostname text,
  app_version text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'locked', 'revoked')),
  lock_reason text,
  counter bigint not null default 0,         -- last accepted request counter; a repeat or step back means a clone
  label text,
  last_seen timestamptz,
  last_ip text,
  last_status jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.booth_commands (
  id uuid primary key,                       -- the command's own id, so a command is stored once
  device_id uuid not null references public.booth_devices(id) on delete cascade,
  command jsonb not null,                    -- exactly what the owner signed
  assertion jsonb not null,                  -- WebAuthn assertion or recovery signature
  created_by uuid,
  created_at timestamptz not null default now(),
  acked_at timestamptz,
  ack_result text
);
create index if not exists booth_commands_pending on public.booth_commands (device_id) where acked_at is null;

create table if not exists public.owner_keys (
  credential_id text primary key,            -- base64url
  cose_public_key text not null,             -- base64url, for server-side verification
  jwk jsonb not null,                        -- what the kiosk build pins
  label text,
  created_by uuid,
  created_at timestamptz not null default now()
);

alter table public.booth_devices enable row level security;
alter table public.booth_commands enable row level security;
alter table public.owner_keys enable row level security;
revoke all on public.booth_devices from anon, authenticated;
revoke all on public.booth_commands from anon, authenticated;
revoke all on public.owner_keys from anon, authenticated;

commit;
