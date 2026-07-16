-- Campo Alegre — 001: extensões e tipos enum
-- Execute no SQL Editor do Supabase (ordem 001)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.nivel_acesso AS ENUM (
  'colaborador',
  'supervisor',
  'administracao',
  'admin'
);

CREATE TYPE public.status_canhoto AS ENUM (
  'pendente',
  'enviado',
  'divergente',
  'aprovado',
  'rejeitado'
);

CREATE TYPE public.status_canhoto_sistema AS ENUM (
  'disponivel',
  'atrasado'
);

CREATE TYPE public.tipo_procedimento AS ENUM (
  'promotor',
  'quebra'
);

CREATE TYPE public.status_procedimento AS ENUM (
  'rascunho',
  'enviado',
  'conferido',
  'divergente'
);

CREATE TYPE public.entidade_tipo AS ENUM (
  'canhoto',
  'procedimento'
);

CREATE TYPE public.status_conferencia AS ENUM (
  'aprovado',
  'rejeitado',
  'divergente'
);

CREATE TYPE public.status_convite AS ENUM (
  'pendente',
  'aceito',
  'expirado'
);

-- Função genérica updated_at (reutilizada em várias tabelas)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
