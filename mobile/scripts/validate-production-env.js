#!/usr/bin/env node
/**
 * Falha o build EAS production se variáveis Supabase não estiverem definidas.
 * Rodado no EAS via package.json → eas-build-pre-install.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!url || !key) {
  console.error(
    '\n[validate-production-env] ERRO: EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY são obrigatórios no profile production.\n' +
      'Configure via: eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "..."\n'
  );
  process.exit(1);
}

console.log('[validate-production-env] OK — variáveis Supabase presentes.');
