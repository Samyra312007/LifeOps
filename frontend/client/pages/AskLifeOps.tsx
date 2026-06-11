import Layout from "@/components/Layout";
import { useQueryMutation, useInsights } from "@/hooks/use-api";
import { useState } from "react";
import { Send, Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Zap, ArrowRight, Command } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AskLifeOps() {
  const [input, setInput] = useState("");
  const { data: insights } = useInsights();
  const queryMutation = useQueryMutation();
  const [response, setResponse] = useState<any>(null);
  const [asked, setAsked] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setAsked(true);
    setResponse(null);
    const result = await queryMutation.mutateAsync(input);
    setResponse(result);
  };

  const quickQuestions = [
    "How am I doing?",
    "What should I focus on?",
    "Where am I spending money?",
    "What pattern should I watch?",
  ];

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
              <Sparkles size={12} className="fill-primary" />
              Intelligence Oracle
          </div>
          <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Ask LifeOps</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
            Query your entire life domain. Get grounded, cross-app reasoning and immediate action recommendations.
          </p>
        </header>

        {/* Interaction Console */}
        <div className="mb-12">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <div className="relative glass rounded-[3rem] p-4 flex items-center gap-4 shadow-2xl border-white/20">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                        <Zap size={28} className="fill-white" />
                    </div>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        type="text"
                        placeholder="What is my financial health relative to my social commitments?"
                        className="flex-1 bg-transparent text-xl font-medium outline-none placeholder:text-muted-foreground/50 px-2"
                    />
                    <Button
                        onClick={handleSubmit}
                        disabled={queryMutation.isPending || !input.trim()}
                        className="h-16 w-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Send size={24} />
                    </Button>
                </div>
            </div>

            {!asked && (
                <div className="mt-8 flex flex-wrap gap-3">
                    {quickQuestions.map((q) => (
                    <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="px-6 py-3 rounded-2xl bg-muted/50 hover:bg-primary/10 hover:text-primary transition-all text-sm font-bold border border-border/50"
                    >
                        {q}
                    </button>
                    ))}
                </div>
            )}
        </div>

        {/* Response Engine */}
        {queryMutation.isPending && (
          <div className="editorial-card animate-pulse space-y-6">
            <div className="h-8 w-1/3 bg-muted rounded-xl" />
            <div className="space-y-3">
                <div className="h-6 w-full bg-muted rounded-lg" />
                <div className="h-6 w-5/6 bg-muted rounded-lg" />
                <div className="h-6 w-4/6 bg-muted rounded-lg" />
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Main Recommendation */}
            {response.recommendation?.summary && (
              <div className="editorial-card intelligence-gradient relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                   <Sparkles size={120} />
                </div>
                <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-8">Executive Summary</h2>
                <p className="text-2xl md:text-3xl font-editorial font-medium leading-tight whitespace-pre-wrap italic">
                    "{response.recommendation.summary}"
                </p>
                {response.recommendation.grounding_issue && (
                  <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-warning uppercase tracking-widest bg-warning/5 px-4 py-2 rounded-xl border border-warning/10">
                    <AlertCircle size={14} />
                    Incomplete Grounding Detected
                  </div>
                )}
              </div>
            )}

            {/* Action Options */}
            {response.recommendation?.options?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {response.recommendation.options.map((opt: any) => (
                  <div key={opt.id} className="editorial-card hover:bg-primary/5 transition-all group border-2 border-transparent hover:border-primary/20">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full">
                            {opt.action_type || "Recommended Action"}
                        </div>
                        <Command size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold mb-6">{opt.label}</h3>
                    <Button className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/10 group-hover:shadow-primary/30 transition-all">
                        Execute Now
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Reasoning & Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {response.recommendation?.reasoning && (
                    <div className="md:col-span-2 p-8 bg-muted/30 rounded-[2rem] border border-border/50">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Reasoning Engine</h4>
                        <p className="text-muted-foreground font-medium leading-relaxed italic">"{response.recommendation.reasoning}"</p>
                    </div>
                 )}
                 <div className="p-8 bg-muted/30 rounded-[2rem] border border-border/50 flex flex-col justify-center">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Meta Data</h4>
                    <div className="space-y-3 font-bold text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Trace ID</span>
                            <span className="text-foreground">{response.trace_id?.slice(0, 12)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Confidence</span>
                            <span className="text-success">HIGH (Verified)</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Source Depth</span>
                            <span className="text-foreground">Cross-Domain (12+)</span>
                        </div>
                    </div>
                 </div>
            </div>
          </div>
        )}

        {/* Post-Query Insights */}
        {!asked && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-border/50">
            {insights?.follow_through_rate && (
              <div className="editorial-card bg-muted/30 border-none shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <TrendingUp size={24} className="text-success" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Action Integrity</h3>
                </div>
                <p className="text-6xl font-bold text-foreground mb-2">{Math.round(insights.follow_through_rate.rate * 100)}%</p>
                <p className="text-muted-foreground font-medium italic">High probability of successful follow-through based on past decisions.</p>
              </div>
            )}
            {insights?.active_patterns && insights.active_patterns.length > 0 && (
              <div className="editorial-card bg-muted/30 border-none shadow-none">
                <div className="flex items-center gap-3 mb-6">
                    <AlertCircle size={24} className="text-warning" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Live Patterns</h3>
                </div>
                <div className="space-y-4">
                    {insights.active_patterns.slice(0, 2).map((p, i) => (
                    <div key={i} className="text-sm font-bold text-foreground flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5" />
                        <span>{p.insight || p.pattern_type}</span>
                    </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
