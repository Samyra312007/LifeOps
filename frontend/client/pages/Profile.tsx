import { useState } from "react";
import { useAuth } from "@/hooks/use-api";
import * as api from "@/lib/api";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

export default function Profile() {
  const { profile } = useAuth();
  const user = profile.data;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");
  const [wakeTime, setWakeTime] = useState(user?.wake_time || "07:00");
  const [bedTime, setBedTime] = useState(user?.bed_time || "23:00");

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
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wakeTime">Wake Time</Label>
                  <Input id="wakeTime" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedTime">Bed Time</Label>
                  <Input id="bedTime" type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Save size={16} className="mr-1" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
