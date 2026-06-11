import Layout from "@/components/Layout";
import { useConnectors, useAvailableSources } from "@/hooks/use-api";
import { registerConnector, syncConnector, apiBase } from "@/lib/api";
import { CheckCircle2, XCircle, Clock, RefreshCw, Link2, Plus, Shield, ExternalLink, X, Database, Search, ArrowUpRight, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const SOURCE_PERMISSIONS: Record<string, string[]> = {
  gmail: ["Read your email messages", "View email metadata (sender, date, subject)"],
  calendar: ["Read your calendar events", "View event details and attendees"],
  plaid: ["Read account balances", "Read transaction history", "Access spending insights"],
  fit: ["Read activity data", "Read sleep data", "Read heart rate data"],
  todoist: ["Read your tasks and projects", "Create new tasks"],
  github: ["Read your repositories", "Read your activity data"],
  strava: ["Read your activities", "Read your route data"],
  spotify: ["Read your listening history", "View your playlists"],
  uber: ["Read your trip history"],
  doordash: ["Read your order history"],
  amazon: ["Read your order history"],
  netflix: ["Read your viewing history"],
};

export default function ConnectSources() {
  const { data: connectors, isLoading, mutate } = useConnectors();
  const { data: sources } = useAvailableSources();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [confirmSource, setConfirmSource] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const source = params.get("source");
    if (status === "success") {
      setOauthStatus(`Connected: ${source}`);
      window.history.replaceState({}, "", "/connect-sources");
      mutate();
    } else if (status === "error") {
      setOauthStatus(`Connection failed: ${params.get("message")}`);
      window.history.replaceState({}, "", "/connect-sources");
    }
    const t = setTimeout(() => setOauthStatus(null), 5000);
    return () => clearTimeout(t);
  }, [mutate]);

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

  const handleConnect = async () => {
    if (!confirmSource) return;
    const source = confirmSource;

    // Google OAuth redirect for calendar and gmail
    if (source === "calendar" || source === "gmail") {
      try {
        const token = localStorage.getItem("lifeops_token");
        const resp = await fetch("/api/v1/auth/oauth/google", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        if (data.authorization_url) {
          window.location.href = data.authorization_url;
          return;
        }
      } catch (e) {
        console.error("OAuth redirect failed, falling back to mock:", e);
      }
    }

    const token = localStorage.getItem("lifeops_token");
    const authFetch = (path: string) => fetch(path, { headers: { Authorization: `Bearer ${token}` } });

    if (source === "fit") {
      if (import.meta.env.VITE_GOOGLE_FIT_ENABLED === "true") {
        const resp = await authFetch("/api/v1/auth/oauth/googlefit");
        const data = await resp.json();
        if (data.authorization_url) { window.location.href = data.authorization_url; return; }
      } else {
        const resp = await authFetch("/api/v1/auth/oauth/fitbit");
        const data = await resp.json();
        if (data.authorization_url) { window.location.href = data.authorization_url; return; }
      }
    }

    if (source === "todoist") {
      const resp = await authFetch("/api/v1/auth/oauth/todoist");
      const data = await resp.json();
      if (data.authorization_url) { window.location.href = data.authorization_url; return; }
    }

    if (source === "github") {
      const resp = await authFetch("/api/v1/auth/oauth/github");
      const data = await resp.json();
      if (data.authorization_url) { window.location.href = data.authorization_url; return; }
    }

    if (source === "plaid") {
      try {
        setConnecting(source);
        setSyncMessage("Opening Plaid Link...");
        const linkResp = await authFetch("/api/v1/auth/plaid/link-token");
        const { link_token } = await linkResp.json();
        if (link_token) {
          const handler = (window as any).Plaid.create({
            token: link_token,
            onSuccess: async (public_token: string) => {
              await authFetch(`/api/v1/auth/plaid/exchange?public_token=${public_token}`);
              window.location.reload();
            },
            onExit: () => { setConnecting(null); setSyncMessage(null); },
          });
          handler.open();
          return;
        }
      } catch (e) {
        console.error("Plaid Link failed, falling back:", e);
      }
    }

    setConnecting(source);
    setSyncMessage(null);
    try {
      const conn = await registerConnector(source);
      setSyncMessage(`Connected to ${source}! Syncing data...`);
      const sync = await syncConnector(conn.id);
      setSyncMessage(`Synced ${sync.records_synced} records from ${source}`);
      await new Promise(r => setTimeout(r, 1200));
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSyncMessage(`Failed to connect ${source}`);
      await new Promise(r => setTimeout(r, 1500));
      setConfirmSource(source);
    } finally {
      setConnecting(null);
      setSyncMessage(null);
    }
  };

  return (
    <Layout>
      <div className="py-12 max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6">
                <Database size={12} className="fill-primary" />
                Data Nexus
            </div>
            <h1 className="text-6xl md:text-7xl font-editorial font-bold tracking-tight mb-4 italic">Connect Sources</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
                Establish secure bridges to your digital life apps. LifeOps works best when its telemetry is deep.
            </p>
          </div>
          <div className="bg-success/10 text-success text-[10px] px-4 py-2 rounded-2xl font-bold uppercase tracking-widest flex items-center gap-2 border border-success/20">
            <CheckCircle2 size={16} className="fill-success text-white" /> Network Healthy
          </div>
        </header>

        {oauthStatus && (
          <div className="mb-8 px-6 py-4 rounded-2xl bg-success/10 border border-success/20 text-success font-bold flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 size={20} />
            {oauthStatus}
          </div>
        )}

        {connectedSources.length > 0 && (
          <div className="mb-16">
            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-8">Active Bridges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connectedSources.map((c: any) => (
                <div key={c.id} className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-border/50 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center relative">
                        <Link2 size={24} className="text-muted-foreground" />
                        <div className="absolute -bottom-1 -right-1">
                            {statusIcon(c.status)}
                        </div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground capitalize">{c.source}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {c.status === "active" ? `Last Sync: ${c.last_sync_at ? new Date(c.last_sync_at).toLocaleDateString() : "Live"}` : c.status}
                      </div>
                      {c.error_message && (
                        <div className="text-xs font-bold text-error mt-2">{c.error_message}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => syncConnector(c.id)}
                    className="h-10 w-10 p-0 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <RefreshCw size={18} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {available.length > 0 && (
          <div className="mb-16">
            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mb-8">Available Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((source: string) => (
                <div key={source} className="editorial-card group hover:bg-primary/5 transition-all duration-500 border border-dashed border-border flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Link2 size={24} />
                    </div>
                    <ArrowUpRight size={20} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-end justify-between">
                      <span className="text-2xl font-editorial font-bold italic capitalize">{source}</span>
                      <Button
                        onClick={() => setConfirmSource(source)}
                        disabled={connecting === source}
                        className="rounded-xl h-10 px-4 font-bold shadow-lg shadow-primary/10"
                      >
                        {connecting === source ? "Connecting..." : "Onboard"}
                      </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-[2rem]" />
            ))}
          </div>
        )}

        <footer className="editorial-card bg-muted/30 border-none p-8 flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={24} />
            </div>
            <p className="text-xs text-muted-foreground font-medium flex-1 italic leading-relaxed">
                <strong>Development Protocols Active:</strong> No real API keys are currently configured. Connection processes are simulated with localized sample data for development and demonstration purposes.
            </p>
        </footer>
      </div>

      {confirmSource && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => connecting ? null : setConfirmSource(null)}>
          <div className="glass rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border-white/20 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            {!connecting && !syncMessage && (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h3 className="font-editorial text-3xl font-bold italic">
                            Authorization
                        </h3>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest font-bold">Bridge Request: {confirmSource}</p>
                    </div>
                  </div>
                  
                  <p className="text-lg font-medium text-foreground mb-8 leading-relaxed italic">
                    Allow LifeOps to establish a secure data bridge to your <strong className="capitalize text-primary">{confirmSource}</strong> ecosystem?
                  </p>

                  {SOURCE_PERMISSIONS[confirmSource] && (
                    <div className="bg-muted/30 rounded-[2rem] p-8 mb-10 border border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ExternalLink size={14} /> Security Scopes
                      </p>
                      <ul className="space-y-3">
                        {SOURCE_PERMISSIONS[confirmSource].map((perm, i) => (
                          <li key={i} className="text-sm font-bold text-foreground flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-success mt-0.5 flex-shrink-0" />
                            {perm}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => setConfirmSource(null)}
                      className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={handleConnect}
                      className="flex-1 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20"
                    >
                      Authorize Bridge
                    </Button>
                  </div>
                </>
            )}
            {(connecting || syncMessage) && (
                <div className="py-20 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-10">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center text-primary">
                          <RefreshCw size={32} />
                      </div>
                  </div>
                  <h4 className="text-2xl font-editorial font-bold italic mb-4">Neural Sync in Progress</h4>
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs animate-pulse">
                      {syncMessage || `Establishing Bridge to ${confirmSource}...`}
                  </p>
                </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
