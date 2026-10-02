-- Authentic UP: run once in Supabase (SQL Editor -> New query -> paste -> Run), after schema.sql.
-- Adds the customers list for sign-ups and lets orders placed from the bag be saved before the
-- address is known (we confirm it on WhatsApp). Safe to run more than once.

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique,                 -- Supabase Auth user, for email sign-ups
  name text,
  email text unique,
  phone text unique,                   -- 91XXXXXXXXXX, for mobile sign-ups
  role text not null default 'shopper' check (role in ('shopper', 'artisan')),
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now()
);
alter table customers enable row level security;   -- server only, nothing public

alter table orders alter column phone drop not null, alter column address drop not null, alter column pincode drop not null;
alter table orders add column if not exists items jsonb not null default '[]';  -- what was in the bag
alter table orders add column if not exists customer_id uuid references customers(id) on delete set null;
alter table orders add column if not exists notes text;
alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled'));

alter table enquiries add column if not exists notes text;
alter table enquiries drop constraint if exists enquiries_status_check;
alter table enquiries add constraint enquiries_status_check check (status in ('new', 'in_progress', 'replied', 'closed'));

alter table products add column if not exists place text;           -- e.g. Madanpura, Varanasi
alter table products add column if not exists featured boolean not null default false;


-- Visitor counter for the footer (also in visitor-counter.sql).

create table if not exists site_visits (
  day date primary key,
  visitors integer not null default 0
);
alter table site_visits enable row level security;   -- server only, nothing public

create or replace function count_visit(add_one boolean default true) returns bigint
language plpgsql security definer set search_path = public as $$
begin
  if add_one then
    insert into site_visits (day, visitors) values ((now() at time zone 'Asia/Kolkata')::date, 1)
    on conflict (day) do update set visitors = site_visits.visitors + 1;
  end if;
  return (select coalesce(sum(visitors), 0) from site_visits);
end $$;
revoke execute on function count_visit(boolean) from public, anon, authenticated;
