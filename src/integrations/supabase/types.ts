export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      operadoras: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          valores: number[]
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          valores?: number[]
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          valores?: number[]
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          created_at: string
          custo: number
          id: string
          operadora_id: string
          regra_valor: number
          tipo_regra: string
          updated_at: string
          valor_recarga: number
        }
        Insert: {
          created_at?: string
          custo?: number
          id?: string
          operadora_id: string
          regra_valor?: number
          tipo_regra?: string
          updated_at?: string
          valor_recarga: number
        }
        Update: {
          created_at?: string
          custo?: number
          id?: string
          operadora_id?: string
          regra_valor?: number
          tipo_regra?: string
          updated_at?: string
          valor_recarga?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nome: string | null
          reseller_id: string | null
          slug: string | null
          store_logo_url: string | null
          store_name: string | null
          store_primary_color: string | null
          store_secondary_color: string | null
          telefone: string | null
          telegram_bot_token: string | null
          telegram_id: string | null
          telegram_username: string | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nome?: string | null
          reseller_id?: string | null
          slug?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          telefone?: string | null
          telegram_bot_token?: string | null
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          reseller_id?: string | null
          slug?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          telefone?: string | null
          telegram_bot_token?: string | null
          telegram_id?: string | null
          telegram_username?: string | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      recargas: {
        Row: {
          completed_at: string | null
          created_at: string
          custo: number
          external_id: string | null
          id: string
          operadora: string | null
          status: string
          telefone: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          custo?: number
          external_id?: string | null
          id?: string
          operadora?: string | null
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
          valor: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          custo?: number
          external_id?: string | null
          id?: string
          operadora?: string | null
          status?: string
          telefone?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      reseller_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          user_id?: string
          value?: string | null
        }
        Relationships: []
      }
      reseller_pricing_rules: {
        Row: {
          created_at: string
          custo: number
          id: string
          operadora_id: string
          regra_valor: number
          tipo_regra: string
          updated_at: string
          user_id: string
          valor_recarga: number
        }
        Insert: {
          created_at?: string
          custo?: number
          id?: string
          operadora_id: string
          regra_valor?: number
          tipo_regra?: string
          updated_at?: string
          user_id: string
          valor_recarga: number
        }
        Update: {
          created_at?: string
          custo?: number
          id?: string
          operadora_id?: string
          regra_valor?: number
          tipo_regra?: string
          updated_at?: string
          user_id?: string
          valor_recarga?: number
        }
        Relationships: [
          {
            foreignKeyName: "reseller_pricing_rules_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      saldos: {
        Row: {
          id: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          id?: string
          tipo?: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          id?: string
          tipo?: string
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      telegram_sessions: {
        Row: {
          chat_id: string
          data: Json | null
          step: string
          updated_at: string
        }
        Insert: {
          chat_id: string
          data?: Json | null
          step?: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          data?: Json | null
          step?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          module: string | null
          payment_id: string | null
          status: string
          telegram_notified: boolean
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          payment_id?: string | null
          status?: string
          telegram_notified?: boolean
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          payment_id?: string | null
          status?: string
          telegram_notified?: boolean
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "revendedor" | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "revendedor", "cliente"],
    },
  },
} as const
