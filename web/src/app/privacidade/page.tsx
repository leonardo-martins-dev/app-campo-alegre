import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-sm font-bold text-primary">CA</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Campo Alegre</p>
            <p className="text-xs text-slate-500">Política de Privacidade</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          <strong className="font-medium text-slate-700">Última atualização:</strong> junho de 2026
        </p>

        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Dados coletados</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
              <li>E-mail e nome para autenticação</li>
              <li>Fotos de canhotos e procedimentos enviadas pelo app</li>
              <li>Dados operacionais (loja, checklists, conferências)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Uso dos dados</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Os dados são utilizados exclusivamente para operação interna da Campo Alegre:
              conferência, gestão de equipe e auditoria.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Armazenamento</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Dados hospedados em infraestrutura Supabase (PostgreSQL e Storage), com acesso
              restrito por perfil.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-900">Contato</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Para solicitações sobre seus dados, entre em contato com a administração da Campo Alegre.
            </p>
          </div>
        </section>

        <div className="mt-12 border-t border-slate-200 pt-6">
          <Link href="/login" className="text-sm text-primary hover:underline">
            ← Voltar ao painel
          </Link>
        </div>
      </main>
    </div>
  );
}
