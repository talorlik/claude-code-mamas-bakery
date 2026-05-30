-- Sample bakery products for development and the demo flow.
-- Idempotent: re-running will not create duplicates (guarded by name).

insert into public.products (name, description, price, category, image_url, is_available)
select v.name, v.description, v.price, v.category::product_category, v.image_url, v.is_available
from (
  values
    (
      'Classic Challah',
      'Traditional braided challah, soft and slightly sweet.',
      18.00,
      'challah',
      null,
      true
    ),
    (
      'Whole Wheat Challah',
      'Wholesome whole wheat braid with a hint of honey.',
      22.00,
      'challah',
      null,
      true
    ),
    (
      'Chocolate Babka',
      'Rich chocolate-swirled babka, baked fresh.',
      45.00,
      'cake',
      null,
      true
    ),
    (
      'Cinnamon Rugelach (12)',
      'A dozen flaky cinnamon rugelach.',
      30.00,
      'sweets',
      null,
      true
    ),
    (
      'Seasonal Fruit Tart',
      'Buttery tart shell with pastry cream and seasonal fruit.',
      55.00,
      'other',
      null,
      false
    )
) as v (name, description, price, category, image_url, is_available)
where not exists (
  select 1 from public.products p where p.name = v.name
);
