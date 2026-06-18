export type NivelAcessoDb = 'colaborador' | 'supervisor' | 'administracao' | 'admin';
export type StatusCanhotoDb = 'pendente' | 'enviado' | 'divergente' | 'aprovado' | 'rejeitado';
export type StatusProcedimentoDb = 'rascunho' | 'enviado' | 'conferido' | 'divergente';
export type TipoProcedimentoDb = 'promotor' | 'quebra';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          email: string;
          nivel_acesso: NivelAcessoDb;
          loja_id: string | null;
          ativo: boolean;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          nome: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      lojas: {
        Row: {
          id: string;
          nome: string;
          codigo: string;
          regiao: string;
          ativa: boolean;
        };
      };
      canhotos: {
        Row: {
          id: string;
          numero: string;
          loja_id: string;
          usuario_id: string;
          foto_path: string | null;
          status: StatusCanhotoDb;
          observacoes: string | null;
          enviado_em: string | null;
          created_at: string;
        };
        Insert: {
          numero: string;
          loja_id: string;
          usuario_id: string;
          foto_path?: string | null;
          status?: StatusCanhotoDb;
          observacoes?: string | null;
          enviado_em?: string | null;
        };
        Update: Partial<Database['public']['Tables']['canhotos']['Insert']>;
      };
      canhotos_sistema: {
        Row: {
          id: string;
          numero: string;
          data: string;
          nfe: string | null;
          total: number | null;
          nome_fantasia: string | null;
          loja_id: string | null;
          status: 'disponivel' | 'atrasado';
        };
      };
      procedimentos: {
        Row: {
          id: string;
          tipo: TipoProcedimentoDb;
          loja_id: string;
          usuario_id: string;
          status: StatusProcedimentoDb;
          enviado_em: string | null;
          created_at: string;
        };
        Insert: {
          tipo: TipoProcedimentoDb;
          loja_id: string;
          usuario_id: string;
          status?: StatusProcedimentoDb;
          enviado_em?: string | null;
        };
      };
      procedimento_itens: {
        Row: {
          id: string;
          procedimento_id: string;
          item_id: string;
          label: string;
          concluido: boolean;
          requires_photo: boolean;
        };
        Insert: {
          procedimento_id: string;
          item_id: string;
          label: string;
          concluido?: boolean;
          requires_photo?: boolean;
        };
      };
      procedimento_fotos: {
        Row: {
          id: string;
          procedimento_id: string;
          item_id: string;
          storage_path: string;
        };
        Insert: {
          procedimento_id: string;
          item_id: string;
          storage_path: string;
        };
      };
      conferencias: {
        Row: {
          id: string;
          entidade_tipo: 'canhoto' | 'procedimento';
          entidade_id: string;
          conferido_por: string;
          status: 'aprovado' | 'rejeitado' | 'divergente';
          observacao: string | null;
          created_at: string;
        };
        Insert: {
          entidade_tipo: 'canhoto' | 'procedimento';
          entidade_id: string;
          conferido_por: string;
          status: 'aprovado' | 'rejeitado' | 'divergente';
          observacao?: string | null;
        };
      };
      checklist_templates: {
        Row: {
          id: string;
          tipo: TipoProcedimentoDb;
          label: string;
          requires_photo: boolean;
          ordem: number;
        };
      };
    };
  };
}
