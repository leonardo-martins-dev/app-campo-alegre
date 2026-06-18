# Deploy das Edge Functions (requer Supabase CLI logado e projeto linkado).
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRef
)

$supabaseDir = Join-Path $PSScriptRoot '..\supabase'
Push-Location $supabaseDir
try {
  supabase link --project-ref $ProjectRef
  supabase functions deploy invite-user
  supabase functions deploy upload-sistema
  Write-Host "`nOpcional: defina INVITE_REDIRECT_URL nos secrets do projeto (Dashboard)."
} finally {
  Pop-Location
}
