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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'bills_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'bill_people_bill_id_fkey';
            columns: ['bill_id'];
            isOneToOne: false;
            referencedRelation: 'bills';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'bill_items_bill_id_fkey';
            columns: ['bill_id'];
            isOneToOne: false;
            referencedRelation: 'bills';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'item_splits_bill_item_id_fkey';
            columns: ['bill_item_id'];
            isOneToOne: false;
            referencedRelation: 'bill_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'item_splits_bill_person_id_fkey';
            columns: ['bill_person_id'];
            isOneToOne: false;
            referencedRelation: 'bill_people';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'pix_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'recurring_groups_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'recurring_group_members_group_id_fkey';
            columns: ['group_id'];
            isOneToOne: false;
            referencedRelation: 'recurring_groups';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'recent_friends_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'restaurant_history_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'analytics_consents_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
