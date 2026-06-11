import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useMorningBrief, useAlerts, useAuth } from "@/hooks/use-api";
import { AlertCircle, ChevronRight, Eye, Sparkles, Zap, ArrowUpRight, Search, Brain, BarChart3, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  const { data: brief, isLoading: briefLoading } = useMorningBrief();
  const { data: alerts } = useAlerts(true);
  const { profile } = useAuth();

  const user = profile.data;
  const alert = alerts?.alerts?.[0];
  const overview = brief?.sections?.find((s) => s.id === "overview");
  const focus = brief?.sections?.find((s) => s.id === "focus");

  if (briefLoading) {
    return (
      <Layout>
        <div className="py-12 animate-pulse space-y-12">
          <div className="space-y-4">
            <div className="h-12 w-96 bg-muted rounded-2xl" />
            <div className="h-6 w-48 bg-muted rounded-xl" />
          </div>
          <div className="h-48 bg-muted rounded-[2rem]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-[2rem]" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
               Systems Synced
            </div>
            <h1 className="text-5xl md:text-6xl font-editorial font-bold tracking-tight mb-2">
              {focus?.content ? focus.content : `Good morning, ${user?.display_name?.split(" ")[0] || "User"}.`}
            </h1>
            <p className="text-xl text-muted-foreground font-medium">
              {brief?.date ? new Date(brief.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <Button variant="outline" className="rounded-2xl h-12 gap-2 border-2 px-6 font-bold">
                <Search size={18} />
                Global Search
             </Button>
             <Link to="/ask-lifeops">
               <Button className="rounded-2xl h-12 gap-2 px-6 font-bold shadow-lg shadow-primary/20 group">
                  <Zap size={18} className="group-hover:fill-white transition-all" />
                  Ask LifeOps
               </Button>
             </Link>
          </div>
        </header>

        {/* Actionable Alert */}
        {alert && (
          <div className="relative overflow-hidden group mb-12">
            <div className="absolute inset-0 bg-warning/5 group-hover:bg-warning/10 transition-colors duration-500 rounded-[2.5rem]" />
            <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-warning/20 rounded-[2.5rem]">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-3xl bg-warning/20 flex items-center justify-center text-warning flex-shrink-0">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{alert.title}</h3>
                  <p className="text-lg text-muted-foreground font-medium max-w-2xl">{alert.body}</p>
                </div>
              </div>
              <Button className="bg-warning hover:bg-warning/90 text-white rounded-2xl h-14 px-8 text-lg font-bold gap-3 shadow-xl shadow-warning/20 whitespace-nowrap">
                <Sparkles size={20} />
                Execute Mitigation
              </Button>
            </div>
          </div>
        )}

        {/* Intelligence Overview */}
        {overview && (
          <div className="editorial-card intelligence-gradient mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
               <Brain size={120} />
            </div>
            <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Synthesis Overview</h4>
            <p className="text-2xl md:text-3xl font-editorial font-medium leading-tight max-w-4xl">{overview.content}</p>
          </div>
        )}

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/morning-brief" className="editorial-card group hover:bg-primary/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Sun size={28} />
               </div>
               <ArrowUpRight size={24} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Daily Brief</h3>
            <p className="text-muted-foreground font-medium">Your synthesized agenda, health metrics, and financial status.</p>
          </Link>

          <Link to="/intelligence" className="editorial-card group hover:bg-primary/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Brain size={28} />
               </div>
               <ArrowUpRight size={24} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Intelligence Hub</h3>
            <p className="text-muted-foreground font-medium">Deep-dive into cross-domain patterns and predictive trends.</p>
          </Link>

          <Link to="/weekly-review" className="editorial-card group hover:bg-primary/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <BarChart3 size={28} />
               </div>
               <ArrowUpRight size={24} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Weekly Review</h3>
            <p className="text-muted-foreground font-medium">Quantified progress report across all life domains.</p>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
