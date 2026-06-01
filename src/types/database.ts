export type SubscriptionTier = 'free' | 'individual' | 'couple' | 'family'
export type RelationshipStatus = 'individual' | 'couple'
export type PillarKey = 'family' | 'body' | 'mind' | 'work'
export type ConversationType = 'onboarding' | 'checkin' | 'chat'
export type MilestoneType = 'business' | 'personal' | 'family' | 'body' | 'mind'
export type PhaseLabel = 'Foundation' | 'Build' | 'Launch' | 'Scale'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          subscription_tier: SubscriptionTier
          partner_id: string | null
          onboarding_complete: boolean
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          interview_data: Record<string, unknown>
          shadow_vision: string | null
          daily_template: DailyTemplate | null
          pillars: PillarSummaries | null
          gym_program: GymProgram | null
          reading_list: ReadingBook[] | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      monthly_plans: {
        Row: {
          id: string
          user_id: string
          month_number: number
          month_label: string
          phase: PhaseLabel
          phase_color: string
          pills: MonthPill[]
          family_items: MonthItem[]
          gym_items: MonthItem[]
          reading_items: MonthItem[]
          event_items: MonthItem[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['monthly_plans']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['monthly_plans']['Insert']>
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          month_target: number
          title: string
          description: string
          pillar: MilestoneType
          achieved_at: string | null
          tags: MilestoneTag[]
        }
        Insert: Omit<Database['public']['Tables']['milestones']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['milestones']['Insert']>
      }
      checkins: {
        Row: {
          id: string
          user_id: string
          type: 'weekly' | 'monthly'
          week_number: number | null
          month_number: number | null
          family_score: number
          body_score: number
          mind_score: number
          work_score: number
          notes: string | null
          ai_insight: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['checkins']['Insert']>
      }
      couple_workspaces: {
        Row: {
          id: string
          partner_a: string
          partner_b: string
          shared_vision: string | null
          shared_goals: Record<string, unknown>
          connection_plan: Record<string, unknown>
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['couple_workspaces']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['couple_workspaces']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          type: ConversationType
          messages: ConversationMessage[]
          summary: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
    }
  }
}

// Nested types
export interface DailyBlock {
  time: string
  title: string
  description: string
  pillar: PillarKey | 'ritual' | 'transition'
  duration_min: number
}

export interface DailyTemplate {
  blocks: DailyBlock[]
  weekly_anchors: string[]
  system_rules: string[]
}

export interface PillarSummary {
  headline_metric: string
  unit: string
  description: string
}

export type PillarSummaries = Record<PillarKey, PillarSummary>

export interface GymPhase {
  phase: string
  months: string
  name: string
  detail: string
  goal: string
}

export interface GymProgram {
  phases: GymPhase[]
  non_negotiables: string[]
}

export interface ReadingBook {
  number: number
  title: string
  author: string
  category: string
  reason: string
}

export interface MonthItem {
  text: string
  sub: string
  highlight: boolean
}

export interface MonthPill {
  label: string
  type: 'blue' | 'green' | 'purple' | 'gold'
}

export interface MilestoneTag {
  label: string
  type: 'gold' | 'green' | 'blue' | 'purple'
}

export interface TravelPlan {
  month_label: string
  name: string
  detail: string
  type: 'couple' | 'family' | 'day' | 'solo'
  nights: number
}

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface HabitDxContext {
  user: {
    name: string
    relationship_status: RelationshipStatus
    months_active: number
    current_month: number
  }
  shadow_vision: string
  current_phase: PhaseLabel
  this_month: {
    label: string
    family_priorities: string[]
    gym_priorities: string[]
    reading_priorities: string[]
    milestones: string[]
    highlights: string[]
  }
  recent_checkins: CheckinSummary[]
  gym_program: {
    current_phase: string
    current_program: string
  }
  reading: {
    current_book: string
    books_completed: number
    target: number
  }
  upcoming_events: string[]
  streak_data: {
    gym_weeks_consistent: number
    checkins_completed: number
    date_nights_logged: number
  }
}

export interface CheckinSummary {
  week: number
  family: number
  body: number
  mind: number
  work: number
  note: string
}
