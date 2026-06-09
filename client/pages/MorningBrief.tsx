import Layout from "@/components/Layout";
import { useMorningBrief } from "@/hooks/use-api";
import { ChevronRight, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function MorningBrief() {
  const { data: brief, isLoading } = useMorningBrief();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-8 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Morning Brief</h1>
            <p className="text-muted-foreground mt-1">
              {brief?.date ? new Date(brief.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-success/10 text-success px-3 py-1.5 rounded-full font-medium">
            <Clock size={14} /> Generated {brief?.date ? "today" : ""}
          </div>
        </div>

        <div className="space-y-4">
          {brief?.sections?.sort((a, b) => a.priority - b.priority).map((section) => (
            <div key={section.id} className="bg-white border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
            </div>
          ))}
        </div>

        {brief?.active_patterns && brief.active_patterns.length > 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Active Patterns</h3>
            {brief.active_patterns.map((p, i) => (
              <div key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
                <span>{typeof p === "string" ? p : p.insight || JSON.stringify(p)}</span>
              </div>
            ))}
          </div>
        )}

        <Link to="/ask-lifeops" className="mt-8 inline-flex items-center gap-2 text-primary text-sm font-medium hover:gap-3 transition-all">
          Ask LifeOps about today <ChevronRight size={16} />
        </Link>
      </div>
    </Layout>
  );
}
