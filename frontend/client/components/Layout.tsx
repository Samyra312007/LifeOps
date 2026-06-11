import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Sun, MessageCircle, CheckSquare, Calendar, Heart,
  Wallet, Users, Zap, BarChart3, ChevronDown, Database,
  PanelLeftClose, PanelLeft, LogOut, User, Brain, Moon,
} from "lucide-react";
import { useState } from "react";
import { useConnectors, useAlerts, useAuth } from "@/hooks/use-api";
import { useTheme } from "@/hooks/use-theme";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const { data: connectors } = useConnectors();
  const { data: alerts } = useAlerts(true);
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const user = profile.data;
  const displayName = user?.display_name || "User";
  const initials = displayName.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2) || "U";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Floating Sidebar */}
      <aside
        className={`floating-sidebar ${
          isCollapsed ? "floating-sidebar-collapsed" : ""
        } flex flex-col`}
      >
        {/* Brand/Logo Section */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="font-editorial text-xl font-bold tracking-tight">LifeOps</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/dashboard" className="mx-auto">
               <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">L</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-2 space-y-8 overflow-y-auto no-scrollbar">
          {/* Main Navigation */}
          <nav className="space-y-1">
            <NavItem to="/dashboard" icon={<Home size={20} />} label="Overview" collapsed={isCollapsed} />
            <NavItem to="/morning-brief" icon={<Sun size={20} />} label="Daily Brief" collapsed={isCollapsed} />
            <NavItem to="/ask-lifeops" icon={<MessageCircle size={20} />} label="Ask Agent" collapsed={isCollapsed} />
            <NavItem to="/tasks" icon={<CheckSquare size={20} />} label="Actions" collapsed={isCollapsed} />
          </nav>

          {/* Intelligence Section */}
          {!isCollapsed && <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Intelligence</div>}
          <nav className="space-y-1">
            <NavItem to="/intelligence" icon={<Brain size={20} />} label="Insights" collapsed={isCollapsed} />
            <NavItem to="/weekly-review" icon={<BarChart3 size={20} />} label="Review" collapsed={isCollapsed} />
            <NavItem to="/connect-sources" icon={<Database size={20} />} label="Sources" collapsed={isCollapsed} />
          </nav>

          {/* Life Domains Section */}
          {!isCollapsed && <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Domains</div>}
          <nav className="space-y-1">
            <NavItem to="/domain/calendar" icon={<Calendar size={20} />} label="Calendar" collapsed={isCollapsed} />
            <NavItem to="/domain/health" icon={<Heart size={20} />} label="Health" collapsed={isCollapsed} />
            <NavItem to="/domain/finance" icon={<Wallet size={20} />} label="Finance" collapsed={isCollapsed} />
          </nav>
        </div>

        {/* Bottom Section: Theme & Profile */}
        <div className="p-4 space-y-4 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-start gap-3"} h-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all`}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            {!isCollapsed && <span className="text-sm font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center ${isCollapsed ? "justify-center" : "w-full gap-3 px-2 py-2"} hover:bg-primary/5 rounded-2xl transition-all group`}>
                <Avatar className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isCollapsed ? "w-10 h-10" : "w-10 h-10"}`}>
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold text-xs">{initials}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{displayName}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pro Member</div>
                    </div>
                    <ChevronDown size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" sideOffset={20} className="w-56 glass border-none shadow-2xl rounded-2xl p-2">
              <DropdownMenuLabel className="font-editorial text-lg">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="rounded-xl h-10 gap-3">
                <User size={16} />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive rounded-xl h-10 gap-3">
                <LogOut size={16} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center h-8 text-muted-foreground hover:text-primary transition-colors"
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`main-content ${
          isCollapsed ? "main-content-compact" : "main-content-shifted"
        } flex-1 p-8 pr-12`}
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, collapsed }: { to: string; icon: React.ReactNode; label: string; collapsed?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Link
      to={to}
      className={`relative group flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-2xl transition-all duration-300 ${
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      }`}
      title={collapsed ? label : undefined}
    >
      <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">{icon}</span>
      {!collapsed && <span className="relative z-10 font-medium tracking-tight">{label}</span>}
      {isActive && !collapsed && (
         <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      )}
    </Link>
  );
}
