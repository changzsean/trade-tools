-- Run against a disposable Supabase test database with psql -v ON_ERROR_STOP=1.
-- Test accounts and writes are always rolled back; this does not send email.
begin;
do $$
declare a uuid := gen_random_uuid(); b uuid := gen_random_uuid();
begin
  perform set_config('audit.user_a', a::text, true);
  perform set_config('audit.user_b', b::text, true);
  insert into auth.users (id, email, raw_user_meta_data) values
    (a, 'audit-' || a || '@example.invalid', jsonb_build_object('username', 'a_' || left(replace(a::text,'-',''),24), 'display_name','Rollback audit A', 'policy_accepted', true, 'terms_version','2026-10-26','privacy_version','2026-10-26')),
    (b, 'audit-' || b || '@example.invalid', jsonb_build_object('username', 'b_' || left(replace(b::text,'-',''),24), 'display_name','Rollback audit B', 'policy_accepted', true, 'terms_version','2026-10-26','privacy_version','2026-10-26'));
  if (select count(*) from app_private.member_policy_acceptances where user_id in(a,b)) <> 2 then raise exception 'Consent receipt missing'; end if;
  begin
    insert into auth.users(id,email,raw_user_meta_data) values(gen_random_uuid(),'no-consent@example.invalid','{"username":"no_consent","display_name":"No consent"}');
    raise exception 'Missing consent accepted';
  exception when check_violation then null; end;
  if (select count(*) from public.profiles where id in(a,b)) <> 2 then raise exception 'Signup profile trigger failed'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub',current_setting('audit.user_a'),true);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('audit.user_a'),'role','authenticated')::text,true);
do $$
begin
  update public.profiles set bio='Rollback profile edit' where id=auth.uid();
  if not found then raise exception 'Own profile edit failed'; end if;
  update public.profiles set bio='Forbidden other user edit' where id=current_setting('audit.user_b')::uuid;
  if found then raise exception 'Cross-user profile edit allowed'; end if;
  begin
    update public.profiles set role='admin' where id=auth.uid();
    raise exception 'Role escalation allowed';
  exception when insufficient_privilege then null; end;
  if has_table_privilege(current_user,'public.profiles','TRUNCATE') then raise exception 'TRUNCATE allowed'; end if;
  if has_function_privilege(current_user,'public.handle_new_user()','EXECUTE') then raise exception 'Public trigger execution allowed'; end if;
  insert into public.posts(author_id,title,content) values(auth.uid(),'Rollback permission audit','Only for transaction verification');
  insert into public.questions(author_id,title,body) values(auth.uid(),'Rollback permission audit','Only for transaction verification');
  if (select count(*) from public.posts_with_author where title='Rollback permission audit')<>1 then raise exception 'Authenticated post view failed'; end if;
  if (select count(*) from public.questions_with_author where title='Rollback permission audit')<>1 then raise exception 'Authenticated question view failed'; end if;
  insert into public.bookmarks(user_id,target_type,target_id) values(auth.uid(),'post',(select id from public.posts where title='Rollback permission audit'));
end $$;
select set_config('request.jwt.claim.sub',current_setting('audit.user_b'),true);
select set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('audit.user_b'),'role','authenticated')::text,true);
do $$
begin
  begin
    insert into public.skills(author_id,name,description,category,is_approved) values(auth.uid(),'Rollback audit','Cannot self approve','other',true);
    raise exception 'Self approval allowed';
  exception when insufficient_privilege then null; end;
  insert into public.votes(user_id,target_type,target_id,value) values(auth.uid(),'post',(select id from public.posts where title='Rollback permission audit'),1);
  if (select vote_count from public.posts where title='Rollback permission audit')<>1 then raise exception 'Cross-author vote count failed'; end if;
  update public.votes set value=-1 where user_id=auth.uid();
  if (select vote_count from public.posts where title='Rollback permission audit')<>-1 then raise exception 'Vote update count failed'; end if;
  delete from public.votes where user_id=auth.uid();
  if (select vote_count from public.posts where title='Rollback permission audit')<>0 then raise exception 'Vote delete count failed'; end if;
  insert into public.answers(author_id,question_id,content) values(auth.uid(),(select id from public.questions where title='Rollback permission audit'),'Rollback answer');
  if (select answer_count from public.questions where title='Rollback permission audit')<>1 then raise exception 'Answer count failed'; end if;
  delete from public.answers where author_id=auth.uid();
  if (select answer_count from public.questions where title='Rollback permission audit')<>0 then raise exception 'Answer delete count failed'; end if;
  if exists(select 1 from public.bookmarks where user_id=current_setting('audit.user_a')::uuid) then raise exception 'Cross-user bookmark leak'; end if;
  update public.posts set title='Forbidden other edit' where title='Rollback permission audit';
  if found then raise exception 'Cross-user post edit allowed'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$
begin
  if exists(select 1 from public.posts_with_author where title='Rollback permission audit') then raise exception 'Anonymous post view bypasses RLS'; end if;
  if exists(select 1 from public.questions_with_author where title='Rollback permission audit') then raise exception 'Anonymous question view bypasses RLS'; end if;
  if exists(select 1 from public.bookmarks) then raise exception 'Anonymous bookmarks leak'; end if;
end $$;
rollback;
