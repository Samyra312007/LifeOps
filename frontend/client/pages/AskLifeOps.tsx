import Layout from "@/components/Layout";
import { useQueryMutation, useInsights } from "@/hooks/use-api";
import { useState } from "react";
import { Send, Sparkles, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";

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
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ask LifeOps</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {insights?.recent_decisions?.length || 0} decisions tracked · {insights?.follow_through_rate ? `${Math.round(insights.follow_through_rate.rate * 100)}% follow-through` : ""}
            </p>
          </div>
        </div>

        {!asked && (
          <div className="flex flex-wrap gap-2 mb-6">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => { setInput(q); }}
                className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-3 mb-6 shadow-sm">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            type="text"
            placeholder="Ask LifeOps anything..."
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={queryMutation.isPending || !input.trim()}
            className="bg-primary text-white p-2 rounded-full hover:bg-opacity-90 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>

        {queryMutation.isPending && (
          <div className="bg-muted/50 rounded-lg p-6 animate-pulse space-y-3">
            <div className="h-4 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-4 w-2/3 bg-muted rounded" />
          </div>
        )}

        {response && (
          <div className="space-y-4">
            {response.recommendation?.summary && (
              <div className="bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">LifeOps Response</h2>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{response.recommendation.summary}</p>
                {response.recommendation.grounding_issue && (
                  <p className="text-xs text-warning mt-2">Some claims couldn't be verified from your data.</p>
                )}
              </div>
            )}

            {response.recommendation?.options?.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">Options</h3>
                <div className="space-y-2">
                  {response.recommendation.options.map((opt: any) => (
                    <div key={opt.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-foreground">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{opt.action_type}</div>
                      </div>
                      <button className="text-xs bg-primary text-white px-3 py-1 rounded-full">Do this</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {response.recommendation?.reasoning && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Reasoning</h4>
                <p className="text-sm text-muted-foreground">{response.recommendation.reasoning}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Trace: {response.trace_id?.slice(0, 8)}...</span>
              <span>Decision: {response.decision_id?.slice(0, 8)}...</span>
              <span className="text-success">Confidence: {response.recommendation?.recommended_option_id ? "high" : "moderate"}</span>
            </div>
          </div>
        )}

        {!asked && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            {insights?.follow_through_rate && (
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <TrendingUp size={16} className="text-success" /> Follow-Through
                </div>
                <p className="text-2xl font-bold text-foreground">{Math.round(insights.follow_through_rate.rate * 100)}%</p>
                <p className="text-xs text-muted-foreground mt-1">{insights.follow_through_rate.followed} of {insights.follow_through_rate.total} actions completed</p>
              </div>
            )}
            {insights?.active_patterns && insights.active_patterns.length > 0 && (
              <div className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <AlertCircle size={16} className="text-warning" /> Active Patterns
                </div>
                {insights.active_patterns.slice(0, 3).map((p, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                    <span>•</span> {p.insight || p.pattern_type}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
