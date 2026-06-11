import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-api";
import * as api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState(defaultTab);
  const { loginMutation, profile } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [error, setError] = useState("");

  if (profile.data) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { email: loginEmail, password: loginPassword },
      {
        onSuccess: () => navigate("/dashboard", { replace: true }),
        onError: (err) => setError(err.message),
      },
    );
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    api.register(regEmail, regPassword, regName)
      .then((data) => {
        localStorage.setItem("lifeops_token", data.access_token);
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => setError(err.message));
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-[480px] z-10">
        <div className="mb-12">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-bold text-sm mb-8">
                <ArrowLeft size={16} />
                Back to landing
            </Link>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-3xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                    <span className="text-white font-bold text-2xl">L</span>
                </div>
                <div>
                    <h1 className="text-4xl font-editorial font-bold tracking-tight">LifeOps</h1>
                    <p className="text-muted-foreground font-medium italic">Your intelligence journey begins.</p>
                </div>
            </div>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/20">
          <Tabs value={tab} onValueChange={setTab} className="space-y-8">
            <TabsList className="w-full h-14 bg-background/50 p-1 rounded-2xl border border-border/50">
              <TabsTrigger value="login" className="flex-1 rounded-xl h-full font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg shadow-primary/20">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 rounded-xl h-full font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg shadow-primary/20">Onboard</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity</label>
                    <Input
                    type="email"
                    placeholder="email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50"
                    required
                    autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Passcode</label>
                    <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50"
                    required
                    />
                </div>
                {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm font-bold text-destructive">{error}</div>}
                <Button type="submit" className="w-full h-16 rounded-3xl text-lg font-bold shadow-xl shadow-primary/20 group" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Authenticating..." : "Access Intelligence"}
                  <Sparkles size={18} className="ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
                    <Input
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50"
                    required
                    autoFocus
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity</label>
                    <Input
                    type="email"
                    placeholder="email@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Secret Passcode</label>
                    <Input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50"
                    required
                    />
                </div>
                {error && <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-sm font-bold text-destructive">{error}</div>}
                <Button type="submit" className="w-full h-16 rounded-3xl text-lg font-bold shadow-xl shadow-primary/20">
                  Begin Onboarding
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-10 font-medium">
            By accessing LifeOps, you agree to our <span className="text-primary hover:underline cursor-pointer">Security Protocol</span> and <span className="text-primary hover:underline cursor-pointer">Data Privacy Compact</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
