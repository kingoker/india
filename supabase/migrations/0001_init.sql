-- =====================================================================
-- Ягья · INDIA — начальная схема (MVP, ТЗ §7)
-- Таблицы: services, yagyas, tours, tour_days, courses, articles,
--          reviews, leads
-- RLS: контент читается всеми (anon), заявки может вставлять anon,
--      читать/менять — только сервис-роль (админка).
-- Даты храним в timestamptz; прошедшие фильтруются на клиенте/в запросе.
-- =====================================================================

-- =====================================================================
-- ИЗОЛЯЦИЯ ПРОЕКТА. Self-hosted Supabase — один проект на инстанс, поэтому
-- несколько сайтов делят одну БД. Таблицы проекта живут в СВОЕЙ схеме `yagya`,
-- а не в `public`, и не пересекаются с чужими. Любой новый объект БД этого
-- проекта создаём только в схеме yagya.
-- После применения: добавьте yagya в PGRST_DB_SCHEMAS (см. README/CLAUDE.md)
-- и перезапустите контейнер rest, иначе REST вернёт «schema must be one of…».
-- =====================================================================
create schema if not exists yagya;

grant usage on schema yagya to anon, authenticated, service_role;
alter default privileges in schema yagya grant all on tables    to service_role;
alter default privileges in schema yagya grant all on sequences to service_role;
alter default privileges in schema yagya grant select on tables to anon, authenticated;

-- ---------- Услуги (Консультации) ----------
create table if not exists yagya.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  price        text,
  old_price    text,
  who          text,
  expert       text,
  duration     text,
  format       text,
  result       text,
  description  text,
  points       text[] default '{}',
  sort         int default 0,
  is_published boolean default true,
  is_active    boolean default true,
  created_at   timestamptz default now()
);

-- ---------- Ягьи ----------
create table if not exists yagya.yagyas (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  deity      text not null,
  title      text not null,
  goal       text,
  date       timestamptz not null,          -- дата/время проведения (UTC)
  time_msk   text,                          -- отображаемое время по Москве
  time_ist   text,                          -- отображаемое время по Индии
  price      text,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ---------- Туры ----------
create table if not exists yagya.tours (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  tagline     text,
  audience    text,
  date        timestamptz not null,         -- старт тура
  date_label  text,                         -- как показывать даты
  duration    text,
  price       text,
  seats       text,
  seats_left  int,                          -- этап 2: счётчик мест
  cities      text[] default '{}',
  cover       text,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ---------- Дни тура (программа) ----------
create table if not exists yagya.tour_days (
  id       uuid primary key default gen_random_uuid(),
  tour_id  uuid references yagya.tours(id) on delete cascade,
  day_no   int not null,
  label    text not null,
  content  text
);

-- ---------- Курсы (этап 2) ----------
create table if not exists yagya.courses (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  price       text,
  start_date  timestamptz,
  modules     jsonb default '[]',
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- ---------- Статьи (Журнал, этап 2) ----------
create table if not exists yagya.articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  category    text,                         -- Божества / Праздники / Практики / Астрология
  excerpt     text,
  body        text,
  cover       text,
  related_slug text,                        -- ссылка на ягью/услугу
  published   boolean default false,
  created_at  timestamptz default now()
);

-- ---------- Отзывы ----------
create table if not exists yagya.reviews (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  text       text not null,
  source     text,
  photo      text,
  sort       int default 0,
  is_active  boolean default true,
  created_at timestamptz default now()
);

-- ---------- Заявки ----------
create table if not exists yagya.leads (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,                -- consultation/yagya/tour/course/waitlist/general
  subject     text,
  service     text,                         -- выбранная услуга (если есть)
  name        text not null,
  contact     text not null,
  birth_date  text,
  birth_time  text,
  birth_place text,
  for_whom    text,
  intention   text,
  message     text,
  status      text default 'new',           -- new/processed
  created_at  timestamptz default now()
);

create index if not exists yagyas_date_idx on yagya.yagyas (date);
create index if not exists tours_date_idx  on yagya.tours (date);
create index if not exists leads_created_idx on yagya.leads (created_at desc);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table yagya.services  enable row level security;
alter table yagya.yagyas    enable row level security;
alter table yagya.tours     enable row level security;
alter table yagya.tour_days enable row level security;
alter table yagya.courses   enable row level security;
alter table yagya.articles  enable row level security;
alter table yagya.reviews   enable row level security;
alter table yagya.leads     enable row level security;

-- Публичное чтение активного контента
create policy "public read services"  on yagya.services  for select using (is_active and is_published);
create policy "public read yagyas"    on yagya.yagyas    for select using (is_active);
create policy "public read tours"     on yagya.tours     for select using (is_active);
create policy "public read tour_days" on yagya.tour_days for select using (true);
create policy "public read courses"   on yagya.courses   for select using (is_active);
create policy "public read articles"  on yagya.articles  for select using (published);
create policy "public read reviews"   on yagya.reviews   for select using (is_active);

-- Заявки: любой может создать, но не читать чужие.
-- Чтение/обновление заявок делает сервер через service_role (обходит RLS).
create policy "anyone can insert leads" on yagya.leads for insert with check (true);

-- Права на уже созданные таблицы (default privileges выше действуют на будущие).
-- Видимость строк по-прежнему решает RLS, а не эти гранты.
grant all on all tables in schema yagya to service_role;
grant select on all tables in schema yagya to anon, authenticated;
grant insert on yagya.leads, yagya.reviews to anon;
