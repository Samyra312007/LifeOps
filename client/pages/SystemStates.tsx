import Layout from "@/components/Layout";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function LoadingState() {
  return (
    <Layout>
      <div className="p-8">
        <div className="bg-primary bg-opacity-5 rounded-lg p-8 border border-primary border-opacity-20 max-w-2xl">
          <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-4">
            LOADING STATE
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Setting up your LifeOps...
          </h2>
          <p className="text-foreground mb-6">
            We're syncing your connected apps and building your first personal
            pattern map.
          </p>

          <div className="space-y-3 mb-6">
            <SyncItem
              complete
              icon="✓"
              label="Google Calendar"
              detail="45 days synced"
            />
            <SyncItem
              complete
              icon="✓"
              label="Gmail"
              detail="90 days synced"
            />
            <SyncItem
              loading
              icon="○"
              label="Plaid"
              detail="Connecting to bank"
            />
            <SyncItem
              icon="⊘"
              label="Amazon"
              detail="Queued for sync"
            />
          </div>

          <div className="text-sm text-foreground">
            Your first Morning Brief will be ready tomorrow at 7 AM.
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function EmptyState() {
  return (
    <Layout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No data yet?
          </h2>
          <p className="text-lg text-foreground mb-6">
            Let's fix that
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            LifeOps needs at least one data source to start understanding your
            patterns.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
              Connect first app
            </button>
            <button className="border border-border text-foreground px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Enter manually
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Once connected, LifeOps can generate Morning Briefs, recommendations,
            and Weekly Reviews.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export function ErrorState() {
  return (
    <Layout>
      <div className="p-8">
        <div className="bg-red-50 rounded-lg p-8 border border-red-200 max-w-2xl">
          <div className="text-xs font-semibold text-error uppercase tracking-wide mb-4">
            ERROR STATE
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Sync issue detected
          </h2>
          <p className="text-foreground mb-4">
            Plaid has not synced in 6 hours because your bank requires
            re-authentication.
          </p>

          <div className="bg-red-50 rounded p-4 mb-6 border border-red-200">
            <p className="text-sm text-foreground mb-2">
              Financial recommendations may be limited.
            </p>
            <p className="text-xs text-muted-foreground">
              Calendar, Gmail, and Health are still up to date.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="bg-error text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
              Reconnect
            </button>
            <button className="border border-border text-foreground px-6 py-2 rounded-full font-semibold hover:bg-gray-50 transition-colors">
              Dismiss now
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Error messages stay specific, calm, and actionable.
          </p>
        </div>
      </div>
    </Layout>
  );
}

function SyncItem({
  icon,
  label,
  detail,
  complete,
  loading,
}: {
  icon: string;
  label: string;
  detail: string;
  complete?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white">
      <div
        className={`text-xl font-bold ${
          complete ? "text-success" : loading ? "text-primary" : "text-muted-foreground"
        } ${loading ? "animate-spin" : ""}`}
      >
        {icon}
      </div>
      <div className="text-left flex-1">
        <div className="font-medium text-foreground text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}
