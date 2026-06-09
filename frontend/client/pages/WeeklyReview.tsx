import Layout from "@/components/Layout";
import { useInsights, useTrends, usePatterns } from "@/hooks/use-api";
import { TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function WeeklyReview() {
  const { data: insights } = useInsights();
  const { data: patterns } = usePatterns();
  const { data: trends } = useTrends(14);

  const activePatterns = Array.isArray(patterns)
    ? patterns.filter((p: any) => p.active)
    : insights?.active_patterns || [];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Weekly Review</h1>
            <p className="text-muted-foreground mt-1 text-sm">Updated today</p>
          </div>
        </div>

        {insights?.follow_through_rate && (
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Follow-Through Rate</h2>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-4xl font-bold text-foreground">{Math.round(insights.follow_through_rate.rate * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {insights.follow_through_rate.followed} of {insights.follow_through_rate.total} decisions followed through
                </p>
              </div>
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${insights.follow_through_rate.rate * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {activePatterns.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-warning" />
              <h2 className="text-sm font-semibold text-foreground">Active Patterns</h2>
            </div>
            <div className="space-y-3">
              {activePatterns.map((p: any, i: number) => (
                <div key={i} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-foreground">{p.pattern_type || p.insight}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Confidence: {Math.round((p.confidence || 0.5) * 100)}% · {p.severity || "medium"} severity
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.active ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                  }`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {insights?.recent_decisions && insights.recent_decisions.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Recent Decisions</h2>
            <div className="space-y-2">
              {insights.recent_decisions.slice(0, 5).map((d: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
                  <span className="text-foreground">{d.query}</span>
                  <span className={`text-xs ${d.selected ? "text-success" : "text-muted-foreground"}`}>
                    {d.selected ? "Decided" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {trends && trends.length > 0 && (
          <div className="bg-white border border-border rounded-lg p-6 mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">Trends ({trends.length} days)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Total decisions</div>
                <div className="text-lg font-bold text-foreground">
                  {trends.reduce((s: number, t: any) => s + (t.decisions_made || 0), 0)}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Total events</div>
                <div className="text-lg font-bold text-foreground">
                  {trends.reduce((s: number, t: any) => s + (t.total_events || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        <Link to="/ask-lifeops" className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all">
          Get a detailed analysis <ChevronRight size={16} />
        </Link>
      </div>
    </Layout>
  );
}
