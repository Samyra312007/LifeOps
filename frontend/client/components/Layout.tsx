import { Link } from "react-router-dom";
import {
  Home, Sun, MessageCircle, CheckSquare, Calendar, Heart,
  Wallet, Users, Zap, BarChart3, ChevronDown, Database,
  PanelLeftClose, PanelLeft, LogOut, User,
} from "lucide-react";
import { useState } from "react";
import { useConnectors, useAlerts } from "@/hooks/use-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: connectors } = useConnectors();
  const { data: alerts } = useAlerts(true);
  const activeCount = connectors?.filter((c: any) => c.status === "active").length || 0;
  const unreadAlerts = alerts?.unread_count || 0;

  function handleLogout() {
    localStorage.removeItem("lifeops_token");
    window.location.href = "/auth";
  }

  return (
    <div className="flex h-screen bg-white">
      <aside className={`${isCollapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-sidebar-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-sidebar-foreground">LifeOps</div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-sidebar-accent rounded-md transition-colors flex-shrink-0 ml-auto"
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {!isCollapsed && (
          <div className="px-4 py-3 text-xs border-b border-sidebar-border">
            <div className="flex items-center gap-2 text-success">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Systems synced</span>
            </div>
            <div className="text-muted-foreground text-xs mt-1">
              {activeCount} sources · {unreadAlerts > 0 ? `${unreadAlerts} alert${unreadAlerts > 1 ? "s" : ""}` : "All clear"}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isCollapsed ? (
            <nav className="p-2 space-y-1">
              <NavItem to="/" icon={<Home size={18} className="text-primary" />} label="Home" collapsed />
              <NavItem to="/morning-brief" icon={<Sun size={18} />} label="Morning Brief" collapsed />
              <NavItem to="/ask-lifeops" icon={<MessageCircle size={18} />} label="Ask LifeOps" collapsed />
              <NavItem to="/tasks" icon={<CheckSquare size={18} />} label="Tasks" collapsed />
              <NavItem to="/connect-sources" icon={<Database size={18} />} label="Connect" collapsed />
              <NavItem to="/domain/calendar" icon={<Calendar size={18} className="text-error" />} label="Calendar" collapsed />
              <NavItem to="/domain/health" icon={<Heart size={18} className="text-red-500" />} label="Health" collapsed />
              <NavItem to="/domain/finance" icon={<Wallet size={18} className="text-orange-500" />} label="Finance" collapsed />
              <NavItem to="/domain/social" icon={<Users size={18} className="text-blue-500" />} label="Social" collapsed />
              <NavItem to="/domain/productivity" icon={<Zap size={18} className="text-yellow-500" />} label="Productivity" collapsed />
              <NavItem to="/intelligence" icon={<Zap size={18} />} label="Intelligence" collapsed />
              <NavItem to="/weekly-review" icon={<BarChart3 size={18} />} label="Weekly" collapsed />
            </nav>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="p-4 border-t border-sidebar-border bg-sidebar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 hover:bg-sidebar-accent rounded-md transition-colors">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-bold">J</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-medium text-sidebar-foreground">Jane</div>
                      <div className="text-xs text-muted-foreground">View profile</div>
                    </div>
                    <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" sideOffset={8} className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                <User size={14} className="mr-2" />
                View profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut size={14} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}

function NavItem({ to, icon, label, active, collapsed }: { to: string; icon: React.ReactNode; label: string; active?: boolean; collapsed?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} px-3 py-2 rounded-md text-sm transition-colors ${
        active
          ? "font-medium text-sidebar-foreground bg-sidebar-accent"
          : "text-sidebar-foreground hover:bg-sidebar-accent"
      }`}
      title={collapsed ? label : undefined}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
