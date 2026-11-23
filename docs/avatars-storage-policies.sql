-- Run this once in Supabase Dashboard -> SQL Editor.
-- The app saves public avatar URLs, so first set the `avatars` bucket to Public
-- in Storage -> avatars -> Configuration.
--
-- Uploads are made only by the Spring backend, which sends its Supabase anon key.
-- The mobile app never receives that key and must use the authenticated API routes.

create policy "Backend can create avatars"
on storage.objects for insert to anon
with check (bucket_id = 'avatars');

create policy "Backend can replace avatars"
on storage.objects for update to anon
using (bucket_id = 'avatars')
with check (bucket_id = 'avatars');
