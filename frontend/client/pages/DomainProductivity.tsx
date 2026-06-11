import Layout from "@/components/Layout";
import { Zap, CheckSquare, Clock, Target, ExternalLink, Plus, Link2, ArrowUpRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { useConnectors } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

export default function DomainProductivity() {
  const [showConnect, setShowConnect] = useState(false);
  const { data: connectors } = useConnectors();
  const isConnected = connectors?.some((c: any) => c.source === "todoist" && c.status === "active");

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Zap size={12} className="fill-primary" />
                Agile Execution
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Productivity</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Task velocity tracking and goal-oriented focus analysis. Your productivity, quantified.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => setShowConnect(true)} className="rounded-2xl h-12 px-6 font-bold gap-2 border-2">
                <ExternalLink size={18} />
                {isConnected ? "Manage Tool" : "Connect Integration"}
             </Button>
             {isConnected && (
                <Button className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20">
                    <Plus size={18} />
                    New Objective
                </Button>
             )}
          </div>
        </header>

        {isConnected ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all">
                    <CheckSquare size={20} />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Throughput</h3>
                <p className="text-3xl font-bold text-foreground">--</p>
                <p className="text-xs text-muted-foreground font-medium italic">Tasks closed this week</p>
              </div>

              <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Clock size={20} />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Deep Work</h3>
                <p className="text-3xl font-bold text-foreground">--</p>
                <p className="text-xs text-muted-foreground font-medium italic">Hours in focus mode</p>
              </div>

              <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <Target size={20} />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Objectives</h3>
                <p className="text-3xl font-bold text-foreground">--</p>
                <p className="text-xs text-muted-foreground font-medium italic">Active life goals</p>
              </div>

              <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-all">
                    <Zap size={20} />
                  </div>
                </div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Momentum</h3>
                <p className="text-3xl font-bold text-foreground">--</p>
                <p className="text-xs text-muted-foreground font-medium italic">Days in peak streak</p>
              </div>
            </div>

            <div className="editorial-card intelligence-gradient p-12 text-center rounded-[2rem] border-none">
                <p className="text-lg text-muted-foreground font-medium italic">Waiting for neural engine to sync recent Todoist activity...</p>
            </div>
          </div>
        ) : (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <Zap size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Agile Engine Offline</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Connect Todoist, Notion, or Trello to enable productivity velocity tracking and goal achievement analysis.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/connect-sources"}>
              Connect Ecosystem
            </Button>
          </div>
        )}

        {showConnect && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowConnect(false)}>
            <div className="glass rounded-[3rem] p-12 max-w-md w-full shadow-2xl border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <Zap size={48} className="text-primary mx-auto mb-8" />
              <h3 className="font-editorial text-3xl font-bold text-center mb-4 italic">Productivity Sync</h3>
              <p className="text-muted-foreground font-medium text-center mb-10">Integrate your task management ecosystem to allow LifeOps to prioritize your execution queue.</p>
              <div className="space-y-4">
                <Button onClick={() => { setShowConnect(false); window.location.href = "/connect-sources"; }} className="w-full h-14 rounded-2xl font-bold text-lg">
                    Go to Integrations
                </Button>
                <Button variant="ghost" onClick={() => setShowConnect(false)} className="w-full h-14 rounded-2xl font-bold text-muted-foreground">
                    Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
