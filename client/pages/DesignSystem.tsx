import Layout from "@/components/Layout";

export default function DesignSystem() {
  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          LifeOps Design System
        </h1>

        {/* Buttons */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Buttons</h2>
          <div className="bg-white rounded-lg p-6 border border-border">
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                Handle All
              </button>
              <button className="border-2 border-primary text-primary px-6 py-2 rounded-full font-semibold hover:bg-primary hover:bg-opacity-5 transition-colors">
                View Sources
              </button>
              <button className="text-primary text-sm px-4 py-2 font-medium">
                Block
              </button>
              <button className="text-blue-500 text-sm px-4 py-2 font-medium">
                Review
              </button>
              <button className="text-pink-500 text-sm px-4 py-2 font-medium">
                Plan
              </button>
            </div>
          </div>
        </section>

        {/* Status States */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Status States
          </h2>
          <div className="bg-white rounded-lg p-6 border border-border">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm font-medium text-success">
                  Connected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
                <span className="text-sm font-medium text-warning">Syncing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error"></div>
                <span className="text-sm font-medium text-error">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-blue-500">Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm font-medium text-muted-foreground">
                  Queued
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-600">91% sure</span>
              </div>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Color Palette
          </h2>
          <div className="grid grid-cols-6 gap-4 bg-white rounded-lg p-6 border border-border">
            <ColorBox name="Primary" color="bg-primary" />
            <ColorBox name="Success" color="bg-success" />
            <ColorBox name="Warning" color="bg-warning" />
            <ColorBox name="Error" color="bg-error" />
            <ColorBox name="Info" color="bg-info" />
            <ColorBox name="Foreground" color="bg-foreground" />
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Alerts</h2>
          <div className="space-y-4">
            {/* Success Alert */}
            <div className="bg-green-50 border-l-4 border-success rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-lg">✓</div>
                <div>
                  <h3 className="font-semibold text-foreground">Morning Brief</h3>
                  <p className="text-sm text-foreground mt-1">
                    Full card · Gentle chime · Once daily
                  </p>
                </div>
                <div className="ml-auto text-xs bg-success text-white px-2 py-1 rounded">
                  Daily
                </div>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="bg-orange-50 border-l-4 border-warning rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-lg">⚠️</div>
                <div>
                  <h3 className="font-semibold text-foreground">Pattern Alert</h3>
                  <p className="text-sm text-foreground mt-1">
                    Card with icon · Soft alert · Max 2/day
                  </p>
                </div>
                <div className="ml-auto text-xs bg-warning text-white px-2 py-1 rounded">
                  Attention
                </div>
              </div>
            </div>

            {/* Error Alert */}
            <div className="bg-red-50 border-l-4 border-error rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-lg">🚨</div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    Critical Alert
                  </h3>
                  <p className="text-sm text-foreground mt-1">
                    Red badge + card · Distinct alert · As needed
                  </p>
                </div>
                <div className="ml-auto text-xs bg-error text-white px-2 py-1 rounded">
                  Critical
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4">Metric Cards</h2>
          <div className="grid grid-cols-3 gap-4">
            <MetricCard icon="74" label="Metric Card" />
            <MetricCard icon="🔥" label="Pattern Card" color="bg-orange-50" />
            <MetricCard icon="📅" label="Source Card" />
          </div>
        </section>
      </div>
    </Layout>
  );
}

function ColorBox({ name, color }: { name: string; color: string }) {
  return (
    <div>
      <div className={`${color} h-20 rounded-lg mb-2`}></div>
      <div className="text-xs font-semibold text-foreground">{name}</div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color?: string;
}) {
  return (
    <div className={`${color || "bg-white"} rounded-lg p-4 border border-border text-center`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xs font-semibold text-foreground">{label}</div>
    </div>
  );
}
