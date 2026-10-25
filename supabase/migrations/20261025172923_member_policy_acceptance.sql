-- Record explicit consent for new email registrations. Existing users are not backfilled.
create table app_private.member_policy_acceptances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now()
);
alter table app_private.member_policy_acceptances enable row level security;
revoke all on table app_private.member_policy_acceptances from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  member_username text := new.raw_user_meta_data->>'username';
  member_name text := btrim(new.raw_user_meta_data->>'display_name');
begin
  if new.raw_user_meta_data->'policy_accepted' is distinct from 'true'::jsonb
     or new.raw_user_meta_data->>'terms_version' is distinct from '2026-10-26'
     or new.raw_user_meta_data->>'privacy_version' is distinct from '2026-10-26' then
    raise check_violation using message = 'Explicit agreement to the current membership terms and privacy notice is required';
  end if;
  if member_username is null or member_username !~ '^[a-z0-9_]{3,32}$'
     or member_name is null or length(member_name) not between 1 and 80 then
    raise check_violation using message = 'A valid username and display name are required';
  end if;
  insert into public.profiles(id,username,display_name) values(new.id,member_username,member_name);
  insert into app_private.member_policy_acceptances(user_id,terms_version,privacy_version)
    values(new.id,'2026-10-26','2026-10-26');
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
