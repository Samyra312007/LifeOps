import Layout from "@/components/Layout";
import { useInsights, useTrends, usePatterns } from "@/hooks/use-api";
import { TrendingUp, TrendingDown, AlertTriangle, ChevronRight, BarChart3, Calendar, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function WeeklyReview() {
  const { data: insights } = useInsights();
  const { data: patterns } = usePatterns();
  const { data: trends } = useTrends(14);

  const activePatterns = Array.isArray(patterns)
    ? patterns.filter((p: any) => p.active)
    : insights?.active_patterns || [];

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <BarChart3 size={12} className="fill-primary" />
                Quantified Performance
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Weekly Review</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                A longitudinal analysis of your decisions, habits, and systemic performance over the last 7 days.
            </p>
        </header>

        {/* Follow-Through Target */}
        {insights?.follow_through_rate && (
          <div className="editorial-card intelligence-gradient mb-12 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                        <Target size={24} className="text-primary" />
                        <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Decision Integrity</h2>
                    </div>
                    <p className="text-6xl md:text-8xl font-bold text-foreground mb-4">
                        {Math.round(insights.follow_through_rate.rate * 100)}%
                    </p>
                    <p className="text-xl text-muted-foreground font-medium italic">
                        "{insights.follow_through_rate.followed} of {insights.follow_through_rate.total} strategic recommendations were successfully executed."
                    </p>
                </div>
                <div className="w-full md:w-64 h-4 bg-muted/30 rounded-full overflow-hidden border border-white/10 relative">
                    <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 shadow-lg shadow-primary/50"
                    style={{ width: `${insights.follow_through_rate.rate * 100}%` }}
                    />
                </div>
            </div>
          </div>
        )}

        {/* Weekly Anomalies */}
        {activePatterns.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle size={24} className="text-warning" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Systemic Anomalies</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePatterns.map((p: any, i: number) => (
                <div key={i} className="editorial-card hover:bg-warning/5 transition-all duration-500 border-2 border-transparent hover:border-warning/20">
                    <div className="flex items-center justify-between mb-6">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            p.active ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                        }`}>
                            {p.active ? "Active Trend" : "Stabilized"}
                        </span>
                        <Zap size={18} className="text-warning" />
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-3">{p.pattern_type || p.insight}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                        Confidence: {Math.round((p.confidence || 0.5) * 100)}% · {p.severity || "Standard"} Priority
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistical Trends */}
        {trends && trends.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-8">Telemetry (14 Day Window)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="editorial-card bg-muted/30 border-none">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Decisions Logged</div>
                <div className="text-6xl font-bold text-foreground font-editorial italic">
                  {trends.reduce((s: number, t: any) => s + (t.decisions_made || 0), 0)}
                </div>
              </div>
              <div className="editorial-card bg-muted/30 border-none">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Life Events Sync'd</div>
                <div className="text-6xl font-bold text-foreground font-editorial italic">
                  {trends.reduce((s: number, t: any) => s + (t.total_events || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="pt-12 border-t border-border/50">
            <Link to="/ask-lifeops">
                <Button className="h-16 px-10 rounded-3xl text-lg font-bold gap-3 group">
                    Request Deep Synthesis
                    <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Button>
            </Link>
        </footer>
      </div>
    </Layout>
  );
}
