import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api";

// ─── Auth ───────────────────────────────────────────────────────

export function useAuth() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("lifeops_token");

  const profile = useQuery({
    queryKey: ["user", "me"],
    queryFn: api.getMe,
    enabled: !!token,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => api.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem("lifeops_token", data.access_token);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });

  const logout = () => {
    localStorage.removeItem("lifeops_token");
    queryClient.clear();
    window.location.href = "/";
  };

  return { profile, token, loginMutation, logout, isAuthenticated: !!token };
}

// ─── Brief ──────────────────────────────────────────────────────

export function useMorningBrief() {
  return useQuery({ queryKey: ["brief", "morning"], queryFn: api.getMorningBrief });
}

export function useEveningBrief() {
  return useQuery({ queryKey: ["brief", "evening"], queryFn: api.getEveningBrief });
}

// ─── Query ──────────────────────────────────────────────────────

export function useQueryMutation() {
  return useMutation({ mutationFn: (input: string) => api.query(input) });
}

// ─── Insights ───────────────────────────────────────────────────

export function useInsights() {
  return useQuery({ queryKey: ["insights"], queryFn: api.getInsights });
}

export function usePatterns() {
  return useQuery({ queryKey: ["patterns"], queryFn: api.getPatterns });
}

// ─── Actions ────────────────────────────────────────────────────

export function useActions() {
  return useQuery({ queryKey: ["actions"], queryFn: api.getActions });
}

export function useActionFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ decisionId, followedThrough, qualityScore }: { decisionId: string; followedThrough: boolean; qualityScore?: number }) =>
      api.actionFeedback(decisionId, followedThrough, qualityScore),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["actions"] }),
  });
}

// ─── Alerts ─────────────────────────────────────────────────────

export function useAlerts(unreadOnly = false) {
  return useQuery({ queryKey: ["alerts", unreadOnly], queryFn: () => api.getAlerts(unreadOnly) });
}

// ─── Connectors ─────────────────────────────────────────────────

export function useConnectors() {
  return useQuery({ queryKey: ["connectors"], queryFn: api.getConnectors });
}

export function useAvailableSources() {
  return useQuery({ queryKey: ["connectors", "sources"], queryFn: api.getAvailableSources });
}

// ─── Social ─────────────────────────────────────────────────────

export function useRelationships() {
  return useQuery({ queryKey: ["relationships"], queryFn: api.getRelationships });
}

// ─── Analytics ──────────────────────────────────────────────────

export function useTrends(days = 14) {
  return useQuery({ queryKey: ["trends", days], queryFn: () => api.getTrends(days) });
}

// ─── Features ───────────────────────────────────────────────────

export function useFinancialAnalysis(days = 30) {
  return useQuery({ queryKey: ["financial", "analysis", days], queryFn: () => api.getFinancialAnalysis(days) });
}

export function useBirthdays() {
  return useQuery({ queryKey: ["social", "birthdays"], queryFn: api.getUpcomingBirthdays });
}

export function useRelationshipHealth() {
  return useQuery({ queryKey: ["social", "relationship-health"], queryFn: api.getRelationshipHealth });
}

export function useSocialEvents() {
  return useQuery({ queryKey: ["social", "events"], queryFn: api.getSocialEvents });
}
