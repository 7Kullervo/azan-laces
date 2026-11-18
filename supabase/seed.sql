-- =====================================================================
-- Azan Lace — sample data. Run AFTER schema.sql.
-- Everything here is placeholder and can be replaced from the admin dashboard.
-- =====================================================================

-- Units ---------------------------------------------------------------
insert into public.units (code, label, label_plural, allow_decimal, default_step) values
  ('yard',   'Yard',   'Yards',   true,  0.5),
  ('piece',  'Piece',  'Pieces',  false, 1),
  ('bottle', 'Bottle', 'Bottles', false, 1),
  ('needle', 'Needle', 'Needles', false, 1)
on conflict (code) do nothing;

-- Categories ----------------------------------------------------------
insert into public.categories (slug, name, sort_order, image_url) values
  ('laces',                'Laces',                1, '/products/l001-floral-designer-lace.svg'),
  ('patches',              'Patches',              2, '/products/p001-zari-neckline-patch.svg'),
  ('piping',               'Piping',               3, '/products/pi002-gold-designer-piping.svg'),
  ('organza',              'Organza',              4, '/products/or001-organza-border.svg'),
  ('buttons',              'Buttons',              5, '/products/b001-designer-button.svg'),
  ('buckrams',             'Buckrams',             6, '/products/bk001-tailoring-buckram.svg'),
  ('sewing-supplies',      'Sewing Supplies',      7, '/products/o001-sewing-machine-oil.svg'),
  ('tailoring-accessories','Tailoring Accessories',8, '/products/r001-measuring-ruler.svg')
on conflict (slug) do nothing;

-- Subcategories -------------------------------------------------------
insert into public.subcategories (category_id, slug, name, sort_order)
select c.id, v.slug, v.name, v.ord
from (values
  ('laces','designer-laces','Designer Laces',1),
  ('laces','border-laces','Border Laces',2),
  ('laces','fancy-laces','Fancy Laces',3),
  ('laces','milky-laces','Milky Laces',4),
  ('laces','3d-laces','3D Laces',5),
  ('laces','net-laces','Net Laces',6),
  ('laces','dupatta-laces','Dupatta Laces',7),
  ('laces','kanni-patti','Kanni Patti',8),
  ('laces','lace-motifs','Lace Motifs',9),
  ('laces','other-laces','Other Laces',10),
  ('patches','neckline-patches','Neckline Patches',1),
  ('patches','daman-patches','Daman Patches',2),
  ('patches','dupatta-corner-patches','Dupatta Corner Patches',3),
  ('patches','designer-patches','Designer Patches',4),
  ('patches','3d-motifs','3D Motifs',5),
  ('piping','decorative-piping','Decorative Piping',1),
  ('piping','fabric-piping','Fabric Piping',2),
  ('piping','designer-piping','Designer Piping',3),
  ('piping','other-piping','Other Piping',4),
  ('organza','organza-borders','Organza Borders',1),
  ('organza','organza-laces','Organza Laces',2),
  ('organza','decorative-organza-trims','Decorative Organza Trims',3),
  ('buttons','designer-buttons','Designer Buttons',1),
  ('buttons','fancy-buttons','Fancy Buttons',2),
  ('buttons','shirt-buttons','Shirt Buttons',3),
  ('buttons','decorative-buttons','Decorative Buttons',4),
  ('buttons','other-buttons','Other Buttons',5),
  ('buckrams','different-buckram-types','Different Buckram Types',1),
  ('buckrams','tailoring-buckrams','Tailoring Buckrams',2),
  ('sewing-supplies','sewing-machine-oil','Sewing Machine Oil',1),
  ('sewing-supplies','sewing-needles','Sewing Needles',2),
  ('sewing-supplies','sewing-accessories','Sewing Accessories',3),
  ('sewing-supplies','other-sewing-essentials','Other Sewing Essentials',4),
  ('tailoring-accessories','measuring-rulers','Measuring Rulers',1),
  ('tailoring-accessories','tailoring-measuring-tools','Tailoring Measuring Tools',2),
  ('tailoring-accessories','other-tailoring-tools','Other Tailoring Tools',3)
) as v(cat, slug, name, ord)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Products ------------------------------------------------------------
insert into public.products
  (slug, sku, name, description, price, sale_price, unit_code, step, min_qty, stock,
   category_id, subcategory_id, colour, material, specs, is_featured, is_best_seller, is_new)
select
  v.slug, v.sku, v.name, v.descr, v.price::numeric, v.sale::numeric, v.unit, v.step::numeric, v.minq::numeric, v.stock::numeric,
  c.id, s.id, v.colour, v.material, v.specs::jsonb, v.feat, v.best, v.isnew
from (values
  -- LACES (yard)
  ('l001-floral-designer-lace','L001','Floral Designer Lace',
   'A delicate floral lace with raised thread detailing, ideal for necklines, sleeves and hemlines on formal and festive wear.',
   150, null, 'yard', 1, 1, 400, 'laces','designer-laces','Ivory','Cotton blend',
   '[{"label":"Lace width","value":"2.5 inch"},{"label":"Lace length","value":"Sold by the yard"},{"label":"Design","value":"Floral"},{"label":"Pattern","value":"Scalloped edge"}]',
   true,true,false),
  ('l002-gold-border-lace','L002','Gold Zari Border Lace',
   'A rich gold zari border with a scalloped edge. Gives dupattas and kameez a premium finish.',
   120, 99, 'yard', 0.5, 1, 650, 'laces','border-laces','Gold','Polyester zari',
   '[{"label":"Lace width","value":"1.5 inch"},{"label":"Design","value":"Zari border"},{"label":"Pattern","value":"Scalloped"}]',
   true,true,false),
  ('l003-pearl-fancy-lace','L003','Pearl Beaded Fancy Lace',
   'Fancy lace with hand-set pearl beading for bridal and party wear.',
   220, null, 'yard', 1, 1, 180, 'laces','fancy-laces','White','Polyester with pearls',
   '[{"label":"Lace width","value":"3 inch"},{"label":"Design","value":"Pearl beaded"},{"label":"Pattern","value":"Vine"}]',
   true,false,true),
  ('l004-milky-cotton-lace','L004','Milky Cotton Lace',
   'Soft milky-white cotton lace, light and easy to stitch. A tailor favourite for everyday suits.',
   90, null, 'yard', 1, 1, 900, 'laces','milky-laces','Milky white','Cotton',
   '[{"label":"Lace width","value":"1 inch"},{"label":"Design","value":"Geometric"},{"label":"Pattern","value":"Straight edge"}]',
   false,true,false),
  ('l005-3d-floral-lace','L005','3D Floral Lace',
   'Sculpted three-dimensional flowers on a fine net base. A statement trim for formal wear.',
   340, 299, 'yard', 0.5, 1, 120, 'laces','3d-laces','Blush pink','Net with fabric flowers',
   '[{"label":"Lace width","value":"4 inch"},{"label":"Design","value":"3D flowers"},{"label":"Pattern","value":"Floral"}]',
   true,false,true),
  ('l006-bridal-net-lace','L006','Bridal Net Lace',
   'Fine embroidered net lace with a sheer, airy drape for bridal dupattas and overlays.',
   180, null, 'yard', 1, 1, 300, 'laces','net-laces','Champagne','Nylon net',
   '[{"label":"Lace width","value":"6 inch"},{"label":"Design","value":"Embroidered net"},{"label":"Pattern","value":"Floral vine"}]',
   false,false,true),
  ('l007-dupatta-edge-lace','L007','Dupatta Edge Lace',
   'Lightweight edging lace made to finish dupatta borders cleanly.',
   130, null, 'yard', 1, 1, 520, 'laces','dupatta-laces','Black','Polyester',
   '[{"label":"Lace width","value":"2 inch"},{"label":"Design","value":"Edging"},{"label":"Pattern","value":"Wave"}]',
   false,false,false),
  ('l008-gota-kanni-patti','L008','Gota Kanni Patti',
   'Traditional gota kanni patti in bright metallic gold for sleeves, daman and borders.',
   110, null, 'yard', 1, 1, 700, 'laces','kanni-patti','Gold','Metallic gota',
   '[{"label":"Lace width","value":"1 inch"},{"label":"Design","value":"Gota"},{"label":"Pattern","value":"Diamond"}]',
   false,true,false),
  -- PATCHES (piece)
  ('p001-zari-neckline-patch','P001','Zari Neckline Patch',
   'Embroidered zari neckline patch, ready to stitch onto kameez and kurtis.',
   350, null, 'piece', 1, 1, 90, 'patches','neckline-patches','Gold','Zari on net',
   '[{"label":"Size","value":"9 x 6 inch"},{"label":"Design","value":"Floral zari"}]',
   true,false,true),
  ('p002-daman-patch-set','P002','Embroidered Daman Patch',
   'Daman patch with matching motif spacing for a balanced hemline.',
   480, 420, 'piece', 1, 1, 60, 'patches','daman-patches','Ivory','Thread embroidery',
   '[{"label":"Size","value":"36 x 4 inch"},{"label":"Design","value":"Border motif"}]',
   false,false,false),
  ('p003-dupatta-corner-patch','P003','Dupatta Corner Patch',
   'Corner patch to finish dupatta corners with an elegant motif.',
   260, null, 'piece', 1, 1, 110, 'patches','dupatta-corner-patches','Champagne','Thread on net',
   '[{"label":"Size","value":"6 x 6 inch"},{"label":"Design","value":"Paisley"}]',
   false,false,true),
  -- PIPING (yard)
  ('pi001-decorative-piping','PI001','Decorative Piping',
   'Soft decorative piping in a tonal finish for seams, collars and cuffs.',
   45, null, 'yard', 1, 1, 1200, 'piping','decorative-piping','Assorted','Cotton cord',
   '[{"label":"Thickness","value":"3 mm"}]',
   false,false,false),
  ('pi002-gold-designer-piping','PI002','Gold Designer Piping',
   'Metallic gold designer piping that adds crisp definition to necklines and borders.',
   70, null, 'yard', 1, 1, 800, 'piping','designer-piping','Gold','Metallic',
   '[{"label":"Thickness","value":"4 mm"},{"label":"Design","value":"Twisted"}]',
   true,false,false),
  -- ORGANZA (yard)
  ('or001-organza-border','OR001','Organza Border',
   'Crisp organza border with a soft sheen for sleeves, hems and dupatta edges.',
   85, 70, 'yard', 1, 1, 500, 'organza','organza-borders','Ivory','Organza',
   '[{"label":"Width","value":"2 inch"}]',
   false,true,false),
  ('or002-organza-lace-trim','OR002','Organza Lace Trim',
   'Embroidered organza lace trim with a light, floating look.',
   140, null, 'yard', 1, 1, 260, 'organza','organza-laces','Peach','Organza',
   '[{"label":"Width","value":"3 inch"},{"label":"Design","value":"Embroidered"}]',
   false,false,true),
  -- BUTTONS (piece)
  ('b001-designer-button','B001','Designer Button',
   'Engraved designer button with a polished antique finish.',
   20, null, 'piece', 1, 1, 2000, 'buttons','designer-buttons','Antique gold','Metal alloy',
   '[{"label":"Button diameter","value":"18 mm"},{"label":"Design","value":"Engraved floral"}]',
   true,true,false),
  ('b002-shirt-button','B002','Shirt Button',
   'Everyday four-hole shirt button, durable and easy to sew.',
   5, null, 'piece', 1, 10, 5000, 'buttons','shirt-buttons','White','Resin',
   '[{"label":"Button diameter","value":"11 mm"},{"label":"Design","value":"Four-hole"}]',
   false,true,false),
  ('b003-pearl-fancy-button','B003','Pearl Fancy Button',
   'Pearl-finish fancy button with a shank back, perfect for bridal and festive outfits.',
   15, null, 'piece', 1, 1, 1500, 'buttons','fancy-buttons','Pearl white','Acrylic',
   '[{"label":"Button diameter","value":"14 mm"},{"label":"Design","value":"Pearl dome"}]',
   false,false,true),
  -- BUCKRAM (yard)
  ('bk001-tailoring-buckram','BK001','Tailoring Buckram',
   'Firm tailoring buckram for collars, cuffs, waistbands and structured borders.',
   60, null, 'yard', 1, 1, 600, 'buckrams','tailoring-buckrams','Natural','Cotton',
   '[{"label":"Width","value":"36 inch"},{"label":"Stiffness","value":"Medium"}]',
   false,false,false),
  -- SEWING SUPPLIES
  ('o001-sewing-machine-oil','O001','Sewing Machine Oil',
   'Clean, light mineral oil that keeps sewing machines running smoothly and quietly.',
   150, null, 'bottle', 1, 1, 80, 'sewing-supplies','sewing-machine-oil',null,null,
   '[{"label":"Bottle size","value":"100 ml"},{"label":"Brand","value":"Azan Lace"}]',
   true,false,false),
  ('n001-sewing-needle','N001','Sewing Needle',
   'Sharp steel sewing needle for everyday hand stitching.',
   10, null, 'needle', 1, 1, 1500, 'sewing-supplies','sewing-needles','Silver','Steel',
   '[{"label":"Size","value":"No. 9"}]',
   false,true,false),
  -- TAILORING ACCESSORIES (piece)
  ('r001-measuring-ruler','R001','Tailor Measuring Ruler',
   'Clear, accurate pattern ruler marked in inches and centimetres.',
   250, null, 'piece', 1, 1, 70, 'tailoring-accessories','measuring-rulers','Clear','Acrylic',
   '[{"label":"Ruler length","value":"24 inch"},{"label":"Measurement type","value":"Inches / cm"}]',
   false,false,true),
  ('t001-tailor-measuring-tape','T001','Tailor Measuring Tape',
   'Flexible double-sided measuring tape for body measurements.',
   120, null, 'piece', 1, 1, 150, 'tailoring-accessories','tailoring-measuring-tools','Yellow','Fibreglass',
   '[{"label":"Length","value":"60 inch / 150 cm"}]',
   false,true,false)
) as v(slug, sku, name, descr, price, sale, unit, step, minq, stock, cat, sub, colour, material, specs, feat, best, isnew)
join public.categories c on c.slug = v.cat
left join public.subcategories s on s.slug = v.sub
on conflict (slug) do nothing;

-- Two images per product (swap for real photos via the admin dashboard)
insert into public.product_images (product_id, url, sort_order)
select id, '/products/' || slug || '.svg', 0 from public.products
where not exists (select 1 from public.product_images i where i.product_id = products.id);

insert into public.product_images (product_id, url, sort_order)
select id, '/products/' || slug || '-2.svg', 1 from public.products
where (select count(*) from public.product_images i where i.product_id = products.id) = 1;

-- Banners -------------------------------------------------------------
insert into public.banners (eyebrow, title, subtitle, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order)
select * from (values
  ('New season','Every Detail Makes the Difference.',
   'Discover beautiful laces, designer trims and essential tailoring supplies to bring every creation to life.',
   '/banners/hero-1.svg','Shop Laces','/collections/laces','Explore All Products','/collections/all',1),
  ('Neckline patches','Finish every neckline beautifully.',
   'Zari, pearl and thread-embroidered patches ready to stitch.',
   '/banners/hero-2.svg','Shop Patches','/collections/patches','View Laces','/collections/laces',2),
  ('For every tailor','Essential tailoring supplies.',
   'Buttons, buckram, needles, machine oil and measuring tools in one place.',
   '/banners/hero-3.svg','Shop Supplies','/collections/sewing-supplies','Tailoring Tools','/collections/tailoring-accessories',3)
) as b(eyebrow,title,subtitle,image_url,cta_label,cta_href,cta2_label,cta2_href,sort_order)
where not exists (select 1 from public.banners);

-- Settings ------------------------------------------------------------
insert into public.store_settings (key, value) values
  ('announcements', '{"messages":["Free delivery on orders over Rs. 5,000","New lace arrivals every week","Wholesale rates available — message us on WhatsApp"],"enabled":true}'),
  ('shipping',      '{"flat_rate":250,"free_over":5000}'),
  ('payments',      '{"cod_enabled":true,"bank_transfer_enabled":true,"bank_details":"Bank: Your Bank Name\nAccount title: Azan Lace\nAccount no: 0000-0000000000\nIBAN: PK00XXXX0000000000000000\nAfter paying, send the receipt on WhatsApp with your order number."}'),
  ('contact',       '{"business_name":"Azan Lace","phone":"+92 300 0000000","whatsapp":"923000000000","email":"hello@azanlace.example","address":"Shop #00, Lace Market, Your City, Pakistan","hours":"Mon–Sat: 10:00 AM – 8:00 PM\nSunday: Closed","map_embed":"https://www.google.com/maps?q=Rawalpindi,Pakistan&output=embed","facebook":"https://facebook.com/","instagram":"https://instagram.com/","tiktok":"https://tiktok.com/"}')
on conflict (key) do nothing;

-- Sample coupon
insert into public.coupons (code, discount_type, discount_value, min_order)
values ('WELCOME10', 'percent', 10, 1000)
on conflict (code) do nothing;
