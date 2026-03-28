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
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      banned_devices: {
        Row: {
          active: boolean
          banned_by: string
          created_at: string
          fingerprint_hash: string | null
          id: string
          ip_address: string | null
          original_user_email: string | null
          original_user_id: string | null
          original_user_nome: string | null
          reason: string
          updated_at: string
          user_agent_pattern: string | null
        }
        Insert: {
          active?: boolean
          banned_by: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_address?: string | null
          original_user_email?: string | null
          original_user_id?: string | null
          original_user_nome?: string | null
          reason?: string
          updated_at?: string
          user_agent_pattern?: string | null
        }
        Update: {
          active?: boolean
          banned_by?: string
          created_at?: string
          fingerprint_hash?: string | null
          id?: string
          ip_address?: string | null
          original_user_email?: string | null
          original_user_id?: string | null
          original_user_nome?: string | null
          reason?: string
          updated_at?: string
          user_agent_pattern?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string
          enabled: boolean
          icon_url: string | null
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
          icon_url?: string | null
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
          icon_url?: string | null
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
      broadcast_messages: {
        Row: {
          created_at: string
          id: string
          message_id: number
          notification_id: string
          telegram_id: number
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: number
          notification_id: string
          telegram_id: number
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: number
          notification_id?: string
          telegram_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_messages_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
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
          category: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_blocked: boolean | null
          is_private: boolean | null
          last_message_at: string | null
          last_message_text: string | null
          name: string | null
          participant_1: string
          participant_2: string | null
          type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_blocked?: boolean | null
          is_private?: boolean | null
          last_message_at?: string | null
          last_message_text?: string | null
          name?: string | null
          participant_1: string
          participant_2?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_blocked?: boolean | null
          is_private?: boolean | null
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
      chat_members: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          audio_url: string | null
          content: string | null
          conversation_id: string
          created_at: string
          deleted_by: string | null
          delivered_at: string | null
          edited_by: string | null
          id: string
          image_url: string | null
          is_deleted: boolean
          is_delivered: boolean
          is_pinned: boolean
          is_read: boolean
          pinned_at: string | null
          pinned_by: string | null
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
          deleted_by?: string | null
          delivered_at?: string | null
          edited_by?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          is_delivered?: boolean
          is_pinned?: boolean
          is_read?: boolean
          pinned_at?: string | null
          pinned_by?: string | null
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
          deleted_by?: string | null
          delivered_at?: string | null
          edited_by?: string | null
          id?: string
          image_url?: string | null
          is_deleted?: boolean
          is_delivered?: boolean
          is_pinned?: boolean
          is_read?: boolean
          pinned_at?: string | null
          pinned_by?: string | null
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
      client_pricing_rules: {
        Row: {
          client_id: string
          created_at: string
          id: string
          lucro: number
          operadora_id: string
          reseller_id: string
          updated_at: string
          valor_recarga: number
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          lucro?: number
          operadora_id: string
          reseller_id: string
          updated_at?: string
          valor_recarga: number
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          lucro?: number
          operadora_id?: string
          reseller_id?: string
          updated_at?: string
          valor_recarga?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_pricing_rules_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      disabled_recharge_values: {
        Row: {
          created_at: string
          disabled_by: string
          id: string
          operadora_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          disabled_by: string
          id?: string
          operadora_id: string
          valor: number
        }
        Update: {
          created_at?: string
          disabled_by?: string
          id?: string
          operadora_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "disabled_recharge_values_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      license_logs: {
        Row: {
          created_at: string
          details: Json | null
          domain: string | null
          event_type: string
          id: string
          ip_address: string | null
          license_id: string | null
          mirror_name: string | null
          reason: string | null
          result: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          domain?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          license_id?: string | null
          mirror_name?: string | null
          reason?: string | null
          result?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          domain?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          license_id?: string | null
          mirror_name?: string | null
          reason?: string | null
          result?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string | null
          created_by: string
          expires_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          last_heartbeat_at: string | null
          license_key: string
          max_users: number | null
          mirror_domain: string | null
          mirror_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          expires_at: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          license_key: string
          max_users?: number | null
          mirror_domain?: string | null
          mirror_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          expires_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          last_heartbeat_at?: string | null
          license_key?: string
          max_users?: number | null
          mirror_domain?: string | null
          mirror_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      login_fingerprints: {
        Row: {
          canvas_hash: string | null
          color_depth: number | null
          created_at: string
          device_memory: number | null
          fingerprint_hash: string
          geolocation_accuracy: number | null
          hardware_concurrency: number | null
          id: string
          installed_plugins: string | null
          ip_address: string | null
          language: string | null
          latitude: number | null
          longitude: number | null
          pixel_ratio: number | null
          platform: string | null
          raw_data: Json | null
          screen_resolution: string | null
          selfie_url: string | null
          timezone: string | null
          touch_support: boolean | null
          user_agent: string | null
          user_id: string
          webgl_renderer: string | null
        }
        Insert: {
          canvas_hash?: string | null
          color_depth?: number | null
          created_at?: string
          device_memory?: number | null
          fingerprint_hash: string
          geolocation_accuracy?: number | null
          hardware_concurrency?: number | null
          id?: string
          installed_plugins?: string | null
          ip_address?: string | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          pixel_ratio?: number | null
          platform?: string | null
          raw_data?: Json | null
          screen_resolution?: string | null
          selfie_url?: string | null
          timezone?: string | null
          touch_support?: boolean | null
          user_agent?: string | null
          user_id: string
          webgl_renderer?: string | null
        }
        Update: {
          canvas_hash?: string | null
          color_depth?: number | null
          created_at?: string
          device_memory?: number | null
          fingerprint_hash?: string
          geolocation_accuracy?: number | null
          hardware_concurrency?: number | null
          id?: string
          installed_plugins?: string | null
          ip_address?: string | null
          language?: string | null
          latitude?: number | null
          longitude?: number | null
          pixel_ratio?: number | null
          platform?: string | null
          raw_data?: Json | null
          screen_resolution?: string | null
          selfie_url?: string | null
          timezone?: string | null
          touch_support?: boolean | null
          user_agent?: string | null
          user_id?: string
          webgl_renderer?: string | null
        }
        Relationships: []
      }
      mirror_file_state: {
        Row: {
          action: string | null
          created_at: string | null
          error_message: string | null
          file_path: string
          id: string
          last_synced_at: string | null
          mirror_hash: string | null
          mirror_id: string
          source_hash: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path: string
          id?: string
          last_synced_at?: string | null
          mirror_hash?: string | null
          mirror_id: string
          source_hash?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          error_message?: string | null
          file_path?: string
          id?: string
          last_synced_at?: string | null
          mirror_hash?: string | null
          mirror_id?: string
          source_hash?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mirror_sync_logs: {
        Row: {
          completed_at: string | null
          conflicts_detected: number | null
          details: Json | null
          duration_ms: number | null
          error_message: string | null
          files_failed: number | null
          files_sent: number | null
          files_skipped: number | null
          id: string
          mirror_id: string
          started_at: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          conflicts_detected?: number | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          files_failed?: number | null
          files_sent?: number | null
          files_skipped?: number | null
          id?: string
          mirror_id: string
          started_at?: string | null
          sync_type?: string
        }
        Update: {
          completed_at?: string | null
          conflicts_detected?: number | null
          details?: Json | null
          duration_ms?: number | null
          error_message?: string | null
          files_failed?: number | null
          files_sent?: number | null
          files_skipped?: number | null
          id?: string
          mirror_id?: string
          started_at?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      mirror_sync_state: {
        Row: {
          conflict_files: number | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          last_synced_commit: string | null
          mirror_id: string
          mirror_repo: string
          pending_files: number | null
          protected_paths: Json | null
          source_repo: string
          synced_files: number | null
          total_files: number | null
          updated_at: string | null
        }
        Insert: {
          conflict_files?: number | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_synced_commit?: string | null
          mirror_id: string
          mirror_repo: string
          pending_files?: number | null
          protected_paths?: Json | null
          source_repo?: string
          synced_files?: number | null
          total_files?: number | null
          updated_at?: string | null
        }
        Update: {
          conflict_files?: number | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          last_synced_commit?: string | null
          mirror_id?: string
          mirror_repo?: string
          pending_files?: number | null
          protected_paths?: Json | null
          source_repo?: string
          synced_files?: number | null
          total_files?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
          bio: string | null
          created_at: string
          email: string | null
          id: string
          last_seen_at: string | null
          nome: string | null
          referral_code: string | null
          reseller_id: string | null
          slug: string
          store_logo_url: string | null
          store_name: string | null
          store_primary_color: string | null
          store_secondary_color: string | null
          telefone: string | null
          telegram_id: number | null
          telegram_username: string | null
          updated_at: string
          verification_badge: string | null
          whatsapp_number: string | null
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          last_seen_at?: string | null
          nome?: string | null
          referral_code?: string | null
          reseller_id?: string | null
          slug: string
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          telefone?: string | null
          telegram_id?: number | null
          telegram_username?: string | null
          updated_at?: string
          verification_badge?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_seen_at?: string | null
          nome?: string | null
          referral_code?: string | null
          reseller_id?: string | null
          slug?: string
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          telefone?: string | null
          telegram_id?: number | null
          telegram_username?: string | null
          updated_at?: string
          verification_badge?: string | null
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
          {
            foreignKeyName: "profiles_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
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
      referral_commissions: {
        Row: {
          amount: number
          created_at: string
          id: string
          recarga_id: string | null
          referred_user_id: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          recarga_id?: string | null
          referred_user_id: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          recarga_id?: string | null
          referred_user_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_recarga_id_fkey"
            columns: ["recarga_id"]
            isOneToOne: false
            referencedRelation: "recargas"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_base_pricing_rules: {
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
            foreignKeyName: "reseller_base_pricing_rules_operadora_id_fkey"
            columns: ["operadora_id"]
            isOneToOne: false
            referencedRelation: "operadoras"
            referencedColumns: ["id"]
          },
        ]
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
      reseller_deposit_fees: {
        Row: {
          created_at: string
          fee_type: string
          fee_value: number
          id: string
          reseller_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          reseller_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fee_type?: string
          fee_value?: number
          id?: string
          reseller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_deposit_fees_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reseller_deposit_fees_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_pricing_rules: {
        Row: {
          created_at: string
          custo: number
          id: string
          operadora_id: string
          regra_valor: number
          set_by_admin: boolean
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
          set_by_admin?: boolean
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
          set_by_admin?: boolean
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
      scratch_cards: {
        Row: {
          card_date: string
          created_at: string
          id: string
          is_scratched: boolean
          is_won: boolean
          prize_amount: number
          scratched_at: string | null
          user_id: string
        }
        Insert: {
          card_date?: string
          created_at?: string
          id?: string
          is_scratched?: boolean
          is_won?: boolean
          prize_amount?: number
          scratched_at?: string | null
          user_id: string
        }
        Update: {
          card_date?: string
          created_at?: string
          id?: string
          is_scratched?: boolean
          is_won?: boolean
          prize_amount?: number
          scratched_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          message: string
          origin: string
          sender_id: string
          sender_role: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message: string
          origin?: string
          sender_id: string
          sender_role?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          message?: string
          origin?: string
          sender_id?: string
          sender_role?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          shortcut: string | null
          title: string
          updated_at: string
          usage_count: number
          variables: Json | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          shortcut?: string | null
          title: string
          updated_at?: string
          usage_count?: number
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          shortcut?: string | null
          title?: string
          updated_at?: string
          usage_count?: number
          variables?: Json | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          assigned_to: string | null
          created_at: string
          department: string
          id: string
          image_url: string | null
          message: string
          priority: string
          replied_at: string | null
          resolved_at: string | null
          status: string
          subject: string | null
          telegram_chat_id: string
          telegram_first_name: string | null
          telegram_username: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_reply?: string | null
          assigned_to?: string | null
          created_at?: string
          department?: string
          id?: string
          image_url?: string | null
          message: string
          priority?: string
          replied_at?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string | null
          telegram_chat_id: string
          telegram_first_name?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_reply?: string | null
          assigned_to?: string | null
          created_at?: string
          department?: string
          id?: string
          image_url?: string | null
          message?: string
          priority?: string
          replied_at?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string | null
          telegram_chat_id?: string
          telegram_first_name?: string | null
          telegram_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
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
      terms_acceptance: {
        Row: {
          accepted_at: string
          created_at: string
          id: string
          telegram_id: string
        }
        Insert: {
          accepted_at?: string
          created_at?: string
          id?: string
          telegram_id: string
        }
        Update: {
          accepted_at?: string
          created_at?: string
          id?: string
          telegram_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          delay_notified: boolean | null
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
          delay_notified?: boolean | null
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
          delay_notified?: boolean | null
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
      update_history: {
        Row: {
          applied_at: string
          applied_by: string | null
          backup_by: string | null
          backup_date: string | null
          created_at: string
          id: string
          previous_version: string | null
          results: Json
          tables_failed: number
          tables_restored: number
          tables_skipped: number
          total_records: number
          version: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          backup_by?: string | null
          backup_date?: string | null
          created_at?: string
          id?: string
          previous_version?: string | null
          results?: Json
          tables_failed?: number
          tables_restored?: number
          tables_skipped?: number
          total_records?: number
          version: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          backup_by?: string | null
          backup_date?: string | null
          created_at?: string
          id?: string
          previous_version?: string | null
          results?: Json
          tables_failed?: number
          tables_restored?: number
          tables_skipped?: number
          total_records?: number
          version?: string
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
      profiles_public: {
        Row: {
          active: boolean | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          id: string | null
          last_seen_at: string | null
          nome: string | null
          slug: string | null
          store_logo_url: string | null
          store_name: string | null
          store_primary_color: string | null
          store_secondary_color: string | null
          verification_badge: string | null
        }
        Insert: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          nome?: string | null
          slug?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          verification_badge?: string | null
        }
        Update: {
          active?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          nome?: string | null
          slug?: string | null
          store_logo_url?: string | null
          store_name?: string | null
          store_primary_color?: string | null
          store_secondary_color?: string | null
          verification_badge?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      claim_transaction: {
        Args: {
          p_from_status: string
          p_metadata?: Json
          p_to_status: string
          p_tx_id: string
        }
        Returns: boolean
      }
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      export_schema_info: { Args: never; Returns: Json }
      generate_unique_slug: {
        Args: { p_nome: string; p_user_id: string }
        Returns: string
      }
      get_chat_enabled: { Args: never; Returns: boolean }
      get_chat_new_conv_filter: { Args: never; Returns: string }
      get_deposit_fee_for_user: {
        Args: { _user_id: string }
        Returns: {
          fee_type: string
          fee_value: number
        }[]
      }
      get_follow_counts: {
        Args: { _user_id: string }
        Returns: {
          followers_count: number
          following_count: number
        }[]
      }
      get_maintenance_mode: { Args: never; Returns: boolean }
      get_network_members: {
        Args: { _filter?: string; _user_id: string }
        Returns: {
          active: boolean
          avatar_url: string
          created_at: string
          email: string
          id: string
          nome: string
          total_recargas: number
        }[]
      }
      get_network_members_v2: {
        Args: { _filter?: string; _user_id: string }
        Returns: {
          active: boolean
          avatar_url: string
          created_at: string
          direct_network: number
          direct_profit: number
          email: string
          id: string
          indirect_network: number
          indirect_profit: number
          nome: string
          role: string
          saldo_pessoal: number
          saldo_revenda: number
          total_recargas: number
        }[]
      }
      get_network_stats: { Args: { _user_id: string }; Returns: Json }
      get_notif_config: { Args: { _key: string }; Returns: string }
      get_operator_stats: { Args: never; Returns: Json }
      get_poll_vote_counts: {
        Args: { _poll_id: string }
        Returns: {
          option_index: number
          vote_count: number
        }[]
      }
      get_public_reseller_pricing: { Args: { _slug: string }; Returns: Json }
      get_public_store_by_slug: {
        Args: { _slug: string }
        Returns: {
          active: boolean
          avatar_url: string
          id: string
          nome: string
          store_logo_url: string
          store_name: string
          store_primary_color: string
          store_secondary_color: string
          verification_badge: string
        }[]
      }
      get_public_tables: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
      get_recargas_ranking: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          nome: string
          total_recargas: number
          user_id: string
          verification_badge: string
        }[]
      }
      get_require_referral_code: { Args: never; Returns: boolean }
      get_sales_tools_enabled: { Args: never; Returns: boolean }
      get_scratch_recent_winners: {
        Args: never
        Returns: {
          avatar_url: string
          card_date: string
          nome: string
          prize_amount: number
          verification_badge: string
        }[]
      }
      get_scratch_top_winners: {
        Args: never
        Returns: {
          avatar_url: string
          card_date: string
          nome: string
          prize_amount: number
          verification_badge: string
        }[]
      }
      get_seasonal_theme: { Args: never; Returns: string }
      get_ticker_recargas: {
        Args: never
        Returns: {
          created_at: string
          id: string
          operadora: string
          status: string
          telefone: string
          user_id: string
          valor: number
        }[]
      }
      get_unread_counts: {
        Args: { _conversation_ids: string[]; _user_id: string }
        Returns: {
          conversation_id: string
          unread_count: number
        }[]
      }
      get_user_by_referral_code: { Args: { _code: string }; Returns: string }
      get_user_recargas_count: { Args: { _user_id: string }; Returns: number }
      get_user_reseller_id: { Args: { _user_id: string }; Returns: string }
      get_user_verification_badge: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      has_verification_badge: { Args: { _user_id: string }; Returns: boolean }
      increment_saldo: {
        Args: { p_amount: number; p_tipo: string; p_user_id: string }
        Returns: number
      }
      is_chat_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_license_valid: { Args: never; Returns: boolean }
      sync_chat_conversation_preview: {
        Args: { _conversation_id: string }
        Returns: undefined
      }
      unaccent: { Args: { "": string }; Returns: string }
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
