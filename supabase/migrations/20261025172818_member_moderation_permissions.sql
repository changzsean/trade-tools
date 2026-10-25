-- Server-maintained moderation flags and counters must not be client-editable.
-- Internal counter triggers need narrowly scoped, non-RPC privileged functions.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create function app_private.sync_vote_count()
returns trigger language plpgsql security definer set search_path = '' as $$
declare table_name text;
begin
  if TG_OP in ('DELETE','UPDATE') then
    table_name := case OLD.target_type when 'post' then 'posts' when 'question' then 'questions' when 'answer' then 'answers' when 'skill' then 'skills' when 'wish' then 'wishes' end;
    if table_name is not null then
      execute format('update public.%I set vote_count = vote_count - $1 where id = $2', table_name) using OLD.value, OLD.target_id;
    end if;
  end if;
  if TG_OP in ('INSERT','UPDATE') then
    table_name := case NEW.target_type when 'post' then 'posts' when 'question' then 'questions' when 'answer' then 'answers' when 'skill' then 'skills' when 'wish' then 'wishes' end;
    if table_name is not null then
      execute format('update public.%I set vote_count = vote_count + $1 where id = $2', table_name) using NEW.value, NEW.target_id;
    end if;
  end if;
  return null;
end $$;
revoke all on function app_private.sync_vote_count() from public, anon, authenticated;

create function app_private.update_question_answer_count()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    update public.questions set answer_count = answer_count + 1 where id = NEW.question_id;
  elsif TG_OP = 'DELETE' then
    update public.questions set answer_count = greatest(0, answer_count - 1) where id = OLD.question_id;
  end if;
  return null;
end $$;
revoke all on function app_private.update_question_answer_count() from public, anon, authenticated;

create or replace trigger sync_votes after insert or delete or update on public.votes for each row execute function app_private.sync_vote_count();
create or replace trigger sync_answer_count after insert or delete on public.answers for each row execute function app_private.update_question_answer_count();
drop function public.sync_vote_count();
drop function public.update_question_answer_count();

revoke insert, update on public.posts, public.questions, public.answers, public.skills, public.wishes from public, anon, authenticated;
grant insert(author_id,title,content,type,tags) on public.posts to authenticated;
grant update(title,content,type,tags) on public.posts to authenticated;
grant insert(author_id,title,body,tags) on public.questions to authenticated;
grant update(title,body,tags) on public.questions to authenticated;
grant insert(question_id,author_id,content) on public.answers to authenticated;
grant update(content) on public.answers to authenticated;
grant insert(author_id,name,description,category,trigger_word,file_path,file_name) on public.skills to authenticated;
grant update(name,description,category,trigger_word,file_path,file_name) on public.skills to authenticated;
grant insert(author_id,content) on public.wishes to authenticated;
