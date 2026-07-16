# Lista migrations na ordem correta para o SQL Editor do Supabase.
$migrations = @(
  '001_extensions_and_enums.sql',
  '002_lojas.sql',
  '003_profiles.sql',
  '003b_convites.sql',
  '004_canhotos.sql',
  '005_procedimentos.sql',
  '006_conferencias.sql',
  '007_rls_helpers.sql',
  '008_rls_policies.sql',
  '009_storage_buckets.sql',
  '010_seed.sql',
  '010c_harden_handle_new_user.sql',
  '011_fix_handle_new_user.sql',
  '010b_seed_admin_profile.sql'
)

$root = Join-Path $PSScriptRoot '..\supabase\migrations'
Write-Host "Execute no SQL Editor (Supabase Dashboard), nesta ordem:`n"
$i = 1
foreach ($file in $migrations) {
  $path = Join-Path $root $file
  if (Test-Path $path) {
    Write-Host ("{0,2}. {1}" -f $i, $file)
  } else {
    Write-Host ("{0,2}. {1}  [AUSENTE]" -f $i, $file) -ForegroundColor Red
  }
  $i++
}
Write-Host "`nValidacao: supabase/validate.sql"
Write-Host "Setup completo: ../mobile/SETUP-SUPABASE.md"
