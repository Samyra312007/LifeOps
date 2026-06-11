import Layout from "@/components/Layout";
import { useActions } from "@/hooks/use-api";
import { CheckSquare, CheckCircle2, AlertCircle, ChevronRight, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksActions() {
  const { data: actions, isLoading } = useActions();

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <CheckSquare size={12} className="fill-primary" />
                Action Queue
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Actions</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Strategic recommendations and verified executions. Close the loop from insight to impact.
            </p>
        </header>

        {isLoading && (
          <div className="space-y-6 animate-pulse">
            {[1,2,3].map((i) => <div key={i} className="h-32 bg-muted rounded-[2rem]" />)}
          </div>
        )}

        {actions && actions.length > 0 && (
          <div className="space-y-6">
            {actions.map((a: any) => (
              <div key={a.id} className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 flex items-start gap-8">
                <div className="mt-2">
                  {a.followed_through ? (
                    <div className="w-12 h-12 rounded-2xl bg-success/20 flex items-center justify-center text-success shadow-lg shadow-success/20">
                        <CheckCircle2 size={24} />
                    </div>
                  ) : a.followed_through === false ? (
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                        <AlertCircle size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl border-2 border-primary animate-pulse flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <Zap size={24} className="fill-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-foreground mb-3">{a.query}</div>
                  {a.recommendation && (
                    <p className="text-lg text-muted-foreground font-medium italic leading-relaxed mb-6 border-l-2 border-primary/20 pl-4 group-hover:border-primary transition-all">
                        "{a.recommendation}"
                    </p>
                  )}
                  <div className="flex items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>{a.created_at ? new Date(a.created_at).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }) : "Recently"}</span>
                    {a.selected_option && <span className="text-primary">Decision: {a.selected_option}</span>}
                  </div>
                </div>
                <Button className={`rounded-2xl h-14 px-8 font-bold gap-3 shadow-xl transition-all ${
                    a.followed_through ? "bg-success hover:bg-success/90 text-white shadow-success/20" : 
                    a.followed_through === false ? "variant-outline" : "bg-primary shadow-primary/20"
                }`}>
                  {a.followed_through ? "Verified" : a.followed_through === false ? "Review Outcome" : "Execute Now"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {actions && actions.length === 0 && (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <CheckSquare size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Queue Empty</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Ask LifeOps for strategic advice or specific help to populate your action queue.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/ask-lifeops"}>
              Consult Oracle
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
