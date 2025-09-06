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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      disaster_resources: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string
          description: string | null
          distance_mi: number | null
          email: string | null
          hours: string | null
          id: string
          is_archived: boolean | null
          last_seen_at: string | null
          last_verified_at: string | null
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          source: string | null
          source_id: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          distance_mi?: number | null
          email?: string | null
          hours?: string | null
          id?: string
          is_archived?: boolean | null
          last_seen_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_id?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          distance_mi?: number | null
          email?: string | null
          hours?: string | null
          id?: string
          is_archived?: boolean | null
          last_seen_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_id?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      user_resource_prefs: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          is_favorite: boolean | null
          is_hidden: boolean | null
          resource_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          is_favorite?: boolean | null
          is_hidden?: boolean | null
          resource_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          is_favorite?: boolean | null
          is_hidden?: boolean | null
          resource_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      disaster_resources_public: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          distance_mi: number | null
          hours: string | null
          id: string | null
          is_archived: boolean | null
          last_seen_at: string | null
          last_verified_at: string | null
          latitude: number | null
          longitude: number | null
          name: string | null
          postal_code: string | null
          source: string | null
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          distance_mi?: number | null
          hours?: string | null
          id?: string | null
          is_archived?: boolean | null
          last_seen_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          source?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          distance_mi?: number | null
          hours?: string | null
          id?: string | null
          is_archived?: boolean | null
          last_seen_at?: string | null
          last_verified_at?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string | null
          postal_code?: string | null
          source?: string | null
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_disaster_resource_contact: {
        Args: { resource_id: string }
        Returns: {
          email: string
          id: string
          phone: string
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
