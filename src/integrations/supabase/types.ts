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
      artists: {
        Row: {
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          contact_info: Json | null
          created_at: string
          genres: string[] | null
          id: string
          location: Json | null
          name: string
          pricing: Json | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          contact_info?: Json | null
          created_at?: string
          genres?: string[] | null
          id?: string
          location?: Json | null
          name: string
          pricing?: Json | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          contact_info?: Json | null
          created_at?: string
          genres?: string[] | null
          id?: string
          location?: Json | null
          name?: string
          pricing?: Json | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string
          end_at: string | null
          id: string
          is_on: boolean
          shareable: boolean
          start_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          id?: string
          is_on?: boolean
          shareable?: boolean
          start_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_at?: string | null
          id?: string
          is_on?: boolean
          shareable?: boolean
          start_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          participant_1: string
          participant_2: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          participant_1: string
          participant_2: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          participant_1?: string
          participant_2?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          discovery_on: boolean
          host_id: string | null
          id: string
          place: Json | null
          tags: string[] | null
          ticketing: Json | null
          title: string
          updated_at: string
          when_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          discovery_on?: boolean
          host_id?: string | null
          id?: string
          place?: Json | null
          tags?: string[] | null
          ticketing?: Json | null
          title: string
          updated_at?: string
          when_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          discovery_on?: boolean
          host_id?: string | null
          id?: string
          place?: Json | null
          tags?: string[] | null
          ticketing?: Json | null
          title?: string
          updated_at?: string
          when_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          friend_user_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_user_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_user_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          can_be_public: boolean | null
          created_at: string
          description: string | null
          host_id: string
          id: string
          invite_count: number | null
          location_radius: number | null
          participants: string[] | null
          place: Json | null
          response_message: string | null
          status: string
          title: string
          updated_at: string
          when_at: string | null
        }
        Insert: {
          can_be_public?: boolean | null
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          invite_count?: number | null
          location_radius?: number | null
          participants?: string[] | null
          place?: Json | null
          response_message?: string | null
          status?: string
          title: string
          updated_at?: string
          when_at?: string | null
        }
        Update: {
          can_be_public?: boolean | null
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          invite_count?: number | null
          location_radius?: number | null
          participants?: string[] | null
          place?: Json | null
          response_message?: string | null
          status?: string
          title?: string
          updated_at?: string
          when_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          host_id: string
          id: string
          is_public: boolean
          participants: string[] | null
          place: Json | null
          tags: string[] | null
          title: string
          updated_at: string
          when_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          is_public?: boolean
          participants?: string[] | null
          place?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string
          when_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          is_public?: boolean
          participants?: string[] | null
          place?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          when_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          chat_permission:
            | Database["public"]["Enums"]["chat_permission_type"]
            | null
          cover_image_url: string | null
          created_at: string
          followers_count: number | null
          following_count: number | null
          gallery: string[] | null
          id: string
          instagram_username: string | null
          interests: string[] | null
          is_verified: boolean | null
          job_title: string | null
          location: Json | null
          mood: string | null
          name: string | null
          onboarding_completed: boolean
          personality_type:
            | Database["public"]["Enums"]["personality_type"]
            | null
          preferred_moments: string[] | null
          privacy_level:
            | Database["public"]["Enums"]["privacy_level_type"]
            | null
          relationship_status: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          chat_permission?:
            | Database["public"]["Enums"]["chat_permission_type"]
            | null
          cover_image_url?: string | null
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          gallery?: string[] | null
          id: string
          instagram_username?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          job_title?: string | null
          location?: Json | null
          mood?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personality_type?:
            | Database["public"]["Enums"]["personality_type"]
            | null
          preferred_moments?: string[] | null
          privacy_level?:
            | Database["public"]["Enums"]["privacy_level_type"]
            | null
          relationship_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          chat_permission?:
            | Database["public"]["Enums"]["chat_permission_type"]
            | null
          cover_image_url?: string | null
          created_at?: string
          followers_count?: number | null
          following_count?: number | null
          gallery?: string[] | null
          id?: string
          instagram_username?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          job_title?: string | null
          location?: Json | null
          mood?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personality_type?:
            | Database["public"]["Enums"]["personality_type"]
            | null
          preferred_moments?: string[] | null
          privacy_level?:
            | Database["public"]["Enums"]["privacy_level_type"]
            | null
          relationship_status?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          amenities: string[] | null
          availability: Json | null
          capacity: number | null
          contact_info: Json | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          location: Json
          name: string
          pricing: Json | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          amenities?: string[] | null
          availability?: Json | null
          capacity?: number | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          location: Json
          name: string
          pricing?: Json | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          amenities?: string[] | null
          availability?: Json | null
          capacity?: number | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          location?: Json
          name?: string
          pricing?: Json | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      available_now: {
        Row: {
          availability_id: string | null
          avatar_url: string | null
          end_at: string | null
          interests: string[] | null
          is_on: boolean | null
          job_title: string | null
          mood: string | null
          name: string | null
          shareable: boolean | null
          start_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      count_user_invites_today: {
        Args: { inviter_id?: string; target_user_id: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_nearby_available_users: {
        Args: {
          radius_km?: number
          target_time?: string
          user_lat: number
          user_lng: number
        }
        Returns: {
          availability_id: string
          avatar_url: string
          distance_km: number
          interests: string[]
          job_title: string
          mood: string
          name: string
          user_id: string
          username: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      chat_permission_type:
        | "everyone"
        | "friends_only"
        | "followers_only"
        | "none"
      personality_type:
        | "INTJ"
        | "INTP"
        | "ENTJ"
        | "ENTP"
        | "INFJ"
        | "INFP"
        | "ENFJ"
        | "ENFP"
        | "ISTJ"
        | "ISFJ"
        | "ESTJ"
        | "ESFJ"
        | "ISTP"
        | "ISFP"
        | "ESTP"
        | "ESFP"
      privacy_level_type: "public" | "friends_only" | "private"
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
      app_role: ["admin", "moderator", "user"],
      chat_permission_type: [
        "everyone",
        "friends_only",
        "followers_only",
        "none",
      ],
      personality_type: [
        "INTJ",
        "INTP",
        "ENTJ",
        "ENTP",
        "INFJ",
        "INFP",
        "ENFJ",
        "ENFP",
        "ISTJ",
        "ISFJ",
        "ESTJ",
        "ESFJ",
        "ISTP",
        "ISFP",
        "ESTP",
        "ESFP",
      ],
      privacy_level_type: ["public", "friends_only", "private"],
    },
  },
} as const
