-- Campo Alegre — 010: dados iniciais (lojas + canhotos sistema de exemplo)

INSERT INTO public.lojas (id, nome, codigo, regiao, ativa) VALUES
  ('a1000001-0001-4000-8000-000000000001', 'Loja Centro', 'LC-01', 'Centro', true),
  ('a1000001-0001-4000-8000-000000000002', 'Loja Sul', 'LS-02', 'Sul', true),
  ('a1000001-0001-4000-8000-000000000003', 'Loja Norte', 'LN-03', 'Norte', true),
  ('a1000001-0001-4000-8000-000000000004', 'Loja Leste', 'LL-04', 'Leste', false)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.canhotos_sistema (numero, data, nfe, total, nome_fantasia, loja_id, status) VALUES
  ('1001', CURRENT_DATE, 'NF-9001', 123.45, 'Loja Centro', 'a1000001-0001-4000-8000-000000000001', 'disponivel'),
  ('1002', CURRENT_DATE, 'NF-9002', 87.90, 'Loja Centro', 'a1000001-0001-4000-8000-000000000001', 'disponivel'),
  ('1003', CURRENT_DATE - 2, 'NF-8801', 210.00, 'Loja Sul', 'a1000001-0001-4000-8000-000000000002', 'atrasado'),
  ('1004', CURRENT_DATE - 4, 'NF-8701', 75.50, 'Loja Norte', 'a1000001-0001-4000-8000-000000000003', 'atrasado'),
  ('1005', CURRENT_DATE - 1, NULL, NULL, 'Loja Centro', 'a1000001-0001-4000-8000-000000000001', 'disponivel')
ON CONFLICT (numero, loja_id) DO NOTHING;

-- Checklist promotor (referência)
CREATE TABLE IF NOT EXISTS public.checklist_templates (
  id text PRIMARY KEY,
  tipo public.tipo_procedimento NOT NULL,
  label text NOT NULL,
  requires_photo boolean NOT NULL DEFAULT false,
  ordem int NOT NULL DEFAULT 0
);

ALTER TABLE public.checklist_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY checklist_templates_select ON public.checklist_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY checklist_templates_admin ON public.checklist_templates
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

INSERT INTO public.checklist_templates (id, tipo, label, requires_photo, ordem) VALUES
  ('higienizacao', 'promotor', 'Tirar produtos sobrados para reforma e fazer a higienização do ponto de venda', false, 1),
  ('abertura', 'promotor', 'Abertura com produtos frescos do dia (molhar produto na área de venda e tirar foto)', true, 2),
  ('precificacao', 'promotor', 'Precificação: logo em seguida é organizado e atualizado os preços dos produtos', false, 3),
  ('camara', 'promotor', 'Guardar produtos do dia na câmara fria', false, 4),
  ('reforma', 'promotor', 'Fazer reforma e abastece-las em seguida', false, 5),
  ('pedido', 'promotor', '(Pedido): Fazer pedido sugestão juntamente com o encarregado', false, 6),
  ('almoco', 'promotor', 'Almoço', false, 7),
  ('reabertura', 'promotor', '(Reabertura): processo de reabertura após almoço — Segunda reforma', true, 8),
  ('manter', 'promotor', 'Manter o ponto abastecido e molhado ao menos a cada hora', true, 9),
  ('quebras', 'promotor', 'Fazer quebras diariamente logo após a reforma', false, 10),
  ('nota', 'promotor', 'Nota de devolução: quartas e sextas ou quando necessário', false, 11),
  ('registro_quebras', 'quebra', 'Registro de quebras', false, 1),
  ('nota_devolucao', 'quebra', 'Nota de devolução', false, 2),
  ('fotos_obrigatorias', 'quebra', 'Fotos obrigatórias', true, 3)
ON CONFLICT (id) DO NOTHING;
