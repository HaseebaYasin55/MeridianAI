-- =========================================================
-- MESSAGES TABLE ACCESS
-- =========================================================
-- The messages table is created by 001_create_credits.sql, but that
-- migration never granted table privileges to the authenticated role.
-- As a result the chat flow fails with SQLSTATE 42501:
--   "permission denied for table messages"
--
-- Grant only what the application and RLS policies require:
--   SELECT  - history load in /api/chat (loadRecentHistory) plus the
--             dashboard and workspace pages reading recent messages
--   INSERT  - persisting the user and assistant messages in /api/chat
--
-- UPDATE and DELETE are intentionally NOT granted. The application
-- never updates or deletes messages, and RLS forbids those operations
-- with `for all ... using (false) with check (false)` policies.
-- the anon role is also intentionally NOT granted; it must never read
-- or write user conversations.

GRANT SELECT, INSERT ON public.messages TO authenticated;