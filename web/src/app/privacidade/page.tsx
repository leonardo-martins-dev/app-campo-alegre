export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose prose-slate">
      <h1>Política de Privacidade — Campo Alegre</h1>
      <p><strong>Última atualização:</strong> junho de 2026</p>
      <h2>Dados coletados</h2>
      <ul>
        <li>E-mail e nome para autenticação</li>
        <li>Fotos de canhotos e procedimentos enviadas pelo app</li>
        <li>Dados operacionais (loja, checklists, conferências)</li>
      </ul>
      <h2>Uso dos dados</h2>
      <p>Os dados são utilizados exclusivamente para operação interna da Campo Alegre: conferência, gestão de equipe e auditoria.</p>
      <h2>Armazenamento</h2>
      <p>Dados hospedados em infraestrutura Supabase (PostgreSQL e Storage), com acesso restrito por perfil.</p>
      <h2>Contato</h2>
      <p>Para solicitações sobre seus dados, entre em contato com a administração da Campo Alegre.</p>
    </div>
  );
}
