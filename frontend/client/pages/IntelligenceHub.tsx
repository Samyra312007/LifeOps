import Layout from "@/components/Layout";
import { useInsights, usePatterns } from "@/hooks/use-api";
import { Brain, TrendingUp, AlertCircle, CheckCircle2, BarChart3, Zap, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IntelligenceHub() {
  const { data: insights } = useInsights();
  const { data: patterns } = usePatterns();

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Brain size={12} className="fill-primary" />
                Neural Network Analytics
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Intelligence Hub</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Advanced pattern recognition and cross-domain trend analysis. Discover the hidden telemetry of your daily life.
            </p>
        </header>

        {/* High-Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                <TrendingUp size={24} />
              </div>
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Follow-Through</h3>
            <p className="text-5xl font-bold text-foreground mb-2">
              {insights?.follow_through_rate ? `${Math.round(insights.follow_through_rate.rate * 100)}%` : "--"}
            </p>
            <p className="text-sm text-muted-foreground font-medium italic">
              {insights?.follow_through_rate?.followed || 0} of {insights?.follow_through_rate?.total || 0} actions verified
            </p>
          </div>

          <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <AlertCircle size={24} />
              </div>
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Live Patterns</h3>
            <p className="text-5xl font-bold text-foreground mb-2">{insights?.active_patterns?.length || 0}</p>
            <p className="text-sm text-muted-foreground font-medium italic">Anomalies currently being tracked</p>
          </div>

          <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <BarChart3 size={24} />
              </div>
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Decisions</h3>
            <p className="text-5xl font-bold text-foreground mb-2">{insights?.recent_decisions?.length || 0}</p>
            <p className="text-sm text-muted-foreground font-medium italic">Strategic choices executed</p>
          </div>
        </div>

        {/* Pattern Detailed View */}
        {insights?.active_patterns && insights.active_patterns.length > 0 && (
          <div className="mb-16">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-8">Detected Patterns</h2>
            <div className="space-y-6">
              {insights.active_patterns.map((p: any, i: number) => (
                <div key={i} className="editorial-card group hover:translate-x-2 transition-all duration-500 border-l-4 border-primary">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground mb-2">
                        {p.insight || p.pattern_type || `Pattern ${i + 1}`}
                      </div>
                      {p.description && (
                        <p className="text-lg text-muted-foreground font-medium leading-relaxed italic">"{p.description}"</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                        {p.severity && (
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl ${
                            p.severity === "high" ? "bg-error/10 text-error" :
                            p.severity === "medium" ? "bg-warning/10 text-warning" :
                            "bg-success/10 text-success"
                        }`}>{p.severity} Priority</span>
                        )}
                        <Button variant="ghost" className="rounded-xl h-10 px-4 font-bold gap-2">
                            Mitigate
                            <Zap size={14} className="fill-current" />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision History */}
        {insights?.recent_decisions && insights.recent_decisions.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-8">Decision Registry</h2>
            <div className="space-y-4">
              {insights.recent_decisions.map((d: any, i: number) => (
                <div key={i} className="flex items-center gap-6 p-6 glass rounded-2xl border-white/5 group hover:bg-primary/5 transition-all duration-500">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.selected ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {d.selected ? <CheckCircle2 size={20} /> : <Zap size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-foreground truncate">{d.query}</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently"}
                    </p>
                  </div>
                  <ArrowUpRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {(!insights?.active_patterns || insights.active_patterns.length === 0) &&
         (!insights?.recent_decisions || insights.recent_decisions.length === 0) && (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <Brain size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Data Horizon Clear</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              The neural engine has not detected significant patterns yet. Continue connecting data sources to deepen the telemetry.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/connect-sources"}>
              Expand Data Sources
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
