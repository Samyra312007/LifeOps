import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sun, MessageCircle, Brain, Shield, BarChart3, ArrowRight,
} from "lucide-react";

const features = [
  { icon: Sun, title: "Morning Brief", desc: "Daily overview of what matters most, curated from all your connected sources" },
  { icon: MessageCircle, title: "Ask LifeOps", desc: "Cross-domain AI answers based on your calendar, health, finance, and social data" },
  { icon: Brain, title: "Pattern Detection", desc: "Discover hidden patterns in your behavior across every domain of life" },
  { icon: Shield, title: "Privacy First", desc: "Your data stays yours. End-to-end encrypted with zero third-party sharing" },
  { icon: BarChart3, title: "Weekly Review", desc: "Actionable insights and trends to help you make better decisions" },
  { icon: ArrowRight, title: "Action Engine", desc: "Turn recommendations into real actions with one-click execution" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-foreground">LifeOps</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth?tab=login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/auth?tab=register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm text-primary mb-8">
          <Brain size={14} />
          Your AI Chief of Staff
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Your life,{" "}
          <span className="text-primary">intelligently</span>
          <br />
          organized and optimized
        </h1>
        <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
          LifeOps connects your calendar, health, finances, and relationships
          into a single AI-powered command center. Get morning briefs, detect
          patterns, and take action — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link to="/auth?tab=register">
            <Button size="lg" className="text-base px-8">
              Start free <ArrowRight size={16} className="ml-1" />
            </Button>
          </Link>
          <Link to="/auth?tab=login">
            <Button variant="outline" size="lg" className="text-base px-8">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <span>&copy; 2026 LifeOps. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
