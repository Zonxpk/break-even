-- Supabase default privileges leave TRUNCATE/REFERENCES/TRIGGER on client
-- roles even with auto_expose_new_tables = false. TRUNCATE is not subject to
-- RLS and not reachable via PostgREST, but there is no reason to keep it.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
