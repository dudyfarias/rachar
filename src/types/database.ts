export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      bills: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          place: string | null;
          subtotal_cents: number;
          service_fee_cents: number;
          discount_cents: number;
          total_cents: number;
          status: 'draft' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          place?: string | null;
          subtotal_cents?: number;
          service_fee_cents?: number;
          discount_cents?: number;
          total_cents?: number;
          status?: 'draft' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          place?: string | null;
          subtotal_cents?: number;
          service_fee_cents?: number;
          discount_cents?: number;
          total_cents?: number;
          status?: 'draft' | 'closed';
          updated_at?: string;
        };
      };
      bill_people: {
        Row: {
          id: string;
          bill_id: string;
          name: string;
          contact_hint: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          name: string;
          contact_hint?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          contact_hint?: string | null;
        };
      };
      bill_items: {
        Row: {
          id: string;
          bill_id: string;
          name: string;
          price_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_id: string;
          name: string;
          price_cents: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          price_cents?: number;
        };
      };
      item_splits: {
        Row: {
          id: string;
          bill_item_id: string;
          bill_person_id: string;
          amount_cents: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          bill_item_id: string;
          bill_person_id: string;
          amount_cents: number;
          created_at?: string;
        };
        Update: {
          amount_cents?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
