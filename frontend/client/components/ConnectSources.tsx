import Layout from "@/components/Layout";
import { useConnectors, useAvailableSources } from "@/hooks/use-api";
import { registerConnector, syncConnector } from "@/lib/api";
import { CheckCircle2, XCircle, Clock, RefreshCw, Link2, Plus } from "lucide-react";
import { useState } from "react";

export default function ConnectSources() {
  const { data: connectors, isLoading } = useConnectors();
  const { data: sources } = useAvailableSources();
  const [connecting, setConnecting] = useState<string | null>(null);

  const connectedSources = connectors || [];
  const connectedNames = new Set(connectedSources.map((c: any) => c.source));
  const available = (sources?.sources || []).filter((s: string) => !connectedNames.has(s));

  const statusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle2 size={16} className="text-success" />;
      case "error": return <XCircle size={16} className="text-error" />;
      case "pending": return <Clock size={16} className="text-warning" />;
      default: return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  const handleConnect = async (source: string) => {
    setConnecting(source);
    try {
      await registerConnector(source);
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Connect Sources</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {connectedSources.length} sources connected
            </p>
          </div>
          <div className="bg-success/10 text-success text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Setup healthy
          </div>
        </div>

        {connectedSources.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-3">Connected Sources</h2>
            <div className="grid grid-cols-2 gap-4">
              {connectedSources.map((c: any) => (
                <div key={c.id} className="bg-white border border-border rounded-lg p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{statusIcon(c.status)}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground capitalize">{c.source}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {c.status === "active" ? `Synced ${c.last_sync_at ? new Date(c.last_sync_at).toLocaleDateString() : "recently"}` : c.status}
                      </div>
                      {c.error_message && (
                        <div className="text-xs text-error mt-1">{c.error_message}</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => syncConnector(c.id)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title="Sync now"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {available.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Available Sources</h2>
            <div className="grid grid-cols-2 gap-4">
              {available.map((source: string) => (
                <div key={source} className="bg-white border border-dashed border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link2 size={16} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground capitalize">{source}</span>
                  </div>
                  <button
                    onClick={() => handleConnect(source)}
                    disabled={connecting === source}
                    className="text-xs bg-primary text-white px-3 py-1.5 rounded-full hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-1"
                  >
                    <Plus size={12} /> {connecting === source ? "Connecting..." : "Connect"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-8">
          Sources visible for every recommendation. Connections can be removed anytime.
          LifeOps asks before taking action.
        </p>
      </div>
    </Layout>
  );
}
