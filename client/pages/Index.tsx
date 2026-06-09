import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useMorningBrief, useAlerts } from "@/hooks/use-api";
import { AlertCircle, ChevronRight, Eye, Sparkles } from "lucide-react";

export default function Index() {
  const { data: brief, isLoading: briefLoading } = useMorningBrief();
  const { data: alerts } = useAlerts(true);

  const alert = alerts?.alerts?.[0];
  const overview = brief?.sections?.find((s) => s.id === "overview");
  const focus = brief?.sections?.find((s) => s.id === "focus");

  if (briefLoading) {
    return (
      <Layout>
        <div className="p-8 animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-24 bg-muted rounded-lg" />
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {focus?.content || "Good morning."}
            </h1>
            <p className="text-muted-foreground mt-1">
              {brief?.date ? new Date(brief.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              All systems synced
            </button>
            <div className="w-2 h-2 rounded-full bg-success" />
          </div>
        </div>

        {alert && (
          <div className="bg-yellow-50 border-l-4 border-warning rounded-lg p-4 mb-8 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">{alert.title}</h3>
                <p className="text-sm text-foreground mt-1">{alert.body}</p>
              </div>
            </div>
            <button className="bg-warning text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap hover:bg-opacity-90 transition-colors flex items-center gap-2">
              <Sparkles size={16} /> Act
            </button>
          </div>
        )}

        {overview && (
          <div className="mb-8 p-4 bg-card border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">{overview.content}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <Link to="/ask-lifeops" className="bg-blue-50 rounded-lg p-6 border border-blue-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Ask LifeOps</h3>
            <p className="text-sm text-blue-700 mb-4">Get a cross-domain answer based on your connected data</p>
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2">
              <input readOnly type="text" placeholder="What should I focus on?" className="flex-1 bg-transparent text-sm outline-none" />
              <button className="bg-primary text-white p-2 rounded-full">
                <Eye size={16} />
              </button>
            </div>
          </Link>

          <Link to="/morning-brief" className="bg-white rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-3">Morning Brief</h3>
            <p className="text-xs text-muted-foreground mb-4">Your daily overview and recommended actions</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">View brief</span>
              <ChevronRight size={16} className="text-primary" />
            </div>
          </Link>

          <Link to="/weekly-review" className="bg-white rounded-lg p-6 border border-border hover:shadow-md transition-shadow">
            <h3 className="text-sm font-semibold text-foreground mb-3">Weekly Review</h3>
            <p className="text-xs text-muted-foreground mb-4">Patterns, trends, and forecast for the week ahead</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Open review</span>
              <ChevronRight size={16} className="text-primary" />
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
