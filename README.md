# Azan Lace — Online Lace & Tailoring Supplies Store

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage)

## 1. Set up Supabase (about 10 minutes)

1. Create a project at https://supabase.com.
2. Open **SQL Editor** and run, in this order:
   1. `supabase/schema.sql` (tables, security rules, order function, image storage)
   2. `supabase/seed.sql` (categories, units, 23 sample products, banners, settings, coupon `WELCOME10`)
3. **Project Settings → API**: copy the Project URL, `anon` key and `service_role` key.
4. **Authentication → URL Configuration**: set Site URL to your site address and add `https://YOUR-SITE/auth/callback` to Redirect URLs (needed for email confirmation and password reset). For quick local testing you can turn off "Confirm email" under Authentication → Providers → Email.

## 2. Run locally

```bash
cp .env.example .env.local     # then paste your three Supabase values
npm install
npm run dev                    # http://localhost:3000
```

## 3. Make yourself the admin

Register on the site (`/register`), then run this once in the Supabase SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR-EMAIL');
```

Sign in again and open `/admin` (also linked from My Account).

## 4. Replace the placeholder content

Everything below is editable from `/admin`, no code needed:

| What | Where |
|---|---|
| Products, prices, **selling unit**, step, stock, images, specifications | Products |
| Announcement bar, WhatsApp number, phone, email, address, hours, map, social links | Settings |
| Shipping charge and free-delivery threshold, COD / bank transfer and bank details | Settings |
| Add new units (Dozen, Meter, Roll…) | Settings → Measurement units |
| Homepage hero slides | Banners |
| Categories and subcategories | Categories |
| Coupons | Coupons |
| Order status, cancellations | Orders |
| Customer accounts and admin access | Customers |
| Contact form messages | Messages |

**Product photos:** the sample products use generated illustrations (`public/products/*.svg`) so the store works out of the box. Upload real photos per product in Admin → Products. The hero slides are in `public/banners` and can be replaced in Admin → Banners.

**Policies** (`/policies/*`) are template text in `src/app/policies/[slug]/page.tsx`. Review them against your real practices.

## 5. How units work

- Every product stores a `unit_code` (yard, piece, bottle, needle, or any unit you add) plus a quantity `step` (e.g. 0.5 yard) and `min_qty`.
- Prices display as `Rs. 150 / Yard`, quantity selectors show the unit, and line totals are `price × quantity`.
- Each order item **copies** the unit name, price and quantity at purchase time, so changing a product later never alters past orders.
- The server re-checks unit rules (whole numbers, step, minimum, stock) and **re-reads prices from the database** when an order is placed; prices sent from the browser are ignored.

## 6. Security notes

- Row Level Security is enabled on every table. Customers see only their own orders, addresses and wishlist; only admins can write catalogue data, coupons, banners and settings.
- Orders can only be created through the `place_order` database function, which only the server-side service-role key can run.
- `SUPABASE_SERVICE_ROLE_KEY` is used only in server code (`src/lib/supabase/admin.ts`, marked `server-only`). Never prefix it with `NEXT_PUBLIC_`.
- Every admin page and every admin server action checks the admin role.

## 7. Deploy

Push to GitHub and import into Vercel. Add the four variables from `.env.example` (set `NEXT_PUBLIC_SITE_URL` to your live address).

## Project structure

```
src/app/            pages and server actions (storefront, account, admin)
src/components/     UI components (admin/ holds dashboard components)
src/lib/            units & pricing, data queries, cart store, Supabase clients
supabase/           schema.sql and seed.sql
public/             logo, placeholder product and banner images
```

## 8. Smoke test against your own Supabase project

The app was browser-tested (Playwright, ~240 checks) against a real PostgreSQL database running this repo's
`schema.sql` + `seed.sql` behind a Supabase-compatible API, not against a hosted Supabase project. Run this
checklist once on yours (15 minutes):

1. **Auth > URL Configuration**: set *Site URL* to your domain and add `https://YOUR-DOMAIN/auth/callback` (and
   `http://localhost:3000/auth/callback` for local use) to *Redirect URLs*. Password-reset and confirmation links fail without it.
2. **Auth > Providers > Email**: decide whether "Confirm email" is on. If on, a new customer sees "check your email"; if off, they are signed in at once.
3. Run `schema.sql`, then `seed.sql`. Confirm the `product-images` bucket exists and is public.
4. Register an account, then promote it (section 3). Open `/admin`.
5. Admin: create a product (Yard, step 0.5) with an image upload; open it on the storefront ("Rs. X / Yard").
6. Place a guest COD order with a yard, a piece and a bottle item. Check it in `/admin/orders`, mark it shipped, then cancel it and confirm stock returns.
7. Request a password reset and complete it from the email.
8. Check `/admin` as a signed-out user and as a normal customer: both must be redirected away.
9. In Project Settings > API copy the `service_role` key into **server-only** env vars (never `NEXT_PUBLIC_`).

