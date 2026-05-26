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
          share_token: string | null;
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
          share_token?: string | null;
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
          share_token?: string | null;
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
      pix_profiles: {
        Row: {
          id: string;
          user_id: string;
          key: string;
          key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
          receiver_name: string;
          city: string;
          description: string;
          txid_prefix: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          key?: string;
          key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
          receiver_name?: string;
          city?: string;
          description?: string;
          txid_prefix?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          key_type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
          receiver_name?: string;
          city?: string;
          description?: string;
          txid_prefix?: string;
          updated_at?: string;
        };
      };
      recurring_groups: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          bill_count: number;
          last_used_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          bill_count?: number;
          last_used_at?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          bill_count?: number;
          last_used_at?: string;
        };
      };
      recurring_group_members: {
        Row: {
          id: string;
          group_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          name?: string;
        };
      };
      recent_friends: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          initials: string;
          background_color: string;
          total_bills: number;
          total_in_cents: number;
          first_seen_at: string;
          last_seen_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          initials?: string;
          background_color?: string;
          total_bills?: number;
          total_in_cents?: number;
          first_seen_at?: string;
          last_seen_at?: string;
        };
        Update: {
          name?: string;
          initials?: string;
          background_color?: string;
          total_bills?: number;
          total_in_cents?: number;
          last_seen_at?: string;
        };
      };
      restaurant_history: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          total_bills: number;
          total_in_cents: number;
          average_ticket_in_cents: number;
          first_visited_at: string;
          last_visited_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          total_bills?: number;
          total_in_cents?: number;
          average_ticket_in_cents?: number;
          first_visited_at?: string;
          last_visited_at?: string;
        };
        Update: {
          name?: string;
          total_bills?: number;
          total_in_cents?: number;
          average_ticket_in_cents?: number;
          last_visited_at?: string;
        };
      };
      analytics_consents: {
        Row: {
          id: string;
          user_id: string;
          consented: boolean;
          consented_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consented?: boolean;
          consented_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          consented?: boolean;
          consented_at?: string | null;
          revoked_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
