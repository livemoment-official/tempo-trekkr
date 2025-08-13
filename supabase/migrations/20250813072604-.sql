-- Ensure view runs with invoker rights to satisfy linter
ALTER VIEW public.available_now SET (security_invoker = on);