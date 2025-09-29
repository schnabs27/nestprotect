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
      contact_access_logs: {
        Row: {
          accessed_at: string | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      disaster_resources: {
        Row: {
          address: string | null
          categories: Json
          created_at: string
          description: string | null
          geolocation: Json | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          requested_zipcode: string | null
          source: string
          source_id: string | null
          updated_at: string
          url: string | null
          zipcode: string
        }
        Insert: {
          address?: string | null
          categories?: Json
          created_at?: string
          description?: string | null
          geolocation?: Json | null
          id?: never
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          requested_zipcode?: string | null
          source: string
          source_id?: string | null
          updated_at?: string
          url?: string | null
          zipcode: string
        }
        Update: {
          address?: string | null
          categories?: Json
          created_at?: string
          description?: string | null
          geolocation?: Json | null
          id?: never
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          requested_zipcode?: string | null
          source?: string
          source_id?: string | null
          updated_at?: string
          url?: string | null
          zipcode?: string
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
      user_assessments: {
        Row: {
          assessment_data: Json | null
          created_at: string
          id: string
          score: number
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json | null
          created_at?: string
          id?: string
          score: number
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json | null
          created_at?: string
          id?: string
          score?: number
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preparedness_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_id?: string
          updated_at?: string
          user_id?: string
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zips_with_risks: {
        Row: {
          AVLN_RISKR: string | null
          CFLD_RISKR: string | null
          city: string | null
          count_high_risks: string | null
          county: string | null
          COUNTY_ID: number | null
          COUNTY_ORIG: string | null
          CWAV_RISKR: string | null
          DRGT_RISKR: string | null
          ERQK_RISKR: string | null
          HAIL_RISKR: string | null
          high_risks: string | null
          HRCN_RISKR: string | null
          HWAV_RISKR: string | null
          ISTM_RISKR: string | null
          LNDS_RISKR: string | null
          LTNG_RISKR: string | null
          NRI_ID: string | null
          OID_: number | null
          RFLD_RISKR: string | null
          risk_rating: string | null
          state: string | null
          STATE: string | null
          SWND_RISKR: string | null
          TOT_RATIO: number | null
          TRND_RISKR: string | null
          TSUN_RISKR: string | null
          VLCN_RISKR: string | null
          WFIR_RISKR: string | null
          WNTW_RISKR: string | null
          zipcode: number
        }
        Insert: {
          AVLN_RISKR?: string | null
          CFLD_RISKR?: string | null
          city?: string | null
          count_high_risks?: string | null
          county?: string | null
          COUNTY_ID?: number | null
          COUNTY_ORIG?: string | null
          CWAV_RISKR?: string | null
          DRGT_RISKR?: string | null
          ERQK_RISKR?: string | null
          HAIL_RISKR?: string | null
          high_risks?: string | null
          HRCN_RISKR?: string | null
          HWAV_RISKR?: string | null
          ISTM_RISKR?: string | null
          LNDS_RISKR?: string | null
          LTNG_RISKR?: string | null
          NRI_ID?: string | null
          OID_?: number | null
          RFLD_RISKR?: string | null
          risk_rating?: string | null
          state?: string | null
          STATE?: string | null
          SWND_RISKR?: string | null
          TOT_RATIO?: number | null
          TRND_RISKR?: string | null
          TSUN_RISKR?: string | null
          VLCN_RISKR?: string | null
          WFIR_RISKR?: string | null
          WNTW_RISKR?: string | null
          zipcode: number
        }
        Update: {
          AVLN_RISKR?: string | null
          CFLD_RISKR?: string | null
          city?: string | null
          count_high_risks?: string | null
          county?: string | null
          COUNTY_ID?: number | null
          COUNTY_ORIG?: string | null
          CWAV_RISKR?: string | null
          DRGT_RISKR?: string | null
          ERQK_RISKR?: string | null
          HAIL_RISKR?: string | null
          high_risks?: string | null
          HRCN_RISKR?: string | null
          HWAV_RISKR?: string | null
          ISTM_RISKR?: string | null
          LNDS_RISKR?: string | null
          LTNG_RISKR?: string | null
          NRI_ID?: string | null
          OID_?: number | null
          RFLD_RISKR?: string | null
          risk_rating?: string | null
          state?: string | null
          STATE?: string | null
          SWND_RISKR?: string | null
          TOT_RATIO?: number | null
          TRND_RISKR?: string | null
          TSUN_RISKR?: string | null
          VLCN_RISKR?: string | null
          WFIR_RISKR?: string | null
          WNTW_RISKR?: string | null
          zipcode?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_contact_info: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_access_contact_info_secure: {
        Args: { resource_id: string }
        Returns: boolean
      }
      generate_secure_device_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_public_disaster_resources: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          category: string
          city: string
          created_at: string
          description: string
          distance_mi: number
          hours: string
          id: string
          is_archived: boolean
          last_seen_at: string
          last_verified_at: string
          latitude: number
          longitude: number
          name: string
          postal_code: string
          source: string
          state: string
          updated_at: string
          website: string
        }[]
      }
      get_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_valid_zip_code: {
        Args: { zip_code: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
