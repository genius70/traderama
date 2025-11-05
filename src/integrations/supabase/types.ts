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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      action_rewards: {
        Row: {
          action: string
          cooldown_minutes: number | null
          credits: number
          daily_limit: number | null
          description: string | null
        }
        Insert: {
          action: string
          cooldown_minutes?: number | null
          credits: number
          daily_limit?: number | null
          description?: string | null
        }
        Update: {
          action?: string
          cooldown_minutes?: number | null
          credits?: number
          daily_limit?: number | null
          description?: string | null
        }
        Relationships: []
      }
      airdrop_milestones: {
        Row: {
          created_at: string
          id: string
          kem_bonus: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          kem_bonus?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          kem_bonus?: number
          name?: string
        }
        Relationships: []
      }
      airdrops: {
        Row: {
          created_at: string | null
          credits_used: number
          ethereum_wallet: string
          id: string
          kem_amount: number
          processed_at: string | null
          status: string | null
          transaction_hash: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_used: number
          ethereum_wallet: string
          id?: string
          kem_amount: number
          processed_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_used?: number
          ethereum_wallet?: string
          id?: string
          kem_amount?: number
          processed_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "airdrops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          created_at: string | null
          id: string
          success_rate: number | null
          total_trades: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          success_rate?: number | null
          total_trades?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          success_rate?: number | null
          total_trades?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auto_trading_settings: {
        Row: {
          allowed_strategies: string[] | null
          created_at: string
          enabled: boolean
          id: string
          max_daily_trades: number
          max_position_size: number
          risk_percentage: number
          stop_loss_percentage: number | null
          take_profit_percentage: number | null
          timezone: string | null
          trading_hours_end: string | null
          trading_hours_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_strategies?: string[] | null
          created_at?: string
          enabled?: boolean
          id?: string
          max_daily_trades?: number
          max_position_size?: number
          risk_percentage?: number
          stop_loss_percentage?: number | null
          take_profit_percentage?: number | null
          timezone?: string | null
          trading_hours_end?: string | null
          trading_hours_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_strategies?: string[] | null
          created_at?: string
          enabled?: boolean
          id?: string
          max_daily_trades?: number
          max_position_size?: number
          risk_percentage?: number
          stop_loss_percentage?: number | null
          take_profit_percentage?: number | null
          timezone?: string | null
          trading_hours_end?: string | null
          trading_hours_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_connections: {
        Row: {
          account_id: string
          api_credentials: Json | null
          broker: Database["public"]["Enums"]["broker_name"]
          connected_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          account_id: string
          api_credentials?: Json | null
          broker: Database["public"]["Enums"]["broker_name"]
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          account_id?: string
          api_credentials?: Json | null
          broker?: Database["public"]["Enums"]["broker_name"]
          connected_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_sync_logs: {
        Row: {
          broker_connection_id: string | null
          created_at: string
          error_message: string | null
          id: string
          records_synced: number | null
          status: string
          sync_duration_ms: number | null
          sync_type: string
          user_id: string
        }
        Insert: {
          broker_connection_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          status: string
          sync_duration_ms?: number | null
          sync_type: string
          user_id: string
        }
        Update: {
          broker_connection_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          status?: string
          sync_duration_ms?: number | null
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_sync_logs_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "ig_broker_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          bounced_count: number
          clicked_count: number
          created_at: string
          failed_count: number
          id: string
          message: string
          opened_count: number
          scheduled_at: string | null
          sender_id: string | null
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          total_recipients: number
          updated_at: string
        }
        Insert: {
          bounced_count?: number
          clicked_count?: number
          created_at?: string
          failed_count?: number
          id?: string
          message: string
          opened_count?: number
          scheduled_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject: string
          total_recipients?: number
          updated_at?: string
        }
        Update: {
          bounced_count?: number
          clicked_count?: number
          created_at?: string
          failed_count?: number
          id?: string
          message?: string
          opened_count?: number
          scheduled_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string
          total_recipients?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_tracking: {
        Row: {
          bounced_at: string | null
          campaign_id: string | null
          click_count: number
          clicked_at: string | null
          created_at: string
          email: string
          error_message: string | null
          id: string
          open_count: number
          opened_at: string | null
          sent_at: string | null
          status: string
          tracking_token: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number
          clicked_at?: string | null
          created_at?: string
          email: string
          error_message?: string | null
          id?: string
          open_count?: number
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          tracking_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bounced_at?: string | null
          campaign_id?: string | null
          click_count?: number
          clicked_at?: string | null
          created_at?: string
          email?: string
          error_message?: string | null
          id?: string
          open_count?: number
          opened_at?: string | null
          sent_at?: string | null
          status?: string
          tracking_token?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_tracking_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string | null
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          page_path: string | null
          resolved: boolean | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          page_path?: string | null
          resolved?: boolean | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          page_path?: string | null
          resolved?: boolean | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          account_number: string
          balance: number | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number: string
          balance?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string
          balance?: number | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          created_at: string | null
          feature_name: string
          first_used_at: string | null
          id: string
          last_used_at: string | null
          success_rate: number | null
          total_time_spent: number | null
          updated_at: string | null
          usage_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_name: string
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          success_rate?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_name?: string
          first_used_at?: string | null
          id?: string
          last_used_at?: string | null
          success_rate?: number | null
          total_time_spent?: number | null
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          group_id: string | null
          id: string
          joined_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "trading_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          group_id: string | null
          id: string
          likes_count: number | null
          pinned: boolean | null
          post_type: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          likes_count?: number | null
          pinned?: boolean | null
          post_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          group_id?: string | null
          id?: string
          likes_count?: number | null
          pinned?: boolean | null
          post_type?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "trading_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ig_broker_connections: {
        Row: {
          account_id: string
          api_key_encrypted: string
          created_at: string
          id: string
          is_active: boolean | null
          last_connected_at: string | null
          password_encrypted: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          account_id: string
          api_key_encrypted: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_connected_at?: string | null
          password_encrypted: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          account_id?: string
          api_key_encrypted?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_connected_at?: string | null
          password_encrypted?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      iron_condor_trades: {
        Row: {
          broker_connection_id: string | null
          call_spread_long_strike: number
          call_spread_short_strike: number
          closed_at: string | null
          contracts: number
          current_pnl: number | null
          entry_price: number | null
          exit_price: number | null
          expiration_date: string
          id: string
          max_loss: number | null
          max_profit: number | null
          notes: string | null
          opened_at: string | null
          put_spread_long_strike: number
          put_spread_short_strike: number
          status: Database["public"]["Enums"]["trade_status"] | null
          strategy_id: string | null
          symbol: string
          user_id: string
        }
        Insert: {
          broker_connection_id?: string | null
          call_spread_long_strike: number
          call_spread_short_strike: number
          closed_at?: string | null
          contracts: number
          current_pnl?: number | null
          entry_price?: number | null
          exit_price?: number | null
          expiration_date: string
          id?: string
          max_loss?: number | null
          max_profit?: number | null
          notes?: string | null
          opened_at?: string | null
          put_spread_long_strike: number
          put_spread_short_strike: number
          status?: Database["public"]["Enums"]["trade_status"] | null
          strategy_id?: string | null
          symbol: string
          user_id: string
        }
        Update: {
          broker_connection_id?: string | null
          call_spread_long_strike?: number
          call_spread_short_strike?: number
          closed_at?: string | null
          contracts?: number
          current_pnl?: number | null
          entry_price?: number | null
          exit_price?: number | null
          expiration_date?: string
          id?: string
          max_loss?: number | null
          max_profit?: number | null
          notes?: string | null
          opened_at?: string | null
          put_spread_long_strike?: number
          put_spread_short_strike?: number
          status?: Database["public"]["Enums"]["trade_status"] | null
          strategy_id?: string | null
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "iron_condor_trades_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "broker_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iron_condor_trades_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iron_condor_trades_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kem_credits: {
        Row: {
          created_at: string | null
          credits_earned: number | null
          credits_spent: number | null
          id: string
          total_airdrops_received: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_earned?: number | null
          credits_spent?: number | null
          id?: string
          total_airdrops_received?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_earned?: number | null
          credits_spent?: number | null
          id?: string
          total_airdrops_received?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kem_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_market_data: {
        Row: {
          ask: number | null
          bid: number | null
          change_percent: number | null
          id: string
          iv_rank: number | null
          price: number
          source: string
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          change_percent?: number | null
          id?: string
          iv_rank?: number | null
          price: number
          source?: string
          symbol: string
          timestamp?: string
          volume?: number | null
        }
        Update: {
          ask?: number | null
          bid?: number | null
          change_percent?: number | null
          id?: string
          iv_rank?: number | null
          price?: number
          source?: string
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      live_positions: {
        Row: {
          broker_connection_id: string | null
          broker_position_id: string | null
          closed_at: string | null
          contracts: number
          created_at: string
          current_value: number
          direction: string
          expiry_date: string | null
          greeks: Json | null
          id: string
          opened_at: string
          position_type: string
          premium_paid: number
          status: Database["public"]["Enums"]["trade_status"]
          strike_price: number | null
          symbol: string
          unrealized_pnl: number
          updated_at: string
          user_id: string
        }
        Insert: {
          broker_connection_id?: string | null
          broker_position_id?: string | null
          closed_at?: string | null
          contracts?: number
          created_at?: string
          current_value?: number
          direction: string
          expiry_date?: string | null
          greeks?: Json | null
          id?: string
          opened_at?: string
          position_type: string
          premium_paid?: number
          status?: Database["public"]["Enums"]["trade_status"]
          strike_price?: number | null
          symbol: string
          unrealized_pnl?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          broker_connection_id?: string | null
          broker_position_id?: string | null
          closed_at?: string | null
          contracts?: number
          created_at?: string
          current_value?: number
          direction?: string
          expiry_date?: string | null
          greeks?: Json | null
          id?: string
          opened_at?: string
          position_type?: string
          premium_paid?: number
          status?: Database["public"]["Enums"]["trade_status"]
          strike_price?: number | null
          symbol?: string
          unrealized_pnl?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_positions_broker_connection_id_fkey"
            columns: ["broker_connection_id"]
            isOneToOne: false
            referencedRelation: "ig_broker_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      market_data: {
        Row: {
          ask: number | null
          bid: number | null
          change_percent: number | null
          close_price: number | null
          created_at: string | null
          high_price: number | null
          id: string
          iv_rank: number | null
          low_price: number | null
          market_cap: number | null
          open_price: number | null
          price: number | null
          symbol: string | null
          ticker: string | null
          timestamp: string
          volume: number | null
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          change_percent?: number | null
          close_price?: number | null
          created_at?: string | null
          high_price?: number | null
          id?: string
          iv_rank?: number | null
          low_price?: number | null
          market_cap?: number | null
          open_price?: number | null
          price?: number | null
          symbol?: string | null
          ticker?: string | null
          timestamp: string
          volume?: number | null
        }
        Update: {
          ask?: number | null
          bid?: number | null
          change_percent?: number | null
          close_price?: number | null
          created_at?: string | null
          high_price?: number | null
          id?: string
          iv_rank?: number | null
          low_price?: number | null
          market_cap?: number | null
          open_price?: number | null
          price?: number | null
          symbol?: string | null
          ticker?: string | null
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          created_at: string | null
          delivery_method: string
          error: string | null
          id: string
          message: string
          sent_at: string | null
          status: string
          subject: string
          super_admin_id: string | null
          updated_at: string | null
          user_ids: string[]
        }
        Insert: {
          created_at?: string | null
          delivery_method: string
          error?: string | null
          id?: string
          message: string
          sent_at?: string | null
          status: string
          subject: string
          super_admin_id?: string | null
          updated_at?: string | null
          user_ids: string[]
        }
        Update: {
          created_at?: string | null
          delivery_method?: string
          error?: string | null
          id?: string
          message?: string
          sent_at?: string | null
          status?: string
          subject?: string
          super_admin_id?: string | null
          updated_at?: string | null
          user_ids?: string[]
        }
        Relationships: []
      }
      notification_recipients: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          id: string
          notification_id: string | null
          read_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_recipients_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string
          cost: number | null
          created_at: string | null
          id: string
          notification_type: string
          scheduled_at: string | null
          sender_id: string | null
          sent_at: string | null
          status: string | null
          target_audience: Json | null
          title: string
        }
        Insert: {
          content: string
          cost?: number | null
          created_at?: string | null
          id?: string
          notification_type: string
          scheduled_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          target_audience?: Json | null
          title: string
        }
        Update: {
          content?: string
          cost?: number | null
          created_at?: string | null
          id?: string
          notification_type?: string
          scheduled_at?: string | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          target_audience?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          browser_type: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: unknown
          page_path: string
          page_title: string | null
          referrer_url: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser_type?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
          page_path: string
          page_title?: string | null
          referrer_url?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser_type?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
          page_path?: string
          page_title?: string | null
          referrer_url?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_analytics: {
        Row: {
          active_users: number | null
          avg_session_duration: number | null
          bounce_rate: number | null
          conversion_rate: number | null
          created_at: string | null
          date: string
          error_rate: number | null
          feature_adoption_rate: number | null
          id: string
          new_signups: number | null
          new_strategies: number | null
          new_trades: number | null
          page_views_total: number | null
          revenue: number | null
          total_strategies: number | null
          total_trades: number | null
          total_users: number | null
          total_volume: number | null
          unique_page_views: number | null
        }
        Insert: {
          active_users?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date: string
          error_rate?: number | null
          feature_adoption_rate?: number | null
          id?: string
          new_signups?: number | null
          new_strategies?: number | null
          new_trades?: number | null
          page_views_total?: number | null
          revenue?: number | null
          total_strategies?: number | null
          total_trades?: number | null
          total_users?: number | null
          total_volume?: number | null
          unique_page_views?: number | null
        }
        Update: {
          active_users?: number | null
          avg_session_duration?: number | null
          bounce_rate?: number | null
          conversion_rate?: number | null
          created_at?: string | null
          date?: string
          error_rate?: number | null
          feature_adoption_rate?: number | null
          id?: string
          new_signups?: number | null
          new_strategies?: number | null
          new_trades?: number | null
          page_views_total?: number | null
          revenue?: number | null
          total_strategies?: number | null
          total_trades?: number | null
          total_users?: number | null
          total_volume?: number | null
          unique_page_views?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          images: string[] | null
          is_public: boolean | null
          likes_count: number | null
          post_type: string | null
          shares_count: number | null
          strategy_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_public?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          shares_count?: number | null
          strategy_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          images?: string[] | null
          is_public?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          shares_count?: number | null
          strategy_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          ask: number | null
          bid: number | null
          created_at: string
          date: string
          high_price: number | null
          id: string
          iv: number | null
          low_price: number | null
          lowerbb: number | null
          macd: number | null
          open_price: number | null
          price: number
          rsi: number | null
          signal: number | null
          sma20: number | null
          source: string | null
          symbol: string
          timestamp: string
          upperbb: number | null
          volume: number | null
        }
        Insert: {
          ask?: number | null
          bid?: number | null
          created_at?: string
          date: string
          high_price?: number | null
          id?: string
          iv?: number | null
          low_price?: number | null
          lowerbb?: number | null
          macd?: number | null
          open_price?: number | null
          price: number
          rsi?: number | null
          signal?: number | null
          sma20?: number | null
          source?: string | null
          symbol: string
          timestamp?: string
          upperbb?: number | null
          volume?: number | null
        }
        Update: {
          ask?: number | null
          bid?: number | null
          created_at?: string
          date?: string
          high_price?: number | null
          id?: string
          iv?: number | null
          low_price?: number | null
          lowerbb?: number | null
          macd?: number | null
          open_price?: number | null
          price?: number
          rsi?: number | null
          signal?: number | null
          sma20?: number | null
          source?: string | null
          symbol?: string
          timestamp?: string
          upperbb?: number | null
          volume?: number | null
        }
        Relationships: []
      }
      profile_access_logs: {
        Row: {
          access_type: string
          accessed_fields: string[] | null
          accessed_profile_id: string
          accessor_user_id: string
          created_at: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_fields?: string[] | null
          accessed_profile_id: string
          accessor_user_id: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_fields?: string[] | null
          accessed_profile_id?: string
          accessor_user_id?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_access_logs_accessed_profile_id_fkey"
            columns: ["accessed_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          airtm_email: string | null
          airtm_username: string | null
          annual_income_range: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_image_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          employer: string | null
          ethereum_wallet: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          identification_expiry: string | null
          identification_number: string | null
          identification_type: string | null
          is_premium: boolean | null
          kyc_approved_at: string | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          linkedin_url: string | null
          location: string | null
          name: string | null
          nationality: string | null
          occupation: string | null
          phone_number: string | null
          postal_code: string | null
          profile_completed_at: string | null
          profile_completion_percentage: number | null
          profile_image_url: string | null
          referral_code: string | null
          referred_by: string | null
          risk_tolerance: string | null
          role: Database["public"]["Enums"]["user_role"]
          source_of_funds: string | null
          specialties: string[] | null
          state_province: string | null
          stripe_account_id: string | null
          stripe_customer_id: string | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trading_experience: string | null
          updated_at: string
          username: string | null
          website_url: string | null
          whatsapp_number: string | null
          wise_account_id: string | null
          wise_email: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          airtm_email?: string | null
          airtm_username?: string | null
          annual_income_range?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          employer?: string | null
          ethereum_wallet?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          identification_expiry?: string | null
          identification_number?: string | null
          identification_type?: string | null
          is_premium?: boolean | null
          kyc_approved_at?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          nationality?: string | null
          occupation?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_completed_at?: string | null
          profile_completion_percentage?: number | null
          profile_image_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          risk_tolerance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          source_of_funds?: string | null
          specialties?: string[] | null
          state_province?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trading_experience?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
          wise_account_id?: string | null
          wise_email?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          airtm_email?: string | null
          airtm_username?: string | null
          annual_income_range?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_image_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          employer?: string | null
          ethereum_wallet?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          identification_expiry?: string | null
          identification_number?: string | null
          identification_type?: string | null
          is_premium?: boolean | null
          kyc_approved_at?: string | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          nationality?: string | null
          occupation?: string | null
          phone_number?: string | null
          postal_code?: string | null
          profile_completed_at?: string | null
          profile_completion_percentage?: number | null
          profile_image_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          risk_tolerance?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          source_of_funds?: string | null
          specialties?: string[] | null
          state_province?: string | null
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          trading_experience?: string | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
          wise_account_id?: string | null
          wise_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["referral_code"]
          },
        ]
      }
      reward_distributions: {
        Row: {
          admin_id: string
          amount_per_user: number
          created_at: string
          description: string | null
          id: string
          processed_at: string | null
          reward_type: string
          status: string | null
          total_amount: number
          updated_at: string
          user_ids: string[]
        }
        Insert: {
          admin_id: string
          amount_per_user: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          reward_type: string
          status?: string | null
          total_amount: number
          updated_at?: string
          user_ids: string[]
        }
        Update: {
          admin_id?: string
          amount_per_user?: number
          created_at?: string
          description?: string | null
          id?: string
          processed_at?: string | null
          reward_type?: string
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_ids?: string[]
        }
        Relationships: []
      }
      royalty_payments: {
        Row: {
          created_at: string | null
          creator_id: string | null
          creator_royalty_amount: number
          id: string
          platform_fee_amount: number
          profit_amount: number
          strategy_id: string | null
          trade_id: string | null
          user_strategy_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          creator_royalty_amount: number
          id?: string
          platform_fee_amount: number
          profit_amount: number
          strategy_id?: string | null
          trade_id?: string | null
          user_strategy_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          creator_royalty_amount?: number
          id?: string
          platform_fee_amount?: number
          profit_amount?: number
          strategy_id?: string | null
          trade_id?: string | null
          user_strategy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "royalty_payments_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "royalty_payments_user_strategy_id_fkey"
            columns: ["user_strategy_id"]
            isOneToOne: false
            referencedRelation: "user_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_email_lists: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          user_ids: string[]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          user_ids: string[]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          user_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "saved_email_lists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_messages: {
        Row: {
          created_at: string | null
          delivery_method: string
          id: string
          message: string
          scheduled_at: string
          status: string
          subject: string
          super_admin_id: string | null
          updated_at: string | null
          user_ids: string[]
        }
        Insert: {
          created_at?: string | null
          delivery_method: string
          id?: string
          message: string
          scheduled_at: string
          status: string
          subject: string
          super_admin_id?: string | null
          updated_at?: string | null
          user_ids: string[]
        }
        Update: {
          created_at?: string | null
          delivery_method?: string
          id?: string
          message?: string
          scheduled_at?: string
          status?: string
          subject?: string
          super_admin_id?: string | null
          updated_at?: string | null
          user_ids?: string[]
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          linkedin_url: string | null
          location: string | null
          profile_image_url: string | null
          specialties: string[] | null
          total_profit: number | null
          total_strategies: number | null
          trading_experience: number | null
          twitter_handle: string | null
          updated_at: string | null
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          profile_image_url?: string | null
          specialties?: string[] | null
          total_profit?: number | null
          total_strategies?: number | null
          trading_experience?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          profile_image_url?: string | null
          specialties?: string[] | null
          total_profit?: number | null
          total_strategies?: number | null
          trading_experience?: number | null
          twitter_handle?: string | null
          updated_at?: string | null
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_signals: {
        Row: {
          confidence_score: number | null
          executed_at: string | null
          expiry_date: string | null
          generated_at: string
          id: string
          market_conditions: Json | null
          option_type: string | null
          signal_type: string
          status: string
          strategy_id: string
          strike_price: number | null
          symbol: string
        }
        Insert: {
          confidence_score?: number | null
          executed_at?: string | null
          expiry_date?: string | null
          generated_at?: string
          id?: string
          market_conditions?: Json | null
          option_type?: string | null
          signal_type: string
          status?: string
          strategy_id: string
          strike_price?: number | null
          symbol: string
        }
        Update: {
          confidence_score?: number | null
          executed_at?: string | null
          expiry_date?: string | null
          generated_at?: string
          id?: string
          market_conditions?: Json | null
          option_type?: string | null
          signal_type?: string
          status?: string
          strategy_id?: string
          strike_price?: number | null
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_signals_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_subscriptions: {
        Row: {
          fees_paid: number | null
          id: string
          purchased_at: string | null
          strategy_id: string
          total_profit: number | null
          user_id: string
        }
        Insert: {
          fees_paid?: number | null
          id?: string
          purchased_at?: string | null
          strategy_id: string
          total_profit?: number | null
          user_id: string
        }
        Update: {
          fees_paid?: number | null
          id?: string
          purchased_at?: string | null
          strategy_id?: string
          total_profit?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_subscriptions_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          expires_at: string | null
          id: string
          payment_method: string
          plan_type: string
          started_at: string | null
          status: string | null
          stripe_subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method: string
          plan_type?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string
          plan_type?: string
          started_at?: string | null
          status?: string | null
          stripe_subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          profit_loss: number | null
          status: string
          strategy_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          profit_loss?: number | null
          status?: string
          strategy_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          profit_loss?: number | null
          status?: string
          strategy_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trading_fees: {
        Row: {
          copy_trader_id: string | null
          created_at: string | null
          creator_fee_amount: number
          creator_fee_percentage: number
          id: string
          processed_at: string | null
          status: string | null
          strategy_creator_id: string | null
          trade_amount: number
          trade_id: string | null
          traderama_fee_amount: number
          traderama_fee_percentage: number | null
        }
        Insert: {
          copy_trader_id?: string | null
          created_at?: string | null
          creator_fee_amount: number
          creator_fee_percentage: number
          id?: string
          processed_at?: string | null
          status?: string | null
          strategy_creator_id?: string | null
          trade_amount: number
          trade_id?: string | null
          traderama_fee_amount: number
          traderama_fee_percentage?: number | null
        }
        Update: {
          copy_trader_id?: string | null
          created_at?: string | null
          creator_fee_amount?: number
          creator_fee_percentage?: number
          id?: string
          processed_at?: string | null
          status?: string | null
          strategy_creator_id?: string | null
          trade_amount?: number
          trade_id?: string | null
          traderama_fee_amount?: number
          traderama_fee_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_fees_copy_trader_id_fkey"
            columns: ["copy_trader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_fees_strategy_creator_id_fkey"
            columns: ["strategy_creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_fees_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "iron_condor_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_groups: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          group_type: string | null
          id: string
          max_members: number | null
          members_count: number | null
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          max_members?: number | null
          members_count?: number | null
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          max_members?: number | null
          members_count?: number | null
          name?: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_strategies: {
        Row: {
          created_at: string | null
          creator_id: string
          description: string | null
          fee_percentage: number | null
          id: string
          is_premium_only: boolean | null
          performance_metrics: Json | null
          status: Database["public"]["Enums"]["strategy_status"] | null
          strategy_config: Json
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id: string
          description?: string | null
          fee_percentage?: number | null
          id?: string
          is_premium_only?: boolean | null
          performance_metrics?: Json | null
          status?: Database["public"]["Enums"]["strategy_status"] | null
          strategy_config: Json
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string
          description?: string | null
          fee_percentage?: number | null
          id?: string
          is_premium_only?: boolean | null
          performance_metrics?: Json | null
          status?: Database["public"]["Enums"]["strategy_status"] | null
          strategy_config?: Json
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trading_strategies_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action: string
          credits: number
          id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          credits: number
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          credits?: number
          id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_type: string
          browser_type: string | null
          created_at: string | null
          credits_awarded: number | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: unknown
          page_url: string | null
          referred_by: string | null
          referrer_url: string | null
          session_id: string | null
          target_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          browser_type?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referred_by?: string | null
          referrer_url?: string | null
          session_id?: string | null
          target_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          browser_type?: string | null
          created_at?: string | null
          credits_awarded?: number | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          referred_by?: string | null
          referrer_url?: string | null
          session_id?: string | null
          target_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          min_balance_kem: number | null
          min_balance_usd: number | null
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          min_balance_kem?: number | null
          min_balance_usd?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          min_balance_kem?: number | null
          min_balance_usd?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_cycle_history: {
        Row: {
          bonus_rewards_kem: number | null
          claim_timestamp: string | null
          claimed: boolean | null
          credit_rewards_kem: number | null
          cycles_completed: number | null
          id: string
          period_end: string | null
          period_start: string | null
          total_credits: number | null
          user_id: string | null
        }
        Insert: {
          bonus_rewards_kem?: number | null
          claim_timestamp?: string | null
          claimed?: boolean | null
          credit_rewards_kem?: number | null
          cycles_completed?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          total_credits?: number | null
          user_id?: string | null
        }
        Update: {
          bonus_rewards_kem?: number | null
          claim_timestamp?: string | null
          claimed?: boolean | null
          credit_rewards_kem?: number | null
          cycles_completed?: number | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          total_credits?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          action_type: string
          created_at: string | null
          element_id: string | null
          element_type: string | null
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          element_id?: string | null
          element_type?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          element_id?: string | null
          element_type?: string | null
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_engagement_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          achieved_at: string
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "airdrop_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_milestones_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          claimed_at: string | null
          created_at: string
          description: string | null
          earned_at: string | null
          expires_at: string | null
          id: string
          reward_amount: number
          reward_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          reward_amount?: number
          reward_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          description?: string | null
          earned_at?: string | null
          expires_at?: string | null
          id?: string
          reward_amount?: number
          reward_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          actions_count: number | null
          browser_type: string | null
          created_at: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          ip_address: unknown
          pages_visited: number | null
          session_id: string
          started_at: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          actions_count?: number | null
          browser_type?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          pages_visited?: number | null
          session_id: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          actions_count?: number | null
          browser_type?: string | null
          created_at?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          pages_visited?: number | null
          session_id?: string
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          notifications_enabled: boolean | null
          privacy_level: string | null
          theme_preference: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          privacy_level?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          notifications_enabled?: boolean | null
          privacy_level?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_strategies: {
        Row: {
          copied_from: string | null
          created_at: string | null
          id: string
          platform_fee_percentage: number
          royalty_percentage: number
          status: string | null
          strategy_id: string | null
          user_id: string | null
        }
        Insert: {
          copied_from?: string | null
          created_at?: string | null
          id?: string
          platform_fee_percentage?: number
          royalty_percentage: number
          status?: string | null
          strategy_id?: string | null
          user_id?: string | null
        }
        Update: {
          copied_from?: string | null
          created_at?: string | null
          id?: string
          platform_fee_percentage?: number
          royalty_percentage?: number
          status?: string | null
          strategy_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_strategies_copied_from_fkey"
            columns: ["copied_from"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_strategies_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "trading_strategies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      batch_import_contacts: {
        Args: { p_contacts: Json; p_user_id: string }
        Returns: number
      }
      calculate_profile_completion: {
        Args: {
          profile_record: Database["public"]["Tables"]["profiles"]["Row"]
        }
        Returns: number
      }
      calculate_user_reward_points: {
        Args: { p_user_id: string }
        Returns: number
      }
      cleanup_expired_rewards: { Args: never; Returns: number }
      distribute_rewards: {
        Args: {
          p_admin_id: string
          p_amount_per_user: number
          p_description?: string
          p_reward_type: string
          p_user_ids: string[]
        }
        Returns: string
      }
      end_user_session: { Args: { p_session_id: string }; Returns: undefined }
      generate_referral_code: {
        Args: { p_date_of_birth: string; p_username: string }
        Returns: string
      }
      get_user_contact_stats: { Args: { p_user_id: string }; Returns: Json }
      get_user_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_role: {
        Args: { role_to_check: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      process_pending_rewards: { Args: never; Returns: number }
      update_feature_usage: {
        Args: {
          p_feature_name: string
          p_success?: boolean
          p_time_spent?: number
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      broker_name:
        | "ig"
        | "tradestation"
        | "tradier"
        | "easymarkets"
        | "tradenation"
      broker_type: "ig" | "alpaca" | "interactive_brokers" | "td_ameritrade"
      strategy_status:
        | "draft"
        | "published"
        | "archived"
        | "pending_review"
        | "rejected"
        | "changes_requested"
      subscription_tier: "free" | "premium" | "professional"
      trade_status: "pending" | "executed" | "closed" | "cancelled"
      user_role: "user" | "admin" | "super_admin"
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
      broker_name: [
        "ig",
        "tradestation",
        "tradier",
        "easymarkets",
        "tradenation",
      ],
      broker_type: ["ig", "alpaca", "interactive_brokers", "td_ameritrade"],
      strategy_status: [
        "draft",
        "published",
        "archived",
        "pending_review",
        "rejected",
        "changes_requested",
      ],
      subscription_tier: ["free", "premium", "professional"],
      trade_status: ["pending", "executed", "closed", "cancelled"],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
