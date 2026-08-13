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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          archived: boolean
          color: string | null
          created_at: string
          currency: string
          current_balance: number
          id: string
          initial_balance: number
          name: string
          type: string
          workspace_id: string
        }
        Insert: {
          archived?: boolean
          color?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name: string
          type?: string
          workspace_id: string
        }
        Update: {
          archived?: boolean
          color?: string | null
          created_at?: string
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          name?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      account_feature_flags: {
        Row: {
          account_id: string
          created_at: string
          enabled: boolean
          feature_flag_id: string
          id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          enabled: boolean
          feature_flag_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          enabled?: boolean
          feature_flag_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_feature_flags_feature_flag_id_fkey"
            columns: ["feature_flag_id"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string | null
          archived: boolean
          brand: string
          closing_day: number
          color: string | null
          created_at: string
          due_day: number
          id: string
          limit_amount: number
          name: string
          workspace_id: string
        }
        Insert: {
          account_id?: string | null
          archived?: boolean
          brand?: string
          closing_day?: number
          color?: string | null
          created_at?: string
          due_day?: number
          id?: string
          limit_amount?: number
          name: string
          workspace_id: string
        }
        Update: {
          account_id?: string | null
          archived?: boolean
          brand?: string
          closing_day?: number
          color?: string | null
          created_at?: string
          due_day?: number
          id?: string
          limit_amount?: number
          name?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cards_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          type?: string
          workspace_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          key: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          key?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      channels: {
        Row: {
          created_at: string
          id: string
          identifier: string
          type: string
          verified: boolean
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          identifier: string
          type: string
          verified?: boolean
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          identifier?: string
          type?: string
          verified?: boolean
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channels_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      recurrences: {
        Row: {
          account_id: string | null
          active: boolean
          amount: number
          category_id: string | null
          created_at: string
          description: string
          end_date: string | null
          frequency: string
          id: string
          next_occurrence: string
          start_date: string
          type: string
          workspace_id: string
        }
        Insert: {
          account_id?: string | null
          active?: boolean
          amount: number
          category_id?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          frequency?: string
          id?: string
          next_occurrence?: string
          start_date?: string
          type: string
          workspace_id: string
        }
        Update: {
          account_id?: string | null
          active?: boolean
          amount?: number
          category_id?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          next_occurrence?: string
          start_date?: string
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurrences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurrences_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          active: boolean
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string
          frequency: string
          icon: string | null
          id: string
          name: string
          next_billing_date: string
          workspace_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          frequency?: string
          icon?: string | null
          id?: string
          name: string
          next_billing_date?: string
          workspace_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          frequency?: string
          icon?: string | null
          id?: string
          name?: string
          next_billing_date?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number
          card_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          created_by_name: string | null
          date: string
          description: string
          id: string
          notes: string | null
          status: string
          transfer_account_id: string | null
          type: string
          workspace_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          date?: string
          description: string
          id?: string
          notes?: string | null
          status?: string
          transfer_account_id?: string | null
          type: string
          workspace_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          card_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          status?: string
          transfer_account_id?: string | null
          type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transfer_account_id_fkey"
            columns: ["transfer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: "editor" | "viewer"
          status: "pending" | "accepted" | "revoked"
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role: "editor" | "viewer"
          status?: "pending" | "accepted" | "revoked"
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: "editor" | "viewer"
          status?: "pending" | "accepted" | "revoked"
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          accent_color: string
          created_at: string
          currency: string
          id: string
          name: string
          owner_id: string
          type: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          currency?: string
          id?: string
          name: string
          owner_id: string
          type?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          owner_id?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_workspace_invitation: {
        Args: { invitation_id: string }
        Returns: Json
      }
      complete_onboarding: {
        Args: {
          account_name: string
          account_type: string
          expense_categories: string[]
          income_categories: string[]
          initial_balance: number
          workspace_accent_color: string
          workspace_currency: string
          workspace_name: string
          workspace_type: string
        }
        Returns: string
      }
      ensure_default_workspace: { Args: never; Returns: string }
      is_feature_enabled: {
        Args: { flag_key: string }
        Returns: boolean
      }
      is_workspace_member: { Args: { ws_id: string }; Returns: boolean }
      list_workspace_members: {
        Args: { ws_id: string }
        Returns: {
          avatar_url: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          role: string
          user_id: string
        }[]
      }
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

export type WorkspaceType = "personal" | "business" | "family"
export type AccountType = "checking" | "savings" | "cash" | "investment" | "other"
export type CardBrand = "visa" | "mastercard" | "amex" | "elo" | "other"
export type TransactionType = "income" | "expense" | "transfer"
export type TransactionStatus = "pending" | "completed" | "scheduled"
export type CategoryType = "income" | "expense"
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly"
export type ChannelType = "email" | "whatsapp" | "telegram" | "sms"

export type Workspace = Omit<Tables<"workspaces">, "type"> & { type: WorkspaceType }
export type WorkspaceMember = Omit<Tables<"workspace_members">, "role"> & {
  role: "owner" | "editor" | "viewer"
}
export type WorkspaceInvitation = Tables<"workspace_invitations">
export type Account = Omit<Tables<"accounts">, "type"> & { type: AccountType }
export type Card = Omit<Tables<"cards">, "brand"> & { brand: CardBrand }
export type Category = Omit<Tables<"categories">, "type"> & { type: CategoryType }
export type Transaction = Omit<Tables<"transactions">, "status" | "type"> & {
  status: TransactionStatus
  type: TransactionType
}
export type Recurrence = Omit<Tables<"recurrences">, "frequency" | "type"> & {
  frequency: RecurrenceFrequency
  type: TransactionType
}
export type Subscription = Omit<Tables<"subscriptions">, "frequency"> & {
  frequency: RecurrenceFrequency
}
export type Channel = Omit<Tables<"channels">, "type"> & { type: ChannelType }
export type Notification = Tables<"notifications">
export type FeatureFlag = Tables<"feature_flags">
export type AccountFeatureFlag = Tables<"account_feature_flags">
