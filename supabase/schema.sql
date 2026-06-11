-- Tabla principal de jugadores
create table if not exists players (
  id          uuid        default gen_random_uuid() primary key,
  name        text        not null,
  position    text,
  nationality text,
  club        text,
  age         text,
  number      text,
  photo_url   text,
  card_type   text,
  stats       jsonb       not null default '{}',
  created_at  timestamptz default now()
);

-- Habilitar Row Level Security
alter table players enable row level security;

-- Política de acceso público (sin autenticación)
-- Si en el futuro agregas auth, reemplaza esta política por una que filtre por user_id
create policy "public_access"
  on players for all
  using (true)
  with check (true);
