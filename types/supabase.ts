export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      emails: {
        Row: {
          created_at: string
          email: string
          email_confirmed_at: string | null
          id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          email_confirmed_at?: string | null
          id?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          email_confirmed_at?: string | null
          id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: number
          is_favorite: boolean
          post_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_favorite?: boolean
          post_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_favorite?: boolean
          post_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      nifti_files: {
        Row: {
          file_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          file_type?: string
          id: string
          user_id?: string | null
        }
        Update: {
          file_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nifti_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          marketing_emails: boolean
          security_emails: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          marketing_emails?: boolean
          security_emails?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          marketing_emails?: boolean
          security_emails?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          id: number
          post_id: number
          tag_id: number
          user_id: string
        }
        Insert: {
          id?: number
          post_id: number
          tag_id: number
          user_id: string
        }
        Update: {
          id?: number
          post_id?: number
          tag_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      postmeta: {
        Row: {
          id: number
          meta_key: string
          meta_value: string | null
          post_id: number
        }
        Insert: {
          id?: number
          meta_key: string
          meta_value?: string | null
          post_id: number
        }
        Update: {
          id?: number
          meta_key?: string
          meta_value?: string | null
          post_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "postmeta_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          banned_until: string | null
          content: string | null
          created_at: string
          date: string | null
          deleted_at: string | null
          description: string | null
          id: number
          is_ban: boolean
          keywords: string | null
          password: string | null
          permalink: string | null
          slug: string | null
          status: string
          thumbnail_url: string | null
          title: string | null
          type: string
          updated_at: string
          user_id: string
          title_content: string | null
          title_description: string | null
          title_description_content: string | null
          title_description_keywords: string | null
          title_keywords: string | null
        }
        Insert: {
          banned_until?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_ban?: boolean
          keywords?: string | null
          password?: string | null
          permalink?: string | null
          slug?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          banned_until?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: number
          is_ban?: boolean
          keywords?: string | null
          password?: string | null
          permalink?: string | null
          slug?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      private_items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          id: number
          permission: string
          role: string
        }
        Insert: {
          id?: number
          permission: string
          role: string
        }
        Update: {
          id?: number
          permission?: string
          role?: string
        }
        Relationships: []
      }
      statistics: {
        Row: {
          browser: Json | null
          created_at: string
          id: number
          ip: unknown | null
          location: string | null
          path: string | null
          query: string | null
          referrer: string | null
          title: string | null
          user_agent: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          browser?: Json | null
          created_at?: string
          id?: number
          ip?: unknown | null
          location?: string | null
          path?: string | null
          query?: string | null
          referrer?: string | null
          title?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          browser?: Json | null
          created_at?: string
          id?: number
          ip?: unknown | null
          location?: string | null
          path?: string | null
          query?: string | null
          referrer?: string | null
          title?: string | null
          user_agent?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tagmeta: {
        Row: {
          id: number
          meta_key: string
          meta_value: string | null
          tag_id: number
        }
        Insert: {
          id?: number
          meta_key: string
          meta_value?: string | null
          tag_id: number
        }
        Update: {
          id?: number
          meta_key?: string
          meta_value?: string | null
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tagmeta_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          slug: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          slug?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          slug?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usermeta: {
        Row: {
          id: number
          meta_key: string
          meta_value: string | null
          user_id: string
        }
        Insert: {
          id?: number
          meta_key: string
          meta_value?: string | null
          user_id: string
        }
        Update: {
          id?: number
          meta_key?: string
          meta_value?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usermeta_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          avatar_url: string | null
          banned_until: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          has_set_password: boolean
          id: string
          is_ban: boolean
          last_name: string | null
          plan: string
          plan_changed_at: string | null
          role: string
          role_changed_at: string | null
          updated_at: string
          username: string | null
          username_changed_at: string | null
          website: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          has_set_password?: boolean
          id: string
          is_ban?: boolean
          last_name?: string | null
          plan?: string
          plan_changed_at?: string | null
          role?: string
          role_changed_at?: string | null
          updated_at?: string
          username?: string | null
          username_changed_at?: string | null
          website?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          has_set_password?: boolean
          id?: string
          is_ban?: boolean
          last_name?: string | null
          plan?: string
          plan_changed_at?: string | null
          role?: string
          role_changed_at?: string | null
          updated_at?: string
          username?: string | null
          username_changed_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: number
          is_dislike: number
          is_like: number
          post_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_dislike?: number
          is_like?: number
          post_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_dislike?: number
          is_like?: number
          post_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_user_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      count_posts: {
        Args: {
          userid: string
          posttype?: string
          q?: string
        }
        Returns: {
          status: string
          count: number
        }[]
      }
      create_new_posts: {
        Args: {
          data: Json[]
        }
        Returns: undefined
      }
      create_new_user: {
        Args: {
          useremail: string
          password?: string
          metadata?: Json
        }
        Returns: string
      }
      daily_delete_old_cron_job_run_details: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user: {
        Args: {
          useremail: string
        }
        Returns: undefined
      }
      generate_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_post_slug: {
        Args: {
          userid: string
          postslug: string
        }
        Returns: string
      }
      generate_tag_slug: {
        Args: {
          userid: string
          tagslug: string
        }
        Returns: string
      }
      generate_username: {
        Args: {
          email: string
        }
        Returns: string
      }
      get_adjacent_post_id: {
        Args: {
          postid: number
          userid: string
          posttype?: string
          poststatus?: string
        }
        Returns: {
          previous_id: number
          next_id: number
        }[]
      }
      get_post_rank_by_views: {
        Args: {
          username: string
          q?: string
          order_by?: string
          ascending?: boolean
          per_page?: number
          page?: number
          head?: boolean
        }
        Returns: {
          path: string
          title: string
          views: number
        }[]
      }
      get_users: {
        Args: {
          userrole?: string
          userplan?: string
        }
        Returns: {
          age: number | null
          avatar_url: string | null
          banned_until: string | null
          bio: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          has_set_password: boolean
          id: string
          is_ban: boolean
          last_name: string | null
          plan: string
          plan_changed_at: string | null
          role: string
          role_changed_at: string | null
          updated_at: string
          username: string | null
          username_changed_at: string | null
          website: string | null
        }[]
      }
      get_vote: {
        Args: {
          postid: number
        }
        Returns: {
          id: number
          like_count: number
          dislike_count: number
        }[]
      }
      hourly_publish_future_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_favorite: {
        Args: {
          postid: number
          userid: string
          isfavorite: boolean
        }
        Returns: undefined
      }
      set_post_meta: {
        Args: {
          postid: number
          metakey: string
          metavalue?: string
        }
        Returns: undefined
      }
      set_post_tags: {
        Args: {
          userid: string
          postid: number
        }
        Returns: undefined
      }
      set_post_views: {
        Args: {
          postid: number
        }
        Returns: undefined
      }
      set_statistics: {
        Args: {
          data: Json
        }
        Returns: undefined
      }
      set_tag: {
        Args: {
          userid: string
          tagname: string
          tagslug: string
          tagdescription?: string
        }
        Returns: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          slug: string | null
          updated_at: string
          user_id: string
        }[]
      }
      set_tag_meta: {
        Args: {
          tagid: number
          metakey: string
          metavalue?: string
        }
        Returns: undefined
      }
      set_user_meta: {
        Args: {
          userid: number
          metakey: string
          metavalue?: string
        }
        Returns: undefined
      }
      set_user_plan: {
        Args: {
          userplan: string
          userid?: string
          useremail?: string
        }
        Returns: undefined
      }
      set_user_role: {
        Args: {
          userrole: string
          userid?: string
          useremail?: string
        }
        Returns: undefined
      }
      title_content: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      title_description: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      title_description_content: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      title_description_keywords: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      title_keywords: {
        Args: {
          "": unknown
        }
        Returns: string
      }
      truncate_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      truncate_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      verify_user_password: {
        Args: {
          userid: string
          password: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
