import Layout from "@/components/Layout";
import { useMorningBrief } from "@/hooks/use-api";
import { ChevronRight, Clock, Sparkles, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MorningBrief() {
  const { data: brief, isLoading } = useMorningBrief();

  if (isLoading) {
    return (
      <Layout>
        <div className="py-12 animate-pulse space-y-12">
          <div className="space-y-4">
             <div className="h-12 w-64 bg-muted rounded-2xl" />
             <div className="h-6 w-48 bg-muted rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-[2rem]" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Editorial Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
                <Sparkles size={12} className="fill-primary" />
                Intelligence Generated
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Morning Brief</h1>
            <p className="text-2xl text-muted-foreground font-medium">
              {brief?.date ? new Date(brief.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : "Today"}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground bg-muted/50 px-5 py-3 rounded-2xl">
            <Clock size={18} />
            <span>Last Sync: {brief?.date ? new Date(brief.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
          </div>
        </header>

        {/* Intelligence Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {brief?.sections?.sort((a, b) => a.priority - b.priority).map((section) => (
            <div key={section.id} className={`editorial-card group hover:bg-primary/5 transition-all duration-500 ${section.id === 'overview' ? 'md:col-span-2 intelligence-gradient' : ''}`}>
               <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">{section.title}</h2>
               <p className={`text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap ${section.id === 'overview' ? 'text-2xl md:text-3xl font-editorial italic' : 'text-lg'}`}>
                  {section.content}
               </p>
            </div>
          ))}
        </div>

        {/* Active Pattern Alerts */}
        {brief?.active_patterns && brief.active_patterns.length > 0 && (
          <div className="relative overflow-hidden mb-16">
             <div className="absolute inset-0 bg-warning/5 rounded-[3rem]" />
             <div className="relative p-10 border-2 border-warning/10 rounded-[3rem]">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-warning/20 flex items-center justify-center text-warning">
                        <Zap size={20} className="fill-warning" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">Active Pattern Detected</h3>
                </div>
                <div className="space-y-6">
                    {brief.active_patterns.map((p, i) => (
                    <div key={i} className="text-xl font-medium text-foreground flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-warning mt-2.5 flex-shrink-0" />
                        <span>{typeof p === "string" ? p : p.insight || JSON.stringify(p)}</span>
                    </div>
                    ))}
                </div>
                <div className="mt-10">
                    <Button className="bg-warning hover:bg-warning/90 text-white rounded-2xl h-12 px-8 font-bold gap-2 shadow-xl shadow-warning/20">
                        Take Mitigation Action
                        <ArrowRight size={18} />
                    </Button>
                </div>
             </div>
          </div>
        )}

        <footer className="flex justify-center pt-8">
            <Link to="/ask-lifeops">
                <Button variant="ghost" className="h-16 px-10 rounded-3xl text-lg font-bold group gap-3 hover:bg-primary/10 hover:text-primary transition-all">
                    Ask LifeOps about today
                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </Button>
            </Link>
        </footer>
      </div>
    </Layout>
  );
}
