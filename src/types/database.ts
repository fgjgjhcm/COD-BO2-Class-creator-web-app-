export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          current_emblem_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          current_emblem_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          current_emblem_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_current_emblem_id_fkey";
            columns: ["current_emblem_id"];
            isOneToOne: false;
            referencedRelation: "emblems";
            referencedColumns: ["id"];
          },
        ];
      };
      loadouts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          slug: string;
          loadout_data: Json;
          remix_of: string | null;
          like_count: number;
          save_count: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          slug: string;
          loadout_data: Json;
          remix_of?: string | null;
          like_count?: number;
          save_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          loadout_data?: Json;
          remix_of?: string | null;
          like_count?: number;
          save_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loadouts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loadout_likes: {
        Row: {
          user_id: string;
          loadout_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          loadout_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          loadout_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      loadout_saves: {
        Row: {
          user_id: string;
          loadout_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          loadout_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          loadout_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          loadout_id: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          loadout_id: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          loadout_id?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      emblems: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          slug: string;
          emblem_code: string;
          preview_url: string | null;
          remix_of: string | null;
          like_count: number;
          save_count: number;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          slug: string;
          emblem_code: string;
          preview_url?: string | null;
          remix_of?: string | null;
          like_count?: number;
          save_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          slug?: string;
          emblem_code?: string;
          preview_url?: string | null;
          remix_of?: string | null;
          like_count?: number;
          save_count?: number;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emblems_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type EmblemRow = Database["public"]["Tables"]["emblems"]["Row"];
export type LoadoutRow = Omit<
  Database["public"]["Tables"]["loadouts"]["Row"],
  "loadout_data"
> & {
  loadout_data: import("@/types/class").ClassBuild;
};
