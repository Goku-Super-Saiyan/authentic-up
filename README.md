# Incredible UP — web

Marketplace front end for the crafts of Uttar Pradesh: GI-tagged icons, a shop, and all 75 One District One Product (ODOP) districts.

Stack: React 19, Vite, TypeScript, Tailwind CSS 4, Framer Motion.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
```

## Layout

- `src/components/Hero.tsx` — dusk over the Varanasi ghats, an SVG scene with parallax, diyas and boats
- `src/components/CraftJourney.tsx` — pinned horizontal scroll through six GI crafts, framed in Mughal arches
- `src/components/Bazaar.tsx`, `QuickView.tsx`, `BagDrawer.tsx` — shop grid, product story modal, bag
- `src/components/CraftMap.tsx` — the 75 ODOP districts plotted by coordinates along the rivers
- `src/components/LoomStory.tsx` — scroll story of a saree being woven over 21 days
- `src/components/Sell.tsx` — artisan onboarding
- `src/art/crafts.ts` — generative artwork per craft, standing in for product photos
- `src/data/` — sample catalog and the district list

Prices, makers and seller counts are sample data until the catalogue is loaded into Supabase. Online payment and real login come after launch.

## Product photos

Put a photo in `public/products/` and set `photo: "products/<file>.jpg"` on that product in `src/data/catalog.ts`. Cards, quick view and bag show the photo; products without one keep their drawn art.

## Logo

Current: V3, the Mor emblem at dusk on the Kashi ghats (`src/brand/emblem-v3.ts`, `public/brand/v3/`). Earlier versions are kept in `emblem-v1-1.ts`, `emblem-v1.ts` and `emblem-v0.ts`, with their SVGs in `public/brand/` and their logo sheets in `brand-sheets/`.

## Going live

1. **GitHub**: push this folder to the `incredible-up` repo. `.github/workflows/ci.yml` type-checks and builds every push.
2. **Supabase** (Mumbai region): open the SQL editor and run `supabase/schema.sql`. It creates makers, products, enquiries and orders, with row-level security so visitors can only read live listings.
3. **Vercel**: import the repo. The framework is Vite, and `vercel.json` sets the build. Add the variables from `.env.example` under Settings > Environment Variables. The `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` are server-only.
4. **Domain (GoDaddy)**: in Vercel > Domains, add the domain and `www`, then add the A and CNAME records Vercel shows in GoDaddy's DNS.
5. **Email**: in Resend, add the domain and copy its SPF and DKIM records into GoDaddy. Enquiries from `/api/enquiry` are saved to Supabase and emailed to `ENQUIRY_TO`.

Contact details (email, WhatsApp, phone, address) come from the `VITE_` variables. The WhatsApp button and the "order on WhatsApp" links only appear once `VITE_WHATSAPP` is set.
