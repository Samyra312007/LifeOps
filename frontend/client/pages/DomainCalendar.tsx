import Layout from "@/components/Layout";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, ExternalLink, Link2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useConnectors } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function DomainCalendar() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [showConnect, setShowConnect] = useState(false);
  const { data: connectors } = useConnectors();
  const isConnected = connectors?.some((c: any) => c.source === "calendar" && c.status === "active");

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <CalendarIcon size={12} className="fill-primary" />
                Temporal Allocation
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Calendar</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Strategic scheduling and time-blocking analysis. Your life, expertly sequenced.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => setShowConnect(true)} className="rounded-2xl h-12 px-6 font-bold gap-2 border-2">
                <ExternalLink size={18} />
                {isConnected ? "Manage Sync" : "Connect Calendar"}
             </Button>
             {isConnected && (
                <Button className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20">
                    <Plus size={18} />
                    New Event
                </Button>
             )}
          </div>
        </header>

        {isConnected ? (
          <div className="editorial-card p-0 overflow-hidden border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-10 py-8 bg-muted/30">
              <h2 className="text-3xl font-editorial font-bold italic">{MONTHS[month]} {year}</h2>
              <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={prev} className="h-12 w-12 rounded-2xl bg-background border shadow-sm">
                    <ChevronLeft size={20} />
                  </Button>
                  <Button variant="ghost" onClick={next} className="h-12 w-12 rounded-2xl bg-background border shadow-sm">
                    <ChevronRight size={20} />
                  </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-t border-border/50">
              {DAYS.map(d => (
                <div key={d} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest py-6 text-center border-b border-border/50">
                    {d}
                </div>
              ))}
              {cells.map((d, i) => (
                <div key={i} className={`min-h-[140px] p-4 border-b border-r border-border/50 transition-colors hover:bg-primary/5 ${d === today && (month === now.getMonth()) ? "bg-primary/5" : ""}`}>
                  {d && (
                    <div className="flex justify-between items-start">
                        <span className={`inline-block w-8 h-8 text-center leading-8 rounded-full text-sm font-bold ${d === today && (month === now.getMonth()) ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-foreground"}`}>
                            {d}
                        </span>
                        {d === today && (month === now.getMonth()) && <Sparkles size={14} className="text-primary animate-pulse" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <CalendarIcon size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Temporal Flow Inactive</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
              Connect your Google or Apple Calendar to enable intelligent time-blocking and automated schedule optimization.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/connect-sources"}>
              Connect Calendar
            </Button>
          </div>
        )}

        {showConnect && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowConnect(false)}>
            <div className="glass rounded-[3rem] p-12 max-w-md w-full shadow-2xl border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <CalendarIcon size={48} className="text-primary mx-auto mb-8" />
              <h3 className="font-editorial text-3xl font-bold text-center mb-4 italic">Calendar Integration</h3>
              <p className="text-muted-foreground font-medium text-center mb-10">Sync your external schedules to allow LifeOps to protect your deep-work cycles.</p>
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
