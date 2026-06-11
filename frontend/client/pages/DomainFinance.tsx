import Layout from "@/components/Layout";
import { Wallet, TrendingUp, CreditCard, PiggyBank, Link2, ArrowUpRight } from "lucide-react";
import { useFinancialAnalysis } from "@/hooks/use-api";
import { useConnectors } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";

export default function DomainFinance() {
  const { data: analysis, isLoading } = useFinancialAnalysis(30);
  const { data: connectors } = useConnectors();
  const isConnected = connectors?.some((c: any) => (c.source === "plaid" || c.source === "amazon" || c.source === "uber") && c.status === "active");

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Wallet size={12} className="fill-primary" />
                Capital Management
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Finance</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Strategic oversight of your personal economy. Real-time spending analysis and proactive capital optimization.
            </p>
          </div>
          {!isConnected && (
            <Button onClick={() => window.location.href = "/connect-sources"} className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg shadow-primary/20">
              <Link2 size={18} />
              Link Financial Institution
            </Button>
          )}
        </header>

        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                  <Wallet size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Monthly Expenditure</h3>
              <p className="text-5xl font-bold text-foreground mb-2">
                {analysis?.total_spent ? `$${analysis.total_spent.toFixed(0)}` : "--"}
              </p>
              <p className="text-sm text-muted-foreground font-medium italic">Aggregate (Last 30 Days)</p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center text-success group-hover:bg-success group-hover:text-white transition-all duration-500">
                  <TrendingUp size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Daily Burn Rate</h3>
              <p className="text-5xl font-bold text-foreground mb-2">
                {analysis?.daily_average ? `$${analysis.daily_average.toFixed(0)}` : "--"}
              </p>
              <p className="text-sm text-muted-foreground font-medium italic">Average Operational Cost / Day</p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                  <CreditCard size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Primary Liability Category</h3>
              <p className="text-4xl font-bold text-foreground mb-2">{analysis?.top_category?.[0] || "--"}</p>
              <p className="text-sm text-muted-foreground font-medium italic">
                {analysis?.top_category?.[1] ? `Totaling $${analysis.top_category[1].toFixed(0)}` : "Analyzing patterns..."}
              </p>
            </div>

            <div className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50">
              <div className="flex items-center justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-500">
                  <PiggyBank size={28} />
                </div>
                <ArrowUpRight size={20} className="text-muted-foreground" />
              </div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Subscription Count</h3>
              <p className="text-5xl font-bold text-foreground mb-2">{analysis?.subscriptions?.length || "--"}</p>
              <p className="text-sm text-muted-foreground font-medium italic">Recurring Service Liabilities</p>
            </div>
          </div>
        ) : (
          <div className="editorial-card intelligence-gradient p-20 text-center rounded-[3rem]">
            <Wallet size={80} className="mx-auto text-primary mb-10 opacity-50" />
            <h3 className="text-4xl font-editorial font-bold text-foreground mb-6 italic">Financial Data Inactive</h3>
            <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl mx-auto leading-relaxed">
                Connect your accounts via Plaid to enable real-time capital tracking and automated subscription audits.
            </p>
            <Button className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30"
              onClick={() => window.location.href = "/connect-sources"}>
              Connect Financial Institution
            </Button>
          </div>
        )}

        <footer className="pt-12 border-t border-border/50 text-center">
            <p className="text-muted-foreground text-sm font-medium">LifeOps maintains read-only bank-level security for all financial data.</p>
        </footer>
      </div>
    </Layout>
  );
}
