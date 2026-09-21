-- إعدادات النشرة المشتركة: صف واحد لكل الشركة.
--
-- تُحفظ كـ jsonb لا كأعمدة منفصلة، لأن شكل PosterSettings يتغيّر مع كل ميزة
-- (الوكلاء، الكفالات، الألوان، الخطوط، الترتيب اليدوي، توزيع البراندات)،
-- فـ jsonb يستوعب أي حقل جديد بلا migration.

create table if not exists public.newsletter_settings (
  id boolean primary key default true,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  -- يضمن صفاً واحداً لا غير، فلا تتشعّب النشرات
  constraint newsletter_settings_singleton check (id)
);

alter table public.newsletter_settings enable row level security;

drop policy if exists newsletter_settings_select on public.newsletter_settings;
create policy newsletter_settings_select
  on public.newsletter_settings
  for select
  to authenticated
  using (true);

drop policy if exists newsletter_settings_insert on public.newsletter_settings;
create policy newsletter_settings_insert
  on public.newsletter_settings
  for insert
  to authenticated
  with check (true);

drop policy if exists newsletter_settings_update on public.newsletter_settings;
create policy newsletter_settings_update
  on public.newsletter_settings
  for update
  to authenticated
  using (true)
  with check (true);

-- الصف الوحيد. يبقى فارغاً حتى يبذره التطبيق من إعدادات المتصفح المحفوظة.
insert into public.newsletter_settings (id)
values (true)
on conflict (id) do nothing;
