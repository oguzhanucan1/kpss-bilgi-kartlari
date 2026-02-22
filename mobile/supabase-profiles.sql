-- Supabase SQL Editor'da çalıştırın: Dashboard → SQL Editor → New query
-- Her hesabın tek bir kullanıcı adı (username) ile ilişkilendirilmesi için profiles tablosu

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text,
  hedef_yil text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sadece kendi satırını okuyup güncelleyebilir
alter table public.profiles enable row level security;

create policy "Kullanıcı kendi profilini okuyabilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini ekleyebilir"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Kullanıcı adı kontrolü için: başka kullanıcıların profillerinde username var mı diye okuma (RLS ile sadece kendi satırı görünür, bu yüzden "username alınmış mı" kontrolü uygulama tarafında upsert hata kodu ile yapılacak)

comment on table public.profiles is 'Her hesaba bağlı kullanıcı adı ve profil bilgileri';
