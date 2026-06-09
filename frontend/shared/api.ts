export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  onboarding_completed: boolean;
  goals: LifeGoal[];
  preferences: UserPreferences;
  data_connectors: DataConnectorInfo[];
  created_at: string;
}

export interface LifeGoal {
  id: string;
  title: string;
  domain: string;
  target: string;
}

export interface UserPreferences {
  notification_frequency?: string;
  do_not_disturb_start?: string;
  do_not_disturb_end?: string;
  dietary_restrictions?: string[];
  meeting_limit_per_week?: number;
  subscription_spending_limit_monthly?: number;
}

export interface DataConnectorInfo {
  connector_id: string;
  source: string;
  status: "active" | "error" | "disconnected" | "pending";
  connected_at: string;
  last_sync_at?: string;
  error_message?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
}

export interface QueryResponse {
  trace_id: string;
  decision_id: string;
  plan: QueryPlan;
  context: QueryContext;
  recommendation: Recommendation;
}

export interface QueryPlan {
  intent: "informational" | "actionable" | "reflective" | "scheduling";
  domains: string[];
  sub_queries: SubQuery[];
  requires_cross_domain: boolean;
  complexity: "simple" | "moderate" | "complex";
}

export interface SubQuery {
  id: string;
  question: string;
  domain: string;
  required_data_sources: string[];
}

export interface QueryContext {
  relevant_memories: any[];
  cross_domain_results: any[];
  recent_trends: any[];
  context_quality: "low" | "medium" | "high";
}

export interface Recommendation {
  summary: string;
  options: ActionOption[];
  recommended_option_id: string;
  reasoning: string;
  grounding_issue?: string[];
}

export interface ActionOption {
  id: string;
  label: string;
  action_type: string;
  parameters?: Record<string, any>;
  pros: string[];
  cons: string[];
}

export interface BriefResponse {
  type: "morning" | "evening";
  date: string;
  sections: BriefSection[];
  active_patterns?: any[];
  pending_actions?: any[];
}

export interface BriefSection {
  id: string;
  title: string;
  content: string;
  priority: number;
}

export interface InsightsResponse {
  active_patterns: PatternInsight[];
  recent_decisions: DecisionSummary[];
  follow_through_rate: FollowThroughRate;
}

export interface PatternInsight {
  insight: string;
  pattern_type: string;
  priority: string;
  actionable: boolean;
}

export interface DecisionSummary {
  query: string;
  selected: string | null;
  created_at: string;
}

export interface FollowThroughRate {
  total: number;
  followed: number;
  rate: number;
}

export interface AlertItem {
  id: string;
  alert_type: string;
  domain: string;
  title: string;
  body: string;
  actions: AlertAction[];
  delivery_channel: string;
  delivered_at: string;
  read_at: string | null;
  is_critical: boolean;
}

export interface AlertAction {
  label: string;
  action_type: string;
  parameters: Record<string, any>;
}

export interface ConnectorItem {
  id: string;
  source: string;
  status: string;
  connected_at: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  error_message: string | null;
}

export interface DailySummary {
  user_id: string;
  date: string;
  sleep_score?: number;
  sleep_duration_minutes?: number;
  total_steps?: number;
  workout_completed?: boolean;
  meeting_count?: number;
  meeting_hours?: number;
  total_spend?: number;
  dining_spend?: number;
  subscriptions_active?: number;
  tasks_completed?: number;
  stress_score?: number;
  dominant_mood?: string;
}
