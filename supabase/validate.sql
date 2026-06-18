-- Validação pós-migration — execute após 001–010

SELECT 'lojas' AS tabela, count(*) AS registros FROM public.lojas
UNION ALL
SELECT 'canhotos_sistema', count(*) FROM public.canhotos_sistema
UNION ALL
SELECT 'checklist_templates', count(*) FROM public.checklist_templates;

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname IN ('public', 'storage')
ORDER BY tablename, policyname;

SELECT id, name, public FROM storage.buckets;
