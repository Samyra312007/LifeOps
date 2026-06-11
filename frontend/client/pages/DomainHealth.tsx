import Layout from "@/components/Layout";
import { Heart, Activity, Moon, Dumbbell, Link2, Sparkles, ArrowUpRight } from "lucide-react";
import { useConnectors } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

export default function DomainHealth() {
  const { data: connectors } = useConnectors();
  const isConnected = connectors?.some((c: any) => (c.source === "fit" || c.source === "strava") && c.status === "active");

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Heart size={12} className="fill-primary" />
                Biological Telemetry
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Health</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Synthesized wellness metrics from your connected devices and health ecosystems.
            </p>
          </div>
          {!isConnected && (
            <Button onClick={() => window.location.href = "/connect-sources"} className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20">
              <Link2 size={18} />
              Connect Device
            </Button>
          )}
        </header>

        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all duration-500">
                  <Activity size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Step Trajectory</h3>
              <p className="text-5xl font-bold text-foreground mb-2">--</p>
              <p className="text-sm text-muted-foreground font-medium italic">Target: 10k daily</p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center text-error group-hover:bg-error group-hover:text-white transition-all duration-500">
                  <Heart size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Resting Vitals</h3>
              <p className="text-5xl font-bold text-foreground mb-2">--</p>
              <p className="text-sm text-muted-foreground font-medium italic">bpm resting avg</p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                  <Moon size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Sleep Recovery</h3>
              <p className="text-5xl font-bold text-foreground mb-2">--</p>
              <p className="text-sm text-muted-foreground font-medium italic">hours avg · high quality</p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  <Dumbbell size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Executive Fitness</h3>
              <p className="text-5xl font-bold text-foreground mb-2">--</p>
              <p className="text-sm text-muted-foreground font-medium italic">min/week activity</p>
            </div>
          </div>
        ) : (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <Heart size={80} className="mx-auto text-error mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Biological Sync Required</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              To provide health insights and correlate them with your productivity, please connect a biometric data source.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/connect-sources"}>
              Connect Health Source
            </Button>
          </div>
        )}

        <footer className="pt-12 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-sm font-medium">LifeOps utilizes end-to-end encrypted biometric data processing.</p>
        </footer>
      </div>
    </Layout>
  );
}
