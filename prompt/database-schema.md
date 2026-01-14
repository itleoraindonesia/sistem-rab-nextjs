-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.clients (
  id integer NOT NULL DEFAULT nextval('clients_id_seq'::regclass),
  nama character varying NOT NULL,
  whatsapp character varying NOT NULL,
  kebutuhan character varying NOT NULL CHECK (kebutuhan::text = ANY (ARRAY['Pagar'::character varying, 'Gudang'::character varying, 'Kos/Kontrakan'::character varying, 'Toko/Ruko'::character varying, 'Rumah'::character varying, 'Villa'::character varying, 'Hotel'::character varying, 'Rumah Sakit'::character varying, 'Panel Saja'::character varying]::text[])),
  kabupaten character varying NOT NULL,
  luasan numeric,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  provinsi text,
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_ongkir (
  provinsi text NOT NULL,
  biaya numeric,
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  kabupaten text DEFAULT 'UNKNOWN'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT master_ongkir_pkey PRIMARY KEY (id)
);
CREATE TABLE public.master_panel (
  id text NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['dinding'::text, 'lantai'::text, 'hollow'::text])),
  harga numeric NOT NULL,
  berat numeric,
  volume numeric,
  jumlah_per_truck numeric,
  keterangan text DEFAULT ''::text,
  CONSTRAINT master_panel_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rab_documents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  no_ref text,
  project_name text NOT NULL,
  panel_dinding_id text,
  panel_lantai_id text,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text])),
  snapshot jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  total numeric,
  location_provinsi text,
  location_kabupaten text,
  client_profile jsonb DEFAULT '{}'::jsonb,
  deleted_at timestamp with time zone,
  CONSTRAINT rab_documents_pkey PRIMARY KEY (id),
  CONSTRAINT rab_documents_panel_dinding_id_fkey FOREIGN KEY (panel_dinding_id) REFERENCES public.master_panel(id),
  CONSTRAINT rab_documents_panel_lantai_id_fkey FOREIGN KEY (panel_lantai_id) REFERENCES public.master_panel(id)
);
CREATE TABLE public.rab_documents_backup (
  id uuid,
  no_ref text,
  project_name text,
  bidang jsonb,
  perimeter numeric,
  tinggi_lantai numeric,
  panel_dinding_id text,
  panel_lantai_id text,
  status text,
  snapshot jsonb,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total numeric,
  location_provinsi text,
  location_kabupaten text,
  location_address text,
  client_profile jsonb,
  project_profile jsonb,
  estimasi_pengiriman date,
  location_backup text,
  deleted_at timestamp with time zone
);