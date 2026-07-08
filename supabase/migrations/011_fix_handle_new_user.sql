-- Campo Alegre — 011: corrigir handle_new_user (metadata + convites sem sobrescrever com NULL)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_meta jsonb;
  user_meta jsonb;
  v_nome text;
  v_nivel public.nivel_acesso;
  v_loja_id uuid;
  v_nivel_text text;
  convite_rec RECORD;
BEGIN
  app_meta := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb);
  user_meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  v_nome := COALESCE(
    NULLIF(app_meta->>'nome', ''),
    NULLIF(user_meta->>'nome', ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Usuario'
  );

  v_nivel_text := COALESCE(
    NULLIF(app_meta->>'nivel_acesso', ''),
    NULLIF(user_meta->>'nivel_acesso', '')
  );

  BEGIN
    v_nivel := COALESCE(v_nivel_text::public.nivel_acesso, 'colaborador'::public.nivel_acesso);
  EXCEPTION WHEN OTHERS THEN
    v_nivel := 'colaborador'::public.nivel_acesso;
  END;

  IF app_meta ? 'loja_id' AND NULLIF(app_meta->>'loja_id', '') IS NOT NULL THEN
    v_loja_id := (app_meta->>'loja_id')::uuid;
  ELSIF user_meta ? 'loja_id' AND NULLIF(user_meta->>'loja_id', '') IS NOT NULL THEN
    v_loja_id := (user_meta->>'loja_id')::uuid;
  ELSE
    SELECT c.loja_id, c.nome, c.nivel_acesso
    INTO convite_rec
    FROM public.convites c
    WHERE lower(c.email) = lower(NEW.email)
      AND c.status = 'pendente'
    ORDER BY c.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      v_loja_id := convite_rec.loja_id;
      v_nome := convite_rec.nome;
      v_nivel := convite_rec.nivel_acesso;
    END IF;
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

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
