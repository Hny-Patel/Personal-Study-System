export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
        }
      }
      task_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          default_estimate_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          default_estimate_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          default_estimate_minutes?: number | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          estimated_minutes: number | null
          actual_minutes: number | null
          google_event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          google_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          estimated_minutes?: number | null
          actual_minutes?: number | null
          google_event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          type: 'focus' | 'break'
          started_at: string
          ended_at: string | null
          duration_minutes: number | null
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          task_id?: string | null
          type: 'focus' | 'break'
          started_at?: string
          ended_at?: string | null
          duration_minutes?: number | null
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string | null
          type?: 'focus' | 'break'
          started_at?: string
          ended_at?: string | null
          duration_minutes?: number | null
          completed?: boolean
        }
      }
      calendar_events_cache: {
        Row: {
          id: string
          user_id: string
          google_event_id: string
          title: string
          start_time: string
          end_time: string
          synced_at: string
        }
        Insert: {
          id?: string
          user_id: string
          google_event_id: string
          title: string
          start_time: string
          end_time: string
          synced_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          google_event_id?: string
          title?: string
          start_time?: string
          end_time?: string
          synced_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          board_id: string
          user_id: string
          content: string | null
          color: string | null
          pos_x: number
          pos_y: number
          width: number | null
          height: number | null
          z_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          user_id: string
          content?: string | null
          color?: string | null
          pos_x?: number
          pos_y?: number
          width?: number | null
          height?: number | null
          z_index?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          user_id?: string
          content?: string | null
          color?: string | null
          pos_x?: number
          pos_y?: number
          width?: number | null
          height?: number | null
          z_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          user_id: string
          pomodoro_work_min: number
          pomodoro_break_min: number
          long_break_min: number
          sessions_before_long_break: number
          playlist_url: string | null
          theme: string
          ai_estimation_enabled: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          pomodoro_work_min?: number
          pomodoro_break_min?: number
          long_break_min?: number
          sessions_before_long_break?: number
          playlist_url?: string | null
          theme?: string
          ai_estimation_enabled?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          pomodoro_work_min?: number
          pomodoro_break_min?: number
          long_break_min?: number
          sessions_before_long_break?: number
          playlist_url?: string | null
          theme?: string
          ai_estimation_enabled?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_status: 'todo' | 'in_progress' | 'done'
      task_priority: 'low' | 'medium' | 'high'
      session_type: 'focus' | 'break'
    }
  }
}
