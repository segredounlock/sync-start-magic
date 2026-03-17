// ═══════════════════════════════════════════════════════════════
// TIPOS GLOBAIS — Definições únicas reutilizáveis em todo o sistema
// ═══════════════════════════════════════════════════════════════

export interface Revendedor {
  id: string;
  nome: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  saldo: number;
  role: "admin" | "revendedor" | "cliente" | "usuario" | "sem_role" | string;
  avatar_url: string | null;
  telefone?: string | null;
  telegram_username?: string | null;
  whatsapp_number?: string | null;
  isRevendedor?: boolean;
  verification_badge?: string | null;
}

export interface RecargaHistorico {
  id: string;
  user_id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  custo_api?: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  user_nome?: string | null;
  user_email?: string | null;
}

export interface Recarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  custo_api: number;
  status: string;
  created_at: string;
  completed_at?: string | null;
  external_id?: string | null;
}

export interface Operadora {
  id: string;
  nome: string;
  valores: number[];
  ativo: boolean;
}

export interface CatalogValue {
  valueId: string;
  value: number;
  cost: number;
  label?: string;
}

export interface CatalogCarrier {
  carrierId: string;
  name: string;
  order: number;
  extraField?: { required: boolean; title: string } | null;
  values: CatalogValue[];
}

export interface PricingRule {
  id?: string;
  operadora_id: string;
  valor_recarga: number;
  custo: number;
  tipo_regra: "fixo" | "margem";
  regra_valor: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  module: string | null;
  payment_id?: string | null;
  metadata?: any;
  user_id?: string;
  user_nome?: string;
  user_email?: string;
}

export type Period = "hoje" | "7dias" | "mes" | "total";
