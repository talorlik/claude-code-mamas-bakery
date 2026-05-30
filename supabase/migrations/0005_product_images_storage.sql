-- Product images: a public Storage bucket for admin-uploaded product photos.
--
-- The bucket is public-read so the menu can render images by URL without signed
-- URLs. Writes (upload/replace/delete) are restricted to admins via the same
-- public.is_admin(auth.uid()) helper used by the products-table RLS policies.
-- The products.image_url column is unchanged; it now stores the public object
-- URL for uploaded images (manual external URLs remain valid too).

-- ---------------------------------------------------------------------------
-- Bucket
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB, mirrored by the server action's validation
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Storage RLS: public read, admin-only writes, scoped to this bucket
-- ---------------------------------------------------------------------------

create policy "Public can read product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images' and public.is_admin(auth.uid())
);

create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin(auth.uid()))
with check (bucket_id = 'product-images' and public.is_admin(auth.uid()));

create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin(auth.uid()));
