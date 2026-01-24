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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          invite_code: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      family_members: {
        Row: {
          id: string
          family_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          nickname: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          family_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          nickname?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          nickname?: string | null
          joined_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          family_id: string
          name: string
          cuisine: string | null
          address: string | null
          website: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          cuisine?: string | null
          address?: string | null
          website?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          cuisine?: string | null
          address?: string | null
          website?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      visits: {
        Row: {
          id: string
          restaurant_id: string
          family_id: string
          date: string
          overall_rating: number | null
          value_for_money: number | null
          total_bill: number | null
          number_of_people: number | null
          would_recommend: boolean | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          family_id: string
          date: string
          overall_rating?: number | null
          value_for_money?: number | null
          total_bill?: number | null
          number_of_people?: number | null
          would_recommend?: boolean | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          family_id?: string
          date?: string
          overall_rating?: number | null
          value_for_money?: number | null
          total_bill?: number | null
          number_of_people?: number | null
          would_recommend?: boolean | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      visit_attendees: {
        Row: {
          id: string
          visit_id: string
          user_id: string
          personal_rating: number | null
          personal_notes: string | null
        }
        Insert: {
          id?: string
          visit_id: string
          user_id: string
          personal_rating?: number | null
          personal_notes?: string | null
        }
        Update: {
          id?: string
          visit_id?: string
          user_id?: string
          personal_rating?: number | null
          personal_notes?: string | null
        }
      }
      dishes: {
        Row: {
          id: string
          visit_id: string
          name: string
          rating: number | null
          price: number | null
          notes: string | null
          ordered_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          visit_id: string
          name: string
          rating?: number | null
          price?: number | null
          notes?: string | null
          ordered_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          visit_id?: string
          name?: string
          rating?: number | null
          price?: number | null
          notes?: string | null
          ordered_by?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Family = Database['public']['Tables']['families']['Row']
export type FamilyMember = Database['public']['Tables']['family_members']['Row']
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Visit = Database['public']['Tables']['visits']['Row']
export type VisitAttendee = Database['public']['Tables']['visit_attendees']['Row']
export type Dish = Database['public']['Tables']['dishes']['Row']

// Extended types with relations
export type FamilyMemberWithProfile = FamilyMember & {
  profiles: Profile
}

export type VisitWithDetails = Visit & {
  dishes: Dish[]
  visit_attendees: (VisitAttendee & { profiles: Profile })[]
  profiles: Profile
}

export type RestaurantWithStats = Restaurant & {
  visit_count: number
  avg_rating: number | null
  avg_price: number | null
}
