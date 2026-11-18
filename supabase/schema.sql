-- =====================================================================
-- Azan Lace — database schema, Row Level Security and order function
-- Run this whole file in the Supabase SQL editor, then run seed.sql.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Profiles (extends auth.users) and role-based access
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Measurement units (admin can add more later: Dozen, Meter, Roll ...)
-- ---------------------------------------------------------------------
create table if not exists public.units (
  code text primary key,
  label text not null,
  label_plural text not null,
  allow_decimal boolean not null default false,
  default_step numeric(8,3) not null default 1 check (default_step > 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Categories and subcategories
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Products. unit_code is the product's selling unit.
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  sale_price numeric(12,2) check (sale_price is null or sale_price >= 0),
  unit_code text not null references public.units(code) on update cascade,
  step numeric(8,3) not null default 1 check (step > 0),      -- quantity increment (0.5, 1 ...)
  min_qty numeric(8,3) not null default 1 check (min_qty > 0),
  stock numeric(12,3) not null default 0 check (stock >= 0),
  low_stock_threshold numeric(12,3) not null default 10,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  colour text,
  material text,
  specs jsonb not null default '[]'::jsonb,                   -- [{"label":"Width","value":"2 inch"}]
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new boolean not null default false,
  is_active boolean not null default true,
  sales_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_subcategory_idx on public.products(subcategory_id);
create index if not exists products_created_idx on public.products(created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- ---------------------------------------------------------------------
-- Customer data
-- ---------------------------------------------------------------------
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- Coupons, banners, store settings
-- ---------------------------------------------------------------------
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order numeric(12,2) not null default 0,
  usage_limit int,
  used_count int not null default 0,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  subtitle text,
  image_url text not null,
  cta_label text,
  cta_href text,
  cta2_label text,
  cta2_href text,
  sort_order int not null default 0,
  is_active boolean not null default true
);

-- key/value settings: announcements, contact, whatsapp, shipping, payments
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Orders. Order items SNAPSHOT the unit so history never changes
-- even if the admin later edits the product's unit.
-- ---------------------------------------------------------------------
create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','processing','shipped','delivered','cancelled')),
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  notes text,
  payment_method text not null check (payment_method in ('cod','bank_transfer')),
  subtotal numeric(12,2) not null,
  discount numeric(12,2) not null default 0,
  shipping numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  sku text not null,
  image_url text,
  unit_code text not null,
  unit_label text not null,
  unit_label_plural text not null,
  quantity numeric(12,3) not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- profiles: users read/update themselves (but can never change their own role); admins manage all
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));
create policy "profiles admin update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- public catalogue: anyone can read, only admins can write
create policy "units read" on public.units for select using (true);
create policy "units admin" on public.units for all using (public.is_admin()) with check (public.is_admin());

create policy "categories read" on public.categories for select using (true);
create policy "categories admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "subcategories read" on public.subcategories for select using (true);
create policy "subcategories admin" on public.subcategories for all using (public.is_admin()) with check (public.is_admin());

create policy "products read" on public.products for select using (is_active or public.is_admin());
create policy "products admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "product_images read" on public.product_images for select using (true);
create policy "product_images admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "banners read" on public.banners for select using (is_active or public.is_admin());
create policy "banners admin" on public.banners for all using (public.is_admin()) with check (public.is_admin());

create policy "settings read" on public.store_settings for select using (true);
create policy "settings admin" on public.store_settings for all using (public.is_admin()) with check (public.is_admin());

-- coupons: never readable by the public (validated server-side only)
create policy "coupons admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- customer-owned data
create policy "addresses own" on public.addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "wishlists own" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- orders: customers see their own; admins see and update all. Inserts happen ONLY via place_order().
create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders admin update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "order_items own read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

-- ---------------------------------------------------------------------
-- Secure order placement.
-- Called ONLY from the server with the service-role key. Prices, units,
-- steps and stock are read from the database; the browser's numbers are ignored.
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_items jsonb,            -- [{"product_id": "...", "quantity": 5}]
  p_customer jsonb,         -- name, phone, email, address, city, province, postal_code, notes
  p_payment text,
  p_coupon text,
  p_user uuid
)
returns table (order_id uuid, order_number text, total numeric)
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  prod public.products%rowtype;
  u public.units%rowtype;
  qty numeric;
  price numeric;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric;
  v_order_id uuid;
  v_number text;
  v_coupon public.coupons%rowtype;
  v_ship jsonb;
  v_img text;
  v_ratio numeric;
begin
  if p_payment not in ('cod','bank_transfer') then
    raise exception 'Invalid payment method';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  v_number := 'AZ-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-' || nextval('public.order_number_seq');

  insert into public.orders (
    order_number, user_id, customer_name, phone, email, address, city, province,
    postal_code, notes, payment_method, subtotal, discount, shipping, total
  ) values (
    v_number, p_user,
    p_customer->>'name', p_customer->>'phone', p_customer->>'email',
    p_customer->>'address', p_customer->>'city', p_customer->>'province',
    nullif(p_customer->>'postal_code', ''), nullif(p_customer->>'notes', ''),
    p_payment, 0, 0, 0, 0
  ) returning id into v_order_id;

  for item in select * from jsonb_array_elements(p_items) loop
    select * into prod from public.products
      where id = (item->>'product_id')::uuid and is_active
      for update;
    if not found then
      raise exception 'A product in your cart is no longer available';
    end if;
    select * into u from public.units where code = prod.unit_code;

    qty := (item->>'quantity')::numeric;
    if qty is null or qty < prod.min_qty then
      raise exception '% requires a minimum of % %', prod.name, trim_scale(prod.min_qty), u.label_plural;
    end if;
    if not u.allow_decimal and qty <> trunc(qty) then
      raise exception '% must be ordered in whole %', prod.name, lower(u.label_plural);
    end if;
    -- must be a multiple of the product step (tolerance for numeric representation)
    v_ratio := qty / prod.step;
    if abs(v_ratio - round(v_ratio)) > 0.0001 then
      raise exception '% must be ordered in steps of % %', prod.name, trim_scale(prod.step), u.label_plural;
    end if;
    if qty > prod.stock then
      raise exception 'Only % % of % in stock', trim_scale(prod.stock), u.label_plural, prod.name;
    end if;

    price := case when prod.sale_price is not null and prod.sale_price < prod.price
                  then prod.sale_price else prod.price end;

    select url into v_img from public.product_images
      where product_id = prod.id order by sort_order limit 1;

    insert into public.order_items (
      order_id, product_id, product_name, sku, image_url,
      unit_code, unit_label, unit_label_plural, quantity, unit_price, line_total
    ) values (
      v_order_id, prod.id, prod.name, prod.sku, v_img,
      u.code, u.label, u.label_plural, qty, price, round(price * qty, 2)
    );

    v_subtotal := v_subtotal + round(price * qty, 2);

    update public.products
      set stock = stock - qty, sales_count = sales_count + 1, updated_at = now()
      where id = prod.id;
  end loop;

  -- coupon
  if p_coupon is not null and length(trim(p_coupon)) > 0 then
    select * into v_coupon from public.coupons
      where upper(code) = upper(trim(p_coupon)) and is_active
      for update;
    if not found
       or (v_coupon.expires_at is not null and v_coupon.expires_at < now())
       or (v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit)
       or v_subtotal < v_coupon.min_order then
      raise exception 'Coupon is invalid or not applicable to this order';
    end if;
    if v_coupon.discount_type = 'percent' then
      v_discount := round(v_subtotal * least(v_coupon.discount_value, 100) / 100, 2);
    else
      v_discount := least(v_coupon.discount_value, v_subtotal);
    end if;
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  -- shipping
  select value into v_ship from public.store_settings where key = 'shipping';
  v_shipping := coalesce((v_ship->>'flat_rate')::numeric, 0);
  if (v_ship->>'free_over') is not null and (v_subtotal - v_discount) >= (v_ship->>'free_over')::numeric then
    v_shipping := 0;
  end if;

  v_total := v_subtotal - v_discount + v_shipping;

  update public.orders
    set subtotal = v_subtotal, discount = v_discount, shipping = v_shipping, total = v_total,
        coupon_code = case when v_discount > 0 then upper(trim(p_coupon)) else null end
    where id = v_order_id;

  return query select v_order_id, v_number, v_total;
end;
$$;

revoke all on function public.place_order(jsonb, jsonb, text, text, uuid) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, text, text, uuid) to service_role;

-- Restock when an order is cancelled
create or replace function public.restock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.products p
      set stock = p.stock + oi.quantity
      from public.order_items oi
      where oi.order_id = new.id and oi.product_id = p.id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists orders_restock on public.orders;
create trigger orders_restock before update on public.orders
  for each row execute function public.restock_on_cancel();

-- ---------------------------------------------------------------------
-- Storage: public bucket for product / banner images, admin-only writes
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product images public read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product images admin insert" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- To make yourself the admin, after registering on the site run:
--   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR-EMAIL');

-- ---------------------------------------------------------------------
-- Contact form messages (public insert via server action, admin read)
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "contact admin" on public.contact_messages for all using (public.is_admin()) with check (public.is_admin());
