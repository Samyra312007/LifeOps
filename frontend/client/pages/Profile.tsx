import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-api";
import * as api from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Save, Loader2, User, UserCircle, Clock, Moon, Sun, Sparkles } from "lucide-react";

export default function Profile() {
  const { profile } = useAuth();
  const user = profile.data;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [bedTime, setBedTime] = useState("23:00");

  if (!user) {
    return (
      <Layout>
        <div className="p-8 animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    if (user?.display_name) {
      setDisplayName(user.display_name);
      setTimezone(user.timezone || "UTC");
      setWakeTime(user.wake_time || "07:00");
      setBedTime(user.bed_time || "23:00");
    }
  }, [user?.display_name, user?.timezone, user?.wake_time, user?.bed_time]);

  const initials = displayName.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2) || "U";

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.updateMe({ display_name: displayName, timezone, wake_time: wakeTime, bed_time: bedTime });
      profile.refetch();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="py-12 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <Avatar className="w-32 h-32 rounded-[2.5rem] relative z-10 border-4 border-background shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-4xl font-bold font-editorial italic">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg border-4 border-background z-20">
                <Sparkles size={18} className="fill-white" />
              </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <User size={12} className="fill-primary" />
                Identity & Preferences
            </div>
            <h1 className="text-5xl font-editorial font-bold tracking-tight mb-2 italic">{displayName}</h1>
            <p className="text-xl text-muted-foreground font-medium">{user.email}</p>
          </div>
        </header>

        <div className="editorial-card border border-border/50 shadow-2xl">
          <div className="mb-12">
            <h2 className="text-2xl font-editorial font-bold italic mb-2">Core Settings</h2>
            <p className="text-muted-foreground font-medium">Fine-tune your personal intelligence parameters.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                    <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Display</Label>
                    <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50 font-bold" required />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Verified Email</Label>
                    <Input id="email" value={user.email} disabled className="h-14 rounded-2xl border-2 bg-muted/50 font-bold italic opacity-70" />
                </div>

                <div className="space-y-3">
                    <Label htmlFor="timezone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Temporal Zone</Label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50 pl-12 font-bold" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="wakeTime" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Morning Wake</Label>
                        <div className="relative">
                            <Sun className="absolute left-4 top-1/2 -translate-y-1/2 text-warning" size={18} />
                            <Input id="wakeTime" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50 pl-12 font-bold" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="bedTime" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Rest Cycle</Label>
                        <div className="relative">
                            <Moon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                            <Input id="bedTime" type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className="h-14 rounded-2xl border-2 focus-visible:ring-primary/20 bg-background/50 pl-12 font-bold" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-border/50 flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium max-w-sm italic">Changes are propagated across the neural engine immediately upon save.</p>
                <Button type="submit" disabled={saving} className="h-16 px-10 rounded-3xl text-lg font-bold shadow-xl shadow-primary/20 gap-3 group">
                    {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                    {saving ? "Persisting..." : saved ? "Identity Updated" : "Save Preferences"}
                </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
