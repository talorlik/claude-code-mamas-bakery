-- Scope down the product-images read policy.
--
-- A broad anon/authenticated SELECT on storage.objects lets any client LIST the
-- bucket's files (advisor 0025). Public buckets serve object content over the
-- public URL path without an RLS SELECT policy, so the menu does not need a
-- broad read policy to display images. Replace it with an admin-only SELECT so
-- only admins can enumerate the bucket; public image URLs keep working.

drop policy if exists "Public can read product images" on storage.objects;

create policy "Admins can list product images"
on storage.objects
for select
to authenticated
using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
