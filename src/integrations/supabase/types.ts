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
      admin_notifications: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_read: boolean
          message: string
          status: string
          type: string
          user_email: string | null
          user_id: string | null
          user_nome: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          status?: string
          type?: string
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          status?: string
          type?: string
          user_email?: string | null
          user_id?: string | null
          user_nome?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          link: string
          position: number
          subtitle: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          link?: string
          position?: number
          subtitle?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          link?: string
          position?: number
          subtitle?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      bot_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      broadcast_progress: {
        Row: {
          blocked_count: number
          completed_at: string | null
          created_at: string
          current_batch: number
          error_message: string | null
          estimated_completion: string | null
          failed_count: number
          id: string
          notification_id: string
          sent_count: number
          speed_per_second: number
          started_at: string | null
          status: string
          total_batches: number
          total_users: number
          updated_at: string
        }
        Insert: {
          blocked_count?: number
          completed_at?: string | null
          created_at?: string
          current_batch?: number
          error_message?: string | null
          estimated_completion?: string | null
          failed_count?: number
          id?: string
          notification_id: string
          sent_count?: number
          speed_per_second?: number
          started_at?: string | null
          status?: string
          total_batches?: number
          total_users?: number
          updated_at?: string
        }
        Update: {
          blocked_count?: number
          completed_at?: string | null
          created_at?: string
          current_batch?: number
          error_message?: string | null
          estimated_completion?: string | null
          failed_count?: number
          id?: string
          notification_id?: string
          sent_count?: number
          speed_per_second?: number
          started_at?: string | null
          status?: string
          total_batches?: number
          total_users?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_progress_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_text: string | null
          name: string | null
          participant_1: string
          participant_2: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          name?: string | null
          participant_1: string
          participant_2?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          name?: string | null
          participant_1?: string
          participant_2?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          delivered_at: string | null
          id: string
          image_url: string | null
          is_deleted: boolean
          is_delivered: boolean
          is_read: boolean
          read_at: string | null
          reply_to_id: string | null
          sender_id: string
          type: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          is_delivered?: boolean
          is_read?: boolean
          read_at?: string | null
          reply_to_id?: string | null
          sender_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          is_delivered?: boolean
          is_read?: boolean
          read_at?: string | null
          reply_to_id?: string | null
          sender_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          buttons: Json | null
          created_at: string
          failed_count: number
          id: string
          image_url: string | null
          message: string
          message_effect_id: string | null
          sent_count: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          buttons?: Json | null
          created_at?: string
          failed_count?: number
          id?: string
          image_url?: string | null
          message: string
          message_effect_id?: string | null
          sent_count?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          buttons?: Json | null
          created_at?: string
          failed_count?: number
          id?: string
          image_url?: string | null
          message?: string
          message_effect_id?: string | null
          sent_count?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      operadoras: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          updated_at: string
          valores: Json
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          valores?: Json
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
          valores?: Json
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          active: boolean
          allow_multiple: boolean
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          options: Json
          question: string
          total_votes: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_multiple?: boolean
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          options?: Json
          question: string
          total_votes?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_multiple?: boolean
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          options?: Json
          question?: string
          total_votes?: number
          updated_at?: string
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
          telegram_id: number | null
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
          telegram_id?: number | null
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
          telegram_id?: number | null
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
          custo_api: number
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
          custo_api?: number
          external_id?: string | null
          id?: string
          operadora?: string | null
          status?: string
          telefone: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          custo?: number
          custo_api?: number
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
          created_at: string
          id: string
          key: string
          updated_at: string
          user_id: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          user_id: string
          value?: string | null
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: string
          tipo: string
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          id?: string
          tipo?: string
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          created_at?: string
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
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      telegram_sessions: {
        Row: {
          chat_id: string
          created_at: string
          data: Json | null
          step: string
          updated_at: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          data?: Json | null
          step?: string
          updated_at?: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          data?: Json | null
          step?: string
          updated_at?: string
        }
        Relationships: []
      }
      telegram_users: {
        Row: {
          block_reason: string | null
          created_at: string
          first_name: string | null
          id: string
          is_blocked: boolean
          is_registered: boolean
          telegram_id: number
          updated_at: string
          username: string | null
        }
        Insert: {
          block_reason?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_blocked?: boolean
          is_registered?: boolean
          telegram_id: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          block_reason?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          is_blocked?: boolean
          is_registered?: boolean
          telegram_id?: number
          updated_at?: string
          username?: string | null
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
          telegram_notified: boolean | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          module?: string | null
          payment_id?: string | null
          status?: string
          telegram_notified?: boolean | null
          type?: string
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
          telegram_notified?: boolean | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
