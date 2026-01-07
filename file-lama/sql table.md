-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
location text NOT NULL,
bidang jsonb DEFAULT '[]'::jsonb,
perimeter numeric,
tinggi_lantai numeric,
panel_dinding_id text,
panel_lantai_id text,
status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text])),
snapshot jsonb,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
total numeric,
location_provinsi text,
location_kabupaten text,
location_address text,
client_profile jsonb DEFAULT '{}'::jsonb,
project_profile jsonb DEFAULT '{}'::jsonb,
estimasi_pengiriman date,
CONSTRAINT rab_documents_pkey PRIMARY KEY (id),
CONSTRAINT rab_documents_panel_dinding_id_fkey FOREIGN KEY (panel_dinding_id) REFERENCES public.master_panel(id),
CONSTRAINT rab_documents_panel_lantai_id_fkey FOREIGN KEY (panel_lantai_id) REFERENCES public.master_panel(id)
);
