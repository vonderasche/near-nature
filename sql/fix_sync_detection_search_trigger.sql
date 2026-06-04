-- Fix "permission denied for table species_metadata" when saving a detection.
-- Cause: harden_security_linter.sql revokes SELECT on species_metadata from authenticated,
-- but sync_detection_search_fields (BEFORE INSERT on detections) still reads that table.
-- Safe to re-run. After running: NOTIFY pgrst, 'reload schema';

alter function public.sync_detection_search_fields() security definer;
alter function public.sync_detection_search_fields() set search_path = public;

NOTIFY pgrst, 'reload schema';
