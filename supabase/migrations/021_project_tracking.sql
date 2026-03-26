-- ============================================================
-- Migration: 020_project_tracking.sql
-- Feature: Project Tracking
-- ============================================================

-- UUID extension is not needed when using gen_random_uuid() which is built-in

-- ------------------------------------------------------------
-- CLEANUP (Idempotency)
-- ------------------------------------------------------------
DROP VIEW IF EXISTS project_summary;
DROP FUNCTION IF EXISTS get_project_progress(uuid);
DROP TABLE IF EXISTS customer_payment CASCADE;
DROP TABLE IF EXISTS vendor_payment CASCADE;
DROP TABLE IF EXISTS vendor_progress CASCADE;
DROP TABLE IF EXISTS vendor_spk CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TYPE IF EXISTS customer_payment_termin;
DROP TYPE IF EXISTS vendor_payment_jenis;
DROP TYPE IF EXISTS vendor_spk_status;

-- ------------------------------------------------------------
-- ENUM TYPES
-- ------------------------------------------------------------

create type vendor_spk_status as enum ('active', 'completed');
create type vendor_payment_jenis as enum ('dp', 'term', 'pelunasan');
create type customer_payment_termin as enum ('dp', 'term', 'final');

-- ------------------------------------------------------------
-- TABLE: projects
-- ------------------------------------------------------------

create table projects (
  id              uuid primary key default gen_random_uuid(),
  name            varchar(255) not null,
  contract_value  numeric(15, 2) not null default 0,
  customer_name   varchar(255) not null,
  created_at      timestamp with time zone default now(),
  updated_at      timestamp with time zone default now()
);

-- ------------------------------------------------------------
-- TABLE: vendor_spk
-- ------------------------------------------------------------

create table vendor_spk (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects(id) on delete cascade,
  vendor_name   varchar(255) not null,
  pekerjaan     varchar(255) not null,
  nilai_spk     numeric(15, 2) not null default 0,
  status        vendor_spk_status not null default 'active',
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

create index idx_vendor_spk_project_id on vendor_spk(project_id);

-- ------------------------------------------------------------
-- TABLE: vendor_progress
-- ------------------------------------------------------------

create table vendor_progress (
  id                uuid primary key default gen_random_uuid(),
  vendor_spk_id     uuid not null references vendor_spk(id) on delete cascade,
  tanggal           date not null,
  progress_percent  numeric(5, 2) not null check (progress_percent >= 0 and progress_percent <= 100),
  catatan           text,
  lampiran          jsonb default '[]'::jsonb,
  created_at        timestamp with time zone default now()
);

create index idx_vendor_progress_spk_id on vendor_progress(vendor_spk_id);

-- ------------------------------------------------------------
-- TABLE: vendor_payment
-- ------------------------------------------------------------

create table vendor_payment (
  id                  uuid primary key default gen_random_uuid(),
  vendor_spk_id       uuid not null references vendor_spk(id) on delete cascade,
  tanggal_pembayaran  date not null,
  jumlah              numeric(15, 2) not null check (jumlah > 0),
  jenis_pembayaran    vendor_payment_jenis not null,
  catatan             text,
  lampiran            jsonb default '[]'::jsonb,
  created_at          timestamp with time zone default now()
);

create index idx_vendor_payment_spk_id on vendor_payment(vendor_spk_id);

-- ------------------------------------------------------------
-- TABLE: customer_payment
-- ------------------------------------------------------------

create table customer_payment (
  id                  uuid primary key default gen_random_uuid(),
  project_id          uuid not null references projects(id) on delete cascade,
  tanggal_pembayaran  date not null,
  jumlah              numeric(15, 2) not null check (jumlah > 0),
  termin              customer_payment_termin not null,
  catatan             text,
  created_at          timestamp with time zone default now()
);

create index idx_customer_payment_project_id on customer_payment(project_id);

-- ------------------------------------------------------------
-- FUNCTION: updated_at trigger
-- ------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function set_updated_at();

create trigger trg_vendor_spk_updated_at
  before update on vendor_spk
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- FUNCTION: get_project_progress(project_id uuid)
-- Weighted progress berdasarkan nilai SPK vendor active
-- ------------------------------------------------------------

create or replace function get_project_progress(p_project_id uuid)
returns numeric as $$
declare
  result numeric;
begin
  select
    case
      when sum(vs.nilai_spk) = 0 then 0
      else round(
        sum(vs.nilai_spk * coalesce(latest.progress_percent, 0)) / sum(vs.nilai_spk),
        2
      )
    end
  into result
  from vendor_spk vs
  left join lateral (
    select progress_percent
    from vendor_progress vp
    where vp.vendor_spk_id = vs.id
    order by tanggal desc, created_at desc
    limit 1
  ) latest on true
  where vs.project_id = p_project_id
    and vs.status = 'active';

  return coalesce(result, 0);
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- VIEW: project_summary
-- ------------------------------------------------------------

create or replace view project_summary as
select
  p.id,
  p.name,
  p.customer_name,
  p.contract_value,
  coalesce(cp.total_paid, 0)                          as customer_paid,
  p.contract_value - coalesce(cp.total_paid, 0)       as customer_outstanding,
  coalesce(vs.total_spk, 0)                           as total_spk,
  coalesce(vp.total_paid, 0)                          as vendor_paid,
  coalesce(vs.total_spk, 0) - coalesce(vp.total_paid, 0) as vendor_outstanding,
  get_project_progress(p.id)                          as project_progress
from projects p
left join (
  select project_id, sum(jumlah) as total_paid
  from customer_payment
  group by project_id
) cp on cp.project_id = p.id
left join (
  select project_id, sum(nilai_spk) as total_spk
  from vendor_spk
  group by project_id
) vs on vs.project_id = p.id
left join (
  select vs2.project_id, sum(vpay.jumlah) as total_paid
  from vendor_payment vpay
  join vendor_spk vs2 on vs2.id = vpay.vendor_spk_id
  group by vs2.project_id
) vp on vp.project_id = p.id;
