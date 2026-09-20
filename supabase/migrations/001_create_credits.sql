-- =========================================================
-- EXTENSIONS
-- =========================================================

create extension if not exists pgcrypto;


-- =========================================================
-- CREDITS TABLE
-- =========================================================

create table if not exists public.credits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  user_email text not null,
  credits_count integer not null default 10 check (credits_count >= 0),
  reset_at timestamptz,
  updated_at timestamptz not null default now()
);


-- =========================================================
-- MESSAGES TABLE
-- =========================================================

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);


-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.credits enable row level security;
alter table public.messages enable row level security;


-- =========================================================
-- CREDITS POLICIES
-- =========================================================

drop policy if exists "Users can view their own credits"
on public.credits;

create policy "Users can view their own credits"
on public.credits
for select
to authenticated
using (auth.uid() = user_id);


drop policy if exists "Users cannot delete or update credits"
on public.credits;

create policy "Users cannot delete or update credits"
on public.credits
for all
to authenticated
using (false)
with check (false);


-- =========================================================
-- MESSAGES POLICIES
-- =========================================================

drop policy if exists "Users can view their own messages"
on public.messages;

create policy "Users can view their own messages"
on public.messages
for select
to authenticated
using (auth.uid() = user_id);


drop policy if exists "Users can insert their own messages"
on public.messages;

create policy "Users can insert their own messages"
on public.messages
for insert
to authenticated
with check (auth.uid() = user_id);


drop policy if exists "Users cannot delete or update messages"
on public.messages;

create policy "Users cannot delete or update messages"
on public.messages
for all
to authenticated
using (false)
with check (false);


-- =========================================================
-- CREATE CREDITS FOR NEW USERS
-- =========================================================

create or replace function public.handle_new_user_credits()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

  insert into public.credits (
    user_id,
    user_email,
    credits_count,
    reset_at
  )
  values (
    new.id,
    new.email,
    10,
    null
  )
  on conflict (user_id) do nothing;

  return new;

end;
$$;


-- =========================================================
-- NEW USER TRIGGER
-- =========================================================

drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user_credits();


-- =========================================================
-- GET CREDITS
-- =========================================================

create or replace function public.get_credits(
  p_user_id uuid
)
returns table (
  credits_count integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin

  -- Reset credits if the reset time has passed
  if exists (
    select 1
    from public.credits as cr
    where cr.user_id = p_user_id
      and cr.reset_at is not null
      and cr.reset_at <= now()
  ) then

    update public.credits as cr
    set
      credits_count = 20,
      reset_at = null,
      updated_at = now()
    where cr.user_id = p_user_id
      and cr.reset_at is not null
      and cr.reset_at <= now();

  end if;


  -- Return the user's current credits
  return query
  select
    cr.credits_count,
    cr.reset_at
  from public.credits as cr
  where cr.user_id = p_user_id;

end;
$$;


-- =========================================================
-- DEDUCT ONE CREDIT
-- =========================================================

create or replace function public.deduct_credit(
  p_user_id uuid
)
returns table (
  success boolean,
  credits_left integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_credits integer;
  v_current_reset_at timestamptz;
begin

  -- -------------------------------------------------------
  -- Check whether the user's credits need to be reset
  -- -------------------------------------------------------

  if exists (
    select 1
    from public.credits as cr
    where cr.user_id = p_user_id
      and cr.reset_at is not null
      and cr.reset_at <= now()
  ) then

    update public.credits as cr
    set
      credits_count = 10,
      reset_at = null,
      updated_at = now()
    where cr.user_id = p_user_id
      and cr.reset_at is not null
      and cr.reset_at <= now();

  end if;


  -- -------------------------------------------------------
  -- Lock the user's credit row and get current values
  -- -------------------------------------------------------

  select
    cr.credits_count,
    cr.reset_at
  into
    v_current_credits,
    v_current_reset_at
  from public.credits as cr
  where cr.user_id = p_user_id
  for update;


  -- -------------------------------------------------------
  -- User does not have a credits record
  -- -------------------------------------------------------

  if v_current_credits is null then

    return query
    select false, 0;

    return;

  end if;


  -- -------------------------------------------------------
  -- User has no credits left
  -- -------------------------------------------------------

  if v_current_credits <= 0 then

    return query
    select false, v_current_credits;

    return;

  end if;


  -- -------------------------------------------------------
  -- User is spending the final credit
  -- Start 1-hour reset timer
  -- -------------------------------------------------------

  if v_current_credits = 1 then

    update public.credits as cr
    set
      credits_count = 0,
      reset_at = now() + interval '1 hour',
      updated_at = now()
    where cr.user_id = p_user_id;

    return query
    select true, 0;

    return;

  end if;


  -- -------------------------------------------------------
  -- Normal credit deduction
  -- -------------------------------------------------------

  update public.credits as cr
  set
    credits_count = cr.credits_count - 1,
    updated_at = now()
  where cr.user_id = p_user_id;


  -- -------------------------------------------------------
  -- Return result
  -- -------------------------------------------------------

  return query
  select
    true,
    v_current_credits - 1;

end;
$$;