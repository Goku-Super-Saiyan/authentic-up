-- Incredible UP database (Supabase / Postgres).
-- Run once in the Supabase SQL editor. Public visitors can read live listings only;
-- enquiries and orders are written by the server functions with the service-role key.

create extension if not exists "pgcrypto";

create table if not exists makers (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- e.g. Madanpura Weavers Collective
  district text not null,             -- one of the 75 UP districts
  craft text not null,
  phone text,
  email text,
  gi_tag boolean not null default false,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  maker_id uuid references makers(id) on delete set null,
  district text not null,
  category text not null,             -- Silk & sarees, Carpets & dari, Embroidery, ...
  price_inr integer not null check (price_inr > 0),
  stock integer not null default 1 check (stock >= 0),
  spec text,
  story text,
  details text[] not null default '{}',
  tags text[] not null default '{}',  -- GI tag, ODOP, Artisan-direct
  photos text[] not null default '{}',-- paths in the "products" storage bucket
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on products (category) where active;
create index if not exists products_district_idx on products (district) where active;

create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,     -- IUP-123456, shown to the buyer
  kind text not null,                 -- Bulk or wholesale, Export, Custom design, ...
  name text not null,
  email text not null,
  phone text,
  craft text,
  district text,
  quantity text,
  budget text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  name text not null,
  phone text not null,
  email text,
  address text not null,
  pincode text not null,
  total_inr integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment_ref text,                   -- Razorpay payment id once payments are live
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  qty integer not null check (qty > 0),
  price_inr integer not null,
  primary key (order_id, product_id)
);

-- Row level security: anyone may read active products and makers; nothing else is public.
alter table makers enable row level security;
alter table products enable row level security;
alter table enquiries enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

drop policy if exists "public reads makers" on makers;
create policy "public reads makers" on makers for select using (true);
drop policy if exists "public reads live products" on products;
create policy "public reads live products" on products for select using (active);

-- Product photos: a public bucket for images, uploads by admins only.
insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;
