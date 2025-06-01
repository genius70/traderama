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
      Accounts: {
        Row: {
          attrs: Json | null
          business_type: string | null
          country: string | null
          created: string | null
          email: string | null
          id: string | null
          type: string | null
        }
        Insert: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Update: {
          attrs?: Json | null
          business_type?: string | null
          country?: string | null
          created?: string | null
          email?: string | null
          id?: string | null
          type?: string | null
        }
        Relationships: []
      }
      approved_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_method: string
          processed_at: string | null
          status: string | null
          transaction_id: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_method: string
          processed_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_method?: string
          processed_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      campaign_hashtags: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          hashtag: string
          id: string
          platform: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          hashtag: string
          id?: string
          platform: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          hashtag?: string
          id?: string
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_hashtags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_tasks: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reward_amount: number | null
          reward_currency: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reward_amount?: number | null
          reward_currency?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reward_amount?: number | null
          reward_currency?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_tasks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          circulating_supply: number | null
          created_at: string | null
          creator_id: string | null
          description: string | null
          end_date: string
          geo_restrictions: Json | null
          id: string
          image_url: string | null
          liquidity_pool_amount: number | null
          max_participants: number
          price: number | null
          reward_pool_amount: number
          social_links: Json | null
          start_date: string
          status: Database["public"]["Enums"]["task_status"] | null
          title: string | null
          token_address: string
          token_name: string
          token_symbol: string
          total_supply: number
          tvl: number | null
          website_url: string | null
        }
        Insert: {
          budget?: number | null
          circulating_supply?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_date: string
          geo_restrictions?: Json | null
          id?: string
          image_url?: string | null
          liquidity_pool_amount?: number | null
          max_participants: number
          price?: number | null
          reward_pool_amount: number
          social_links?: Json | null
          start_date: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string | null
          token_address: string
          token_name: string
          token_symbol: string
          total_supply: number
          tvl?: number | null
          website_url?: string | null
        }
        Update: {
          budget?: number | null
          circulating_supply?: number | null
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_date?: string
          geo_restrictions?: Json | null
          id?: string
          image_url?: string | null
          liquidity_pool_amount?: number | null
          max_participants?: number
          price?: number | null
          reward_pool_amount?: number
          social_links?: Json | null
          start_date?: string
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string | null
          token_address?: string
          token_name?: string
          token_symbol?: string
          total_supply?: number
          tvl?: number | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Checkout: {
        Row: {
          attrs: Json | null
          customer: string | null
          id: string | null
          payment_intent: string | null
          subscription: string | null
        }
        Insert: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Update: {
          attrs?: Json | null
          customer?: string | null
          id?: string | null
          payment_intent?: string | null
          subscription?: string | null
        }
        Relationships: []
      }
      meme_tokens: {
        Row: {
          created_at: string
          creator_id: string | null
          id: string
          is_platform_token: boolean | null
          min_liquidity: number | null
          name: string
          reward_allocation: number
          status: Database["public"]["Enums"]["token_status"] | null
          symbol: string
          token_address: string
          total_supply: number
          tvl: number | null
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          id?: string
          is_platform_token?: boolean | null
          min_liquidity?: number | null
          name: string
          reward_allocation: number
          status?: Database["public"]["Enums"]["token_status"] | null
          symbol: string
          token_address: string
          total_supply: number
          tvl?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          id?: string
          is_platform_token?: boolean | null
          min_liquidity?: number | null
          name?: string
          reward_allocation?: number
          status?: Database["public"]["Enums"]["token_status"] | null
          symbol?: string
          token_address?: string
          total_supply?: number
          tvl?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meme_tokens_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_payments: {
        Row: {
          amount: number
          campaign: string
          created_at: string | null
          id: string
          status: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          amount: number
          campaign: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          amount?: number
          campaign?: string
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      platform_hashtags: {
        Row: {
          campaign_id: string | null
          created_at: string
          end_time: string
          id: string
          start_time: string
          text: string
          token_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          end_time: string
          id?: string
          start_time: string
          text: string
          token_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          end_time?: string
          id?: string
          start_time?: string
          text?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_hashtags_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_hashtags_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "meme_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          bonus_reward_rate: number | null
          created_at: string | null
          id: string
          minimum_balance: number | null
          required_posts_per_task: number | null
          task_window_hours: number | null
          updated_at: string | null
        }
        Insert: {
          bonus_reward_rate?: number | null
          created_at?: string | null
          id?: string
          minimum_balance?: number | null
          required_posts_per_task?: number | null
          task_window_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          bonus_reward_rate?: number | null
          created_at?: string | null
          id?: string
          minimum_balance?: number | null
          required_posts_per_task?: number | null
          task_window_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string
          geolocation: Json | null
          github_username: string | null
          id: string
          ip_address: string | null
          kyc_status: boolean | null
          last_activity: string | null
          metamask_address: string | null
          payment_options: Json | null
          role: Database["public"]["Enums"]["app_role"] | null
          social_links: Json | null
          total_rewards: number | null
          total_tasks_completed: number | null
          username: string | null
          wallet_address: string | null
          wallet_type: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          geolocation?: Json | null
          github_username?: string | null
          id: string
          ip_address?: string | null
          kyc_status?: boolean | null
          last_activity?: string | null
          metamask_address?: string | null
          payment_options?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          social_links?: Json | null
          total_rewards?: number | null
          total_tasks_completed?: number | null
          username?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          geolocation?: Json | null
          github_username?: string | null
          id?: string
          ip_address?: string | null
          kyc_status?: boolean | null
          last_activity?: string | null
          metamask_address?: string | null
          payment_options?: Json | null
          role?: Database["public"]["Enums"]["app_role"] | null
          social_links?: Json | null
          total_rewards?: number | null
          total_tasks_completed?: number | null
          username?: string | null
          wallet_address?: string | null
          wallet_type?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      reward_distributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string | null
          token_id: string | null
          transaction_hash: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string | null
          token_id?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string | null
          token_id?: string | null
          transaction_hash?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reward_distributions_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "meme_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_distributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string | null
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
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
        ]
      }
      supported_tokens: {
        Row: {
          address: string
          created_at: string
          decimals: number
          is_active: boolean | null
          name: string
          symbol: string
        }
        Insert: {
          address: string
          created_at?: string
          decimals?: number
          is_active?: boolean | null
          name: string
          symbol: string
        }
        Update: {
          address?: string
          created_at?: string
          decimals?: number
          is_active?: boolean | null
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      token_requirements: {
        Row: {
          hashtag_id: string
          min_balance: number
          token_address: string
          usd_threshold: number
        }
        Insert: {
          hashtag_id: string
          min_balance: number
          token_address: string
          usd_threshold: number
        }
        Update: {
          hashtag_id?: string
          min_balance?: number
          token_address?: string
          usd_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_requirements_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "platform_hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "token_requirements_token_address_fkey"
            columns: ["token_address"]
            isOneToOne: false
            referencedRelation: "supported_tokens"
            referencedColumns: ["address"]
          },
        ]
      }
      Transactions: {
        Row: {
          amount: number | null
          arrival_date: string | null
          attrs: Json | null
          created: string | null
          currency: string | null
          description: string | null
          id: string | null
          statement_descriptor: string | null
          status: string | null
        }
        Insert: {
          amount?: number | null
          arrival_date?: string | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          statement_descriptor?: string | null
          status?: string | null
        }
        Update: {
          amount?: number | null
          arrival_date?: string | null
          attrs?: Json | null
          created?: string | null
          currency?: string | null
          description?: string | null
          id?: string | null
          statement_descriptor?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          content_type: string
          created_at: string
          hashtag_id: string | null
          id: string
          platform: string
          post_url: string
          status: Database["public"]["Enums"]["activity_status"] | null
          user_id: string | null
          verification_time: string | null
        }
        Insert: {
          content_type: string
          created_at?: string
          hashtag_id?: string | null
          id?: string
          platform: string
          post_url: string
          status?: Database["public"]["Enums"]["activity_status"] | null
          user_id?: string | null
          verification_time?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          hashtag_id?: string | null
          id?: string
          platform?: string
          post_url?: string
          status?: Database["public"]["Enums"]["activity_status"] | null
          user_id?: string | null
          verification_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "platform_hashtags"
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
      user_analytics: {
        Row: {
          action: string
          component: string | null
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          page_path: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          component?: string | null
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          component?: string | null
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          page_path?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_notification_settings: {
        Row: {
          campaign_updates: boolean | null
          email_notifications: boolean | null
          marketing_emails: boolean | null
          role_changes: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          campaign_updates?: boolean | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          role_changes?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          campaign_updates?: boolean | null
          email_notifications?: boolean | null
          marketing_emails?: boolean | null
          role_changes?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_submissions: {
        Row: {
          campaign_id: string | null
          comments: string | null
          hashtag_used: string
          id: string
          platform: string
          post_url: string
          proof_data: Json | null
          proof_url: string | null
          reward_amount: number | null
          submission_date: string | null
          task_id: string | null
          user_id: string | null
          verification_status: Database["public"]["Enums"]["task_status"] | null
        }
        Insert: {
          campaign_id?: string | null
          comments?: string | null
          hashtag_used: string
          id?: string
          platform: string
          post_url: string
          proof_data?: Json | null
          proof_url?: string | null
          reward_amount?: number | null
          submission_date?: string | null
          task_id?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["task_status"]
            | null
        }
        Update: {
          campaign_id?: string | null
          comments?: string | null
          hashtag_used?: string
          id?: string
          platform?: string
          post_url?: string
          proof_data?: Json | null
          proof_url?: string | null
          reward_amount?: number | null
          submission_date?: string | null
          task_id?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["task_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "user_submissions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "campaign_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_token_balances: {
        Row: {
          balance: number
          id: string
          last_updated: string
          token_id: string | null
          user_id: string | null
        }
        Insert: {
          balance: number
          id?: string
          last_updated?: string
          token_id?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number
          id?: string
          last_updated?: string
          token_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_token_balances_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "meme_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_token_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      daily_analytics_summary: {
        Row: {
          action: string | null
          day: string | null
          event_count: number | null
          event_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_submission_reward: {
        Args: {
          submission_count: number
          pool_amount: number
          max_submissions: number
        }
        Returns: number
      }
      calculate_user_rewards: {
        Args: { user_id: string; token_id: string }
        Returns: number
      }
      check_user_activity_eligibility: {
        Args: { user_id: string; period_minutes?: number }
        Returns: boolean
      }
      check_user_submission_limit: {
        Args: { _user_id: string; _campaign_id: string; _hours_window?: number }
        Returns: boolean
      }
      send_notification: {
        Args: {
          p_title: string
          p_message: string
          p_type: string
          p_user_ids: string[]
          p_created_by: string
        }
        Returns: string[]
      }
    }
    Enums: {
      activity_status: "pending" | "verified" | "rejected"
      app_role: "admin" | "user" | "token_creator"
      task_status: "pending" | "active" | "completed" | "expired" | "draft"
      token_status: "pending" | "active" | "rejected"
      user_role: "admin" | "creator" | "user"
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
      activity_status: ["pending", "verified", "rejected"],
      app_role: ["admin", "user", "token_creator"],
      task_status: ["pending", "active", "completed", "expired", "draft"],
      token_status: ["pending", "active", "rejected"],
      user_role: ["admin", "creator", "user"],
    },
  },
} as const
