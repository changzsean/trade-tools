-- Preserve existing rows and community visibility while enforcing the caller's RLS.
alter view public.posts_with_author set (security_invoker = true);
alter view public.questions_with_author set (security_invoker = true);

-- Membership roles and counters are assigned by trusted database/server code.
-- An owner may edit their public profile, but may not promote their account.
revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to anon, authenticated;
grant update (username, display_name, bio, avatar_url) on public.profiles to authenticated;

-- Client roles never need DDL-like privileges; RLS does not constrain TRUNCATE.
revoke truncate, references, trigger on all tables in schema public from public, anon, authenticated;

-- These functions are invoked only by their existing triggers, never as public RPCs.
alter function public.handle_new_user() set search_path = '';
alter function public.sync_vote_count() set search_path = '';
alter function public.update_question_answer_count() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_vote_count() from public, anon, authenticated;
revoke execute on function public.update_question_answer_count() from public, anon, authenticated;
