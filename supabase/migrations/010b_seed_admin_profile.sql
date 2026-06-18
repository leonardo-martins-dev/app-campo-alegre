-- Campo Alegre — 010b: vincular primeiro admin ao Auth
--
-- INSTRUÇÕES:
-- 1. Crie o usuário em Authentication → Users (e-mail + senha temporária)
--    OU aceite um convite como admin
-- 2. Copie o UUID do usuário em Authentication → Users
-- 3. Substitua 'SEU-UUID-AQUI' abaixo e execute este script

-- Exemplo (descomente e ajuste):
/*
INSERT INTO public.profiles (id, nome, email, nivel_acesso, loja_id, ativo)
VALUES (
  'SEU-UUID-AQUI'::uuid,
  'Admin Sistema',
  'admin@campoalegre.com',
  'admin',
  NULL,
  true
)
ON CONFLICT (id) DO UPDATE SET
  nivel_acesso = 'admin',
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  ativo = true,
  updated_at = now();
*/

-- Validação: listar profiles após configurar
-- SELECT id, nome, email, nivel_acesso, ativo FROM public.profiles;
