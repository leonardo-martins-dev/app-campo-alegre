-- Campo Alegre — 003b: convites + trigger handle_new_user

CREATE TABLE public.convites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  nome text NOT NULL,
  nivel_acesso public.nivel_acesso NOT NULL,
  loja_id uuid REFERENCES public.lojas (id) ON DELETE SET NULL,
  convidado_por uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  status public.status_convite NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_convites_email ON public.convites (lower(email));
CREATE INDEX idx_convites_status ON public.convites (status);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb;
  v_nome text;
  v_nivel public.nivel_acesso;
  v_loja_id uuid;
BEGIN
  meta := NEW.raw_app_meta_data;

  v_nome := COALESCE(meta->>'nome', split_part(NEW.email, '@', 1));
  v_nivel := COALESCE((meta->>'nivel_acesso')::public.nivel_acesso, 'colaborador'::public.nivel_acesso);

  IF meta ? 'loja_id' AND (meta->>'loja_id') <> '' THEN
    v_loja_id := (meta->>'loja_id')::uuid;
  ELSE
    SELECT c.loja_id, c.nome, c.nivel_acesso
    INTO v_loja_id, v_nome, v_nivel
    FROM public.convites c
    WHERE lower(c.email) = lower(NEW.email)
      AND c.status = 'pendente'
    ORDER BY c.created_at DESC
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, nome, email, nivel_acesso, loja_id, ativo)
  VALUES (NEW.id, v_nome, NEW.email, v_nivel, v_loja_id, true)
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    nivel_acesso = EXCLUDED.nivel_acesso,
    loja_id = EXCLUDED.loja_id,
    updated_at = now();

  UPDATE public.convites
  SET status = 'aceito'
  WHERE lower(email) = lower(NEW.email)
    AND status = 'pendente';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
