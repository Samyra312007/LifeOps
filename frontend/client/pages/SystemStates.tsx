import Layout from "@/components/Layout";
import { CheckCircle2, AlertCircle, RefreshCw, Sparkles, Database, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState() {
  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
        <div className="editorial-card intelligence-gradient p-12 md:p-20 relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 p-12 opacity-10 animate-spin duration-[10000ms]">
            <RefreshCw size={240} />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
                <RefreshCw size={12} className="animate-spin" />
                Neural Sync in Progress
            </div>
            <h2 className="text-5xl md:text-6xl font-editorial font-bold tracking-tight mb-6 italic">
              Configuring your Intelligence.
            </h2>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl leading-relaxed">
              We're establishing secure bridges to your ecosystem and synthesizing your first pattern map.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                <SyncItem
                complete
                label="Temporal Matrix"
                detail="Calendar synced"
                />
                <SyncItem
                complete
                label="Social Registry"
                detail="Gmail processed"
                />
                <SyncItem
                loading
                label="Capital Nexus"
                detail="Plaid connecting"
                />
                <SyncItem
                label="Market Data"
                detail="Amazon queued"
                />
            </div>

            <div className="p-6 glass rounded-2xl border-white/5 inline-flex items-center gap-3 text-sm font-bold text-primary">
                <Sparkles size={18} />
                Your first Morning Brief will be ready at 07:00 tomorrow.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function EmptyState() {
  return (
    <Layout>
      <div className="py-24 max-w-4xl mx-auto text-center">
        <div className="relative inline-block mb-12">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="relative w-32 h-32 rounded-[3rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                <Sparkles size={64} className="fill-white" />
            </div>
        </div>
        
        <h2 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-6 italic italic text-balance">
            The Data Horizon is Clear.
        </h2>
        <p className="text-2xl text-muted-foreground font-medium mb-12 max-w-2xl mx-auto leading-relaxed text-balance">
            LifeOps requires telemetry to begin its analysis. Establish your first data bridge to unlock the neural engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30 group"
              onClick={() => window.location.href = "/connect-sources"}>
                Connect Primary App
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="h-16 px-10 rounded-3xl text-lg font-bold border-2">
                Manual Entry
            </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-16 font-bold uppercase tracking-widest opacity-50">
            Securely powering personal intelligence for professionals.
        </p>
      </div>
    </Layout>
  );
}

export function ErrorState() {
  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
        <div className="editorial-card border-2 border-error/20 bg-error/5 p-12 md:p-20 rounded-[3rem]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest mb-8">
            <AlertCircle size={12} />
            Bridge Integrity Alert
          </div>
          <h2 className="text-5xl font-editorial font-bold tracking-tight mb-4 italic">
            Sync disruption detected.
          </h2>
          <p className="text-xl text-muted-foreground font-medium mb-10 max-w-xl leading-relaxed">
            A capital institution requires manual re-authentication to continue data flow.
          </p>

          <div className="bg-background/50 backdrop-blur-md rounded-[2rem] p-8 mb-10 border border-error/10">
            <p className="text-lg font-bold text-foreground mb-4 italic leading-tight">
              "Financial recommendations are currently limited to historical patterns."
            </p>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                TEMPORAL, SOCIAL, AND HEALTH BRIDGES REMAIN ACTIVE.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-error hover:bg-error/90 text-white h-14 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-error/20">
              Restore Bridge
            </Button>
            <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-muted-foreground">
              Dismiss Warning
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SyncItem({
  label,
  detail,
  complete,
  loading,
}: {
  label: string;
  detail: string;
  complete?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="editorial-card p-6 flex items-center gap-4 bg-background/50 border border-border/50">
      <div className="flex-shrink-0">
        {complete ? (
          <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        ) : loading ? (
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center animate-spin">
            <RefreshCw size={20} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
            <Database size={20} />
          </div>
        )}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="font-bold text-foreground text-sm truncate">{label}</div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{detail}</div>
      </div>
    </div>
  );
}
