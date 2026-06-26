-- Run once in the Supabase SQL editor to create the history table.
-- The frontend (src/services/historyApi.js) reads/writes this table
-- via PostgREST using the service-role key.

create table if not exists public.history (
  number bigserial primary key,
  input text not null,
  segmented_output jsonb not null,
  created_at timestamptz not null default now()
);
