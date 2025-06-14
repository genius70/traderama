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
      platform_analytics: {
        Row: {
          active_users: number | null
          created_at: string | null
          date: string
          id: string
          new_signups: number | null
          new_strategies: number | null
          new_trades: number | null
          revenue: number | null
          total_strategies: number | null
          total_trades: number | null
          total_users: number | null
          total_volume: number | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string | null
          date: string
          id?: string
          new_signups?: number | null
          new_strategies?: number | null
          new_trades?: number | null
          revenue?: number | null
          total_strategies?: number | null
          total_trades?: number | null
          total_users?: number | null
          total_volume?: number | null
        }
        Update: {
          active_users?: number | null
          created_at?: string | null
          date?: string
          id?: string
          new_signups?: number | null
          new_strategies?: number | null
          new_trades?: number | null
          revenue?: number | null
          total_strategies?: number | null
          total_trades?: number | null
          total_users?: number | null
          total_volume?: number | null
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
      profiles: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          created_at: string
          email: string
          ethereum_wallet: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          linkedin_url: string | null
          location: string | null
          name: string | null
          profile_image_url: string | null
          referral_code: string | null
          referred_by: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialties: string[] | null
          subscription_expires_at: string | null
          subscription_tier:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at: string
          username: string | null
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email: string
          ethereum_wallet?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          profile_image_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string
          ethereum_wallet?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string | null
          profile_image_url?: string | null
          referral_code?: string | null
          referred_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          subscription_expires_at?: string | null
          subscription_tier?:
            | Database["public"]["Enums"]["subscription_tier"]
            | null
          updated_at?: string
          username?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
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
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          credits_awarded: number | null
          id: string
          referred_by: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          referred_by?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          credits_awarded?: number | null
          id?: string
          referred_by?: string | null
          target_id?: string | null
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
      strategy_status: "draft" | "published" | "archived" | "pending_review"
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
      strategy_status: ["draft", "published", "archived", "pending_review"],
      subscription_tier: ["free", "premium", "professional"],
      trade_status: ["pending", "executed", "closed", "cancelled"],
      user_role: ["user", "admin", "super_admin"],
    },
  },
} as const
