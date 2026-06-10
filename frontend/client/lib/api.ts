const API_BASE = "/api/v1";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("lifeops_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    if (res.status === 401 && token) {
      localStorage.removeItem("lifeops_token");
      window.location.href = "/auth";
    }
    throw new Error(`${res.status}: ${await res.text()}`);
  }
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  onboarding_completed: boolean;
  goals: any[];
  preferences: Record<string, any>;
  data_connectors: any[];
  created_at: string;
}

export async function register(email: string, password: string, display_name: string) {
  return request<{ access_token: string; token_type: string; user_id: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
}

export async function login(email: string, password: string) {
  return request<{ access_token: string; token_type: string; user_id: string }>(
    `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    { method: "POST" },
  );
}

export async function getMe() {
  return request<UserProfile>("/auth/me");
}

// ─── Query ──────────────────────────────────────────────────────

export interface QueryResponse {
  trace_id: string;
  decision_id: string;
  plan: any;
  context: any;
  recommendation: {
    summary: string;
    options: { id: string; label: string; action_type: string; pros: string[]; cons: string[] }[];
    recommended_option_id: string;
    reasoning: string;
    grounding_issue?: string[];
  };
}

export async function query(input: string) {
  return request<QueryResponse>(`/query?query=${encodeURIComponent(input)}`, { method: "POST" });
}

// ─── Execute ────────────────────────────────────────────────────

export async function executeAction(traceId: string, actionId: string, parameters: Record<string, any> = {}) {
  return request<{ status: string; result: any; trace_id: string }>(
    `/execute?trace_id=${traceId}&action_id=${actionId}`,
    { method: "POST", body: JSON.stringify(parameters) },
  );
}

// ─── Brief ──────────────────────────────────────────────────────

export interface BriefResponse {
  type: string;
  date: string;
  sections: { id: string; title: string; content: string; priority: number }[];
  active_patterns?: any[];
  pending_actions?: any[];
}

export async function getMorningBrief() {
  return request<BriefResponse>("/brief/morning");
}

export async function getEveningBrief() {
  return request<BriefResponse>("/brief/evening");
}

// ─── Insights ───────────────────────────────────────────────────

export interface InsightsResponse {
  active_patterns: any[];
  recent_decisions: any[];
  follow_through_rate: { total: number; followed: number; rate: number };
}

export async function getInsights() {
  return request<InsightsResponse>("/insights");
}

export async function getPatterns() {
  return request<any[]>("/patterns");
}

export async function scanPatterns() {
  return request<{ detections: any[]; count: number }>("/insights/scan", { method: "POST" });
}

// ─── Actions ────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  query: string;
  recommendation: string;
  selected_option: string | null;
  followed_through: boolean | null;
  created_at: string;
}

export async function getActions() {
  return request<ActionItem[]>("/actions");
}

export async function actionFeedback(decisionId: string, followedThrough: boolean, qualityScore?: number) {
  let path = `/actions/${decisionId}/feedback?was_followed_through=${followedThrough}`;
  if (qualityScore !== undefined) path += `&quality_score=${qualityScore}`;
  return request<{ status: string }>(path, { method: "POST" });
}

// ─── Alerts ─────────────────────────────────────────────────────

export interface AlertItem {
  id: string;
  user_id: string;
  alert_type: string;
  domain: string;
  title: string;
  body: string;
  actions: { label: string; action_type: string; parameters: Record<string, any> }[];
  delivery_channel: string;
  delivered_at: string;
  read_at: string | null;
  is_critical: boolean;
}

export async function getAlerts(unreadOnly = false) {
  return request<{ alerts: AlertItem[]; unread_count: number }>(`/alerts?unread_only=${unreadOnly}`);
}

export async function markAlertRead(alertId: string) {
  return request<{ status: string }>(`/alerts/${alertId}/read`, { method: "POST" });
}

export async function respondToAlert(alertId: string, action: string, actionId?: string) {
  let path = `/alerts/${alertId}/respond?action=${action}`;
  if (actionId) path += `&action_id=${actionId}`;
  return request<{ status: string }>(path, { method: "POST" });
}

// ─── Connectors ─────────────────────────────────────────────────

export interface ConnectorItem {
  id: string;
  source: string;
  status: string;
  connected_at: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  error_message: string | null;
}

export async function getConnectors() {
  return request<ConnectorItem[]>("/connectors");
}

export async function registerConnector(source: string, token?: string) {
  let path = `/connectors/register?source=${source}`;
  if (token) path += `&oauth_token=${token}`;
  return request<{ id: string; source: string; status: string }>(path, { method: "POST" });
}

export async function syncConnector(connectorId: string) {
  return request<{ status: string; connector_id: string; records_synced: number }>(
    `/connectors/${connectorId}/sync`, { method: "POST" },
  );
}

export async function disconnectConnector(connectorId: string) {
  return request<{ status: string }>(`/connectors/${connectorId}`, { method: "DELETE" });
}

export async function getAvailableSources() {
  return request<{ sources: string[] }>("/connectors/sources");
}

// ─── Social / Relationships ─────────────────────────────────────

export interface RelationshipItem {
  id: string;
  contact_email: string;
  contact_name: string;
  relationship_type: string;
  important_dates: any[];
  last_contact: string | null;
  importance_score: number;
}

export async function getRelationships() {
  return request<RelationshipItem[]>("/social/relationships");
}

export async function addRelationship(data: Partial<RelationshipItem>) {
  return request<{ id: string }>("/social/relationships", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteRelationship(id: string) {
  return request<{ status: string }>(`/social/relationships/${id}`, { method: "DELETE" });
}

// ─── Analytics ──────────────────────────────────────────────────

export async function getTrends(days = 14) {
  return request<any[]>(`/analytics/trends?days=${days}`);
}

export async function getDailySummary(date?: string) {
  let path = "/analytics/daily-summary";
  if (date) path += `?date=${date}`;
  return request<any[]>(path);
}

// ─── Features ───────────────────────────────────────────────────

export async function planDinnerParty(guests: string[], budget = 200, date?: string, dietary: string[] = []) {
  let path = `/features/dinner-party/plan?guests=${guests.map(encodeURIComponent).join("&guests=")}&budget=${budget}`;
  if (date) path += `&date=${date}`;
  for (const d of dietary) path += `&dietary_preferences=${encodeURIComponent(d)}`;
  return request<any>(path, { method: "POST" });
}

export async function getPartyHistory() {
  return request<any[]>("/features/dinner-party/history");
}

export async function getFinancialAnalysis(days = 30) {
  return request<any>(`/features/financial/analysis?days=${days}`);
}

export async function getSubscriptionAudit() {
  return request<any>("/features/financial/subscriptions");
}

export async function getUpcomingBirthdays() {
  return request<any[]>("/features/social/birthdays");
}

export async function getRelationshipHealth() {
  return request<any[]>("/features/social/relationship-health");
}

export async function getGiftSuggestion(relationshipId: string) {
  return request<any>(`/features/social/gift-suggestions/${relationshipId}`);
}

export async function getSocialEvents() {
  return request<any[]>("/features/social/events");
}

// ─── Onboarding ─────────────────────────────────────────────────

export async function completeOnboarding(data: {
  goals?: any[];
  preferences?: Record<string, any>;
  wake_time?: string;
  bed_time?: string;
  data_connectors?: string[];
}) {
  return request<{ status: string }>("/onboarding/complete", { method: "POST", body: JSON.stringify(data) });
}

// ─── GDPR ───────────────────────────────────────────────────────

export async function exportUserData() {
  return request<any>("/gdpr/export");
}

export async function deleteUserData() {
  return request<any>("/gdpr/delete", { method: "DELETE" });
}

// ─── Admin ──────────────────────────────────────────────────────

export async function healthCheck() {
  return request<{ status: string; database: string; elasticsearch?: string }>("/admin/health");
}
