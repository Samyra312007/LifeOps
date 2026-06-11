import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sun, MessageCircle, Brain, Shield, BarChart3, ArrowRight,
  Zap, Star, Command,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

const features = [
  { icon: Sun, title: "Morning Brief", desc: "Your executive summary, delivered at 7 AM. Synthesized from your entire digital footprint." },
  { icon: MessageCircle, title: "Ask LifeOps", desc: "A cross-domain oracle. Ask anything about your life, get grounded, actionable answers." },
  { icon: Brain, title: "Neural Patterns", desc: "Discover the hidden rhythms of your productivity, health, and social life." },
  { icon: Shield, title: "Private by Design", desc: "End-to-end encryption. Your personal data is for your eyes — and your agent's — only." },
  { icon: BarChart3, title: "Intelligence Hub", desc: "Deep-dive into your life's telemetry. Trends, forecasts, and strategic optimizations." },
  { icon: ArrowRight, title: "Action Engine", desc: "One-click execution. From calendar blocks to subscription audits, done in a tap." },
];

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 glass border-none">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-editorial text-2xl font-bold tracking-tight">LifeOps</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#intelligence" className="hover:text-primary transition-colors">Intelligence</a>
            <a href="#security" className="hover:text-primary transition-colors">Security</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth?tab=login">
              <Button variant="ghost" className="rounded-full px-6 font-semibold">Sign in</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative pt-32">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold uppercase tracking-widest text-primary mb-12 animate-bounce">
            <Star size={14} className="fill-primary" />
            V1.0 Now Live
          </div>
          
          <h1 className="text-6xl md:text-8xl font-editorial font-bold tracking-tighter leading-[0.9] text-balance mb-8">
            The Personal <br />
            <span className="italic text-primary">Chief of Staff</span> <br />
            For Modern Life.
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mb-12 text-balance">
            One intelligent agent that connects every app, understands your patterns, and takes real action on your behalf.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/auth?tab=register">
              <Button size="lg" className="h-16 px-10 rounded-3xl text-lg font-bold shadow-2xl shadow-primary/30 group">
                Begin Onboarding
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-4 border-background bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                </div>
              ))}
              <div className="w-12 h-12 rounded-full border-4 border-background bg-primary flex items-center justify-center text-white text-xs font-bold">
                +2k
              </div>
            </div>
            <p className="text-sm text-muted-foreground font-semibold">Trusted by 2,000+ professionals</p>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-editorial font-bold mb-6">Built for cross-domain reasoning.</h2>
              <p className="text-lg text-muted-foreground font-medium">LifeOps doesn't just look at one silo. It understands how your sleep affects your productivity, and how your social life impacts your finances.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted font-bold text-sm">
              <Command size={16} />
              Command Center
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="editorial-card group hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <f.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Intelligence Showcase */}
        <section id="intelligence" className="max-w-7xl mx-auto px-6 py-32">
          <div className="bg-primary/5 rounded-[4rem] p-12 md:p-24 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-10">
                <Brain size={400} />
             </div>
             <div className="relative z-10 max-w-3xl">
                <span className="text-primary font-bold tracking-widest uppercase text-xs mb-6 block">Deep Context Retrieval</span>
                <h2 className="text-5xl md:text-7xl font-editorial font-bold mb-10 leading-none">Your data. <br />Your agent. <br />Your decisions.</h2>
                <p className="text-xl text-muted-foreground font-medium mb-12">Ask anything. "What should I focus on this week based on my budget and upcoming social events?" LifeOps reasons across all domains to give you the perfect answer.</p>
                <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 border-2 font-bold hover:bg-primary hover:text-white transition-all">
                  Explore the Intelligence Hub
                </Button>
             </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="font-editorial text-2xl font-bold tracking-tight">LifeOps</span>
              </div>
              <p className="text-muted-foreground font-medium max-w-sm mb-8">Redefining personal management through cross-domain intelligence and proactive action.</p>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-all"><Zap size={18} /></div>
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-primary/10 hover:text-primary transition-all"><Star size={18} /></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Morning Brief</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Ask LifeOps</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Intelligence Hub</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Connectors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Security</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-border/50 text-sm font-medium text-muted-foreground gap-4">
            <span>&copy; 2026 LifeOps Intelligence Inc. All rights reserved.</span>
            <div className="flex items-center gap-8">
              <span className="hover:text-primary cursor-pointer">Status: All Systems Operational</span>
              <span className="hover:text-primary cursor-pointer">v1.0.4</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
