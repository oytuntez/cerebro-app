export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
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
      freesurfer_cortical_regions: {
        Row: {
          atlas: string
          created_at: string | null
          curv_ind: number | null
          fold_ind: number | null
          gauss_curv: number | null
          gray_vol: number | null
          hemisphere: string
          id: string
          mean_curv: number | null
          nifti_file_id: string
          num_vertices: number | null
          structure_name: string
          surface_area: number | null
          thick_avg: number | null
          thick_std: number | null
        }
        Insert: {
          atlas?: string
          created_at?: string | null
          curv_ind?: number | null
          fold_ind?: number | null
          gauss_curv?: number | null
          gray_vol?: number | null
          hemisphere: string
          id?: string
          mean_curv?: number | null
          nifti_file_id: string
          num_vertices?: number | null
          structure_name: string
          surface_area?: number | null
          thick_avg?: number | null
          thick_std?: number | null
        }
        Update: {
          atlas?: string
          created_at?: string | null
          curv_ind?: number | null
          fold_ind?: number | null
          gauss_curv?: number | null
          gray_vol?: number | null
          hemisphere?: string
          id?: string
          mean_curv?: number | null
          nifti_file_id?: string
          num_vertices?: number | null
          structure_name?: string
          surface_area?: number | null
          thick_avg?: number | null
          thick_std?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freesurfer_cortical_regions_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
      }
      freesurfer_curvature_stats: {
        Row: {
          created_at: string | null
          curv_max: number | null
          curv_max_vertex: number | null
          curv_mean: number | null
          curv_min: number | null
          curv_min_vertex: number | null
          curv_std: number | null
          hemisphere: string
          id: string
          nifti_file_id: string
          num_vertices: number | null
          surface_area: number | null
          vertex_area: number | null
          vertex_separation_mean: number | null
          vertex_separation_std: number | null
        }
        Insert: {
          created_at?: string | null
          curv_max?: number | null
          curv_max_vertex?: number | null
          curv_mean?: number | null
          curv_min?: number | null
          curv_min_vertex?: number | null
          curv_std?: number | null
          hemisphere: string
          id?: string
          nifti_file_id: string
          num_vertices?: number | null
          surface_area?: number | null
          vertex_area?: number | null
          vertex_separation_mean?: number | null
          vertex_separation_std?: number | null
        }
        Update: {
          created_at?: string | null
          curv_max?: number | null
          curv_max_vertex?: number | null
          curv_mean?: number | null
          curv_min?: number | null
          curv_min_vertex?: number | null
          curv_std?: number | null
          hemisphere?: string
          id?: string
          nifti_file_id?: string
          num_vertices?: number | null
          surface_area?: number | null
          vertex_area?: number | null
          vertex_separation_mean?: number | null
          vertex_separation_std?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freesurfer_curvature_stats_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
      }
      freesurfer_global_measures: {
        Row: {
          created_at: string | null
          id: string
          measure_field: string
          measure_name: string
          nifti_file_id: string
          source_file: string | null
          unit: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          measure_field: string
          measure_name: string
          nifti_file_id: string
          source_file?: string | null
          unit?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          measure_field?: string
          measure_name?: string
          nifti_file_id?: string
          source_file?: string | null
          unit?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "freesurfer_global_measures_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
      }
      freesurfer_subcortical_segmentations: {
        Row: {
          created_at: string | null
          id: string
          nifti_file_id: string
          norm_max: number | null
          norm_mean: number | null
          norm_min: number | null
          norm_range: number | null
          norm_stddev: number | null
          nvoxels: number | null
          seg_id: number
          structure_name: string
          volume_mm3: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nifti_file_id: string
          norm_max?: number | null
          norm_mean?: number | null
          norm_min?: number | null
          norm_range?: number | null
          norm_stddev?: number | null
          nvoxels?: number | null
          seg_id: number
          structure_name: string
          volume_mm3?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nifti_file_id?: string
          norm_max?: number | null
          norm_mean?: number | null
          norm_min?: number | null
          norm_range?: number | null
          norm_stddev?: number | null
          nvoxels?: number | null
          seg_id?: number
          structure_name?: string
          volume_mm3?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freesurfer_subcortical_segmentations_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
      }
      freesurfer_summary_stats: {
        Row: {
          created_at: string | null
          estimated_total_intracranial_volume: number | null
          id: string
          lh_cortex_volume: number | null
          lh_mean_curvature: number | null
          lh_mean_thickness: number | null
          lh_surface_area: number | null
          lh_surface_area_from_curv: number | null
          nifti_file_id: string
          rh_cortex_volume: number | null
          rh_mean_curvature: number | null
          rh_mean_thickness: number | null
          rh_surface_area: number | null
          rh_surface_area_from_curv: number | null
          total_brain_volume: number | null
          total_cortex_volume: number | null
          total_white_matter: number | null
        }
        Insert: {
          created_at?: string | null
          estimated_total_intracranial_volume?: number | null
          id?: string
          lh_cortex_volume?: number | null
          lh_mean_curvature?: number | null
          lh_mean_thickness?: number | null
          lh_surface_area?: number | null
          lh_surface_area_from_curv?: number | null
          nifti_file_id: string
          rh_cortex_volume?: number | null
          rh_mean_curvature?: number | null
          rh_mean_thickness?: number | null
          rh_surface_area?: number | null
          rh_surface_area_from_curv?: number | null
          total_brain_volume?: number | null
          total_cortex_volume?: number | null
          total_white_matter?: number | null
        }
        Update: {
          created_at?: string | null
          estimated_total_intracranial_volume?: number | null
          id?: string
          lh_cortex_volume?: number | null
          lh_mean_curvature?: number | null
          lh_mean_thickness?: number | null
          lh_surface_area?: number | null
          lh_surface_area_from_curv?: number | null
          nifti_file_id?: string
          rh_cortex_volume?: number | null
          rh_mean_curvature?: number | null
          rh_mean_thickness?: number | null
          rh_surface_area?: number | null
          rh_surface_area_from_curv?: number | null
          total_brain_volume?: number | null
          total_cortex_volume?: number | null
          total_white_matter?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "freesurfer_summary_stats_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: true
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          id: number
          slug: string
        }
        Insert: {
          id?: number
          slug: string
        }
        Update: {
          id?: number
          slug?: string
        }
        Relationships: []
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
          created_at: string
          file_type: string
          id: string
          parent_nifti_file_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_type?: string
          id: string
          parent_nifti_file_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_type?: string
          id?: string
          parent_nifti_file_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nifti_files_parent_nitfi_file_id_fkey"
            columns: ["parent_nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
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
      roi_volumes: {
        Row: {
          atlas_type: string | null
          created_at: string
          id: number
          label: string
          nifti_file_id: string
          updated_at: string | null
          volume: number
        }
        Insert: {
          atlas_type?: string | null
          created_at?: string
          id?: number
          label: string
          nifti_file_id: string
          updated_at?: string | null
          volume: number
        }
        Update: {
          atlas_type?: string | null
          created_at?: string
          id?: number
          label?: string
          nifti_file_id?: string
          updated_at?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "roi_volumes_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
        ]
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
      user_insight_outputs: {
        Row: {
          created_at: string
          id: number
          name: string
          type: string | null
          user_insight_id: number | null
          value: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          type?: string | null
          user_insight_id?: number | null
          value: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          type?: string | null
          user_insight_id?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_insight_outputs_user_insight_id_fkey"
            columns: ["user_insight_id"]
            isOneToOne: false
            referencedRelation: "user_insights"
            referencedColumns: ["id"]
          },
        ]
      }
      user_insights: {
        Row: {
          archived_at: string | null
          created_at: string | null
          id: number
          insight_id: number
          nifti_file_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string | null
          id?: number
          insight_id: number
          nifti_file_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string | null
          id?: number
          insight_id?: number
          nifti_file_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_insights_insight_id_fkey"
            columns: ["insight_id"]
            isOneToOne: false
            referencedRelation: "insights"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_insights_nifti_file_id_fkey"
            columns: ["nifti_file_id"]
            isOneToOne: false
            referencedRelation: "nifti_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_insights_user_id_fkey"
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: number
          meta_key: string
          meta_value?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: number
          meta_key?: string
          meta_value?: string | null
          updated_at?: string | null
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
        Args: { userid: string; posttype?: string; q?: string }
        Returns: {
          status: string
          count: number
        }[]
      }
      create_new_posts: {
        Args: { data: Json[] }
        Returns: undefined
      }
      create_new_user: {
        Args: { useremail: string; password?: string; metadata?: Json }
        Returns: string
      }
      daily_delete_old_cron_job_run_details: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user: {
        Args: { useremail: string }
        Returns: undefined
      }
      generate_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_post_slug: {
        Args: { userid: string; postslug: string }
        Returns: string
      }
      generate_tag_slug: {
        Args: { userid: string; tagslug: string }
        Returns: string
      }
      generate_username: {
        Args: { email: string }
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
      get_atlas_sampled_nifti_file: {
        Args: { p_nifti_file_id: string; p_file_type: string }
        Returns: {
          id: string
          file_type: string
          user_id: string
          parent_nitfi_file_id: string
        }[]
      }
      get_file_type_among_children: {
        Args: { p_nifti_file_id: string; p_file_type: string }
        Returns: {
          created_at: string
          file_type: string
          id: string
          parent_nifti_file_id: string | null
          updated_at: string | null
          user_id: string | null
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
        Args: { userrole?: string; userplan?: string }
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
        Args: { postid: number }
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
        Args: { postid: number; userid: string; isfavorite: boolean }
        Returns: undefined
      }
      set_post_meta: {
        Args: { postid: number; metakey: string; metavalue?: string }
        Returns: undefined
      }
      set_post_tags: {
        Args: { userid: string; postid: number }
        Returns: undefined
      }
      set_post_views: {
        Args: { postid: number }
        Returns: undefined
      }
      set_statistics: {
        Args: { data: Json }
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
        Args: { tagid: number; metakey: string; metavalue?: string }
        Returns: undefined
      }
      set_user_meta: {
        Args: { p_user_id: string; p_meta_key: string; p_meta_value?: string }
        Returns: {
          id: number
          meta_key: string
          meta_value: string | null
          updated_at: string | null
          user_id: string
        }[]
      }
      set_user_plan: {
        Args: { userplan: string; userid?: string; useremail?: string }
        Returns: undefined
      }
      set_user_role: {
        Args: { userrole: string; userid?: string; useremail?: string }
        Returns: undefined
      }
      title_content: {
        Args: { "": Database["public"]["Tables"]["posts"]["Row"] }
        Returns: string
      }
      title_description: {
        Args: { "": Database["public"]["Tables"]["posts"]["Row"] }
        Returns: string
      }
      title_description_content: {
        Args: { "": Database["public"]["Tables"]["posts"]["Row"] }
        Returns: string
      }
      title_description_keywords: {
        Args: { "": Database["public"]["Tables"]["posts"]["Row"] }
        Returns: string
      }
      title_keywords: {
        Args: { "": Database["public"]["Tables"]["posts"]["Row"] }
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
      usermeta_upsert: {
        Args: { p_user_id: string; p_meta_key: string; p_meta_value: string }
        Returns: {
          id: number
          meta_key: string
          meta_value: string | null
          updated_at: string | null
          user_id: string
        }[]
      }
      verify_user_password: {
        Args: { userid: string; password: string }
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
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const
