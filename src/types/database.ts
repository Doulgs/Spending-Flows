// Minimal typed representation of the Supabase database schema used by the app.
// Mirrors the tables created in supabase/migrations/001_initial_schema.sql

export type WorkspaceType = "personal" | "business" | "family";
export type AccountType = "checking" | "savings" | "cash" | "investment" | "other";
export type CardBrand = "visa" | "mastercard" | "amex" | "elo" | "other";
export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "pending" | "completed" | "scheduled";
export type CategoryType = "income" | "expense";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type ChannelType = "email" | "whatsapp" | "telegram" | "sms";

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  type: WorkspaceType;
  currency: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Account {
  id: string;
  workspace_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  current_balance: number;
  currency: string;
  color: string | null;
  archived: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  workspace_id: string;
  account_id: string | null;
  name: string;
  brand: CardBrand;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string | null;
  archived: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  workspace_id: string;
  account_id: string | null;
  card_id: string | null;
  category_id: string | null;
  transfer_account_id: string | null;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  amount: number;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface Recurrence {
  id: string;
  workspace_id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category_id: string | null;
  account_id: string | null;
  frequency: RecurrenceFrequency;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  workspace_id: string;
  name: string;
  amount: number;
  frequency: RecurrenceFrequency;
  category_id: string | null;
  card_id: string | null;
  next_billing_date: string;
  active: boolean;
  icon: string | null;
  created_at: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  type: ChannelType;
  identifier: string;
  verified: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

type NoRelationships = { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      workspaces: { Row: Workspace; Insert: Partial<Workspace>; Update: Partial<Workspace> } & NoRelationships;
      workspace_members: { Row: WorkspaceMember; Insert: Partial<WorkspaceMember>; Update: Partial<WorkspaceMember> } & NoRelationships;
      accounts: { Row: Account; Insert: Partial<Account>; Update: Partial<Account> } & NoRelationships;
      cards: { Row: Card; Insert: Partial<Card>; Update: Partial<Card> } & NoRelationships;
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> } & NoRelationships;
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> } & NoRelationships;
      recurrences: { Row: Recurrence; Insert: Partial<Recurrence>; Update: Partial<Recurrence> } & NoRelationships;
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> } & NoRelationships;
      channels: { Row: Channel; Insert: Partial<Channel>; Update: Partial<Channel> } & NoRelationships;
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
