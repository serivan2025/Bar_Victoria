-- =====================================================
-- VICTORIA BAR | SEGURANÇA + GALERIA DESCRIÇÃO
-- =====================================================

alter table public.gallery
add column if not exists description text;

alter table public.menu_items enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table storage.objects enable row level security;

drop policy if exists "Public can read menu_items" on public.menu_items;
drop policy if exists "Authenticated can manage menu_items" on public.menu_items;
drop policy if exists "Public can read active events" on public.events;
drop policy if exists "Authenticated can manage events" on public.events;
drop policy if exists "Public can read gallery" on public.gallery;
drop policy if exists "Authenticated can manage gallery" on public.gallery;
drop policy if exists "Public can read bar-images" on storage.objects;
drop policy if exists "Authenticated can upload bar-images" on storage.objects;
drop policy if exists "Authenticated can update bar-images" on storage.objects;
drop policy if exists "Authenticated can delete bar-images" on storage.objects;

create policy "Public can read menu_items"
on public.menu_items
for select
to public
using (true);

create policy "Authenticated can manage menu_items"
on public.menu_items
for all
to authenticated
using (true)
with check (true);

create policy "Public can read active events"
on public.events
for select
to public
using (active = true);

create policy "Authenticated can manage events"
on public.events
for all
to authenticated
using (true)
with check (true);

create policy "Public can read gallery"
on public.gallery
for select
to public
using (true);

create policy "Authenticated can manage gallery"
on public.gallery
for all
to authenticated
using (true)
with check (true);

create policy "Public can read bar-images"
on storage.objects
for select
to public
using (bucket_id = 'bar-images');

create policy "Authenticated can upload bar-images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'bar-images');

create policy "Authenticated can update bar-images"
on storage.objects
for update
to authenticated
using (bucket_id = 'bar-images')
with check (bucket_id = 'bar-images');

create policy "Authenticated can delete bar-images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'bar-images');
