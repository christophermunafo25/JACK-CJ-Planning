-- Annual Plan — Supabase schema
-- Run this once in your project: Supabase Dashboard > SQL Editor > New query >
-- paste all of this > Run. Safe to re-run; it uses "if not exists" / "or replace".

-- One row per meeting code. The whole plan lives in a single JSON blob.
create table if not exists public.meetings (
  code       text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock the table itself down. No client role may touch it directly, so nobody
-- can list or dump other couples' plans. All access goes through the two
-- functions below, which require the meeting code.
alter table public.meetings enable row level security;
revoke all on public.meetings from anon, authenticated;

-- Read a meeting by its code.
create or replace function public.get_meeting(p_code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select data from public.meetings where code = p_code;
$$;

-- Create or update a meeting by code. Top-level keys are shallow-merged
-- (data || patch), so when one partner saves their prep and the other saves
-- theirs, the two writes land under different keys and never overwrite each
-- other.
create or replace function public.sync_meeting(p_code text, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if p_code is null or length(p_code) < 4 then
    raise exception 'invalid meeting code';
  end if;

  insert into public.meetings as m (code, data, updated_at)
  values (p_code, p_patch, now())
  on conflict (code) do update
    set data = m.data || excluded.data,
        updated_at = now()
  returning m.data into result;

  return result;
end;
$$;

-- Expose only these two functions to the public anon key.
revoke all on function public.get_meeting(text) from public;
revoke all on function public.sync_meeting(text, jsonb) from public;
grant execute on function public.get_meeting(text) to anon, authenticated;
grant execute on function public.sync_meeting(text, jsonb) to anon, authenticated;
