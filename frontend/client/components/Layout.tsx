import { Link } from "react-router-dom";
import {
  Home, Sun, MessageCircle, CheckSquare, Calendar, Heart,
  Wallet, Users, Zap, BarChart3, ChevronDown, Database,
} from "lucide-react";
import { useState } from "react";
import { useConnectors, useAlerts } from "@/hooks/use-api";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const { data: connectors } = useConnectors();
  const { data: alerts } = useAlerts(true);
  const activeCount = connectors?.filter((c: any) => c.status === "active").length || 0;
  const unreadAlerts = alerts?.unread_count || 0;

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <div className="font-bold text-sm text-sidebar-foreground">LifeOps</div>
              <div className="text-xs text-muted-foreground">AI Chief of Staff</div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 text-xs border-b border-sidebar-border">
          <div className="flex items-center gap-2 text-success">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span>Systems synced</span>
          </div>
          <div className="text-muted-foreground text-xs mt-1">
            {activeCount} sources · {unreadAlerts > 0 ? `${unreadAlerts} alert${unreadAlerts > 1 ? "s" : ""}` : "All clear"}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-sidebar-border">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="w-full text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between mb-3"
            >
              WORKSPACE
              <ChevronDown size={14} className={`transition-transform ${isWorkspaceOpen ? "rotate-180" : ""}`} />
            </button>
            {isWorkspaceOpen && (
              <nav className="space-y-1">
                <NavItem to="/" icon={<Home size={18} className="text-primary" />} label="Home" active />
                <NavItem to="/morning-brief" icon={<Sun size={18} />} label="Morning Brief" />
                <NavItem to="/ask-lifeops" icon={<MessageCircle size={18} />} label="Ask LifeOps" />
                <NavItem to="/tasks" icon={<CheckSquare size={18} />} label="Tasks & Actions" />
                <NavItem to="/connect-sources" icon={<Database size={18} />} label="Connect Sources" />
              </nav>
            )}
          </div>

          <div className="p-4 border-b border-sidebar-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">LIFE DOMAINS</div>
            <nav className="space-y-1">
              <NavItem to="/domain/calendar" icon={<Calendar size={18} className="text-error" />} label="Calendar" />
              <NavItem to="/domain/health" icon={<Heart size={18} className="text-red-500" />} label="Health" />
              <NavItem to="/domain/finance" icon={<Wallet size={18} className="text-orange-500" />} label="Finance" />
              <NavItem to="/domain/social" icon={<Users size={18} className="text-blue-500" />} label="Social" />
              <NavItem to="/domain/productivity" icon={<Zap size={18} className="text-yellow-500" />} label="Productivity" />
            </nav>
          </div>

          <div className="p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">INSIGHTS</div>
            <nav className="space-y-1">
              <NavItem to="/intelligence" icon={<Zap size={18} />} label="Intelligence Hub" />
              <NavItem to="/weekly-review" icon={<BarChart3 size={18} />} label="Weekly Review" />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <button className="w-full flex items-center gap-3 px-2 py-2 hover:bg-sidebar-accent rounded-md transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0">J</div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-sm font-medium text-sidebar-foreground">Jane</div>
              <div className="text-xs text-muted-foreground">View profile</div>
            </div>
            <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? "font-medium text-sidebar-foreground bg-sidebar-accent border-l-2 border-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
