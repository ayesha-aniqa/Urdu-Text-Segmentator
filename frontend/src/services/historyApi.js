/**
 * historyApi.js — Supabase REST client for the `history` table
 *
 * Uses PostgREST (Supabase's REST API) directly via fetch, so no new
 * npm dependency is required. The project ref is derived from the
 * service-role JWT's `ref` claim.
 *
 * Table schema (run once in the Supabase SQL editor):
 *   create table public.history (
 *     number bigserial primary key,
 *     input text not null,
 *     segmented_output jsonb not null,
 *     created_at timestamptz not null default now()
 *   );
 */

const SUPABASE_URL = 'https://vzwkpnaqzmzabrdrquvp.supabase.co'
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2twbmFxem16YWJyZHJxdXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY5NDg5MiwiZXhwIjoyMDkzMjcwODkyfQ.9j-jTqJ2mgln8gznricwJ5ZROFJmbJGM8gceGuYxhsk'

const HISTORY_ENDPOINT = `${SUPABASE_URL}/rest/v1/history`

const baseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

/**
 * Save one segmentation entry to history. Fire-and-forget on the caller
 * side: never throws — failures are logged so the main flow is unaffected.
 */
export async function saveHistory(input, segmentedOutput) {
  try {
    const res = await fetch(HISTORY_ENDPOINT, {
      method: 'POST',
      headers: { ...baseHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        input,
        segmented_output: segmentedOutput,
      }),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.warn('[historyApi] Save failed:', res.status, detail)
    }
  } catch (err) {
    console.warn('[historyApi] Save error:', err.message)
  }
}

/**
 * Fetch all history entries, newest first.
 * Returns [] on failure.
 */
export async function fetchHistory() {
  try {
    const res = await fetch(
      `${HISTORY_ENDPOINT}?select=number,input,segmented_output,created_at&order=number.desc`,
      { method: 'GET', headers: baseHeaders }
    )
    if (!res.ok) {
      console.warn('[historyApi] Fetch failed:', res.status)
      return []
    }
    return await res.json()
  } catch (err) {
    console.warn('[historyApi] Fetch error:', err.message)
    return []
  }
}
