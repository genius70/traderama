export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      market_data: {
        Row: {
          close_price: number | null
          created_at: string | null
          high_price: number | null
          id: string
          iv_rank: number | null
          low_price: number | null
          open_price: number | null
          symbol: string
          timestamp: string
          volume: number | null
        }
        Insert: {
          close_price?: number | null
          created_at?: string | null
          high_price?: number | null
          id?: string
          iv_rank?: number | null
          low_price?: number | null
          open_price?: number | null
          symbol: string
          timestamp: string
          volume?: number | null
        }
        Update: {
          close_price?: number | null
          created_at?: string | null
          high_price?: number | null
          id?: string
          iv_rank?: number | null
          low_price?: number | null
          open_price?: number | null
          symbol?: string
          timestamp?: string
          volume?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin_role: {
        Args: { role_to_check: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
    }
    Enums: {
      broker_name:
        | "ig"
        | "tradestation"
        | "tradier"
        | "easymarkets"
        | "tradenation"
      strategy_status: "draft" | "published" | "archived"
      subscription_tier: "free" | "premium" | "professional"
      trade_status: "pending" | "executed" | "closed" | "cancelled"
      user_role: "user" | "admin" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      strategy_status: ["draft", "published", "archived"],
      subscription_tier: ["free", "premium", "professional"],
      trade_status: ["pending", "executed", "closed", "cancelled"],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
