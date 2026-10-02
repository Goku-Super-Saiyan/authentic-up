-- Visitor counter for the footer. Run once in Supabase (SQL Editor -> New query -> paste -> Run).
-- Safe to run more than once. Each browser is counted at most once a day (India time).

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
