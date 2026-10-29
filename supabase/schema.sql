-- =====================================================================
-- LAV AU JATO - ESQUEMA DO BANCO (Supabase / PostgreSQL)
-- Cole este arquivo inteiro no Supabase: SQL Editor > New query > Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- CONFIGURAÇÕES DO SITE (linha única)
create table if not exists site_config (
  id                    text primary key default 'default',
  phone                 text not null default '',
  instagram             text not null default '',
  address_neighborhood  text not null default '',
  address_city          text not null default '',
  address_state         text not null default '',
  business_hours        text not null default '',
  loyalty_card_image    text,
  updated_at            timestamptz not null default now()
);
insert into site_config (id) values ('default') on conflict (id) do nothing;

-- CLIENTES (dados pessoais gravados criptografados pelo servidor)
create table if not exists clients (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  phone              text not null,
  email              text,
  cpf_cnpj           text,
  address            text not null default '',
  notes              text,
  asaas_customer_id  text,
  is_deleted         boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- PETS (N por cliente)
create table if not exists pets (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  name        text not null,
  gender      text,
  breed       text,
  size        text,
  coat_color  text,
  age         text,
  photo_url   text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists pets_client_idx on pets(client_id);

-- SERVIÇOS
create table if not exists services (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text not null default '',
  image        text,
  price        numeric(10,2),
  duration     text,
  badge        text,
  is_active    boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- PLANOS
create table if not exists plans (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  benefits      text[] not null default '{}',
  bonus         text,
  price_small   numeric(10,2),
  price_medium  numeric(10,2),
  price_large   numeric(10,2),
  is_popular    boolean not null default false,
  button_text   text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- PROMOÇÕES
create table if not exists promotions (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text not null default '',
  discount_text  text not null default '',
  badge          text,
  valid_until    text,
  image          text,
  is_active      boolean not null default true,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);

-- PRODUTOS
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text not null default '',
  price         numeric(10,2),
  category      text,
  photo_url     text,
  is_available  boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- GALERIA DE ATENDIMENTOS
create table if not exists portfolio_posts (
  id            uuid primary key default gen_random_uuid(),
  pet_name      text not null,
  breed         text,
  service_done  text not null default '',
  description   text not null default '',
  photo_url     text,
  date          text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

-- FOTOS DO ESPAÇO
create table if not exists workspace_photos (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- LINKS DE PAGAMENTO
create table if not exists payment_links (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  asaas_customer_id      text not null,
  customer_name          text not null,
  description            text,
  item_type              text not null check (item_type in ('service','plan')),
  item_id                text,
  item_name              text not null,
  pet_size               text,
  value                  numeric(10,2) not null,
  charge_type            text not null check (charge_type in ('SINGLE','RECURRENT')),
  payment_method         text not null check (payment_method in ('PIX','CREDIT_CARD','BOTH')),
  installment_count      int not null default 1,
  asaas_payment_id       text,
  asaas_subscription_id  text,
  card_url               text,
  pix_payload            text,
  status                 text not null default 'PENDING' check (status in ('PENDING','PAID','CANCELLED')),
  created_at             timestamptz not null default now()
);

-- SEGURANÇA: RLS ligado e SEM políticas = nada acessível pela chave pública.
-- Somente o servidor do site (service_role) lê/grava.
alter table site_config      enable row level security;
alter table clients          enable row level security;
alter table pets             enable row level security;
alter table services         enable row level security;
alter table plans            enable row level security;
alter table promotions       enable row level security;
alter table products         enable row level security;
alter table portfolio_posts  enable row level security;
alter table workspace_photos enable row level security;
alter table payment_links    enable row level security;

-- STORAGE: bucket público para imagens (leitura pública; escrita só pelo servidor)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-images', 'site-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
