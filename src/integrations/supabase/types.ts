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
          age: number | null
          artist_type: string | null
          audience_size: string | null
          availability: Json | null
          avatar_url: string | null
          bio: string | null
          cachet_info: Json | null
          contact_info: Json | null
          created_at: string
          event_types: string[] | null
          exhibition_description: string | null
          experience_years: number | null
          genres: string[] | null
          id: string
          ideal_situations: string[] | null
          instruments: string[] | null
          location: Json | null
          name: string
          performance_duration: string | null
          phone: string | null
          pricing: Json | null
          profile_video_url: string | null
          province: string | null
          social_media: Json | null
          specialization: string | null
          stage_name: string | null
          target_provinces: string[] | null
          updated_at: string
          user_id: string | null
          verified: boolean
        }
        Insert: {
          age?: number | null
          artist_type?: string | null
          audience_size?: string | null
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          cachet_info?: Json | null
          contact_info?: Json | null
          created_at?: string
          event_types?: string[] | null
          exhibition_description?: string | null
          experience_years?: number | null
          genres?: string[] | null
          id?: string
          ideal_situations?: string[] | null
          instruments?: string[] | null
          location?: Json | null
          name: string
          performance_duration?: string | null
          phone?: string | null
          pricing?: Json | null
          profile_video_url?: string | null
          province?: string | null
          social_media?: Json | null
          specialization?: string | null
          stage_name?: string | null
          target_provinces?: string[] | null
          updated_at?: string
          user_id?: string | null
          verified?: boolean
        }
        Update: {
          age?: number | null
          artist_type?: string | null
          audience_size?: string | null
          availability?: Json | null
          avatar_url?: string | null
          bio?: string | null
          cachet_info?: Json | null
          contact_info?: Json | null
          created_at?: string
          event_types?: string[] | null
          exhibition_description?: string | null
          experience_years?: number | null
          genres?: string[] | null
          id?: string
          ideal_situations?: string[] | null
          instruments?: string[] | null
          location?: Json | null
          name?: string
          performance_duration?: string | null
          phone?: string | null
          pricing?: Json | null
          profile_video_url?: string | null
          province?: string | null
          social_media?: Json | null
          specialization?: string | null
          stage_name?: string | null
          target_provinces?: string[] | null
          updated_at?: string
          user_id?: string | null
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
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_artists: {
        Row: {
          artist_id: string
          created_at: string
          event_id: string
          id: string
          invitation_message: string | null
          invited_at: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
        }
        Insert: {
          artist_id: string
          created_at?: string
          event_id: string
          id?: string
          invitation_message?: string | null
          invited_at?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          artist_id?: string
          created_at?: string
          event_id?: string
          id?: string
          invitation_message?: string | null
          invited_at?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_artists_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_artists_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          payment_status: string | null
          status: string
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          payment_status?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          payment_status?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_venues: {
        Row: {
          contact_message: string | null
          contacted_at: string
          created_at: string
          event_id: string
          id: string
          responded_at: string | null
          response_message: string | null
          status: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          contact_message?: string | null
          contacted_at?: string
          created_at?: string
          event_id: string
          id?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          contact_message?: string | null
          contacted_at?: string
          created_at?: string
          event_id?: string
          id?: string
          responded_at?: string | null
          response_message?: string | null
          status?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_venues_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          capacity: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          discovery_on: boolean
          end_at: string | null
          host_id: string | null
          id: string
          max_participants: number | null
          mood_tag: string | null
          photos: string[] | null
          place: Json | null
          registration_status: string | null
          tags: string[] | null
          ticketing: Json | null
          title: string
          updated_at: string
          when_at: string | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          discovery_on?: boolean
          end_at?: string | null
          host_id?: string | null
          id?: string
          max_participants?: number | null
          mood_tag?: string | null
          photos?: string[] | null
          place?: Json | null
          registration_status?: string | null
          tags?: string[] | null
          ticketing?: Json | null
          title: string
          updated_at?: string
          when_at?: string | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          capacity?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          discovery_on?: boolean
          end_at?: string | null
          host_id?: string | null
          id?: string
          max_participants?: number | null
          mood_tag?: string | null
          photos?: string[] | null
          place?: Json | null
          registration_status?: string | null
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
      group_messages: {
        Row: {
          content: string
          created_at: string
          duration_seconds: number | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          group_id: string
          id: string
          message_type: string | null
          poll_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          group_id: string
          id?: string
          message_type?: string | null
          poll_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          group_id?: string
          id?: string
          message_type?: string | null
          poll_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          avatar_url: string | null
          category: string
          created_at: string
          description: string | null
          host_id: string
          id: string
          is_public: boolean | null
          location: Json | null
          max_participants: number | null
          participants: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          category: string
          created_at?: string
          description?: string | null
          host_id: string
          id?: string
          is_public?: boolean | null
          location?: Json | null
          max_participants?: number | null
          participants?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          category?: string
          created_at?: string
          description?: string | null
          host_id?: string
          id?: string
          is_public?: boolean | null
          location?: Json | null
          max_participants?: number | null
          participants?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          can_be_public: boolean | null
          created_at: string
          deleted_at: string | null
          description: string | null
          end_at: string | null
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
          deleted_at?: string | null
          description?: string | null
          end_at?: string | null
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
          deleted_at?: string | null
          description?: string | null
          end_at?: string | null
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
          duration_seconds: number | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          message_type: string | null
          poll_id: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          poll_id?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          message_type?: string | null
          poll_id?: string | null
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
          {
            foreignKeyName: "messages_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          moment_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          moment_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          moment_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moment_participants: {
        Row: {
          amount_paid_cents: number | null
          created_at: string
          currency: string | null
          id: string
          livemoment_fee_cents: number | null
          moment_id: string | null
          organizer_fee_cents: number | null
          payment_status: string | null
          status: string
          stripe_payment_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          livemoment_fee_cents?: number | null
          moment_id?: string | null
          organizer_fee_cents?: number | null
          payment_status?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          livemoment_fee_cents?: number | null
          moment_id?: string | null
          organizer_fee_cents?: number | null
          payment_status?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_participants_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_reactions: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      moment_reactions_detailed: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      moment_stories: {
        Row: {
          created_at: string
          id: string
          media_type: string
          media_url: string
          moment_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type: string
          media_url: string
          moment_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          media_url?: string
          moment_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moments: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          capacity: number | null
          created_at: string
          currency: string | null
          deleted_at: string | null
          description: string | null
          end_at: string | null
          host_id: string
          id: string
          is_public: boolean
          livemoment_fee_percentage: number | null
          max_participants: number | null
          mood_tag: string | null
          organizer_fee_percentage: number | null
          participants: string[] | null
          payment_required: boolean | null
          photos: string[] | null
          place: Json | null
          price_cents: number | null
          registration_status: string | null
          tags: string[] | null
          ticketing: Json | null
          title: string
          updated_at: string
          when_at: string | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          capacity?: number | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          end_at?: string | null
          host_id: string
          id?: string
          is_public?: boolean
          livemoment_fee_percentage?: number | null
          max_participants?: number | null
          mood_tag?: string | null
          organizer_fee_percentage?: number | null
          participants?: string[] | null
          payment_required?: boolean | null
          photos?: string[] | null
          place?: Json | null
          price_cents?: number | null
          registration_status?: string | null
          tags?: string[] | null
          ticketing?: Json | null
          title: string
          updated_at?: string
          when_at?: string | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          capacity?: number | null
          created_at?: string
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          end_at?: string | null
          host_id?: string
          id?: string
          is_public?: boolean
          livemoment_fee_percentage?: number | null
          max_participants?: number | null
          mood_tag?: string | null
          organizer_fee_percentage?: number | null
          participants?: string[] | null
          payment_required?: boolean | null
          photos?: string[] | null
          place?: Json | null
          price_cents?: number | null
          registration_status?: string | null
          tags?: string[] | null
          ticketing?: Json | null
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
      payment_sessions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          livemoment_fee_cents: number
          moment_id: string | null
          organizer_fee_cents: number
          status: string
          stripe_session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          livemoment_fee_cents?: number
          moment_id?: string | null
          organizer_fee_cents?: number
          status?: string
          stripe_session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          livemoment_fee_cents?: number
          moment_id?: string | null
          organizer_fee_cents?: number
          status?: string
          stripe_session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          allows_multiple: boolean | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_anonymous: boolean | null
          options: Json
          question: string
          updated_at: string
        }
        Insert: {
          allows_multiple?: boolean | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          options: Json
          question: string
          updated_at?: string
        }
        Update: {
          allows_multiple?: boolean | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_anonymous?: boolean | null
          options?: Json
          question?: string
          updated_at?: string
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
          current_level: number | null
          current_streak: number | null
          followers_count: number | null
          following_count: number | null
          gallery: string[] | null
          gender: string | null
          id: string
          instagram_username: string | null
          interests: string[] | null
          is_verified: boolean | null
          job_title: string | null
          last_activity_date: string | null
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
          total_points: number | null
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
          current_level?: number | null
          current_streak?: number | null
          followers_count?: number | null
          following_count?: number | null
          gallery?: string[] | null
          gender?: string | null
          id: string
          instagram_username?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          job_title?: string | null
          last_activity_date?: string | null
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
          total_points?: number | null
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
          current_level?: number | null
          current_streak?: number | null
          followers_count?: number | null
          following_count?: number | null
          gallery?: string[] | null
          gender?: string | null
          id?: string
          instagram_username?: string | null
          interests?: string[] | null
          is_verified?: boolean | null
          job_title?: string | null
          last_activity_date?: string | null
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
          total_points?: number | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          availability_info: Json | null
          avatar_url: string | null
          bio: string | null
          certifications: string[] | null
          contact_info: Json | null
          created_at: string
          experience_years: number | null
          id: string
          name: string
          portfolio_urls: string[] | null
          rates: Json | null
          role: string
          skills: string[] | null
          specializations: string[] | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          availability_info?: Json | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name: string
          portfolio_urls?: string[] | null
          rates?: Json | null
          role: string
          skills?: string[] | null
          specializations?: string[] | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          availability_info?: Json | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          contact_info?: Json | null
          created_at?: string
          experience_years?: number | null
          id?: string
          name?: string
          portfolio_urls?: string[] | null
          rates?: Json | null
          role?: string
          skills?: string[] | null
          specializations?: string[] | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          created_at: string
          description: string
          id: string
          points: number
          progress: number | null
          target: number | null
          title: string
          unlocked: boolean
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          created_at?: string
          description: string
          id?: string
          points?: number
          progress?: number | null
          target?: number | null
          title: string
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          created_at?: string
          description?: string
          id?: string
          points?: number
          progress?: number | null
          target?: number | null
          title?: string
          unlocked?: boolean
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          points: number
          reason: string
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          id: string
          is_online: boolean
          last_seen: string
          location: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_online?: boolean
          last_seen?: string
          location?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_online?: boolean
          last_seen?: string
          location?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
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
          additional_equipment: string[] | null
          agreement_types: string[] | null
          amenities: string[] | null
          artist_benefits: string[] | null
          artist_welcome_message: string | null
          audio_setup: string[] | null
          availability: Json | null
          availability_schedule: Json | null
          booking_info: Json | null
          capacity: number | null
          community_advantages: string[] | null
          contact_email: string | null
          contact_info: Json | null
          contact_person_name: string | null
          contact_person_surname: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          equipment: Json | null
          how_discovered: string | null
          id: string
          images: Json | null
          location: Json
          max_capacity_seated: number | null
          max_capacity_standing: number | null
          music_genres: string[] | null
          name: string
          opening_hours: Json | null
          preferred_event_types: string[] | null
          pricing: Json | null
          recommended_hours: string | null
          rental_cost_info: string | null
          rewards_10_people: string | null
          rewards_30_people: string | null
          service_details: string[] | null
          services: string[] | null
          social_media_profiles: Json | null
          space_photos: string[] | null
          special_offer: string | null
          updated_at: string
          user_id: string | null
          venue_photos: string[] | null
          venue_type: string | null
          verified: boolean
        }
        Insert: {
          additional_equipment?: string[] | null
          agreement_types?: string[] | null
          amenities?: string[] | null
          artist_benefits?: string[] | null
          artist_welcome_message?: string | null
          audio_setup?: string[] | null
          availability?: Json | null
          availability_schedule?: Json | null
          booking_info?: Json | null
          capacity?: number | null
          community_advantages?: string[] | null
          contact_email?: string | null
          contact_info?: Json | null
          contact_person_name?: string | null
          contact_person_surname?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          equipment?: Json | null
          how_discovered?: string | null
          id?: string
          images?: Json | null
          location: Json
          max_capacity_seated?: number | null
          max_capacity_standing?: number | null
          music_genres?: string[] | null
          name: string
          opening_hours?: Json | null
          preferred_event_types?: string[] | null
          pricing?: Json | null
          recommended_hours?: string | null
          rental_cost_info?: string | null
          rewards_10_people?: string | null
          rewards_30_people?: string | null
          service_details?: string[] | null
          services?: string[] | null
          social_media_profiles?: Json | null
          space_photos?: string[] | null
          special_offer?: string | null
          updated_at?: string
          user_id?: string | null
          venue_photos?: string[] | null
          venue_type?: string | null
          verified?: boolean
        }
        Update: {
          additional_equipment?: string[] | null
          agreement_types?: string[] | null
          amenities?: string[] | null
          artist_benefits?: string[] | null
          artist_welcome_message?: string | null
          audio_setup?: string[] | null
          availability?: Json | null
          availability_schedule?: Json | null
          booking_info?: Json | null
          capacity?: number | null
          community_advantages?: string[] | null
          contact_email?: string | null
          contact_info?: Json | null
          contact_person_name?: string | null
          contact_person_surname?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          equipment?: Json | null
          how_discovered?: string | null
          id?: string
          images?: Json | null
          location?: Json
          max_capacity_seated?: number | null
          max_capacity_standing?: number | null
          music_genres?: string[] | null
          name?: string
          opening_hours?: Json | null
          preferred_event_types?: string[] | null
          pricing?: Json | null
          recommended_hours?: string | null
          rental_cost_info?: string | null
          rewards_10_people?: string | null
          rewards_30_people?: string | null
          service_details?: string[] | null
          services?: string[] | null
          social_media_profiles?: Json | null
          space_photos?: string[] | null
          special_offer?: string | null
          updated_at?: string
          user_id?: string | null
          venue_photos?: string[] | null
          venue_type?: string | null
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
      add_user_points: {
        Args: {
          points_amount: number
          reason: string
          ref_id?: string
          ref_type?: string
          target_user_id: string
        }
        Returns: undefined
      }
      calculate_distance_km: {
        Args: { lat1: number; lat2: number; lng1: number; lng2: number }
        Returns: number
      }
      cleanup_deleted_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_user_invites_today: {
        Args: { inviter_id?: string; target_user_id: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_moment_participant_count: {
        Args: { moment_id_param: string }
        Returns: number
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
      initialize_user_achievements: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      is_moment_owner: {
        Args: { moment_id: string }
        Returns: boolean
      }
      join_moment: {
        Args: { target_moment_id: string }
        Returns: string
      }
      migrate_existing_moment_participants: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      unlock_achievement: {
        Args: { achievement_type: string; target_user_id: string }
        Returns: undefined
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
