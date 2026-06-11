import Layout from "@/components/Layout";
import { Users, Gift, Heart, Calendar, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { useRelationships, useBirthdays, useRelationshipHealth, useSocialEvents } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

export default function DomainSocial() {
  const { data: relationships } = useRelationships();
  const { data: birthdays } = useBirthdays();
  const { data: health } = useRelationshipHealth();
  const { data: events } = useSocialEvents();

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Users size={12} className="fill-primary" />
                Relational Intelligence
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Social</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Strategic relationship management. Track connection health, upcoming celebrations, and meaningful interactions.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20">
                <Plus size={18} />
                Add Relationship
             </Button>
          </div>
        </header>

        {/* High Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <Users size={28} />
              </div>
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Connections</h3>
            <p className="text-5xl font-bold text-foreground mb-2">{relationships?.length || 0}</p>
            <p className="text-sm text-muted-foreground font-medium italic">Managed Relationship Index</p>
          </div>

          <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
            <div className="flex items-center justify-between mb-8">
              <div className="w-14 h-14 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                <Gift size={28} />
              </div>
              <ArrowUpRight size={20} className="text-muted-foreground" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Priority celebrations</h3>
            <p className="text-5xl font-bold text-foreground mb-2">{birthdays?.length || 0}</p>
            <p className="text-sm text-muted-foreground font-medium italic">Upcoming Birthdays & Events</p>
          </div>
        </div>

        {/* Relationship Health */}
        {health && health.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Heart size={24} className="text-error" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em]">Network Integrity</h2>
            </div>
            <div className="space-y-4">
              {health.slice(0, 5).map((r: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-6 glass rounded-[2rem] border-white/5 hover:bg-primary/5 transition-all duration-500">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-lg">
                        {r.contact_name?.[0] || r.contact_email?.[0] || "?"}
                    </div>
                    <div>
                        <span className="text-xl font-bold text-foreground">{r.contact_name || r.contact_email}</span>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Last Interaction: 4 days ago</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-xl ${
                        r.health === "healthy" ? "bg-success/10 text-success" :
                        r.health === "needs_attention" ? "bg-warning/10 text-warning" :
                        "bg-error/10 text-error"
                    }`}>{r.health.replace("_", " ")}</span>
                    <Button variant="ghost" size="sm" className="rounded-xl h-10 w-10 p-0 border">
                        <ArrowUpRight size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!relationships || relationships.length === 0) && (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <Users size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Social Network Offline</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                Connect your social accounts or manually add high-value contacts to enable relationship health tracking and celebration alerts.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30">
              Onboard Priority Contacts
            </Button>
          </div>
        )}

        <footer className="pt-12 border-t border-border/50 text-center">
             <div className="inline-flex items-center gap-2 text-muted-foreground text-sm font-medium">
                <Sparkles size={14} className="text-primary" />
                LifeOps helps you nurture meaningful connections without the manual overhead.
             </div>
        </footer>
      </div>
    </Layout>
  );
}
